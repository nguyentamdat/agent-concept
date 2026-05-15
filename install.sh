#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="game-design-kit"
MARKETPLACE_NAME="nguyentamdat"
PLUGIN_KEY="${PLUGIN_NAME}@${MARKETPLACE_NAME}"

# Read version from plugin.json
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_VERSION=$(grep '"version"' "$SCRIPT_DIR/.claude-plugin/plugin.json" | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')

CLAUDE_DIR="$HOME/.claude"
PLUGINS_DIR="$CLAUDE_DIR/plugins"
CACHE_DIR="$PLUGINS_DIR/cache/$MARKETPLACE_NAME/$PLUGIN_NAME/$PLUGIN_VERSION"
INSTALLED_JSON="$PLUGINS_DIR/installed_plugins.json"
SETTINGS_JSON="$CLAUDE_DIR/settings.json"
USER_CLAUDE_JSON="$HOME/.claude.json"

echo "=== Game Design Kit Installer ==="
echo ""
echo "Plugin:  $PLUGIN_NAME v$PLUGIN_VERSION"
echo "Target:  $CACHE_DIR"
echo ""

# Create target directory
mkdir -p "$CACHE_DIR"

# Copy plugin files (exclude dev/test artifacts)
echo "[1/4] Copying plugin files..."
rsync -a --delete \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='.claude' \
  --exclude='.omx' \
  --exclude='.sisyphus' \
  --exclude='.opencode' \
  --exclude='.omc' \
  --exclude='node_modules' \
  --exclude='apps' \
  --exclude='tests' \
  --exclude='projects' \
  --exclude='art-skill' \
  --exclude='docs' \
  --exclude='install.sh' \
  --exclude='uninstall.sh' \
  --exclude='.env' \
  "$SCRIPT_DIR/" "$CACHE_DIR/"

# Set up Hindsight API key
echo "[2/4] Configuring knowledge base..."
mkdir -p "$CLAUDE_DIR"
hindsight_key_configured=0

cleanup_legacy_hindsight_mcp() {
  USER_CLAUDE_JSON="$USER_CLAUDE_JSON" node <<'NODE' 2>/dev/null || true
const fs = require('fs');
const p = process.env.USER_CLAUDE_JSON;
if (!p || !fs.existsSync(p)) process.exit(0);
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
if (data.mcpServers && Object.prototype.hasOwnProperty.call(data.mcpServers, 'hindsight')) {
  delete data.mcpServers.hindsight;
  if (Object.keys(data.mcpServers).length === 0) delete data.mcpServers;
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  console.log('  Removed legacy user-level mcpServers.hindsight from ~/.claude.json; plugin manifest now owns this MCP config.');
}
NODE
}

write_hindsight_env() {
  NEW_HINDSIGHT_API_KEY="$1" NEW_HINDSIGHT_MCP_URL="${HINDSIGHT_MCP_URL:-https://hindsight.zingplay.dev/mcp/game-knowledge/}" node -e "
    const fs = require('fs');
    const p = '$SETTINGS_JSON';
    const data = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
    data.env = data.env || {};
    data.env.HINDSIGHT_API_KEY = process.env.NEW_HINDSIGHT_API_KEY;
    data.env.HINDSIGHT_MCP_URL = process.env.NEW_HINDSIGHT_MCP_URL;
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  "
}

cleanup_legacy_hindsight_mcp

if [ -n "${HINDSIGHT_API_KEY:-}" ]; then
  write_hindsight_env "$HINDSIGHT_API_KEY"
  echo "  Hindsight API key saved to ~/.claude/settings.json env from HINDSIGHT_API_KEY."
  hindsight_key_configured=1
elif node -e "
  const fs = require('fs');
  const p = '$SETTINGS_JSON';
  if (!fs.existsSync(p)) process.exit(1);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  process.exit(data.env && data.env.HINDSIGHT_API_KEY ? 0 : 1);
" 2>/dev/null; then
  echo "  Hindsight API key already configured."
  hindsight_key_configured=1
else
  echo ""
  echo "  The knowledge base requires a Hindsight API key."
  echo "  Server: https://hindsight.zingplay.dev/"
  echo "  The key is stored in ~/.claude/settings.json env so Claude Code can pass it to the MCP server."
  echo ""
  if [ -t 0 ]; then
    read -rp "  Enter your Hindsight API key (or press Enter to skip): " api_key
    if [ -n "$api_key" ]; then
      write_hindsight_env "$api_key"
      echo "  API key saved to ~/.claude/settings.json env."
      hindsight_key_configured=1
    else
      echo "  Skipped. Set it later with /design-kit:mcp-setup or export HINDSIGHT_API_KEY=your-key before launching Claude Code."
    fi
  else
    echo "  Non-interactive mode. Set it later with /design-kit:mcp-setup or:"
    echo "    export HINDSIGHT_API_KEY=your-key"
  fi
fi

# Update installed_plugins.json
echo "[3/4] Registering plugin..."
mkdir -p "$PLUGINS_DIR"

INSTALL_ENTRY=$(cat <<EOF
{
  "scope": "user",
  "installPath": "$CACHE_DIR",
  "version": "$PLUGIN_VERSION",
  "installedAt": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
}
EOF
)

if [ -f "$INSTALLED_JSON" ]; then
  if command -v jq &>/dev/null; then
    jq --arg key "$PLUGIN_KEY" --argjson entry "[$INSTALL_ENTRY]" \
      '.plugins[$key] = $entry' "$INSTALLED_JSON" > "${INSTALLED_JSON}.tmp" \
      && mv "${INSTALLED_JSON}.tmp" "$INSTALLED_JSON"
  else
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('$INSTALLED_JSON', 'utf8'));
      data.plugins = data.plugins || {};
      data.plugins['$PLUGIN_KEY'] = [$INSTALL_ENTRY];
      fs.writeFileSync('$INSTALLED_JSON', JSON.stringify(data, null, 2));
    "
  fi
else
  cat > "$INSTALLED_JSON" <<EOF
{
  "version": 2,
  "plugins": {
    "$PLUGIN_KEY": [$INSTALL_ENTRY]
  }
}
EOF
fi

# Update settings.json — enable the plugin
echo "[4/4] Enabling plugin..."
mkdir -p "$CLAUDE_DIR"

if [ -f "$SETTINGS_JSON" ]; then
  if command -v jq &>/dev/null; then
    jq --arg key "$PLUGIN_KEY" '.enabledPlugins[$key] = true' \
      "$SETTINGS_JSON" > "${SETTINGS_JSON}.tmp" \
      && mv "${SETTINGS_JSON}.tmp" "$SETTINGS_JSON"
  else
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('$SETTINGS_JSON', 'utf8'));
      data.enabledPlugins = data.enabledPlugins || {};
      data.enabledPlugins['$PLUGIN_KEY'] = true;
      fs.writeFileSync('$SETTINGS_JSON', JSON.stringify(data, null, 2));
    "
  fi
else
  cat > "$SETTINGS_JSON" <<EOF
{
  "enabledPlugins": {
    "$PLUGIN_KEY": true
  }
}
EOF
fi

echo ""
echo "=== Installed successfully ==="
echo ""
echo "The plugin will auto-load in all new Claude Code sessions."
echo "Run 'claude' to start using it."
echo ""
if [ "$hindsight_key_configured" -ne 1 ]; then
  echo "  Remember to set your Hindsight API key:"
  echo "  /design-kit:mcp-setup"
  echo "  # or: export HINDSIGHT_API_KEY=your-key before launching Claude Code"
  echo ""
fi
