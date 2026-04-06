#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="game-design-kit"
MARKETPLACE_NAME="local"
PLUGIN_KEY="${PLUGIN_NAME}@${MARKETPLACE_NAME}"

CLAUDE_DIR="$HOME/.claude"
PLUGINS_DIR="$CLAUDE_DIR/plugins"
CACHE_DIR="$PLUGINS_DIR/cache/$MARKETPLACE_NAME/$PLUGIN_NAME"
INSTALLED_JSON="$PLUGINS_DIR/installed_plugins.json"
SETTINGS_JSON="$CLAUDE_DIR/settings.json"

echo "=== Game Design Kit Uninstaller ==="
echo ""

if [ ! -d "$CACHE_DIR" ]; then
  echo "Plugin not found at $CACHE_DIR"
  echo "Nothing to uninstall."
  exit 0
fi

echo "Removing: $CACHE_DIR"
rm -rf "$CACHE_DIR"

if [ -f "$INSTALLED_JSON" ] && command -v jq &>/dev/null; then
  jq --arg key "$PLUGIN_KEY" 'del(.plugins[$key])' \
    "$INSTALLED_JSON" > "${INSTALLED_JSON}.tmp" \
    && mv "${INSTALLED_JSON}.tmp" "$INSTALLED_JSON"
elif [ -f "$INSTALLED_JSON" ] && command -v node &>/dev/null; then
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$INSTALLED_JSON', 'utf8'));
    delete (data.plugins || {})['$PLUGIN_KEY'];
    fs.writeFileSync('$INSTALLED_JSON', JSON.stringify(data, null, 2));
  "
fi

if [ -f "$SETTINGS_JSON" ] && command -v jq &>/dev/null; then
  jq --arg key "$PLUGIN_KEY" 'del(.enabledPlugins[$key])' \
    "$SETTINGS_JSON" > "${SETTINGS_JSON}.tmp" \
    && mv "${SETTINGS_JSON}.tmp" "$SETTINGS_JSON"
elif [ -f "$SETTINGS_JSON" ] && command -v node &>/dev/null; then
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$SETTINGS_JSON', 'utf8'));
    delete (data.enabledPlugins || {})['$PLUGIN_KEY'];
    fs.writeFileSync('$SETTINGS_JSON', JSON.stringify(data, null, 2));
  "
fi

echo ""
echo "=== Uninstalled successfully ==="
