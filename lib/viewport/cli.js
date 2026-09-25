'use strict';

// `philset view [dir] [--tree|--project] [--tabs a.md,b.md] [--port N] [--open] [--edit]`
// — design §1, extended for tree mode (matrix R3). The sole reader of docs
// for rendering (manifest, index, docs, mtimes, assets); write.js owns the
// --edit read/write path; the modules below are otherwise pure.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { realBaseOf, metaId, resolveInsideMeta } = require('./paths.js');
const { renderPage, cspFor } = require('./page.js');
const { resolveTabs } = require('./manifest.js');
const { createViewerServer } = require('./server.js');
const { discoverProjects, buildIndex, reindexProject, indexDoc, tokensFor, externalResolverFor, trayRecords, getDoc, docsOf } = require('./tree.js');
const { readSessions } = require('./sessions.js');

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'viewport');
const VENDOR_DIR = path.join(ASSETS_DIR, 'vendor');

function parseArgs(argv) {
  const options = { dir: process.cwd(), tabs: null, port: null, open: false, edit: false, tree: null };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--tabs') options.tabs = String(argv[++index] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg.startsWith('--tabs=')) options.tabs = arg.slice(7).split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg === '--port') options.port = Number(argv[++index]);
    else if (arg.startsWith('--port=')) options.port = Number(arg.slice(7));
    else if (arg === '--open') options.open = true;
    else if (arg === '--edit') options.edit = true;
    else if (arg === '--tree') options.tree = true;
    else if (arg === '--project') options.tree = false;
    else if (arg.startsWith('--')) { console.error(`unknown option: ${arg}`); process.exit(1); }
    else options.dir = arg;
  }
  if (options.port !== null && !(Number.isInteger(options.port) && options.port > 0 && options.port < 65536)) { console.error('--port needs a number between 1 and 65535'); process.exit(1); }
  return options;
}

function resolveMetaDir(dir) {
  const absolute = path.resolve(dir);
  const metaDir = path.basename(absolute) === '.meta' ? absolute : path.join(absolute, '.meta');
  if (!fs.existsSync(metaDir) || !fs.statSync(metaDir).isDirectory()) {
    console.error(`no .meta/ in ${absolute} — run \`philset begin\` first`);
    process.exit(1);
  }
  return metaDir;
}

// Tree mode when asked for, or when the directory's signpost says `root: true`.
function signpostSaysRoot(metaDir) {
  try { return /^root:\s*true\s*$/m.test(fs.readFileSync(path.join(metaDir, 'signpost.yml'), 'utf8')); } catch { return false; }
}

function readAssets() {
  const optional = (name) => { try { return fs.readFileSync(path.join(ASSETS_DIR, name), 'utf8'); } catch { return ''; } };
  return {
    template: fs.readFileSync(path.join(ASSETS_DIR, 'page.html'), 'utf8'),
    css: fs.readFileSync(path.join(ASSETS_DIR, 'viewport.css'), 'utf8'),
    js: fs.readFileSync(path.join(ASSETS_DIR, 'viewport.js'), 'utf8'),
    editorCss: optional('editor.css'),
  };
}

function vendorPresent() {
  return { cm: fs.existsSync(path.join(VENDOR_DIR, 'cm.js')) && fs.existsSync(path.join(ASSETS_DIR, 'editor.js')) };
}

function servedAt() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function derivedPort(id) {
  return 4700 + (parseInt(id, 16) % 200);
}

