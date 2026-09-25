'use strict';

// Corpus-tuned markdown → muster-roll HTML. Renders the subset real .meta/
// docs use (rules: .meta/designs/viewport.md §3; survey: assessments/
// viewport-terrain.md), not CommonMark: `---` is always a rule, indentation always continues a
// list, every raw `<` is escaped. Pure: strings in, strings out.

const posixPath = require('path').posix;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => ESCAPES[character]);
}

// Text content of an HTML fragment we produced ourselves (tags out, the five
// entities decoded). Used for titles, slugs, labels and task identity.
function plainText(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity]);
}

function fnv1a32(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function slugify(text) {
  const slug = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'section';
}

const WARN_LEAD = /^(?:\*{1,2}|_{1,2})?\s*⚠️?/;
const WARN_GLYPH = /⚠️?/g;
const ALLOWED_SCHEMES = new Set(['http', 'https', 'mailto']);
const PLACEHOLDER = /\x00(\d+)\x00/g;

// The one URL rule for every href (design §3): control characters or a scheme
// outside the allowlist → the link degrades to its text.
function sanitizeUrl(rawUrl) {
  const url = rawUrl.trim();
  if (/[\x00-\x1f\x7f]/.test(url)) return null;
  const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(url);
  if (scheme && !ALLOWED_SCHEMES.has(scheme[1].toLowerCase())) return null;
  return url;
}

// A doc-relative target resolved against the doc's directory → a site-absolute
// path the server can route (`/designs/x.md`).
function resolveRelative(target, docDir) {
  return '/' + posixPath.normalize(posixPath.join(docDir || '', target)).replace(/^\/+/, '');
}

// ---------------------------------------------------------------- inline ----

function renderInline(rawText, context, options = {}) {
  const placeholders = [];
  const hold = (html) => { placeholders.push(html); return `\x00${placeholders.length - 1}\x00`; };

  // 1. code spans first: a run of N backticks closes at the next run of N
  let text = rawText.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (match, ticks, code) => hold(`<code>${escapeHtml(code.trim())}</code>`));

  // 2. images and links, parsed on raw text; the label rendered recursively
  // the target may hold one level of balanced parens (`javascript:alert(1)`) and
  // control characters — both reach sanitizeUrl, which degrades them to text
  text = text.replace(/(!?)\[([^\]]*)\]\(((?:[^()\n]|\([^()\n]*\))*?)(?:\s+"((?:\\"|[^"])*)")?\)/g, (match, bang, label, target, title) => {
    const labelHtml = renderInline(label, context);
    const url = sanitizeUrl(target);
    if (url === null) return hold(labelHtml);
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
    let href = url;
    let extra = '';
    if (bang) {
      if (!hasScheme) href = resolveRelative(url, context.docDir);
      return hold(`<a href="${escapeHtml(href)}" class="img">${labelHtml}</a>`);
    }
    if (url.startsWith('#')) {
      href = `#${context.panelKey}-${slugify(url.slice(1))}`;
    } else if (!hasScheme && !url.startsWith('/') && /\.md(?:$|[#?])/.test(url)) {
      href = resolveRelative(url, context.docDir);
    } else if (/^https?:/i.test(url)) {
      extra = ' rel="noopener" target="_blank"';
    }
    const titleAttr = title ? ` title="${escapeHtml(title.replace(/\\"/g, '"'))}"` : '';
    return hold(`<a href="${escapeHtml(href)}"${titleAttr}${extra}>${labelHtml}</a>`);
  });

  // 3. bare URLs (not inside <…> or glued to a word); trailing punctuation stays text
  text = text.replace(/(?<![<\w/])https?:\/\/[^\s<>()[\]\x00]+/g, (match) => {
    const trimmed = match.replace(/[.,;:!?*_~]+$/, ''); // trailing punctuation and emphasis markers stay text
    const tail = match.slice(trimmed.length);
    return hold(`<a href="${escapeHtml(trimmed)}" rel="noopener" target="_blank">${escapeHtml(trimmed)}</a>`) + tail;
  });

  // 4. escape everything that is left
  text = escapeHtml(text);

  // 5. emphasis on the escaped text (placeholders are opaque to these)
  text = text
    .replace(/\*\*(?=\S)([\s\S]+?)(?<=\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w])__(?=\S)([\s\S]+?)(?<=\S)__(?!\w)/g, '$1<strong>$2</strong>')
    .replace(/~~(?=[^~\s])([^~\n]+?)(?<=\S)~~(?!~)/g, '<s>$1</s>')
    .replace(/\*(?=\S)([^*\n]+?)(?<=\S)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_(?=\S)([^_\n]+?)(?<=\S)_(?!\w)/g, '$1<em>$2</em>');

  // 6. ⚠ glyphs → inline amber; a block-level leading glyph stays bare
  const leadIndex = options.warnLead && WARN_LEAD.test(rawText) ? text.indexOf('⚠') : -1;
  text = text.replace(WARN_GLYPH, (glyph, offset) => (offset === leadIndex ? glyph : `<span class="warn-glyph">${glyph}</span>`));

  // 6.5 tokens and external ids (tree mode): only text between tags is touched
  if (context.tokens || context.external) text = wrapTokens(text, context);

  // 7. restore
  return text.replace(PLACEHOLDER, (match, index) => placeholders[Number(index)]);
}

// A defined label (`R3`, `OQ24`) becomes a hoverable span when the index
// resolved it in this doc's neighborhood; `#1214` becomes a link to the pull
// request when a repo resolves; `DEV-2564` links when a prefix is configured.
// Tags, placeholders and entities are left alone.
const TOKEN_IN_TEXT = /(?<![\w#/\-])((?:OQ|[A-Z]{1,2})\d{1,3}[a-z]?)(?![\w\-])/g;
const PULL_IN_TEXT = /(?<![&;\w])#(\d{2,6})(?!\d)/g;
const TICKET_IN_TEXT = /(?<![\w\-])([A-Z]{2,6})-(\d{1,6})(?![\w\-])/g;

function wrapTokens(html, context) {
  const segments = html.split(/(<[^>]+>)/);
  let plainBefore = '';
  return segments.map((segment) => {
    if (segment.startsWith('<')) return segment;
    const original = segment;
    let output = segment;
    if (context.tokens) {
      output = output.replace(TOKEN_IN_TEXT, (match, token) => {
        const resolved = context.tokens[token];
        if (!resolved) return match;
        return `<span class="tok" data-tok="${token}" data-status="${resolved.status}" tabindex="0">${token}</span>`;
      });
    }
    if (context.external) {
      output = output.replace(PULL_IN_TEXT, (match, number, offset) => {
        const href = context.external.pull(plainBefore + original.slice(0, offset), number);
        return href ? `<a class="xid" href="${escapeHtml(href)}" rel="noopener" target="_blank" title="pull request #${number}">${match}</a>` : match;
      });
      output = output.replace(TICKET_IN_TEXT, (match, prefix, rest) => {
        const href = context.external.ticket(prefix, rest);
        return href ? `<a class="xid" href="${escapeHtml(href)}" rel="noopener" target="_blank" title="${escapeHtml(match)}">${match}</a>` : match;
      });
    }
    plainBefore += original;
    return output;
  }).join('');
}

// ----------------------------------------------------------------- blocks ----

const FENCE_OPEN = /^\s{0,3}(`{3,})(.*)$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const LIST_ITEM_EMPTY = /^(\s*)([-*+]|\d{1,9}[.)])\s*$/;
const TABLE_DELIMITER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const TASK = /^\[( |x|X)\]\s+(.*)$/;
const NUMERIC_CELL = /^[≈~±+−-]?\s*\d[\d.,:%/×–\- ]*$/;

function isBlank(line) { return /^\s*$/.test(line); }
function indentOf(line) { return /^\s*/.exec(line)[0].length; }

function isTableStart(lines, index) {
  return lines[index].includes('|') && index + 1 < lines.length
    && lines[index + 1].includes('-') && TABLE_DELIMITER.test(lines[index + 1]);
}

function startsBlock(lines, index) {
  const line = lines[index];
  return HEADING.test(line) || FENCE_OPEN.test(line) || RULE.test(line) || QUOTE.test(line)
    || LIST_ITEM.test(line) || LIST_ITEM_EMPTY.test(line) || isTableStart(lines, index);
}

function splitCells(row) {
  const cells = [];
  let current = '';
  for (let index = 0; index < row.length; index++) {
    const character = row[index];
    if (character === '\\' && row[index + 1] === '|') { current += '|'; index++; continue; }
    if (character === '|') { cells.push(current); current = ''; continue; }
    current += character;
  }
  cells.push(current);
  if (cells.length && cells[0].trim() === '') cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
  return cells.map((cell) => cell.trim());
}

function parseTable(lines, index, context) {
  const headers = splitCells(lines[index]);
  const alignments = splitCells(lines[index + 1]).map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    return left && right ? 'c' : right ? 'r' : left ? 'l' : '';
  });
  let cursor = index + 2;
  const rows = [];
  while (cursor < lines.length && !isBlank(lines[cursor]) && lines[cursor].includes('|')) {
    rows.push(splitCells(lines[cursor]));
    cursor++;
  }
  const classAttr = (classes) => (classes.length ? ` class="${classes.join(' ')}"` : '');
  const head = headers.map((cell, column) => `<th${classAttr(alignments[column] ? [alignments[column]] : [])}>${renderInline(cell, context)}</th>`).join('');
  const body = rows.map((row) => '<tr>' + headers.map((header, column) => {
    const cell = row[column] === undefined ? '' : row[column];
    const html = renderInline(cell, context);
    const classes = [];
    if (cell && NUMERIC_CELL.test(plainText(html))) classes.push('n');
    if (alignments[column]) classes.push(alignments[column]);
    return `<td${classAttr(classes)}>${html}</td>`;
  }).join('') + '</tr>\n').join('');
  const html = `<div class="tbl"><table>\n<thead><tr>${head}</tr></thead>\n<tbody>\n${body}</tbody>\n</table></div>\n`;
  return { block: { type: 'table', html }, next: cursor };
}

function parseFence(lines, index) {
  const [, ticks, info] = FENCE_OPEN.exec(lines[index]);
  const language = (info.trim().split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z0-9_+-]/g, '');
  const closing = new RegExp(`^\\s*\`{${ticks.length},}\\s*$`);
  let cursor = index + 1;
  const body = [];
  while (cursor < lines.length && !closing.test(lines[cursor])) {
    body.push(lines[cursor]);
    cursor++;
  }
  const classAttr = language ? ` class="lang-${language}"` : '';
  const html = `<pre><code${classAttr}>${escapeHtml(body.join('\n'))}${body.length ? '\n' : ''}</code></pre>\n`;
  return { block: { type: 'pre', html }, next: cursor + 1 };
}

function parseQuote(lines, index, context) {
  const inner = [];
  let cursor = index;
  while (cursor < lines.length) {
    const line = lines[cursor];
    const quoted = QUOTE.exec(line);
    if (quoted) { inner.push(quoted[1]); cursor++; continue; }
    const lazy = !isBlank(line) && inner.length && !isBlank(inner[inner.length - 1]) && !startsBlock(lines, cursor);
    if (lazy) { inner.push(line); cursor++; continue; }
    break;
  }
  const warn = Boolean(inner.length && WARN_LEAD.test(inner[0].trim()));
  // a ⚠ quote qualifies through its first paragraph, and only the quote carries the class
  let innerHtml = renderBlocks(parseBlocks(inner, context));
  if (warn) innerHtml = innerHtml.replace('<p class="warn">', '<p>');
  const html = `<blockquote${warn ? ' class="warn"' : ''}>\n${innerHtml}</blockquote>\n`;
  return { block: { type: 'blockquote', html }, next: cursor };
}

function parseList(lines, index, context) {
  const first = LIST_ITEM.exec(lines[index]) || LIST_ITEM_EMPTY.exec(lines[index]);
  const listIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const start = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  let cursor = index;
  while (cursor < lines.length) {
    const marker = LIST_ITEM.exec(lines[cursor]) || LIST_ITEM_EMPTY.exec(lines[cursor]);
    if (!marker || marker[1].length < listIndent || marker[1].length > listIndent + 3) break;
    if (/\d/.test(marker[2]) !== ordered) break;
    const contentColumn = marker[1].length + marker[2].length + 1;
    const itemLines = [marker[3] === undefined ? '' : marker[3]];
    cursor++;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (isBlank(line)) { itemLines.push(''); cursor++; continue; }
      const indent = indentOf(line);
      if (indent >= contentColumn) { itemLines.push(line.slice(contentColumn)); cursor++; continue; }
      const nextMarker = LIST_ITEM.exec(line) || LIST_ITEM_EMPTY.exec(line);
      if (nextMarker && indent >= listIndent) break;
      const lastLine = itemLines[itemLines.length - 1];
      const lazy = !isBlank(lastLine) && !startsBlock(lines, cursor);
      if (lazy) { itemLines.push(line.trim()); cursor++; continue; }
      break;
    }
    while (itemLines.length && isBlank(itemLines[itemLines.length - 1])) itemLines.pop();
    if (!itemLines.length) itemLines.push(''); // an empty `- ` item still exists
    items.push(itemLines);
  }

  const parsedItems = items.map((itemLines) => {
    const task = TASK.exec(itemLines[0]);
    if (task) itemLines[0] = task[2];
    const blocks = parseBlocks(itemLines, context);
    return { task, blocks, firstLine: itemLines[0] };
  });
  const isChecklist = parsedItems.some((item) => item.task);
  const tag = ordered ? 'ol' : 'ul';
  const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
  const classAttr = isChecklist ? ' class="levels"' : '';

  const itemHtml = parsedItems.map(({ task, blocks, firstLine }) => {
    const [head, ...rest] = blocks;
    const headIsParagraph = Boolean(head && head.type === 'p');
    const inlineHead = headIsParagraph ? head.inline : '';
    const restHtml = renderBlocks(headIsParagraph ? rest : blocks);
    const body = inlineHead + (restHtml ? `\n${restHtml}` : '');
    const warn = WARN_LEAD.test(firstLine.trim());
    if (task) {
      const done = task[1] !== ' ';
      const label = escapeHtml(plainText(inlineHead));
      const identity = taskIdFor(firstLine, context);
      context.tasks.total++;
      if (done) context.tasks.sourceDone++;
      const classes = ['lvl'].concat(done ? ['done'] : [], warn ? ['warn'] : []).join(' ');
      return `<li class="${classes}" data-task-id="${identity}"><input type="checkbox"${done ? ' checked disabled' : ''} aria-label="${label}"><div class="body">${body}</div></li>\n`;
    }
    const classes = [].concat(isChecklist ? ['marker'] : [], warn ? ['warn'] : []);
    const attr = classes.length ? ` class="${classes.join(' ')}"` : '';
    return `<li${attr}>${body}</li>\n`;
  }).join('');

  const html = `<${tag}${classAttr}${startAttr}>\n${itemHtml}</${tag}>\n`;
  return { block: { type: 'list', html }, next: cursor };
}

function parseParagraph(lines, index, context) {
  const collected = [lines[index].trim()];
  let cursor = index + 1;
  while (cursor < lines.length && !isBlank(lines[cursor]) && !startsBlock(lines, cursor)) {
    collected.push(lines[cursor].trim());
    cursor++;
  }
  const raw = collected.join('\n');
  const warn = WARN_LEAD.test(raw);
  const inline = renderInline(raw, context, { warnLead: true });
  const classAttr = warn ? ' class="warn"' : '';
  return { block: { type: 'p', inline, html: `<p${classAttr}>${inline}</p>\n` }, next: cursor };
}

function parseHeading(lines, index, context) {
  const [, hashes, text] = HEADING.exec(lines[index]);
  const level = Math.min(hashes.length, 4);
  const inline = renderInline(text, context);
  const plain = plainText(inline);
  let slug = slugify(plain);
  const seen = context.slugSeen.get(slug) || 0;
  context.slugSeen.set(slug, seen + 1);
  if (seen) slug = `${slug}-${seen + 1}`;
  if (hashes.length === 1 && context.title === null) context.title = plain;
  const type = hashes.length === 1 ? 'h1' : 'h';
  return { block: { type, html: `<h${level} id="${context.panelKey}-${slug}">${inline}</h${level}>\n` }, next: index + 1 };
}

function parseBlocks(lines, context, topLevel = false) {
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (isBlank(line)) { index++; continue; }
    const tasksBefore = context.tasks.total;
    let result;
    if (FENCE_OPEN.test(line)) result = parseFence(lines, index);
    else if (HEADING.test(line)) result = parseHeading(lines, index, context);
    else if (RULE.test(line)) result = { block: { type: 'hr', html: '<hr>\n' }, next: index + 1 };
    else if (QUOTE.test(line)) result = parseQuote(lines, index, context);
    else if (isTableStart(lines, index)) result = parseTable(lines, index, context);
    else if (LIST_ITEM.test(line) || LIST_ITEM_EMPTY.test(line)) result = parseList(lines, index, context);
    else result = parseParagraph(lines, index, context);
    result.block.tasksBefore = tasksBefore;
    result.block.tasksAfter = context.tasks.total;
    if (topLevel && context.tokens) result.block.html = anchorDefinitions(result.block.html, index + 1 + context.lineOffset, result.next + context.lineOffset, context);
    blocks.push(result.block);
    index = result.next;
  }
  return blocks;
}

