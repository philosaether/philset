#!/usr/bin/env node

// Tree mode: project discovery, the index, token definitions and their
// neighborhood resolution, the rendered token spans and anchors, and the
// session tracker's state transitions. Throwaway trees under os.tmpdir().

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tree = require('../lib/viewport/tree.js');
const { renderMarkdown } = require('../lib/viewport/markdown.js');
const { applyHookEvent, snippet } = require('../lib/viewport/sessions.js');

function makeTree() {
  const root = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'pv-tree-')));
  const write = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  write('.meta/in-progress.md', '# In Progress\n\nCarry R2 and the A8 slice.\n');
  write('.meta/designs/index.md', '| doc | status | date |\n|---|---|---|\n');
  write('.meta/archive/persona/.meta/old.md', '# not a project\n');
  write('alpha/.meta/assessments/matrix.md', [
    '# Assessment: Matrix', 'Date: 2026-09-20', 'Status: complete', '',
    'The ruling R1 leans on H0; H1 is out.', '',
    '## Rulings', '',
    '| # | Ruling | Lean |', '|---|---|---|',
    '| R1 | Host = the browser tab | y |',
    '| R2 | Engine = live preview; **deferred** until the probe | m |',
    '| H1 | ~~the iframe shape~~ struck, keys dead | — |',
    '', '### H0 — the integrated browser tab', 'Nothing to install.', '',
    '- **A8** Annotate where you read — the most-used action', '',
    'See [the readers](../designs/readers.md) for OQ3.', '',
    '```', 'R9 inside a fence is not a citation', '```', ''].join('\n'));
  write('alpha/.meta/designs/readers.md', '# Readers\n\n| Id | Question |\n|---|---|\n| OQ3 | Which reader owns the fold? — resolved 09-06 |\n');
  write('alpha/.meta/designs/other.md', '# Other\n\n- R1: a *different* R1 in a sibling design, older\n');
  write('beta/.meta/roadmap.md', '# Roadmap\n\nA8 here is somebody else\'s A8; #42 is a pull request.\n');
  write('node_modules/skip/.meta/x.md', '# skipped\n');
  const older = new Date(Date.now() - 86400000 * 3);
  fs.utimesSync(path.join(root, 'alpha/.meta/designs/other.md'), older, older);
  return root;
}

test('discoverProjects: every .meta under the root, minus node_modules and nested-in-.meta', () => {
  const root = makeTree();
  const projects = tree.discoverProjects(root);
  assert.deepStrictEqual(projects.map((project) => project.rel), ['', 'alpha', 'beta']);
  assert.strictEqual(projects[0].key, '~');
  assert.strictEqual(projects[1].key, 'alpha');
  assert.strictEqual(tree.relOfKey(tree.projectKey('a/b/c')), 'a/b/c');
});

test('index: titles, metadata under the H1, H2s, links, definitions in three shapes, fences ignored', () => {
  const root = makeTree();
  const index = tree.buildIndex(tree.discoverProjects(root));
  const matrix = tree.getDoc(index, 'alpha', 'assessments/matrix.md');
  assert.strictEqual(matrix.title, 'Assessment: Matrix');
  assert.strictEqual(matrix.status, 'complete');
  assert.strictEqual(matrix.date, '2026-09-20');
  assert.deepStrictEqual(matrix.h2s, ['Rulings']);
  assert.deepStrictEqual(matrix.links, ['designs/readers.md']);
  const defined = Object.fromEntries(matrix.defs.map((definition) => [definition.token, definition]));
  assert.strictEqual(defined.R1.kind, 'row');
  assert.strictEqual(defined.R1.line, 11);
  assert.strictEqual(defined.R1.body, 'Host = the browser tab · y');
  assert.strictEqual(defined.H0.kind, 'heading');
  assert.match(defined.H0.body, /integrated browser tab — Nothing to install/);
  assert.strictEqual(defined.A8.kind, 'list');
  assert.strictEqual(defined.R2.status, 'deferred');
  assert.strictEqual(defined.H1.status, 'struck');
  assert.strictEqual(defined.R1.status, 'open');
  assert.ok(!defined.R9, 'a token inside a fence is not defined');
  assert.ok(!matrix.cites.has('R9'), 'nor cited');
  assert.ok(matrix.cites.has('OQ3'));
  assert.strictEqual(matrix.url, '/p/alpha/assessments/matrix.md');
});

test('resolve: same doc, then linked docs, then the project; never across projects; newest wins in a tier', () => {
  const root = makeTree();
  const index = tree.buildIndex(tree.discoverProjects(root));
  const matrix = tree.getDoc(index, 'alpha', 'assessments/matrix.md');
  const tokens = tree.tokensFor(index, matrix);
  assert.strictEqual(tokens.R1.path, 'assessments/matrix.md', 'this doc beats the older sibling definition');
  assert.strictEqual(tokens.R1.sameDoc, true);
  assert.strictEqual(tokens.R1.href, '#tok-assessments-matrix-md-R1');
  assert.strictEqual(tokens.OQ3.path, 'designs/readers.md', 'a linked doc resolves');
  assert.strictEqual(tokens.OQ3.status, 'settled');
  assert.strictEqual(tokens.OQ3.tense, 'true-now');
  assert.strictEqual(tokens.OQ3.href, '/p/alpha/designs/readers.md#tok-designs-readers-md-OQ3');
  assert.strictEqual(tokens.H1.tense, 'was-true');
  assert.strictEqual(tokens.OQ3.id, 'alpha/designs/readers.md#OQ3');
  const hub = tree.getDoc(index, '~', 'in-progress.md');
  const hubTokens = tree.tokensFor(index, hub);
  assert.deepStrictEqual(Object.keys(hubTokens), [], 'the hub cites R2 and A8 but defines neither: no cross-project resolution');
  const beta = tree.getDoc(index, 'beta', 'roadmap.md');
  assert.deepStrictEqual(Object.keys(tree.tokensFor(index, beta)), [], "beta's A8 is not alpha's");
  const other = tree.getDoc(index, 'alpha', 'designs/other.md');
  assert.strictEqual(tree.tokensFor(index, other).R1.path, 'designs/other.md', 'its own definition first, even when older');
});

