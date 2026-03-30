# Game Design Knowledge Layer

## TL;DR

> **One-line goal**: Build a local-first, retrieval-first knowledge service that ingests heterogeneous internal game design documents, normalises them into citation-preserving evidence units, and exposes a strict tool/API boundary for other agents to search, extract, and access raw knowledge.
>
> **What this is NOT**: a concept generation agent, an orchestrator, a model/LLM runtime.
>
> **Deliverables**:
> - Document ingestion + normalisation pipeline for PDF, DOCX, MD/TXT, CSV, JSON, YAML
> - Citation-preserving chunking (page/section/row/path exact where possible)
> - Lexical retrieval index with filterable search API
> - Structured extraction with evidence back-references
> - Raw document and structure access endpoints
> - Retrieval evaluation harness with golden queries
>
> **Critical Path**: T1 → T2 → T3 → T4a → T4b → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T15 → F1-F4

---

## Context

### Revised Scope
Original goal was a full game-design concept agent. That agent is now owned separately. This project covers **only** the knowledge layer that feeds it. Other agents will call this system to retrieve grounded evidence for game design concept tasks.

### Confirmed Requirements
- **Integration mode**: Tool/API — other agents call `searchKnowledge`, `getDocument`, `getExtraction`
- **Source formats**: PDF (books), DOCX, Markdown/TXT, CSV/Spreadsheet, JSON, YAML
- **Citation precision**: Exact page/section for PDF and DOCX. Row/JSONPath/YAML-path for others. Citation exactness field always present.
- **Retrieval outputs**: ranked chunks with scores and citations, structured extraction with evidence refs, raw document/structure access

### Architecture Decisions
- Local-first, batch ingest + query (no realtime watcher in MVP)
- Lexical baseline first; add embeddings/hybrid only if evaluation metrics are insufficient
- No generation, no model client, no orchestration, no A2A runtime in MVP
- Clean request/response contracts that can be wrapped in A2A/MCP later without internals rewrite
- Scanned PDFs: out of MVP scope (no OCR)
- XLS/XLSX multi-sheet: out of MVP scope (CSV only in MVP)

---

## Work Objectives

### Core Objective
A deterministic evidence system: ingest documents, produce structured citation-preserving chunks, expose search + extraction + raw-access endpoints, evaluate retrieval quality against a golden dataset.

### Concrete Deliverables
- `src/types/` — all contracts: SourceDocument, DocumentStructureNode, CitationRef, KnowledgeChunk, StructuredExtraction, SearchKnowledgeRequest/Result, GetDocumentRequest/Result
- `src/parse/` — per-format parsers: pdf, docx, md, txt, csv, json, yaml
- `src/normalise/` — structure normalisation and citation builder
- `src/chunk/` — citation-preserving chunker
- `src/index/` — lexical index and filterable retrieval API
- `src/extract/` — schema-bound structured extraction with evidence refs
- `src/api/` — tool/API boundary: searchKnowledge, getDocument, getExtraction
- `src/eval/` — golden dataset + retrieval metrics harness
- `src/test-utils/` — document fixtures for every format
- `knowledge/fixtures/` — canonical test files: one per format
- Evaluation report: parse coverage, chunk integrity, retrieval recall@K, MRR, citation fidelity rate, P50/P95 latency

### Definition of Done
- [x] `bunx tsc --noEmit` — zero type errors
- [x] `bun test` — all pass, zero API calls to external services
- [x] All fixture files parse without crash, `parseStatus: success`
- [x] Every chunk has a `primaryCitation` with `exactness` field
- [x] `searchKnowledge` returns ranked results with citations
- [x] Evaluation harness reports recall@5, MRR, citation fidelity rate on golden dataset
- [x] `getDocument` and `getExtraction` return valid results
- [x] No generation, model, or orchestration code present

### Must Have
- Every chunk keeps its `CitationRef` with `exactness` field
- Retrieval API is the **only** way to access knowledge
- Per-format parsers are isolated, independently testable
- Structured extraction has evidence back-references to citations
- Evaluation harness exists before any retrieval tuning
- Exact page/section for PDF/DOCX when parseable
- Row citation for CSV; JSONPath for JSON; YAML path for YAML

### Must NOT Have (Guardrails)
- NO model client, prompt templates, or generation logic
- NO orchestration or agent routing code
- NO A2A runtime/server/transport (contracts-only is fine)
- NO OCR (scanned PDF handling)
- NO XLS/XLSX multi-sheet support
- NO realtime indexing or file watchers
- NO cross-document synthesis or reasoning
- NO embeddings unless lexical baseline fails evaluation
- NO fake citation precision (missing page/section → `exactness: unavailable`, not invented)
- NO real external API calls in tests

---

## Verification Strategy

### QA Policy
- **Parser tests**: fixture in → assert normalised structure, assert citation anchors present
- **Chunking tests**: assert stable chunk IDs, chunk→source linkage, no empty chunks
- **Retrieval tests**: golden queries → expected result IDs in top-K
- **Citation fidelity tests**: given result, confirm cited location actually contains evidence text
- **Contract tests**: Zod schema round-trip for all request/response types
- **Failure-mode tests**: malformed file, empty file, unsupported feature, encoding edge cases

