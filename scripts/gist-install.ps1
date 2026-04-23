# Game Design Kit — one-line installer for Claude Code & Claude Chat App (Windows)
# Usage: irm https://gist.githubusercontent.com/nguyentamdat/9776a90bf3cf7fedc7575c04230f0f06/raw/install.ps1 | iex
#
# Supports: Windows 10/11
# Works with: Claude Code CLI, Claude Desktop App (Chat)

$ErrorActionPreference = "Stop"

$REPO = "nguyentamdat/agent-concept"
$REPO_URL = "https://github.com/$REPO.git"
$PLUGIN_NAME = "game-design-kit"
$MARKETPLACE_NAME = "nguyentamdat"
$PLUGIN_KEY = "$PLUGIN_NAME@$MARKETPLACE_NAME"

# ─── Helpers ─────────────────────────────────────────────────────────────────
function Write-Info  { param($m) Write-Host "→ " -ForegroundColor Blue -NoNewline; Write-Host $m }
function Write-Ok    { param($m) Write-Host "✓ " -ForegroundColor Green -NoNewline; Write-Host $m }
function Write-Warn  { param($m) Write-Host "! " -ForegroundColor Yellow -NoNewline; Write-Host $m }
function Write-Err   { param($m) Write-Host "✗ " -ForegroundColor Red -NoNewline; Write-Host $m; exit 1 }

# ─── Detect Claude config directory ──────────────────────────────────────────
function Get-ClaudeDir {
    $candidates = @(
        (Join-Path $env:USERPROFILE ".claude"),
        (Join-Path $env:APPDATA "Claude")
    )
    foreach ($d in $candidates) {
        if (Test-Path $d) { return $d }
    }
    return (Join-Path $env:USERPROFILE ".claude")
}

$CLAUDE_DIR = Get-ClaudeDir
$PLUGINS_DIR = Join-Path $CLAUDE_DIR "plugins"
$INSTALLED_JSON = Join-Path $PLUGINS_DIR "installed_plugins.json"
$SETTINGS_JSON = Join-Path $CLAUDE_DIR "settings.json"
$MARKETPLACES_DIR = Join-Path $PLUGINS_DIR "marketplaces"
$MARKETPLACE_DIR = Join-Path $MARKETPLACES_DIR $MARKETPLACE_NAME
$KNOWN_MARKETPLACES_JSON = Join-Path $PLUGINS_DIR "known_marketplaces.json"

# ─── Preflight checks ───────────────────────────────────────────────────────
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Err "git is required. Install: https://git-scm.com"
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Err "Node.js is required. Install: https://nodejs.org"
}

# ─── Fetch latest version from repo ─────────────────────────────────────────
$TMP_DIR = Join-Path ([System.IO.Path]::GetTempPath()) "gdk-install-$(Get-Random)"
New-Item -ItemType Directory -Path $TMP_DIR -Force | Out-Null

