# Game Design Kit Claude Code Plugin

Game Design Kit is a Claude Code plugin for an AI game design pipeline: Concept → Prototype → Detail Docs + Wireframe.

It combines a Hindsight-powered game design knowledge base, Concept Pitch + GCD design documents, and rapid HTML prototype generation in one workflow.

## Install / Run

### From ZIP

```bash
unzip game-design-kit-*.zip -d game-design-kit
cd game-design-kit
./install.sh
```

### From Source

```bash
git clone https://github.com/nguyentamdat/agent-concept.git game-design-kit
cd game-design-kit
./install.sh
```

### Local development (standalone in this repo)

```bash
claude
```

`.claude/settings.json` and `.claude/.mcp.json` remain for local development when running directly inside this repository.

## Knowledge Base

The knowledge base is served via **Hindsight MCP** with a dedicated `game-knowledge` memory bank (483+ memories, 22 tags). No local PDF files are needed.

Use Hindsight tools (`recall`, `reflect`) to ground design decisions in game design theory before proposing mechanics, economy, retention, or UX choices.

Game concept design follows 12 core theories (from Players Making Decisions + A Theory of Fun), including MDA, Problem Statements, Meaningful Decisions, Flow, Interest Curves, Learning Curves, Anatomy of a Choice, decision quality checks, Randomness, Milieu, and motivation frameworks.

## Standard Pipeline

| Command | Purpose |
|---------|---------|
| `/design-kit:create <idea>` | Full pipeline: brainstorm → Concept Pitch → GCD → Prototype → Detail Docs + Wireframe |
| `/design-kit:iterate <feedback>` | Re-enter pipeline with feedback, update any artifact |
| `/design-kit:status` | Show current project stage, artifacts, knowledge stats |
| `/design-kit:setup` | Check plugin version or update to latest (`setup update`) |
| `/design-kit:doctor` | Diagnose plugin structure, MCP env vars, MCP connectivity, version consistency |
| `/design-kit:mcp-setup` | Interactively configure MCP server env vars (writes to `~/.claude/settings.json` `env`) |

`/design-kit:doctor` is the entry point when something looks broken. If it reports missing MCP env vars, run `/design-kit:mcp-setup`; if the plugin is outdated, run `/design-kit:setup update`.

Design documents (`gcd.md`) must be written in Vietnamese.

## Design Document Conventions

- Primary design reference is the Concept Pitch (`concept-pitch.md`) + GCD (`gcd.md`).
- Maintain internal consistency across pillars, mechanics, progression, and scope.

## Prototype Conventions

- Prototype output is a single `index.html` per project.
- Renderer comes from Concept Pitch / GCD:
  - `2d`: Canvas API
  - `3d`: Three.js via CDN
- Use vanilla JavaScript (no framework/runtime dependency).
- Use geometric placeholder shapes and simple UI treatment.
- Keep prototype implementation concise and practical.

## Plugin Structure

- `.claude-plugin/plugin.json`: plugin metadata + Hindsight MCP config
- `.claude-plugin/marketplace.json`: marketplace declaration
- `commands/`: slash-command definitions
- `agents/`: role agents for each pipeline phase
- `skills/`: skill packages and references (includes `game-ui-ux-guide/`)
- `hooks/hooks.json`: plugin session hooks
- `settings.json`: plugin permission manifest

## Core Repository Directories

- `references/`: shared design templates and theory references (used by commands, agents, skills)
- `projects/`: generated game projects and specs

## Operational Guidance

- Use Hindsight MCP (`recall`, `reflect`) for knowledge base queries.
- Cite source + page when claims depend on knowledge base material.
- Keep command outputs concise and actionable.
