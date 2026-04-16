# Game Design Kit Claude Code Plugin

Game Design Kit is a Claude Code plugin for an AI game design pipeline: Concept → Prototype → Detail Docs + Wireframe.

It combines a local game design knowledge base, Concept Pitch + GCD design documents, and rapid HTML prototype generation in one workflow.

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
bun run setup
claude
```

`.claude/settings.json` and `.claude/.mcp.json` remain for local development when running directly inside this repository.

## Knowledge Base

The knowledge base contains 5 core PDF references:
- Schell (The Art of Game Design)
- MDA framework material
- Hooked
- A Theory of Fun
- Players Making Decisions

Use MCP knowledge tools to ground design decisions in these sources before proposing mechanics, economy, retention, or UX choices.

Game concept design follows 12 core theories (from Players Making Decisions + A Theory of Fun), including MDA, Problem Statements, Meaningful Decisions, Flow, Interest Curves, Learning Curves, Anatomy of a Choice, decision quality checks, Randomness, Milieu, and motivation frameworks.

## Standard Pipeline

Run project work in this order:
1. `/design-kit:concept`
2. `/design-kit:prototype`
3. `/design-kit:feedback`
4. `/design-kit:approve`

`/design-kit:create` runs the full pipeline: collect inputs → brainstorm → Concept Pitch → GCD → Prototype → Feedback Gate → Detail Docs + Wireframe.

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

- `.claude-plugin/plugin.json`: plugin metadata + MCP server config (uses `${CLAUDE_PLUGIN_ROOT}`)
- `.claude-plugin/marketplace.json`: marketplace declaration
- `commands/`: slash-command definitions
- `agents/`: role agents for each pipeline phase
- `skills/`: skill packages and references (includes `game-ui-ux-guide/`)
- `hooks/hooks.json`: plugin session hooks
- `settings.json`: plugin permission manifest

## Core Repository Directories

- `references/`: shared design templates and theory references (used by commands, agents, skills)
- `knowledge/`: source design books and references
- `projects/`: generated game projects and specs
- `templates/`: prototype templates and starting points
- `packages/knowledge-layer/`: knowledge layer TypeScript library
- `packages/mcp-server/`: MCP server implementation and tool handlers

## MCP Runtime / Test Commands

- Run tests: `npm test`
- Type-check: `npm run typecheck`
- Run MCP server: `npm run mcp`

## Operational Guidance

- Prefer MCP tool calls over shell commands for project logic.
- Cite source + page when claims depend on knowledge base material.
- Keep command outputs concise and actionable.
