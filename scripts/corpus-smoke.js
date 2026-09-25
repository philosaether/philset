#!/usr/bin/env node
// Developer-only. Render every .md under the .meta/ trees below a root
// (default ~/Development) through lib/viewport/markdown.js and report
// exceptions, leaked-markdown tells, and timing. Not part of `npm test`
// (the corpus lives outside the repo). Run: node scripts/corpus-smoke.js [root]

const fs = require('fs');
const path = require('path');
const os = require('os');
const { renderMarkdown, plainText } = require('../lib/viewport/markdown.js');

const root = process.argv[2] || path.join(os.homedir(), 'Development');
const SKIP = new Set(['node_modules', '.git', '.worktrees']);
const files = [];
(function walk(dir, depth) {
  if (depth > 7) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(full, depth + 1);
    else if (entry.isFile() && entry.name.endsWith('.md') && full.includes(`${path.sep}.meta${path.sep}`)) files.push(full);
  }
})(root, 0);

const TELLS = [
  ['bold **', /\*\*[^*\s][^*]*\*\*/],
  ['table delimiter', /^\|?\s*:?-{3,}:?\s*\|/m],
  ['task marker', /^\s*[-*] \[[ xX]\] /m],
  ['link syntax', /\]\((https?:|\.\.?\/|#)/],
  ['heading hashes', /^#{1,6} \S/m],
  ['fence ticks', /^```/m],
];
const exceptions = [];
const tellRows = [];
let totalBytes = 0;
const started = Date.now();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  totalBytes += text.length;
  let out;
  try { out = renderMarkdown(text, { panelKey: 'k', docPath: path.basename(file) }); } catch (error) { exceptions.push(`${file}: ${error.stack.split('\n').slice(0, 2).join(' | ')}`); continue; }
  if (/<script/i.test(out.html)) exceptions.push(`${file}: <script leaked`);
  const visible = plainText(out.html.replace(/<pre>[\s\S]*?<\/pre>/g, '').replace(/<code>[\s\S]*?<\/code>/g, ''));
  const hits = TELLS.filter(([, re]) => re.test(visible)).map(([name]) => name);
  if (hits.length) tellRows.push({ file: path.relative(root, file), hits });
}
const elapsed = Date.now() - started;
console.log(`files ${files.length} · ${(totalBytes / 1e6).toFixed(1)} MB · ${elapsed} ms (${(elapsed / files.length).toFixed(1)} ms/file)`);
console.log(`exceptions ${exceptions.length}`);
exceptions.slice(0, 20).forEach((line) => console.log('  ' + line));
console.log(`files with tells ${tellRows.length}`);
const byTell = {};
tellRows.forEach(({ hits }) => hits.forEach((h) => { byTell[h] = (byTell[h] || 0) + 1; }));
Object.entries(byTell).sort((a, b) => b[1] - a[1]).forEach(([name, n]) => console.log(`  ${String(n).padStart(4)}  ${name}`));
tellRows.slice(0, 25).forEach(({ file, hits }) => console.log(`  ${file}  ←  ${hits.join(', ')}`));
