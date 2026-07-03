# riff/v0.3-portable-welcoming

v0.3 "portable + welcoming" release — make philset survive a shared repo (job
inflection) and welcome non-code solo creatives (Reddit inflection). Cut the
release when the four Tier 1 items land.

Started: 2026-07-03

## Targets

Pulled from `roadmap.md` Tier 1 (candidates, not commitments):

1. **private-meta signpost flag** — `.gitignore`s `.meta/`; skills degrade
   gracefully when `.meta/` is untracked/absent. The day-one shared-codebase
   unblock. *(job floor — likely the deepest; may escalate to a note-heavy or
   /draft-level pass since it ripples across every skill's state read/write.)*
2. **deploy vs. symlink reconciliation** — `philset init`/`update` copy while the
   dev env symlinks → divergent copies + stale references. Reconcile (a `philset
   link`? make `update` refresh references). Gates a clean install.
3. **non-code low-hanging-fruit pass** — audit-only, precision-preserving:
   - language audit ("code/codebase" → "artifact/work" where the skill is general)
   - document `architecture: false` as the non-code escape hatch
   - git-setup tutorial / onboarding flow for non-devs (git stays)
   - flag the `/review`-dimensions sharp edge (don't build — Tier 3/feedback)
4. **README-for-humans + onboarding pass** — README reads for humans deciding to
   adopt, not for agents. Absorbs human-implements, anecdotes, readme-context;
   folds in /riff+/defer docs + external-writes-through-inbox principle.

Escape hatch: anything exceeding riff scope → `/defer`. Anything needing a real
design pass → escalate a note to `/draft`.

---

## Note 1: `private-meta` signpost flag

**Goal:** let philset run inside someone else's repo without `.meta/` ever
showing up in their git — day-one shared-codebase survival.

**Grounding (what's true today):**
- **No skill runs `git commit`/`git add`.** The `/ttyl` commit step is deferred
  to chunk 2. So `.meta/` persistence is *manual* right now — meaning the *only*
  thing that pollutes a shared repo today is `.meta/` showing up as untracked
  files / getting caught in a `git add -A`. That makes the v0.3 job small:
  **ignore `.meta/`, degrade gracefully.** The hard part (auto-commit routing) is
  correctly chunk 2's problem, not ours.
- `bin/philset.js` already has the scaffolding patterns we'd extend: `findRoot`
  reads `signpost.yml`, `cmdInit` runs `git init` in the *root* `.meta`, `cmdBegin`
  scaffolds a project `.meta/` + CLAUDE.md.

**Proposed behavior:**

1. **Ignore mechanism — use `.git/info/exclude`, not the repo's `.gitignore`.**
   This is the precision move: `.git/info/exclude` is a *local-only, never-committed*
   ignore list. `private-meta: true` → philset writes `/.meta/` there. The shared
   repo's tracked `.gitignore` is never touched, so teammates see *nothing* — no
   stray `.meta/` entry in their diff, no "what's this philset thing" in review.
   (Alternative considered: appending `/.meta/` to the repo's root `.gitignore` —
   rejected as invasive; it puts your local tooling in everyone's tree.)
   - Mmm, I wouldn't mind it. Turns the next PR review into guerilla marketing
      - But you're right in principle. Let's be respectful.

2. **Flag scope — inherited, child-overrides, default `false`** (same as other
   signpost flags). Lets you either flip it per-repo, or set `private-meta: true`
   once high in the tree so every repo under it defaults private. philset's *own*
   repo leaves it false (we want `.meta/` tracked here).

3. **Setup surface — `philset private` (new subcommand)**, or a flag on
   `philset begin`. Writes the `.git/info/exclude` entry **and** sets
   `private-meta: true` in the project `signpost.yml`. Idempotent (safe to re-run;
   don't double-append the exclude line).
   - Love it
      - Let's do both, a la --dsp

4. **Graceful degradation — mostly already true.** `/hello` already offers to
   scaffold when `.meta/` is absent. The real forward-obligation is a **one-line
   guard we plant now for chunk 2**: whenever a skill gains a commit step, it must
   check `private-meta` and refuse to commit `.meta/` into a shared repo. I'll add
   that as an explicit note in the state-model assessment so chunk 2 can't miss it.
   Ties directly to the just-deferred **commit-convention flag** (private-meta ⇒
   "never commit `.meta/` to this repo").

**Open for your annotation:**
- (a) `.git/info/exclude` vs. repo `.gitignore` — I strongly prefer exclude for
  invisibility; push back if you'd rather the ignore be *visible* to teammates as
  an honest "philset lives here" signal.
  - Agreed inline
- (b) `philset private` as its own subcommand vs. folding into `philset begin`.
   - Both; formal philset begin --private flag with philset private sugar
   - at work, my default session start command will be "philset private --dsp"
- (c) Does the flag *also* need a runtime effect in the skills now, or is
  "ignore + degrade-when-absent + plant the chunk-2 guard" enough for v0.3? My
  read: enough. The skills don't commit yet, so there's nothing to suppress.
  - Agreed

**Scope check:** this note is a lightweight /draft. If (a)–(c) open up more than a
riff can hold, we escalate private-meta to a real `/draft`. My bet: it stays
riff-sized — the mechanism is small once we pick the exclude approach.
- Think it paid off there Claude

**PLAYED (2026-07-03).** Built per your calls: `.git/info/exclude` (a),
`philset private` sugar + `philset begin --private` flag composing with `--dsp`
(b), no runtime skill effect (c). `enablePrivateMeta()` in `bin/philset.js` sets
`private-meta: true` in signpost.yml + writes `/.meta/` to `.git/info/exclude`
(idempotent, worktree-safe via `git rev-parse --git-path`). Verified in a
throwaway repo: `git status` shows no `.meta/` after; second run doesn't dupe.
Documented in signpost-schema.md, `/hello` fields table, README, logical-
architecture. Chunk-2 commit guard planted in the state-model assessment.

## Note 2: `philset private` also leaks CLAUDE.md — exclude it too?

**Dogfood finding.** Running `philset private` in the test repo left this:
`git status → ?? CLAUDE.md`. `cmdBegin` scaffolds `CLAUDE.md` into the repo root,
and unlike `.meta/` it's *visible* to teammates. Same leak Note 1 set out to
prevent ("without `.meta/` ever showing up in their git") — just a different file.

The tension: in private mode you *want* your philset `CLAUDE.md` active locally
(it drives session behavior) but you *don't* want to commit it to someone else's
repo. That's exactly what `.git/info/exclude` is for.

**Proposed:** in private mode, also add `/CLAUDE.md` to `.git/info/exclude` (only
if philset created it / it's untracked — never exclude a CLAUDE.md the host repo
already tracks). Two-line change to `enablePrivateMeta`.
- Covered the exact edge case I worried about

**Open for you:**
- (a) Exclude CLAUDE.md in private mode? (my read: yes — it's the same leak.)
   - Agreed
- (b) Guard: only exclude if untracked, so we never hide the host's own tracked
  CLAUDE.md. (my read: yes, essential.)
   - Agreed
- (c) Or would you rather private mode *not scaffold* CLAUDE.md at all? (I lean
  no — you want the instructions locally; exclude keeps them working + invisible.)
   - Agreed

**PLAYED (2026-07-03).** `enablePrivateMeta` now hides `.meta/` always and
`CLAUDE.md` when present-and-untracked (new `isTracked()` helper). Verified two
cases: fresh shared repo → both hidden, `git status` clean; host repo that
*already tracks* its own CLAUDE.md → only `.meta/` hidden, their CLAUDE.md
stays tracked and untouched. Docs updated (signpost-schema, README).

**Target 1 (private-meta) DONE** — Notes 1+2 played. Graduated to
`archive/rearview.md`.

## Note 3: deploy vs. symlink — `philset link` (Target 2)

**Dogfood ground truth (this machine, now):**
- **Skills:** all 12 `~/.claude/skills/*` are symlinks → `philset/skills/*`. Live.
- **References:** `~/Development/.meta/references/*` are *copies*, and drifting:
  - `signpost-schema.md` — **stale** (I edited the repo copy this session for
    private-meta; deployed copy is the old Jun-25 one).
  - `study-format.md` — **missing** (added with `/study`, never re-copied).

**Root cause — one sentence:** philset conflates *developer mode* (edit the repo,
want changes live → symlink) with *user mode* (installed the package, just want
the latest → copy). `init`/`update` only do copy; the dev env is hand-symlinked;
the two fight. Worse, `copyDirRecursive` does `fs.copyFileSync(src, dest)` where,
for a symlinked skill dir, `dest` resolves back to `src` → a **same-file copy that
throws EINVAL**. So `philset update` is effectively unrunnable in the dev env
today, which is *why* references never refreshed and new skills need manual `ln -s`.

**Proposed reconciliation (riff-sized):**

1. **New `philset link` — the developer path.** Idempotently symlink every repo
   skill into `~/.claude/skills/` **and** every repo reference into
   `<root>/.meta/references/` (root via `findRoot`). Removes any existing
   file/dir/symlink at each target first, then links. Picks up new skills/refs
   automatically — no more manual `ln -s`, and references can't drift because
   they're the same inode as the repo. This is what *this* machine should run.
2. **`philset update` stays the user path (copy latest), made symlink-safe.**
   Fix `copyDirRecursive` to **skip destinations that are already symlinks**
   (lstat → `isSymbolicLink`), logging `symlinked (dev) — skipped`. That kills the
   EINVAL crash and stops `update` from clobbering a dev's live links. Users
   (real copies) are unaffected; new skills still copy for them.
3. **Fix the live drift now:** running `philset link` re-points references at the
   repo, so `signpost-schema.md` (my edit) goes live and `study-format.md` appears.

**Why link-only for references?** The root `.meta` is its own git repo; committing
symlinks with absolute `philset/…` paths is machine-specific — fine for a dev
workstation, wrong for a user. So links are strictly the dev path; copy stays the
user path. Clean split, matches the two modes.

**Open for you:**
- (a) `philset link` as the reconciliation (dev=symlink, user=copy)? [my strong rec]
- (b) `update` over a symlinked dest → **skip** (my rec: safe no-op in dev) vs.
  **replace with copy** (would break your live-edit workflow — I don't recommend).
- (c) Link references too, not just skills (fixes the drift at its root)? [rec: yes]
- (d) Should `philset link` also cover **`sync`**'s project-local `.claude/skills/`
  case, or leave `sync` as-is (copy)? [my read: leave `sync` — it's for committing
  skills into a shared repo, where copies are correct; `link` is global-only.]

---

### Housekeeping: graduate Target 1 from the roadmap?

Target 1 (private-meta) is in `rearview.md`. It's also a hand-curated Tier 1 item
in `roadmap.md`, part of the visible **v0.3 bundle**. Riff says confirm before
removing a curated backlog item. Two options:
- **Leave it** on the roadmap (struck/annotated "done") so the whole v0.3 bundle
  stays visible until the release cuts, then graduate all four together. [my lean]
- **Remove it now** (it's already in rearview). Cleaner roadmap, but the v0.3
  bundle looks partial.