### Evaluation Acceptance Thresholds
- Parse coverage: all fixture files succeed
- Chunk integrity: zero empty chunks, zero duplicate IDs, zero missing citations where required
- Retrieval recall@5: > 80% on golden dataset
- Citation fidelity rate: > 90% for PDF/DOCX exact citations
- P95 latency: < 200ms per query on local corpus

---

## Execution Strategy

### Parallel Execution Waves

> A wave is executable only when every task in that wave depends exclusively on earlier waves.

```
Wave 0 — Bootstrap (sequential):
└── T1: Project scaffold + config

Wave 1 — Contracts (after T1, sequential — T3 depends on T2 types):
├── T2: Core type system + all contracts
└── T3: (starts after T2) Test infrastructure + document fixtures

Wave 2 — Parsers (after T2 + T3, all parallel):
├── T4a: PDF + DOCX parsers
└── T4b: MD, TXT, CSV, JSON, YAML parsers

Wave 3 — Normalisation (after T2 + T4a + T4b):
└── T5: Document normalisation + citation builder

Wave 4 — Chunking (after T2 + T5):
└── T6: Citation-preserving chunker

Wave 5 — Retrieval (after T2 + T6):
└── T7: Lexical index + searchKnowledge API

Wave 6 — Evaluation (after T7):
└── T8: Retrieval evaluation harness + golden dataset

Wave 7 — Extraction + Access (after T5 + T7, all parallel):
├── T9:  Schema-bound structured extraction
└── T10: Raw document + structure access API

Wave 8 — Integration API (after T7 + T9 + T10):
└── T11: Unified tool/API boundary

Wave 9 — End-to-End tests (after T11 + T8):
└── T15: End-to-end integration tests

Wave FINAL (after T15):
├── F1: Plan Compliance Audit    [oracle]
├── F2: Code Quality Review      [unspecified-high]
├── F3: Retrieval + Citation QA  [unspecified-high]
└── F4: Scope Fidelity Check     [deep]
```

**Critical Path**: T1 → T2 → T3 → T4a → T5 → T6 → T7 → T8 → T11 → T15 → F1-F4
**Max Concurrent**: 3 (Wave 1, Wave 2, Wave 7)

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1   | —         | T2 |
| T2   | T1        | T3, T4a, T4b, T5, T6, T7, T9, T10, T11 |
| T3   | T1, T2    | T4a, T4b, T5, T6, T7, T9, T10, T11, T15 |
| T4a  | T2, T3    | T5 |
| T4b  | T2, T3    | T5 |
| T5   | T2, T4a, T4b | T6, T9, T10 |
| T6   | T2, T5    | T7 |
| T7   | T2, T6    | T8, T9, T10, T11 |
| T8   | T7        | T15, F3 |
| T9   | T2, T5, T7 | T11 |
| T10  | T2, T5, T7 | T11 |
| T11  | T7, T9, T10 | T15 |
| T15  | T3, T8, T11 | F1-F4 |

### Agent Dispatch Summary

| Wave | Tasks | Categories |
|------|-------|-----------|
| 0    | T1    | `quick` |
| 1    | T2    | `quick` |
| 1.5  | T3    | `quick` |
| 2    | T4a, T4b | `unspecified-high`, `unspecified-high` |
| 3    | T5    | `unspecified-high` |
| 4    | T6    | `unspecified-high` |
| 5    | T7    | `deep` |
| 6    | T8    | `unspecified-high` |
| 7    | T9, T10 | `deep`, `unspecified-high` |
| 8    | T11   | `deep` |
| 9    | T15   | `deep` |
| FINAL | F1-F4 | `oracle`, `unspecified-high`, `unspecified-high`, `deep` |

---

## TODOs

### Wave 0 — Bootstrap

