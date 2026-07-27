#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const readline = require('readline');
const os = require('os');

const PACKAGE_ROOT = path.join(__dirname, '..');
const SKILLS_SOURCE = path.join(PACKAGE_ROOT, 'skills');
const TEMPLATES_DIR = path.join(PACKAGE_ROOT, 'templates');
const REFERENCES_SOURCE = path.join(PACKAGE_ROOT, 'references');
const GLOBAL_SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');

// --- Utilities ---

function expandTilde(filepath) {
  if (filepath.startsWith('~/')) {
    return path.join(os.homedir(), filepath.slice(2));
  }
  return filepath;
}

function copyDirRecursive(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    // Skip destinations that are symlinks — a dev environment links skills/refs
    // back into this repo (via `npm run link`), so copying would resolve to the
    // same file (EINVAL) or clobber the live link. Leave dev links alone; users
    // with real copies are unaffected.
    const destLink = fs.lstatSync(destinationPath, { throwIfNoEntry: false });
    if (destLink && destLink.isSymbolicLink()) {
      continue;
    }
    // Dereference symlinked SOURCES. readdir's Dirent uses lstat semantics, so a
    // symlink pointing at a directory reports isDirectory() === false and would
    // fall through to copyFileSync — which fails (EISDIR on Linux, ENOTSUP on
    // macOS). `philset sync` hits this on a dev box, where ~/.claude/skills/*
    // are symlinks back into this repo. Dereference rather than skip: sync's job
    // is to copy the real skill content into the shared project.
    let sourceIsDirectory = entry.isDirectory();
    if (entry.isSymbolicLink()) {
      const resolved = fs.statSync(sourcePath, { throwIfNoEntry: false });
      if (!resolved) continue; // dangling link — nothing to copy
      sourceIsDirectory = resolved.isDirectory();
    }
    if (sourceIsDirectory) {
      copyDirRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath); // follows symlinked files
    }
  }
}

function copyTemplate(templateName, destinationPath) {
  const source = path.join(TEMPLATES_DIR, templateName);
  fs.copyFileSync(source, destinationPath);
}

function findRoot(startDir) {
  let current = startDir;
  const home = os.homedir();
  while (current !== home && current !== path.dirname(current)) {
    const signpostPath = path.join(current, '.meta', 'signpost.yml');
    if (fs.existsSync(signpostPath)) {
      const content = fs.readFileSync(signpostPath, 'utf8');
      if (content.includes('root: true')) {
        return current;
      }
    }
    current = path.dirname(current);
  }
  return null;
}

// Walk startDir → $HOME reading each level's .meta/signpost.yml; the closest
// occurrence of `field:` wins (child overrides parent, matching skill-side
// signpost inheritance). Returns the value with any trailing comment stripped.
function findSignpostField(startDir, field) {
  let current = startDir;
  const home = os.homedir();
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fieldPattern = new RegExp(`^${escapedField}:(.*)$`, 'm');
  while (true) {
    const signpostPath = path.join(current, '.meta', 'signpost.yml');
    if (fs.existsSync(signpostPath)) {
      const match = fs.readFileSync(signpostPath, 'utf8').match(fieldPattern);
      if (match) {
        const value = match[1].split('#')[0].trim();
        if (value) return value;
      }
    }
    if (current === home || current === path.dirname(current)) return null;
    current = path.dirname(current);
  }
}

// Resolve the central-meta repo location: env override (tests, sandboxes) →
// inherited signpost field → null. Null means the feature is off and philset
// behaves exactly as it did before central-meta existed.
function resolveCentral(cwd) {
  const configured = process.env.PHILSET_CENTRAL || findSignpostField(cwd, 'central-meta');
  return configured ? expandTilde(configured) : null;
}

// Initialize the central repo on first use. Inbox binaries stay out of git;
// text state (including .eml email drops) stays tracked.
function ensureCentralRepo(centralDir) {
  if (fs.existsSync(path.join(centralDir, '.git'))) return;
  ensureDir(centralDir);
  execFileSync('git', ['init'], { cwd: centralDir, stdio: 'ignore' });
  const gitignorePath = path.join(centralDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, [
      '**/.DS_Store',
      '**/inbox/*.pdf',
      '**/inbox/*.png',
      '**/inbox/*.jpg',
      '**/inbox/*.jpeg',
      '**/inbox/*.gif',
      '',
    ].join('\n'));
  }
  const readmePath = path.join(centralDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath,
      '# Central .meta state\n\n' +
      'One private repo versioning all philset `.meta/` state, mirrored by path\n' +
      'relative to `$HOME`. Each project\'s `.meta` on disk is a symlink into this\n' +
      'repo (`philset adopt`). Committed once per session by `/ttyl`.\n');
  }
  try {
    execFileSync('git', ['add', '-A'], { cwd: centralDir });
    execFileSync('git', ['commit', '-m', 'init: central .meta state repo'], {
      cwd: centralDir, stdio: 'ignore',
    });
  } catch {
    console.log('  central-meta: initial commit failed (git identity unset?) — repo initialized, commit left to you.');
  }
  console.log(`  central-meta: initialized ${centralDir}`);
}