// The block that holds a token's defining line gets the anchor a citation
// jumps to: the first wrapped occurrence in that block becomes `.tok.def`.
function anchorDefinitions(html, firstLine, lastLine, context) {
  let output = html;
  for (const token of Object.keys(context.tokens)) {
    const resolved = context.tokens[token];
    if (!resolved.sameDoc || context.anchored.has(token)) continue;
    if (resolved.line < firstLine || resolved.line > lastLine) continue;
    const citation = `<span class="tok" data-tok="${token}"`;
    const position = output.indexOf(citation);
    if (position === -1) continue;
    output = output.slice(0, position) + `<span class="tok def" id="tok-${context.panelKey}-${token}" data-tok="${token}"` + output.slice(position + citation.length);
    context.anchored.add(token);
  }
  return output;
}

// The specimen's sticky strip, emitted before the top-level block that holds
// the first task item; viewport.js keeps the count and the bar live.
function progressStrip(tasks) {
  return `<div class="progress" role="status" aria-live="polite"><div class="bar"><div class="fill"></div></div><span class="n">${tasks.sourceDone} / ${tasks.total} done</span><button type="button" class="reset">Reset</button></div>\n`;
}


function renderBlocks(blocks) { return blocks.map((block) => block.html).join(''); }

// ----------------------------------------------------------- front-matter ----

