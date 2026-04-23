# Game Design Kit

AI game design pipeline plugin for Claude Code. Concept → Prototype → Mockup (with component picker) → Wireframe Overview → Detail Docs.

## Install as Claude Code Plugin

### From ZIP (Recommended)

Download the latest `game-design-kit-*.zip` from [Releases](https://github.com/nguyentamdat/agent-concept/releases), then:

```bash
unzip game-design-kit-*.zip -d game-design-kit
cd game-design-kit
./install.sh
```

The plugin auto-loads in all Claude Code sessions after install.

To uninstall: `./uninstall.sh`

### From Source

```bash
git clone https://github.com/nguyentamdat/agent-concept.git game-design-kit
cd game-design-kit
./install.sh
```

## Quick Start

```
> /design-kit:create casual puzzle game with gardening theme for mobile
```

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- A POSIX shell (Linux/macOS native; on Windows use **Git Bash** or **WSL** — `install.sh` and the SessionStart hook require `bash` and `rsync`)

### Environment

The plugin talks to a remote Hindsight knowledge-base service. Set these in your shell environment *before* launching Claude Code:

```bash
export HINDSIGHT_API_KEY=your-key
# Optional — override if you host your own Hindsight instance:
export HINDSIGHT_MCP_URL=https://hindsight.example.com/mcp/game-knowledge/
```

If `HINDSIGHT_API_KEY` is unset, the knowledge-base tools (`recall`/`reflect`/`retain`) will be unavailable but the rest of the pipeline still works.

## Pipeline

| Command | What it does |
|---|---|
| `/design-kit:create <idea>` | Full pipeline: brainstorm → Concept Pitch → GCD → Prototype → Mockup → Wireframe → Detail Docs |
| `/design-kit:iterate <feedback>` | Re-enter pipeline with feedback, update any artifact |
| `/design-kit:status` | Show current project stage, artifacts, knowledge stats |
| `/design-kit:setup` | Check version, update plugin, or diagnose issues |

Design documents (`gcd.md`) are written in Vietnamese.

## Knowledge Base

The knowledge base is served via **Hindsight MCP** with a dedicated `game-knowledge` memory bank (483+ memories across 22 tags). No local files needed.

Sources include:
- The Art of Game Design (Schell)
- MDA: A Formal Approach (Hunicke, LeBlanc, Zubek)
- Hooked (Nir Eyal)
- A Theory of Fun (Raph Koster)
- Players Making Decisions (Zack Hiwiller)

## Agent Hierarchy

The plugin uses a 3-tier agent system:

| Tier | Agents | Role |
|------|--------|------|
| T1 Director | `creative-director` | Orchestrates pipeline, quality gates |
| T2 Producers | `concept-designer`, `code-prototyper`, `mockup-designer`, `wireframe-designer`, `document-writer`, `market-researcher` | Create artifacts |
| T3 Reviewers | `review-concept`, `ui-ux-reviewer`, `detail-doc-reviewer`, `feedback-interpreter` | Quality checks |

## Web App (Self-Hosted)

The Game Design Kit is also available as a self-hosted Next.js web application. The webapp ports the same 11-agent pipeline to a browser interface with support for any OpenAI-compatible LLM provider and configurable MCP servers.

See [`./webapp/README.md`](./webapp/README.md) for quickstart (local dev: `npm run dev`, Docker: `docker-compose up`).

Configuration guides:
- [`./webapp/SETUP.md`](./webapp/SETUP.md) — Provider configuration (OpenAI, Ollama, vLLM, LocalAI, LM Studio, OpenRouter) and MCP server setup (Hindsight, filesystem, Exa)
- [`./webapp/ARCHITECTURE.md`](./webapp/ARCHITECTURE.md) — System design, pipeline engine, agent factory, MCP manager, storage model

## License

MIT
