'use strict';

// Which Claude Code sessions are open, and whether each is crunching or ready
// (the hub window's tracker — viewport-misc, 2026-09-23). Machine state, not
// record: it lives in ~/.philset/state/sessions.json, outside every repo, and
// is written by the hook command `philset hook session-state`, which Claude
// Code runs on UserPromptSubmit (→ crunching), Stop (→ ready, with the last
// reply's first line) and SessionEnd (→ gone). The page only reads it.

const fs = require('fs');
const os = require('os');
const path = require('path');

const STATE_DIR = path.join(os.homedir(), '.philset', 'state');
const STATE_FILE = path.join(STATE_DIR, 'sessions.json');
const STALE_MS = 24 * 60 * 60 * 1000;
const SNIPPET_MAX = 160;

function readSessions(now = Date.now()) {
  let parsed;
  try { parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((session) => session && typeof session.id === 'string' && now - Number(session.updated || 0) < STALE_MS)
    .sort((a, b) => Number(b.updated) - Number(a.updated));
}

function writeSessions(sessions) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const tmp = `${STATE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(sessions, null, 1));
  fs.renameSync(tmp, STATE_FILE);
}

function snippet(text) {
  const firstLine = String(text || '').split('\n').map((line) => line.trim()).find((line) => line && !/^#{1,6}\s/.test(line)) || '';
  const flattened = firstLine.replace(/[*_`>]/g, '').replace(/\s+/g, ' ');
  return flattened.length > SNIPPET_MAX ? `${flattened.slice(0, SNIPPET_MAX - 1).trimEnd()}…` : flattened;
}

// The last assistant text block in a Claude Code transcript (JSONL, newest last).
function lastAssistantText(transcriptPath) {
  let text;
  try { text = fs.readFileSync(transcriptPath, 'utf8'); } catch { return ''; }
  const lines = text.trim().split('\n');
  for (let index = lines.length - 1; index >= 0 && index > lines.length - 400; index--) {
    let entry;
    try { entry = JSON.parse(lines[index]); } catch { continue; }
    if (entry.type !== 'assistant' || !entry.message || !Array.isArray(entry.message.content)) continue;
    const block = entry.message.content.find((part) => part.type === 'text' && part.text && part.text.trim());
    if (block) return block.text;
  }
  return '';
}

// event: the JSON Claude Code pipes to a hook. Returns the updated list.
function applyHookEvent(sessions, event, now = Date.now()) {
  const id = String(event.session_id || '');
  if (!id) return sessions;
  const kind = String(event.hook_event_name || event.event || '');
  const others = sessions.filter((session) => session.id !== id);
  const current = sessions.find((session) => session.id === id) || { id, cwd: '', started: now };
  current.cwd = String(event.cwd || current.cwd || '');
  current.updated = now;
  if (kind === 'SessionEnd') return others;
  if (kind === 'UserPromptSubmit') { current.state = 'crunching'; current.last = snippet(event.prompt); current.lastFrom = 'you'; }
  else if (kind === 'Stop' || kind === 'SubagentStop') { current.state = 'ready'; current.last = snippet(lastAssistantText(String(event.transcript_path || ''))); current.lastFrom = 'claude'; }
  else if (kind === 'SessionStart') { current.state = 'ready'; current.last = current.last || ''; }
  else if (kind === 'Notification') { current.state = 'waiting'; current.last = snippet(event.message); current.lastFrom = 'claude'; }
  else return sessions;
  return others.concat([current]);
}

// `philset hook session-state` — stdin is the hook's JSON. Never fails loudly:
// a hook that exits non-zero would block the session it is only observing.
function cmdHook(argv) {
  if (argv[0] !== 'session-state') { console.error('usage: philset hook session-state   (reads the Claude Code hook JSON on stdin)'); process.exit(argv.length ? 1 : 0); }
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    try {
      const event = JSON.parse(raw || '{}');
      writeSessions(applyHookEvent(readSessions(), event));
    } catch (error) {
      console.error(`session-state: ${error.message}`);
    }
    process.exit(0);
  });
}

// The settings.json fragment that wires the hook; printed by `philset hook`.
function hookSettings(philsetBin) {
  const command = `node ${philsetBin} hook session-state`;
  const entry = [{ hooks: [{ type: 'command', command }] }];
  return { hooks: { UserPromptSubmit: entry, Stop: entry, SessionStart: entry, SessionEnd: entry, Notification: entry } };
}

module.exports = { readSessions, applyHookEvent, lastAssistantText, snippet, cmdHook, hookSettings, STATE_FILE };
