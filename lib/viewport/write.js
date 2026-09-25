'use strict';

// The write-back path behind `--edit` (design §7): read a doc with its hash;
// write a doc only if the caller's base hash still matches, through a tmp
// file beside the resolved target and an atomic rename. Never creates files.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { resolveInsideMeta } = require('./paths.js');

const MAX_BYTES = 2 * 1024 * 1024;

function hashOf(content) {
  return crypto.createHash('sha1').update(content, 'utf8').digest('hex');
}

function resolveDoc(realBase, rel) {
  const resolved = resolveInsideMeta(realBase, rel);
  if (!resolved.ok) return { ok: false, status: resolved.status };
  if (!/\.md$/i.test(resolved.rel)) return { ok: false, status: 400 };
  return resolved;
}

function readDoc(realBase, rel) {
  const resolved = resolveDoc(realBase, rel);
  if (!resolved.ok) return resolved;
  const content = fs.readFileSync(resolved.real, 'utf8');
  return { ok: true, status: 200, path: resolved.rel, content, hash: hashOf(content) };
}

// → { ok: true, status: 200, hash } | { ok: false, status: 400|404|409|413|500, content?, hash? }
function writeDoc(realBase, rel, content, baseHash) {
  if (typeof content !== 'string' || typeof baseHash !== 'string') return { ok: false, status: 400 };
  if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) return { ok: false, status: 413 };
  const resolved = resolveDoc(realBase, rel);
  if (!resolved.ok) return resolved;
  const current = fs.readFileSync(resolved.real, 'utf8');
  const currentHash = hashOf(current);
  if (currentHash !== baseHash) return { ok: false, status: 409, content: current, hash: currentHash };

  const target = resolved.real; // the resolved file: a symlinked entry is written through
  const tmp = path.join(path.dirname(target), `.${path.basename(target)}.pv-tmp`);
  let descriptor = null;
  let created = false;
  try {
    const mode = fs.statSync(target).mode & 0o7777;
    descriptor = fs.openSync(tmp, 'wx'); // never reuse a leftover
    created = true;
    fs.writeSync(descriptor, content, null, 'utf8');
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = null;
    fs.chmodSync(tmp, mode);
    fs.renameSync(tmp, target);
    return { ok: true, status: 200, hash: hashOf(content) };
  } catch (error) {
    if (descriptor !== null) { try { fs.closeSync(descriptor); } catch { /* already closed */ } }
    if (created) { try { fs.unlinkSync(tmp); } catch { /* gone */ } }
    return { ok: false, status: 500, error: error.code || error.message };
  }
}

module.exports = { readDoc, writeDoc, hashOf, MAX_BYTES };
