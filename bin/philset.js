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
    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
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
    const isDir = fs.existsSync(target) && fs.statSync(target).isDirectory();
    const pattern = `/${rel}${isDir ? '/' : ''}`;
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

function cmdBegin(options = {}) {
  const cwd = process.cwd();
  const metaDir = path.join(cwd, '.meta');

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
                            (via .git/info/exclude) for a shared repo, then launch
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
