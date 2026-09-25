#!/usr/bin/env node

// Goldens for lib/viewport/markdown.js — one per row of the design's §3 table
// (.meta/designs/viewport.md). The renderer targets the corpus's markdown subset, not CommonMark:
// `---` is always a rule, indentation always continues a list, raw `<` is
// always escaped. node:test; runs standalone and exits non-zero on failure.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { renderMarkdown, escapeHtml, taskIdFor } = require('../lib/viewport/markdown.js');

const render = (text, options = {}) => renderMarkdown(text, { panelKey: 'k', ...options });

test('escapeHtml covers the five characters and nothing else', () => {
  assert.strictEqual(escapeHtml(`a & b < c > "d" 'e'`), 'a &amp; b &lt; c &gt; &quot;d&quot; &#39;e&#39;');
  assert.strictEqual(escapeHtml('→ ⚠️ é'), '→ ⚠️ é');
});

test('headings: levels, prefixed ids, title from the first H1', () => {
  const out = render('# Viewport — Desired State\n\n## Tradeoffs\n\n### Sub *em*\n\n#### Deep\n\n##### Deeper\n');
  assert.strictEqual(out.title, 'Viewport — Desired State');
  assert.strictEqual(out.html,
    '<h1 id="k-viewport-desired-state">Viewport — Desired State</h1>\n'
    + '<h2 id="k-tradeoffs">Tradeoffs</h2>\n'
    + '<h3 id="k-sub-em">Sub <em>em</em></h3>\n'
    + '<h4 id="k-deep">Deep</h4>\n'
    + '<h4 id="k-deeper">Deeper</h4>\n');
});

test('duplicate headings get ordinal ids; ids are [a-z0-9-] only', () => {
  const out = render('## Constructor!\n\n## constructor\n\n## ¡Ünïcode & <T>\n');
  assert.strictEqual(out.html,
    '<h2 id="k-constructor">Constructor!</h2>\n'
    + '<h2 id="k-constructor-2">constructor</h2>\n'
    + '<h2 id="k-unicode-t">¡Ünïcode &amp; &lt;T&gt;</h2>\n');
});

test('paragraphs keep soft line breaks; no hard-break syntax', () => {
  const out = render('one  \ntwo\\\nthree\n\nfour\n');
  assert.strictEqual(out.html, '<p>one\ntwo\\\nthree</p>\n<p>four</p>\n');
});

test('rules: --- *** ___ are always hr, never setext', () => {
  const out = render('text\n---\n\n***\n\n___\n');
  assert.strictEqual(out.html, '<p>text</p>\n<hr>\n<hr>\n<hr>\n');
});

test('front-matter: kv grid with wide values, continuations, nested lists; placed after H1 + lede', () => {
  const src = '---\nStatus: draft\nDate: 2026-09-06\nNote: a very long value that certainly runs past forty-eight characters\nAmendments:\n  - id: A1\n    title: first\n---\n\n# Title\n\nLede here.\n\nBody.\n';
  const out = render(src);
  assert.deepStrictEqual(out.meta, [
    ['Status', 'draft'],
    ['Date', '2026-09-06'],
    ['Note', 'a very long value that certainly runs past forty-eight characters'],
    ['Amendments', '- id: A1<br>title: first'],
  ]);
  assert.strictEqual(out.html,
    '<h1 id="k-title">Title</h1>\n'
    + '<p>Lede here.</p>\n'
    + '<div class="meta">\n'
    + '<div class="kv"><span class="k">Status</span><span class="v">draft</span></div>\n'
    + '<div class="kv"><span class="k">Date</span><span class="v">2026-09-06</span></div>\n'
    + '<div class="kv wide"><span class="k">Note</span><span class="v">a very long value that certainly runs past forty-eight characters</span></div>\n'
    + '<div class="kv wide"><span class="k">Amendments</span><span class="v">- id: A1<br>title: first</span></div>\n'
    + '</div>\n'
    + '<p>Body.</p>\n');
});

test('front-matter values are inline-rendered; a --- block without key: value is ordinary markdown', () => {
  const withLink = render('---\nAssessment: ../assessments/x.md and `code`\n---\n\n# T\n', { docPath: 'designs/v.md' });
  assert.ok(withLink.html.includes('<span class="v">../assessments/x.md and <code>code</code></span>'));
  const plain = render('---\njust words\n---\n\n# T\n');
  assert.deepStrictEqual(plain.meta, []);
  assert.strictEqual(plain.html, '<hr>\n<p>just words</p>\n<hr>\n<h1 id="k-t">T</h1>\n');
});

test('front-matter with no H1 comes first', () => {
  const out = render('---\nStatus: x\n---\n\ntext\n');
  assert.strictEqual(out.html, '<div class="meta">\n<div class="kv"><span class="k">Status</span><span class="v">x</span></div>\n</div>\n<p>text</p>\n');
  assert.strictEqual(out.title, null);
});

