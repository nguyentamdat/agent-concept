#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
PLUGIN_DATA="${CLAUDE_PLUGIN_DATA:-$PLUGIN_ROOT}"

# Auto-detect package manager (prefer bun > npm)
if command -v bun &>/dev/null; then
  PM="bun"
elif command -v npm &>/dev/null; then
  PM="npm"
else
  echo "[game-design-kit] No supported package manager found (bun, npm). Skipping setup." >&2
  exit 0
fi

# Install root dependencies if needed
if ! diff -q "$PLUGIN_ROOT/package.json" "$PLUGIN_DATA/package.json" >/dev/null 2>&1; then
  cd "$PLUGIN_DATA"
  cp "$PLUGIN_ROOT/package.json" .
  for lockfile in bun.lock bun.lockb package-lock.json; do
    [ -f "$PLUGIN_ROOT/$lockfile" ] && cp "$PLUGIN_ROOT/$lockfile" . 2>/dev/null || true
  done
  $PM install 2>/dev/null || $PM install
fi

# Ensure mcp-server dependencies are installed
if ! diff -q "$PLUGIN_ROOT/mcp-server/package.json" "$PLUGIN_DATA/mcp-server-package.json" >/dev/null 2>&1; then
  mkdir -p "$PLUGIN_DATA/mcp-server"
  cp "$PLUGIN_ROOT/mcp-server/package.json" "$PLUGIN_DATA/mcp-server-package.json"
  cd "$PLUGIN_DATA/mcp-server"
  cp "$PLUGIN_ROOT/mcp-server/package.json" .
  $PM install 2>/dev/null || true
fi
