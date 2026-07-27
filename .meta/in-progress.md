# In Progress

Current work state. Update constantly, delete items when done.

---

## Active

**✅ v0.3.1 — MERGED + TAGGED + PUSHED 2026-07-27. `npm publish` is Phil's,
and is the last step blocking the work machine.** Carries the central-meta
port (`designs/central-meta-port.md`, accepted 2026-07-22), the tracked-`.meta`
adopt guard, and the `private` exclude-pattern fix. `npm test` 11 pass.

Root cause of the cross-machine block, now cleared: the port merged to `main`
on 2026-07-22 but **was never pushed** — `origin/main` sat 11 commits behind,
so `3de8ca9` 404'd from the work machine and the whole feature read as
nonexistent. Pushed 2026-07-27.

**Once published, tell the work machine:**
- `central-meta:` is **path-valued**, `~/` **is** expanded (`expandTilde`),
  resolved `PHILSET_CENTRAL` env → nearest `central-meta:` in a
  `.meta/signpost.yml` walking up to `$HOME`; trailing `#` comments are
  stripped. Its annotated line is live, not inert — the §1a gate is satisfied.
- Its local `philset.js` patch can be dropped on update: the `statSync` fix now
  ships on **both** exclude paths (`ensureMetaExcluded` *and* `enablePrivateMeta`
  — only the former was fixed when its report said "already merged upstream").

**Queued — dogfood `/skim`** on the AI-ecosystem Decoder Ring
(`~/Development/.meta/assessments/ai-ecosystem-integration.md §1.4`, ~35 terms) — the
first real `/skim` session, and its proving target. Tomorrow.

**✅ /skim — SHIPPED + MERGED 2026-07-13** to `main` (no-ff merge `8fe4474`, pushed).
The breadth-first sibling to `/study`: research a name-dropping domain → batched 1–2¶
lessons + per-item quiz → cold/fuzzy/known one-line summary. `/review` (instruction-doc
medium, one-off — not counted toward N=3) landed one real fix (meta-README sync) + a
nit; design stamped Implemented, no divergences. Skill symlinked live; not yet dogfooded
(see Queued).

**✅ v0.3.0 "portable + welcoming" — CUT + PUBLISHED 2026-07-03** to npm
(registry-verified `philset@0.3.0`), tagged + pushed to origin. This release:
`private-meta`/`philset private`, dev-link + clean install, non-code low-hanging
pass, configurable `/review` dimensions, progressive-disclosure Phase 0 (`/hey` +
`hello.check`), plus the same-session `/hey` minimal-walk + `Step 0` orientation.
npm token rotated/deleted (arrived as plaintext in inbox — handled out-of-git).

**Next up (see `roadmap.md`):** rest of progressive-disclosure (self-calibrating
disclosure, convention auto-updating, Phase 1 nudges, Phase 2 plugin distribution
*post-cut/pre-philbas-copy*, Phase 3 MCP); **chunk 2 multi-user state model** (#1
structural project — unblocks private-meta/ttyl-commit/`/suspend`); interaction-log
primitive `/draft`; DRY orientation+walk extraction (new this session).

## Parked

**readme-coverage-update** — parked 2026-07-22 on `meta/readme-updates`
(`09b7586`, WIP prose committed; direction liked, no timeline). Accepted design;
**Phil implements** (human-as-implementer), then `/review` → merge. First-pass
prose for all 7 punch-list changes is in the doc. Open call: unified ladder
table vs. keep-two (draft leans keep-two). **Deprioritized by the 2026-07-22
priority reframe:** the day job absorbs the career-advancement vector, so
reach/publishing matters less than philset's capacity to support actual work.
Merge notes: `git push --force-with-lease` (branch was rebased); on merge take
main's roadmap + in-progress over this branch's stale copies.