- [x] T1. Project Scaffold + Config

  **What to do**:
  - Initialize git repository: `git init && git add -A && git commit -m 'chore: initial empty commit'` (prerequisite — plan assumes a git repo exists before T1 work begins)
  - `.gitignore` — node_modules, dist, .env, *.log
  - Create directories:
    - `src/types/`, `src/parse/`, `src/normalise/`, `src/chunk/`
    - `src/index/`, `src/extract/`, `src/api/`, `src/eval/`
    - `src/test-utils/`, `knowledge/fixtures/`
  - `package.json` dependencies — keep minimal:
    - `typescript`, `zod`, `unpdf`, `mammoth`, `csv-parse`, `js-yaml`, `@orama/orama`, `gpt-tokenizer`, `commander`
  - No model/LLM/generation dependencies allowed

  **Must NOT do**:
  - Do NOT add any LLM SDK or model client dependency
  - Do NOT add vector DB yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`clean-code`]

  **Parallelization**: Wave 0, sequential, blocks everything.

  **References**:
  - `/home/lap15400-local/oh-my-openagent/tsconfig.json` — strict TS settings reference
  - `/home/lap15400-local/oh-my-openagent/package.json` — Bun project shape

  **Acceptance Criteria**:
  - [x] `bunx tsc --noEmit` exits 0 on empty project
  - [x] All directories exist
  - [x] `bun install` completes without errors

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Scaffold bootstraps cleanly
    Tool: Bash
    Steps:
      1. Run `bun install`
      2. Run `bunx tsc --noEmit`
      3. Verify exit code 0 for both
    Expected Result: Clean project with no errors
    Evidence: .sisyphus/evidence/t1-scaffold.txt
  ```

  **Commit**: `chore: initialize knowledge-layer project scaffold`

---

### Wave 1 — Contracts

- [x] T2. Core Type System + All Contracts

  **What to do**:
  - Define and Zod-validate all contracts:

  **`src/types/document.ts`**:
  ```typescript
  SourceDocument {
    documentId: string       // stable hash(uri)
    uri: string
    sourceType: "pdf" | "docx" | "md" | "txt" | "csv" | "json" | "yaml"
    contentHash: string      // SHA-256 for change detection
    displayTitle: string
    language?: string
    ingestionVersion: string
    parseStatus: "success" | "partial" | "failed"
    warnings: string[]
  }

  DocumentStructureNode {
    nodeId: string
    documentId: string
    nodeType: "section" | "paragraph" | "table" | "row" | "cell" | "list" | "keyValue" | "rawBlock"
    text: string
    path: string             // format-specific: "page:12/block:4" | "heading:Core Loops>para:3" | "row:18" | "$.combat.loops[0]"
    sectionPath?: string[]      // DOCX section ancestry: ["Chapter 1", "Core Loops"] (canonical field for DOCX section context)
    pageNumber?: number      // PDF/DOCX
    rowNumber?: number       // CSV
    columnName?: string      // CSV
    tokenCount: number
  }
  ```

  **`src/types/citation.ts`**:
  ```typescript
  CitationRef {
    documentId: string
    citationKind: "page" | "section" | "row" | "jsonPath" | "yamlPath" | "lineRange" | "unknown"
    pageStart?: number
    pageEnd?: number
    sectionPath?: string
    rowStart?: number
    rowEnd?: number
    jsonPath?: string
    yamlPath?: string
    locatorText?: string     // human-readable fallback
    exactness: "exact" | "derived" | "approximate" | "unavailable"
  }
  ```

  **`src/types/chunk.ts`**:
  ```typescript
  KnowledgeChunk {
    chunkId: string          // stable: hash(documentId + path + chunkIndex)
    documentId: string
    text: string
    normalizedText: string
    sourceNodeIds: string[]
    primaryCitation: CitationRef
    secondaryCitations: CitationRef[]
    sectionPath: string[]
    metadata: {
      category?: string
      tags?: string[]
      sourceType: string
      language?: string
      topic?: string
    }
    tokenCount: number
    chunkStrategyVersion: string
    embeddingReady: boolean  // false in MVP, true when embeddings are added
  }
  ```

  **`src/types/extraction.ts`**:
  ```typescript
  StructuredExtraction {
    documentId: string
    schemaName: string
    records: Record<string, unknown>[]
    evidence: Array<{ recordIndex: number; citation: CitationRef; fieldPath: string }>
    extractionStatus: "success" | "partial" | "failed"
    warnings: string[]
  }
  ```

  **`src/types/api.ts`**:
  ```typescript
  SearchKnowledgeRequest {
    query: string
    filters?: { category?: string; tags?: string[]; sourceType?: string; language?: string }
    topK: number
    retrievalMode: "lexical"   // "hybrid" deferred
    includeRawText: boolean
    includeStructured: boolean
    minScore?: number
  }

  SearchKnowledgeResult {
    results: Array<{
      chunk: KnowledgeChunk
      score: number
      scoreBreakdown?: Record<string, number>
      citation: CitationRef
      matchedTerms?: string[]
    }>
    timingMs: number
    indexVersion: string
  }

  GetDocumentRequest {
    documentId: string
    view: "raw" | "normalized" | "structure" | "chunks"
  }

  GetDocumentResult {
    document: SourceDocument
    data: string | DocumentStructureNode[] | KnowledgeChunk[] // based on view
    rawMimeType?: string    // for view: "raw"
    sizeBytes?: number
  }

  GetExtractionRequest {
    documentId: string
    schemaName?: string
  }

  GetExtractionResult {
    document: SourceDocument
    extractions: StructuredExtraction[]
  }
  ```

  - Barrel export all from `src/types/index.ts`
  - Write Zod schema tests: valid passes, missing required fields throw, wrong types throw

  **Must NOT do**:
  - Do NOT define agent contracts, prompt types, or generation schemas
  - Do NOT define A2A transport types (only clean request/response is fine)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`clean-code`]

  **Parallelization**:
  - Wave 1, parallel with T3
  - Blocks: T3, T4a, T4b, T5, T6, T7, T9, T10, T11

  **References**:
  - `/home/lap15400-local/oh-my-openagent/src/agents/types.ts` — contract pattern reference
  - Metis recommendations on contracts (CitationRef exactness field, StructuredExtraction evidence refs)

  **Acceptance Criteria**:
  - [x] `bun test src/types/` — all pass
  - [x] All contracts exported from barrel
  - [x] Every Zod schema has valid + invalid test cases

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Contract schemas validate correctly
    Tool: Bash (bun test)
    Steps:
      1. Run `bun test src/types/`
      2. Verify >= 30 tests pass (6 schemas × 5 cases minimum)
      3. Verify zero failures
    Expected Result: All contracts enforced correctly
    Evidence: .sisyphus/evidence/t2-contracts.txt
  ```

  **Commit**: `feat(types): define ingestion, chunk, citation, and retrieval contracts`

---

