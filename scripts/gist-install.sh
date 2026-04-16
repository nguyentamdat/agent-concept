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

# ─── Configure Hindsight API key ─────────────────────────────────────────────
info "Configuring Hindsight knowledge base..."

_hindsight_ready() {
  command -v claude &>/dev/null && \
  claude mcp list 2>/dev/null | grep -q "hindsight.*Connected"
}

HINDSIGHT_CONFIGURED=false
if _hindsight_ready; then
  info "Hindsight already configured and connected."
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
      if command -v claude &>/dev/null; then
        claude mcp remove hindsight --scope user 2>/dev/null || true
        claude mcp add hindsight "$hindsight_url" \
          --transport http --scope user \
          --header "Authorization: Bearer $hindsight_key" 2>/dev/null
        ok "Hindsight configured: $hindsight_url"
        HINDSIGHT_CONFIGURED=true
      else
        warn "Claude CLI not found. Add hindsight manually after installing Claude Code:"
        echo "    claude mcp add hindsight $hindsight_url --transport http --scope user --header \"Authorization: Bearer YOUR_KEY\""
      fi
    else
      warn "Skipped. Add later with:"
      echo "    claude mcp add hindsight $DEFAULT_HINDSIGHT_URL --transport http --scope user --header \"Authorization: Bearer YOUR_KEY\""
    fi
  else
    warn "Non-interactive mode. Add hindsight later:"
    echo "    claude mcp add hindsight $DEFAULT_HINDSIGHT_URL --transport http --scope user --header \"Authorization: Bearer YOUR_KEY\""
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

NOW="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
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
  echo "    claude mcp add hindsight https://hindsight.zingplay.dev/mcp/game-knowledge/ --transport http --scope user --header \"Authorization: Bearer YOUR_KEY\""
  echo ""
fi
echo "  To uninstall:"
echo "    curl -fsSL https://raw.githubusercontent.com/${REPO}/master/uninstall.sh | bash"
