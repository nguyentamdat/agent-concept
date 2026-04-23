# ZPS Game Design Kit — System Design & Estimation Plan

## 1. Executive Summary

Build một **AI-powered game design pipeline** gồm 6 bước (Research → Concept → Core Loop → Economy → GDD → Validate), sử dụng 8 AI agents chuyên biệt, backed bởi knowledge-layer đã có sẵn. Hệ thống giúp game designer đi từ ý tưởng đến pitch deck với AI hỗ trợ ở mỗi bước, có citations từ sách/tài liệu game design.

**Scope:**
- 6 pipeline steps, 18 core tasks, 18 enhance tasks, 18 framework items (54 total)
- 8 AI agents chuyên biệt
- Knowledge base từ 5+ sách game design (Schell, MDA, Hooked, Theory of Fun, Players Making Decisions)
- Web UI (React) + API layer
- Project persistence (multi-project support)

---

## 2. Current State Analysis

### 2.1 Knowledge Layer (✅ Existing)

| Capability | Status | Notes |
|---|---|---|
| Multi-format ingest (PDF, DOCX, MD, TXT, CSV, JSON, YAML) | ✅ Done | 7 parsers |
| BM25 lexical search (Orama) | ✅ Done | Sync, <10ms |
| Focused search (BM25 + graph expansion) | ✅ Done | Sync, graceful fallback |
| Deep search (LLM query decomposition) | ✅ Done | Async, timeout + fallback |
| Knowledge graph (entity/relation extraction) | ✅ Done | LLM-powered, Jaccard dedup |
| Feature design context (conflict detection) | ✅ Done | 3-level severity |
| Graph serialize/deserialize | ✅ Done | `serialize()` + `deserializeGraph()` |
| CLI | ✅ Done | 7 commands |
| LLMProvider interface (bring your own) | ✅ Done | OpenAI/Anthropic/Ollama |

### 2.2 Knowledge Layer Gaps (🔧 Cần bổ sung)

| Gap | Priority | Reason |
|---|---|---|
| **Project-scoped persistence** | P0 | Mỗi project cần riêng knowledge base, không re-ingest mỗi lần |
| **Index persistence** | P0 | Save/load Orama index + graph to disk |
| **Incremental ingest** | P1 | Thêm doc mới không rebuild toàn bộ index |
| **Semantic search (embedding)** | P2 | BM25 miss synonym/paraphrase; embedding bổ sung |
| **Multi-language support** | P2 | Docs tiếng Việt + tiếng Anh |

### 2.3 UI Spec (✅ Defined)

File `game_design_kit_v2.jsx` define đầy đủ:
- 6 steps với data structure: `{ core, enhance, frameworks }`
- Mỗi item có: `id, name, desc, output, agent, impact`
- 5 framework types: MDA, Schell, Polaris, SSM, DDE
- UI components: StepCard, flow bar, legend

### 2.4 Knowledge Base (✅ Available)

| PDF | Covers |
|---|---|
| *The Art of Game Design* — Jesse Schell | Lenses framework (100+ lenses) |
| *MDA: A Formal Approach* — Hunicke/LeBlanc/Zubek | MDA framework |
| *Hooked* — Nir Eyal | Hook model, habit-forming products |
| *Theory of Fun* — Raph Koster | Fun theory, pattern recognition, flow |
| *Players Making Decisions* | Player psychology, decision-making |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Pipeline │ │  Task    │ │ Output   │ │  Knowledge    │  │
│  │ Dashboard│ │ Details  │ │ Viewer   │ │  Explorer     │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
│       └─────────────┴────────────┴──────────────┘           │
│                           │ WebSocket + REST                │
├───────────────────────────┼─────────────────────────────────┤
│                        API LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Project  │ │ Pipeline │ │  Agent   │ │  Knowledge    │  │
│  │ API      │ │ API      │ │  API     │ │  API          │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
├───────┼─────────────┼────────────┼──────────────┼───────────┤
│       │        CORE SERVICES     │              │           │
│       ▼             ▼            ▼              ▼           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Project  │ │ Pipeline │ │  Agent   │ │  Knowledge    │  │
│  │ Store    │ │ Engine   │ │ Framework│ │  Layer        │  │
│  │ (SQLite) │ │ (DAG)    │ │ (8 spec) │ │  (existing)   │  │
│  └──────────┘ └──────────┘ └────┬─────┘ └──────┬────────┘  │
│                                 │               │           │
│                    ┌────────────┼───────────────┘           │
│                    ▼            ▼                            │
│              ┌──────────┐ ┌──────────┐                      │
│              │   LLM    │ │  Graph   │                      │
│              │ Provider │ │  Store   │                      │
│              │ (BYOLLM) │ │(in-mem+fs)│                     │
│              └──────────┘ └──────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