- [x] T3. Test Infrastructure + Document Fixtures

  **What to do**:
  - Create `knowledge/fixtures/` with one canonical test file per format:
    - `knowledge/fixtures/sample.pdf` — a real short PDF (or synthetic multi-page)
    - `knowledge/fixtures/sample.docx` — a real short DOCX with headings/tables
    - `knowledge/fixtures/sample.md` — with frontmatter, headings, code fence, table
    - `knowledge/fixtures/sample.txt` — plain text file
    - `knowledge/fixtures/sample.csv` — header row + data rows
    - `knowledge/fixtures/sample.json` — nested game design data
    - `knowledge/fixtures/sample.yaml` — nested game design data
  - Create `src/test-utils/`:
    - `fake-index.ts` — in-memory KnowledgeIndex for tests
    - `chunk-fixtures.ts` — pre-built KnowledgeChunk arrays for test assertions
    - `citation-fixtures.ts` — CitationRef samples per format, one exact + one unavailable each
    - `document-fixtures.ts` — SourceDocument stubs per format
    - `index.ts` — barrel export
  - Write tests for test-utils themselves:
    - FakeIndex behaves like real KnowledgeIndex interface

  **Must NOT do**:
  - Do NOT create real PDF/DOCX programmatically; use pre-built files or minimal synthetic ones

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`clean-code`]

  **Parallelization**:
  - Wave 1.5, after T2 (requires T2 types)
  - Blocks: T4a, T4b, T5, T6, T7, T9, T10, T11, T15

  **Acceptance Criteria**:
  - [x] 7 fixture files exist (one per format)
  - [x] FakeIndex tests pass
  - [x] Fixture helpers cover all required types

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Fixtures and test utils are complete
    Tool: Bash
    Steps:
      1. ls knowledge/fixtures/ — expect 7 files
      2. Run `bun test src/test-utils/`
      3. Verify all pass
    Expected Result: Full fixture set and working test utilities
    Evidence: .sisyphus/evidence/t3-fixtures.txt
  ```

  **Commit**: `test(fixtures): add document fixtures and test utilities`

---

### Wave 2 — Parsers

- [x] T4a. PDF + DOCX Parsers

  **What to do**:
  - `src/parse/pdf.ts` — PDF parser:
    - Parse text by page using `unpdf` (`extractText` with `mergePages: false` returns per-page string array)
    - Extract per-page text blocks as `DocumentStructureNode[]`
    - `pageNumber` = PDF page index (1-based)
    - `path` = `page:{N}/block:{M}`
    - Handle cross-page paragraphs: split at page boundary, note `pageStart/pageEnd`
    - `parseStatus: partial` if some pages fail, not full crash
    - Do NOT attempt OCR; if text layer absent on a page, mark `nodeType: rawBlock`, `text: ""`, warn
  - `src/parse/docx.ts` — DOCX parser using `mammoth`:
    - Extract heading hierarchy → `section` nodes
    - Extract paragraphs with section ancestry → `paragraph` nodes
    - Extract tables → `table` → `row` → `cell` nodes
    - Build section path from heading ancestors
    - `path` = `heading:{SectionName}>para:{N}` or `heading:{SectionName}>table:{M}>row:{R}`
    - Mark unsupported features (text boxes, comments, footnotes) as warnings
  - Write fixture-based tests for both:
    - Sample PDF: verify page count, first page text, correct `pageNumber` on nodes
    - Sample DOCX: verify section hierarchy, paragraph attribution, table structure

  **Must NOT do**:
  - Do NOT attempt OCR on image-only PDFs — skip page, emit warning
  - Do NOT emit citations without `exactness` field

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`clean-code`, `backend-development`]

  **Parallelization**:
  - Wave 2, parallel with T4b
  - Blocks: T5

  **References**:
  - `knowledge/fixtures/sample.pdf` and `knowledge/fixtures/sample.docx` — fixture files
  - `src/types/document.ts:DocumentStructureNode` — output contract
  - Metis notes on PDF edge cases (ligatures, cross-page paras, page index vs displayed label)
  - Metis notes on DOCX edge cases (section path, unsupported features)

  **Acceptance Criteria**:
  - [x] `bun test src/parse/pdf.test.ts` — all pass
  - [x] `bun test src/parse/docx.test.ts` — all pass
  - [x] PDF nodes have `pageNumber`
  - [x] DOCX nodes have `sectionPath` (string[] from heading ancestry)
  - [x] Both parsers return `parseStatus` and `warnings`

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: PDF parses with page citations
    Tool: Bash (bun test)
    Steps:
      1. Run PDF fixture through parser
      2. Verify each node has pageNumber >= 1
      3. Verify path format matches page:{N}/block:{M}
    Expected Result: Page-level citations present and correct
    Evidence: .sisyphus/evidence/t4a-pdf.txt

  Scenario: DOCX parses with section hierarchy
    Tool: Bash (bun test)
    Steps:
      1. Run DOCX fixture through parser
      2. Verify section nodes exist
      3. Verify paragraph nodes have section ancestry in path
    Expected Result: Section-path citations present
    Evidence: .sisyphus/evidence/t4a-docx.txt
  ```

  **Commit**: `feat(parse): implement pdf and docx parsers with citation anchors`

---

