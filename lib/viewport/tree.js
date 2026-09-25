'use strict';

// Tree mode (platform matrix, ruling R3): the process root is the tree, every
// `.meta/` under it is a project, and one index serves the document tray
// (A23) and token → definition (A24). A token resolves by *neighborhood* —
// same doc, then the docs it links to, then the project's designs, then the
// project — never globally: the label namespace collides across docs by
// design (this project's `A8` is not another's).
//
// A definition is where the corpus already declares a label: a table row
// whose first cell is the token, a heading that opens with it, or a list item
// that leads with it. The datum it yields carries the four fields the datum
// model asks for — a stable id, a body, a status (read as a tense), and
// provenance (doc, line, date). Pure except for the filesystem reads the
// index needs and one best-effort `git remote` per project.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { realBaseOf, metaId } = require('./paths.js');

const MAX_DEPTH = 6;
const SKIP_DIRS = new Set(['node_modules', '.git', '.venv', 'venv', '__pycache__', 'dist', 'build', '.cache', 'target', '.next', '.terraform']);
const WALK_HIDDEN = new Set(['.worktrees']); // the one hidden directory that holds projects

const TOKEN = '(?:OQ|[A-Z]{1,2})\\d{1,3}[a-z]?';
const TOKEN_CITE = new RegExp(`(?<![\\w#/\\-])(${TOKEN})(?![\\w\\-])`, 'g');
const DEF_ROW = new RegExp(`^\\|\\s*(?:\\*\\*|\`)?(${TOKEN})(?:\\*\\*|\`)?\\s*\\|(.*)$`);
const DEF_HEADING = new RegExp(`^#{1,6}\\s+(?:\\*\\*|\`)?(${TOKEN})(?:\\*\\*|\`)?(?![\\w\\-])\\s*[:—–\\-·.]?\\s*(.*)$`);
const DEF_LIST = new RegExp(`^\\s*(?:[-*+]|\\d+[.)])\\s+(?:\\*\\*|__|\`)?(${TOKEN})(?:\\*\\*|__|\`)?(?![\\w\\-])\\s*(?:[:—–\\-·]\\s*|\\s)(.*)$`);
const BLOCK_START = /^(?:#{1,6}\s|\s*```|\s*\||\s*(?:[-*+]|\d+[.)])\s|\s*>|---\s*$)/;
const LINK = /\[[^\]]*\]\(([^)\s]+?\.md)(?:#[^)]*)?\)/g;
const META_LINE = /^([A-Z][\w-]*):\s+(.+)$/;
const GITHUB_REMOTE = /github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?$/;

// Status is read off the definition's own text; the tense words are the
// context-tensor axis (was-true · true-now · not-yet-true) applied to a claim.
const STRUCK = /~~|\b(?:struck|withdrawn|superseded|falsified|retracted|overturned|dissolved|reversed|abandoned|obsolete)\b|✗|❌/i;
const SETTLED = /\b(?:settled|resolved|accepted|ruled|shipped|merged|done|landed|answered|closed|implemented|completed?)\b|✅/i;
const DEFERRED = /\b(?:deferred|parked|later|queued|postponed|pending|blocked|tbd)\b|⏸/i;
const TENSE = { struck: 'was-true', settled: 'true-now', deferred: 'not-yet-true', open: 'unsettled' };

function statusOf(text) {
  if (STRUCK.test(text)) return 'struck';
  if (SETTLED.test(text)) return 'settled';
  if (DEFERRED.test(text)) return 'deferred';
  return 'open';
}

function projectKey(rel) {
  return rel === '' ? '~' : rel.split('/').join('+');
}

function relOfKey(key) {
  return key === '~' ? '' : key.split('+').join('/');
}

// Every `.meta/` under root (depth ≤ 6), realpath-deduplicated; a `.meta/`
// nested inside another `.meta/` (an archive) is not a project.
function discoverProjects(rootDir) {
  const rootReal = fs.realpathSync.native(rootDir);
  const seen = new Set();
  const projects = [];
  function visit(dir, depth) {
    if (depth > MAX_DEPTH) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.name === '.meta') {
        let real;
        try { real = realBaseOf(full); } catch { continue; }
        if (seen.has(real)) continue;
        seen.add(real);
        const projectDir = dir;
        const rel = path.relative(rootReal, projectDir).split(path.sep).join('/');
        projects.push({ key: projectKey(rel), rel, name: rel === '' ? path.basename(rootReal) : rel, projectDir, realBase: real, id: metaId(real) });
        continue;
      }
      if (SKIP_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith('.') && !WALK_HIDDEN.has(entry.name)) continue;
      let isDirectory = entry.isDirectory();
      if (entry.isSymbolicLink()) { try { isDirectory = fs.statSync(full).isDirectory(); } catch { isDirectory = false; } }
      if (isDirectory) visit(full, depth + 1);
    }
  }
  visit(rootReal, 0);
  projects.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  return projects;
}

