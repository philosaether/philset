'use strict';

// The loopback server: the page, one-doc pages, live reload; in tree mode,
// one process serves every project under the root (`/p/<key>/…`), the index
// API for the tray, the sessions API for the hub strip, and the vendored
// editor. Every response is hardened the same way; every request passes the
// Host check; the whole handler runs inside try/catch so a hostile URL cannot
// crash the viewer.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { resolveInsideMeta } = require('./paths.js');
const { readDoc, writeDoc, MAX_BYTES } = require('./write.js');

const HOST_OK = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/i;
const IGNORED = /(^|\/)(\.git|\.DS_Store)(\/|$)|\.pv-tmp$|\.swp$|~$/;
const VENDOR_FILE = /^[\w.-]+\.(?:js|css)$/;
const VENDOR_TYPES = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

// projects: { defaultProject, byKey(key) → project | null, all: [project] }
// buildPage(project) / buildDocPage(project, rel) → { html, csp }
function createViewerServer({ projects, buildPage, buildDocPage, edit = null, log = () => {}, apiIndex = null, apiSessions = null, onChange = null, vendorDirs = [] }) {
  const clients = new Set();

  function sendJson(res, status, value) {
    send(res, status, JSON.stringify(value), { 'Content-Type': 'application/json; charset=utf-8' });
  }

  // Cross-origin writes are already impossible (PUT preflights, no CORS ever);
  // Origin and the per-run token are belt and braces (design §7).
  function editGuard(req) {
    if (!edit) return 404;
    if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return 403;
    if (req.method === 'PUT' && req.headers['x-philset-token'] !== edit.token) return 403;
    return 0;
  }

  function readBody(req, limit, callback) {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) { req.destroy(); callback(new Error('too large')); return; }
      chunks.push(chunk);
    });
    req.on('end', () => callback(null, Buffer.concat(chunks).toString('utf8')));
    req.on('error', callback);
  }

  function send(res, status, body, headers = {}) {
    res.writeHead(status, {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    });
    res.end(body);
  }

  function sendPage(res, page) {
    send(res, 200, page.html, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': page.csp,
    });
  }

  function projectFor(url) {
    const key = url.searchParams.get('project');
    return key ? projects.byKey(key) : projects.defaultProject;
  }

  function handleDocApi(req, res, url) {
    const refused = editGuard(req);
    if (refused) return send(res, refused, refused === 404 ? 'not found' : 'forbidden');
    const project = projectFor(url);
    if (!project) return send(res, 404, 'not found');
    if (req.method === 'GET') {
      const doc = readDoc(project.realBase, url.searchParams.get('path') || '');
      if (!doc.ok) return send(res, doc.status, doc.status === 404 ? 'not found' : 'bad request');
      return sendJson(res, 200, { project: project.key, path: doc.path, content: doc.content, hash: doc.hash });
    }
    if (req.method === 'PUT') {
      return readBody(req, MAX_BYTES + 4096, (error, body) => {
        try {
          if (error) return send(res, 413, 'too large');
          let parsed;
          try { parsed = JSON.parse(body); } catch { return send(res, 400, 'bad request'); }
          if (!parsed || typeof parsed !== 'object') return send(res, 400, 'bad request');
          const target = parsed.project ? projects.byKey(String(parsed.project)) : project;
          if (!target) return send(res, 404, 'not found');
          const result = writeDoc(target.realBase, String(parsed.path || ''), parsed.content, parsed.baseHash);
          if (result.ok) { log(`wrote ${target.rel ? `${target.rel}/` : ''}${parsed.path}`); return sendJson(res, 200, { hash: result.hash }); }
          if (result.status === 409) return sendJson(res, 409, { content: result.content, hash: result.hash });
          if (result.status === 500) log(`write failed: ${result.error}`);
          return send(res, result.status, result.status === 404 ? 'not found' : 'bad request');
        } catch (thrown) {
          log(`error: ${thrown.message}`);
          if (!res.headersSent) send(res, 500, 'internal error');
          return undefined;
        }
      });
    }
    return send(res, 404, 'not found');
  }

  // The vendored bundle and the editor module: served from the first of the
  // vendor directories that holds the file (assets/viewport/vendor, then assets/viewport).
  function handleVendor(res, name) {
    if (!VENDOR_FILE.test(name)) return send(res, 404, 'not found');
    for (const dir of vendorDirs) {
      let body;
      try { body = fs.readFileSync(path.join(dir, name)); } catch { continue; }
      return send(res, 200, body, { 'Content-Type': VENDOR_TYPES[path.extname(name)] });
    }
    return send(res, 404, 'not found');
  }

  function handle(req, res) {
    if (!HOST_OK.test(req.headers.host || '')) return send(res, 421, 'misdirected request');
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/doc') return handleDocApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 404, 'not found');
    if (url.pathname === '/') return sendPage(res, buildPage(projects.defaultProject));
    if (url.pathname === '/api/index') return apiIndex ? sendJson(res, 200, apiIndex()) : send(res, 404, 'not found');
    if (url.pathname === '/api/sessions') return apiSessions ? sendJson(res, 200, apiSessions()) : send(res, 404, 'not found');
    if (url.pathname.startsWith('/vendor/')) return handleVendor(res, url.pathname.slice('/vendor/'.length));
    if (url.pathname === '/favicon.ico') return send(res, 204, '');
    if (url.pathname === '/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Connection: 'keep-alive' });
      res.write(': connected\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return undefined;
    }
    const scoped = /^\/p\/([^/]+)\/(.*)$/.exec(url.pathname);
    if (scoped) {
      let key;
      try { key = decodeURIComponent(scoped[1]); } catch { return send(res, 400, 'bad request'); }
      const project = projects.byKey(key);
      if (!project) return send(res, 404, 'not found');
      if (scoped[2] === '') return sendPage(res, buildPage(project));
      if (!/\.md$/i.test(scoped[2])) return send(res, 404, 'not found');
      const resolved = resolveInsideMeta(project.realBase, scoped[2]);
      if (!resolved.ok) return send(res, resolved.status, resolved.status === 404 ? 'not found' : 'bad request');
      return sendPage(res, buildDocPage(project, resolved.rel));
    }
    if (/\.md$/i.test(url.pathname)) {
      const resolved = resolveInsideMeta(projects.defaultProject.realBase, url.pathname.slice(1));
      if (!resolved.ok) return send(res, resolved.status, resolved.status === 404 ? 'not found' : 'bad request');
      return sendPage(res, buildDocPage(projects.defaultProject, resolved.rel));
    }
    return send(res, 404, 'not found');
  }

  const server = http.createServer((req, res) => {
    try {
      handle(req, res);
    } catch (error) {
      log(`error: ${error.message}`);
      if (!res.headersSent) send(res, 500, 'internal error');
      else res.end();
    }
  });

  const watchers = [];
  let pending = null;
  const changed = new Set();
  function broadcast() {
    for (const project of changed) { try { if (onChange) onChange(project); } catch (error) { log(`reindex failed: ${error.message}`); } }
    changed.clear();
    for (const client of clients) client.write('event: change\ndata: {}\n\n');
  }
  // One watcher per project's .meta/ — never a recursive watch on the tree
  // root, where every git operation in every repo would fire.
  function watch() {
    for (const project of projects.all) {
      try {
        const watcher = fs.watch(project.realBase, { recursive: true }, (eventType, filename) => {
          if (filename && IGNORED.test(String(filename).split(path.sep).join('/'))) return;
          changed.add(project);
          clearTimeout(pending);
          pending = setTimeout(broadcast, 150);
        });
        watcher.on('error', (error) => { log(`watch stopped (${project.name}): ${error.message}`); });
        watchers.push(watcher);
      } catch (error) {
        log(`watch unavailable (${project.name}): ${error.message} — reload by hand`);
      }
    }
  }

  function close() {
    for (const watcher of watchers) watcher.close();
    for (const client of clients) client.end();
    server.close();
  }

  return { server, watch, close };
}

module.exports = { createViewerServer };
