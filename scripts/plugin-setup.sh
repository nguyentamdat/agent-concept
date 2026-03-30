#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
PLUGIN_DATA="${CLAUDE_PLUGIN_DATA:-$PLUGIN_ROOT}"

# Install dependencies if needed
if ! diff -q "$PLUGIN_ROOT/package.json" "$PLUGIN_DATA/package.json" >/dev/null 2>&1; then
  cd "$PLUGIN_DATA"
  cp "$PLUGIN_ROOT/package.json" .
  cp "$PLUGIN_ROOT/bun.lock" . 2>/dev/null || true
  bun install --frozen-lockfile 2>/dev/null || bun install
fi

# Ensure mcp-server dependencies are installed
if ! diff -q "$PLUGIN_ROOT/mcp-server/package.json" "$PLUGIN_DATA/mcp-server-package.json" >/dev/null 2>&1; then
  mkdir -p "$PLUGIN_DATA/mcp-server"
  cp "$PLUGIN_ROOT/mcp-server/package.json" "$PLUGIN_DATA/mcp-server-package.json"
  cd "$PLUGIN_DATA/mcp-server"
  cp "$PLUGIN_ROOT/mcp-server/package.json" .
  bun install 2>/dev/null || true
fi