function listMarkdown(realBase) {
  const files = [];
  function visit(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === '.meta') continue;
      const full = path.join(dir, entry.name);
      let isDirectory = entry.isDirectory();
      if (entry.isSymbolicLink()) { try { isDirectory = fs.statSync(full).isDirectory(); } catch { continue; } }
      if (isDirectory) visit(full);
      else if (/\.md$/i.test(entry.name)) files.push(full);
    }
  }
  visit(realBase);
  return files;
}

function splitCells(row) {
  return row.split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, '|').trim()).filter((cell) => cell !== '');
}

function stripMarks(text) {
  return text.replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
}

function clip(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

// One doc's index record: title, H2s, `Key: value` metadata (front-matter or
// the lines under the H1), links to sibling docs, defined tokens, cited tokens.
function indexDoc(text, { project, rel, mtimeMs, bytes }) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const doc = { project, path: rel, title: '', status: '', date: '', h2s: [], mtimeMs, bytes, archived: /^archive\//.test(rel), links: [], defs: [], cites: new Set() };
  const docDir = path.posix.dirname(rel);
  let inFence = false;
  let inFrontMatter = lines[0] === '---';
  let afterTitle = 0;
  lines.forEach((line, lineIndex) => {
    if (inFrontMatter) {
      if (lineIndex > 0 && line === '---') { inFrontMatter = false; return; }
      const keyed = META_LINE.exec(line);
      if (keyed) { if (/^status$/i.test(keyed[1])) doc.status = doc.status || stripMarks(keyed[2]); if (/^date$/i.test(keyed[1])) doc.date = doc.date || keyed[2].trim(); }
      return;
    }
    if (/^\s*```/.test(line)) { inFence = !inFence; return; }
    if (inFence) return;
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      if (heading[1].length === 1 && !doc.title) { doc.title = stripMarks(heading[2]); afterTitle = 8; }
      else if (heading[1].length === 2) doc.h2s.push(stripMarks(heading[2]));
    } else if (afterTitle > 0) {
      afterTitle--;
      const keyed = META_LINE.exec(line);
      if (keyed) { if (/^status$/i.test(keyed[1])) doc.status = doc.status || clip(stripMarks(keyed[2]), 60); if (/^date$/i.test(keyed[1])) doc.date = doc.date || keyed[2].trim().slice(0, 10); }
    }
    let link;
    LINK.lastIndex = 0;
    while ((link = LINK.exec(line))) {
      const target = link[1];
      if (/^[a-z]+:/i.test(target) || target.startsWith('/')) continue;
      const resolved = path.posix.normalize(path.posix.join(docDir === '.' ? '' : docDir, target)).replace(/^\.meta\//, '');
      if (!resolved.startsWith('..') && !doc.links.includes(resolved)) doc.links.push(resolved);
    }
    let definition = null;
    let match;
    if ((match = DEF_ROW.exec(line))) {
      const cells = splitCells(match[2]);
      if (cells.length && !/^:?-+:?$/.test(cells[0])) definition = { token: match[1], kind: 'row', body: clip(cells.map(stripMarks).join(' · '), 420) };
    } else if ((match = DEF_HEADING.exec(line))) {
      const next = lines.slice(lineIndex + 1, lineIndex + 4).find((candidate) => candidate.trim() && !BLOCK_START.test(candidate));
      definition = { token: match[1], kind: 'heading', body: clip(stripMarks([match[2], next || ''].filter(Boolean).join(' — ')), 420) };
    } else if ((match = DEF_LIST.exec(line))) {
      definition = { token: match[1], kind: 'list', body: clip(stripMarks(match[2]), 420) };
    }
    if (definition && definition.body) {
      const alreadyDefined = doc.defs.some((existing) => existing.token === definition.token);
      if (!alreadyDefined) doc.defs.push({ ...definition, line: lineIndex + 1, status: statusOf(line) });
    }
    let cite;
    TOKEN_CITE.lastIndex = 0;
    while ((cite = TOKEN_CITE.exec(line))) doc.cites.add(cite[1]);
  });
  return doc;
}

// The project's own GitHub remote — only when the project directory is the
// repository's toplevel. A project mirrored inside another clone (the ferry's
// read-only copy of a work tree) would otherwise inherit the clone's remote.
function githubUrlOf(projectDir) {
  const git = (args) => execFileSync('git', ['-C', projectDir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000 }).trim();
  try {
    const toplevel = fs.realpathSync.native(git(['rev-parse', '--show-toplevel']));
    if (toplevel !== fs.realpathSync.native(projectDir)) return null;
    const parsed = GITHUB_REMOTE.exec(git(['remote', 'get-url', 'origin']));
    return parsed ? `https://github.com/${parsed[1]}/${parsed[2]}` : null;
  } catch { return null; }
}

// Root-level `.meta/viewport.yml` may carry `repos:` (name → GitHub URL, for
// `honcho #1214` when honcho is not under this tree) and `links:` (prefix →
// URL prefix, e.g. `DEV: https://linear.app/acme/issue/`). Read-only; never created.
function readRootConfig(rootProject) {
  const config = { repos: {}, links: {} };
  if (!rootProject) return config;
  let text;
  try { text = fs.readFileSync(path.join(rootProject.realBase, 'viewport.yml'), 'utf8'); } catch { return config; }
  let block = null;
  for (const line of text.split('\n')) {
    const head = /^(repos|links):\s*$/.exec(line);
    if (head) { block = head[1]; continue; }
    const entry = /^\s+([\w.-]+):\s+(\S+)\s*$/.exec(line);
    if (block && entry) {
      if (block === 'repos') config.repos[entry[1].toLowerCase()] = entry[2].replace(/\/+$/, '');
      else config.links[entry[1].toUpperCase()] = entry[2];
    } else if (!/^\s/.test(line) && line.trim()) block = null;
  }
  return config;
}

function buildIndex(projects, { tree = true } = {}) {
  const docsByProject = new Map();
  const docByRef = new Map();
  const projectByKey = new Map();
  const repos = new Map();
  const rootProject = projects.find((project) => project.rel === '') || null;
  const config = readRootConfig(rootProject);
  for (const [name, url] of Object.entries(config.repos)) repos.set(name, url);
  for (const project of projects) {
    projectByKey.set(project.key, project);
    project.urlBase = tree ? `/p/${encodeURIComponent(project.key)}/` : '/';
    const github = githubUrlOf(project.projectDir);
    project.github = github;
    if (github) { const name = path.basename(project.projectDir).toLowerCase(); if (!repos.has(name)) repos.set(name, github); }
    const docs = [];
    for (const file of listMarkdown(project.realBase)) {
      let text;
      let stat;
      try { text = fs.readFileSync(file, 'utf8'); stat = fs.statSync(file); } catch { continue; }
      const rel = path.relative(project.realBase, file).split(path.sep).join('/');
      const doc = indexDoc(text, { project: project.key, rel, mtimeMs: stat.mtimeMs, bytes: stat.size });
      doc.url = project.urlBase + rel.split('/').map(encodeURIComponent).join('/');
      docs.push(doc);
      docByRef.set(`${project.key}|${rel}`, doc);
    }
    docs.sort((a, b) => b.mtimeMs - a.mtimeMs);
    docsByProject.set(project.key, docs);
  }
  return { projects, projectByKey, docsByProject, docByRef, repos, links: config.links, tree, builtAt: Date.now() };
}

// Re-index one project after a change; cheap enough to run on every save.
function reindexProject(index, project) {
  const fresh = buildIndex([project], { tree: index.tree });
  for (const doc of index.docsByProject.get(project.key) || []) index.docByRef.delete(`${project.key}|${doc.path}`);
  index.docsByProject.set(project.key, fresh.docsByProject.get(project.key));
  for (const [ref, doc] of fresh.docByRef) index.docByRef.set(ref, doc);
  index.builtAt = Date.now();
}

function docsOf(index, projectKey) {
  return index.docsByProject.get(projectKey) || [];
}

function getDoc(index, projectKey, rel) {
  return index.docByRef.get(`${projectKey}|${rel}`) || null;
}

// The neighborhood, in order. Within a tier the newest doc wins; within a doc
// the first definition wins.
function resolveToken(index, doc, token) {
  const project = docsOf(index, doc.project);
  const tiers = [
    [doc],
    doc.links.map((rel) => getDoc(index, doc.project, rel)).filter(Boolean),
    project.filter((candidate) => !candidate.archived && candidate.path.startsWith('designs/')),
    project.filter((candidate) => !candidate.archived && candidate.path.startsWith('assessments/')),
    project.filter((candidate) => !candidate.archived),
    project.filter((candidate) => candidate.archived),
  ];
  for (let tier = 0; tier < tiers.length; tier++) {
    const hits = [];
    for (const candidate of tiers[tier]) {
      const definition = candidate.defs.find((entry) => entry.token === token);
      if (definition) hits.push({ doc: candidate, definition, tier });
    }
    if (hits.length) { hits.sort((a, b) => b.doc.mtimeMs - a.doc.mtimeMs); return hits[0]; }
  }
  return null;
}

function slugOfPath(docPath) {
  return docPath.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
}

// Every token the doc cites, resolved: the map the page embeds for hover and click.
function tokensFor(index, doc) {
  const resolved = {};
  const neighborhoodNames = ['this doc', 'a linked doc', "the project's designs", "the project's assessments", 'the project', "the project's archive"];
  for (const token of doc.cites) {
    const hit = resolveToken(index, doc, token);
    if (!hit) continue;
    const sameDoc = hit.doc === doc;
    const anchor = `tok-${slugOfPath(hit.doc.path)}-${token}`;
    resolved[token] = {
      id: `${hit.doc.project}/${hit.doc.path}#${token}`,
      token,
      body: hit.definition.body,
      kind: hit.definition.kind,
      status: hit.definition.status,
      tense: TENSE[hit.definition.status],
      project: hit.doc.project,
      path: hit.doc.path,
      line: hit.definition.line,
      date: new Date(hit.doc.mtimeMs).toISOString().slice(0, 10),
      neighborhood: neighborhoodNames[hit.tier],
      sameDoc,
      href: sameDoc ? `#${anchor}` : `${hit.doc.url}#${anchor}`,
      anchor,
    };
  }
  return resolved;
}

// `#1214` → the PR on GitHub. The repo is the nearest preceding word that names
// a known repo (`honcho #1214`, `groudon#569`), else the doc's own project.
function externalResolverFor(index, projectKey) {
  const project = index.projectByKey.get(projectKey);
  const ownRepo = project && project.github;
  return {
    pull(precedingText, number) {
      const words = precedingText.slice(-40).toLowerCase().match(/[a-z][\w.-]*/g) || [];
      for (let position = words.length - 1; position >= 0 && position >= words.length - 3; position--) {
        const url = index.repos.get(words[position]);
        if (url) return `${url}/pull/${number}`;
      }
      return ownRepo ? `${ownRepo}/pull/${number}` : null;
    },
    ticket(prefix, rest) {
      const base = index.links[prefix.toUpperCase()];
      return base ? `${base}${prefix}-${rest}` : null;
    },
  };
}

// The tray's payload: one compact record per doc.
function trayRecords(index) {
  const records = [];
  for (const project of index.projects) {
    for (const doc of docsOf(index, project.key)) {
      records.push({ p: project.key, n: project.name, f: doc.path, t: doc.title || doc.path.split('/').pop().replace(/\.md$/i, ''), s: doc.status, d: doc.date, m: Math.round(doc.mtimeMs), h: doc.h2s.slice(0, 12), a: doc.archived ? 1 : 0, u: doc.url, k: doc.defs.length });
    }
  }
  return records;
}

module.exports = { discoverProjects, buildIndex, reindexProject, indexDoc, resolveToken, tokensFor, externalResolverFor, trayRecords, docsOf, getDoc, projectKey, relOfKey, statusOf, TOKEN, TOKEN_CITE };