test('lists: nesting by indent, continuation lines, lazy continuation, ordered start', () => {
  const src = '- **Item** — text that\n  continues here\n  - nested\n    deeper wrap\n- second\nlazy tail\n\n3. three\n4. four\n';
  const out = render(src);
  assert.strictEqual(out.html,
    '<ul>\n'
    + '<li><strong>Item</strong> — text that\ncontinues here\n<ul>\n<li>nested\ndeeper wrap</li>\n</ul>\n</li>\n'
    + '<li>second\nlazy tail</li>\n'
    + '</ul>\n'
    + '<ol start="3">\n<li>three</li>\n<li>four</li>\n</ol>\n');
});

test('list items hold blocks: a second paragraph, a fence, a table — never an indented code block', () => {
  const src = '- head\n\n  second para\n\n  ```js\n  x = 1\n  ```\n- next\n\n    four-space indented is still continuation\n';
  const out = render(src);
  assert.strictEqual(out.html,
    '<ul>\n'
    + '<li>head\n<p>second para</p>\n<pre><code class="lang-js">x = 1\n</code></pre>\n</li>\n'
    + '<li>next\n<p>four-space indented is still continuation</p>\n</li>\n'
    + '</ul>\n');
});

test('task lists render as the specimen checklist: lvl cards, done + disabled for [x], marker for non-task items', () => {
  const src = '- [ ] first thing\n- [x] already done\n- a divider line\n- [ ] first thing\n';
  const out = render(src);
  const id1 = taskIdFor('first thing');
  const id2 = taskIdFor('already done');
  assert.strictEqual(out.html,
    '<div class="progress" role="status" aria-live="polite"><div class="bar"><div class="fill"></div></div><span class="n">1 / 3 done</span><button type="button" class="reset">Reset</button></div>\n'
    + '<ul class="levels">\n'
    + `<li class="lvl" data-task-id="${id1}"><input type="checkbox" aria-label="first thing"><div class="body">first thing</div></li>\n`
    + `<li class="lvl done" data-task-id="${id2}"><input type="checkbox" checked disabled aria-label="already done"><div class="body">already done</div></li>\n`
    + '<li class="marker">a divider line</li>\n'
    + `<li class="lvl" data-task-id="${id1}-2"><input type="checkbox" aria-label="first thing"><div class="body">first thing</div></li>\n`
    + '</ul>\n');
  assert.deepStrictEqual(out.tasks, { total: 3, sourceDone: 1 });
});

test('task ids hash the normalized rendered text: links → text, case and whitespace folded, ordered lists too', () => {
  assert.strictEqual(taskIdFor('See [the doc](http://x.y)  now'), taskIdFor('see the doc now'));
  assert.match(taskIdFor('x'), /^t-[0-9a-f]{8}$/);
  const out = render('1. [ ] Do **this**\n2. [ ] Do *that*\n');
  assert.ok(out.html.includes('<div class="progress"'), 'strip emitted before the first task list');
  assert.ok(out.html.includes('<ol class="levels">\n'));
  assert.ok(out.html.includes(`data-task-id="${taskIdFor('do this')}"`));
  assert.ok(out.html.includes(`data-task-id="${taskIdFor('do that')}"`));
});

test('tables: container, mono heads, alignment classes, numeric cells, padded rows, delimiter required', () => {
  const src = '| Rank | Pick | Why |\n|---:|:---|:---:|\n| 1 | **Ever Ready** | teeth |\n| ≈ 34 | short |\n';
  const out = render(src);
  assert.strictEqual(out.html,
    '<div class="tbl"><table>\n'
    + '<thead><tr><th class="r">Rank</th><th class="l">Pick</th><th class="c">Why</th></tr></thead>\n'
    + '<tbody>\n'
    + '<tr><td class="n r">1</td><td class="l"><strong>Ever Ready</strong></td><td class="c">teeth</td></tr>\n'
    + '<tr><td class="n r">≈ 34</td><td class="l">short</td><td class="c"></td></tr>\n'
    + '</tbody>\n</table></div>\n');
  const noDelim = render('| a | b |\n| c | d |\n');
  assert.strictEqual(noDelim.html, '<p>| a | b |\n| c | d |</p>\n');
});

test('fences: language class filtered, content escaped, ~~~ unsupported', () => {
  const out = render('```js x\nlet a = "<b>";\n```\n\n```\nplain\n```\n\n~~~\nnot a fence\n~~~\n');
  assert.strictEqual(out.html,
    '<pre><code class="lang-js">let a = &quot;&lt;b&gt;&quot;;\n</code></pre>\n'
    + '<pre><code>plain\n</code></pre>\n'
    + '<p>~~~\nnot a fence\n~~~</p>\n');
});

