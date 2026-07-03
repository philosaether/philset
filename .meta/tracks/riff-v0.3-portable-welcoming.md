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

2. **Flag scope — inherited, child-overrides, default `false`** (same as other
   signpost flags). Lets you either flip it per-repo, or set `private-meta: true`
   once high in the tree so every repo under it defaults private. philset's *own*
   repo leaves it false (we want `.meta/` tracked here).

3. **Setup surface — `philset private` (new subcommand)**, or a flag on
   `philset begin`. Writes the `.git/info/exclude` entry **and** sets
   `private-meta: true` in the project `signpost.yml`. Idempotent (safe to re-run;
   don't double-append the exclude line).

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
- (b) `philset private` as its own subcommand vs. folding into `philset begin`.
- (c) Does the flag *also* need a runtime effect in the skills now, or is
  "ignore + degrade-when-absent + plant the chunk-2 guard" enough for v0.3? My
  read: enough. The skills don't commit yet, so there's nothing to suppress.

**Scope check:** this note is a lightweight /draft. If (a)–(c) open up more than a
riff can hold, we escalate private-meta to a real `/draft`. My bet: it stays
riff-sized — the mechanism is small once we pick the exclude approach.