- [x] T4b. MD, TXT, CSV, JSON, YAML Parsers

  **What to do**:
  - `src/parse/md.ts`:
    - Parse frontmatter (extract metadata)
    - Build heading hierarchy → section nodes
    - Paragraphs attributed to enclosing heading section
    - Code fences → `rawBlock` nodes (configurable: include/exclude from retrieval)
    - Tables → table nodes
    - `path` = `heading:{H}>para:{N}` or line range fallback
  - `src/parse/txt.ts`:
    - Split into paragraphs by blank line
    - `path` = `line:{start}-{end}`
    - No structural hierarchy — flat nodes
  - `src/parse/csv.ts` using `csv-parse`:
    - Header row → column names
    - Each data row → `row` node
    - `path` = `row:{N}`, `rowNumber` = N
    - Handle: missing headers (auto-name col_0, col_1, ...), duplicate headers (append _2, _3), multi-line cells
    - Preserve raw row text alongside structured fields
    - `citationKind: "row"`
  - `src/parse/json.ts`:
    - Walk JSON tree, chunk by subtree
    - `path` = JSONPath-like locator e.g. `$.combat.loops[0]`
    - Preserve parent context in every node
    - `citationKind: "jsonPath"`
  - `src/parse/yaml.ts` using `js-yaml`:
    - Walk YAML tree, chunk by value nodes
    - `path` = YAML key path e.g. `combat.loops[0].reward`
    - Note: comments are not preserved post-parse — document this
    - `citationKind: "yamlPath"`
  - Write fixture-based tests for each format

  **Must NOT do**:
  - Do NOT handle XLSX multi-sheet (note: CSV only in MVP)
  - Do NOT emit citations with invented precision

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`clean-code`, `backend-development`]

  **Parallelization**:
  - Wave 2, parallel with T4a
  - Blocks: T5

  **References**:
  - `knowledge/fixtures/sample.{md,txt,csv,json,yaml}` — fixture files
  - `src/types/document.ts:DocumentStructureNode` — output contract
  - Metis notes on CSV edge cases (duplicate headers, multi-line cells)
  - Metis notes on JSON/YAML path locators

  **Acceptance Criteria**:
  - [x] `bun test src/parse/` — all parsers pass with fixture files
  - [x] CSV nodes have `rowNumber` and `columnName`
  - [x] JSON nodes have JSONPath in `path`
  - [x] YAML nodes have YAML key path in `path`
  - [x] MD nodes have section hierarchy in `path`
  - [x] TXT nodes have line-range in `path`

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: All lightweight parsers produce citation-anchored nodes
    Tool: Bash (bun test)
    Steps:
      1. Run `bun test src/parse/`
      2. Verify each format fixture produces >= 3 nodes
      3. Verify each node has a non-empty `path`
    Expected Result: All 5 parsers produce structured nodes
    Evidence: .sisyphus/evidence/t4b-parsers.txt
  ```

  **Commit**: `feat(parse): implement md, txt, csv, json, yaml parsers with citation anchors`

---

### Wave 3 — Normalisation

- [x] T5. Document Normalisation + Citation Builder

  **What to do**:
  - `src/normalise/normalise.ts`:
    - Accept `DocumentStructureNode[]` + `SourceDocument`
    - Produce `SourceDocument` (populated), normalised nodes
    - Normalise text: strip control characters, normalise Unicode, normalise whitespace
    - Compute `tokenCount` using `gpt-tokenizer` (`encode(text).length`) for accurate chunk sizing
  - `src/normalise/citation-builder.ts`:
    - Convert `DocumentStructureNode` + `SourceDocument` → `CitationRef`
    - Rules per format:
      - PDF: `citationKind: "page"`, `pageStart/pageEnd`, `exactness: "exact"`
      - DOCX: `citationKind: "section"`, populate `sectionPath` from node.sectionPath, `exactness: "exact"` if path available, else `"derived"`
      - CSV: `citationKind: "row"`, `rowStart/rowEnd`, `exactness: "exact"`
      - JSON: `citationKind: "jsonPath"`, `jsonPath`, `exactness: "exact"`
      - YAML: `citationKind: "yamlPath"`, `yamlPath`, `exactness: "exact"`
      - MD: `citationKind: "section"` with line-range fallback, `exactness: "derived"` for lines
      - TXT: `citationKind: "lineRange"`, `exactness: "approximate"`
    - Always set `exactness`, never omit it
  - Write tests:
    - Citation built correctly for each format
    - `exactness` present on all output
    - Text normalisation handles known edge cases (ligatures, smart quotes)

  **Must NOT do**:
  - Do NOT invent page numbers where none exist
  - Do NOT set `exactness: "exact"` unless format supports it

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`clean-code`]

  **Parallelization**:
  - Wave 3, sequential after T4a + T4b
  - Blocks: T6, T9, T10

  **References**:
  - `src/types/citation.ts:CitationRef` — contract to produce
  - `src/types/document.ts:DocumentStructureNode` — input contract
  - Metis notes on citation exactness rules per format

  **Acceptance Criteria**:
  - [x] `bun test src/normalise/` — all pass
  - [x] Every CitationRef has `exactness` set
  - [x] PDF citations have `pageStart`
  - [x] DOCX citations have `sectionPath`
  - [x] CSV citations have `rowStart`

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Citation builder covers all formats correctly
    Tool: Bash (bun test)
    Steps:
      1. Run `bun test src/normalise/`
      2. Verify citations for each format have correct kind and exactness
      3. Verify no citation has exactness: "exact" for TXT format
    Expected Result: Format-aware citation fidelity enforced
    Evidence: .sisyphus/evidence/t5-normalise.txt
  ```

  **Commit**: `feat(normalise): add normalisation pipeline and citation builder`

---

