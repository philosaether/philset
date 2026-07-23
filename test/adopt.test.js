#!/usr/bin/env node

// Sandboxed tests for `philset adopt` — the five adopt/relink cases the
// central-meta-port design pins (see .meta/designs/central-meta-port.md).
// Everything runs under a throwaway $HOME; the real machine is never touched.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const PHILSET_BIN = path.join(__dirname, '..', 'bin', 'philset.js');

let passed = 0;

function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok - ${name}`);
}

// Fresh sandbox: fake $HOME with a project dir and a central location.
function makeSandbox() {
  // realpath: macOS tmpdir lives behind a /var → /private/var symlink, and
  // adoptMeta computes paths relative to $HOME from a resolved process.cwd().
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'philset-adopt-')));
  const projectDir = path.join(home, 'Development', 'proj');
  fs.mkdirSync(projectDir, { recursive: true });
  const centralDir = path.join(home, 'central');
  // Git identity for the sandbox so ensureCentralRepo's init commit works.
  const gitconfig = path.join(home, 'gitconfig');
  fs.writeFileSync(gitconfig, '[user]\n  name = Test\n  email = test@example.invalid\n');
  const env = {
    ...process.env,
    HOME: home,
    PHILSET_CENTRAL: centralDir,
    GIT_CONFIG_GLOBAL: gitconfig,
  };
  return { home, projectDir, centralDir, env };
}

function runAdopt(sandbox, cwd) {
  return execFileSync('node', [PHILSET_BIN, 'adopt'], {
    cwd: cwd || sandbox.projectDir, env: sandbox.env, encoding: 'utf8',
  });
}

function runAdoptExpectFailure(sandbox, cwd) {
  try {
    execFileSync('node', [PHILSET_BIN, 'adopt'], {
      cwd: cwd || sandbox.projectDir, env: sandbox.env,
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    return error;
  }
  assert.fail('expected adopt to exit non-zero');
}

function centralTarget(sandbox) {
  return path.join(sandbox.centralDir, 'Development', 'proj', '.meta');
}

// --- Case 3: real local .meta, central absent → move in + symlink back ---
test('fresh adopt moves .meta into central and symlinks back', () => {
  const sandbox = makeSandbox();
  const metaDir = path.join(sandbox.projectDir, '.meta');
  fs.mkdirSync(metaDir);
  fs.writeFileSync(path.join(metaDir, 'decisions.md'), 'state\n');
  // A stray nested repo (the 0-commit .git case) gets dropped on the move.
  fs.mkdirSync(path.join(metaDir, '.git'));

  runAdopt(sandbox);

  const target = centralTarget(sandbox);
  assert.ok(fs.lstatSync(metaDir).isSymbolicLink(), '.meta is a symlink');
  assert.strictEqual(fs.realpathSync(metaDir), fs.realpathSync(target));
  assert.strictEqual(fs.readFileSync(path.join(target, 'decisions.md'), 'utf8'), 'state\n');
  assert.ok(!fs.existsSync(path.join(target, '.git')), 'nested .git dropped');
  assert.ok(fs.existsSync(path.join(sandbox.centralDir, '.git')), 'central repo initialized');
  assert.ok(fs.existsSync(path.join(sandbox.centralDir, '.gitignore')), 'central .gitignore written');
});

// --- Case 1: already adopted → no-op ---
test('re-running adopt is a no-op', () => {
  const sandbox = makeSandbox();
  const metaDir = path.join(sandbox.projectDir, '.meta');
  fs.mkdirSync(metaDir);
  fs.writeFileSync(path.join(metaDir, 'decisions.md'), 'state\n');
  runAdopt(sandbox);
  const linkBefore = fs.readlinkSync(metaDir);

  runAdopt(sandbox);

  assert.strictEqual(fs.readlinkSync(metaDir), linkBefore, 'symlink unchanged');
  assert.strictEqual(
    fs.readFileSync(path.join(centralTarget(sandbox), 'decisions.md'), 'utf8'), 'state\n');
});

// --- Case 2: central has state, local missing → relink (re-clone) ---
test('re-clone relink restores the symlink from central state', () => {
  const sandbox = makeSandbox();
  const metaDir = path.join(sandbox.projectDir, '.meta');
  fs.mkdirSync(metaDir);
  fs.writeFileSync(path.join(metaDir, 'decisions.md'), 'state\n');
  runAdopt(sandbox);
  fs.unlinkSync(metaDir); // simulate a fresh clone: no .meta on disk

  runAdopt(sandbox);

  assert.ok(fs.lstatSync(metaDir).isSymbolicLink(), 'symlink restored');
  assert.strictEqual(
    fs.readFileSync(path.join(metaDir, 'decisions.md'), 'utf8'), 'state\n');
});

// --- Case 2 variant: dangling symlink into central → relink ---
test('dangling foreign symlink with central state is relinked', () => {
  const sandbox = makeSandbox();
  const metaDir = path.join(sandbox.projectDir, '.meta');
  fs.mkdirSync(metaDir);
  fs.writeFileSync(path.join(metaDir, 'decisions.md'), 'state\n');
  runAdopt(sandbox);
  // Simulate a link left behind by an old machine layout: dangling.
  fs.unlinkSync(metaDir);
  fs.symlinkSync(path.join(sandbox.home, 'gone', '.meta'), metaDir);

  runAdopt(sandbox);

  assert.strictEqual(fs.realpathSync(metaDir), fs.realpathSync(centralTarget(sandbox)));
});

// --- Case 5: neither local nor central → no-op, exit 0 ---
test('nothing local, nothing central: no-op success', () => {
  const sandbox = makeSandbox();

  runAdopt(sandbox);

  assert.ok(!fs.existsSync(path.join(sandbox.projectDir, '.meta')), 'no .meta invented');
});

// --- Case 4: both exist → conflict, exit 1, nothing moved ---
test('both-exist conflict exits 1 and moves nothing', () => {
  const sandbox = makeSandbox();
  const metaDir = path.join(sandbox.projectDir, '.meta');
  fs.mkdirSync(metaDir);
  fs.writeFileSync(path.join(metaDir, 'decisions.md'), 'local\n');
  const target = centralTarget(sandbox);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'decisions.md'), 'central\n');

  const error = runAdoptExpectFailure(sandbox);

  assert.strictEqual(error.status, 1);
  assert.match(error.stderr, /CONFLICT/);
  assert.ok(fs.lstatSync(metaDir).isDirectory(), 'local .meta untouched');
  assert.strictEqual(fs.readFileSync(path.join(metaDir, 'decisions.md'), 'utf8'), 'local\n');
  assert.strictEqual(fs.readFileSync(path.join(target, 'decisions.md'), 'utf8'), 'central\n');
});

// --- Guard: unset flag → clear error, exit 1 ---
test('adopt without central-meta configured fails with guidance', () => {
  const sandbox = makeSandbox();
  delete sandbox.env.PHILSET_CENTRAL;

  const error = runAdoptExpectFailure(sandbox);

  assert.strictEqual(error.status, 1);
  assert.match(error.stderr, /central-meta is not configured/);
});

// --- Signpost resolution: field read through the tree walk, comments stripped ---
test('central-meta resolves from an ancestor signpost.yml', () => {
  const sandbox = makeSandbox();
  delete sandbox.env.PHILSET_CENTRAL;
  const rootMeta = path.join(sandbox.home, 'Development', '.meta');
  fs.mkdirSync(rootMeta, { recursive: true });
  fs.writeFileSync(path.join(rootMeta, 'signpost.yml'),
    `root: true\ncentral-meta: ${sandbox.centralDir} # inherited by proj\n`);
  const metaDir = path.join(sandbox.projectDir, '.meta');
  fs.mkdirSync(metaDir);
  fs.writeFileSync(path.join(metaDir, 'decisions.md'), 'state\n');

  runAdopt(sandbox);

  assert.ok(fs.lstatSync(metaDir).isSymbolicLink(), '.meta adopted via signpost field');
  assert.strictEqual(fs.realpathSync(metaDir), fs.realpathSync(centralTarget(sandbox)));
});

// --- Exclude: inside a git repo, /.meta lands in .git/info/exclude ---
test('adoption excludes /.meta (no trailing slash) in a git repo', () => {
  const sandbox = makeSandbox();
  execFileSync('git', ['init'], { cwd: sandbox.projectDir, env: sandbox.env, stdio: 'ignore' });
  const metaDir = path.join(sandbox.projectDir, '.meta');
  fs.mkdirSync(metaDir);
  fs.writeFileSync(path.join(metaDir, 'decisions.md'), 'state\n');

  runAdopt(sandbox);

  const exclude = fs.readFileSync(
    path.join(sandbox.projectDir, '.git', 'info', 'exclude'), 'utf8');
  assert.ok(exclude.split('\n').includes('/.meta'), 'symlink-safe exclude pattern present');
  const status = execFileSync('git', ['status', '--porcelain'], {
    cwd: sandbox.projectDir, env: sandbox.env, encoding: 'utf8',
  });
  assert.ok(!status.includes('.meta'), 'git does not see the .meta symlink');
});

console.log(`\n${passed} tests passed`);
