---
description: Check plugin version or update to latest
---

Parse `{{ARGUMENTS}}` to determine the subcommand:

| Input | Action |
|-------|--------|
| (no args) | Run **Status** |
| `update` | Run **Update** |
| `doctor` | Delegate to `/design-kit:doctor` (diagnostics moved to its own command) |

---

## Status (default)

**Step 1: Read current version**

Read `.claude-plugin/plugin.json` from the plugin root directory (use `${CLAUDE_PLUGIN_ROOT}` if available, otherwise the repo root). Extract the `version` field.

**Step 2: Check latest version on GitHub**

Run:
```bash
gh api repos/nguyentamdat/agent-concept/releases/latest --jq '.tag_name' 2>/dev/null || echo "unknown"
```

If no release found, fall back to:
```bash
gh api repos/nguyentamdat/agent-concept/contents/.claude-plugin/plugin.json --jq '.content' 2>/dev/null | base64 -d | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).version))"
```

If both fail (no `gh` CLI, no network), show "unable to check" instead of latest version.

**Step 3: Output status card**

```
Game Design Kit v{current}
Latest: v{latest}
{status_line}

Install method: {detected_method}
Location: {plugin_path}
```

Where:
- `{status_line}` = "Up to date" if current == latest, "Update available: v{current} → v{latest}" if not, "Unable to check latest version" if unknown
- `{detected_method}` = detect by checking:
  - If `.git` directory exists in plugin root → "Source (git clone)"
  - If plugin path contains `plugins/cache/nguyentamdat` → "Marketplace installer"
  - If plugin path contains `plugins/cache/local` → "Local install (install.sh)"
  - Otherwise → "Unknown"

---

## Update

**Step 1: Detect install method** (same logic as Status)

**Step 2: Run update based on method**

### If Source (git clone):
```bash
cd {plugin_root}
git pull origin master
```

Then show: "Updated to v{new_version}. Restart Claude Code to apply."

### If Marketplace installer (nguyentamdat):

Detect the current shell to pick the right installer:
- If shell is `bash` (check `$BASH` or `$SHELL` contains "bash") — use the **bash** one-liner. This works on macOS, Linux, and Git Bash on Windows.
- If shell is PowerShell — use the **PowerShell** one-liner.

**Bash:**
```bash
curl -fsSL https://gist.githubusercontent.com/nguyentamdat/da04f07bee67718d5c293d5e29a4790b/raw/install.sh | bash
```

**PowerShell:**
```powershell
irm https://gist.githubusercontent.com/nguyentamdat/9776a90bf3cf7fedc7575c04230f0f06/raw/install.ps1 | iex
```

Ask the user if they want to run it now. If yes, execute the command matching the detected shell.

### If Local install (install.sh):

```bash
cd {plugin_root}
./install.sh
```

Show: "Re-installed v{version}. Restart Claude Code to apply."

**Step 3: Verify**

After update, re-read `.claude-plugin/plugin.json` and confirm the version changed. Output:
```
Updated: v{old} → v{new}
Restart Claude Code to load the new version.
```

---

## Doctor

Diagnostics now live in `/design-kit:doctor`. If the user runs `setup doctor`, invoke that command and stop.