### Wave 4 — Chunking

- [x] T6. Citation-Preserving Chunker

  **What to do**:
  - `src/chunk/chunker.ts`:
    - Accept normalised `DocumentStructureNode[]` + `CitationRef[]`
    - Produce `KnowledgeChunk[]`
    - Strategy: paragraph/section-aware split, target 400–600 tokens per chunk
    - Never split a citation unit (a single paragraph or table row stays in one chunk)
    - If a node exceeds max tokens, split at sentence boundary; emit `secondaryCitations` referencing both halves
    - Chunk ID: `hash(documentId + primaryCitation.locatorText + chunkIndex)` — stable across re-ingests
    - `embeddingReady: false` in MVP
  - `src/chunk/index.ts` — barrel export
  - Write tests:
    - Chunks have stable IDs
    - No empty chunks
    - No orphaned nodes (every node covered by at least one chunk)
    - Token counts within target range
    - Primary citation preserved on every chunk

  **Must NOT do**:
  - Do NOT split at a fixed token window ignoring structure
  - Do NOT produce chunks without `primaryCitation`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`clean-code`]

  **Parallelization**:
  - Wave 4, sequential after T5
  - Blocks: T7

  **References**:
  - `src/types/chunk.ts:KnowledgeChunk` — output contract
  - `src/normalise/citation-builder.ts` — citation inputs
  - Metis recommendation: paragraph-first chunking, sentence-boundary splits

  **Acceptance Criteria**:
  - [x] `bun test src/chunk/` — all pass
  - [x] Zero empty chunks
  - [x] Every chunk has `primaryCitation` with `exactness`
  - [x] Stable chunk IDs across re-ingest

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Chunks are citation-preserving and stable
    Tool: Bash (bun test)
    Steps:
      1. Run `bun test src/chunk/`
      2. Verify zero chunks have empty text
      3. Verify all chunks have primaryCitation.exactness set
      4. Re-run chunking on same input, verify same chunk IDs
    Expected Result: Stable, citation-preserving chunk set
    Evidence: .sisyphus/evidence/t6-chunker.txt
  ```

  **Commit**: `feat(chunk): implement citation-preserving chunker`

---

### Wave 5 — Retrieval

- [x] T7. Lexical Index + searchKnowledge API

  **What to do**:
  - `src/index/index.ts` — `KnowledgeIndex` interface:
    - `build(chunks: KnowledgeChunk[]): Promise<void>`
    - `search(req: SearchKnowledgeRequest): SearchKnowledgeResult`
    - `stats(): { totalChunks, categoryCounts, tagCounts }`
  - `src/index/orama-index.ts` — `OramaIndex` implementation using `@orama/orama`:
    - On `build`: create Orama DB with schema matching `KnowledgeChunk` fields (content, tags as `string[]`, category, sourceType)
    - On `search`:
      1. Use Orama `search()` with BM25 scoring (configurable k/b/d)
      2. Apply pre-index `where` filters (category, tags, sourceType) — Orama filters BEFORE scoring, not post-retrieval
      3. Apply `minScore` threshold
      4. Return top-K sorted by BM25 score
    - `timingMs` measured per query
    - Persistence: `@orama/plugin-data-persistence` for JSON/binary serialisation
    - `indexVersion`: hash of chunk IDs at build time
  - `src/index/index.ts` — barrel export
  - Write tests:
    - Known query returns expected top chunk
    - Tag filter narrows results correctly
    - minScore threshold filters low-relevance results
    - Empty query returns empty results
    - `timingMs` < 200ms for 100+ chunks

  **Must NOT do**:
  - Do NOT add embedding/vector search yet
  - Do NOT let agents call index internals directly — only through search API

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`clean-code`, `backend-development`]

  **Parallelization**:
  - Wave 5, sequential after T6
  - Blocks: T8, T9, T10, T11

  **References**:
  - `src/types/api.ts:SearchKnowledgeRequest/Result` — contract to implement
  - `src/types/chunk.ts:KnowledgeChunk` — input data
  - Orama BM25 scoring with pre-index `where` filters on category/tags/sourceType — no custom scoring formula needed

  **Acceptance Criteria**:
  - [x] `bun test src/index/` — all pass
  - [x] Known queries return relevant chunks in top-3
  - [x] Filters work correctly
  - [x] `timingMs` < 200ms on fixture corpus

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Search returns ranked results with citations
    Tool: Bash (bun test)
    Steps:
      1. Build index from fixture chunks
      2. Query for a known term present in fixture
      3. Verify top result score > 0
      4. Verify result includes chunk.primaryCitation with exactness
      5. Verify timingMs < 200
    Expected Result: Ranked, filtered, fast search with citations
    Evidence: .sisyphus/evidence/t7-index.txt
  ```

  **Commit**: `feat(index): implement lexical index and searchKnowledge api`

---

### Wave 6 — Evaluation