**Data flow cho 1 agent task execution:**

```
User clicks "Run Task" (e.g., Market Gap Identification)
    │
    ▼
Pipeline Engine checks dependencies (previous tasks completed?)
    │
    ▼
Agent Framework resolves agent (Market Intelligence Agent)
    │
    ├── 1. Build knowledge queries from task + user input
    │   └── e.g., ["market gap analysis frameworks", "underserved player segments"]
    │
    ├── 2. Knowledge Layer: deepSearch() or focusedSearch()
    │   └── Returns: chunks + entities + relationships + synthesisContext
    │
    ├── 3. Collect pipeline context (outputs from previous tasks)
    │   └── e.g., Step 1 Top Chart → genres already saturated
    │
    ├── 4. Build LLM prompt: system prompt + knowledge context + pipeline context + user input
    │
    ├── 5. LLM generates structured output (streamed via WebSocket)
    │
    ├── 6. Validate output against Zod schema
    │
    └── 7. Store output, mark task complete, notify frontend
```

---

## 4. Component Design

### 4.1 Project Store

Mỗi project = 1 game concept đang thiết kế. Quản lý state + persistence.

```typescript
interface Project {
  projectId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  knowledgeBaseId: string;   // ref to persisted knowledge base
  pipelineState: PipelineState;
  config: ProjectConfig;
}

interface ProjectConfig {
  llmProvider: "openai" | "anthropic" | "ollama";
  llmModel: string;
  llmBaseUrl?: string;
  genre?: string;
  platform?: string;
  targetAudience?: string;
}
```

**Storage:** SQLite via `bun:sqlite` (zero-dependency, file-based, built into Bun).

```
.data/
├── projects.db                    # SQLite: projects, pipeline states, task outputs
├── knowledge/
│   ├── {knowledgeBaseId}/
│   │   ├── index.json             # Serialized Orama index
│   │   ├── graph.json             # Serialized GraphStore
│   │   ├── documents.json         # Document metadata + chunks
│   │   └── sources/               # Original ingested files (symlinks or copies)
```

### 4.2 Pipeline Engine

Pipeline = DAG (directed acyclic graph) of steps → tasks.

```typescript
interface PipelineState {
  steps: Map<StepId, StepState>;
}

type StepId = "research" | "concept" | "coreloop" | "economy" | "gdd" | "validate";

interface StepState {
  status: "locked" | "available" | "in_progress" | "completed";
  tasks: Map<TaskId, TaskState>;
}

interface TaskState {
  taskId: string;
  tier: "core" | "enhance" | "framework";
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  agentId: string;
  input: Record<string, unknown> | null;    // user-provided input
  output: AgentOutput | null;               // agent-generated output
  humanReviewRequired: boolean;
  humanApproved: boolean | null;
  startedAt: string | null;
  completedAt: string | null;
}
```

**Step dependency rules:**
```
research  → (none)           — always available
concept   → research.core    — tất cả core tasks của research phải complete
coreloop  → concept.core     — tất cả core tasks của concept phải complete
economy   → coreloop.core    — tất cả core tasks của coreloop phải complete
gdd       → economy.core     — tất cả core tasks của economy phải complete
validate  → gdd.core         — tất cả core tasks của gdd phải complete
```

**Trong mỗi step:**
- Core tasks: chạy sequential hoặc parallel (tùy dependency)
- Enhance tasks: chạy sau khi core complete, fully optional
- Framework tasks: chạy bất kỳ lúc nào sau core, independent

**Human-in-the-loop:**

Một số task có `humanReviewRequired: true` (JSX đánh dấu agent kết thúc bằng "→ Human decision", "→ Human review", "→ Human filter"). Flow:

```
Agent generates output → status="completed" → UI shows output
    → Human reviews → approves/rejects
    → If approved: downstream tasks unlock
    → If rejected: re-run with human feedback
```

