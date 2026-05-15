const http = require('http');
const crypto = require('crypto');

const DEFAULT_MCP_URL = 'https://hindsight.zingplay.dev/mcp/game-knowledge/';
const DEFAULT_REPO_URL = 'https://github.com/nguyentamdat/agent-concept.git';

function readConfig(overrides = {}) {
  return {
    port: Number(overrides.PORT || process.env.PORT || 3000),
    publicBaseUrl: overrides.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL || '',
    hindsightApiKey: overrides.HINDSIGHT_API_KEY || process.env.HINDSIGHT_API_KEY || overrides.HINDSIGHT_TOKEN || process.env.HINDSIGHT_TOKEN || '',
    hindsightMcpUrl: overrides.HINDSIGHT_MCP_URL || process.env.HINDSIGHT_MCP_URL || DEFAULT_MCP_URL,
    pluginRepoUrl: overrides.PLUGIN_REPO_URL || process.env.PLUGIN_REPO_URL || DEFAULT_REPO_URL,
    oauth2AuthUrl: overrides.OAUTH2_AUTH_URL || process.env.OAUTH2_AUTH_URL || 'https://access.zingplay.dev/oauth2/auth',
    allowedEmailDomain: (overrides.ALLOWED_EMAIL_DOMAIN || process.env.ALLOWED_EMAIL_DOMAIN || 'vng.com.vn').toLowerCase(),
    authMode: (overrides.AUTH_MODE || process.env.AUTH_MODE || 'disabled').toLowerCase(),
    trustedEmailHeaders: (overrides.TRUSTED_EMAIL_HEADERS || process.env.TRUSTED_EMAIL_HEADERS || 'x-forwarded-email,x-auth-request-email,x-user-email,x-zps-user-email,x-auth-email,x-forwarded-user')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
    devLoginSecret: overrides.DEV_LOGIN_SECRET || process.env.DEV_LOGIN_SECRET || '',
    sessionCookieSecret: overrides.SESSION_COOKIE_SECRET || process.env.SESSION_COOKIE_SECRET || overrides.DEV_LOGIN_SECRET || process.env.DEV_LOGIN_SECRET || '',
    codeTtlMs: Number(overrides.CODE_TTL_MS || process.env.CODE_TTL_MS || 5 * 60 * 1000),
    rateLimitWindowMs: Number(overrides.RATE_LIMIT_WINDOW_MS || process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000),
    rateLimitMax: Number(overrides.RATE_LIMIT_MAX || process.env.RATE_LIMIT_MAX || 30)
  };
}

