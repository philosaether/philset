#!/usr/bin/env node

// Tests for copyDirRecursive's symlink handling — the case `philset sync` hits
// on a dev box, where ~/.claude/skills/* are symlinks back into this repo.
// Everything runs in a throwaway tmpdir; the real machine is never touched.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PHILSET_BIN = path.join(__dirname, '..', 'bin', 'philset.js');

let passed = 0;

function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok - ${name}`);
}

// copyDirRecursive isn't exported (philset.js is a CLI, not a module), so pull
// the function out by source and eval it against a local fs/path. Keeps the test
// honest — it exercises the shipped text, not a copy that can drift.
function loadCopyDirRecursive() {
  const source = fs.readFileSync(PHILSET_BIN, 'utf8');
  const start = source.indexOf('function copyDirRecursive');
  assert.notStrictEqual(start, -1, 'copyDirRecursive not found in bin/philset.js');
  const end = source.indexOf('\nfunction ', start + 1);
  const body = source.slice(start, end === -1 ? undefined : end);
  // eslint-disable-next-line no-new-func
  return new Function('fs', 'path', `${body}; return copyDirRecursive;`)(fs, path);
}

const copyDirRecursive = loadCopyDirRecursive();

function makeTmp() {
  return fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'philset-sync-')));
}

// --- The dev-box case: a source entry is a symlink to a directory ---
test('copies through a symlinked source directory', () => {
  const tmp = makeTmp();
  const realSkill = path.join(tmp, 'repo', 'skills', 'draft');
  fs.mkdirSync(realSkill, { recursive: true });
  fs.writeFileSync(path.join(realSkill, 'skill.md'), '# draft\n');
  const source = path.join(tmp, 'global');
  fs.mkdirSync(source);
  fs.symlinkSync(realSkill, path.join(source, 'draft')); // the dev link
  const destination = path.join(tmp, 'project');

  copyDirRecursive(source, destination);

  const copied = path.join(destination, 'draft', 'skill.md');
  assert.ok(fs.existsSync(copied), 'symlinked skill dir was copied through');
  assert.strictEqual(fs.readFileSync(copied, 'utf8'), '# draft\n');
  assert.ok(
    !fs.lstatSync(path.join(destination, 'draft')).isSymbolicLink(),
    'destination holds real content, not a relinked symlink',
  );
});

// --- Symlinked source FILE: copyFileSync already follows, keep that ---
test('copies through a symlinked source file', () => {
  const tmp = makeTmp();
  const real = path.join(tmp, 'real.md');
  fs.writeFileSync(real, 'body\n');
  const source = path.join(tmp, 'src');
  fs.mkdirSync(source);
  fs.symlinkSync(real, path.join(source, 'link.md'));

  copyDirRecursive(source, path.join(tmp, 'dst'));

  assert.strictEqual(fs.readFileSync(path.join(tmp, 'dst', 'link.md'), 'utf8'), 'body\n');
});

// --- A dangling source symlink must not crash the whole sync ---
test('skips a dangling source symlink without throwing', () => {
  const tmp = makeTmp();
  const source = path.join(tmp, 'src');
  fs.mkdirSync(source);
  fs.writeFileSync(path.join(source, 'real.md'), 'kept\n');
  fs.symlinkSync(path.join(tmp, 'gone'), path.join(source, 'dangling.md'));

  copyDirRecursive(source, path.join(tmp, 'dst'));

  assert.ok(fs.existsSync(path.join(tmp, 'dst', 'real.md')), 'siblings still copied');
  assert.ok(!fs.existsSync(path.join(tmp, 'dst', 'dangling.md')), 'dangling link skipped');
});

// --- Regression guard: symlinked DESTINATIONS are still left alone ---
test('leaves a symlinked destination untouched', () => {
  const tmp = makeTmp();
  const source = path.join(tmp, 'src');
  fs.mkdirSync(source);
  fs.writeFileSync(path.join(source, 'skill.md'), 'new\n');
  const destination = path.join(tmp, 'dst');
  fs.mkdirSync(destination);
  const live = path.join(tmp, 'live.md');
  fs.writeFileSync(live, 'live\n');
  fs.symlinkSync(live, path.join(destination, 'skill.md')); // dev link, don't clobber

  copyDirRecursive(source, destination);

  assert.ok(fs.lstatSync(path.join(destination, 'skill.md')).isSymbolicLink(), 'link preserved');
  assert.strictEqual(fs.readFileSync(live, 'utf8'), 'live\n', 'link target not overwritten');
});

console.log(`\n${passed} tests passed`);