- [x] T8. Retrieval Evaluation Harness + Golden Dataset

  **What to do**:
  - Create `src/eval/golden-dataset.ts`:
    - 15–20 representative queries with expected chunk IDs or document IDs
    - Mix of: exact term match, tag match, category filter, cross-format queries
    - At least 3 queries with known expected citation page/section
  - Create `src/eval/metrics.ts`:
    - `recall_at_k(results, expected, k)` — fraction of expected in top-K
    - `mrr(results, expected)` — mean reciprocal rank
    - `ndcg_at_k(results, expected, k)` — NDCG
    - `citation_fidelity_rate(results)` — % of results where citation.exactness is "exact" or "derived"
    - `p50_p95_latency(timings: number[])` — from stored `timingMs`
  - Create `src/eval/evaluator.ts`:
    - Run all golden queries against built index
    - Collect metrics per query + aggregate
    - Print report + write to `.sisyphus/evidence/retrieval-eval-report.json`
  - Write tests:
    - Metric functions are correct on small known examples
    - Evaluator produces a report with all required metric keys

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`clean-code`]

  **Parallelization**:
  - Wave 6, sequential after T7
  - Blocks: T15, F3

  **References**:
  - `src/types/api.ts:SearchKnowledgeResult` — input data for evaluator
  - Metis recommendation: recall@5 > 80%, citation fidelity > 90%

  **Acceptance Criteria**:
  - [x] `bun test src/eval/` — all pass
  - [x] 15–20 golden queries defined
  - [x] Evaluator produces report with: recall@5, MRR, NDCG@5, citation fidelity rate, P50/P95 latency

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Evaluation harness produces complete metrics report
    Tool: Bash (bun test + Bash)
    Steps:
      1. Run `bun test src/eval/`
      2. Run evaluator against index built from fixtures
      3. Verify report file exists with all required metric keys
    Expected Result: Retrieval quality is measurable before tuning
    Evidence: .sisyphus/evidence/t8-eval.txt
  ```

  **Commit**: `test(eval): add golden dataset and retrieval evaluation harness`

---

### Wave 7 — Extraction + Access

- [x] T9. Schema-Bound Structured Extraction

  **What to do**:
  - `src/extract/extractor.ts`:
    - Accept `DocumentStructureNode[]` + named schema
    - Schemas defined in `src/extract/schemas/`:
      - `game-mechanic.schema.ts`: extract mechanic name, type, description, games from text
      - `economy-system.schema.ts`: extract currency names, sinks, sources
    - Extraction is **pattern/rule-based** (no LLM calls)
    - Every extracted record has `evidence[]`: array of `{ recordIndex, citation, fieldPath }`
    - `extractionStatus: "partial"` if schema matches < 50% of expected fields
  - Write tests:
    - Extraction produces records with evidence refs
    - Missing fields → partial status
    - Evidence citations are valid CitationRefs

  **Must NOT do**:
  - Do NOT use an LLM to extract
  - Do NOT return extracted records without evidence

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`clean-code`]

  **Parallelization**:
  - Wave 7, parallel with T10

  **References**:
  - `src/types/extraction.ts:StructuredExtraction` — output contract
  - `src/types/citation.ts:CitationRef` — evidence citation format

  **Acceptance Criteria**:
  - [x] `bun test src/extract/` — all pass
  - [x] Every record has at least one evidence ref
  - [x] Partial extraction returns status correctly

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Extraction produces evidence-backed records
    Tool: Bash (bun test)
    Steps:
      1. Run extraction on fixture document
      2. Verify records > 0
      3. Verify each record has evidence[].citation with exactness set
    Expected Result: Traceable structured extraction
    Evidence: .sisyphus/evidence/t9-extraction.txt
  ```

  **Commit**: `feat(extract): add schema-bound structured extraction with evidence refs`

---

- [x] T10. Raw Document + Structure Access API

  **What to do**:
  - `src/api/document-access.ts`:
    - `getDocument(req: GetDocumentRequest): GetDocumentResult`
    - Views:
      - `raw`: original file bytes + MIME
      - `normalized`: full normalised text
      - `structure`: full `DocumentStructureNode[]`
      - `chunks`: all `KnowledgeChunk[]` for this document
    - `src/api/index.ts` — barrel export

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`clean-code`]

  **Parallelization**:
  - Wave 7, parallel with T9

  **References**:
  - `src/types/api.ts:GetDocumentRequest` — contract

  **Acceptance Criteria**:
  - [x] `bun test src/api/document-access.test.ts` — all pass
  - [x] All 4 views return correct data shapes

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Document access returns all views
    Tool: Bash (bun test)
    Steps:
      1. Load fixture document
      2. Call getDocument for each view
      3. Verify correct shape returned for each
    Expected Result: All views work correctly
    Evidence: .sisyphus/evidence/t10-access.txt
  ```

  **Commit**: `feat(api): add raw document and structure access endpoints`

---

### Wave 8 — Unified API Boundary

- [x] T11. Unified Tool/API Boundary

  **What to do**:
  - `src/api/knowledge-tool.ts` — the **single entry point** for all consumers:
    - `searchKnowledge(req: SearchKnowledgeRequest): SearchKnowledgeResult`
    - `getDocument(req: GetDocumentRequest): GetDocumentResult`
    - `getExtraction(req: GetExtractionRequest): GetExtractionResult`
    - `ingestDocument(uri: string): Promise<SourceDocument>` — trigger ingestion of one file
    - `listDocuments(filters?): SourceDocument[]`
  - This module is the **only public API**; all internals are unexported
  - Write contract tests:
    - Request/response schemas validate
    - Invalid requests are rejected with clear errors

  **Must NOT do**:
  - Do NOT expose index, parser, or store internals
  - Do NOT accept generation or prompt-related inputs

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`clean-code`, `backend-development`]

  **Parallelization**:
  - Wave 8, sequential after T7 + T9 + T10
  - Blocks: T15

  **Acceptance Criteria**:
  - [x] `bun test src/api/` — all pass
  - [x] All public functions return Zod-valid responses
  - [x] Internal modules not directly importable from outside

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Unified tool boundary is the sole public interface
    Tool: Bash (bun test + grep)
    Steps:
      1. Run `bun test src/api/`
      2. grep -r "from.*src/index/" src/api/ — expect only knowledge-tool.ts uses it
      3. grep -r "from.*src/parse/" outside src/ — expect zero matches
    Expected Result: Strict encapsulation through single API boundary
    Evidence: .sisyphus/evidence/t11-api.txt
  ```

  **Commit**: `feat(api): add unified knowledge tool boundary`

