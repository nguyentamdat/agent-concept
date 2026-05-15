const assert = require('assert');
const { createApp } = require('../src/server');

async function main() {
  const authServer = await createMockOAuthServer('oauthuser@vng.com.vn');
  const oauth2AuthUrl = `http://127.0.0.1:${authServer.address().port}/oauth2/auth`;

  const { server } = createApp({
    HINDSIGHT_API_KEY: 'test-fixed-token',
    PUBLIC_BASE_URL: '',
    CODE_TTL_MS: 60_000,
    AUTH_MODE: 'trusted-header',
    OAUTH2_AUTH_URL: oauth2AuthUrl
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const health = await fetch(`${base}/health`).then((res) => res.json());
    assert.equal(health.status, 'ok');
    assert.equal(health.token_configured, true);

    const unauth = await fetch(`${base}/api/install-code`, { method: 'POST' });
    assert.equal(unauth.status, 401);

    const issuedRes = await fetch(`${base}/api/install-code`, {
      method: 'POST',
      headers: { 'x-forwarded-email': 'tester@vng.com.vn' }
    });
    assert.equal(issuedRes.status, 200);
    const issued = await issuedRes.json();
    assert.match(issued.install_sh, /^http:\/\/127\.0\.0\.1:\d+\/install\.sh\?code=/);
    assert.match(issued.install_ps1, /^http:\/\/127\.0\.0\.1:\d+\/install\.ps1\?code=/);

    const code = new URL(issued.install_sh).searchParams.get('code');
    assert.ok(code);

    const script = await fetch(issued.install_sh).then((res) => res.text());
    assert.match(script, /Game Design Kit Web Installer/);
    assert.doesNotMatch(script, /test-fixed-token/);

    const exchangeRes = await fetch(`${base}/api/install/exchange`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code })
    });
    assert.equal(exchangeRes.status, 200);
    const exchange = await exchangeRes.json();
    assert.equal(exchange.hindsight_api_key, 'test-fixed-token');
    assert.equal(exchange.hindsight_mcp_url, 'https://hindsight.zingplay.dev/mcp/game-knowledge/');

    const secondExchange = await fetch(`${base}/api/install/exchange`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code })
    });
    assert.equal(secondExchange.status, 400);
    assert.equal((await secondExchange.json()).error, 'used_code');

    const { server: restartedServer } = createApp({
      HINDSIGHT_API_KEY: 'test-fixed-token',
      PUBLIC_BASE_URL: '',
      CODE_TTL_MS: 60_000
    });
    await new Promise((resolve) => restartedServer.listen(0, '127.0.0.1', resolve));
    const restartedBase = `http://127.0.0.1:${restartedServer.address().port}`;
    try {
      const restartedExchange = await fetch(`${restartedBase}/api/install/exchange`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code })
      });
      assert.equal(restartedExchange.status, 200);
      assert.equal((await restartedExchange.json()).hindsight_api_key, 'test-fixed-token');
    } finally {
      await new Promise((resolve) => restartedServer.close(resolve));
    }

    const oauthPage = await fetch(`${base}/`, {
      headers: { cookie: '_oauth2_proxy=test-session-ticket' }
    }).then((res) => res.text());
    assert.match(oauthPage, /Signed in as\s*<strong>oauthuser@vng\.com\.vn<\/strong>/);

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  const { server: emailServer } = createApp({
    HINDSIGHT_API_KEY: 'test-fixed-token',
    PUBLIC_BASE_URL: '',
    AUTH_MODE: 'email-domain',
    SESSION_COOKIE_SECRET: 'test-cookie-secret'
  });

  await new Promise((resolve) => emailServer.listen(0, '127.0.0.1', resolve));
  const emailBase = `http://127.0.0.1:${emailServer.address().port}`;

  try {
    const usernameLogin = await fetch(`${emailBase}/email-login`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: 'datndmt' }),
      redirect: 'manual'
    });
    assert.equal(usernameLogin.status, 303);
    assert.match(usernameLogin.headers.get('set-cookie') || '', /hs_email=/);
  } finally {
    await new Promise((resolve) => emailServer.close(resolve));
    await new Promise((resolve) => authServer.close(resolve));
  }
}

async function createMockOAuthServer(email) {
  const http = require('http');
  const server = http.createServer((req, res) => {
    if ((req.headers.cookie || '').includes('_oauth2_proxy=')) {
      res.writeHead(202, {
        'x-auth-request-email': email,
        'gap-auth': email
      });
      res.end();
      return;
    }
    res.writeHead(401);
    res.end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return server;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