### 4.3 Agent Framework

#### Agent Interface

```typescript
interface AgentSpec {
  agentId: string;
  name: string;
  description: string;
  systemPrompt: string;

  // Determines how to query knowledge-layer for this agent
  buildKnowledgeQueries: (input: AgentTaskInput) => KnowledgeQuery[];

  // Zod schema for validating the output
  outputSchema: z.ZodSchema;

  // Optional: transform raw LLM output before validation
  parseOutput?: (raw: string) => unknown;
}

interface KnowledgeQuery {
  query: string;
  mode: "lexical" | "focused" | "deep";
  topK: number;
  filters?: { category?: string; tags?: string[] };
}

interface AgentTaskInput {
  taskId: string;
  taskDescription: string;       // from KIT data
  userInput: Record<string, unknown>;
  pipelineContext: PipelineContext; // outputs from completed tasks
  projectConfig: ProjectConfig;
}

interface PipelineContext {
  completedTasks: Map<string, AgentOutput>;
  // Convenience accessors
  getOutput(taskId: string): AgentOutput | undefined;
  getStepOutputs(stepId: StepId): AgentOutput[];
}

interface AgentOutput {
  taskId: string;
  agentId: string;
  data: Record<string, unknown>;   // validated by outputSchema
  citations: Citation[];            // evidence from knowledge-layer
  reasoning: string;                // agent's explanation
  markdown: string;                 // human-readable formatted output
  generatedAt: string;
  tokenUsage: { prompt: number; completion: number };
}

interface Citation {
  chunkId: string;
  documentTitle: string;
  sectionPath: string;
  snippet: string;
  score: number;
}
```

#### Agent Execution Flow

```typescript
async function executeAgentTask(
  spec: AgentSpec,
  input: AgentTaskInput,
  knowledge: KnowledgeTool,
  llm: LLMProvider,
  onStream?: (chunk: string) => void
): Promise<AgentOutput> {

  // 1. Build knowledge queries
  const queries = spec.buildKnowledgeQueries(input);

  // 2. Execute knowledge retrieval (parallel)
  const knowledgeResults = await Promise.all(
    queries.map(q => {
      if (q.mode === "deep") return knowledge.deepSearch(q.query, { llm, topK: q.topK });
      return knowledge.search({ query: q.query, topK: q.topK, retrievalMode: q.mode, ... });
    })
  );

  // 3. Build context string from knowledge results
  const knowledgeContext = formatKnowledgeContext(knowledgeResults);

  // 4. Build pipeline context string from previous outputs
  const pipelineContextStr = formatPipelineContext(input.pipelineContext, spec);

  // 5. Build full prompt
  const messages = [
    { role: "system", content: spec.systemPrompt },
    { role: "user", content: buildUserPrompt(input, knowledgeContext, pipelineContextStr) },
  ];

  // 6. Call LLM (with streaming if available)
  const raw = await llm.chat(messages);

  // 7. Parse + validate output
  const parsed = spec.parseOutput ? spec.parseOutput(raw) : JSON.parse(raw);
  const validated = spec.outputSchema.parse(parsed);

  // 8. Extract citations
  const citations = extractCitations(knowledgeResults);

  return {
    taskId: input.taskId,
    agentId: spec.agentId,
    data: validated,
    citations,
    reasoning: validated.reasoning ?? "",
    markdown: validated.markdown ?? raw,
    generatedAt: new Date().toISOString(),
    tokenUsage: { prompt: 0, completion: 0 }, // from LLM response if available
  };
}
```

### 4.4 API Layer

HTTP API (Hono — lightweight, Bun-native) + WebSocket cho streaming.

