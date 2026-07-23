---
Status: accepted
Date: 2026-07-22
Accepted: 2026-07-22
Assessment: (none — ports an accepted design: phil-meta-context
  Development/.meta/designs/central-meta-repo.md, 2026-07-21)
Supersedes: (none; delivers the "ttyl commit step" slice of chunk 2)
Implemented: 2026-07-22 (feature/central-meta-port)
Divergences: none (exclude pattern better-specced than designed — `/.meta` no
  trailing slash, symlink-safe; .eml tracked by omission from the ignore list,
  pinned by test)
Deferred: none
---

# Central-Meta Library Port — Desired State

The work machine's central-`.meta`-repo behaviors (auto-adopt, `/ttyl`
central-commit, `/hello` relink) become first-class, signpost-gated library
features — so the next `npm update philset` *carries* them instead of wiping
them. Reimplemented from the Changelog-v2 porting notes (the hacked sources are
un-versioned on the work machine); the underlying symlink-farm design is
already accepted and reality-tested there.

**Release note:** the work machine cannot safely `npm update philset` until
this ships. Cut a release (v0.3.1?) promptly after merge.

---

## The gating flag

New inherited signpost field:

```yaml
central-meta: ~/phil-meta-context   # path to the central repo; unset = feature off
```

- **Unset anywhere in the walk → philset behaves exactly as today.** No new
  behavior, no new dependency (keeps the no-dep floor). The flag *is* the
  opt-in.
- Inherited down the tree, child overrides parent (standard signpost
  semantics). One line at the root covers the whole tree.
- `~` expanded via the existing `expandTilde()`.
- **Env override `PHILSET_CENTRAL`** beats the signpost field when set —
  needed for sandboxed tests (stub `$HOME`) and mirrors the work-machine
  hack's escape hatch.
- Chicken-and-egg note: the root signpost usually lives *inside* central
  (through the symlink) — reads fine. On a fresh machine, `clone central →
  relink root .meta → the flag is readable` is the bootstrap order; before the
  first-ever adoption the field sits in the still-local signpost and moves in
  with it.

## `bin/philset.js` changes

New helpers (Node builtins only, as ever):

- **`findSignpostField(startDir, field)`** — walk cwd → `$HOME` reading each
  `<dir>/.meta/signpost.yml`; first (closest) hit wins. Reused for
  `central-meta`; generalizes `findRoot()`'s walk (fold `findRoot` onto it or
  leave as-is — implementer's call, no behavior change).
- **`resolveCentral(cwd)`** — `PHILSET_CENTRAL` → `findSignpostField(cwd,
  'central-meta')` → `null` (feature off).
- **`ensureCentralRepo(centralDir)`** — on first use: `mkdir -p`, `git init`,
  write `.gitignore` (`**/.DS_Store` + image/pdf binaries — **`.eml` stays
  tracked**; emails are now first-class inbox input) + a one-paragraph
  `README.md`, initial commit.
