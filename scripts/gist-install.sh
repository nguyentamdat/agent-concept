#!/usr/bin/env bash
set -euo pipefail

# Game Design Kit — one-line installer for Claude Code & Claude Chat App
# Usage: curl -fsSL https://gist.githubusercontent.com/nguyentamdat/da04f07bee67718d5c293d5e29a4790b/raw/install.sh | bash
#
# Supports: macOS, Linux, Windows (Git Bash / WSL)
# Works with: Claude Code CLI, Claude Desktop App (Chat)

REPO="nguyentamdat/agent-concept"
REPO_URL="https://github.com/${REPO}.git"
PLUGIN_NAME="game-design-kit"
MARKETPLACE_NAME="nguyentamdat"
PLUGIN_KEY="${PLUGIN_NAME}@${MARKETPLACE_NAME}"

# ─── Detect Claude config directory ──────────────────────────────────────────
detect_claude_dir() {
  if [ -d "$HOME/.claude" ]; then
    echo "$HOME/.claude"
    return
  fi
  local mac_dir="$HOME/Library/Application Support/Claude"
  if [ -d "$mac_dir" ]; then
    echo "$mac_dir"
    return
  fi
  echo "$HOME/.claude"
}

CLAUDE_DIR="$(detect_claude_dir)"
PLUGINS_DIR="$CLAUDE_DIR/plugins"
INSTALLED_JSON="$PLUGINS_DIR/installed_plugins.json"
SETTINGS_JSON="$CLAUDE_DIR/settings.json"
USER_CLAUDE_JSON="$HOME/.claude.json"
MARKETPLACES_DIR="$PLUGINS_DIR/marketplaces"
MARKETPLACE_DIR="$MARKETPLACES_DIR/$MARKETPLACE_NAME"
KNOWN_MARKETPLACES_JSON="$PLUGINS_DIR/known_marketplaces.json"

# ─── Helpers ─────────────────────────────────────────────────────────────────
info()  { printf "\033[1;34m→\033[0m %s\n" "$1"; }
ok()    { printf "\033[1;32m✓\033[0m %s\n" "$1"; }
warn()  { printf "\033[1;33m!\033[0m %s\n" "$1"; }
err()   { printf "\033[1;31m✗\033[0m %s\n" "$1" >&2; exit 1; }

# ─── Preflight checks ───────────────────────────────────────────────────────
command -v git &>/dev/null  || err "git is required. Install: https://git-scm.com"
command -v node &>/dev/null || err "Node.js is required. Install: https://nodejs.org"

# ─── Fetch latest version from repo ─────────────────────────────────────────
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# On Git Bash / MSYS2 (Windows), paths like /tmp/... don't work with Node.js.
# Convert to mixed-mode Windows paths (C:/Users/...) when cygpath is available.
_node_path() {
  if command -v cygpath &>/dev/null; then
    cygpath -m "$1"
  else
    echo "$1"
  fi
}

