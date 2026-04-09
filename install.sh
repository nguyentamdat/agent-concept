#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="game-design-kit"
MARKETPLACE_NAME="local"
PLUGIN_KEY="${PLUGIN_NAME}@${MARKETPLACE_NAME}"

# Read version from plugin.json
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_VERSION=$(grep '"version"' "$SCRIPT_DIR/.claude-plugin/plugin.json" | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')

CLAUDE_DIR="$HOME/.claude"
PLUGINS_DIR="$CLAUDE_DIR/plugins"
CACHE_DIR="$PLUGINS_DIR/cache/$MARKETPLACE_NAME/$PLUGIN_NAME/$PLUGIN_VERSION"
INSTALLED_JSON="$PLUGINS_DIR/installed_plugins.json"
SETTINGS_JSON="$CLAUDE_DIR/settings.json"

echo "=== Game Design Kit Installer ==="
echo ""
echo "Plugin:  $PLUGIN_NAME v$PLUGIN_VERSION"
echo "Target:  $CACHE_DIR"
echo ""

# Check node
if ! command -v node &>/dev/null; then
  echo "Error: Node.js is required but not installed."
  echo "Install it: https://nodejs.org/"
  exit 1
fi

# Create target directory
mkdir -p "$CACHE_DIR"

# Copy plugin files (exclude dev/test artifacts)
echo "[1/5] Copying plugin files..."
rsync -a --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='.sisyphus' \
  --exclude='.knowledge-cache' \
  --exclude='projects' \
  --exclude='knowledge/*.pdf' \
  --exclude='*.test.ts' \
  --exclude='packages/knowledge-layer/src/test-utils' \
  --exclude='packages/knowledge-layer/src/e2e' \
  --exclude='install.sh' \
  --exclude='uninstall.sh' \
  --exclude='.env' \
  "$SCRIPT_DIR/" "$CACHE_DIR/"

# Install dependencies
echo "[2/5] Installing dependencies..."
(cd "$CACHE_DIR" && npm install --production 2>/dev/null)
(cd "$CACHE_DIR/packages/mcp-server" && npm install --production 2>/dev/null)

# Set up Hindsight API key
echo "[3/5] Configuring knowledge base..."
ENV_FILE="$CACHE_DIR/.env"
if [ -f "$ENV_FILE" ] && grep -q 'HINDSIGHT_API_KEY=' "$ENV_FILE" 2>/dev/null; then
  echo "  Hindsight API key already configured."
else
  echo ""
  echo "  The knowledge base requires a Hindsight API key."
  echo "  Server: https://hindsight.zingplay.dev/"
  echo ""
  if [ -t 0 ]; then
    read -rp "  Enter your Hindsight API key (or press Enter to skip): " api_key
    if [ -n "$api_key" ]; then
      echo "HINDSIGHT_API_KEY=$api_key" > "$ENV_FILE"
      echo "  ✅ API key saved."
    else
      echo "  Skipped. You can set it later in: $CACHE_DIR/.env"
    fi
  else
    echo "  Non-interactive mode. Set it later:"
    echo "    echo 'HINDSIGHT_API_KEY=your-key' > $CACHE_DIR/.env"
  fi
fi

# Update installed_plugins.json
echo "[4/5] Registering plugin..."
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
  # File exists — check if we have jq
  if command -v jq &>/dev/null; then
    jq --arg key "$PLUGIN_KEY" --argjson entry "[$INSTALL_ENTRY]" \
      '.plugins[$key] = $entry' "$INSTALLED_JSON" > "${INSTALLED_JSON}.tmp" \
      && mv "${INSTALLED_JSON}.tmp" "$INSTALLED_JSON"
  else
    # Fallback: use node to manipulate JSON
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('$INSTALLED_JSON', 'utf8'));
      data.plugins = data.plugins || {};
      data.plugins['$PLUGIN_KEY'] = [$INSTALL_ENTRY];
      fs.writeFileSync('$INSTALLED_JSON', JSON.stringify(data, null, 2));
    "
  fi
else
  # Create new file
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
echo "[5/5] Enabling plugin..."
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
if [ -z "${api_key:-}" ] && ! grep -q 'HINDSIGHT_API_KEY=' "$CACHE_DIR/.env" 2>/dev/null; then
  echo "⚠️  Remember to set your Hindsight API key:"
  echo "  echo 'HINDSIGHT_API_KEY=your-key' > $CACHE_DIR/.env"
  echo ""
fi
echo "To add knowledge base PDFs, place them in:"
echo "  $CACHE_DIR/knowledge/"
echo "Then run: cd $CACHE_DIR && npm run setup:knowledge"
