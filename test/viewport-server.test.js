#!/usr/bin/env node

// The loopback server and path containment (design §6): Host check, hardened
// headers, traversal never reaches a file, hostile URLs never crash the
// process. Ephemeral port, throwaway .meta; requests via http.request (fetch
// rewrites Host).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const net = require('net');

// A request with no Host header: http.request always adds one, so go raw.
function rawStatus(port, raw) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, '127.0.0.1', () => socket.write(raw));
    let data = '';
    socket.on('data', (chunk) => { data += chunk; socket.end(); });
    socket.on('close', () => resolve(Number((/^HTTP\/1\.1 (\d{3})/.exec(data) || [])[1])));
    socket.on('error', reject);
  });
}

const { resolveInsideMeta, realBaseOf, metaId } = require('../lib/viewport/paths.js');
const { createViewerServer } = require('../lib/viewport/server.js');

// The one-project registry the server takes (tree mode adds more projects).
function registryFor(realBase) {
  const project = { key: '~', rel: '', name: 'test', realBase, id: metaId(realBase), urlBase: '/' };
  return { defaultProject: project, all: [project], byKey: (key) => (key === '~' ? project : null) };
}

function makeMeta() {
  const root = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'pv-server-')));
  const metaDir = path.join(root, '.meta');
  fs.mkdirSync(path.join(metaDir, 'designs'), { recursive: true });
  fs.mkdirSync(path.join(metaDir, '.git'));
  fs.writeFileSync(path.join(metaDir, '.git', 'config'), 'secret');
  fs.writeFileSync(path.join(metaDir, 'in-progress.md'), '# In Progress\n\n- [ ] one\n');
  fs.writeFileSync(path.join(metaDir, 'designs', 'x.md'), '# X\n');
  fs.writeFileSync(path.join(root, 'outside.md'), '# outside\n');
  fs.symlinkSync(path.join(root, 'outside.md'), path.join(metaDir, 'escape.md'));
  return { root, metaDir, realBase: realBaseOf(metaDir) };
}

test('resolveInsideMeta: containment cases', () => {
  const { realBase } = makeMeta();
  assert.strictEqual(resolveInsideMeta(realBase, 'in-progress.md').ok, true);
  assert.strictEqual(resolveInsideMeta(realBase, 'designs/x.md').rel, 'designs/x.md');
  assert.strictEqual(resolveInsideMeta(realBase, 'designs/../in-progress.md').rel, 'in-progress.md', 'normalizes first; a .. that stays inside is harmless');
  assert.strictEqual(resolveInsideMeta(realBase, '%2e%2e/outside.md').status, 400);
  assert.strictEqual(resolveInsideMeta(realBase, '../outside.md').status, 400);
  assert.strictEqual(resolveInsideMeta(realBase, '/etc/passwd').status, 400);
  assert.strictEqual(resolveInsideMeta(realBase, 'C:/x.md').status, 400);
  assert.strictEqual(resolveInsideMeta(realBase, '.git/config').status, 400);
  assert.strictEqual(resolveInsideMeta(realBase, 'a\0b.md').status, 400);
  assert.strictEqual(resolveInsideMeta(realBase, '%').status, 400);
  fs.writeFileSync(path.join(realBase, '50%.md'), '# pct\n');
  assert.strictEqual(resolveInsideMeta(realBase, '50%.md', { decode: false }).ok, true, 'verbatim paths are not decoded');
  assert.strictEqual(resolveInsideMeta(realBase, 'escape.md').status, 400, 'a symlink out of base fails closed');
  assert.strictEqual(resolveInsideMeta(realBase, 'designs').status, 404, 'a directory is not a file');
  assert.strictEqual(resolveInsideMeta(realBase, 'missing.md').status, 404);
  assert.match(metaId(realBase), /^[0-9a-f]{8}$/);
});

function request(port, requestPath, headers = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: requestPath, method, headers: { host: `127.0.0.1:${port}`, ...headers } }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('server: routes, Host check, hardened headers, hostile paths never crash', async () => {
  const { realBase } = makeMeta();
  const page = (label) => ({ html: `<html><body>${label}</body></html>`, csp: "default-src 'none'" });
  const viewer = createViewerServer({ projects: registryFor(realBase), buildPage: () => page('INDEX'), buildDocPage: (project, rel) => page(`DOC ${rel}`) });
  await new Promise((resolve) => viewer.server.listen(0, '127.0.0.1', resolve));
  const port = viewer.server.address().port;
  try {
    const index = await request(port, '/');
    assert.strictEqual(index.status, 200);
    assert.ok(index.body.includes('INDEX'));
    assert.strictEqual(index.headers['cache-control'], 'no-store');
    assert.strictEqual(index.headers['x-content-type-options'], 'nosniff');
    assert.ok(index.headers['content-security-policy']);
    assert.ok(!Object.keys(index.headers).some((name) => name.startsWith('access-control-')), 'no CORS headers ever');

    const doc = await request(port, '/designs/x.md');
    assert.strictEqual(doc.status, 200);
    assert.ok(doc.body.includes('DOC designs/x.md'));

    assert.strictEqual((await request(port, '/', { host: 'evil.example' })).status, 421);
    // Node's server core refuses an HTTP/1.1 request with no Host (400) before the handler; either refusal is fine
    assert.ok([400, 421].includes(await rawStatus(port, 'GET / HTTP/1.1\r\n\r\n')), 'no Host header at all is refused');
    assert.strictEqual((await request(port, '/', { host: 'localhost:' + port })).status, 200);
    assert.strictEqual((await request(port, '/', {}, 'OPTIONS')).status, 404);
    assert.strictEqual((await request(port, '/nope')).status, 404);
    for (const hostile of ['/%', '/%2e%2e/outside.md', '/../outside.md', '/.git/config', '/escape.md', '/designs/%00.md', '/designs/../../outside.md']) {
      const response = await request(port, hostile);
      assert.ok(response.status === 400 || response.status === 404, `${hostile} → ${response.status}`);
      assert.ok(!response.body.includes('outside') && !response.body.includes('secret'), `${hostile} leaked`);
    }
    assert.strictEqual((await request(port, '/')).status, 200, 'still serving after hostile requests');
  } finally {
    viewer.close();
  }
});

