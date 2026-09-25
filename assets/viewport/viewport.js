/* philset view — page behaviour: checklists per panel, tabs remembered per
   project, theme toggle, scroll memory, live reload, the --edit editor; in
   tree mode also the document tray (⌘K), token → definition hovers, and the
   hub's session chips. */
(function () {
  var config = window.__pv || {};
  var ns = 'pv:' + (config.metaId || 'x') + ':';
  function load(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  function sessionGet(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
  function sessionSet(key, value) { try { sessionStorage.setItem(key, value); } catch (e) {} }
  function escapeHtml(text) { return String(text).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* theme: system (no attribute) / light / dark — a person preference, not namespaced */
  var THEME = 'pv:theme';
  var root = document.documentElement;
  var themeButtons = [].slice.call(document.querySelectorAll('.theme button'));
  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
    else root.removeAttribute('data-theme');
    themeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-theme') === (theme || 'system') ? 'true' : 'false');
    });
  }
  applyTheme(load(THEME));
  themeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var theme = button.getAttribute('data-theme');
      if (theme === 'system') remove(THEME); else save(THEME, theme);
      applyTheme(theme === 'system' ? null : theme);
    });
  });

  /* one checklist per panel, keyed by the doc path; the count comes from the DOM */
  var panels = [].slice.call(document.querySelectorAll('[role="tabpanel"][data-path]'));
  panels.forEach(function (panel) {
    var key = ns + panel.getAttribute('data-path') + ':tasks';
    var boxes = [].slice.call(panel.querySelectorAll('.lvl > input[type="checkbox"]'));
    if (!boxes.length) return;
    var strip = panel.querySelector('.progress');
    var fill = strip && strip.querySelector('.fill');
    var count = strip && strip.querySelector('.n');
    var state = load(key) || {};
    function render() {
      var done = 0;
      boxes.forEach(function (box) {
        box.closest('.lvl').classList.toggle('done', box.checked);
        if (box.checked) done++;
      });
      if (fill) fill.style.width = Math.round(done / boxes.length * 100) + '%';
      if (count) count.textContent = done + ' / ' + boxes.length + ' done';
    }
    boxes.forEach(function (box) {
      if (box.disabled) return; /* done in the source of truth */
      var id = box.closest('.lvl').getAttribute('data-task-id');
      box.checked = !!state[id];
      box.addEventListener('change', function () {
        if (box.checked) state[id] = true; else delete state[id];
        save(key, state);
        render();
      });
    });
    var reset = strip && strip.querySelector('.reset');
    if (reset) reset.addEventListener('click', function () {
      state = {}; save(key, state);
      boxes.forEach(function (box) { if (!box.disabled) box.checked = false; });
      render();
    });
    render();
  });

  /* tabs, remembered per project (index page only); scroll position per panel */
  var TAB = ns + 'tab';
  var tabs = [].slice.call(document.querySelectorAll('[role="tab"]'));
  function panelOf(tab) { return document.getElementById(tab.getAttribute('aria-controls')); }
  function scrollKey(tab) { var panel = panelOf(tab); return ns + 'scroll:' + (panel ? panel.getAttribute('data-path') : tab.id); }
  function selected() { return tabs.filter(function (tab) { return tab.getAttribute('aria-selected') === 'true'; })[0] || null; }
  function rememberScroll() { var tab = selected(); if (tab) sessionSet(scrollKey(tab), String(window.scrollY)); }
  function show(id, restoreScroll) {
    var previous = selected();
    if (previous && previous.id !== id) rememberScroll();
    var target = null;
    tabs.forEach(function (tab) {
      var on = tab.id === id;
      if (on) target = tab;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      var panel = panelOf(tab);
      if (panel) panel.hidden = !on;
    });
    if (config.remember) save(TAB, id);
    var y = target && restoreScroll ? Number(sessionGet(scrollKey(target)) || 0) : 0;
    window.scrollTo({ top: y });
  }
  tabs.forEach(function (tab) { tab.addEventListener('click', function () { show(tab.id, true); }); });
  if (tabs.length) {
    var remembered = config.remember ? load(TAB) : null;
    var initial = remembered && document.getElementById(remembered) ? remembered : tabs[0].id;
    /* a #tok-<panel>-<token> hash names the panel the definition lives in */
    var hashPanel = /^#tok-(.+)-(?:OQ|[A-Z]{1,2})\d{1,3}[a-z]?$/.exec(location.hash || '');
    if (hashPanel && document.getElementById('tab-' + hashPanel[1])) initial = 'tab-' + hashPanel[1];
    show(initial, false);
    var restore = function () { show(initial, !location.hash); if (location.hash) revealHash(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(restore); else restore();
  }
  window.addEventListener('pagehide', rememberScroll);

  /* token → definition: hover shows the datum (body · status as tense · provenance); click jumps to it */
  var tip = document.getElementById('tip');
  var tipTimer = null;
  var tipFor = null;
  function tokenRecord(span) {
    var panel = span.closest('[data-key]');
    var byPanel = panel && config.tokens ? config.tokens[panel.getAttribute('data-key')] : null;
    return byPanel ? byPanel[span.getAttribute('data-tok')] : null;
  }
  function showTip(span) {
    var record = tokenRecord(span);
    if (!record || !tip) return;
    clearTimeout(tipTimer);
    tipFor = span;
    tip.innerHTML = '<div class="tip-head"><span class="mono tok-name">' + escapeHtml(record.token) + '</span>'
      + '<span class="badge status-' + escapeHtml(record.status) + '">' + escapeHtml(record.status) + ' · ' + escapeHtml(record.tense) + '</span></div>'
      + '<div class="tip-body">' + escapeHtml(record.body) + '</div>'
      + '<div class="tip-prov">' + (record.sameDoc ? 'defined above' : 'defined in ' + escapeHtml(record.path)) + ':' + record.line
      + ' · ' + escapeHtml(record.kind) + ' · ' + escapeHtml(record.date) + ' · via ' + escapeHtml(record.neighborhood) + '</div>'
      + '<div class="tip-id mono">' + escapeHtml(record.id) + '</div>';
    tip.hidden = false;
    var rect = span.getBoundingClientRect();
    var width = Math.min(440, window.innerWidth - 24);
    tip.style.width = width + 'px';
    var left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    var top = rect.bottom + 8;
    if (top + tip.offsetHeight > window.innerHeight - 12) top = Math.max(12, rect.top - tip.offsetHeight - 8);
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hideTipSoon() { clearTimeout(tipTimer); tipTimer = setTimeout(function () { if (tip) tip.hidden = true; tipFor = null; }, 160); }
  if (tip) {
    tip.addEventListener('mouseenter', function () { clearTimeout(tipTimer); });
    tip.addEventListener('mouseleave', hideTipSoon);
  }
  function flash(element) {
    element.classList.add('flash');
    setTimeout(function () { element.classList.remove('flash'); }, 1600);
  }
  function revealHash() {
    var target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (!target) return;
    target.scrollIntoView({ block: 'center' });
    flash(target);
  }
  document.addEventListener('mouseover', function (event) {
    var span = event.target.closest && event.target.closest('.tok');
    if (span && span !== tipFor) showTip(span);
  });
  document.addEventListener('mouseout', function (event) {
    var span = event.target.closest && event.target.closest('.tok');
    if (span) hideTipSoon();
  });
  document.addEventListener('focusin', function (event) { var span = event.target.closest && event.target.closest('.tok'); if (span) showTip(span); });
  document.addEventListener('focusout', function (event) { var span = event.target.closest && event.target.closest('.tok'); if (span) hideTipSoon(); });
  document.addEventListener('click', function (event) {
    var span = event.target.closest && event.target.closest('.tok');
    if (!span) return;
    var record = tokenRecord(span);
    if (!record) return;
    if (record.sameDoc) {
      var target = document.getElementById(record.anchor);
      if (target) { history.replaceState(null, '', '#' + record.anchor); target.scrollIntoView({ block: 'center' }); flash(target); }
    } else {
      location.href = record.href;
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.target.classList && event.target.classList.contains('tok')) event.target.click();
  });

  /* the document tray: every doc under the tree, found by subject (title · sections · status · project) */
  var tray = document.getElementById('tray');
  var trayBackdrop = document.querySelector('.tray-backdrop');
  var trayOpen = document.querySelector('.tray-open');
  var traySearch = tray && tray.querySelector('.tray-search');
  var trayList = tray && tray.querySelector('.tray-list');
  var trayStatus = tray && tray.querySelector('.tray-status');
  var trayIndex = null;
  var trayCursor = -1;
  function relativeTime(ms) {
    var days = Math.round((Date.now() - ms) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return days + 'd ago';
    if (days < 365) return Math.round(days / 30) + 'mo ago';
    return Math.round(days / 365) + 'y ago';
  }
  function scoreDoc(doc, terms) {
    var title = doc.t.toLowerCase();
    var sections = doc.h.join(' | ').toLowerCase();
    var rest = (doc.f + ' ' + doc.s + ' ' + doc.n + ' ' + doc.p).toLowerCase();
    var score = 0;
    for (var index = 0; index < terms.length; index++) {
      var term = terms[index];
      if (title.indexOf(term) !== -1) score += title.indexOf(term) === 0 ? 8 : 5;
      else if (sections.indexOf(term) !== -1) score += 3;
      else if (rest.indexOf(term) !== -1) score += 1;
      else return 0;
    }
    if (doc.a) score -= 2;
    return score;
  }
  function renderTray(query) {
    if (!trayIndex) return;
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var docs = trayIndex.docs.slice();
    var rows;
    if (terms.length) {
      rows = docs.map(function (doc) { return { doc: doc, score: scoreDoc(doc, terms) }; })
        .filter(function (row) { return row.score > 0; })
        .sort(function (a, b) { return b.score - a.score || b.doc.m - a.doc.m; })
        .slice(0, 80).map(function (row) { return row.doc; });
    } else {
      rows = docs.filter(function (doc) { return !doc.a; }).sort(function (a, b) { return b.m - a.m; }).slice(0, 40);
    }
    trayStatus.textContent = (terms.length ? rows.length + ' match' + (rows.length === 1 ? '' : 'es') : 'recently modified') + ' · ' + trayIndex.docs.length + ' docs · ' + trayIndex.projects.length + ' projects';
    trayList.innerHTML = rows.map(function (doc, index) {
      var here = config.project === doc.p;
      return '<a class="row' + (here ? ' here' : '') + (doc.a ? ' archived' : '') + '" role="option" href="' + escapeHtml(doc.u) + '" data-index="' + index + '">'
        + '<span class="row-project eyebrow">' + escapeHtml(doc.n) + '</span>'
        + '<span class="row-title">' + escapeHtml(doc.t) + '</span>'
        + '<span class="row-meta mono">' + escapeHtml(doc.f) + (doc.s ? ' · ' + escapeHtml(doc.s) : '') + (doc.d ? ' · ' + escapeHtml(doc.d) : '') + ' · ' + relativeTime(doc.m) + (doc.k ? ' · ' + doc.k + ' defs' : '') + '</span>'
        + '</a>';
    }).join('');
    trayCursor = -1;
  }
  function moveCursor(delta) {
    var rows = [].slice.call(trayList.querySelectorAll('.row'));
    if (!rows.length) return;
    trayCursor = Math.max(0, Math.min(rows.length - 1, trayCursor + delta));
    rows.forEach(function (row, index) { row.classList.toggle('active', index === trayCursor); });
    rows[trayCursor].scrollIntoView({ block: 'nearest' });
  }
  function openTray() {
    if (!tray) return;
    tray.hidden = false; trayBackdrop.hidden = false;
    trayOpen.setAttribute('aria-expanded', 'true');
    traySearch.focus(); traySearch.select();
    if (trayIndex) { renderTray(traySearch.value); return; }
    trayStatus.textContent = 'indexing…';
    fetch('/api/index').then(function (response) { return response.json(); }).then(function (data) {
      var names = {};
      data.projects.forEach(function (project) { names[project.key] = project.name; });
      data.docs.forEach(function (doc) { doc.n = doc.n || names[doc.p] || doc.p; });
      trayIndex = data;
      renderTray(traySearch.value);
    }).catch(function () { trayStatus.textContent = 'the index did not load'; });
  }
  function closeTray() {
    if (!tray || tray.hidden) return;
    tray.hidden = true; trayBackdrop.hidden = true;
    trayOpen.setAttribute('aria-expanded', 'false');
    trayOpen.focus();
  }
  if (tray) {
    trayOpen.addEventListener('click', function () { if (tray.hidden) openTray(); else closeTray(); });
    tray.querySelector('.tray-close').addEventListener('click', closeTray);
    trayBackdrop.addEventListener('click', closeTray);
    traySearch.addEventListener('input', function () { renderTray(traySearch.value); });
    tray.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); closeTray(); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); moveCursor(1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); moveCursor(-1); }
      else if (event.key === 'Enter' && trayCursor >= 0) { var row = trayList.querySelectorAll('.row')[trayCursor]; if (row) location.href = row.getAttribute('href'); }
      else if (event.key === 'Enter') { var first = trayList.querySelector('.row'); if (first) location.href = first.getAttribute('href'); }
    });
    document.addEventListener('keydown', function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (tray.hidden) openTray(); else closeTray(); }
    });
  }

  /* the hub's session chips: refreshed from ~/.philset/state without a page reload */
  var sessionsStrip = document.getElementById('sessions');
  function ageOf(updated) {
    var seconds = Math.max(0, Math.round((Date.now() - Number(updated || Date.now())) / 1000));
    return seconds < 60 ? seconds + 's' : seconds < 3600 ? Math.round(seconds / 60) + 'm' : Math.round(seconds / 3600) + 'h';
  }
  function renderSessions(rootDir, sessions) {
    var chips = sessions.map(function (session) {
      var where = rootDir && session.cwd && session.cwd.indexOf(rootDir) === 0 ? (session.cwd.slice(rootDir.length).replace(/^\//, '') || '~') : (session.cwd || '').split('/').pop();
      var state = ['crunching', 'ready', 'waiting'].indexOf(session.state) !== -1 ? session.state : 'ready';
      return '<span class="chip state-' + state + '" title="' + escapeHtml(session.cwd || '') + '"><span class="dot"></span><span class="where">' + escapeHtml(where) + '</span><span class="state">' + state + '</span>'
        + (session.last ? '<span class="last">' + (session.lastFrom === 'you' ? '› ' : '') + escapeHtml(session.last) + '</span>' : '') + '<span class="age">' + ageOf(session.updated) + '</span></span>';
    });
    sessionsStrip.innerHTML = '<span class="eyebrow">sessions</span>\n' + (chips.length ? chips.join('\n') : '<span class="none">no sessions reported — <code>philset hook</code> prints the settings that wire the tracker</span>');
  }
  if (sessionsStrip && config.sessions) {
    setInterval(function () {
      fetch('/api/sessions').then(function (response) { return response.json(); }).then(function (data) { renderSessions(data.root, data.sessions); }).catch(function () {});
    }, 5000);
  }

  /* inline edits (--edit): the live-preview editor when the vendored bundle is present, else raw markdown */
  var saving = false;
  function draftKey(docPath) { return ns + 'draft:' + docPath; }
  function mountSurface(editor, text) {
    if (config.editor === 'codemirror' && window.__pvEditor && window.CM) {
      var host = document.createElement('div');
      host.className = 'cm-host';
      editor.insertBefore(host, editor.firstChild);
      var mounted = window.__pvEditor.mount({ container: host, text: text, nonce: config.nonce });
      return { kind: 'codemirror', getText: mounted.getText, focus: mounted.focus, destroy: mounted.destroy };
    }
    var textarea = document.createElement('textarea');
    textarea.className = 'raw';
    textarea.spellcheck = false;
    textarea.value = text;
    editor.insertBefore(textarea, editor.firstChild);
    return { kind: 'textarea', getText: function () { return textarea.value; }, focus: function () { textarea.focus(); }, destroy: function () {} };
  }
  function openEditor(panel, draft) {
    var docPath = panel.getAttribute('data-path');
    var project = panel.getAttribute('data-project');
    var article = panel.querySelector('article.doc');
    var query = '/api/doc?path=' + encodeURIComponent(docPath) + (project ? '&project=' + encodeURIComponent(project) : '');
    fetch(query).then(function (response) { return response.json(); }).then(function (doc) {
      var editor = document.createElement('div');
      editor.className = 'editor';
      editor.innerHTML = '<div class="edit-bar"><button type="button" class="save">save</button><button type="button" class="cancel">cancel</button><span class="status"></span></div>';
      var status = editor.querySelector('.status');
      var baseHash = draft ? draft.baseHash : doc.hash; /* a restored draft keeps the hash it was opened on, so the 409 guard still fires */
      var surface = mountSurface(editor, draft ? draft.text : doc.content);
      editor.setAttribute('data-base-hash', baseHash);
      panel.__surface = surface;
      if (draft) status.textContent = 'draft restored after a reload';
      else if (surface.kind === 'codemirror') status.textContent = 'live preview — the line you are on shows its markdown';
      article.hidden = true;
      article.parentNode.insertBefore(editor, article);
      panel.setAttribute('data-editing', '1');
      surface.focus();
      editor.querySelector('.cancel').addEventListener('click', function () {
        surface.destroy(); editor.remove(); article.hidden = false; panel.removeAttribute('data-editing'); panel.__surface = null;
        try { sessionStorage.removeItem(draftKey(docPath)); } catch (e) {}
      });
      editor.querySelector('.save').addEventListener('click', function () {
        status.textContent = 'saving…';
        saving = true;
        fetch('/api/doc', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Philset-Token': config.token }, body: JSON.stringify({ project: project, path: docPath, content: surface.getText(), baseHash: baseHash }) })
          .then(function (response) { return response.json().catch(function () { return {}; }).then(function (body) { return { status: response.status, body: body }; }); })
          .then(function (result) {
            if (result.status === 200) {
              try { sessionStorage.removeItem(draftKey(docPath)); } catch (e) {}
              status.textContent = 'saved — reloading';
              rememberScroll();
              setTimeout(function () { location.reload(); }, 400);
              return;
            }
            saving = false;
            if (result.status === 409) {
              baseHash = result.body.hash;
              editor.setAttribute('data-base-hash', baseHash);
              status.textContent = 'changed on disk — your text is still in the editor; save again to overwrite, cancel to see the new version';
              return;
            }
            status.textContent = 'save failed (' + result.status + ')';
          })
          .catch(function () { saving = false; status.textContent = 'save failed (network)'; });
      });
    }).catch(function () { /* the server said no; nothing to edit */ });
  }
  if (config.edit) {
    panels.forEach(function (panel) {
      var button = panel.querySelector('.panel-head .edit');
      if (button) button.addEventListener('click', function () { openEditor(panel, null); });
      var stashed = null;
      try { stashed = JSON.parse(sessionStorage.getItem(draftKey(panel.getAttribute('data-path'))) || 'null'); } catch (e) {}
      if (stashed && typeof stashed.text === 'string') openEditor(panel, stashed);
    });
  }

  /* live reload: the server watches .meta/ and says "change"; an open editor stashes its draft first */
  if (config.reload && window.EventSource) {
    var events = new EventSource('/events');
    events.addEventListener('change', function () {
      if (!saving) {
        panels.forEach(function (panel) {
          var editor = panel.getAttribute('data-editing') ? panel.querySelector('.editor') : null;
          if (editor && panel.__surface) sessionSet(draftKey(panel.getAttribute('data-path')), JSON.stringify({ text: panel.__surface.getText(), baseHash: editor.getAttribute('data-base-hash') }));
        });
      }
      rememberScroll();
      location.reload();
    });
  }
})();