```
REST Endpoints:

# Projects
POST   /api/projects                    Create project
GET    /api/projects                    List projects
GET    /api/projects/:id                Get project details
PATCH  /api/projects/:id                Update project config
DELETE /api/projects/:id                Delete project

# Knowledge Base
POST   /api/projects/:id/knowledge/ingest      Ingest document(s)
POST   /api/projects/:id/knowledge/build-graph  Build knowledge graph
GET    /api/projects/:id/knowledge/search       Search knowledge
GET    /api/projects/:id/knowledge/stats        Knowledge base stats
GET    /api/projects/:id/knowledge/documents    List documents

# Pipeline
GET    /api/projects/:id/pipeline               Get pipeline state
POST   /api/projects/:id/pipeline/tasks/:taskId/run     Run a task
POST   /api/projects/:id/pipeline/tasks/:taskId/input   Set user input for task
POST   /api/projects/:id/pipeline/tasks/:taskId/approve Approve human review
POST   /api/projects/:id/pipeline/tasks/:taskId/reject  Reject + re-run
GET    /api/projects/:id/pipeline/tasks/:taskId/output  Get task output

# Export
GET    /api/projects/:id/export/gdd             Export full GDD (markdown)
GET    /api/projects/:id/export/pitch-deck      Export pitch deck data

WebSocket:
  ws://host/api/projects/:id/stream
  Events:
    - task:started   { taskId, agentId }
    - task:progress  { taskId, chunk }      // LLM streaming output
    - task:completed { taskId, output }
    - task:failed    { taskId, error }
    - step:unlocked  { stepId }
```

### 4.5 Frontend

Dựa trên JSX spec đã có. Key screens:

| Screen | Purpose |
|---|---|
| **Project List** | Tạo/chọn project |
| **Pipeline Dashboard** | 6 steps, progress overview, flow bar |
| **Step Detail** | Core / Enhance / Framework tasks với status |
| **Task Runner** | Input form + Run button + streaming output |
| **Output Viewer** | Formatted markdown + citations + data visualization |
| **Knowledge Explorer** | Search knowledge base, browse entities/relations |
| **Export** | GDD / Pitch deck generation |

**Tech stack:** React + Vite + TanStack Query (data fetching) + Zustand (local state).

---

## 5. Agent Specifications

### 5.1 Overview

| # | Agent | Used In Steps | Core Capability |
|---|---|---|---|
| 1 | Market Intelligence | Research, Concept, Validate | Market analysis, trends, sizing |
| 2 | Game Deconstructor | Research, Concept, Core Loop | Deep game analysis |
| 3 | Concept Ideation | Concept | Idea generation, blending |
| 4 | Core Loop Architect | Core Loop | Loop design, session, meta-game |
| 5 | Economy Simulator | Economy | Currency, source/sink, simulation |
| 6 | GDD Writer | GDD | Document generation, validation |
| 7 | Balance Testing | Validate | Simulation, playtesting |
| 8 | Pitch Builder | Validate | Deck generation, financials |

### 5.2 Agent: Market Intelligence

**Scope:** Market research, competitive landscape, audience analysis, trend forecasting.

