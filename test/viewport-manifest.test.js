#!/usr/bin/env node

// Manifest resolution (design §2): the YAML subset, --tabs precedence, the
// default view from designs/index.md with its cap and note, labels/roles.

const test = require('node:test');
const assert = require('node:assert');

const { parseYamlSubset } = require('../lib/viewport/yaml-subset.js');
const { resolveTabs, designsFromIndex } = require('../lib/viewport/manifest.js');
const { tabText } = require('../lib/viewport/page.js');
const { renderMarkdown } = require('../lib/viewport/markdown.js');

test('yaml subset: scalars, bare items, map items with continuations, comments, quotes', () => {
  const parsed = parseYamlSubset('title: "philset" # the project\ntabs:\n  - in-progress.md   # now\n  - path: roadmap.md\n    label: roadmap\n    role: \'what\'s next\'\n  - designs/viewport.md\n');
  assert.deepStrictEqual(parsed, {
    title: 'philset',
    tabs: ['in-progress.md', { path: 'roadmap.md', label: 'roadmap', role: "what's next" }, 'designs/viewport.md'],
  });
});

test('yaml subset: a hash inside a value is not a comment; malformed → null', () => {
  assert.deepStrictEqual(parseYamlSubset('title: issue#12\n'), { title: 'issue#12' });
  assert.deepStrictEqual(parseYamlSubset('title: "issue #12"\n'), { title: 'issue #12' });
  assert.deepStrictEqual(parseYamlSubset('title: issue #12\n'), { title: 'issue' }, 'space-hash is a comment, as in YAML');
  assert.deepStrictEqual(parseYamlSubset('tabs:\n- a.md\n- b.md\n'), { tabs: ['a.md', 'b.md'] }, 'column-0 items are valid');
  assert.strictEqual(parseYamlSubset('tabs:\n  - a.md\n  wat\n'), null);
  assert.strictEqual(parseYamlSubset('- orphan item\n'), null);
  assert.strictEqual(parseYamlSubset(':::\n'), null);
});

const INDEX = [
  '# Designs Index', '',
  '| Doc | Status | Date | Summary |', '|-----|--------|------|---------|',
  '| [old.md](old.md) | accepted | 2026-04-29 | oldest |',
  '| [amended.md](amended.md) | accepted · amended 2026-06-28 | 2026-06-28 | counts as accepted |',
  '| [a.md](a.md) | accepted | 2026-07-03 | tie 1 |',
  '| [b.md](b.md) | accepted | 2026-07-03 | tie 2 |',
  '| [c.md](c.md) | Accepted | 2026-07-22 | case-insensitive |',
  '| [d.md](d.md) | accepted | 2026-08-15 | newest |',
  '| [charter.md](charter.md) | adopted (process charter) | 2026-09-06 | always in |',
  '| [new.md](new.md) | draft | 2026-09-06 | always in |',
  '| [nodate.md](nodate.md) | accepted | — | sorts last |',
  '| [superseded.md](superseded.md) | superseded | 2026-01-01 | never |',
].join('\n');

test('default view: state docs, then drafts/adopted in index order, then accepted newest-first to five design tabs, with the note', () => {
  const existing = new Set(['in-progress.md', 'roadmap.md', 'designs/charter.md', 'designs/new.md', 'designs/d.md', 'designs/c.md', 'designs/a.md', 'designs/b.md', 'designs/amended.md', 'designs/old.md', 'designs/nodate.md']);
  const result = resolveTabs({ indexText: INDEX, exists: (p) => existing.has(p) });
  assert.deepStrictEqual(result.tabs.map((tab) => tab.path), ['in-progress.md', 'roadmap.md', 'designs/charter.md', 'designs/new.md', 'designs/d.md', 'designs/c.md', 'designs/a.md']);
  assert.strictEqual(result.note, '5 of 9 designs · write .meta/viewport.yml to choose');
  assert.strictEqual(result.source, 'default');
});