test('render: cited tokens become hover spans, the defining block carries the anchor, pulls link when a repo resolves', () => {
  const root = makeTree();
  const index = tree.buildIndex(tree.discoverProjects(root));
  const matrix = tree.getDoc(index, 'alpha', 'assessments/matrix.md');
  const text = fs.readFileSync(path.join(root, 'alpha/.meta/assessments/matrix.md'), 'utf8');
  const rendered = renderMarkdown(text, { panelKey: 'assessments-matrix-md', docPath: matrix.path, tokens: tree.tokensFor(index, matrix) });
  assert.match(rendered.html, /<p>The ruling <span class="tok" data-tok="R1" data-status="open" tabindex="0">R1<\/span> leans on <span class="tok" data-tok="H0"/);
  assert.match(rendered.html, /<span class="tok def" id="tok-assessments-matrix-md-R1" data-tok="R1"/, 'the row that defines R1 is the anchor');
  assert.strictEqual((rendered.html.match(/tok def/g) || []).length, 5, 'one anchor per defined token that this doc cites (R1 R2 H1 H0 A8)');
  assert.ok(!/data-tok="R9"/.test(rendered.html), 'fenced text is untouched');
  assert.ok(!/data-tok="OQ3"[^>]*>OQ3<\/span>[^<]*<\/a>/.test(rendered.html));
  const plain = renderMarkdown(text, { panelKey: 'x', docPath: matrix.path });
  assert.ok(!/class="tok"/.test(plain.html), 'without an index nothing is wrapped');

  const external = { pull: (before, number) => (/beta/.test(before) ? null : `https://github.com/acme/beta/pull/${number}`), ticket: (prefix, rest) => (prefix === 'DEV' ? `https://linear.example/${prefix}-${rest}` : null) };
  const beta = renderMarkdown("See #42 and DEV-7 but not it's nor XYZ-1.\n", { panelKey: 'r', docPath: 'roadmap.md', external });
  assert.match(beta.html, /<a class="xid" href="https:\/\/github.com\/acme\/beta\/pull\/42"[^>]*>#42<\/a>/);
  assert.match(beta.html, /<a class="xid" href="https:\/\/linear.example\/DEV-7"[^>]*>DEV-7<\/a>/);
  assert.ok(!/XYZ-1<\/a>/.test(beta.html), 'an unconfigured prefix stays text');
  assert.match(beta.html, /it&#39;s nor/, 'the apostrophe entity is not a pull request');
});

test('reindexProject picks up a new definition; tray records are compact', () => {
  const root = makeTree();
  const projects = tree.discoverProjects(root);
  const index = tree.buildIndex(projects);
  fs.writeFileSync(path.join(root, 'alpha/.meta/designs/new.md'), '# New\n\n| # | Q |\n|---|---|\n| OQ9 | brand new |\n');
  tree.reindexProject(index, projects.find((project) => project.key === 'alpha'));
  assert.ok(tree.getDoc(index, 'alpha', 'designs/new.md'));
  const matrix = tree.getDoc(index, 'alpha', 'assessments/matrix.md');
  assert.ok(!tree.tokensFor(index, matrix).OQ9, 'not cited by the matrix, so not in its map');
  const records = tree.trayRecords(index);
  assert.strictEqual(records.length, 7);
  const record = records.find((entry) => entry.f === 'assessments/matrix.md');
  assert.deepStrictEqual(Object.keys(record).sort(), ['a', 'd', 'f', 'h', 'k', 'm', 'n', 'p', 's', 't', 'u']);
  assert.strictEqual(record.k, 5);
});

test('sessions: prompt → crunching, stop → ready with the reply snippet, end → gone, stale ignored', () => {
  const transcript = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pv-sess-')), 't.jsonl');
  fs.writeFileSync(transcript, [
    JSON.stringify({ type: 'user', message: { content: 'hi' } }),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use' }] } }),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: '# Heading\n\nAll **49** tests green.\nMore.' }] } }),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'thinking' }] } }),
  ].join('\n'));
  let sessions = applyHookEvent([], { session_id: 's1', hook_event_name: 'UserPromptSubmit', cwd: '/x', prompt: 'build the demo' }, 1000);
  assert.deepStrictEqual(sessions.map((session) => [session.id, session.state, session.last]), [['s1', 'crunching', 'build the demo']]);
  sessions = applyHookEvent(sessions, { session_id: 's1', hook_event_name: 'Stop', transcript_path: transcript }, 2000);
  assert.strictEqual(sessions[0].state, 'ready');
  assert.strictEqual(sessions[0].last, 'All 49 tests green.');
  assert.strictEqual(sessions[0].updated, 2000);
  sessions = applyHookEvent(sessions, { session_id: 's2', hook_event_name: 'SessionStart', cwd: '/y' }, 3000);
  assert.strictEqual(sessions.length, 2);
  sessions = applyHookEvent(sessions, { session_id: 's1', hook_event_name: 'SessionEnd' }, 4000);
  assert.deepStrictEqual(sessions.map((session) => session.id), ['s2']);
  assert.strictEqual(applyHookEvent(sessions, { hook_event_name: 'Stop' }, 5000), sessions, 'no session id: untouched');
  assert.strictEqual(snippet('x'.repeat(300)).length, 160);
});
