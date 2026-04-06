import { parse as parseCsvMatrix } from "csv-parse/sync";
import type { SourceDocument } from "../types";
import { cloneDocument, createNode, type ParsedDocumentResult } from "./shared";

interface CsvMetadata {
  headers: string[];
}

export function parseCsv(
  document: SourceDocument,
  content: string
): ParsedDocumentResult<CsvMetadata> {
  try {
    const matrix = parseCsvMatrix(content, {
      skip_empty_lines: false,
      relax_column_count: true,
    }) as string[][];

    if (!matrix.length) {
      return {
        document: cloneDocument(document, {
          parseStatus: "success",
          warnings: [...document.warnings, "CSV document is empty."],
        }),
        nodes: [],
        metadata: { headers: [] },
      };
    }

    const maxColumnCount = matrix.reduce(
      (count, row) => Math.max(count, row.length),
      0
    );
    const rawHeaders = [...(matrix[0] ?? [])];

    while (rawHeaders.length < maxColumnCount) {
      rawHeaders.push("");
    }

    const { headers, warnings } = normalizeHeaders(rawHeaders);
    const nodes = [];

    for (let rowIndex = 1; rowIndex < matrix.length; rowIndex += 1) {
      const row = [...(matrix[rowIndex] ?? [])];

      while (row.length < headers.length) {
        row.push("");
      }

      if (!row.some((cell) => cell.trim())) {
        continue;
      }

      const rowNumber = rowIndex + 1;
      const rawRow = serializeCsvRow(row);
      const fieldText = headers
        .map((header, columnIndex) => `${header}: ${row[columnIndex] ?? ""}`)
        .join("\n");

      nodes.push(
        createNode({
          documentId: document.documentId,
          nodeType: "row",
          text: `rawRow: ${rawRow}\n${fieldText}`,
          path: `row:${rowNumber}`,
          rowNumber,
        })
      );

      headers.forEach((header, columnIndex) => {
        nodes.push(
          createNode({
            documentId: document.documentId,
            nodeType: "cell",
            text: row[columnIndex] ?? "",
            path: `row:${rowNumber}/column:${header}`,
            rowNumber,
            columnName: header,
          })
        );
      });
    }

    return {
      document: cloneDocument(document, {
        parseStatus: "success",
        warnings: [...document.warnings, ...warnings],
      }),
      nodes,
      metadata: { headers },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CSV parse error.";

    return {
      document: cloneDocument(document, {
        parseStatus: "failed",
        warnings: [...document.warnings, `CSV parsing failed: ${message}`],
      }),
      nodes: [],
      metadata: { headers: [] },
    };
  }
}

function normalizeHeaders(rawHeaders: string[]): {
  headers: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const seen = new Map<string, number>();
  const headers = rawHeaders.map((header, index) => {
    const normalizedBase = header
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "_")
      .replace(/^_+|_+$/gu, "");

    const base = normalizedBase || `col_${index}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);

    if (!normalizedBase) {
      warnings.push(`CSV header ${index + 1} is missing and was renamed to ${base}.`);
    }

    if (count > 1) {
      const duplicateHeader = `${base}_${count}`;
      warnings.push(`CSV header ${base} is duplicated and was renamed to ${duplicateHeader}.`);
      return duplicateHeader;
    }

    return base;
  });

  return { headers, warnings };
}

function serializeCsvRow(values: string[]): string {
  return values
    .map((value) => {
      if (/[",\n]/u.test(value)) {
        return `"${value.replace(/"/gu, '""')}"`;
      }

      return value;
    })
    .join(",");
}
