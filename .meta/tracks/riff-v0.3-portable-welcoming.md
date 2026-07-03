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
   - Agreed that we need this line, not sure philset is the right namespace for it
   - After all, we're not releasing developer-mode into the world. This computer is the only place where this command will be used
   - Could just add it to my usr/bin and be done with it? Or is there a better convention?
   - **CLAUDE reply → agreed, don't put it in the shipped CLI (your volatility axiom:
     stable user-facing CLI vs. volatile local dev setup). But not `~/usr/bin` — a
     repo-local dev script beats it: `scripts/dev-link.js` wired as an npm script
     (`npm run link`). Reproducible + travels to a fresh clone / 2nd dev box,
     co-located with the skills/refs it links (won't drift), idiomatic (`npm run`
     = repo-dev chores), zero shipped-CLI surface. The `~/bin` script is none of
     those. DECISION: `npm run link`, not `philset link`.**
   - The `copyDirRecursive` symlink-safety fix STAYS in `bin/philset.js` — that's a
     real bug in the *shipped* update/init path (EINVAL on same-file copy),
     independent of where the linker lives.
- (b) `update` over a symlinked dest → **skip** (my rec: safe no-op in dev) vs.
  **replace with copy** (would break your live-edit workflow — I don't recommend).
- (c) Link references too, not just skills (fixes the drift at its root)? [rec: yes]
- (d) Should `philset link` also cover **`sync`**'s project-local `.claude/skills/`
  case, or leave `sync` as-is (copy)? [my read: leave `sync` — it's for committing
  skills into a shared repo, where copies are correct; `link` is global-only.]
  - Agreed

---

### Housekeeping: graduate Target 1 from the roadmap?

Target 1 (private-meta) is in `rearview.md`. It's also a hand-curated Tier 1 item
in `roadmap.md`, part of the visible **v0.3 bundle**. Riff says confirm before
removing a curated backlog item. Two options:
- **Leave it** on the roadmap (struck/annotated "done") so the whole v0.3 bundle
  stays visible until the release cuts, then graduate all four together. [my lean]
- **Remove it now** (it's already in rearview). Cleaner roadmap, but the v0.3
  bundle looks partial.

**PLAYED (2026-07-03).** Built the revised (npm-script, not CLI) shape:
- `scripts/dev-link.js` + `"link": "node scripts/dev-link.js"` in package.json.
  Symlinks 12 skills → `~/.claude/skills/` and 9 references → `<root>/.meta/
  references/`; idempotent; picks up new items. Excluded from the npm package
  (`files` omits `scripts/`), so users never see it.
- `copyDirRecursive` now skips symlinked destinations (lstat → `isSymbolicLink`),
  killing the EINVAL same-file-copy crash and protecting dev links.
- Verified sandboxed (fake HOME + tree, real deployment untouched): link is
  idempotent; `update` over a symlinked skill skips it (stays a link) while
  copying the rest.

**Target 2 (deploy vs. symlink) DONE.** Ran `npm run link` for real — drift fixed
(`signpost-schema` live, `study-format` present). Root `.meta` references are now
machine-local symlinks; gitignored `references/` there + `git rm --cached`'d the 4
formerly-tracked ones (staged, not committed — that's a separate repo). Prevents
broken symlinks if root `.meta` lands on the work laptop.

## Note 4: non-code low-hanging-fruit pass (Target 3)

**Audit finding (grounded):** 27 "code/codebase/software" hits across skills, but
most are *not* gratuitous — proper noun ("Claude Code"), genuinely code-specific
features (`logical-architecture` map), the coined term "note-before-code", or
examples. `/draft` already says "artifact" (0 code hits); `/study` already lists
"codebase, an architecture, a primary source". **philset is already concept-level
general.** So rewording is small; the leverage is the escape-hatch + git docs.

**Scope (precision-preserving, audit-only):**

**A. Minimal rewordings** — only the genuinely-general lines, leaving coined terms
and code-specific features alone:
- `/retro` L130 "derivable from reading the code" → "…from reading the code or the
  work itself".
- `/assess` L28 "current state from the codebase and docs" → "…from the codebase
  (or your documents/work) and docs".
- `/riff` L85 "go straight to code" → "go straight to the change".
- LEAVE: "note-before-code" (signature term), "Claude Code" (proper noun),
  `/hello`'s "codebase map" lines (that IS the code-map feature; handled by B).

**B. Document `architecture: false` as the non-code escape hatch** — it already
exists and `/hello` already writes it on decline; just make it *discoverable* as
"the non-code move." Add one line to the `signpost-schema.md` entry ("Set false
for non-code projects — turns off the codebase-map prompt"). No behavior change.

**C. New `references/git-setup.md`** — concise git-for-non-devs tutorial (the
roadmap's "git-setup / onboarding flow, git stays"): why philset uses git (version
history is a feature for a writer), the ~5 commands you actually need, and that
philset drives the rest. A reference doc, pointed at from the README onboarding
(Target 4 links it — keeps the human-facing prose in one place).
- let's /defer this to a full draft after we finish the ship

**D. Flag the `/review`-dimensions sharp edge** — NO build. Already captured in
roadmap (Tier 4 signpost per-skill config → Tier 3 deep generalization). One-line
acknowledgment only, so a non-code user isn't surprised `/review` is code-shaped.
Where: leave the skill untouched; the README non-code note (Target 4) states it.

**Explicitly deferred to Target 4 (README):** the *positioning prose* — "philset
works for non-code work," which audiences, the git-setup pointer. Target 3 is the
mechanical bits; Target 4 is the human framing. No parallel structures.

**Open for you:**
- (a) Rewordings A — right set? Too timid / too aggressive?
   - Right set
- (b) `git-setup.md` as a reference doc (C), or fold the git tutorial straight
  into the README (Target 4) instead of a separate file? [my lean: reference doc,
  README links it — reusable + keeps README lean.]
  - /deferred inline
- (c) Anything you'd *add* to the non-code pass that I'm not seeing?
   Let's /defer /review generalization

**PLAYED (2026-07-03).** Built A + B, deferred C + D per your annotations:
- A: 3 rewordings landed — `/retro` ("code or the work itself"), `/assess`
  ("codebase (or your documents/work) and docs"), `/riff` ("go straight to the
  change"). Coined terms / proper nouns / code-map lines left intact.
- B: `architecture: false` documented as the non-code escape hatch in
  `signpost-schema.md` (yaml comment). No behavior change.
- C (git-setup tutorial): **/deferred** to its own `/draft` post-ship → new Tier 2
  roadmap item. Pulled out of the Tier 1 non-code bullet.
- D (/review prose dimensions): **/deferred** — already on the roadmap (Tier 3
  non-code deep generalization + Tier 4 signpost per-skill config); no dup. The
  README (Target 4) will state the code-shaped caveat.

**Target 3 (non-code low-hanging pass) DONE.** Net finding: philset was already
concept-level general, so the pass was small by design — the leverage moved to the
deferred git tutorial + the Target-4 positioning prose.

## Note 5: README — audit, not rewrite (Target 4)

**Phil's steer:** he already did the README voice pass solo (just never logged in
decisions.md), so the inbox files are likely stale. Rework Target 4 to "audit the
README for what's needed since the last voice pass," then likely /defer.

**Audit (grounded):**
- README history = 3 commits: the original voiced rewrite (`6fb611f`) + my two
  private-meta edits this session. **Voice pass is done** — essay-voiced,
  human-facing. The "for-humans" goal is met.
- **Materially stale on coverage:** cadence tables list only `/hello`,`/ttyl` /
  `/assess`,`/draft`,`/ship`,`/review`. **Zero mention of `/riff`, `/defer`,
  `/amend`, `/triage`, `/study`** — half the current library.
- No non-code positioning. `/ship` section assumes Claude implements (so
  `human-implements.md` is an *unapplied* gap, not stale).

**Disposition:** voice-heavy → Phil-solo. **Target 4 = audited + /deferred** (not
built). Roadmap item reworked from "for-humans rewrite" → "README update: cover
skills shipped since the voice pass + non-code positioning + human-implementer
note." Inbox: `readme-context` graduated (applied); `human-implements` kept (feeds
the deferred update); `anecdotes` kept (case-study material).

**Target 4 (README) DONE for the riff** (audit + defer). Actual writing is Phil's
solo item on the roadmap.

**Open release call (surfaced to Phil):** v0.3's four targets are now
1 (built) · 2 (built) · 3 (built) · 4 (audited → README-update deferred). Does
v0.3 **cut now** on the mechanical targets with the current voiced-but-coverage-
stale README (update fast-follows), or **wait** for Phil's solo README update?
