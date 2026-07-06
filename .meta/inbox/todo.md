# To-Do / Open Questions

Inbound items and open process questions. From cross-project `/defer` or manual
capture; sorted into `roadmap.md` via `/triage`.

Fully triaged 2026-07-01 against the career-inflection reprioritization — all
items promoted to `roadmap.md`, graduated to `archive/rearview.md`, or resolved.
One new item staged since (2026-07-03), awaiting triage.

---

- **philset as a Claude plugin + marketplace (Cowork distribution)** —
  Package philset so it installs and runs as a Claude *plugin* (via a
  marketplace), reaching Claude Cowork and Claude web/Desktop, not just
  Claude Code. Cooperate-with-Anthropic play, not compete. Confirmed
  (2026-07-03): Cowork has a plugins marketplace — plugins bundle
  skills/slash-commands/sub-agents/connectors; Anthropic ships a default
  "Knowledge Work" marketplace and supports adding marketplaces from a
  GitHub repo; the same plugin skills run across web/Desktop/Cowork
  (refs: anthropics/knowledge-work-plugins, claude.com/blog/cowork-plugins).
  **Open question:** *how* does philset adopt the plugin/marketplace format
  — skills are already the right primitive, but the `.meta/` tree +
  tree-walk context model likely needs adaptation for Cowork's environment.
  Also collapses the multistep install (npm → npm install philset →
  philset init → philset begin) into one plugin install, and adds
  legitimacy. Related sub-question lives in the philbas.com orientation-page
  draft's tradeoffs section: ship philset as a plugin *now* vs. rewrite all
  install copy *after* it becomes a plugin.
  Deferred from: philbas.com/feature/philset-orientation-page (2026-07-03).
  Blocker: none — pull by salience; gated in practice by orientation-page
  copy decisions that assume current npm install.

- **`/hello` calendar window is boundary-exclusive — misses a meeting starting
  exactly at the cap** — The `hello.check` calendar step reads "now → tomorrow
  ~10am", but the `list_events` `endTime` is *exclusive*, so a next-morning
  meeting starting at exactly the cap (e.g. 10:00am) is silently dropped. Bit us
  live 2026-07-06: a 10:00am final-round interview did **not** surface at
  `/hello` (Phil caught it). Fix: pad the upper bound (e.g. tomorrow noon, or
  cap+2h) or make the reach inclusive; a session-start miss on an early meeting
  is exactly the failure the early-morning reach exists to prevent.
  Deferred from: meta/interview-prep (2026-07-06, /ttyl).
