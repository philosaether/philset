'use strict';

// Which docs become tabs (design §2): --tabs > viewport.yml > the default
// view (in-progress, roadmap, then designs from designs/index.md — every
// draft/adopted row, then accepted newest-first, until five design tabs).
// Pure: the caller reads files and supplies `exists(relPath)`.

const { parseYamlSubset } = require('./yaml-subset.js');

const DESIGN_CAP = 5;
const INDEX_ROW = /^\|\s*\[[^\]]*\]\(([^)]+)\)\s*\|([^|]*)\|([^|]*)\|/;

function normalizeTabPath(rawPath) {
  return String(rawPath).trim().replace(/^\.meta\//, '');
}

function designsFromIndex(indexText) {
  const rows = [];
  String(indexText || '').split('\n').forEach((line, order) => {
    const match = INDEX_ROW.exec(line.trim());
    if (!match) return;
    const status = match[2].trim().toLowerCase();
    const dateMatch = /\d{4}-\d{2}-\d{2}/.exec(match[3]);
    rows.push({ path: `designs/${match[1].trim()}`, status, date: dateMatch ? dateMatch[0] : '', order });
  });
  const alwaysIn = rows.filter((row) => /^(draft|adopted)/.test(row.status));
  const accepted = rows.filter((row) => /^accepted/.test(row.status))
    .sort((a, b) => (a.date === b.date ? a.order - b.order : (a.date === '' ? 1 : b.date === '' ? -1 : (a.date < b.date ? 1 : -1))));
  const chosen = alwaysIn.concat(accepted.slice(0, Math.max(0, DESIGN_CAP - alwaysIn.length)));
  return { chosen, total: alwaysIn.length + accepted.length };
}

function resolveTabs({ manifestText = null, indexText = null, tabsArg = null, exists }) {
  const warnings = [];
  const keep = (tabs) => tabs.filter((tab) => {
    if (exists(tab.path)) return true;
    warnings.push(`skipped ${tab.path}: not found`);
    return false;
  });

  if (tabsArg && tabsArg.length) {
    return { tabs: keep(tabsArg.map((raw) => ({ path: normalizeTabPath(raw) }))), note: '', warnings, source: 'args' };
  }

  if (manifestText !== null) {
    const parsed = parseYamlSubset(manifestText);
    if (parsed && Array.isArray(parsed.tabs)) {
      const tabs = parsed.tabs.map((entry) => {
        if (typeof entry === 'string') return { path: normalizeTabPath(entry) };
        if (entry && typeof entry.path === 'string') {
          const tab = { path: normalizeTabPath(entry.path) };
          if (entry.label) tab.label = String(entry.label);
          if (entry.role) tab.role = String(entry.role);
          return tab;
        }
        warnings.push('manifest: a tab without a path was ignored');
        return null;
      }).filter(Boolean);
      return { tabs: keep(tabs), note: '', warnings, source: 'manifest', title: parsed.title || '' };
    }
    warnings.push('viewport.yml: could not read a `tabs:` list — using the default view');
  }

  const state = keep(['in-progress.md', 'roadmap.md'].map((path) => ({ path })));
  const designs = designsFromIndex(indexText);
  const shown = keep(designs.chosen.map((row) => ({ path: row.path })));
  const note = designs.chosen.length < designs.total
    ? `${designs.chosen.length} of ${designs.total} designs · write .meta/viewport.yml to choose`
    : '';
  return { tabs: state.concat(shown), note, warnings, source: 'default' };
}

module.exports = { resolveTabs, designsFromIndex };