// Exclude .meta locally via .git/info/exclude. Pattern is `/.meta` with NO
// trailing slash: after adoption .meta is a symlink, and git's dir-only
// patterns (`/.meta/`) do not match symlinks.
function ensureMetaExcluded(cwd) {
  let gitTop;
  try {
    gitTop = execSync('git rev-parse --show-toplevel', {
      cwd, stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
  } catch {
    return; // not a git repo — nothing to exclude
  }
  const excludePath = path.join(gitTop, '.git', 'info', 'exclude');
  const rel = path.relative(gitTop, path.join(cwd, '.meta')).split(path.sep).join('/');
  const pattern = `/${rel}`;
  ensureDir(path.dirname(excludePath));
  let exclude = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!exclude.split('\n').some((line) => line.trim() === pattern)) {
    if (exclude.length && !exclude.endsWith('\n')) exclude += '\n';
    fs.writeFileSync(excludePath, exclude + `${pattern}\n`);
  }
}

// Make this project's .meta central-backed. Idempotent; the five cases are
// pinned by test/adopt.test.js. Never merges: when both local and central hold
// state, stop and let the human reconcile (accepted-design call).
function adoptMeta(cwd, centralDir) {
  const metaDir = path.join(cwd, '.meta');
  // realpath both sides: a symlinked $HOME or cwd (macOS /var -> /private/var,
  // a linked ~/Development) would otherwise make cwd look outside $HOME.
  const relFromHome = path.relative(fs.realpathSync(os.homedir()), fs.realpathSync(cwd));
  if (relFromHome.startsWith('..') || path.isAbsolute(relFromHome)) {
    console.error(`  central-meta: ${cwd} is outside $HOME — cannot mirror by home-relative path.`);
    process.exit(1);
  }
  const target = path.join(centralDir, relFromHome, '.meta');

  const linkStat = fs.lstatSync(metaDir, { throwIfNoEntry: false });
  const targetExists = fs.existsSync(target);

  if (linkStat && linkStat.isSymbolicLink()) {
    const currentDest = path.resolve(path.dirname(metaDir), fs.readlinkSync(metaDir));
    if (currentDest === target && targetExists) {
      return; // case 1: already adopted
    }
    if (fs.existsSync(metaDir)) {
      console.error(`  central-meta: .meta is a symlink to ${currentDest}, not the central target ${target}. Fix by hand.`);
      process.exit(1);
    }
    if (!targetExists) {
      console.error(`  central-meta: .meta is a dangling symlink (${currentDest}) and central has no state at ${target}. Fix by hand.`);
      process.exit(1);
    }
    fs.unlinkSync(metaDir); // dangling link, central has state — relink below (case 2)
  } else if (linkStat) {
    // real local .meta — refuse if the host repo TRACKS it: that state already
    // travels with the repo itself, and adoption would make git see every
    // tracked .meta file as deleted (info/exclude only hides untracked files).
    let gitTop = null;
    try {
      gitTop = execSync('git rev-parse --show-toplevel', {
        cwd, stdio: ['ignore', 'pipe', 'ignore'],
      }).toString().trim();
    } catch {
      // not a git repo — nothing tracked, adoption is safe
    }
    if (gitTop && isTracked(gitTop, metaDir)) {
      console.error('  central-meta: this repo TRACKS .meta — its state already syncs through the repo itself.');
      console.error('  Adoption is for private/untracked .meta (private-meta repos). Nothing moved.');
      process.exit(1);
    }
    if (targetExists) {
      console.error('  central-meta: CONFLICT — both local and central hold state:');
      console.error(`    local:   ${metaDir}`);
      console.error(`    central: ${target}`);
      console.error('  Merge by hand, remove one side, then re-run.');
      process.exit(1); // case 4: no auto-merge
    }
    ensureDir(path.dirname(target));
    try {
      fs.renameSync(metaDir, target); // case 3: move into central
    } catch (error) {
      if (error.code === 'EXDEV') {
        // rename fails atomically — nothing moved, nothing to clean up
        console.error(`  central-meta: cannot move .meta across filesystems (central at ${centralDir}).`);
        console.error('  Keep the central repo on the same volume as your projects.');
        process.exit(1);
      }
      throw error;
    }
    const nestedGit = path.join(target, '.git');
    if (fs.existsSync(nestedGit)) {
      fs.rmSync(nestedGit, { recursive: true }); // e.g. a stray 0-commit repo
    }
    console.log(`  central-meta: moved .meta into ${target}`);
  } else if (!targetExists) {
    return; // case 5: nothing local, nothing central — scaffold-then-adopt handles it
  }

  fs.symlinkSync(target, metaDir);
  console.log(`  central-meta: linked .meta -> ${target}`);
  ensureMetaExcluded(cwd);
  try {
    execFileSync('git', ['add', '-A'], { cwd: centralDir }); // commit left to /ttyl
  } catch {
    // staging is best-effort; /ttyl stages again before committing
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function gitkeep(dirPath) {
  ensureDir(dirPath);
  const keepFile = path.join(dirPath, '.gitkeep');
  if (!fs.existsSync(keepFile)) {
    fs.writeFileSync(keepFile, '');
  }
}

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function diffReport(sourceDir, targetDir) {
  const changes = [];
  if (!fs.existsSync(targetDir)) {
    changes.push(`  + ${path.basename(targetDir)}/ (new)`);
    return changes;
  }
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      changes.push(...diffReport(sourcePath, targetPath));
    } else {
      if (!fs.existsSync(targetPath)) {
        changes.push(`  + ${entry.name} (new)`);
      } else {
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');
        const targetContent = fs.readFileSync(targetPath, 'utf8');
        if (sourceContent !== targetContent) {
          changes.push(`  ~ ${entry.name} (updated)`);
        }
      }
    }
  }
  return changes;
}

// --- Commands ---

async function cmdInit() {
  const defaultRoot = path.join(os.homedir(), 'Development');
  const answer = await prompt(`Root development directory [${defaultRoot}]: `);
  const root = answer || defaultRoot;
  const expandedRoot = expandTilde(root);

  const metaDir = path.join(expandedRoot, '.meta');
  const referencesDir = path.join(metaDir, 'references');

  // Create root .meta/
  ensureDir(metaDir);

  if (!fs.existsSync(path.join(metaDir, 'signpost.yml'))) {
    copyTemplate('signpost-root.yml', path.join(metaDir, 'signpost.yml'));
  }
  if (!fs.existsSync(path.join(metaDir, 'WORKFLOW.md'))) {
    copyTemplate('WORKFLOW.md', path.join(metaDir, 'WORKFLOW.md'));
  }

  // Install references
  copyDirRecursive(REFERENCES_SOURCE, referencesDir);

  // Init git repo if not already
  if (!fs.existsSync(path.join(metaDir, '.git'))) {
    try {
      execSync('git init', { cwd: metaDir, stdio: 'ignore' });
    } catch {
      // git not available — not fatal
    }
  }

  // Install skills globally
  copyDirRecursive(SKILLS_SOURCE, GLOBAL_SKILLS_DIR);

  console.log(`\nphilset initialized.`);
  console.log(`  Root: ${expandedRoot}`);
  console.log(`  Skills installed to: ${GLOBAL_SKILLS_DIR}`);
  console.log(`  References installed to: ${referencesDir}`);
  console.log(`\nRun \`philset begin\` in any project directory,`);
  console.log(`or launch claude and type \`/hello\`.`);
}

// Is `filePath` tracked by the git repo at `gitTop`? Used so private mode never
// hides a file the host repo already commits (e.g. their own CLAUDE.md).
function isTracked(gitTop, filePath) {
  try {
    const rel = path.relative(gitTop, filePath).split(path.sep).join('/');
    execFileSync('git', ['ls-files', '--error-unmatch', '--', rel], {
      cwd: gitTop, stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

// Make .meta/ private to this clone: set the signpost flag and ignore .meta/
// (plus any philset-scaffolded CLAUDE.md) locally via .git/info/exclude — never
// the tracked .gitignore, so teammates see nothing. Lets philset run inside a
// shared repo with no dev buy-in.
function enablePrivateMeta(cwd) {
  const metaDir = path.join(cwd, '.meta');

  // 1. Set private-meta: true in signpost.yml (create it if needed).
  ensureDir(metaDir);
  const signpostPath = path.join(metaDir, 'signpost.yml');
  if (fs.existsSync(signpostPath)) {
    let content = fs.readFileSync(signpostPath, 'utf8');
    if (/^private-meta:/m.test(content)) {
      content = content.replace(/^private-meta:.*$/m, 'private-meta: true');
    } else {
      if (content.length && !content.endsWith('\n')) content += '\n';
      content += 'private-meta: true\n';
    }
    fs.writeFileSync(signpostPath, content);
  } else {
    fs.writeFileSync(signpostPath, 'private-meta: true\n');
  }

  // 2. Ignore .meta/ locally, invisibly, via .git/info/exclude.
  let gitTop;
  try {
    gitTop = execSync('git rev-parse --show-toplevel', {
      cwd, stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
  } catch {
    console.log('  private-meta: flag set (not a git repo — skipped local git exclude).');
    return;
  }
  let excludePath;
  try {
    const raw = execSync('git rev-parse --git-path info/exclude', {
      cwd, stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
    excludePath = path.resolve(cwd, raw);
  } catch {
    excludePath = path.join(gitTop, '.git', 'info', 'exclude');
  }
  // Hide .meta/ always; hide CLAUDE.md too, but only if it exists and the host
  // repo doesn't already track it (never hide their own file).
  const toHide = [metaDir];
  const claudeMd = path.join(cwd, 'CLAUDE.md');
  if (fs.existsSync(claudeMd) && !isTracked(gitTop, claudeMd)) {
    toHide.push(claudeMd);
  }

  ensureDir(path.dirname(excludePath));
  let exclude = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  for (const target of toHide) {
    const rel = path.relative(gitTop, target).split(path.sep).join('/');
    // Anchored, slash-less — the same form ensureMetaExcluded writes. A trailing
    // slash makes the pattern dir-only, and git dir-only patterns never match a
    // symlink, so an adopted .meta (a symlink into central) would go unignored
    // and show up in a teammate's `git status`. Slash-less matches both.
    const pattern = `/${rel}`;
    const present = exclude.split('\n').some((line) => line.trim() === pattern);
    if (present) {
      console.log(`  private-meta: ${pattern} already excluded locally.`);
    } else {
      if (exclude.length && !exclude.endsWith('\n')) exclude += '\n';
      exclude += `${pattern}\n`;
      console.log(`  private-meta: ${pattern} ignored locally via .git/info/exclude (invisible to teammates).`);
    }
  }
  fs.writeFileSync(excludePath, exclude);
}

// Adopt/relink the current project's .meta into the central repo. The shared
// entry point for `philset private` (internal) and /hello, /hey (relink offers).
function cmdAdopt() {
  const cwd = process.cwd();
  const centralDir = resolveCentral(cwd);
  if (!centralDir) {
    console.error('central-meta is not configured.');
    console.error('Set `central-meta: <path>` in a signpost.yml up the tree (or PHILSET_CENTRAL).');
    process.exit(1);
  }
  ensureCentralRepo(centralDir);
  adoptMeta(cwd, centralDir);
}

function cmdBegin(options = {}) {
  const cwd = process.cwd();
  const metaDir = path.join(cwd, '.meta');
  const centralDir = options.private ? resolveCentral(cwd) : null;

  // Relink a central-backed .meta (the re-clone case) BEFORE the scaffold
  // check — otherwise we'd scaffold a fresh .meta over restorable state and
  // turn a one-prompt relink into a both-exist conflict.
  if (centralDir) {
    ensureCentralRepo(centralDir);
    adoptMeta(cwd, centralDir);
  }

  // Scaffold .meta/ if it doesn't exist
  if (!fs.existsSync(metaDir)) {
    ensureDir(metaDir);
    copyTemplate('meta-README.md', path.join(metaDir, 'README.md'));
    copyTemplate('decisions.md', path.join(metaDir, 'decisions.md'));
    copyTemplate('in-progress.md', path.join(metaDir, 'in-progress.md'));
    copyTemplate('roadmap.md', path.join(metaDir, 'roadmap.md'));
    gitkeep(path.join(metaDir, 'designs'));
    gitkeep(path.join(metaDir, 'tracks'));
    gitkeep(path.join(metaDir, 'assessments'));
    ensureDir(path.join(metaDir, 'inbox'));
    copyTemplate('todo.md', path.join(metaDir, 'inbox', 'todo.md'));
    console.log('Scaffolded .meta/ directory');
  }

  // Create CLAUDE.md if it doesn't exist
  if (!fs.existsSync(path.join(cwd, 'CLAUDE.md'))) {
    copyTemplate('CLAUDE.md', path.join(cwd, 'CLAUDE.md'));
    console.log('Created CLAUDE.md from template');
  }

  // Make .meta/ private to this clone before launching (shared-repo mode)
  if (options.private) {
    enablePrivateMeta(cwd);
  }

  // Move a freshly-scaffolded .meta into central (no-op if adopted above)
  if (centralDir) {
    adoptMeta(cwd, centralDir);
  }

  // Launch claude
  const claudeArgs = options.dsp ? ' --dangerously-skip-permissions' : '';
  try {
    execSync(`claude${claudeArgs}`, { cwd, stdio: 'inherit' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('claude is not installed or not on PATH.');
      console.error('Install Claude Code: https://docs.anthropic.com/en/docs/claude-code');
      process.exit(1);
    }
    // claude exited — codes 0-1 are normal
    if (error.status && error.status > 1) {
      console.error(`claude exited with code ${error.status}`);
      process.exit(error.status);
    }
  }
}

function cmdUpdate() {
  const root = findRoot(process.cwd());
  if (!root) {
    console.error('No philset root found. Run `philset init` first.');
    process.exit(1);
  }

  // Update skills
  const skillChanges = diffReport(SKILLS_SOURCE, GLOBAL_SKILLS_DIR);
  copyDirRecursive(SKILLS_SOURCE, GLOBAL_SKILLS_DIR);

  // Update references
  const referencesDir = path.join(root, '.meta', 'references');
  const refChanges = diffReport(REFERENCES_SOURCE, referencesDir);
  copyDirRecursive(REFERENCES_SOURCE, referencesDir);

  if (skillChanges.length === 0 && refChanges.length === 0) {
    console.log('Everything is up to date.');
  } else {
    if (skillChanges.length > 0) {
      console.log('Skills:');
      skillChanges.forEach((change) => console.log(change));
    }
    if (refChanges.length > 0) {
      console.log('References:');
      refChanges.forEach((change) => console.log(change));
    }
  }
}

function cmdSync(options = {}) {
  const cwd = process.cwd();
  const projectSkillsDir = path.join(cwd, '.claude', 'skills');

  if (options.remove) {
    if (fs.existsSync(projectSkillsDir)) {
      fs.rmSync(projectSkillsDir, { recursive: true });
      console.log('Removed .claude/skills/ — using global skills.');
    } else {
      console.log('No project-local skills to remove.');
    }
    return;
  }

  if (!fs.existsSync(GLOBAL_SKILLS_DIR)) {
    console.error('No global skills found. Run `philset init` or `philset update` first.');
    process.exit(1);
  }

  const changes = diffReport(GLOBAL_SKILLS_DIR, projectSkillsDir);
  copyDirRecursive(GLOBAL_SKILLS_DIR, projectSkillsDir);

  if (changes.length === 0) {
    console.log('Project skills are up to date.');
  } else {
    console.log('Synced to .claude/skills/:');
    changes.forEach((change) => console.log(change));
  }
}

function cmdHelp() {
  console.log(`philset — Claude Code skills for iterative, document-driven development

Usage:
  philset init              First-time setup (root dir, skills, references)
  philset begin [--dsp] [--private]
                            Scaffold .meta/ + CLAUDE.md if needed, launch claude
  philset dsp               Alias for begin --dsp
  philset private [--dsp]   Alias for begin --private: ignore .meta/ locally
                            (via .git/info/exclude) for a shared repo, then launch.
                            With central-meta configured, also adopts/relinks .meta
                            into the central state repo (symlink farm)
  philset adopt             Adopt/relink this project's .meta into the central
                            repo named by the \`central-meta:\` signpost field
                            (or PHILSET_CENTRAL). No-op if already adopted;
                            stops on a local↔central conflict
  philset update            Update global skills and reference docs
  philset sync [--remove]   Copy (or remove) skills to project .claude/skills/
  philset help              Show this message

Quick start:
  philset init              # one-time setup
  cd my-project && philset dsp        # start working
  cd shared-repo && philset private --dsp   # start in someone else's repo`);
}

// --- Main ---

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'begin':
    cmdBegin({ dsp: args.includes('--dsp'), private: args.includes('--private') });
    break;
  case 'dsp':
    cmdBegin({ dsp: true, private: args.includes('--private') });
    break;
  case 'private':
    cmdBegin({ private: true, dsp: args.includes('--dsp') });
    break;
  case 'adopt':
    cmdAdopt();
    break;
  case 'update':
    cmdUpdate();
    break;
  case 'sync':
    cmdSync({ remove: args.includes('--remove') });
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    cmdHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    cmdHelp();
    process.exit(1);
}
