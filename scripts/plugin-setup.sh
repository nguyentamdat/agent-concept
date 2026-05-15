#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

# Warn (once per session) if HINDSIGHT_API_KEY is missing from both the host env
# and Claude Code settings env. Note: sourcing a plugin-local .env here does NOT
# help — the MCP server is launched by Claude Code from its own process tree.
if [ -z "${HINDSIGHT_API_KEY:-}" ] && ! node -e '
  const fs = require("fs");
  const p = `${process.env.HOME}/.claude/settings.json`;
  if (!fs.existsSync(p)) process.exit(1);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  process.exit(data.env && data.env.HINDSIGHT_API_KEY ? 0 : 1);
' 2>/dev/null; then
  echo "[game-design-kit] HINDSIGHT_API_KEY not set in shell environment or ~/.claude/settings.json env." >&2
  echo "[game-design-kit] Knowledge tools (recall/reflect) will be unavailable." >&2
  echo "[game-design-kit] Set it with /design-kit:mcp-setup or export HINDSIGHT_API_KEY=your-key before launching Claude Code." >&2
fi
