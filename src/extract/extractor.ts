import type { KnowledgeChunk, StructuredExtraction } from "../types";
import { StructuredExtractionSchema } from "../types";
import {
  type ExtractionFieldRule,
  type ExtractionSchemaName,
  type FieldMatcher,
  getExtractionSchema,
} from "./schemas";

type ExtractionEvidence = StructuredExtraction["evidence"][number];

type FieldMatchResult = {
  matched: boolean;
  value?: unknown;
};

export function extractFromChunks(
  chunks: KnowledgeChunk[],
  schemaName: ExtractionSchemaName
): StructuredExtraction {
  const schema = getExtractionSchema(schemaName);
  const warnings = new Set<string>();
  const records: StructuredExtraction["records"] = [];
  const evidence: StructuredExtraction["evidence"] = [];
  const matchedRequiredFields = new Set<string>();
  const requiredFieldNames = getRequiredFieldNames(schema.fields);

  for (const chunk of chunks) {
    if (!chunkMatchesSchema(chunk, schema.recordMatchers)) {
      continue;
    }

    const record: Record<string, unknown> = {};
    const nextEvidence: ExtractionEvidence[] = [];

    for (const [fieldPath, rule] of Object.entries(schema.fields)) {
      const result = matchFieldRule(chunk, rule);
      if (!result.matched) {
        continue;
      }

      record[fieldPath] = result.value;

      if (rule.required) {
        matchedRequiredFields.add(fieldPath);
      }

      nextEvidence.push({
        recordIndex: records.length,
        citation: chunk.primaryCitation,
        fieldPath,
      });
    }

    if (Object.keys(record).length === 0) {
      continue;
    }

    records.push(record);
    evidence.push(...nextEvidence);
    addMissingFieldWarnings(warnings, schema.name, records.length - 1, schema.fields, record);
  }

  for (const fieldName of requiredFieldNames) {
    if (!matchedRequiredFields.has(fieldName)) {
      warnings.add(`Schema "${schema.name}" did not match required field "${fieldName}" across the provided chunks.`);
    }
  }

  const extraction = StructuredExtractionSchema.parse({
    documentId: chunks[0]?.documentId ?? "",
    schemaName: schema.name,
    records,
    evidence,
    extractionStatus: getExtractionStatus(records.length, warnings.size),
    warnings: [...warnings],
  });

  return extraction;
}

function getRequiredFieldNames(fields: Record<string, ExtractionFieldRule>): string[] {
  return Object.entries(fields)
    .filter(([, rule]) => rule.required)
    .map(([fieldName]) => fieldName);
}

function chunkMatchesSchema(chunk: KnowledgeChunk, matchers: readonly FieldMatcher[]): boolean {
  return matchers.some((matcher) => matchFieldMatcher(chunk, matcher).matched);
}

function matchFieldRule(chunk: KnowledgeChunk, rule: ExtractionFieldRule): FieldMatchResult {
  for (const matcher of rule.matchers) {
    const result = matchFieldMatcher(chunk, matcher);
    if (result.matched) {
      return result;
    }
  }

  return { matched: false };
}

function matchFieldMatcher(chunk: KnowledgeChunk, matcher: FieldMatcher): FieldMatchResult {
  if (matcher.kind === "keywords") {
    return matchKeywordMatcher(chunk, matcher);
  }

  return matchRegexMatcher(chunk, matcher);
}

function matchKeywordMatcher(
  chunk: KnowledgeChunk,
  matcher: Extract<FieldMatcher, { kind: "keywords" }>
): FieldMatchResult {
  const haystacks = [chunk.text, chunk.normalizedText, chunk.sectionPath.join(" ")]
    .join("\n")
    .toLowerCase();

  for (const keyword of matcher.keywords) {
    if (!haystacks.includes(keyword.toLowerCase())) {
      continue;
    }

    return {
      matched: true,
      value: matcher.resolve?.(chunk, keyword) ?? matcher.value ?? keyword,
    };
  }

  return { matched: false };
}

function matchRegexMatcher(
  chunk: KnowledgeChunk,
  matcher: Extract<FieldMatcher, { kind: "regex" }>
): FieldMatchResult {
  const result = executePattern(matcher.pattern, chunk.text) ?? executePattern(matcher.pattern, chunk.normalizedText);

  if (!result) {
    return { matched: false };
  }

  const matchedText = (result[matcher.group ?? 0] ?? result[0] ?? "").trim();
  return {
    matched: matchedText.length > 0,
    value: matcher.resolve?.(chunk, matchedText, result) ?? matcher.value ?? matchedText,
  };
}

function executePattern(pattern: RegExp, value: string): RegExpExecArray | null {
  return new RegExp(pattern.source, pattern.flags.replace(/g|y/gu, "")).exec(value);
}

function addMissingFieldWarnings(
  warnings: Set<string>,
  schemaName: string,
  recordIndex: number,
  fields: Record<string, ExtractionFieldRule>,
  record: Record<string, unknown>
): void {
  for (const [fieldName, rule] of Object.entries(fields)) {
    if (!rule.required || fieldName in record) {
      continue;
    }

    warnings.add(`Record ${recordIndex} for schema "${schemaName}" is missing required field "${fieldName}".`);
  }
}

function getExtractionStatus(
  recordCount: number,
  warningCount: number
): StructuredExtraction["extractionStatus"] {
  if (recordCount === 0) {
    return "failed";
  }

  if (warningCount > 0) {
    return "partial";
  }

  return "success";
}
