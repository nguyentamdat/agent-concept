#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

# Check npm is available
if ! command -v npm &>/dev/null; then
  echo "[game-design-kit] npm not found. Install Node.js: https://nodejs.org/" >&2
  exit 0
fi

# Install all workspace dependencies if not present
if [ ! -d "$PLUGIN_ROOT/node_modules" ]; then
  cd "$PLUGIN_ROOT"
  npm install --production 2>/dev/null || npm install --production
fi

# Install MCP server dependencies if not present (in case hoisting missed them)
MCP_DIR="$PLUGIN_ROOT/packages/mcp-server"
if [ ! -d "$MCP_DIR/node_modules" ]; then
  cd "$MCP_DIR"
  npm install --production 2>/dev/null || npm install --production
fi