try {
    Write-Info "Fetching latest version from $REPO..."
    $repoDir = Join-Path $TMP_DIR "repo"
    git clone --depth 1 --single-branch $REPO_URL $repoDir 2>$null
    if ($LASTEXITCODE -ne 0) { Write-Err "Failed to clone repository. Check network and try again." }

    # Read version
    $pluginJsonPath = Join-Path $repoDir ".claude-plugin" "plugin.json"
    if (-not (Test-Path $pluginJsonPath)) {
        Write-Err "plugin.json not found in cloned repo. Repository may be corrupted."
    }
    $pluginJson = Get-Content $pluginJsonPath -Raw | ConvertFrom-Json
    $PLUGIN_VERSION = $pluginJson.version
    $CACHE_DIR = Join-Path $PLUGINS_DIR "cache" $MARKETPLACE_NAME $PLUGIN_NAME $PLUGIN_VERSION

    # ─── Check if update needed ──────────────────────────────────────────
    $CURRENT_VERSION = ""
    if (Test-Path $INSTALLED_JSON) {
        try {
            $installed = Get-Content $INSTALLED_JSON -Raw | ConvertFrom-Json
            $entry = $installed.plugins.PSObject.Properties[$PLUGIN_KEY]
            if ($entry) { $CURRENT_VERSION = $entry.Value[0].version }
        } catch {}
    }

    if ($CURRENT_VERSION -eq $PLUGIN_VERSION) {
        Write-Warn "Version $PLUGIN_VERSION already registered. Updating files..."
    } elseif ($CURRENT_VERSION) {
        Write-Info "Updating $CURRENT_VERSION → $PLUGIN_VERSION"
    } else {
        Write-Info "Installing $PLUGIN_NAME v$PLUGIN_VERSION"
    }

    # ─── Copy plugin files ───────────────────────────────────────────────
    Write-Info "Installing to $CACHE_DIR..."
    if (Test-Path $CACHE_DIR) { Remove-Item -Recurse -Force $CACHE_DIR }
    New-Item -ItemType Directory -Path $CACHE_DIR -Force | Out-Null

    $excludeDirs = @('.git', '.github', '.sisyphus', '.opencode', '.omc', 'projects', 'docs\archive', 'art-skill')
    $excludeExts = @('.zip', '.tar.gz')

    Get-ChildItem -Path $repoDir -Recurse -Force | ForEach-Object {
        $rel = $_.FullName.Substring($repoDir.Length + 1)
        $skip = $false

        foreach ($d in $excludeDirs) {
            if ($rel -like "$d\*" -or $rel -eq $d) { $skip = $true; break }
        }
        foreach ($e in $excludeExts) {
            if ($rel -like "*$e") { $skip = $true; break }
        }
        if ($rel -eq '.env') { $skip = $true }

        if (-not $skip) {
            $dest = Join-Path $CACHE_DIR $rel
            if ($_.PSIsContainer) {
                New-Item -ItemType Directory -Path $dest -Force | Out-Null
            } else {
                $destDir = Split-Path $dest -Parent
                if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
                Copy-Item $_.FullName $dest -Force
            }
        }
    }

    # ─── Install marketplace (enables plugin resolution) ────────────────
    Write-Info "Installing marketplace $MARKETPLACE_NAME..."
    if (Test-Path $MARKETPLACE_DIR) { Remove-Item -Recurse -Force $MARKETPLACE_DIR }
    New-Item -ItemType Directory -Path $MARKETPLACE_DIR -Force | Out-Null

    Get-ChildItem -Path $repoDir -Recurse -Force | ForEach-Object {
        $rel = $_.FullName.Substring($repoDir.Length + 1)
        $skip = $false
        foreach ($d in $excludeDirs) {
            if ($rel -like "$d\*" -or $rel -eq $d) { $skip = $true; break }
        }
        foreach ($e in $excludeExts) {
            if ($rel -like "*$e") { $skip = $true; break }
        }
        if ($rel -eq '.env') { $skip = $true }

        if (-not $skip) {
            $dest = Join-Path $MARKETPLACE_DIR $rel
            if ($_.PSIsContainer) {
                New-Item -ItemType Directory -Path $dest -Force | Out-Null
            } else {
                $destDir = Split-Path $dest -Parent
                if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
                Copy-Item $_.FullName $dest -Force
            }
        }
    }

    # Register marketplace in known_marketplaces.json
    $NOW_MKT = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.000Z")
    $marketplaceEntry = [PSCustomObject]@{
        source = [PSCustomObject]@{
            source = "git"
            url    = $REPO_URL
        }
        installLocation = $MARKETPLACE_DIR
        lastUpdated     = $NOW_MKT
    }

    New-Item -ItemType Directory -Path $PLUGINS_DIR -Force | Out-Null
    if (Test-Path $KNOWN_MARKETPLACES_JSON) {
        $kmData = Get-Content $KNOWN_MARKETPLACES_JSON -Raw | ConvertFrom-Json
        if ($kmData.PSObject.Properties[$MARKETPLACE_NAME]) {
            $kmData.$MARKETPLACE_NAME = $marketplaceEntry
        } else {
            $kmData | Add-Member -NotePropertyName $MARKETPLACE_NAME -NotePropertyValue $marketplaceEntry -Force
        }
        $kmData | ConvertTo-Json -Depth 10 | Set-Content $KNOWN_MARKETPLACES_JSON -Encoding UTF8
    } else {
        $km = [PSCustomObject]@{}
        $km | Add-Member -NotePropertyName $MARKETPLACE_NAME -NotePropertyValue $marketplaceEntry -Force
        $km | ConvertTo-Json -Depth 10 | Set-Content $KNOWN_MARKETPLACES_JSON -Encoding UTF8
    }

    # ─── Configure Hindsight API key ─────────────────────────────────────
    Write-Info "Configuring Hindsight knowledge base..."

    $hindsightReady = $false
    $hasClaude = [bool](Get-Command claude -ErrorAction SilentlyContinue)
    if ($hasClaude) {
        $mcpOut = claude mcp list 2>&1 | Out-String
        if ($mcpOut -match "hindsight.*Connected") { $hindsightReady = $true }
    }

    $HINDSIGHT_CONFIGURED = $false
    if ($hindsightReady) {
        Write-Info "Hindsight already configured and connected."
        $HINDSIGHT_CONFIGURED = $true
    } else {
        $DEFAULT_HINDSIGHT_URL = "https://hindsight-api.zingplay.dev/mcp/game-knowledge/"
        Write-Host ""
        Write-Host "  Hindsight is a game design knowledge base used by AI agents."
        Write-Host ""
        $hindsightUrl = Read-Host "  Hindsight server URL (Enter for default: $DEFAULT_HINDSIGHT_URL)"
        if (-not $hindsightUrl) { $hindsightUrl = $DEFAULT_HINDSIGHT_URL }
        $hindsightKey = Read-Host "  Hindsight API key (or press Enter to skip)"

        if ($hindsightKey) {
            if ($hasClaude) {
                claude mcp remove hindsight --scope user 2>$null
                claude mcp add hindsight $hindsightUrl --transport http --scope user --header "Authorization: Bearer $hindsightKey" 2>$null
                Write-Ok "Hindsight configured: $hindsightUrl"
                $HINDSIGHT_CONFIGURED = $true
            } else {
                Write-Warn "Claude CLI not found. Add hindsight manually after installing Claude Code:"
                Write-Host "    claude mcp add hindsight $hindsightUrl --transport http --scope user --header `"Authorization: Bearer YOUR_KEY`""
            }
        } else {
            Write-Warn "Skipped. Add later with:"
            Write-Host "    claude mcp add hindsight $DEFAULT_HINDSIGHT_URL --transport http --scope user --header `"Authorization: Bearer YOUR_KEY`""
        }
    }

    # ─── Remove old version cache ────────────────────────────────────────
    if ($CURRENT_VERSION -and $CURRENT_VERSION -ne $PLUGIN_VERSION) {
        $oldCache = Join-Path $PLUGINS_DIR "cache" $MARKETPLACE_NAME $PLUGIN_NAME $CURRENT_VERSION
        if (Test-Path $oldCache) {
            Write-Info "Removing old version $CURRENT_VERSION..."
            Remove-Item -Recurse -Force $oldCache
        }
    }

    # ─── Register in installed_plugins.json ──────────────────────────────
    Write-Info "Registering plugin..."
    New-Item -ItemType Directory -Path $PLUGINS_DIR -Force | Out-Null

    $NOW = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.000Z")
    $installEntry = @{
        scope       = "user"
        installPath = $CACHE_DIR
        version     = $PLUGIN_VERSION
        installedAt = $NOW
        lastUpdated = $NOW
    }

    if (Test-Path $INSTALLED_JSON) {
        $data = Get-Content $INSTALLED_JSON -Raw | ConvertFrom-Json
        if (-not $data.plugins) {
            $data | Add-Member -NotePropertyName "plugins" -NotePropertyValue ([PSCustomObject]@{}) -Force
        }
        if ($data.plugins.PSObject.Properties[$PLUGIN_KEY]) {
            $data.plugins.$PLUGIN_KEY = @($installEntry)
        } else {
            $data.plugins | Add-Member -NotePropertyName $PLUGIN_KEY -NotePropertyValue @($installEntry) -Force
        }
        $data | ConvertTo-Json -Depth 10 | Set-Content $INSTALLED_JSON -Encoding UTF8
    } else {
        @{
            version = 2
            plugins = @{ $PLUGIN_KEY = @($installEntry) }
        } | ConvertTo-Json -Depth 10 | Set-Content $INSTALLED_JSON -Encoding UTF8
    }

    # ─── Enable plugin in settings.json ──────────────────────────────────
    Write-Info "Enabling plugin..."
    New-Item -ItemType Directory -Path $CLAUDE_DIR -Force | Out-Null

    if (Test-Path $SETTINGS_JSON) {
        $settings = Get-Content $SETTINGS_JSON -Raw | ConvertFrom-Json
        if (-not $settings.enabledPlugins) {
            $settings | Add-Member -NotePropertyName "enabledPlugins" -NotePropertyValue ([PSCustomObject]@{}) -Force
        }
        if ($settings.enabledPlugins.PSObject.Properties[$PLUGIN_KEY]) {
            $settings.enabledPlugins.$PLUGIN_KEY = $true
        } else {
            $settings.enabledPlugins | Add-Member -NotePropertyName $PLUGIN_KEY -NotePropertyValue $true -Force
        }
        $settings | ConvertTo-Json -Depth 10 | Set-Content $SETTINGS_JSON -Encoding UTF8
    } else {
        @{
            enabledPlugins = @{ $PLUGIN_KEY = $true }
        } | ConvertTo-Json -Depth 10 | Set-Content $SETTINGS_JSON -Encoding UTF8
    }

    # ─── Done ────────────────────────────────────────────────────────────
    Write-Host ""
    Write-Ok "Game Design Kit v$PLUGIN_VERSION installed!"
    Write-Host ""
    Write-Host "  Plugin key:  $PLUGIN_KEY"
    Write-Host "  Location:    $CACHE_DIR"
    Write-Host ""
    Write-Host "  Start a new Claude session to use it:"
    Write-Host "    claude          (Claude Code CLI)"
    Write-Host "    Or restart Claude Desktop App"
    Write-Host ""
    Write-Host "  Quick start:"
    Write-Host "    /design-kit:create casual puzzle game with gardening theme"
    Write-Host ""
    if (-not $HINDSIGHT_CONFIGURED) {
        Write-Warn "Hindsight not configured. Add later:"
        Write-Host "    claude mcp add hindsight https://hindsight-api.zingplay.dev/mcp/game-knowledge/ --transport http --scope user --header `"Authorization: Bearer YOUR_KEY`""
        Write-Host ""
    }

} finally {
    Remove-Item -Recurse -Force $TMP_DIR -ErrorAction SilentlyContinue
}
