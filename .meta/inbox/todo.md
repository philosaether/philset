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

- **`/sprout` skill — organically extend a tree without disrupting it** — A skill for
  growing a new layer of an existing tree data structure in place: a new directory
  level in the `.meta/` hierarchy, a new archetype in a family, etc. Captures the
  recurring feeling of "extend this tree organically without disrupting what's already
  there." Observed ≥2× spontaneously (directory-hierarchy growth), and surfaced again
  speculating about *sprouting new archetypes* from over-specified delta-docs
  ("tired of the same three overrides → sprout a new noun"). Widely cross-cutting.
  Relates to `philset-mv` (naming/moves) and archetype *families* (not inheritance).
  Deferred from: pattern-language draft (Development/.meta, 2026-07-09).

- **"Working with archetypes" gloss on `/draft` + `/ship`** — Optional skill-behavior
  layer for the pattern language (see Development/.meta/designs/pattern-language.md).
  `/draft` from an archetype: render the slot **consent-block** at the top of the
  delta-doc (every slot = resolved value), pre-seed the doc outline from the slot list,
  block on required (default-less) slots. `/ship`: write the **archetype-version pin**
  into the delta-doc frontmatter; resolve archetype files from the runtime source
  (local `philset-archetypes/` clone → else `mcp.philbas.com/archetypes`). Gated on the
  pattern language shipping + the `philset-archetypes/` repo existing.
  Deferred from: pattern-language draft (Development/.meta, 2026-07-09).

- **Placeholder-reference reconciliation for archetypes** — When minting a new
  archetype, check existing archetype entries for placeholder references to it (e.g.
  Worker's `Composes` names "KV" before a KV archetype exists) and redirect them to the
  newly-minted noun. Mechanism: a signpost flag on `philset-archetypes` + an extra step
  in `/draft`, `/ship`, `/review`. Lets entries mention not-yet-minted nouns by name
  without depending on the formal archetype, then reconcile on mint — the forward-
  reference analogue of composition-by-rule (pattern-language.md §3).
  Deferred from: philset-archetypes/feature/trunk-archetypes (2026-07-09).

- **`/postmortem` skill — formalize the incident-writeup improvisation** — Capture a
  production incident as a structured postmortem: symptom → root cause → fix →
  approaches-tried-and-rejected → lessons → files changed. Improvised exactly once
  (Praxis tutorial-hotfix, 2026-04-19; the doc now lives at
  `praxis/.meta/postmortems/2026-04-19-tutorial-hotfix.md`) and then orphaned in a stray
  `postmorta/` dir under career. Cousin to `/retro` (which retrospects *session*
  friction) but aimed at *production* incidents; output is a durable, citable incident
  doc. The one real specimen is a good spec seed — it already has the section shape.
  Deferred from: career/meta/heading-adjustment (2026-07-12, repo audit).

- **signpost.yml `extra-steps` field** — Allow signpost to declare per-skill extra steps
  (e.g., "when running `/draft`, also read X and ask Y"). Currently CLAUDE.md is the
  right place for behavioral instructions, but this could be tracked in git as part of
  the signpost tree. Needs design: field schema, how skills consume it, interaction with
  skill overrides.
  Deferred from: eventsnyourcity.com/feature/astro-infrastructure (2026-06-03),
  re-routed via career audit (2026-07-12).

- **`/clear-inbox` skill — normalize dropped files** — Auto-rename inbox files to a
  consistent scheme (strip spaces, kebab-case, maybe date-prefix) so screenshots and
  dropped references don't collide or read as noise. Small, self-contained tooling idea.
  Deferred from: career/meta/heading-adjustment (2026-07-12, repo audit) — long-standing
  "To Explore" note that's a philset concern, not career work.

- **PM integration (philset v0.3) — signpost flag for auto-updating tickets** — A
  signpost flag that, when set, has skills push status updates to an external PM/ticket
  system as work progresses. Pairs with the Praxis leaf-sync bridge already staged.
  Deferred from: career/meta/heading-adjustment (2026-07-12, repo audit).