const META_KEY = /^([A-Za-z][\w-]*):\s?(.*)$/;

function extractFrontMatter(lines) {
  if (lines[0] !== '---') return { pairs: [], body: lines };
  const closing = lines.slice(1, 41).findIndex((line) => line === '---');
  if (closing === -1) return { pairs: [], body: lines };
  const block = lines.slice(1, closing + 1);
  const pairs = [];
  for (const line of block) {
    const keyed = META_KEY.exec(line);
    if (keyed) { pairs.push({ key: keyed[1], parts: keyed[2].trim() ? [keyed[2].trim()] : [] }); continue; }
    if (pairs.length && line.trim()) pairs[pairs.length - 1].parts.push(line.trim());
  }
  if (!pairs.length) return { pairs: [], body: lines };
  return { pairs, body: lines.slice(closing + 2) };
}

function renderMeta(pairs, context) {
  const rows = pairs.map(({ key, parts }) => {
    const value = parts.map((part) => renderInline(part, context)).join('<br>');
    const wide = parts.length > 1 || plainText(value).length > 48;
    const html = `<div class="kv${wide ? ' wide' : ''}"><span class="k">${escapeHtml(key)}</span><span class="v">${value}</span></div>\n`;
    return { key, value, html };
  });
  return { meta: rows.map((row) => [row.key, row.value]), html: `<div class="meta">\n${rows.map((row) => row.html).join('')}</div>\n` };
}

