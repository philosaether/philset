'use strict';

// The strict YAML subset viewport.yml uses (design §2): top-level scalars, and
// `tabs:` holding `- scalar` items or `- key: value` maps with indented
// `key: value` continuations. Comments stripped outside quotes, quotes
// stripped, unknown keys kept. Returns null when a line cannot be read.

function stripComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (quote) { if (character === quote) quote = null; continue; }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === '#' && (index === 0 || /\s/.test(line[index - 1]))) return line.slice(0, index);
  }
  return line;
}

function unquote(value) {
  const trimmed = value.trim();
  const quoted = /^(["'])(.*)\1$/.exec(trimmed);
  return quoted ? quoted[2] : trimmed;
}

const KEY_VALUE = /^([A-Za-z_][\w-]*):(?:\s+(.*)|\s*)$/;
const ITEM = /^-(?:\s+(.*)|\s*)$/;

function parseYamlSubset(text) {
  const result = {};
  let listKey = null;
  let listIndent = -1;
  let currentItem = null;
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  for (const rawLine of lines) {
    const line = stripComment(rawLine).replace(/\s+$/, '');
    if (!line.trim()) continue;
    const indent = /^\s*/.exec(line)[0].length;
    const body = line.trim();
    if (indent === 0 && !(listKey !== null && ITEM.test(body))) {
      const keyed = KEY_VALUE.exec(body);
      if (!keyed) return null;
      listKey = null; currentItem = null;
      if (keyed[2] === undefined) { result[keyed[1]] = []; listKey = keyed[1]; listIndent = -1; }
      else result[keyed[1]] = unquote(keyed[2]);
      continue;
    }
    if (listKey === null) return null;
    const item = ITEM.exec(body);
    if (item && (listIndent === -1 || indent === listIndent)) {
      listIndent = indent;
      const content = item[1] === undefined ? '' : item[1];
      const keyed = KEY_VALUE.exec(content);
      if (keyed && keyed[2] !== undefined) { currentItem = { [keyed[1]]: unquote(keyed[2]) }; result[listKey].push(currentItem); }
      else { currentItem = null; result[listKey].push(unquote(content)); }
      continue;
    }
    if (currentItem && indent > listIndent) {
      const keyed = KEY_VALUE.exec(body);
      if (!keyed || keyed[2] === undefined) return null;
      currentItem[keyed[1]] = unquote(keyed[2]);
      continue;
    }
    return null;
  }
  return result;
}

module.exports = { parseYamlSubset };
