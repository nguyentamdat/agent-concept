#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const fail = (msg) => { console.error(`FAIL: ${msg}`); process.exitCode = 1; };
const assert = (cond, msg) => { if (!cond) fail(msg); };
const exists = (p) => fs.existsSync(path.join(root, p));

const pkg = readJson('package.json');
const plugin = readJson('.claude-plugin/plugin.json');
const marketplace = readJson('.claude-plugin/marketplace.json');
const marketplacePlugin = (marketplace.plugins || []).find((item) => item.name === 'game-design-kit');

assert(pkg.version === plugin.version, `package.json version ${pkg.version} != plugin.json ${plugin.version}`);
assert(marketplacePlugin, 'marketplace.json does not list game-design-kit');
assert(marketplacePlugin && marketplacePlugin.version === plugin.version, `marketplace version ${marketplacePlugin && marketplacePlugin.version} != plugin.json ${plugin.version}`);

const expected = [
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  'settings.json',
  'AGENTS.md',
  'CLAUDE.md',
  'commands/create.md',
  'commands/iterate.md',
  'commands/doctor.md',
  'commands/mcp-setup.md',
  'skills/game-prototype/SKILL.md',
  'skills/game-knowledge/SKILL.md',
  'skills/game-ui-ux-guide/SKILL.md',
  'references/review-loop.md',
  'install.sh',
  'uninstall.sh'
];
expected.forEach((p) => assert(exists(p), `missing required release file: ${p}`));

const commandFiles = fs.readdirSync(path.join(root, 'commands')).filter((f) => f.endsWith('.md'));
assert(commandFiles.length >= 4, `expected >=4 command files, found ${commandFiles.length}`);
for (const file of commandFiles) {
  const body = fs.readFileSync(path.join(root, 'commands', file), 'utf8');
  assert(body.startsWith('---\n'), `commands/${file} is missing frontmatter opening`);
  assert(body.indexOf('\n---', 4) !== -1, `commands/${file} is missing frontmatter closing`);
  assert(/description:\s*.+/.test(body), `commands/${file} is missing description frontmatter`);
}

const agentFiles = fs.readdirSync(path.join(root, 'agents')).filter((f) => f.endsWith('.md'));
assert(agentFiles.length >= 10, `expected >=10 top-level agent files, found ${agentFiles.length}`);
for (const file of agentFiles) {
  const body = fs.readFileSync(path.join(root, 'agents', file), 'utf8');
  assert(body.startsWith('---\n'), `agents/${file} is missing frontmatter opening`);
  assert(body.indexOf('\n---', 4) !== -1, `agents/${file} is missing frontmatter closing`);
  assert(/name:\s*.+/.test(body), `agents/${file} is missing name frontmatter`);
  assert(/description:\s*.+/.test(body), `agents/${file} is missing description frontmatter`);
}

const install = fs.readFileSync(path.join(root, 'install.sh'), 'utf8');
['.git', '.github', '.claude', '.omx', '.omc', '.sisyphus', 'node_modules', 'tests', 'projects', 'docs', '.env'].forEach((pattern) => {
  assert(install.includes(`--exclude='${pattern}'`), `install.sh does not exclude ${pattern}`);
});

if (process.exitCode) process.exit(process.exitCode);
console.log(`release smoke OK for game-design-kit v${plugin.version}`);