cleanup_legacy_hindsight_mcp() {
  USER_CLAUDE_JSON="$(_node_path "$USER_CLAUDE_JSON")" node <<'NODE' 2>/dev/null || true
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

settings_has_hindsight_key() {
  NODE_SETTINGS_JSON="$(_node_path "$SETTINGS_JSON")" node <<'NODE' 2>/dev/null
const fs = require('fs');
const p = process.env.NODE_SETTINGS_JSON;
if (!p || !fs.existsSync(p)) process.exit(1);
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
process.exit(data.env && data.env.HINDSIGHT_API_KEY ? 0 : 1);
NODE
}

write_hindsight_settings() {
  local key="$1"
  local url="${2:-https://hindsight.zingplay.dev/mcp/game-knowledge/}"
  NODE_SETTINGS_JSON="$(_node_path "$SETTINGS_JSON")" NEW_HINDSIGHT_API_KEY="$key" NEW_HINDSIGHT_MCP_URL="$url" node <<'NODE'
const fs = require('fs');
const path = require('path');
const p = process.env.NODE_SETTINGS_JSON;
const data = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
data.env = data.env || {};
data.env.HINDSIGHT_API_KEY = process.env.NEW_HINDSIGHT_API_KEY;
data.env.HINDSIGHT_MCP_URL = process.env.NEW_HINDSIGHT_MCP_URL;
fs.mkdirSync(path.dirname(p), { recursive: true });
fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
NODE
}

info "Fetching latest version from ${REPO}..."
if ! git clone --depth 1 --single-branch "$REPO_URL" "$TMP_DIR/repo" 2>/dev/null; then
  err "Failed to clone repository. Check network and try again."
fi

# Read version from plugin.json
PLUGIN_JSON="$TMP_DIR/repo/.claude-plugin/plugin.json"
if [ ! -f "$PLUGIN_JSON" ]; then
  err "plugin.json not found in cloned repo. Repository may be corrupted."
fi
NODE_PLUGIN_JSON="$(_node_path "$PLUGIN_JSON")"
PLUGIN_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$NODE_PLUGIN_JSON','utf8')).version)")
CACHE_DIR="$PLUGINS_DIR/cache/${MARKETPLACE_NAME}/${PLUGIN_NAME}/${PLUGIN_VERSION}"

# ─── Check if update needed ─────────────────────────────────────────────────
CURRENT_VERSION=""
if [ -f "$INSTALLED_JSON" ]; then
  NODE_INSTALLED_JSON="$(_node_path "$INSTALLED_JSON")"
  CURRENT_VERSION=$(node -e "
    try {
      const d = JSON.parse(require('fs').readFileSync('$NODE_INSTALLED_JSON','utf8'));
      const e = d.plugins?.['$PLUGIN_KEY'];
      if (e && e[0]) console.log(e[0].version || '');
    } catch(e) {}
  " 2>/dev/null || true)
fi

if [ "$CURRENT_VERSION" = "$PLUGIN_VERSION" ]; then
  warn "Version ${PLUGIN_VERSION} already registered. Updating files..."
else
  if [ -n "$CURRENT_VERSION" ]; then
    info "Updating ${CURRENT_VERSION} → ${PLUGIN_VERSION}"
  else
    info "Installing ${PLUGIN_NAME} v${PLUGIN_VERSION}"
  fi
fi

# ─── Copy plugin files ──────────────────────────────────────────────────────
info "Installing to ${CACHE_DIR}..."
mkdir -p "$CACHE_DIR"

if command -v rsync &>/dev/null; then
  rsync -a --delete \
    --exclude='.git' \
    --exclude='.github' \
    --exclude='.sisyphus' \
    --exclude='.opencode' \
    --exclude='.omc' \
    --exclude='projects' \
    --exclude='apps' \
    --exclude='docs/archive' \
    --exclude='art-skill' \
    --exclude='*.zip' \
    --exclude='*.tar.gz' \
    --exclude='.env' \
    "$TMP_DIR/repo/" "$CACHE_DIR/"
else
  rm -rf "${CACHE_DIR:?}/"*
  cd "$TMP_DIR/repo"
  find . -not -path './.git/*' \
         -not -path './.github/*' \
         -not -path './.sisyphus/*' \
         -not -path './.opencode/*' \
         -not -path './.omc/*' \
         -not -path './projects/*' \
         -not -path './apps/*' \
         -not -path './docs/archive/*' \
         -not -path './art-skill/*' \
         -not -name '*.zip' \
         -not -name '*.tar.gz' \
         -not -name '.env' \
         -print0 | while IFS= read -r -d '' file; do
    if [ -d "$file" ]; then
      mkdir -p "$CACHE_DIR/$file"
    else
      cp "$file" "$CACHE_DIR/$file" 2>/dev/null || true
    fi
  done
fi

# ─── Install marketplace (enables plugin resolution) ────────────────────────
info "Installing marketplace ${MARKETPLACE_NAME}..."
mkdir -p "$MARKETPLACE_DIR"

if command -v rsync &>/dev/null; then
  rsync -a --delete \
    --exclude='.git' \
    --exclude='.github' \
    --exclude='.sisyphus' \
    --exclude='.opencode' \
    --exclude='.omc' \
    --exclude='projects' \
    --exclude='apps' \
    --exclude='docs/archive' \
    --exclude='art-skill' \
    --exclude='*.zip' \
    --exclude='*.tar.gz' \
    --exclude='.env' \
    "$TMP_DIR/repo/" "$MARKETPLACE_DIR/"
else
  mkdir -p "$MARKETPLACE_DIR/.claude-plugin"
  cp -r "$TMP_DIR/repo/.claude-plugin/"* "$MARKETPLACE_DIR/.claude-plugin/"
fi

NOW="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
MARKETPLACE_ENTRY="{\"source\":{\"source\":\"git\",\"url\":\"${REPO_URL}\"},\"installLocation\":\"${MARKETPLACE_DIR}\",\"lastUpdated\":\"${NOW}\"}"

mkdir -p "$PLUGINS_DIR"
if [ -f "$KNOWN_MARKETPLACES_JSON" ]; then
  if command -v jq &>/dev/null; then
    jq --arg key "$MARKETPLACE_NAME" --argjson entry "$MARKETPLACE_ENTRY" \
      '.[$key] = $entry' "$KNOWN_MARKETPLACES_JSON" > "${KNOWN_MARKETPLACES_JSON}.tmp" \
      && mv "${KNOWN_MARKETPLACES_JSON}.tmp" "$KNOWN_MARKETPLACES_JSON"
  else
    NODE_KM="$(_node_path "$KNOWN_MARKETPLACES_JSON")"
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('$NODE_KM', 'utf8'));
      data['$MARKETPLACE_NAME'] = $MARKETPLACE_ENTRY;
      fs.writeFileSync('$NODE_KM', JSON.stringify(data, null, 2));
    "
  fi
else
  cat > "$KNOWN_MARKETPLACES_JSON" <<EOJSON
{
  "${MARKETPLACE_NAME}": ${MARKETPLACE_ENTRY}
}
EOJSON
fi

# ─── Configure Hindsight API key ─────────────────────────────────────────────
info "Configuring Hindsight knowledge base..."
cleanup_legacy_hindsight_mcp

HINDSIGHT_CONFIGURED=false
if settings_has_hindsight_key; then
  info "Hindsight token already saved in ~/.claude/settings.json env."
  HINDSIGHT_CONFIGURED=true
else
  DEFAULT_HINDSIGHT_URL="https://hindsight.zingplay.dev/mcp/game-knowledge/"
  echo ""
  echo "  Hindsight is a game design knowledge base used by AI agents."
  echo ""
  if [ -t 0 ]; then
    read -rp "  Hindsight server URL [${DEFAULT_HINDSIGHT_URL}]: " hindsight_url
    hindsight_url="${hindsight_url:-$DEFAULT_HINDSIGHT_URL}"
    read -rp "  Hindsight API key (Enter to skip): " hindsight_key
    if [ -n "$hindsight_key" ]; then
      write_hindsight_settings "$hindsight_key" "$hindsight_url"
      ok "Hindsight token saved to ~/.claude/settings.json env: $hindsight_url"
      HINDSIGHT_CONFIGURED=true
    else
      warn "Skipped. Add later with:"
      echo "    /design-kit:mcp-setup"
    fi
  else
    warn "Non-interactive mode. Add hindsight later:"
    echo "    /design-kit:mcp-setup"
  fi
fi

# ─── Remove old version cache (if upgrading) ────────────────────────────────
if [ -n "$CURRENT_VERSION" ] && [ "$CURRENT_VERSION" != "$PLUGIN_VERSION" ]; then
  OLD_CACHE="$PLUGINS_DIR/cache/${MARKETPLACE_NAME}/${PLUGIN_NAME}/${CURRENT_VERSION}"
  if [ -d "$OLD_CACHE" ]; then
    info "Removing old version ${CURRENT_VERSION}..."
    rm -rf "$OLD_CACHE"
  fi
fi

# ─── Register in installed_plugins.json ──────────────────────────────────────
info "Registering plugin..."
mkdir -p "$PLUGINS_DIR"

INSTALL_ENTRY="{\"scope\":\"user\",\"installPath\":\"${CACHE_DIR}\",\"version\":\"${PLUGIN_VERSION}\",\"installedAt\":\"${NOW}\",\"lastUpdated\":\"${NOW}\"}"

if [ -f "$INSTALLED_JSON" ]; then
  if command -v jq &>/dev/null; then
    jq --arg key "$PLUGIN_KEY" --argjson entry "[$INSTALL_ENTRY]" \
      '.plugins[$key] = $entry' "$INSTALLED_JSON" > "${INSTALLED_JSON}.tmp" \
      && mv "${INSTALLED_JSON}.tmp" "$INSTALLED_JSON"
  else
    NODE_IJ="$(_node_path "$INSTALLED_JSON")"
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('$NODE_IJ', 'utf8'));
      data.plugins = data.plugins || {};
      data.plugins['$PLUGIN_KEY'] = [$INSTALL_ENTRY];
      fs.writeFileSync('$NODE_IJ', JSON.stringify(data, null, 2));
    "
  fi
