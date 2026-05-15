# Hindsight Setup Web

Internal installer page for Game Design Kit.

Flow:

1. User opens the deployed page behind VNG SSO / trusted auth proxy.
2. App accepts only authenticated `@vng.com.vn` email addresses.
3. Page generates a one-time install code.
4. User runs the generated `curl .../install.sh?code=... | bash` command.
5. Script exchanges the one-time code for the fixed Hindsight API key, installs the plugin, and stores the key in `~/.claude/settings.json`.

Required deploy env:

- `HINDSIGHT_API_KEY` — fixed Hindsight MCP token. Never log this value.

Optional env:

- `HINDSIGHT_MCP_URL` — default `https://hindsight.zingplay.dev/mcp/game-knowledge/`
- `PLUGIN_REPO_URL` — default `https://github.com/nguyentamdat/agent-concept.git`
- `PUBLIC_BASE_URL` — public URL, e.g. `https://hindsight-setup.zingplay.dev`
- `TRUSTED_EMAIL_HEADERS` — comma list, default `x-forwarded-email,x-auth-request-email,x-user-email`
- `AUTH_MODE=trusted-header` — enable only after the app is behind a proxy that strips client-supplied auth headers and injects the verified VNG email. Default is `disabled` so a public domain cannot spoof headers to mint install codes.
- `ALLOWED_EMAIL_DOMAIN` — default `vng.com.vn`
- `DEV_LOGIN_SECRET` — optional local/dev fallback login secret. Do not enable in production unless the route is additionally protected.

Deploy from this directory with ZDeploy CLI mode:

```bash
zdeploy app deploy --local -a <applicationId> --build-type dockerfile -y
```
