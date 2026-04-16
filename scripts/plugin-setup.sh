#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

# Check npm is available
if ! command -v npm &>/dev/null; then
  echo "[game-design-kit] npm not found. Install Node.js: https://nodejs.org/" >&2
  exit 0
fi

# Install workspace dependencies only if node_modules is missing.
# Heavy npm install runs once; subsequent sessions are a no-op.
if [ ! -d "$PLUGIN_ROOT/node_modules" ]; then
  echo "[game-design-kit] Installing dependencies (first run)..." >&2
  cd "$PLUGIN_ROOT"
  npm install --production 2>/dev/null || npm install --production
fi

# Warn (once per session) if HINDSIGHT_API_KEY is missing from the host env.
# Note: sourcing .env here does NOT help — the MCP server is launched by
# Claude Code from its own process tree, not from this hook's shell.
if [ -z "${HINDSIGHT_API_KEY:-}" ]; then
  echo "[game-design-kit] HINDSIGHT_API_KEY not set in shell environment." >&2
  echo "[game-design-kit] Knowledge tools (recall/reflect/retain) will be unavailable." >&2
  echo "[game-design-kit] Set it: export HINDSIGHT_API_KEY=your-key (in your shell rc)" >&2
fi
