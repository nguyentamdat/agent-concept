#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

# Warn (once per session) if HINDSIGHT_API_KEY is missing from the host env.
# Note: sourcing .env here does NOT help — the MCP server is launched by
# Claude Code from its own process tree, not from this hook's shell.
if [ -z "${HINDSIGHT_API_KEY:-}" ]; then
  echo "[game-design-kit] HINDSIGHT_API_KEY not set in shell environment." >&2
  echo "[game-design-kit] Knowledge tools (recall/reflect/retain) will be unavailable." >&2
  echo "[game-design-kit] Set it: export HINDSIGHT_API_KEY=your-key (in your shell rc)" >&2
fi
