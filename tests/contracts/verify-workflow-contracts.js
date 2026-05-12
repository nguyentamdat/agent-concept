#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`FAIL: ${msg}`); process.exitCode = 1; };
const assert = (cond, msg) => { if (!cond) fail(msg); };

const create = read('commands/create.md');
const iterate = read('commands/iterate.md');
const prototype = read('skills/game-prototype/SKILL.md');
const agents = new Set(fs.readdirSync(path.join(root, 'agents')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')));

['Phase 1', 'Phase 2', 'Phase 3'].forEach((phase) => assert(prototype.includes(phase), `game-prototype missing ${phase}`));
['game-prototype', 'mockup-designer', 'wireframe-designer', 'document-writer', 'feedback-interpreter'].forEach((name) => {
  assert(create.includes(name) || iterate.includes(name), `active pipeline does not reference ${name}`);
  if (name !== 'game-prototype') assert(agents.has(name), `referenced agent missing: ${name}`);
});

assert(create.indexOf('game-prototype') < create.indexOf('mockup-designer'), 'create.md must route game-prototype before mockup-designer');
assert(create.indexOf('mockup-designer') < create.indexOf('wireframe-designer'), 'create.md must route mockup-designer before wireframe-designer');

const mockup = read('agents/mockup-designer.md');
assert(mockup.includes('https://unpkg.com/dom-grab'), 'mockup-designer missing dom-grab CDN contract');
assert(mockup.includes('data-component'), 'mockup-designer missing data-component contract');
const wireframe = read('agents/wireframe-designer.md');
assert(wireframe.includes('WIREFRAME_DATA'), 'wireframe-designer missing WIREFRAME_DATA contract');
assert(wireframe.includes('data-component'), 'wireframe-designer missing mockup component sync contract');
const gcdTemplate = read('skills/game-prototype/references/gcd-output-template.md');
['1.', '2.', '3.', '4.', '5.'].forEach((marker) => assert(gcdTemplate.includes(marker), `GCD output template missing section marker ${marker}`));

const claude = read('CLAUDE.md');
['Concept Pitch', 'concept-pitch.md', 'prototype/index.html', 'root `gcd.md`', 'single `index.html`'].forEach((legacy) => {
  assert(!claude.includes(legacy), `CLAUDE.md still contains active legacy wording: ${legacy}`);
});

const deletedTopLevelRefs = ['art-style-guide.md', 'screen-checklists.md', 'review-checklist.md', 'theory-knowledge-base.md', 'game-design-theories.md'];
for (const file of deletedTopLevelRefs) {
  assert(!exists(path.join('references', file)), `duplicate top-level reference still exists: references/${file}`);
}
['art-style-guide.md', 'screen-checklists.md', 'review-checklist.md', 'theory-knowledge-base.md'].forEach((file) => {
  assert(exists(path.join('skills/game-ui-ux-guide/references', file)), `canonical UI/UX reference missing: ${file}`);
});
assert(exists('skills/_deprecated/game-concept-design/references/game-design-theories.md'), 'canonical deprecated game-design-theories reference missing');

const settings = JSON.parse(read('settings.json'));
const allowed = settings.permissions && settings.permissions.allow || [];
assert(!allowed.includes('mcp__hindsight__retain'), 'settings.json should not allow direct mcp__hindsight__retain');
assert(read('skills/game-knowledge/SKILL.md').includes('.kb-contributions/pending'), 'game-knowledge skill missing KB pending governance path');
assert(read('commands/iterate.md').includes('.kb-contributions/pending'), 'iterate command missing KB governance gate');
assert(read('commands/create.md').includes('.kb-contributions/pending'), 'create command missing KB governance gate');
assert(!read('AGENTS.md').includes('recall`/`reflect`/`retain'), 'AGENTS.md should not present retain as normal agent capability');

['creative-director', 'document-writer', 'feedback-interpreter', 'market-researcher', 'ui-ux-reviewer', 'detail-doc-reviewer'].forEach((agent) => {
  const body = read(`agents/${agent}.md`);
  assert(body.includes('MCP Availability Rule'), `${agent} missing MCP availability rule`);
});

if (process.exitCode) process.exit(process.exitCode);
console.log('workflow contracts OK');