const { readDoc, writeDoc, hashOf } = require('../lib/viewport/write.js');

test('edit routes: absent without --edit; token, Origin, path, hash and atomic write with it', async () => {
  const { root, metaDir, realBase } = makeMeta();
  const page = () => ({ html: '<html></html>', csp: "default-src 'none'" });
  const closed = createViewerServer({ projects: registryFor(realBase), buildPage: page, buildDocPage: page });
  await new Promise((resolve) => closed.server.listen(0, '127.0.0.1', resolve));
  try {
    const port = closed.server.address().port;
    assert.strictEqual((await request(port, '/api/doc?path=in-progress.md')).status, 404, 'no --edit: the route does not exist');
  } finally { closed.close(); }

  const token = 'test-token';
  const viewer = createViewerServer({ projects: registryFor(realBase), buildPage: page, buildDocPage: page, edit: { token } });
  await new Promise((resolve) => viewer.server.listen(0, '127.0.0.1', resolve));
  const port = viewer.server.address().port;
  const put = (body, headers = {}) => new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: '/api/doc', method: 'PUT', headers: { host: `127.0.0.1:${port}`, 'content-type': 'application/json', ...headers } }, (res) => {
      let data = ''; res.on('data', (c) => { data += c; }); res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject); req.end(typeof body === 'string' ? body : JSON.stringify(body));
  });
  try {
    const read = await request(port, '/api/doc?path=in-progress.md');
    assert.strictEqual(read.status, 200);
    const doc = JSON.parse(read.body);
    assert.strictEqual(doc.content, '# In Progress\n\n- [ ] one\n');
    assert.strictEqual(doc.hash, hashOf(doc.content));
    assert.strictEqual((await request(port, '/api/doc?path=.git/config')).status, 400);
    assert.strictEqual((await request(port, '/api/doc?path=escape.md')).status, 400, 'symlink out of base');
    assert.strictEqual((await request(port, '/api/doc?path=in-progress.md', { origin: 'http://evil.example' })).status, 403, 'foreign Origin');

    assert.strictEqual((await put({ path: 'in-progress.md', content: 'x', baseHash: doc.hash })).status, 403, 'no token');
    assert.strictEqual((await put({ path: 'in-progress.md', content: 'x', baseHash: doc.hash }, { 'x-philset-token': 'wrong' })).status, 403, 'wrong token');
    assert.strictEqual((await put({ path: '../outside.md', content: 'x', baseHash: doc.hash }, { 'x-philset-token': token })).status, 400, 'path escape');
    assert.strictEqual((await put({ path: 'nope.md', content: 'x', baseHash: doc.hash }, { 'x-philset-token': token })).status, 404, 'no creation');
    assert.strictEqual((await put('not json', { 'x-philset-token': token })).status, 400, 'bad body');
    const stale = await put({ path: 'in-progress.md', content: 'x', baseHash: 'stale' }, { 'x-philset-token': token });
    assert.strictEqual(stale.status, 409);
    assert.strictEqual(JSON.parse(stale.body).hash, doc.hash, '409 carries the fresh hash');

    const written = await put({ path: 'in-progress.md', content: '# In Progress\n\n- [x] one\n', baseHash: doc.hash }, { 'x-philset-token': token });
    assert.strictEqual(written.status, 200);
    assert.strictEqual(JSON.parse(written.body).hash, hashOf('# In Progress\n\n- [x] one\n'));
    assert.strictEqual(fs.readFileSync(path.join(metaDir, 'in-progress.md'), 'utf8'), '# In Progress\n\n- [x] one\n');
    assert.ok(!fs.existsSync(path.join(metaDir, '.in-progress.md.pv-tmp')), 'no tmp left behind');
    assert.strictEqual(fs.readFileSync(path.join(root, 'outside.md'), 'utf8'), '# outside\n', 'nothing outside touched');
  } finally {
    viewer.close();
  }
});

test('writeDoc: a failed write leaves no tmp file and does not touch the target', () => {
  const { metaDir, realBase } = makeMeta();
  const target = path.join(metaDir, 'in-progress.md');
  const before = fs.readFileSync(target, 'utf8');
  const tmp = path.join(metaDir, '.in-progress.md.pv-tmp');
  fs.writeFileSync(tmp, 'leftover'); // `wx` must refuse to reuse it — and must not delete it
  const refused = writeDoc(realBase, 'in-progress.md', 'new', hashOf(before));
  assert.strictEqual(refused.status, 500);
  assert.strictEqual(fs.readFileSync(tmp, 'utf8'), 'leftover', 'a tmp we did not create is left alone');
  assert.strictEqual(fs.readFileSync(target, 'utf8'), before);
  fs.unlinkSync(tmp);
  assert.strictEqual(writeDoc(realBase, 'in-progress.md', 'new', hashOf(before)).status, 200);
  assert.strictEqual(fs.readFileSync(target, 'utf8'), 'new');
  assert.strictEqual(readDoc(realBase, 'in-progress.md').hash, hashOf('new'));
  assert.strictEqual(writeDoc(realBase, 'designs', 'x', 'h').status, 404, 'directories are not docs');
  assert.strictEqual(writeDoc(realBase, 'in-progress.md', 42, 'h').status, 400, 'content must be a string');
});