---

### Wave 9 — Integration Tests

- [x] T15. End-to-End Integration Tests

  **What to do**:
  - `src/e2e/` — full pipeline tests:
    - Ingest all 7 fixture files
    - Search with known queries
    - Verify results include correct format citations
    - Run structured extraction on relevant fixtures
    - Access raw document via getDocument
    - Verify evaluation report passes acceptance thresholds
  - Run full eval harness in e2e test; fail if recall@5 < 60% (relaxed threshold for fixture-size corpus)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`clean-code`]

  **Acceptance Criteria**:
  - [x] `bun test src/e2e/` — all pass
  - [x] All 7 fixture formats ingest without crash
  - [x] Search produces results for queries on all formats
  - [x] Evaluation metrics computed and reported

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Full offline pipeline runs cleanly
    Tool: Bash (bun test)
    Steps:
      1. Run `bun test src/e2e/`
      2. Verify all 7 fixture documents ingested (parseStatus: success or partial)
      3. Verify search returns results for all format types
      4. Verify evaluation report exists in .sisyphus/evidence/
    Expected Result: Complete retrieval-first pipeline operational
    Evidence: .sisyphus/evidence/t15-e2e.txt
  ```

  **Commit**: `test: add end-to-end integration tests`

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: No generation or model code exists
    Tool: Bash
    Steps:
      1. grep -r "ModelClient\|generateText\|anthropic\|openai" src/ — expect 0
      2. Verify all 13 commits in log
      3. Verify .sisyphus/evidence/ has files for T1, T2, T3, T4a, T4b, T5, T6, T7, T8, T9, T10, T11, T15
    Expected Result: Knowledge-layer-only scope intact
    Evidence: .sisyphus/evidence/f1-compliance.txt
  ```

- [x] F2. **Code Quality Review** — `unspecified-high`

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Build and quality checks pass
    Tool: Bash
    Steps:
      1. Run `bunx tsc --noEmit`
      2. Run `bun test`
      3. grep for `as any`, `@ts-ignore`, empty catch blocks in src/
    Expected Result: Clean build, all tests pass, no quality issues
    Evidence: .sisyphus/evidence/f2-quality.txt
  ```

- [x] F3. **Retrieval + Citation QA** — `unspecified-high`

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Retrieval quality meets thresholds
    Tool: Bash
    Steps:
      1. Run evaluator: `bun run src/eval/evaluator.ts`
      2. Verify report shows recall@5 > 80%
      3. Verify citation fidelity rate > 90% for PDF/DOCX results
      4. Verify P95 latency < 200ms
    Expected Result: Measurable retrieval quality above acceptance thresholds
    Evidence: .sisyphus/evidence/f3-retrieval-qa.txt
  ```

- [x] F4. **Scope Fidelity Check** — `deep`

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: No out-of-scope code exists
    Tool: Bash
    Steps:
      1. grep -r "orchestrat\|concept.*agent\|AgentRole\|prompt.*template" src/ — expect 0
      2. grep -r "chromadb\|lancedb\|qdrant\|embed" src/ — expect 0
      3. grep -r "a2a.*server\|json-rpc\|agentcard" src/ — expect 0
    Expected Result: Scope strictly within knowledge layer
    Evidence: .sisyphus/evidence/f4-scope.txt
  ```

---

## Commit Strategy

1. `chore: initialize knowledge-layer project scaffold`
2. `feat(types): define ingestion, chunk, citation, and retrieval contracts`
3. `test(fixtures): add document fixtures and test utilities`
4. `feat(parse): implement pdf and docx parsers with citation anchors`
5. `feat(parse): implement md, txt, csv, json, yaml parsers with citation anchors`
6. `feat(normalise): add normalisation pipeline and citation builder`
7. `feat(chunk): implement citation-preserving chunker`
8. `feat(index): implement lexical index and searchKnowledge api`
9. `test(eval): add golden dataset and retrieval evaluation harness`
10. `feat(extract): add schema-bound structured extraction with evidence refs`
11. `feat(api): add raw document and structure access endpoints`
12. `feat(api): add unified knowledge tool boundary`
13. `test: add end-to-end integration tests`

---

## Success Criteria

```bash
bunx tsc --noEmit
bun test
bun run src/eval/evaluator.ts
```

Final checklist:
- [x] All fixture formats parse without crash
- [x] Every chunk has `primaryCitation.exactness` set
- [x] `searchKnowledge` returns ranked, cited results
- [x] `getDocument` and `getExtraction` work on all fixture types
- [x] Retrieval evaluation report: recall@5 > 80%, citation fidelity > 90%, P95 < 200ms
- [x] No model/generation/orchestration code in codebase
