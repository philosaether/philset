/* philset view — the live-preview markdown editor (CodeMirror 6, Obsidian-style).
   The source stays the source: markup is styled in place, and syntax markers
   are hidden on every line the cursor is not on. viewport.js mounts this in
   place of textarea.raw. Needs window.CM from vendor/cm.js, loaded first.

   The editor never rewrites the document: the only mutations are keystrokes
   and a checkbox click, which flips exactly the three characters of its
   `[ ]` / `[x]`. Untouched lines come back byte-identical (a document whose
   line breaks are all CRLF keeps them; mixed endings normalise to LF, which is
   CodeMirror's own document model). */
(function () {
  'use strict';
  const CM = window.CM;
  if (!CM) throw new Error('editor.js: vendor/cm.js must load first (window.CM is missing)');

  const { EditorState, EditorView, Decoration, WidgetType, ViewPlugin, keymap, syntaxTree } = CM;

  // The page's front-matter rule (lib/viewport/markdown.js): line 1 is `---`
  // after an optional BOM, a closing `---` within 40 lines, ≥ 1 `Key: value`.
  const META_KEY = /^[A-Za-z][\w-]*:\s?/;
  const FRONT_MATTER_MAX_LINES = 41;
  const SAFE_HREF = /^(https?:|mailto:)/i;
  const LINK_CONTAINERS = new Set(['Link', 'Image', 'Autolink']);

  /* ------------------------------------------------------------ widgets ---- */

  class BulletWidget extends WidgetType {
    eq() { return true; }
    toDOM() {
      const bullet = document.createElement('span');
      bullet.className = 'cm-bullet';
      bullet.textContent = '•';
      return bullet;
    }
  }

  class ImageGlyphWidget extends WidgetType {
    eq() { return true; }
    toDOM() {
      const glyph = document.createElement('span');
      glyph.className = 'cm-image-glyph';
      glyph.textContent = '⧉ ';
      return glyph;
    }
  }

  class RuleWidget extends WidgetType {
    eq() { return true; }
    toDOM() {
      const rule = document.createElement('span');
      rule.className = 'cm-rule';
      return rule;
    }
  }

  class CheckboxWidget extends WidgetType {
    constructor(checked) { super(); this.checked = checked; }
    eq(other) { return other.checked === this.checked; }
    toDOM() {
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.className = 'cm-task-checkbox';
      box.checked = this.checked;
      box.setAttribute('aria-label', this.checked ? 'done' : 'not done');
      return box;
    }
    // Let the editor see the mousedown so the handler below can flip the source.
    ignoreEvent() { return false; }
  }

  const bulletWidget = new BulletWidget();
  const imageGlyphWidget = new ImageGlyphWidget();
  const ruleWidget = new RuleWidget();
  const checkedWidget = new CheckboxWidget(true);
  const uncheckedWidget = new CheckboxWidget(false);

  /* -------------------------------------------------------- decorations ---- */

  const hiddenMarker = Decoration.replace({});
  const bulletDecoration = Decoration.replace({ widget: bulletWidget });
  const imageGlyphDecoration = Decoration.replace({ widget: imageGlyphWidget });
  const ruleDecoration = Decoration.replace({ widget: ruleWidget });
  const checkedDecoration = Decoration.replace({ widget: checkedWidget });
  const uncheckedDecoration = Decoration.replace({ widget: uncheckedWidget });
  const syntaxMark = Decoration.mark({ class: 'cm-syntax' }); // a marker the cursor's line shows, dimmed
  const emphasisMark = Decoration.mark({ class: 'cm-em' });
  const strongMark = Decoration.mark({ class: 'cm-strong' });
  const strikeMark = Decoration.mark({ class: 'cm-strike' });
  const inlineCodeMark = Decoration.mark({ class: 'cm-inline-code' });
  const lineClasses = {};
  function lineClass(name) {
    return lineClasses[name] || (lineClasses[name] = Decoration.line({ class: name }));
  }

  // Position just past the closing `---` of the front matter, or -1.
  function frontMatterEnd(doc) {
    if (doc.lines < 2 || doc.line(1).text.replace(/^\uFEFF/, '') !== '---') return -1;
    let keyed = false;
    for (let number = 2; number <= Math.min(doc.lines, FRONT_MATTER_MAX_LINES); number++) {
      const line = doc.line(number);
      if (line.text === '---') return keyed ? line.to : -1;
      if (META_KEY.test(line.text)) keyed = true;
    }
    return -1;
  }

  // Line numbers that hold a cursor or any part of a selection: these show raw source.
  function activeLineNumbers(state) {
    const active = new Set();
    for (const range of state.selection.ranges) {
      const first = state.doc.lineAt(range.from).number;
      const last = state.doc.lineAt(range.to).number;
      for (let number = first; number <= last; number++) active.add(number);
    }
    return active;
  }

  function buildDecorations(view) {
    const { state } = view;
    const { doc } = state;
    const tree = syntaxTree(state);
    const active = activeLineNumbers(state);
    const rawUntil = frontMatterEnd(doc);
    const decorations = [];
    const atomic = [];
    const hiddenSeen = new Set(); // a node straddling two visible ranges is entered twice

    function isActive(from, to) {
      const first = doc.lineAt(from).number;
      const last = doc.lineAt(to).number;
      for (let number = first; number <= last; number++) if (active.has(number)) return true;
      return false;
    }
    function add(from, to, decoration) { decorations.push(decoration.range(from, to)); }
    function addLine(pos, className) { decorations.push(lineClass(className).range(doc.lineAt(pos).from)); }
    function replace(from, to, decoration) {
      if (from >= to) return;
      const key = from + ':' + to;
      if (hiddenSeen.has(key)) return;
      hiddenSeen.add(key);
      const range = decoration.range(from, to);
      decorations.push(range);
      atomic.push(range);
    }
    // A syntax marker: hidden on an inactive line, dimmed on the cursor's line.
    function marker(from, to) {
      if (from >= to) return;
      if (isActive(from, to)) add(from, to, syntaxMark); else replace(from, to, hiddenMarker);
    }
    function spacesAfter(pos, limit) {
      while (pos < limit && doc.sliceString(pos, pos + 1) === ' ') pos++;
      return pos;
    }
    function spacesBefore(pos, limit) {
      while (pos > limit && doc.sliceString(pos - 1, pos) === ' ') pos--;
      return pos;
    }
    function eachLine(from, to, callback) {
      for (let pos = from; pos <= to;) {
        const line = doc.lineAt(pos);
        callback(line);
        if (line.to >= to) break;
        pos = line.to + 1;
      }
    }
    // Every child mark of `parent` named `name` gets the marker treatment.
    function markerChildren(parent, name) {
      for (const child of parent.getChildren(name)) marker(child.from, child.to);
    }
    function styleInline(node, mark, markName) {
      add(node.from, node.to, mark);
      markerChildren(node.node, markName);
      return true;
    }
    // A `>` and the space after it. Lezer nests a continuation line's QuoteMark
    // inside whatever block it interrupts, so the marks are handled wherever the
    // walk meets them, and swept out of nodes the walk does not enter.
    function quoteMark(node) { marker(node.from, spacesAfter(node.to, node.to + 1)); }
    function quoteMarksWithin(node) {
      node.node.cursor().iterate((child) => { if (child.name === 'QuoteMark') quoteMark(child); });
    }
    // [text](url "title") / ![alt](src) / [text][ref]: the text stays, styled;
    // the opening mark and everything from `]` on hide on an inactive line.
    function styleLink(node, isImage) {
      const url = node.node.getChild('URL');
      const href = url ? doc.sliceString(url.from, url.to) : '';
      add(node.from, node.to, Decoration.mark({ class: isImage ? 'cm-link cm-image' : 'cm-link', attributes: href ? { title: href } : undefined }));
      const marks = node.node.getChildren('LinkMark');
      if (marks.length < 2) return true;
      if (isActive(node.from, node.to)) {
        for (const mark of marks) add(mark.from, mark.to, syntaxMark);
        if (url) add(url.from, url.to, syntaxMark);
      } else {
        replace(marks[0].from, marks[0].to, isImage ? imageGlyphDecoration : hiddenMarker);
        replace(marks[1].from, node.to, hiddenMarker);
      }
      quoteMarksWithin(node);
      return false; // the text's own emphasis is styled without the URL being re-entered
    }

    function enter(node) {
      if (node.name === 'Document') return true;
      if (node.to <= rawUntil) return false; // front matter stays raw; its lines are classed below
      switch (node.name) {
        case 'ATXHeading1': case 'ATXHeading2': case 'ATXHeading3':
        case 'ATXHeading4': case 'ATXHeading5': case 'ATXHeading6': {
          addLine(node.from, 'cm-h' + node.name.slice(-1));
          const line = doc.lineAt(node.from);
          for (const mark of node.node.getChildren('HeaderMark')) {
            if (mark.from === node.from) marker(mark.from, spacesAfter(mark.to, line.to));
            else marker(spacesBefore(mark.from, line.from), mark.to);
          }
          return true;
        }
        case 'Emphasis': return styleInline(node, emphasisMark, 'EmphasisMark');
        case 'StrongEmphasis': return styleInline(node, strongMark, 'EmphasisMark');
        case 'Strikethrough': return styleInline(node, strikeMark, 'StrikethroughMark');
        case 'InlineCode': styleInline(node, inlineCodeMark, 'CodeMark'); quoteMarksWithin(node); return false;
        case 'Link': return styleLink(node, false);
        case 'Image': return styleLink(node, true);
        case 'Autolink': {
          add(node.from, node.to, Decoration.mark({ class: 'cm-link' }));
          markerChildren(node.node, 'LinkMark');
          return false;
        }
        case 'URL': { // a bare URL in prose (GFM autolink); the ones inside links were handled above
          const parent = node.node.parent;
          if (!parent || !LINK_CONTAINERS.has(parent.name)) add(node.from, node.to, Decoration.mark({ class: 'cm-link' }));
          return false;
        }
        case 'Escape': marker(node.from, node.from + 1); return false;
        case 'ListItem': {
          const mark = node.node.getChild('ListMark');
          const task = node.node.getChild('Task');
          const taskMarker = task && task.getChild('TaskMarker');
          if (mark && node.node.parent && node.node.parent.name === 'BulletList') {
            if (isActive(mark.from, mark.to)) add(mark.from, mark.to, syntaxMark);
            else if (taskMarker) replace(mark.from, taskMarker.from, hiddenMarker); // a task line shows only its checkbox
            else replace(mark.from, mark.to, bulletDecoration);
          }
          if (taskMarker) {
            const checked = /x/i.test(doc.sliceString(taskMarker.from, taskMarker.to));
            if (checked) addLine(taskMarker.from, 'cm-task-done');
            if (isActive(taskMarker.from, taskMarker.to)) add(taskMarker.from, taskMarker.to, syntaxMark);
            else replace(taskMarker.from, taskMarker.to, checked ? checkedDecoration : uncheckedDecoration);
          }
          return true;
        }
        case 'Blockquote': {
          eachLine(node.from, node.to, (line) => addLine(line.from, 'cm-quote'));
          return true;
        }
        case 'QuoteMark': quoteMark(node); return false;
        case 'HorizontalRule': {
          if (isActive(node.from, node.to)) add(node.from, node.to, syntaxMark);
          else replace(node.from, node.to, ruleDecoration);
          return false;
        }
        case 'FencedCode': {
          const first = doc.lineAt(node.from);
          const last = doc.lineAt(node.to);
          eachLine(node.from, node.to, (line) => {
            addLine(line.from, 'cm-code-block');
            if (line.number === first.number) addLine(line.from, 'cm-code-block-first');
            if (line.number === last.number) addLine(line.from, 'cm-code-block-last');
          });
          const fences = node.node.getChildren('CodeMark');
          const info = node.node.getChild('CodeInfo');
          if (fences[0]) marker(fences[0].from, info ? info.to : fences[0].to);
          if (fences[1]) marker(fences[1].from, fences[1].to);
          quoteMarksWithin(node);
          return false;
        }
        case 'Table': {
          eachLine(node.from, node.to, (line) => addLine(line.from, 'cm-table'));
          quoteMarksWithin(node);
          return false;
        }
        default: return true;
      }
    }

    if (rawUntil > 0) eachLine(0, rawUntil, (line) => addLine(line.from, 'cm-frontmatter'));
    for (const { from, to } of view.visibleRanges) tree.iterate({ from, to, enter });

    return {
      decorations: Decoration.set(decorations, true),
      atomicRanges: Decoration.set(atomic, true),
    };
  }

  const livePreview = ViewPlugin.fromClass(class {
    constructor(view) {
      this.tree = syntaxTree(view.state);
      Object.assign(this, buildDecorations(view));
    }
    update(update) {
      const tree = syntaxTree(update.state);
      if (update.docChanged || update.selectionSet || update.viewportChanged || tree !== this.tree) {
        this.tree = tree;
        Object.assign(this, buildDecorations(update.view));
      }
    }
  }, {
    decorations: (plugin) => plugin.decorations,
    // Only the replaced ranges are atomic, so the cursor skips a hidden `**`
    // or a bullet cleanly but still walks through styled text.
    provide: (plugin) => EditorView.atomicRanges.of((view) => {
      const instance = view.plugin(plugin);
      return instance ? instance.atomicRanges : Decoration.none;
    }),
  });

  /* --------------------------------------------- clicks: tasks and links ---- */

  // The widget's DOM position is the TaskMarker's start; flip its three characters.
  function toggleTask(view, pos) {
    const tree = syntaxTree(view.state);
    let marker = tree.resolveInner(pos, 1);
    if (marker.name !== 'TaskMarker') marker = tree.resolveInner(pos, -1);
    if (marker.name !== 'TaskMarker') return false;
    const text = view.state.doc.sliceString(marker.from, marker.to);
    view.dispatch({ changes: { from: marker.from, to: marker.to, insert: text === '[ ]' ? '[x]' : '[ ]' } });
    return true;
  }

  function linkTargetAt(state, pos) {
    const tree = syntaxTree(state);
    for (const side of [1, -1]) {
      for (let node = tree.resolveInner(pos, side); node; node = node.parent) {
        if (node.name === 'URL' && !(node.parent && LINK_CONTAINERS.has(node.parent.name))) return state.doc.sliceString(node.from, node.to);
        if (LINK_CONTAINERS.has(node.name)) {
          const url = node.getChild('URL');
          return url ? state.doc.sliceString(url.from, url.to) : null;
        }
      }
    }
    return null;
  }

  const clickHandlers = EditorView.domEventHandlers({
    mousedown(event, view) {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.classList.contains('cm-task-checkbox')) {
        return toggleTask(view, view.posAtDOM(target));
      }
      if (event.button !== 0 || !(event.metaKey || event.ctrlKey)) return false;
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos == null) return false;
      const href = linkTargetAt(view.state, pos);
      if (!href || !SAFE_HREF.test(href)) return false;
      window.open(href, '_blank', 'noopener');
      return true;
    },
  });

  /* -------------------------------------------------------------- mount ---- */

  function extensionsFor(nonce, onChange, lineSeparator) {
    const language = CM.markdown({
      base: CM.markdownLanguage, // commonmark + GFM (tables, task lists, strikethrough, autolinks)
      extensions: [{ remove: ['SetextHeading'] }], // `---` under a text line is a rule in this corpus, never an H2
      completeHTMLTags: false,
    });
    const extensions = [
      EditorView.cspNonce.of(nonce),
      language,
      livePreview,
      clickHandlers,
      CM.history(),
      CM.drawSelection(),
      CM.highlightActiveLine(),
      EditorView.lineWrapping,
      EditorState.tabSize.of(2),
      EditorView.contentAttributes.of({ spellcheck: 'false', 'aria-label': 'Markdown source' }),
      keymap.of([...CM.defaultKeymap, ...CM.historyKeymap, CM.indentWithTab]),
    ];
    if (lineSeparator) extensions.push(EditorState.lineSeparator.of(lineSeparator));
    if (onChange) extensions.push(EditorView.updateListener.of((update) => { if (update.docChanged) onChange(update.state.sliceDoc()); }));
    return extensions;
  }

  function mount(options) {
    const { container, text, nonce, onChange } = options;
    if (typeof nonce !== 'string' || !nonce) throw new Error('editor.js: mount needs the page nonce for CodeMirror\'s stylesheet');
    const allCRLF = /\r\n/.test(text) && !/(^|[^\r])\n/.test(text);
    const state = EditorState.create({ doc: text, extensions: extensionsFor(nonce, onChange, allCRLF ? '\r\n' : null) });
    container.classList.add('pv-editor');
    const view = new EditorView({ state, parent: container });
    return {
      view,
      getText() { return view.state.sliceDoc(); },
      setText(next) { view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } }); },
      focus() { view.focus(); },
      destroy() { view.destroy(); container.classList.remove('pv-editor'); },
    };
  }

  window.__pvEditor = { mount };
})();
