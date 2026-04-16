#!/usr/bin/env npx tsx
import { readdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { Command } from "commander";
import type { LLMProvider } from "./extract/llm-types";
import { KnowledgeTool } from "./knowledge";

// ── Supported extensions ──────────────────────────────────────────────
const SUPPORTED_EXTENSIONS = new Set([
  ".pdf", ".docx", ".md", ".markdown", ".txt", ".csv", ".json", ".yaml", ".yml",
]);

// ── Helpers ───────────────────────────────────────────────────────────
async function resolveFiles(files: string[], dir?: string): Promise<string[]> {
  const result: string[] = [];

  if (dir) {
    const entries = await readdir(resolve(dir), { recursive: true });
    for (const entry of entries) {
      if (SUPPORTED_EXTENSIONS.has(extname(entry).toLowerCase())) {
        result.push(resolve(dir, entry));
      }
    }
  }

  for (const f of files) {
    const fullPath = resolve(f);
    const info = await stat(fullPath).catch(() => null);
    if (!info) {
      console.error(`  ✗ not found: ${f}`);
      continue;
    }
    if (info.isDirectory()) {
      const entries = await readdir(fullPath, { recursive: true });
      for (const entry of entries) {
        if (SUPPORTED_EXTENSIONS.has(extname(entry).toLowerCase())) {
          result.push(join(fullPath, entry));
        }
      }
    } else {
      result.push(fullPath);
    }
  }

  if (result.length === 0) {
    console.error("No supported files found. Supported: PDF, DOCX, MD, TXT, CSV, JSON, YAML");
    process.exit(1);
  }

  return [...new Set(result)];
}

async function ingestAll(tool: KnowledgeTool, files: string[]): Promise<number> {
  let count = 0;
  for (const file of files) {
    try {
      const doc = await tool.ingest(file);
      console.error(`  ✓ ${file} (${doc.sourceType})`);
      count++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${file}: ${msg}`);
    }
  }
  return count;
}

function createLLMProvider(opts: {
  provider?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}): LLMProvider {
  const provider = opts.provider ?? process.env.LLM_PROVIDER ?? "openai";
  const apiKey = opts.apiKey ?? process.env.LLM_API_KEY
    ?? process.env.OPENAI_API_KEY
    ?? process.env.ANTHROPIC_API_KEY
    ?? "";

  switch (provider) {
    case "openai": {
      const model = opts.model ?? process.env.LLM_MODEL ?? "gpt-4o-mini";
      const baseUrl = opts.baseUrl ?? process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
      if (!apiKey) {
        console.error("Error: Set OPENAI_API_KEY or LLM_API_KEY, or use --api-key");
        process.exit(1);
      }
      return {
        chat: async (messages) => {
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model, messages, response_format: { type: "json_object" } }),
          });
          if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
          const json = (await res.json()) as { choices: Array<{ message: { content: string } }> };
          return json.choices[0].message.content ?? "";
        },
      };
    }

    case "anthropic": {
      const model = opts.model ?? process.env.LLM_MODEL ?? "claude-sonnet-4-20250514";
      if (!apiKey) {
        console.error("Error: Set ANTHROPIC_API_KEY or LLM_API_KEY, or use --api-key");
        process.exit(1);
      }
      return {
        chat: async (messages) => {
          const systemMsg = messages.find((m) => m.role === "system")?.content ?? "";
          const userMsgs = messages.filter((m) => m.role === "user");
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({ model, max_tokens: 4096, system: systemMsg, messages: userMsgs }),
          });
          if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
          const json = (await res.json()) as { content: Array<{ type: string; text: string }> };
          const textBlock = json.content.find((c) => c.type === "text");
          return textBlock?.text ?? "";
        },
      };
    }

    case "ollama": {
      const model = opts.model ?? process.env.LLM_MODEL ?? "qwen2.5";
      const baseUrl = opts.baseUrl ?? process.env.LLM_BASE_URL ?? "http://localhost:11434";
      return {
        chat: async (messages) => {
          const res = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            body: JSON.stringify({ model, messages, format: "json", stream: false }),
          });
          if (!res.ok) throw new Error(`Ollama API error ${res.status}: ${await res.text()}`);
          const json = (await res.json()) as { message: { content: string } };
          return json.message.content;
        },
      };
    }

    default:
      console.error(`Unknown LLM provider: ${provider}. Use: openai, anthropic, ollama`);
      process.exit(1);
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

function formatCitation(citation: {
  citationKind: string;
  sectionPath?: string;
  pageStart?: number;
  pageEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  jsonPath?: string;
  yamlPath?: string;
  locatorText?: string;
}): string {
  switch (citation.citationKind) {
    case "section": return citation.sectionPath ?? "(section)";
    case "page": return `p.${citation.pageStart}${citation.pageEnd && citation.pageEnd !== citation.pageStart ? `-${citation.pageEnd}` : ""}`;
    case "row": return `row ${citation.rowStart}${citation.rowEnd && citation.rowEnd !== citation.rowStart ? `-${citation.rowEnd}` : ""}`;
    case "jsonPath": return citation.jsonPath ?? "(json)";
    case "yamlPath": return citation.yamlPath ?? "(yaml)";
    case "lineRange": return citation.locatorText ?? "(lines)";
    default: return citation.locatorText ?? "(unknown)";
  }
}

type SearchResultItem = {
  chunk: { text: string; sectionPath: string[]; documentId: string };
  score: number;
  citation: {
    citationKind: string; sectionPath?: string; pageStart?: number; pageEnd?: number;
    rowStart?: number; rowEnd?: number; jsonPath?: string; yamlPath?: string; locatorText?: string;
  };
};

function formatSearchResults(results: SearchResultItem[]): string {
  if (results.length === 0) return "No results found.";

  return results
    .map((r, i) => {
      const section = r.chunk.sectionPath.length > 0 ? r.chunk.sectionPath.join(" › ") : "(root)";
      const snippet = truncate(r.chunk.text.replace(/\n+/g, " ").trim(), 200);
      return [
        `[${i + 1}] Score: ${r.score.toFixed(4)}`,
        `    Source: ${r.chunk.documentId} (${formatCitation(r.citation)})`,
        `    Section: ${section}`,
        `    ${snippet}`,
      ].join("\n");
    })
    .join("\n\n");
}

// ── LLM options shared across commands ────────────────────────────────
function addLLMOptions(cmd: Command): Command {
  return cmd
    .option("--provider <name>", "LLM provider: openai, anthropic, ollama", "openai")
    .option("--model <name>", "LLM model name")
    .option("--api-key <key>", "LLM API key (or use env vars)")
    .option("--base-url <url>", "LLM API base URL");
}

// ── Program ───────────────────────────────────────────────────────────
const program = new Command();

program
  .name("knowledge-layer")
  .description("Local-first knowledge layer for game design documents")
  .version("0.1.0");

// ── ingest ────────────────────────────────────────────────────────────
program
  .command("ingest")
  .description("Ingest documents and show stats")
  .argument("[files...]", "Files or directories to ingest")
  .option("-d, --dir <path>", "Scan directory recursively for supported files")
  .option("--json", "Output as JSON")
  .action(async (files: string[], opts: { dir?: string; json?: boolean }) => {
    const resolved = await resolveFiles(files, opts.dir);
    console.error(`Ingesting ${resolved.length} file(s)...\n`);

    const tool = new KnowledgeTool();
    await ingestAll(tool, resolved);

    const docs = tool.listDocuments();

    if (opts.json) {
      console.log(JSON.stringify(docs, null, 2));
    } else {
      console.log(`\nIngested ${docs.length} document(s):`);
      for (const doc of docs) {
        console.log(`  • ${doc.documentId} (${doc.sourceType}) — ${doc.displayTitle}`);
      }
    }
  });

// ── search ────────────────────────────────────────────────────────────
program
  .command("search")
  .description("Search documents (BM25 lexical or focused with graph expansion)")
  .argument("<query>", "Search query")
  .argument("[files...]", "Files or directories to ingest")
  .option("-d, --dir <path>", "Scan directory recursively")
  .option("-k, --top-k <n>", "Max results to return", "5")
  .option("-m, --mode <mode>", "Retrieval mode: lexical | focused", "lexical")
  .option("--min-score <n>", "Minimum score threshold")
  .option("--json", "Output as JSON")
  .action(async (query: string, files: string[], opts: {
    dir?: string; topK: string; mode: string; minScore?: string; json?: boolean;
  }) => {
    const resolved = await resolveFiles(files, opts.dir);
    console.error(`Ingesting ${resolved.length} file(s)...\n`);

    const tool = new KnowledgeTool();
    await ingestAll(tool, resolved);

    const mode = opts.mode as "lexical" | "focused";
    console.error(`\nSearching "${query}" (mode: ${mode}, top-k: ${opts.topK})...\n`);

    const result = tool.search({
      query,
      topK: parseInt(opts.topK, 10),
      retrievalMode: mode,
      includeRawText: false,
      includeStructured: false,
      minScore: opts.minScore ? parseFloat(opts.minScore) : undefined,
    });

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatSearchResults(result.results));
      console.log(`\n${result.results.length} result(s) in ${result.timingMs.toFixed(1)}ms`);
    }
  });

// ── deep-search ───────────────────────────────────────────────────────
const deepSearchCmd = program
  .command("deep-search")
  .description("Deep search with LLM query decomposition (requires LLM)")
  .argument("<query>", "Complex design question")
  .argument("[files...]", "Files or directories to ingest")
  .option("-d, --dir <path>", "Scan directory recursively")
  .option("-k, --top-k <n>", "Max results to return", "10")
  .option("--max-sub-queries <n>", "Max decomposed sub-queries", "4")
  .option("--json", "Output as JSON");

addLLMOptions(deepSearchCmd);

deepSearchCmd.action(async (query: string, files: string[], opts: {
  dir?: string; topK: string; maxSubQueries: string; json?: boolean;
  provider?: string; model?: string; apiKey?: string; baseUrl?: string;
}) => {
  const resolved = await resolveFiles(files, opts.dir);
  console.error(`Ingesting ${resolved.length} file(s)...\n`);

  const tool = new KnowledgeTool();
  await ingestAll(tool, resolved);

  const llm = createLLMProvider(opts);
  console.error(`\nDeep searching "${query}"...\n`);

  const result = await tool.deepSearch(query, {
    llm,
    topK: parseInt(opts.topK, 10),
    maxSubQueries: parseInt(opts.maxSubQueries, 10),
  });

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (result.subQueries.length > 0) {
      console.log("Sub-queries:");
      for (const sq of result.subQueries) {
        console.log(`  • ${sq}`);
      }
      console.log();
    }
    console.log(formatSearchResults(result.chunks));

    if (result.entities.length > 0) {
      console.log("\nEntities found:");
      for (const e of result.entities) {
        console.log(`  • ${e.name} (${e.type}): ${e.description}`);
      }
    }

    if (result.relationships.length > 0) {
      console.log("\nRelationships:");
      for (const r of result.relationships) {
        console.log(`  • ${r.sourceEntityId} --[${r.type}]--> ${r.targetEntityId}`);
      }
    }

    console.log(`\n${result.chunks.length} result(s)`);
  }
});

// ── graph ─────────────────────────────────────────────────────────────
const graphCmd = program
  .command("graph")
  .description("Build knowledge graph from documents (requires LLM)")
  .argument("[files...]", "Files or directories to ingest")
  .option("-d, --dir <path>", "Scan directory recursively")
  .option("--batch-size <n>", "Chunks per LLM call", "5")
  .option("--json", "Output as JSON");

addLLMOptions(graphCmd);

graphCmd.action(async (files: string[], opts: {
  dir?: string; batchSize: string; json?: boolean;
  provider?: string; model?: string; apiKey?: string; baseUrl?: string;
}) => {
  const resolved = await resolveFiles(files, opts.dir);
  console.error(`Ingesting ${resolved.length} file(s)...\n`);

  const tool = new KnowledgeTool();
  await ingestAll(tool, resolved);

  const llm = createLLMProvider(opts);
  console.error("\nBuilding knowledge graph...\n");

  const stats = await tool.buildGraph({
    llm,
    batchSize: parseInt(opts.batchSize, 10),
    onProgress: ({ phase, current, total, message }) => {
      console.error(`  [${phase}] ${current}/${total} — ${message}`);
    },
  });

  if (opts.json) {
    console.log(JSON.stringify(stats, null, 2));
  } else {
    console.log(`\nGraph built:`);
    console.log(`  Entities: ${stats.entityCount}`);
    console.log(`  Relations: ${stats.relationCount}`);

    if (stats.entityTypeCounts) {
      console.log("\n  Entity types:");
      for (const [type, count] of Object.entries(stats.entityTypeCounts)) {
        console.log(`    ${type}: ${count}`);
      }
    }

    if (stats.relationTypeCounts) {
      console.log("\n  Relation types:");
      for (const [type, count] of Object.entries(stats.relationTypeCounts)) {
        console.log(`    ${type}: ${count}`);
      }
    }

    const graph = tool.graph;
    if (graph) {
      const allEntities = graph.getAllEntities();
      if (allEntities.length > 0) {
        console.log("\n  All entities:");
        for (const e of allEntities) {
          console.log(`    • ${e.name} (${e.type}): ${truncate(e.description, 80)}`);
        }
      }
    }
  }
});

// ── extract ───────────────────────────────────────────────────────────
program
  .command("extract")
  .description("Extract structured data using rule-based schemas")
  .argument("<schema>", "Schema: game-mechanics | economy")
  .argument("[files...]", "Files or directories to ingest")
  .option("-d, --dir <path>", "Scan directory recursively")
  .option("--json", "Output as JSON")
  .action(async (schema: string, files: string[], opts: { dir?: string; json?: boolean }) => {
    const resolved = await resolveFiles(files, opts.dir);
    console.error(`Ingesting ${resolved.length} file(s)...\n`);

    const tool = new KnowledgeTool();
    await ingestAll(tool, resolved);

    const docs = tool.listDocuments();

    if (opts.json) {
      const allExtractions = docs.map((doc) => tool.extract(doc.documentId, schema as "game-mechanics" | "economy"));
      console.log(JSON.stringify(allExtractions, null, 2));
    } else {
      for (const doc of docs) {
        const extraction = tool.extract(doc.documentId, schema as "game-mechanics" | "economy");
        console.log(`\n── ${doc.displayTitle} ──`);

        if (extraction.records.length === 0) {
          console.log("  No records extracted.");
          continue;
        }

        for (const [idx, record] of extraction.records.entries()) {
          console.log(`  Record ${idx + 1}:`);
          for (const [key, value] of Object.entries(record)) {
            console.log(`    ${key}: ${JSON.stringify(value)}`);
          }
        }

        if (extraction.warnings.length > 0) {
          console.log(`  Warnings: ${extraction.warnings.join(", ")}`);
        }
      }
    }
  });

// ── feature-context ───────────────────────────────────────────────────
const featureCmd = program
  .command("feature-context")
  .description("Get design context for a new feature (optional LLM for deep search)")
  .argument("<description>", "Feature description in natural language")
  .argument("[files...]", "Files or directories to ingest")
  .option("-d, --dir <path>", "Scan directory recursively")
  .option("--json", "Output as JSON");

addLLMOptions(featureCmd);

featureCmd.action(async (description: string, files: string[], opts: {
  dir?: string; json?: boolean;
  provider?: string; model?: string; apiKey?: string; baseUrl?: string;
}) => {
  const resolved = await resolveFiles(files, opts.dir);
  console.error(`Ingesting ${resolved.length} file(s)...\n`);

  const tool = new KnowledgeTool();
  await ingestAll(tool, resolved);

  let llm: LLMProvider | undefined;
  const hasKey = opts.apiKey ?? process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (hasKey) {
    llm = createLLMProvider(opts);
  }

  console.error(`\nBuilding feature context for: "${description}"...\n`);

  const ctx = await tool.getFeatureContext(description, llm);

  if (opts.json) {
    console.log(JSON.stringify(ctx, null, 2));
  } else {
    console.log(ctx.contextString);
  }
});

// ── list ──────────────────────────────────────────────────────────────
program
  .command("list")
  .description("List ingested documents")
  .argument("[files...]", "Files or directories to ingest")
  .option("-d, --dir <path>", "Scan directory recursively")
  .option("--json", "Output as JSON")
  .action(async (files: string[], opts: { dir?: string; json?: boolean }) => {
    const resolved = await resolveFiles(files, opts.dir);
    console.error(`Ingesting ${resolved.length} file(s)...\n`);

    const tool = new KnowledgeTool();
    await ingestAll(tool, resolved);

    const docs = tool.listDocuments();

    if (opts.json) {
      console.log(JSON.stringify(docs, null, 2));
    } else {
      console.log(`\n${docs.length} document(s):\n`);
      for (const doc of docs) {
        console.log(`  ID:     ${doc.documentId}`);
        console.log(`  Title:  ${doc.displayTitle}`);
        console.log(`  Type:   ${doc.sourceType}`);
        console.log(`  Status: ${doc.parseStatus}`);
        if (doc.warnings.length > 0) {
          console.log(`  Warns:  ${doc.warnings.join(", ")}`);
        }
        console.log();
      }
    }
  });

// ── Parse & run ───────────────────────────────────────────────────────
program.parse(process.argv);
