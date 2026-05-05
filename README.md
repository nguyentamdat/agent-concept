# Game Design Kit

AI game design pipeline plugin for Claude Code. Prototype → Lightweight GCD → Mockup (with component picker) → Wireframe Overview → Detail Docs.

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
| `/design-kit:create <idea>` | Prototype-first pipeline: brainstorm → playable HTML5 prototype + lightweight Vietnamese GCD (via the `game-prototype` skill) → mockup → wireframe → detail docs |
| `/design-kit:iterate <feedback>` | Re-enter the pipeline with feedback. Playable / mechanic / balance feedback writes a new versioned `Game Demo/[slug]-vN+1.html`; mockup, wireframe, and doc-only feedback route to the matching producer |
| `/design-kit:status` | Show current project stage and artifacts (Game Demo prototypes, lightweight GCD, mockup, wireframe, detail docs) |
| `/design-kit:setup` | Check version, update plugin, or diagnose issues |

The lightweight GCD (`Game Demo/[slug]-GCD.md`) is written in Vietnamese.

## Knowledge Base

The knowledge base is served via **Hindsight MCP** with a dedicated `game-knowledge` memory bank (483+ memories across 22 tags). No local files needed.

Sources include:
- The Art of Game Design (Schell)
- MDA: A Formal Approach (Hunicke, LeBlanc, Zubek)
- Hooked (Nir Eyal)
- A Theory of Fun (Raph Koster)
- Players Making Decisions (Zack Hiwiller)

## Agent Hierarchy

The plugin uses a 3-tier agent system. The `game-prototype` skill owns the early pipeline (Phase 1 brainstorm → Phase 2 versioned playable prototype → Phase 3 lightweight GCD); downstream T2 producers consume those approved outputs.

| Tier | Agents / Skills | Role |
|------|-----------------|------|
| T1 Director | `creative-director` | Orchestrates pipeline, quality gates |
| Early-pipeline skill | `game-prototype` (`skills/game-prototype/SKILL.md`) | Concept brainstorm + playable prototype + lightweight GCD |
| T2 Producers | `mockup-designer`, `wireframe-designer`, `document-writer`, `market-researcher` | Create downstream artifacts from approved prototype + lightweight GCD |
| T3 Reviewers | `ui-ux-reviewer`, `detail-doc-reviewer`, `feedback-interpreter` | Quality checks on downstream artifacts and feedback routing |
| Legacy / manual | `concept-designer`, `code-prototyper`, `review-concept` (agents); `game-concept-design` (skill, archived under `skills/_deprecated/`) | Preserved for legacy/manual support; not part of the active `/design-kit:create` route |

## License

MIT