test('default view: ties keep index order, undated accepted rows sort last, missing files are skipped with a warning', () => {
  const { chosen } = designsFromIndex(INDEX);
  assert.deepStrictEqual(chosen.map((row) => row.path).slice(2), ['designs/d.md', 'designs/c.md', 'designs/a.md']);
  const result = resolveTabs({ indexText: INDEX, exists: (p) => p === 'roadmap.md' || p === 'designs/nodate.md' });
  assert.deepStrictEqual(result.tabs.map((tab) => tab.path), ['roadmap.md']);
  assert.ok(result.warnings.some((w) => w.includes('in-progress.md')));
});

test('default view with a small index shows no note; with no index only the state docs', () => {
  const small = '| Doc | Status | Date | Summary |\n|---|---|---|---|\n| [x.md](x.md) | accepted | 2026-01-01 | one |\n';
  assert.strictEqual(resolveTabs({ indexText: small, exists: () => true }).note, '');
  assert.deepStrictEqual(resolveTabs({ indexText: null, exists: () => true }).tabs.map((t) => t.path), ['in-progress.md', 'roadmap.md']);
});

test('manifest wins over the default view; --tabs wins over the manifest; .meta/ prefixes are stripped', () => {
  const manifest = 'title: mine\ntabs:\n  - .meta/designs/viewport.md\n  - path: roadmap.md\n    label: roadmap\n    role: next\n';
  const fromManifest = resolveTabs({ manifestText: manifest, indexText: INDEX, exists: () => true });
  assert.deepStrictEqual(fromManifest.tabs, [{ path: 'designs/viewport.md' }, { path: 'roadmap.md', label: 'roadmap', role: 'next' }]);
  assert.strictEqual(fromManifest.title, 'mine');
  const fromArgs = resolveTabs({ manifestText: manifest, indexText: INDEX, tabsArg: ['.meta/in-progress.md', 'designs/a.md'], exists: () => true });
  assert.deepStrictEqual(fromArgs.tabs.map((t) => t.path), ['in-progress.md', 'designs/a.md']);
  assert.strictEqual(fromArgs.source, 'args');
});

test('a malformed manifest falls back to the default view with a warning', () => {
  const result = resolveTabs({ manifestText: 'tabs: nope\n  - x\n', indexText: null, exists: () => true });
  assert.strictEqual(result.source, 'default');
  assert.ok(result.warnings[0].includes('viewport.yml'));
});

test('labels: H1 cut at " — " and ellipsised at 24; roles: Status · Date, else modified date', () => {
  const rendered = renderMarkdown('---\nStatus: accepted · amended 2026-06-28 and more words here\nDate: 2026-07-03\n---\n\n# A very long design title indeed — Desired State\n', { panelKey: 'k' });
  const text = tabText({ path: 'designs/x.md', mtimeMs: Date.UTC(2026, 8, 6, 12) }, rendered);
  assert.strictEqual(text.label, 'A very long design titl…');
  assert.strictEqual(text.labelFull, 'A very long design title indeed — Desired State');
  assert.strictEqual(text.role, 'accepted · amended 20… · 2026-07-03');
  assert.strictEqual(text.roleFull, 'accepted · amended 2026-06-28 and more words here · 2026-07-03');
  const plain = tabText({ path: 'in-progress.md', mtimeMs: Date.UTC(2026, 8, 6, 12) }, renderMarkdown('# In Progress\n', { panelKey: 'k' }));
  assert.strictEqual(plain.label, 'In Progress');
  assert.strictEqual(plain.role, 'modified 2026-09-06');
  const stem = tabText({ path: 'notes/no-title.md', mtimeMs: 0 }, renderMarkdown('just text\n', { panelKey: 'k' }));
  assert.strictEqual(stem.label, 'no-title');
  const manifestWins = tabText({ path: 'x.md', label: 'roadmap', role: 'next', mtimeMs: 0 }, rendered);
  assert.deepStrictEqual([manifestWins.label, manifestWins.role], ['roadmap', 'next']);
});