else
  cat > "$INSTALLED_JSON" <<EOJSON
{
  "version": 2,
  "plugins": {
    "${PLUGIN_KEY}": [${INSTALL_ENTRY}]
  }
}
EOJSON
fi

# ─── Enable plugin in settings.json ─────────────────────────────────────────
info "Enabling plugin..."
mkdir -p "$CLAUDE_DIR"

if [ -f "$SETTINGS_JSON" ]; then
  if command -v jq &>/dev/null; then
    jq --arg key "$PLUGIN_KEY" \
      '.enabledPlugins = (.enabledPlugins // {}) | .enabledPlugins[$key] = true' \
      "$SETTINGS_JSON" > "${SETTINGS_JSON}.tmp" \
      && mv "${SETTINGS_JSON}.tmp" "$SETTINGS_JSON"
  else
    NODE_SJ="$(_node_path "$SETTINGS_JSON")"
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('$NODE_SJ', 'utf8'));
      data.enabledPlugins = data.enabledPlugins || {};
      data.enabledPlugins['$PLUGIN_KEY'] = true;
      fs.writeFileSync('$NODE_SJ', JSON.stringify(data, null, 2));
    "
  fi
else
  cat > "$SETTINGS_JSON" <<EOJSON
{
  "enabledPlugins": {
    "${PLUGIN_KEY}": true
  }
}
EOJSON
fi

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
ok "Game Design Kit v${PLUGIN_VERSION} installed!"
echo ""
echo "  Plugin key:  ${PLUGIN_KEY}"
echo "  Location:    ${CACHE_DIR}"
echo ""
echo "  Start a new Claude session to use it:"
echo "    claude          (Claude Code CLI)"
echo "    Or restart Claude Desktop App"
echo ""
echo "  Quick start:"
echo "    /design-kit:create casual puzzle game with gardening theme"
echo ""
if [ "$HINDSIGHT_CONFIGURED" != "true" ]; then
  warn "Hindsight not configured. Add later:"
  echo "    /design-kit:mcp-setup"
  echo ""
fi
echo "  To uninstall:"
echo "    curl -fsSL https://raw.githubusercontent.com/${REPO}/master/uninstall.sh | bash"
