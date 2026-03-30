# Game Design Kit Claude Code Plugin

Game Design Kit is a Claude Code plugin for an AI game design pipeline: Concept → Prototype → Feedback → Documents.

It combines a local game design knowledge base, structured game specs, and rapid HTML prototype generation in one workflow.

## Install / Run

### Marketplace install

```bash
/plugin marketplace add YOUR_GITHUB_USER/game-design-kit
/plugin install game-design-kit@game-design-kit
```

### Direct local plugin directory

```bash
git clone <repo-url> game-design-kit
claude --plugin-dir ./game-design-kit
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
1. `/project:concept`
2. `/project:prototype`
3. `/project:feedback`
4. `/project:approve`

`/project:concept` runs in 2 phases:
- Phase A: collect inputs → brainstorm concept variants → user picks one → generate outline → wait for approval
- Phase B: generate `gcd.md` + `gcd-gameplay.md` + `spec.yaml`

Design documents from concept phase (`gcd.md`, `gcd-gameplay.md`) must be written in Vietnamese.

## Spec Conventions

- Primary project spec format is YAML (`spec.yaml`).
- Validate specs after every edit with `spec_validate`.
- Bump spec version whenever behavior or design intent changes (`spec_bump_version`).
- Maintain internal consistency across pillars, mechanics, progression, and scope.

## Prototype Conventions

- Prototype output is a single `index.html` per project.
- Renderer comes from `spec.yaml` (`prototypeScope.renderer`):
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
- `skills/`: skill packages and references
- `hooks/hooks.json`: plugin session hooks
- `settings.json`: plugin permission manifest

## Core Repository Directories

- `references/`: shared design templates and theory references (used by commands, agents, skills)
- `knowledge/`: source design books and references
- `projects/`: generated game projects and specs
- `templates/`: prototype templates and starting points
- `mcp-server/`: MCP server implementation and tool handlers

## MCP Runtime / Test Commands

- Run tests: `bun test`
- Type-check: `bun run typecheck`
- Run MCP server: `bun run mcp-server/src/server.ts`

## Operational Guidance

- Prefer MCP tool calls over shell commands for project logic.
- Cite source + page when claims depend on knowledge base material.
- Keep command outputs concise and actionable.
