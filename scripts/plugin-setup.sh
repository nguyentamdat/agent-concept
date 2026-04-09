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

# --- Hindsight API key setup ---
ENV_FILE="$PLUGIN_ROOT/.env"

# Load .env if exists
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# If still no key, prompt user to enter it
if [ -z "${HINDSIGHT_API_KEY:-}" ]; then
  echo "" >&2
  echo "[game-design-kit] ⚠️  HINDSIGHT_API_KEY not set." >&2
  echo "[game-design-kit] Knowledge base tools (recall/reflect/retain) require this key." >&2
  echo "" >&2
  # Check if running in interactive terminal
  if [ -t 0 ]; then
    read -rp "[game-design-kit] Enter your Hindsight API key (or press Enter to skip): " api_key
    if [ -n "$api_key" ]; then
      echo "HINDSIGHT_API_KEY=$api_key" > "$ENV_FILE"
      echo "[game-design-kit] ✅ API key saved to .env (gitignored)" >&2
      export HINDSIGHT_API_KEY="$api_key"
    else
      echo "[game-design-kit] Skipped. Set it later: export HINDSIGHT_API_KEY=your-key" >&2
    fi
  else
    echo "[game-design-kit] Set it: export HINDSIGHT_API_KEY=your-key" >&2
    echo "[game-design-kit] Or copy .env.example to .env and fill in your key." >&2
  fi
fi
