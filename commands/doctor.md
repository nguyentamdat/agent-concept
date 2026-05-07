---
description: Diagnose plugin installation, MCP connectivity, and version consistency
---

Run all diagnostic checks below in order, then output a single status card. If any check fails, include a one-line fix suggestion pointing the user at the right next command.

---

## Step 1: Plugin structure

Verify these files/directories exist in the plugin root (`${CLAUDE_PLUGIN_ROOT}` if set, otherwise the repo root):

| Path | Required |
|------|----------|
| `.claude-plugin/plugin.json` | Yes |
| `.claude-plugin/marketplace.json` | Yes |
| `settings.json` | Yes |
| `agents/` (>= 10 .md files) | Yes |
| `commands/` (>= 4 .md files) | Yes |
| `skills/game-prototype/SKILL.md` | Yes |
| `skills/game-knowledge/SKILL.md` | Yes |
| `skills/game-ui-ux-guide/SKILL.md` | Yes |
| `references/` | Yes |

Count present vs. expected.

---

## Step 2: MCP server env vars

Read `mcpServers` from `.claude-plugin/plugin.json`. For each server:

1. Scan all string values (URLs, headers, args, env) for `${VAR}` or `${VAR:-default}` placeholders.
2. For each placeholder without a default, check whether the variable is set in either:
   - `~/.claude/settings.json` `env` field, or
   - the current process environment (`echo "${VAR}"`).
3. Mark the server as **OK** (all required vars resolvable), **MISSING** (one or more required vars unset), or **DEFAULTED** (only optional vars are using their default).

If any server is **MISSING**, the fix suggestion is:
> Run `/design-kit:mcp-setup` to configure missing MCP env vars.

---

## Step 3: MCP connectivity

For each MCP server declared in `plugin.json`, attempt a lightweight reachability call:

- **Hindsight**: call `mcp__hindsight__get_bank`. On success, also call `mcp__hindsight__list_memories` (limit 1) and report the `total` count.
- **Other servers**: try the first read-only tool exposed by that server. If none is known, skip with status "unknown" rather than "fail".

If a server is unreachable, the fix suggestion is:
> Check that env vars are set (`/design-kit:mcp-setup`) and restart Claude Code.

---

## Step 4: Version consistency

Read the `version` field from:

- `package.json` (root)
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json` (the `plugins[].version` for `game-design-kit`)

All three must match. If mismatched, list which files disagree.

Fix suggestion on mismatch:
> Run `/design-kit:setup update` (source install) or re-run the marketplace installer.

---

## Step 5: Output diagnostic card

```
Doctor: Game Design Kit v{version}

Structure:      {OK/FAIL} ({count}/{expected} files)
MCP env vars:   {OK/MISSING/DEFAULTED} ({n_ok}/{n_total} servers)
MCP reachable:  {OK/FAIL} ({n_ok}/{n_total} servers, {memory_count} memories in hindsight)
Versions:       {OK/MISMATCH}

{issues_list_if_any}
```

If everything is OK: print `No issues found.`

If there are issues: list each as `- {check}: {detail} → {fix suggestion}`.
