#!/usr/bin/env node
// Developer-only. Symlinks this repo's skills and references into their deployed
// locations so edits are live — no copy, no drift, new items picked up
// automatically. NOT part of the shipped `philset` CLI (users get copies via
// `philset init`/`update`); this is a repo-local dev chore. Run: `npm run link`.
//
// Excluded from the npm package (`files` in package.json omits scripts/), so it
// never reaches users. References become machine-local symlinks pointing at
// absolute repo paths — don't commit those into the root .meta repo.

const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_ROOT = path.join(__dirname, '..');
const SKILLS_SOURCE = path.join(REPO_ROOT, 'skills');
const REFERENCES_SOURCE = path.join(REPO_ROOT, 'references');
const GLOBAL_SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');

// Walk up from startDir to the tree root (signpost with `root: true`).
function findRoot(startDir) {
  let current = startDir;
  const home = os.homedir();
  while (current !== home && current !== path.dirname(current)) {
    const signpostPath = path.join(current, '.meta', 'signpost.yml');
    if (fs.existsSync(signpostPath)
      && fs.readFileSync(signpostPath, 'utf8').includes('root: true')) {
      return current;
    }
    current = path.dirname(current);
  }
  return null;
}

// Replace whatever is at `target` (file, dir, or symlink — including a broken
// one) with a fresh symlink to `source`.
function link(source, target) {
  if (fs.lstatSync(target, { throwIfNoEntry: false })) {
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.symlinkSync(source, target);
}

function linkDir(sourceDir, destDir, label) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir);
  for (const entry of entries) {
    link(path.join(sourceDir, entry), path.join(destDir, entry));
  }
  console.log(`  linked ${entries.length} ${label} → ${destDir}`);
}

// Skills → ~/.claude/skills/<name>
linkDir(SKILLS_SOURCE, GLOBAL_SKILLS_DIR, 'skills');

// References → <root>/.meta/references/<name>
const root = findRoot(process.cwd());
if (!root) {
  console.error('\nNo philset root (signpost `root: true`) found from cwd.');
  console.error('Skills linked, but references were skipped — run from inside the philset tree.');
  process.exit(1);
}
linkDir(REFERENCES_SOURCE, path.join(root, '.meta', 'references'), 'references');

console.log('\nDev symlinks in place. Edits to skills/ and references/ are now live.');
console.log('Note: references/ are now machine-local symlinks — don\'t commit them to the root .meta repo.');