test('blockquotes: nested blocks, lazy lines', () => {
  const out = render('> quoted **bold**\n> - a list\n> - inside\ncontinues\n');
  assert.strictEqual(out.html,
    '<blockquote>\n<p>quoted <strong>bold</strong></p>\n<ul>\n<li>a list</li>\n<li>inside\ncontinues</li>\n</ul>\n</blockquote>\n');
});

test('⚠ leading → block callout (box for p/quote, rule for li); mid-line → inline glyph; table cells inline only', () => {
  const src = '⚠️ **Sensitivity note:** careful\n\n**⚠ VERIFY** the list\n\n- ⚠️ VERIFY: x\n- fine ⚠ here\n\n> ⚠ quoted\n\n| a |\n|---|\n| ⚠ cell |\n';
  const out = render(src);
  assert.strictEqual(out.html,
    '<p class="warn">⚠️ <strong>Sensitivity note:</strong> careful</p>\n'
    + '<p class="warn"><strong>⚠ VERIFY</strong> the list</p>\n'
    + '<ul>\n<li class="warn">⚠️ VERIFY: x</li>\n<li>fine <span class="warn-glyph">⚠</span> here</li>\n</ul>\n'
    + '<blockquote class="warn">\n<p>⚠ quoted</p>\n</blockquote>\n'
    + '<div class="tbl"><table>\n<thead><tr><th>a</th></tr></thead>\n<tbody>\n<tr><td><span class="warn-glyph">⚠</span> cell</td></tr>\n</tbody>\n</table></div>\n');
});

test('inline: code first, strong/em/strike, underscores only at word boundaries', () => {
  const out = render('`a * b` **bold** *em* __b2__ _e2_ snake_case_name ~~gone~~ **bold *nested* bold**\n');
  assert.strictEqual(out.html,
    '<p><code>a * b</code> <strong>bold</strong> <em>em</em> <strong>b2</strong> <em>e2</em> snake_case_name <s>gone</s> <strong>bold <em>nested</em> bold</strong></p>\n');
});

test('links: external, relative .md resolved against the doc, in-doc anchors prefixed, titles escaped', () => {
  const src = '[ext](https://x.y/z "t\\"q") [rel](../assessments/a.md) [here](#tradeoffs) [file](notes.txt)\n';
  const out = render(src, { docPath: 'designs/v.md' });
  assert.strictEqual(out.html,
    '<p><a href="https://x.y/z" title="t&quot;q" rel="noopener" target="_blank">ext</a> '
    + '<a href="/assessments/a.md">rel</a> '
    + '<a href="#k-tradeoffs">here</a> '
    + '<a href="notes.txt">file</a></p>\n');
});

test('URL rule: javascript:/data:/vbscript:/control chars become text; mailto allowed; bare https linkified', () => {
  const src = '[a](javascript:alert(1)) [b](java\tscript:alert(1)) ![c](data:image/png;base64,x) [d](mailto:me@x.y) see https://ex.am/ple?q=1. and <https://not.auto/>\n';
  const out = render(src);
  assert.strictEqual(out.html,
    '<p>a b c <a href="mailto:me@x.y">d</a> see <a href="https://ex.am/ple?q=1" rel="noopener" target="_blank">https://ex.am/ple?q=1</a>. and &lt;https://not.auto/&gt;</p>\n');
});

test('images render as links, never fetched; raw HTML, wikilinks, autolinks are literal', () => {
  const out = render('![alt text](../inbox/shot.png) [[wiki]] <br> <details>x</details> <script>alert(1)</script>\n', { docPath: 'designs/v.md' });
  assert.strictEqual(out.html,
    '<p><a href="/inbox/shot.png" class="img">alt text</a> [[wiki]] &lt;br&gt; &lt;details&gt;x&lt;/details&gt; &lt;script&gt;alert(1)&lt;/script&gt;</p>\n');
  assert.ok(!out.html.includes('<script'));
});

test('an H1 of </script> cannot leak as markup', () => {
  const out = render('# </script><script>alert(1)</script>\n');
  assert.strictEqual(out.title, '</script><script>alert(1)</script>');
  assert.ok(!out.html.includes('<script'));
});

test('repo smoke: every .md under this repo .meta renders without throwing and emits no script tag', () => {
  const metaDir = path.join(__dirname, '..', '.meta');
  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) files.push(full);
    }
  })(metaDir);
  assert.ok(files.length > 20, `expected a real corpus, found ${files.length}`);
  for (const file of files) {
    const out = render(fs.readFileSync(file, 'utf8'), { docPath: path.relative(metaDir, file) });
    assert.ok(typeof out.html === 'string' && out.html.length > 0, file);
    assert.ok(!/<script/i.test(out.html), `script tag leaked from ${file}`);
  }
});
