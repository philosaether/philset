'use strict';

// Assembles the muster-roll page from the rendered docs and the page assets.
// Pure: every input is a string or plain data; the caller reads files.

const { renderMarkdown, escapeHtml, plainText, slugify } = require('./markdown.js');

const LABEL_MAX = 24;
const ROLE_MAX = 22;

function ellipsis(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function stemOf(docPath) {
  return docPath.split('/').pop().replace(/\.md$/i, '');
}

function isoDate(mtimeMs) {
  return new Date(mtimeMs).toISOString().slice(0, 10);
}

function localTime(mtimeMs) {
  const date = new Date(mtimeMs);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function metaValue(meta, key) {
  const row = meta.find(([name]) => name.toLowerCase() === key.toLowerCase());
  return row ? plainText(row[1]).trim() : '';
}

// label = manifest > H1 cut at " — " (24 chars) > stem; role = manifest > Status · Date > modified
function tabText(doc, rendered) {
  const fullTitle = rendered.title || '';
  const label = doc.label || ellipsis((fullTitle.split(' — ')[0] || '').trim(), LABEL_MAX) || stemOf(doc.path);
  const status = metaValue(rendered.meta, 'Status');
  const date = metaValue(rendered.meta, 'Date');
  let role = doc.role || '';
  let roleFull = role;
  if (!role) {
    if (status) { role = ellipsis(status, ROLE_MAX) + (date ? ` · ${date}` : ''); roleFull = status + (date ? ` · ${date}` : ''); }
    else { role = `modified ${isoDate(doc.mtimeMs)}`; roleFull = role; }
  }
  return { label, labelFull: fullTitle || label, role, roleFull };
}

// JSON that is safe inside a <script> element (design §3 escape contract):
// `<` and the two Unicode line separators leave as six-character escapes.
// The separators are built from char codes so no raw one sits in this source.
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g');
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g');
function scriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029');
}

function fill(template, slots) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => (name in slots ? slots[name] : match));
}

function cspFor(nonce) {
  return `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'`;
}

function ageOf(updated, now) {
  const seconds = Math.max(0, Math.round((now - Number(updated || now)) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

// The hub window's session tracker: one chip per open Claude Code session.
function renderSessions(sessions, { rootDir = '', now = Date.now() } = {}) {
  const chips = sessions.map((session) => {
    const where = rootDir && session.cwd && session.cwd.startsWith(rootDir) ? (session.cwd.slice(rootDir.length).replace(/^\//, '') || '~') : (session.cwd || '').split('/').pop();
    const state = ['crunching', 'ready', 'waiting'].includes(session.state) ? session.state : 'ready';
    return `<span class="chip state-${state}" title="${escapeHtml(session.cwd || '')}"><span class="dot"></span><span class="where">${escapeHtml(where)}</span><span class="state">${state}</span>${session.last ? `<span class="last">${escapeHtml(session.lastFrom === 'you' ? '› ' : '')}${escapeHtml(session.last)}</span>` : ''}<span class="age">${ageOf(session.updated, now)}</span></span>`;
  });
  const body = chips.length ? chips.join('\n') : '<span class="none">no sessions reported — <code>philset hook</code> prints the settings that wire the tracker</span>';
  return `<div class="sessions" id="sessions" data-root="${escapeHtml(rootDir)}"><span class="eyebrow">sessions</span>\n${body}\n</div>`;
}

function renderPage({ assets, title, metaDirDisplay, servedAt, nonce, metaId, docs, note = '', mode = 'index', edit = null, project = null, external = null, sessions = null, tree = false, projectCount = 1, rootDir = '', vendor = null }) {
  const tabs = [];
  const panels = [];
  const keysSeen = new Map();
  const tokens = {};
  docs.forEach((doc, index) => {
    let key = slugify(doc.path);
    const seen = keysSeen.get(key) || 0;
    keysSeen.set(key, seen + 1);
    if (seen) key = `${key}-${seen + 1}`;
    const rendered = renderMarkdown(doc.text, { panelKey: key, docPath: doc.path, tokens: doc.tokens || null, external });
    if (doc.tokens) tokens[key] = doc.tokens;
    const text = tabText(doc, rendered);
    const selected = index === 0;
    tabs.push(`    <button class="tab" role="tab" id="tab-${key}" aria-selected="${selected}" aria-controls="panel-${key}" type="button" title="${escapeHtml(text.labelFull)}">${escapeHtml(text.label)}<span class="role" title="${escapeHtml(text.roleFull)}">${escapeHtml(text.role)}</span></button>`);
    panels.push(`  <section id="panel-${key}" role="tabpanel" aria-labelledby="tab-${key}" data-key="${key}" data-path="${escapeHtml(doc.path)}"${project ? ` data-project="${escapeHtml(project.key)}"` : ''}${selected ? '' : ' hidden'}>\n`
      + `  <div class="eyebrow panel-head">${escapeHtml(doc.path)} · modified ${localTime(doc.mtimeMs)}${edit && /\.md$/i.test(doc.path) ? ' <button type="button" class="edit">edit</button>' : ''}</div>\n`
      + `  <article class="doc">\n${rendered.html}  </article>\n  </section>\n`);
  });
  if (!docs.length) {
    panels.push('  <section role="tabpanel" data-key="empty">\n  <article class="doc">\n<h1>No documents to show</h1>\n<p>Create <code>.meta/viewport.yml</code> listing the docs to view, or add <code>in-progress.md</code>, <code>roadmap.md</code> or <code>designs/index.md</code>.</p>\n  </article>\n  </section>\n');
  }
  if (note) tabs.push(`    <span class="tabs-note">${escapeHtml(note)}</span>`);
  const useVendorEditor = Boolean(edit && vendor && vendor.cm);
  const config = scriptJson({
    metaId, remember: mode === 'index', reload: true, edit: Boolean(edit), token: edit ? edit.token : null,
    tree, project: project ? project.key : null, urlBase: project ? project.urlBase : '/', tokens, sessions: sessions !== null, editor: useVendorEditor ? 'codemirror' : 'textarea', nonce,
  });
  const scope = tree ? `tree <span class="mono">${escapeHtml(rootDir)}</span> · ${projectCount} project${projectCount === 1 ? '' : 's'} · ` : '';
  const footer = `${scope}source <span class="mono">${escapeHtml(metaDirDisplay)}</span> · ${docs.length} doc${docs.length === 1 ? '' : 's'} · served ${escapeHtml(servedAt)} · checkmarks and the selected tab are saved in this browser, for this port only.`;
  const eyebrow = project && project.rel ? `${escapeHtml(project.name)} · .meta` : `${escapeHtml(title)} · .meta`;
  const vendorScripts = useVendorEditor ? `<script nonce="${nonce}" src="/vendor/cm.js"></script>\n<script nonce="${nonce}" src="/vendor/editor.js"></script>` : '';
  return fill(assets.template, {
    csp: escapeHtml(cspFor(nonce)),
    title: escapeHtml(project && project.rel ? `${project.name} · ${title}` : title),
    nonce,
    css: assets.css + (useVendorEditor && assets.editorCss ? `\n${assets.editorCss}` : ''),
    js: assets.js,
    eyebrow,
    tabs: tabs.join('\n'),
    panels: panels.join(''),
    sessions: sessions !== null ? renderSessions(sessions, { rootDir }) : '',
    footer,
    config,
    vendor: vendorScripts,
  });
}

module.exports = { renderPage, renderSessions, tabText, scriptJson, cspFor };
