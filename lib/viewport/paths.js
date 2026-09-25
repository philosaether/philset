'use strict';

// Path containment for everything that names a file under the served .meta/:
// routes (URL-encoded), --tabs and the manifest (verbatim). Native realpath on
// both sides so a symlinked .meta (central-meta) and a case-insensitive
// filesystem fail closed. Design §6.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function realBaseOf(metaDir) {
  return fs.realpathSync.native(metaDir);
}

// Short stable id for a project: namespaces localStorage and derives the port.
function metaId(realBase) {
  return crypto.createHash('sha1').update(realBase).digest('hex').slice(0, 8);
}

// → { ok: true, real, rel } | { ok: false, status: 400 | 404 }
function resolveInsideMeta(realBase, requestPath, { decode = true } = {}) {
  let decoded = String(requestPath);
  if (decode) { try { decoded = decodeURIComponent(decoded); } catch { return { ok: false, status: 400 }; } }
  if (decoded.includes('\0') || decoded.includes('\\')) return { ok: false, status: 400 };
  if (/^[A-Za-z]:/.test(decoded) || decoded.startsWith('/')) return { ok: false, status: 400 };
  const normalized = path.posix.normalize(decoded).replace(/\/+$/, '');
  if (!normalized || normalized === '.') return { ok: false, status: 400 };
  const segments = normalized.split('/');
  if (segments.some((segment) => segment === '..' || segment === '.git')) return { ok: false, status: 400 };
  let real;
  try { real = fs.realpathSync.native(path.join(realBase, normalized)); } catch { return { ok: false, status: 404 }; }
  if (real !== realBase && !real.startsWith(realBase + path.sep)) return { ok: false, status: 400 };
  let stat;
  try { stat = fs.statSync(real); } catch { return { ok: false, status: 404 }; }
  if (!stat.isFile()) return { ok: false, status: 404 };
  return { ok: true, real, rel: normalized };
}

module.exports = { realBaseOf, metaId, resolveInsideMeta };
