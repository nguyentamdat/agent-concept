- T8 evaluator builds the lexical `OramaIndex` directly from `getAllChunkFixtures()` and writes the evidence report with `Bun.write` to `.sisyphus/evidence/retrieval-eval-report.json`.
- The golden dataset uses 16 queries; `txt` coverage is modeled as a negative-control query because the current fixture chunk corpus only contains six indexed chunks (pdf, docx, md, csv, json, yaml).
- T10 document access uses a keyed in-memory `DocumentStore` entry per `documentId` with `document`, `rawText`, `normalizedText`, `nodes`, and `chunks`, so tests can exercise views without pulling in ingestion or retrieval internals.
- F3 final-wave gate: `.sisyphus/evidence/retrieval-eval-report.json` clears all T8 thresholds (recall@5 0.9479, citation fidelity 1.0, p50 0.0766ms, p95 0.2465ms), and `.sisyphus/evidence/t15-e2e.txt` records live-pipeline recall@5 0.75, citation fidelity 1.0, and p95 2.02ms.
- F2 review: sampled tests in `src/chunk/chunker.test.ts`, `src/index/orama-index.test.ts`, `src/normalise/citation-builder.test.ts`, and `src/knowledge.test.ts` use behavior assertions against chunk IDs, citations, ranking, schema validity, and public API shape rather than placeholder expectations.
- F2 re-run findings: `src/` has zero `as any` usages, `src/parse/index.ts` now exports all seven parsers (`parseMarkdown`, `parseText`, `parseCsv`, `parseJson`, `parseYaml`, `parsePdf`, `parseDocx`), `src/index/orama-index.ts` catch blocks include clarifying comments, and the sampled quality tests still assert concrete behavior.
## 2026-03-31 — Review agent frontmatter pattern

- Review agents should keep YAML frontmatter order exactly: name → description → model → tools → maxTurns.
- Read-only quality gates must omit `Write` and `Edit` from tools entirely; verify with a literal grep count.
- Vietnamese body structure works well when separated into: Nhiệm vụ chính, Chế độ 1, Chế độ 2, Output Format, Review Loop Rules.