**System prompt core:**
> You are a senior game market analyst. You analyze mobile/PC/console game markets using data-driven frameworks. You reference established game design theory (Schell's Lenses, MDA Framework) when evaluating market opportunities.

**Knowledge queries strategy:**
- Search for market analysis frameworks in knowledge base
- Search for player psychology / audience segmentation
- Search for relevant game design patterns mentioned by user

**Tasks handled:**

| Task | Output Schema | Knowledge Queries |
|---|---|---|
| `top-chart` | `{ games: [{ name, genre, rank, revenueEstimate, downloads, trend }], analysis }` | "top chart analysis mobile games", "revenue estimation methods" |
| `genre-map` | `{ genre, subGenres, audience: { age, gender, behavior, spending }, personas[] }` | "player personas", "audience segmentation", user's genre |
| `gap-find` | `{ gaps: [{ description, potential, evidence, competitors }] }` | "market gap identification", "underserved player segments" |
| `trend-forecast` | `{ trends: [{ name, direction, timeframe, confidence }], recommendation }` | "game industry trends", "genre lifecycle" |
| `tam-calc` | `{ tam, sam, som, methodology, assumptions }` | "market sizing games", "TAM SAM SOM" |
| `audience` (concept step) | `{ personas: [{ name, age, platform, spending, sessionLength, gamingHistory }] }` | "player personas", genre-specific |
| `ab-concept` (validate step) | `{ variants: [{ concept, metrics }], winner, confidence }` | "concept validation methods" |

### 5.3 Agent: Game Deconstructor

**Scope:** Phân tích sâu 1 game: core loop, economy, retention, UX flow. Hiểu TẠI SAO.

**System prompt core:**
> You are a senior game designer who deconstructs games to understand WHY they work. You analyze through the lens of MDA Framework (Mechanics → Dynamics → Aesthetics) and Schell's Lenses. You distinguish between WHAT a game does and WHY it does it.

**Tasks:**

| Task | Output Schema |
|---|---|
| `deconstruct` | `{ game, coreLoop, economy, retentionHooks, monetization, uxFlow, mdaAnalysis, strengths, weaknesses }` |
| `comparable` | `{ comparables: [{ game, similarity, metrics, lessons }], matrix }` |

### 5.4 Agent: Concept Ideation

**Scope:** Tạo và đánh giá game concepts, elevator pitch, design pillars.

**System prompt core:**
> You are a creative game designer who generates novel game concepts by blending proven mechanics with market opportunities. You use Schell's Lens of Essential Experience to ensure concepts have soul. Every concept must answer: "What is the essential experience the player will have?"

**Tasks:**

| Task | Output Schema |
|---|---|
| `elevator` | `{ pitch: string, expanded: string, uniqueHook: string }` |
| `pillars` | `{ pillars: [{ name, definition, dos: string[], donts: string[] }] }` |
| `blend` | `{ concepts: [{ name, pitch, mechanics, usp, marketFit }] }` |
| `risk` | `{ risks: [{ category, description, severity, mitigation }], recommendation: "go" \| "no-go" \| "pivot" }` |

### 5.5 Agent: Core Loop Architect

**Scope:** Thiết kế core loop, session structure, difficulty curve, meta-game layers.

**System prompt core:**
> You are a systems designer specializing in gameplay loops. You design loops that create FLOW states (Csikszentmihalyi) — clear goals, immediate feedback, challenge matching skill. You reference the SSM Framework to ensure System Space, Story Space, and player Mental Models are aligned.

**Tasks:**

| Task | Output Schema |
|---|---|
| `loop-flow` | `{ actions: [{ name, input, feedback, reward }], progression, flowchart: string }` |
| `session` | `{ duration, startCondition, endCondition, emotionCurve: [{ time, emotion }] }` |
| `difficulty` | `{ curve: [{ milestone, difficulty, newMechanic, breakerType }] }` |
| `meta-layers` | `{ layers: [{ name, loopDuration, rewards, unlockDay }] }` |
| `retention-hooks` | `{ hooks: [{ day, hookType, description, trigger }] }` |
| `social` | `{ features: [{ name, type, priority, retentionImpact }] }` |

### 5.6 Agent: Economy Simulator

**Scope:** Currency design, source/sink balance, IAP pricing, simulation.

**System prompt core:**
> You are a game economy designer. You model economies as closed systems with sources (earn) and sinks (spend). Every currency must have clear purpose. You design for ALL player archetypes: whale, dolphin, minnow, F2P. You use Monte Carlo simulation thinking to stress-test designs.

**Tasks:**

| Task | Output Schema |
|---|---|
| `currency` | `{ currencies: [{ name, type, earnRate, uses, cap }] }` |
| `source-sink` | `{ flows: [{ source, sink, rate, balance }], inflationRisk }` |
| `iap` | `{ tiers: [{ name, price, value, targetArchetype }], firstPurchaseOffer }` |
| `simulation` | `{ sessions, medianDaysToInflation, whaleF2pGap, exploits, adjustments }` |
| `whale-model` | `{ archetypes: [{ name, percentage, arpdau, experience }] }` |
| `live-ops-econ` | `{ eventCurrency, seasonPass, limitedOffers, mainEconomyImpact }` |

### 5.7 Agent: GDD Writer

**Scope:** Tổng hợp tất cả outputs thành GDD document, cross-validate consistency.

**System prompt core:**
> You are a technical writer for game design. You compile outputs from multiple agents into a coherent, structured GDD. You check internal consistency: economy matches progression, content covers retention hooks, features align with pillars. You apply Schell's Lens of the Document: "Does this serve the team?"

**Tasks:**

| Task | Output Schema |
|---|---|
| `gdd-structure` | `{ sections: [{ title, content, sourceTaskIds }] }` — full GDD |
| `content-plan` | `{ items: [{ type, count, workloadDays }], mvpScope, fullScope }` |
| `feature-priority` | `{ features: [{ name, impact, effort, priority, tier }] }` |
| `cross-validate` | `{ consistencyIssues: [{ section1, section2, issue, severity }] }` |
| `onboard-guide` | `{ guides: [{ role, summary, keyPages }] }` |

### 5.8 Agent: Balance Testing + Pitch Builder

**Balance Testing:**
> You simulate game sessions to find bottlenecks, difficulty spikes, and economy exploits. You run N-session thought experiments.

| Task | Output Schema |
|---|---|
| `playtest` (report) | `{ findings: [{ type, severity, description, suggestion }] }` |
| `ai-balance` | `{ sessions, bottlenecks, spikes, exploits, fixes }` |

**Pitch Builder:**
> You build compelling pitch decks from design data. Every claim backed by data. Clear ask.

| Task | Output Schema |
|---|---|
| `pitch-deck` | `{ slides: [{ title, content, notes, data }] }` |
| `financial` | `{ cpi, arpdau, ltv, paybackDays, revenueProjection }` |

---

## 6. Framework Tasks

Framework tasks khác regular tasks: chúng ÁP DỤNG một tư duy framework lên output đã có.

```typescript
interface FrameworkTaskSpec {
  frameworkType: "mda" | "schell" | "polaris" | "ssm" | "dde";
  inputTaskIds: string[];   // which task outputs to analyze
  lensId?: string;          // for Schell: which lens number
}
```

**Execution:** Framework tasks get:
1. Knowledge context (search for framework theory in knowledge base — e.g., search "MDA framework aesthetics dynamics" in MDA.pdf, Schell book)
2. Pipeline context (outputs from `inputTaskIds` to analyze)
3. Framework-specific system prompt

**Examples:**

| Framework Task | Input | Knowledge Query | Output |
|---|---|---|---|
| MDA Full Mapping | concept outputs | "MDA aesthetics dynamics mechanics" | `{ aesthetics[], dynamics[], mechanics[], mapping }` |
| Lens #18: Flow | core loop output | "Schell lens flow state clear goals feedback" | `{ assessment, flowChannelAnalysis, recommendations }` |
| Polaris Prioritization | all features | "Polaris framework feature prioritization" | `{ categories, buckets, ranking, risks }` |
| SSM Debug | playtest report | "system story mental model alignment" | `{ gaps[], rootCauses[], fixes[] }` |

---

## 7. Data Model (SQLite)

```sql
-- Project
CREATE TABLE projects (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  config        TEXT NOT NULL,    -- JSON: ProjectConfig
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Pipeline task state
CREATE TABLE task_states (
  project_id    TEXT NOT NULL REFERENCES projects(id),
  task_id       TEXT NOT NULL,
  step_id       TEXT NOT NULL,
  tier          TEXT NOT NULL,    -- core | enhance | framework
  agent_id      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  input         TEXT,            -- JSON: user input
  output        TEXT,            -- JSON: AgentOutput
  human_review  INTEGER DEFAULT 0,
  human_approved INTEGER,
  started_at    TEXT,
  completed_at  TEXT,
  PRIMARY KEY (project_id, task_id)
);

-- Knowledge base metadata
CREATE TABLE knowledge_bases (
  id            TEXT PRIMARY KEY,
  project_id    TEXT NOT NULL REFERENCES projects(id),
  document_count INTEGER DEFAULT 0,
  chunk_count   INTEGER DEFAULT 0,
  entity_count  INTEGER DEFAULT 0,
  relation_count INTEGER DEFAULT 0,
  built_at      TEXT,
  UNIQUE(project_id)
);

-- Ingested document tracking
CREATE TABLE documents (
  id            TEXT PRIMARY KEY,
  knowledge_base_id TEXT NOT NULL REFERENCES knowledge_bases(id),
  file_path     TEXT NOT NULL,
  display_title TEXT,
  source_type   TEXT NOT NULL,
  ingested_at   TEXT NOT NULL,
  chunk_count   INTEGER DEFAULT 0
);
```

---

## 8. Technical Stack

| Layer | Technology | Rationale |
|---|---|---|
| Runtime | **Bun** | Already using; fast, built-in SQLite, native TS |
| Language | **TypeScript** | Already using; Zod schemas throughout |
| HTTP | **Hono** | Bun-native, lightweight, fast, middleware support |
| WebSocket | **Bun native WS** | Built into Bun runtime |
| Database | **bun:sqlite** | Zero dependency, file-based, sufficient for project data |
| Frontend | **React + Vite** | JSX spec already in React; Vite for fast dev |
| State (FE) | **Zustand** | Lightweight, simple, good DX |
| Data fetching | **TanStack Query** | Caching, invalidation, optimistic updates |
| Validation | **Zod** | Already pervasive in codebase |
| LLM | **LLMProvider** (existing) | BYO: OpenAI, Anthropic, Ollama via fetch |
| Search | **Orama** (existing) | BM25, in-memory, fast |
| Styling | **Tailwind CSS** | Rapid UI dev, matches dark theme from JSX |

---

## 9. Estimation & Phasing

### Team assumption: 1 fullstack dev (Bun/TS/React)

```
Phase 0 ──── Phase 1 ──── Phase 2 ──── Phase 3 ──── Phase 4 ──── Phase 5
 1 week       3 weeks      2 weeks      2 weeks      3 weeks      1 week
Foundation   Core Agents   Pipeline     Frontend     Full Agents   Polish
                           + API        MVP          + Enhance
```

**Total: ~12 weeks (1 dev) · ~7 weeks (2 devs)**

---

### Phase 0: Foundation (Week 1)

**Goal:** Knowledge layer persistence + agent framework skeleton.

| Task | Effort | Deliverable |
|---|---|---|
| Knowledge persistence: save/load index + graph to disk | 2d | `KnowledgeTool.save(dir)` / `KnowledgeTool.load(dir)` |
| Project store (SQLite schema + CRUD) | 1d | `ProjectStore` class |
| Agent interface + registry + executor skeleton | 1d | `AgentSpec`, `AgentRegistry`, `executeAgentTask()` |
| Pipeline state machine (step dependencies, task status) | 1d | `PipelineEngine` class |

**Milestone:** Có thể tạo project, ingest docs, save state, load lại.

---

### Phase 1: Core Agents MVP (Weeks 2–4)

**Goal:** 4 agents chính hoạt động end-to-end qua CLI.

| Week | Agent | Tasks Covered | Effort |
|---|---|---|---|
| 2 | Market Intelligence Agent | top-chart, genre-map, gap-find | 4d |
| 2 | Game Deconstructor Agent | deconstruct (1 game) | 1d |
| 3 | Concept Ideation Agent | elevator, pillars | 3d |
| 3 | Core Loop Architect Agent | loop-flow, session, difficulty | 2d |
| 4 | Economy Simulator Agent | currency, source-sink, iap | 3d |
| 4 | Integration testing + prompt tuning | all agents | 2d |

Mỗi agent:
1. System prompt engineering (~0.5d)
2. `buildKnowledgeQueries` implementation (~0.25d)
3. Output Zod schema (~0.25d)
4. Testing with real knowledge base (~0.5d per agent)

**Milestone:** `bun run cli agent run market-intelligence top-chart --project myproject` → generates structured output with citations.

---

### Phase 2: Pipeline + API (Weeks 5–6)

**Goal:** HTTP API + WebSocket streaming + pipeline orchestration.

| Task | Effort | Deliverable |
|---|---|---|
| Hono HTTP server setup + project CRUD endpoints | 1d | REST API |
| Knowledge API endpoints (ingest, search, stats) | 1d | Knowledge endpoints |
| Pipeline API endpoints (run task, get state, approve) | 2d | Pipeline endpoints |
| WebSocket streaming (LLM output → client) | 1d | Real-time streaming |
| Pipeline engine: dependency resolution, auto-unlock steps | 1.5d | Working pipeline |
| API integration testing | 1.5d | E2E tests |
| CLI update: agent commands via API | 1d | Updated CLI |

**Milestone:** API server running. Postman/curl có thể tạo project → ingest → run agent → get output.

---

### Phase 3: Frontend MVP (Weeks 7–8)

**Goal:** Working web UI cho core flow.

| Task | Effort | Deliverable |
|---|---|---|
| Vite + React setup, routing, Tailwind config | 0.5d | Project scaffold |
| Project list + create screen | 1d | Project management |
| Pipeline dashboard (6 steps, status, flow bar) | 2d | Dashboard |
| Task detail view (input form + run + streaming output) | 2d | Task runner |
| Output viewer (markdown render + citations) | 1.5d | Output display |
| Knowledge explorer (search, entity browser) | 1.5d | Knowledge UI |
| WebSocket integration (real-time task updates) | 1.5d | Live updates |

**Milestone:** Full MVP: tạo project → ingest PDFs → chạy pipeline step by step → xem output trên web UI.

---

### Phase 4: Full Agents + Enhance (Weeks 9–11)

**Goal:** Tất cả agents + enhance tasks + framework tasks.

| Week | Focus | Tasks |
|---|---|---|
| 9 | Remaining core tasks | GDD Writer (gdd-structure, content-plan, feature-priority), Balance Testing (playtest), Pitch Builder (pitch-deck) |
| 10 | Enhance tasks (high impact) | blend, simulation, retention-hooks, meta-layers, whale-model, cross-validate |
| 11 | Framework tasks | MDA mapping, Schell lenses (top 10), Polaris prioritization, SSM debug |

Mỗi enhance/framework task = ~0.5–1d (prompt engineering + schema + testing)

**Milestone:** Tất cả 54 items (18 core + 18 enhance + 18 framework) hoạt động.

---

### Phase 5: Polish & Testing (Week 12)

| Task | Effort |
|---|---|
| GDD export (full markdown document) | 1d |
| Pitch deck export | 0.5d |
| Human review flow (approve/reject/re-run) | 1d |
| Error handling, retry logic, edge cases | 1d |
| Performance optimization (caching, parallel ingest) | 1d |
| Documentation | 0.5d |

**Milestone:** Production-ready v1.0.

---

## 10. Risk Assessment

| Risk | Severity | Probability | Mitigation |
|---|---|---|---|
| **LLM output quality inconsistent** | High | High | Structured output schemas (Zod validation), retry with feedback, few-shot examples in prompts |
| **LLM hallucination** (invents fake game data) | High | Medium | Citations required — output must reference knowledge base chunks. Add anti-hallucination instructions in prompts |
| **PDF parsing quality** (scanned/image-based PDFs) | Medium | Medium | Pre-validate PDFs; fallback to OCR (future); manual text upload alternative |
| **Token cost explosion** (5 PDFs × 8 agents × deep search) | Medium | High | Cache knowledge queries per project; avoid re-searching same query; use cheaper models for simple tasks |
| **Agent prompt drift** (prompts work for some games, not others) | Medium | Medium | Golden test set per agent; regression testing on prompt changes |
| **Scope creep** (economy simulation = complex) | Medium | High | Phase simulation as separate module; start with heuristic-based, Monte Carlo later |
| **Frontend complexity** (streaming + state + many screens) | Medium | Low | TanStack Query handles most complexity; start with minimal UI |
| **Knowledge base insufficient** (5 PDFs may not cover all topics) | Low | Medium | System works without knowledge base (graceful degradation); users can add own docs |

---

## 11. Cost Estimation (LLM)

Rough estimate per project run (all 54 tasks):

| Model | Prompt tokens (est.) | Completion tokens (est.) | Cost per project |
|---|---|---|---|
| GPT-4o-mini | ~200K | ~100K | ~$0.10 |
| GPT-4o | ~200K | ~100K | ~$2.50 |
| Claude Sonnet | ~200K | ~100K | ~$1.50 |
| Ollama (local) | ~200K | ~100K | $0 (compute only) |

Knowledge base build (graph extraction) — one-time per project:
- 5 PDFs ≈ 500–800 chunks ≈ 100–160 LLM calls ≈ ~$0.50 (GPT-4o-mini)

---

## 12. Open Questions

| # | Question | Impact | Decision needed by |
|---|---|---|---|
| 1 | **Persistence strategy**: SQLite enough? Or need a proper DB for collaboration? | Architecture | Phase 0 |
| 2 | **Multi-user support**: Single user per project? Or real-time collaboration? | Scope | Phase 2 |
| 3 | **LLM streaming**: Dùng OpenAI streaming API hay batch response? | UX | Phase 1 |
| 4 | **Economy simulation depth**: Heuristic-based vs actual Monte Carlo? | Effort (2d vs 2w) | Phase 4 |
| 5 | **Custom knowledge docs**: Users upload own game docs or chỉ dùng 5 PDFs có sẵn? | Feature | Phase 0 |
| 6 | **Localization**: UI tiếng Việt? Agent output tiếng Việt? | Scope | Phase 3 |
| 7 | **Export format**: Markdown? PDF? Google Docs? Notion? | Integration | Phase 5 |
| 8 | **Deployment target**: Local-only? Cloud? Desktop app (Tauri)? | Infrastructure | Phase 2 |