- **`adoptMeta(cwd, centralDir)`** — idempotent; `target =
  centralDir/<cwd relative to $HOME>/.meta`; the five cases, exactly as
  sandbox-verified on the work machine:
  1. local `.meta` already a symlink into central → **no-op**
  2. central has state, local missing/dangling → **relink** (re-clone / new
     machine)
  3. real local `.meta`, central absent → **move** into central (dropping any
     nested `.git`, e.g. a stray 0-commit repo) + symlink back
  4. **both** real-local and central exist → **print both paths and exit 1**
     (prompt-and-manual merge; no auto-merge — accepted design's call)
  5. neither exists → no-op (scaffold creates it; post-scaffold pass adopts)
  Then `ln -s` (absolute), and inside a git repo ensure `.meta` in
  `.git/info/exclude` (reuse `enablePrivateMeta`'s exclude step). Stage in
  central (`git add -A`) but **don't commit** — commits are `/ttyl`'s job.
- **New subcommand `philset adopt`** — runs
  `resolveCentral → ensureCentralRepo → adoptMeta` and exits (no `claude`
  launch). This is the **shared relink path**: `philset private` calls it
  internally, `/hello`/`/hey` shell out to it on a broken link. One
  implementation, three surfaces (the porting notes' "share adoptMeta" call).

Wiring in `cmdBegin` under `options.private`, only when `resolveCentral()`
returns a path:
- **pre-scaffold** adopt: relinks a re-cloned repo *before* the scaffold step
  would create a fresh `.meta` over it (order matters — this is what prevents
  case 4 false-conflicts after a re-clone)
- **post-scaffold** adopt: moves a freshly-scaffolded `.meta` into central
- Help text: document `adopt`, the flag, and the env override.

## Skill changes

- **`/ttyl` — new Step 6.5 (central commit), gated on `central-meta`:** after
  all `.meta` writes land, run one commit in the central repo (`git add -A &&
  git commit`) — one commit per session captures every project touched. Then
  **push, non-fatal**: attempt `git push`; on failure (offline, auth) warn and
  move on — the commit is the durable part, the push is backup. Skip the whole
  step silently when the flag is unset, the central dir is missing, or nothing
  is staged. (Push-policy fork in Tradeoffs.)
- **`/hello` — new Step 1.5 (relink health-check), gated on `central-meta`:**
  during the tree walk, for each level's `.meta`: if it's a **dangling
  symlink**, or **central holds state for this path but local `.meta` is
  absent** (the re-clone case), offer to run `philset adopt` in that
  directory. Quiet when healthy. Local-fs checks only (`lstat` + existence in
  central) — no network.
- **`/hey` — same check, minimal form:** a dangling/absent `.meta` at cwd
  means the session silently runs context-blind — config-critical, cheap, and
  local-only, so it belongs in the floor too. `/hey` checks **cwd only** (not
  every walk level) and offers the same `philset adopt`.
- **Signpost field table** (`/hello` skill + signpost reference doc if one
  exists): add `central-meta`.

## Tests

`test/adopt.test.js` — plain Node (builtin `assert`), run with `node`, no
framework. Sandboxed `$HOME` + `PHILSET_CENTRAL` into temp dirs; cover the
five adopt cases the work machine verified by hand: fresh adopt, idempotent
re-run, re-clone relink, fresh-scaffold adopt, both-exist conflict (exit 1,
nothing moved). This codifies the hand-verification so future refactors keep
the invariants.

## Tradeoffs

- **Signpost field vs. hardcoded/env (chose signpost + env override).** The
  hack used `PHILSET_CENTRAL || ~/phil-meta-context`. A hardcoded default
  silently activates the feature for every user — wrong for a library
  (surprise adoption of a `~/phil-meta-context` dir). Flag-gated = explicit
  opt-in, no-dep floor intact. Env stays as test/sandbox override. *Revisit
  if:* the plugin distribution (Phase 2) wants a guided setup that writes the
  flag for you.
- **Push policy: auto-push non-fatal (proposed) vs. commit-only.** Auto-push
  delivers the off-machine-backup win the design lists as a free property, and
  matches work-machine practice (PR-ruleset bypass accepted there). Commit-only
  is safer offline but quietly forfeits backup until a manual push someone
  forgets. Non-fatal push takes both: durable commit always, backup when
  reachable. *Revisit if:* push failures get noisy (then add
  `central-meta-push: false`).
- **Shared relink via `philset adopt` subcommand vs. skill-side logic.** The
  five adopt cases are fiddly fs surgery; duplicating them in prose inside two
  skills invites drift (the exact bug class the porting notes warn about). A
  CLI subcommand is testable once, and skills just invoke it. Cost: one more
  documented command on the surface. *Revisit if:* never, honestly.
- **`/hey` gets the check vs. stays untouched.** Floor purity says add
  nothing; but a dangling symlink defeats the floor's own purpose (local
  context) with a zero-network fix available. Cwd-only scope keeps it minimal.
  *Revisit if:* it ever prompts spuriously.
- **Reimplement-from-spec vs. copy the hacked sources over.** The hacks are
  un-versioned files on another machine; the email spec is complete and the
  library wants tested, gated, reviewed code — not transplanted hack comments.
  The sandbox test matrix guards equivalence.

## Open Questions

- Push default: confirm **auto-push, non-fatal** (vs. commit-only)?
- `ensureCentralRepo`'s `.gitignore`: binaries-only with `.eml` tracked —
  confirm? (Work machine's original list said "inbox binaries (pdf/png/jpg/
  etc.)"; `.eml` wasn't called out either way.)
- Does the *work machine's* local hack survive this merge cleanly? Its npm
  install will be overwritten on update — its `signpost.yml` needs
  `central-meta: ~/phil-meta-context` added *before* updating (the stopgap
  email pattern: add the flag now, it's inert until the library learns it).
- Version: v0.3.1 patch release, or hold for v0.4? (Lean v0.3.1 — the work
  machine is pinned until this is on npm.)

## Out of Scope

- Adopting **this** (personal) machine into central — its `.meta` state
  diverges from central everywhere, so it's wall-to-wall case-4 manual merges;
  its own session.
- Multi-machine concurrent-edit conflict tooling beyond plain git (per the
  accepted design).
- Chunk 2's full multi-user state model (thread-vs-project partition,
  branch-based `.meta`) — this ships one proven slice of it, no more.
- Any change to what `.meta` contains — transport/versioning only.
