---
description: Interactively configure MCP server env vars (Hindsight and any future servers)
---

This command discovers MCP servers from the plugin manifest, asks the user for required environment variables, writes them to `~/.claude/settings.json`, and verifies each server is reachable.

It is **generic**: any server added under `mcpServers` in `.claude-plugin/plugin.json` is picked up automatically. You should not hardcode server names — drive the flow from the manifest.

---

## Step 1: Discover servers + required env vars

Read `.claude-plugin/plugin.json` from `${CLAUDE_PLUGIN_ROOT}` (or the repo root). Iterate over `mcpServers`.

For each server, walk every string value (`url`, header values, `args[]`, `env` values, `command`) and extract placeholders of the form:

| Placeholder | Required? | Default |
|-------------|-----------|---------|
| `${VAR}` | Yes | — |
| `${VAR:-some-default}` | No | `some-default` |

Build a list per server:

```
{server_name}:
  required: [VAR1, VAR2, ...]
  optional: [(VAR3, default3), ...]
```

Skip placeholders that are already common Claude Code built-ins (e.g. `CLAUDE_PLUGIN_ROOT`).

---

## Step 2: Read existing values

For each variable, check (in order):

1. `~/.claude/settings.json` `env` field
2. Current process environment (`printenv VAR`)

Mark each variable as **set** (with masked value for secrets — show only first 4 chars + `***`), **unset (using default)**, or **unset (required)**.

Print a discovery card before prompting:

```
MCP servers discovered:
- hindsight
    HINDSIGHT_MCP_URL  : (default) https://hindsight-api.zingplay.dev/mcp/game-knowledge/
    HINDSIGHT_API_KEY  : NOT SET (required)
```

---

## Step 3: Interactive prompt loop

For each variable that is `NOT SET (required)` or that the user wants to override:

1. Use `AskUserQuestion` to ask for the value. Offer two options:
   - **Enter value now** (the user types it via the "Other" custom answer)
   - **Skip** (leave unset)
2. If the variable name matches a secret pattern (`*KEY*`, `*TOKEN*`, `*SECRET*`, `*PASSWORD*`), warn: "This value will be stored in `~/.claude/settings.json` env in plain text."
3. Validate non-empty. Re-prompt if empty and the var is required.

For optional variables that are already defaulted, ask whether to override the default.

Group prompts by server so users can skip a whole server if they don't use it.

---

## Step 4: Write to `~/.claude/settings.json`

Read the existing file (create with `{}` if missing). Merge collected values into the top-level `env` object — do **not** clobber unrelated env keys.

This plugin requires Node (see `package.json`), so use Node for the merge. Pass the JSON through the `NEW_ENV_JSON` environment variable — keeps secrets out of `argv` (which is visible in `ps`):

```bash
NEW_ENV_JSON='{"HINDSIGHT_API_KEY":"sk-..."}' node -e '
const fs=require("fs"),path=require("path");
const p=path.join(process.env.HOME,".claude","settings.json");
fs.mkdirSync(path.dirname(p),{recursive:true});
const cur=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,"utf8")):{};
cur.env={...(cur.env||{}),...JSON.parse(process.env.NEW_ENV_JSON)};
fs.writeFileSync(p,JSON.stringify(cur,null,2)+"\n");
'
```

Build `NEW_ENV_JSON` from the user's answers, e.g. `{"HINDSIGHT_API_KEY":"sk-...","HINDSIGHT_MCP_URL":"https://..."}`.

Show the diff (keys added/changed, with secret values masked) before confirming the write.

---

## Step 5: Verify connectivity

Claude Code only loads `env` from settings on **process start**, so freshly written values are not yet active in the current session. Tell the user:

> Wrote {N} variables to `~/.claude/settings.json`. Restart Claude Code, then re-run `/design-kit:doctor` to verify connectivity.

If the MCP server in question is already reachable in the current session (e.g. the user re-ran with values that were already exported in the shell), call its lightweight read tool to confirm — for Hindsight that is `mcp__hindsight__get_bank`. Report the result inline.

---

## Step 6: Output summary

```
MCP setup complete.

Updated:
  HINDSIGHT_API_KEY     ✓ written
  HINDSIGHT_MCP_URL     (kept default)

Next steps:
  1. Restart Claude Code so the new env vars load.
  2. Run /design-kit:doctor to verify all MCP servers are reachable.
```

If the user skipped any required variable, list it and warn that the corresponding MCP tools will fail until it is set.