function createApp(overrides = {}) {
  const config = readConfig(overrides);
  const installCodes = new Map();
  const rateBuckets = new Map();

  function json(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'content-length': Buffer.byteLength(payload)
    });
    res.end(payload);
  }

  function html(res, status, body) {
    res.writeHead(status, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    });
    res.end(body);
  }

  function text(res, status, body, contentType = 'text/plain; charset=utf-8') {
    res.writeHead(status, {
      'content-type': contentType,
      'cache-control': 'no-store',
      'content-length': Buffer.byteLength(body)
    });
    res.end(body);
  }

  function getBaseUrl(req) {
    if (config.publicBaseUrl) return config.publicBaseUrl.replace(/\/$/, '');
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${config.port}`;
    return `${String(proto).split(',')[0]}://${String(host).split(',')[0]}`.replace(/\/$/, '');
  }

  function normalizeEmail(value) {
    const email = String(value || '').split(',')[0].trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
  }

  function normalizeIdentity(value) {
    const identity = String(value || '').split(',')[0].trim().toLowerCase();
    if (!identity) return '';
    const email = normalizeEmail(identity);
    if (email) return email;
    if (/^[a-z0-9._-]{2,64}$/.test(identity)) {
      return `${identity}@${config.allowedEmailDomain}`;
    }
    return '';
  }

  function signEmail(email) {
    if (!config.sessionCookieSecret) return '';
    const signature = crypto
      .createHmac('sha256', config.sessionCookieSecret)
      .update(email)
      .digest('base64url');
    return `${Buffer.from(email, 'utf8').toString('base64url')}.${signature}`;
  }

  function verifySignedEmailCookie(req) {
    if (!config.sessionCookieSecret) return '';
    const cookies = Object.fromEntries(
      String(req.headers.cookie || '')
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const index = part.indexOf('=');
          return index === -1 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
        })
    );
    const raw = cookies.hs_email || '';
    const [payload, signature] = raw.split('.');
    if (!payload || !signature) return '';
    let email = '';
    try {
      email = Buffer.from(payload, 'base64url').toString('utf8');
    } catch {
      return '';
    }
    const expected = signEmail(email).split('.')[1];
    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return '';
    } catch {
      return '';
    }
    return normalizeIdentity(email);
  }

  async function getAuthenticatedEmail(req) {
    if (config.authMode === 'trusted-header') {
      for (const header of config.trustedEmailHeaders) {
        const email = normalizeIdentity(req.headers[header]);
        if (email) return email;
      }
    }
    const oauthEmail = await getOAuth2ProxyEmail(req);
    if (oauthEmail) return oauthEmail;
    return verifySignedEmailCookie(req);
  }

  async function getOAuth2ProxyEmail(req) {
    const cookie = String(req.headers.cookie || '');
    if (!cookie.includes('_oauth2_proxy=')) return '';

    let response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    try {
      response = await fetch(config.oauth2AuthUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          cookie,
          accept: '*/*',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'game-design-kit-setup.zingplay.dev'
        }
      });
    } catch {
      return '';
    } finally {
      clearTimeout(timeout);
    }
    if (response.status !== 202) return '';

    const candidates = [
      response.headers.get('x-auth-request-email'),
      response.headers.get('gap-auth'),
      response.headers.get('x-auth-request-preferred-username'),
      response.headers.get('x-auth-request-user')
    ];
    for (const candidate of candidates) {
      const email = normalizeIdentity(candidate);
      if (isAllowedEmail(email)) return email;
    }
    return '';
  }

  function isAllowedEmail(email) {
    return Boolean(email && email.endsWith(`@${config.allowedEmailDomain}`));
  }

  function getClientKey(req) {
    return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  }

  function checkRateLimit(req) {
    const key = getClientKey(req);
    const now = Date.now();
    const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + config.rateLimitWindowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + config.rateLimitWindowMs;
    }
    bucket.count += 1;
    rateBuckets.set(key, bucket);
    return bucket.count <= config.rateLimitMax;
  }

  function hashCode(code) {
    return crypto.createHash('sha256').update(code).digest('base64url');
  }

  function getCodeSigningSecret() {
    return config.sessionCookieSecret || config.hindsightApiKey;
  }

  function signInstallPayload(payload) {
    return crypto
      .createHmac('sha256', getCodeSigningSecret())
      .update(payload)
      .digest('base64url');
  }

  function issueInstallCode(email) {
    const expiresAt = Date.now() + config.codeTtlMs;
    const payload = Buffer.from(JSON.stringify({
      v: 1,
      email,
      exp: expiresAt,
      nonce: crypto.randomBytes(16).toString('base64url')
    }), 'utf8').toString('base64url');
    const code = `${payload}.${signInstallPayload(payload)}`;
    installCodes.set(hashCode(code), { email, expiresAt, used: false });
    return { code, expiresAt: new Date(expiresAt).toISOString() };
  }

  function exchangeInstallCode(code) {
    const raw = String(code || '');
    const key = hashCode(raw);
    const record = installCodes.get(key);
    if (record) {
      if (record.used) return { ok: false, reason: 'used_code' };
      if (Date.now() > record.expiresAt) {
        installCodes.delete(key);
        return { ok: false, reason: 'expired_code' };
      }
      record.used = true;
      installCodes.set(key, record);
      return { ok: true, email: record.email };
    }

    const [payload, signature] = raw.split('.');
    if (!payload || !signature || !getCodeSigningSecret()) return { ok: false, reason: 'invalid_code' };
    const expected = signInstallPayload(payload);
    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return { ok: false, reason: 'invalid_code' };
      }
    } catch {
      return { ok: false, reason: 'invalid_code' };
    }

    let data;
    try {
      data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
      return { ok: false, reason: 'invalid_code' };
    }
    const email = normalizeIdentity(data.email);
    if (!email || !isAllowedEmail(email)) return { ok: false, reason: 'invalid_code' };
    if (!Number.isFinite(data.exp) || Date.now() > data.exp) return { ok: false, reason: 'expired_code' };
    return { ok: true, email };
  }

  async function readJsonBody(req) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 16 * 1024) throw Object.assign(new Error('request_too_large'), { status: 413 });
      chunks.push(chunk);
    }
    if (!chunks.length) return {};
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      throw Object.assign(new Error('invalid_json'), { status: 400 });
    }
  }

  function renderPage(req, email) {
    const baseUrl = getBaseUrl(req);
    const isConfigured = Boolean(config.hindsightApiKey);
    const escapedEmail = escapeHtml(email || '');
    const devLogin = config.devLoginSecret
      ? `<section class="card warn"><h2>Dev fallback login</h2><p>Only use outside production SSO.</p><form method="post" action="/dev-login"><input name="email" placeholder="name@${escapeHtml(config.allowedEmailDomain)}"><input name="secret" type="password" placeholder="DEV_LOGIN_SECRET"><button>Login for dev</button></form></section>`
      : '';
    const oauthLogin = config.authMode === 'oauth2'
      ? `<section class="card"><h2>Login with VNG SSO</h2><p>Use access.zingplay.dev to sign in. After OAuth login, this page auto-detects your verified VNG email from <code>access.zingplay.dev/oauth2/auth</code>.</p><p><a class="button-link" href="https://access.zingplay.dev/oauth2/sign_in?rd=${encodeURIComponent(baseUrl + '/')}">Login with VNG SSO</a></p><p class="muted">No manual email entry is accepted in OAuth mode.</p></section>`
      : '';
    const emailLogin = config.authMode === 'email-domain'
      ? `<section class="card"><h2>Login with VNG account</h2><p>Enter your VNG username, e.g. <code>datndmt</code>, or full <code>@${escapeHtml(config.allowedEmailDomain)}</code> email to unlock the one-time installer command.</p><form method="post" action="/email-login"><input name="email" type="text" required placeholder="datndmt or name@${escapeHtml(config.allowedEmailDomain)}"><button>Continue</button></form><p class="muted">This is an email-domain gate for the internal ZDeploy page. Token is still delivered only through a short-lived one-time code.</p></section>`
      : '';
    const authedPanel = email
      ? `<section class="card">
          <h2>Install Game Design Kit</h2>
          <p>Signed in as <strong>${escapedEmail}</strong>. Generate a 5-minute one-time installer command.</p>
          ${isConfigured ? '' : '<p class="error">Server is missing HINDSIGHT_API_KEY. Installer exchange is disabled until deploy env is configured.</p>'}
          <button id="generate" ${isConfigured ? '' : 'disabled'}>Generate installer command</button>
          <pre id="command" aria-live="polite"></pre>
          <p class="muted">Pick one command only. The setup code expires in 5 minutes and duplicate exchanges are rejected by the same app instance. Treat the generated command as sensitive. The installer stores the Hindsight token in <code>~/.claude/settings.json</code>; the token is never shown on this page.</p>
        </section>`
      : oauthLogin || emailLogin || `<section class="card warn">
          <h2>Login required</h2>
          <p>This page expects VNG SSO or a trusted auth proxy to pass one of these headers:
          <code>${config.trustedEmailHeaders.map(escapeHtml).join('</code>, <code>')}</code>.</p>
          <p>Current auth mode: <code>${escapeHtml(config.authMode)}</code>. Set <code>AUTH_MODE=trusted-header</code> only after the proxy strips client-supplied auth headers and injects the verified email.</p>
          <p>Allowed domain: <code>@${escapeHtml(config.allowedEmailDomain)}</code>.</p>
        </section>${devLogin}`;

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Game Design Kit Installer</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 20% 10%, #2456ff55, transparent 35%), #08111f; color: #e8eefc; display: grid; place-items: center; }
    main { width: min(880px, calc(100vw - 32px)); padding: 40px 0; }
    .hero { margin-bottom: 22px; }
    h1 { font-size: clamp(34px, 6vw, 64px); line-height: .95; margin: 0 0 14px; letter-spacing: -0.05em; }
    h2 { margin-top: 0; }
    p { color: #aebbe0; line-height: 1.6; }
    code, pre { background: #0f1a2e; color: #d9e6ff; border: 1px solid #263a63; border-radius: 12px; }
    code { padding: 2px 6px; }
    pre { padding: 18px; overflow-x: auto; min-height: 54px; white-space: pre-wrap; word-break: break-word; }
    .card { background: #0b1527dd; border: 1px solid #22365e; border-radius: 24px; padding: 24px; box-shadow: 0 24px 80px #0008; }
    .warn { border-color: #7b6425; }
    .error { color: #ffb4b4; }
    .muted { font-size: 14px; color: #8090b9; }
    button { appearance: none; border: 0; border-radius: 999px; background: linear-gradient(135deg, #4f8cff, #8f5cff); color: white; font-weight: 800; padding: 14px 20px; cursor: pointer; }
    button:disabled { opacity: .45; cursor: not-allowed; }
    input { display: block; box-sizing: border-box; width: min(420px, 100%); margin: 10px 0; padding: 12px 14px; border-radius: 12px; border: 1px solid #33476e; background: #111c31; color: #eef4ff; }
    a { color: #8eb5ff; }
    .button-link { display: inline-block; text-decoration: none; border-radius: 999px; background: linear-gradient(135deg, #4f8cff, #8f5cff); color: white; font-weight: 800; padding: 14px 20px; }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>Game Design Kit<br>internal installer</h1>
      <p>Deploy URL: <code>${escapeHtml(baseUrl)}</code>. Hindsight MCP: <code>${escapeHtml(config.hindsightMcpUrl)}</code>.</p>
    </section>
    ${authedPanel}
  </main>
  <script>
    const button = document.getElementById('generate');
    const pre = document.getElementById('command');
    if (button) {
      button.addEventListener('click', async () => {
        button.disabled = true;
        pre.textContent = 'Generating...';
        try {
          const res = await fetch('/api/install-code', { method: 'POST' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'failed');
          pre.textContent = [
            'macOS / Linux:',
            'curl -fsSL "' + data.install_sh + '" | bash',
            '',
            'Windows PowerShell:',
            'irm "' + data.install_ps1 + '" | iex'
          ].join('\\n');
        } catch (err) {
          pre.textContent = 'Error: ' + err.message;
        } finally {
          button.disabled = false;
        }
      });
    }
  </script>
</body>
</html>`;
  }

  async function handle(req, res) {
    const url = new URL(req.url || '/', getBaseUrl(req));

    if (!checkRateLimit(req)) {
      return json(res, 429, { error: 'rate_limited' });
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, {
        status: 'ok',
        hindsight_mcp_url: config.hindsightMcpUrl,
        token_configured: Boolean(config.hindsightApiKey),
        allowed_email_domain: config.allowedEmailDomain,
        auth_mode: config.authMode
      });
    }

    if (req.method === 'GET' && url.pathname === '/') {
      const email = await getAuthenticatedEmail(req);
      if (email && !isAllowedEmail(email)) {
        return html(res, 403, renderError('Forbidden', `Only @${config.allowedEmailDomain} accounts can use this installer.`));
      }
      return html(res, 200, renderPage(req, email));
    }


    if (req.method === 'POST' && url.pathname === '/email-login') {
      if (config.authMode !== 'email-domain') return html(res, 404, renderError('Not found', 'Email login is disabled.'));
      if (!config.sessionCookieSecret) return html(res, 503, renderError('Not configured', 'SESSION_COOKIE_SECRET is required for email login.'));
      const body = await readFormBody(req);
      const email = normalizeIdentity(body.email);
      if (!isAllowedEmail(email)) {
        return html(res, 403, renderError('Forbidden', `Only @${config.allowedEmailDomain} accounts can use this installer.`));
      }
      res.writeHead(303, {
        location: '/',
        'set-cookie': `hs_email=${encodeURIComponent(signEmail(email))}; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=3600`
      });
      return res.end();
    }

    if (req.method === 'POST' && url.pathname === '/dev-login') {
      if (!config.devLoginSecret) return html(res, 404, renderError('Not found', 'Dev login is disabled.'));
      const body = await readFormBody(req);
      const email = normalizeIdentity(body.email);
      if (body.secret !== config.devLoginSecret || !isAllowedEmail(email)) {
        return html(res, 403, renderError('Forbidden', 'Invalid dev login credentials.'));
      }
      res.writeHead(303, {
        location: '/',
        'set-cookie': `hs_email=${encodeURIComponent(signEmail(email))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`
      });
      return res.end();
    }

    if (req.method === 'POST' && url.pathname === '/api/install-code') {
      const email = await getAuthenticatedEmail(req);
      if (!email) return json(res, 401, { error: 'login_required' });
      if (!isAllowedEmail(email)) return json(res, 403, { error: 'forbidden_domain' });
      if (!config.hindsightApiKey) return json(res, 503, { error: 'hindsight_token_not_configured' });
      const issued = issueInstallCode(email);
      const baseUrl = getBaseUrl(req);
      return json(res, 200, {
        expires_at: issued.expiresAt,
        install_sh: `${baseUrl}/install.sh?code=${encodeURIComponent(issued.code)}`,
        install_ps1: `${baseUrl}/install.ps1?code=${encodeURIComponent(issued.code)}`
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/install/exchange') {
      if (!config.hindsightApiKey) return json(res, 503, { error: 'hindsight_token_not_configured' });
      const body = await readJsonBody(req);
      const result = exchangeInstallCode(body.code);
      if (!result.ok) return json(res, 400, { error: result.reason });
      return json(res, 200, {
        hindsight_api_key: config.hindsightApiKey,
        hindsight_mcp_url: config.hindsightMcpUrl,
        plugin_repo_url: config.pluginRepoUrl
      });
    }

    if (req.method === 'GET' && url.pathname === '/install.sh') {
      const code = url.searchParams.get('code') || '';
      return text(res, code ? 200 : 400, code ? renderBashInstaller(getBaseUrl(req), code) : 'missing code\n', 'text/x-shellscript; charset=utf-8');
    }

    if (req.method === 'GET' && url.pathname === '/install.ps1') {
      const code = url.searchParams.get('code') || '';
      return text(res, code ? 200 : 400, code ? renderPowerShellInstaller(getBaseUrl(req), code) : 'missing code\n', 'text/plain; charset=utf-8');
    }

    return html(res, 404, renderError('Not found', 'Unknown route.'));
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((error) => {
      const status = error.status || 500;
      json(res, status, { error: status === 500 ? 'internal_server_error' : error.message });
    });
  });

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of installCodes.entries()) {
      if (record.used || record.expiresAt < now) installCodes.delete(key);
    }
    for (const [key, bucket] of rateBuckets.entries()) {
      if (bucket.resetAt < now) rateBuckets.delete(key);
    }
  }, 60 * 1000);
  cleanup.unref();

  return { server, config, internals: { installCodes, issueInstallCode, exchangeInstallCode } };
}

async function readFormBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const params = new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
  return Object.fromEntries(params.entries());
}

function renderError(title, message) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:system-ui;background:#08111f;color:#e8eefc;padding:40px}p{color:#aebbe0}</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a href="/">Back</a></p></body></html>`;
}

function renderBashInstaller(baseUrl, code) {
  return `#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${shellQuote(baseUrl)}
INSTALL_CODE=${shellQuote(code)}
export INSTALL_CODE

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing dependency: $1" >&2
    exit 1
  fi
}

repo_to_zip_url() {
  local repo="$1"
  repo="\${repo%.git}"
  case "$repo" in
    https://github.com/*/*)
      printf '%s/archive/HEAD.zip' "$repo"
      ;;
    *)
      echo "Unsupported plugin repo URL for native installer: $1" >&2
      return 1
      ;;
  esac
}

need curl
need node
need unzip
need rsync

echo "=== Game Design Kit Web Installer ==="
echo "[1/4] Exchanging one-time setup code..."

REQUEST_BODY="$(node -e 'process.stdout.write(JSON.stringify({code: process.env.INSTALL_CODE}))')"
EXCHANGE_RESPONSE="$(curl -fsS \
  -X POST \
  -H 'content-type: application/json' \
  --data "$REQUEST_BODY" \
  "$BASE_URL/api/install/exchange")"

export EXCHANGE_RESPONSE
export HINDSIGHT_API_KEY="$(node -e 'const r=JSON.parse(process.env.EXCHANGE_RESPONSE); if(!r.hindsight_api_key) process.exit(1); process.stdout.write(r.hindsight_api_key)')"
PLUGIN_REPO_URL="$(node -e 'const r=JSON.parse(process.env.EXCHANGE_RESPONSE); process.stdout.write(r.plugin_repo_url || "https://github.com/nguyentamdat/agent-concept.git")')"
HINDSIGHT_MCP_URL="$(node -e 'const r=JSON.parse(process.env.EXCHANGE_RESPONSE); process.stdout.write(r.hindsight_mcp_url || "https://hindsight.zingplay.dev/mcp/game-knowledge/")')"

echo "[2/4] Downloading plugin source zip..."
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
ZIP_URL="$(repo_to_zip_url "$PLUGIN_REPO_URL")"
curl -fsSL "$ZIP_URL" -o "$TMP_DIR/source.zip"
unzip -q "$TMP_DIR/source.zip" -d "$TMP_DIR/source"

PLUGIN_JSON="$(find "$TMP_DIR/source" -path '*/.claude-plugin/plugin.json' -type f | head -n 1)"
if [ -z "$PLUGIN_JSON" ]; then
  echo "Downloaded zip did not contain .claude-plugin/plugin.json" >&2
  find "$TMP_DIR/source" -maxdepth 2 -print >&2 || true
  exit 1
fi
SOURCE_ROOT="$(cd "$(dirname "$PLUGIN_JSON")/.." && pwd)"

echo "[3/4] Installing plugin files..."
(cd "$SOURCE_ROOT" && HINDSIGHT_API_KEY="$HINDSIGHT_API_KEY" HINDSIGHT_MCP_URL="$HINDSIGHT_MCP_URL" ./install.sh)

echo "[4/4] Done"
echo ""
echo "Done. Restart Claude Code, then run /design-kit:doctor to verify."
`;
}

function renderPowerShellInstaller(baseUrl, code) {
  return `$ErrorActionPreference = 'Stop'
$BaseUrl = ${psQuote(baseUrl)}
$InstallCode = ${psQuote(code)}

function ConvertTo-GitHubZipUrl([string]$RepoUrl) {
  $repo = $RepoUrl.Trim()
  $repo = $repo -replace '\.git$',''
  if ($repo -match '^https://github\.com/([^/]+)/([^/]+)$') {
    return "https://github.com/$($Matches[1])/$($Matches[2])/archive/HEAD.zip"
  }
  throw "Unsupported plugin repo URL for native Windows install: $RepoUrl"
}

function Get-ClaudeDir {
  $candidates = @(
    (Join-Path $env:USERPROFILE ".claude"),
    (Join-Path $env:APPDATA "Claude")
  )
  foreach ($d in $candidates) {
    if (Test-Path -LiteralPath $d) { return $d }
  }
  return (Join-Path $env:USERPROFILE ".claude")
}

function Copy-PluginTree([string]$SourceRoot, [string]$TargetRoot) {
  $excludeDirs = @('.git', '.github', '.claude', '.omx', '.sisyphus', '.opencode', '.omc', 'node_modules', 'tests', 'projects', 'apps', 'art-skill', 'docs')
  $excludeFiles = @('install.sh', 'uninstall.sh', '.env')

  if (Test-Path -LiteralPath $TargetRoot) { Remove-Item -LiteralPath $TargetRoot -Recurse -Force }
  New-Item -ItemType Directory -Path $TargetRoot -Force | Out-Null

  Get-ChildItem -LiteralPath $SourceRoot -Force | ForEach-Object {
    if ($_.PSIsContainer -and ($excludeDirs -contains $_.Name)) { return }
    if (-not $_.PSIsContainer -and ($excludeFiles -contains $_.Name -or $_.Name -like '.env.*')) { return }
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $TargetRoot $_.Name) -Recurse -Force
  }
}

function Read-JsonFile([string]$Path, [object]$DefaultValue) {
  if (Test-Path -LiteralPath $Path) {
    $raw = Get-Content -LiteralPath $Path -Raw
    if ($raw.Trim()) { return $raw | ConvertFrom-Json }
  }
  return $DefaultValue
}

function Save-JsonFile([string]$Path, [object]$Value) {
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $Value | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Remove-LegacyHindsightMcpConfig {
  $userConfigPath = Join-Path $env:USERPROFILE '.claude.json'
  if (-not (Test-Path -LiteralPath $userConfigPath)) { return }
  try {
    $userConfig = Get-Content -LiteralPath $userConfigPath -Raw | ConvertFrom-Json
    if ($userConfig.PSObject.Properties['mcpServers'] -and $userConfig.mcpServers.PSObject.Properties['hindsight']) {
      $userConfig.mcpServers.PSObject.Properties.Remove('hindsight')
      if ($userConfig.mcpServers.PSObject.Properties.Count -eq 0) {
        $userConfig.PSObject.Properties.Remove('mcpServers')
      }
      Save-JsonFile $userConfigPath $userConfig
      Write-Host "  Removed legacy user-level mcpServers.hindsight from $userConfigPath"
    }
  } catch {
    Write-Warning "Could not inspect $userConfigPath for legacy Hindsight MCP config: $($_.Exception.Message)"
  }
}

Write-Host "=== Game Design Kit Web Installer (Windows) ==="
Write-Host "[1/4] Exchanging one-time setup code..."
$body = @{ code = $InstallCode } | ConvertTo-Json -Compress
$resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/install/exchange" -ContentType 'application/json' -Body $body
if (-not $resp.hindsight_api_key) { throw "Exchange did not return Hindsight token" }

$repo = if ($resp.plugin_repo_url) { [string]$resp.plugin_repo_url } else { "https://github.com/nguyentamdat/agent-concept.git" }
$zipUrl = ConvertTo-GitHubZipUrl $repo

Write-Host "[2/4] Downloading plugin source zip..."
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("game-design-kit-" + [guid]::NewGuid().ToString('N'))
$zip = Join-Path $tmp 'source.zip'
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $zipUrl -OutFile $zip -UseBasicParsing
  Expand-Archive -LiteralPath $zip -DestinationPath $tmp -Force
  $pluginJsonFile = Get-ChildItem -LiteralPath $tmp -Recurse -Force -Filter 'plugin.json' |
    Where-Object { $_.Directory -and $_.Directory.Name -eq '.claude-plugin' } |
    Select-Object -First 1
  if (-not $pluginJsonFile) {
    $topEntries = (Get-ChildItem -LiteralPath $tmp -Force | Select-Object -ExpandProperty Name) -join ', '
    throw "Downloaded zip did not contain .claude-plugin/plugin.json. Top entries: $topEntries"
  }
  $sourcePath = Split-Path -Parent (Split-Path -Parent $pluginJsonFile.FullName)

  $pluginJsonPath = $pluginJsonFile.FullName
  $pluginJson = Get-Content -LiteralPath $pluginJsonPath -Raw | ConvertFrom-Json
  $pluginName = [string]$pluginJson.name
  $pluginVersion = [string]$pluginJson.version
  $marketplaceName = 'nguyentamdat'
  $pluginKey = "$pluginName@$marketplaceName"

  $claudeDir = Get-ClaudeDir
  $pluginsDir = Join-Path $claudeDir 'plugins'
  $cacheDir = Join-Path (Join-Path (Join-Path (Join-Path $pluginsDir 'cache') $marketplaceName) $pluginName) $pluginVersion
  $installedJsonPath = Join-Path $pluginsDir 'installed_plugins.json'
  $settingsJsonPath = Join-Path $claudeDir 'settings.json'
  $marketplacesDir = Join-Path $pluginsDir 'marketplaces'
  $marketplaceDir = Join-Path $marketplacesDir $marketplaceName
  $knownMarketplacesJsonPath = Join-Path $pluginsDir 'known_marketplaces.json'

  Write-Host "[3/4] Copying plugin files..."
  Copy-PluginTree -SourceRoot $sourcePath -TargetRoot $cacheDir
  Copy-PluginTree -SourceRoot $sourcePath -TargetRoot $marketplaceDir

  Write-Host "[4/4] Registering plugin and saving Hindsight env..."
  $settings = Read-JsonFile $settingsJsonPath ([pscustomobject]@{})
  if (-not $settings.PSObject.Properties['enabledPlugins']) { Add-Member -InputObject $settings -NotePropertyName enabledPlugins -NotePropertyValue ([pscustomobject]@{}) }
  if (-not $settings.PSObject.Properties['env']) { Add-Member -InputObject $settings -NotePropertyName env -NotePropertyValue ([pscustomobject]@{}) }
  $settings.enabledPlugins | Add-Member -NotePropertyName $pluginKey -NotePropertyValue $true -Force
  $settings.env | Add-Member -NotePropertyName HINDSIGHT_API_KEY -NotePropertyValue ([string]$resp.hindsight_api_key) -Force
  $settings.env | Add-Member -NotePropertyName HINDSIGHT_MCP_URL -NotePropertyValue ([string]$resp.hindsight_mcp_url) -Force
  Save-JsonFile $settingsJsonPath $settings
  Remove-LegacyHindsightMcpConfig

  $installed = Read-JsonFile $installedJsonPath ([pscustomobject]@{ version = 2; plugins = [pscustomobject]@{} })
  if (-not $installed.PSObject.Properties['version']) { Add-Member -InputObject $installed -NotePropertyName version -NotePropertyValue 2 }
  if (-not $installed.PSObject.Properties['plugins']) { Add-Member -InputObject $installed -NotePropertyName plugins -NotePropertyValue ([pscustomobject]@{}) }
  $entry = [pscustomobject]@{
    scope = 'user'
    installPath = $cacheDir
    version = $pluginVersion
    installedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.000Z')
  }
  $installed.plugins | Add-Member -NotePropertyName $pluginKey -NotePropertyValue @($entry) -Force
  Save-JsonFile $installedJsonPath $installed

  $knownMarketplaces = Read-JsonFile $knownMarketplacesJsonPath ([pscustomobject]@{})
  $marketplaceEntry = [pscustomobject]@{
    source = [pscustomobject]@{
      source = 'git'
      url = $repo
    }
    installLocation = $marketplaceDir
    lastUpdated = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.000Z')
  }
  $knownMarketplaces | Add-Member -NotePropertyName $marketplaceName -NotePropertyValue $marketplaceEntry -Force
  Save-JsonFile $knownMarketplacesJsonPath $knownMarketplaces
} finally {
  if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}

Write-Host ""
Write-Host "Done. Restart Claude Code, then run /design-kit:doctor to verify."
`;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function psQuote(value) {
  return `'${String(value).replace(/'/g, `''`)}'`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

if (require.main === module) {
  const { server, config } = createApp();
  server.listen(config.port, () => {
    console.log(`hindsight-setup listening on :${config.port}`);
  });
}

module.exports = { createApp, readConfig };