function openBrowser(url) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try { spawn(command, [url], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' }).unref(); } catch { /* best effort */ }
}

function cmdView(argv) {
  const options = parseArgs(argv);
  const metaDir = resolveMetaDir(options.dir);
  const tree = options.tree === null ? signpostSaysRoot(metaDir) : options.tree;
  const rootDir = path.dirname(realBaseOf(metaDir));
  const edit = options.edit ? { token: crypto.randomBytes(16).toString('hex') } : null;

  let projects;
  if (tree) {
    projects = discoverProjects(rootDir);
  } else {
    const realBase = realBaseOf(metaDir);
    projects = [{ key: '~', rel: '', name: path.basename(rootDir) || 'philset', projectDir: rootDir, realBase, id: metaId(realBase) }];
  }
  const index = buildIndex(projects, { tree });
  const defaultProject = index.projectByKey.get('~') || projects[0];
  if (!defaultProject) { console.error(`no .meta/ found under ${rootDir}`); process.exit(1); }
  const title = path.basename(rootDir) || 'philset';
  const registry = { defaultProject, all: projects, byKey: (key) => index.projectByKey.get(key) || null };

  const verbatim = { decode: false }; // --tabs and the manifest are not URL-encoded
  const existsIn = (project) => (rel) => resolveInsideMeta(project.realBase, rel, verbatim).ok;
  const readIfPresent = (project, rel) => { const resolved = resolveInsideMeta(project.realBase, rel, verbatim); return resolved.ok ? fs.readFileSync(resolved.real, 'utf8') : null; };

  function resolveTabPaths(project) {
    const result = resolveTabs({
      manifestText: readIfPresent(project, 'viewport.yml'),
      indexText: readIfPresent(project, 'designs/index.md'),
      tabsArg: project === defaultProject ? options.tabs : null,
      exists: existsIn(project),
    });
    // The hub's day-state (`today.md`, hub-session-v2) leads the root page when it exists.
    if (tree && project === defaultProject && result.source === 'default' && existsIn(project)('today.md')) result.tabs.unshift({ path: 'today.md' });
    return result;
  }

  function loadDocs(project, tabs) {
    const docs = [];
    for (const tab of tabs) {
      const resolved = resolveInsideMeta(project.realBase, tab.path, verbatim);
      if (!resolved.ok) { console.error(`  skipped ${tab.path}: ${resolved.status === 404 ? 'not found' : 'outside .meta'}`); continue; }
      const text = fs.readFileSync(resolved.real, 'utf8');
      const stat = fs.statSync(resolved.real);
      let indexed = getDoc(index, project.key, resolved.rel);
      if (!indexed) { indexed = indexDoc(text, { project: project.key, rel: resolved.rel, mtimeMs: stat.mtimeMs, bytes: stat.size }); indexed.url = project.urlBase + resolved.rel; }
      docs.push({ path: resolved.rel, label: tab.label, role: tab.role, text, mtimeMs: stat.mtimeMs, tokens: tokensFor(index, indexed) });
    }
    return docs;
  }

  function build(project, docs, mode, note = '', pageTitle = title) {
    const nonce = crypto.randomBytes(12).toString('base64');
    const html = renderPage({
      assets: readAssets(), title: pageTitle, metaDirDisplay: project.realBase, servedAt: servedAt(), nonce, metaId: project.id, docs, mode, note, edit,
      project, external: externalResolverFor(index, project.key), tree, projectCount: projects.length, rootDir,
      sessions: tree && project === defaultProject && mode === 'index' ? readSessions() : null, vendor: vendorPresent(),
    });
    return { html, csp: cspFor(nonce) };
  }

  const viewer = createViewerServer({
    projects: registry,
    edit,
    buildPage: (project) => { const resolved = resolveTabPaths(project); return build(project, loadDocs(project, resolved.tabs), 'index', resolved.note, resolved.title || (project.rel ? project.name : title)); },
    buildDocPage: (project, rel) => build(project, loadDocs(project, [{ path: rel }]), 'doc'),
    apiIndex: () => ({ builtAt: index.builtAt, tree, projects: projects.map((project) => ({ key: project.key, name: project.name, url: project.urlBase, docs: docsOf(index, project.key).length })), docs: trayRecords(index) }),
    apiSessions: () => ({ root: rootDir, sessions: readSessions() }),
    onChange: (project) => reindexProject(index, project),
    vendorDirs: [VENDOR_DIR, ASSETS_DIR],
    log: (line) => console.error(`  ${line}`),
  });

  const startup = resolveTabPaths(defaultProject);
  startup.warnings.forEach((warning) => console.error(`  ${warning}`));
  if (startup.note) console.error(`  designs/index.md: ${startup.note}`);
  const tabCount = loadDocs(defaultProject, startup.tabs).length;
  const docCount = projects.reduce((sum, project) => sum + docsOf(index, project.key).length, 0);
  const firstPort = options.port || derivedPort(defaultProject.id);
  let attempt = 0;
  function listen(port) {
    viewer.server.once('error', (error) => {
      if (error.code === 'EADDRINUSE' && !options.port && attempt < 9) { attempt++; return listen(port + 1); }
      console.error(`cannot listen on 127.0.0.1:${port}: ${error.message}`);
      process.exit(1);
    });
    viewer.server.listen(port, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${port}/`;
      if (port !== firstPort) console.error(`  port ${firstPort} was busy; checkmarks for this project live on ${firstPort}`);
      const scope = tree ? `tree ${rootDir} · ${projects.length} projects · ${docCount} docs` : `${defaultProject.realBase} · ${tabCount} tab${tabCount === 1 ? '' : 's'}`;
      const editor = edit ? (vendorPresent().cm ? ' · edit mode (live preview, saved in place)' : ' · edit mode (raw markdown, saved in place)') : '';
      console.log(`philset view · ${scope} · ${url}${editor}`);
      viewer.watch();
      if (options.open) openBrowser(url);
    });
  }
  listen(firstPort);
}

module.exports = { cmdView };