// ------------------------------------------------------------------ api ----

function makeContext(options = {}) {
  const docPath = options.docPath || '';
  const docDir = posixPath.dirname(docPath);
  return {
    panelKey: options.panelKey || 'doc',
    docPath,
    docDir: docDir === '.' ? '' : docDir,
    slugSeen: new Map(),
    taskSeen: new Map(),
    tasks: { total: 0, sourceDone: 0 },
    title: null,
    tokens: options.tokens || null,       // token → resolved definition (tree.js tokensFor)
    external: options.external || null,   // { pull(precedingText, number), ticket(prefix, rest) }
    anchored: new Set(),
    lineOffset: 0,
  };
}

// Task identity: the item's rendered text, tags stripped, case and whitespace
// folded, hashed; duplicates within one doc get -2, -3… in document order.
function taskIdFor(text, context) {
  const normalized = plainText(renderInline(text, context || makeContext())).toLowerCase().replace(/\s+/g, ' ').trim();
  const identity = `t-${fnv1a32(normalized)}`;
  if (!context) return identity;
  const seen = context.taskSeen.get(identity) || 0;
  context.taskSeen.set(identity, seen + 1);
  return seen ? `${identity}-${seen + 1}` : identity;
}

function renderMarkdown(text, options = {}) {
  const context = makeContext(options);
  const lines = String(text).replace(/\x00/g, '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').replace(/^\t+/gm, (tabs) => '    '.repeat(tabs.length)).split('\n');
  const { pairs, body } = extractFrontMatter(lines);
  context.lineOffset = lines.length - body.length; // definition lines are counted on the raw file
  const blocks = parseBlocks(body, context, true);
  let meta = [];
  if (pairs.length) {
    const rendered = renderMeta(pairs, context);
    meta = rendered.meta;
    // The specimen's hire card sits under the title and lede — the one
    // deliberate departure from source order (metadata is not a section).
    let insertAt = 0;
    if (blocks[0] && blocks[0].type === 'h1') insertAt = blocks[1] && blocks[1].type === 'p' ? 2 : 1;
    blocks.splice(insertAt, 0, { type: 'meta', html: rendered.html });
  }
  const firstTaskBlock = blocks.findIndex((block) => block.tasksAfter > block.tasksBefore);
  if (firstTaskBlock !== -1) blocks.splice(firstTaskBlock, 0, { type: 'progress', html: progressStrip(context.tasks) });
  return { html: renderBlocks(blocks), title: context.title, meta, tasks: context.tasks };
}

module.exports = { renderMarkdown, renderInline, escapeHtml, plainText, slugify, sanitizeUrl, taskIdFor };
