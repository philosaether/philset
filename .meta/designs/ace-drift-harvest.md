---
Status: accepted
Date: 2026-08-15
Accepted: 2026-08-15
Assessment: none (specs are the Ace's own records: its decisions.md 07-24/07-29/08-05/08-06, ferry items, and the standing drift inventory in its in-progress.md)
Supersedes: none (additive to configurable-review-dimensions.md and hey-minimal-tree-walk.md)
---

# Ace Drift Harvest — Desired State

Port the six features pioneered as local hacks on the Ace into philset
source and cut a release, so (a) a coworker can try them from npm, and
(b) the Ace can finally run `philset update` without destroying its own
improvements. Every item below shipped, was dogfooded, and earned its
keep on real work — this is harvest, not design. The specs quoted are
the Ace's own words off the ferry.

---

## 1. `/review`: three medium-dimension additions (`skills/review/skill.md`)

The existing dimension architecture (structural vs. medium, signpost
`review.dimensions`/`extra-dimensions`) takes these without structural
change. All three join the **code default set**, which becomes:
`bugs, efficiency, redundancy, architecture, comment-reconciliation,
runtime-multiplicity, peer-consistency` — droppable per-project via the
existing config, same as `redundancy`.

### 1a. `comment-reconciliation` (with the audience pass folded in)

Per the Ace's 08-06 ferry ask, the dimension ships *with* its
dogfooded successor built in:

- **Predicate:** every durable string in the diff (comment, docstring,
  log/error message) serves an enumerated persona or moves.
- **Personae:** P1 next-maintainer Claude (primary — wins conflicts);
  P2 the operator; P3 repo teammate with no `.meta` access; P4 runtime
  readers. Ask *"who acts on this string, and when?"*
- **Dispositions:** keep / rewrite / split / relocate / delete.
- **No-new-channels preservation rule** (load-bearing): relocation
  targets only channels with working read-halves — the code itself,
  the blame→PR walk, commit messages. `.meta/` gets nothing new.
- **Named rule:** *keep the incident, strip the session/plan/person
  that dates it* (durable regression receipts stay; session framing
  goes).
- **Executed by a persona'd subagent** on large diffs — writer and
  editor must be different instruments.
- **Inheritable domain rules:** honor
  `review.comment-reconciliation.rules: [...]` from the signpost tree
  (first live use on the Ace: `no-provenance-tracker-ids`).
- Report per-run disposition counts in the review output (seed of the
  0.4 measurement ledger; the full ledger is design-gate work, §OQ4).

### 1b. `runtime-multiplicity`

For state written to a process global: answer *"how many processes run
this line"* from **deployment config**, not code — fly.toml process
groups, k8s replicas, worker counts — because the evidence lives in a
file no code-focused pass opens. (Origin: the deciding fact on a real
merge-blocker was 8 lines of TOML.)

### 1c. `peer-consistency`

When the diff adds a member to an existing family, enumerate the
siblings and find the invariant the new member breaks — documented in
**both polarities**: new-member-breaks-existing-invariant AND
new-invariant-existing-siblings-don't-follow. (First outing found an
ownership bug no diff-local pass could reach.)

### 1d. Required `Cleared` section (output format, deliberately NOT a dimension)

Every `/review` report carries a `Cleared` section: what each dimension
examined and affirmatively cleared. Three jobs: disambiguates silence
(unmentioned ≠ unexamined), carries the argument for real findings (a
finding stated against cleared near-neighbours reads as a conclusion,
not an opinion), and is the substrate for measuring dimensions (one
that only ever emits Cleared lines is a prune candidate).

## 2. `/hey`: read the cwd inbox (`skills/hey/skill.md`)

The pickup half of hub→spoke handoffs, specified by the accepted
hub-session design but never implemented: `/hey` reads the cwd
`.meta/inbox/` (as `/hello` already does), so a warm handoff file
dropped by a hub is actually picked up when the spoke opens. Without
it, a handoff is an undelivered message.

## 3. `/hello`: `github` check entry (`skills/hello/skill.md`)

New `hello.check` vocabulary entry, spec verbatim from the ferry
(archive `2026-08-05-gh-state-read-for-hello.md`):

- Requires `gh` authed; unauthed/offline → note quietly, never block.
  Read-only throughout.
- Two cheap calls: `gh search prs --author=@me --state=open` +
  `--review-requested=@me --state=open`.
- **Cross-check against state files, don't just list** — the value is
  catching drift ("in-progress says MERGEABLE, GitHub says
  CHANGES_REQUESTED"). Verify each state-file claim with
  `gh pr view --json state,reviewDecision,mergeStateStatus`; follow one
  hop to named blockers.
- Surface only diffs and arrivals; all-match → one line. Corrections
  also land in the state files during the session.
- Earned its place: 7 stale-state corrections in two days on the Ace.

## 4. Release mechanics

1. Implement on `feature/ace-drift-harvest`; `npm test` green.
2. **Stranger-install smoke** (the coworker's literal path): `npm pack`
   → install the tarball under a temp HOME → `philset init` → verify
   skills + references land and `/hey` runs with zero `.meta`/network
   dependencies.
3. `/review` the branch (dogfooding 1a–1d on their own diff).
4. Version bump + CHANGELOG, tag, merge on Phil's call.
5. `npm publish` — Phil's OTP.
6. Post-ship: `philset update` on the Fool; tell the Ace 0.4 is cut
   (its update-block lifts — snapshot-then-diff per its own 07-28
   method, since its installed hacks are now native).

## Tradeoffs

### All three dimensions default-on vs. opt-in

Default-on chosen: they're question-shaped (emit Cleared lines when
nothing bites, cost ~a paragraph), the Ace ran them default-on for
three weeks of real reviews, and the existing `review.dimensions`
config is the opt-out. The coworker gets the pioneered behavior out of
the box — which is the point of the ship.

### Audience-pass folded into 1a vs. shipped as a separate later step

Folded: the ferry ask is explicit ("fold the pass into
comment-reconciliation in 0.4"), the pass is accepted + twice-dogfooded
(dogfood-2 exercised all five dispositions and reproduced an external
reviewer's calls blind), and shipping the dimension without it would
port the obsolete version of the feature.

### Version: 0.4.0 vs. 0.3.2

**Recommend 0.4.0.** Every standing cross-machine reference ("do not
update until 0.4 harvests the drift", "0.4 design gate", the ferry
items' addressing) names 0.4 as the harvest release. Renumbering the
roadmap's "0.4 = chunk 2 multi-user state model" to 0.5 costs one
roadmap edit; breaking the standing pointers costs confusion on two
machines. Pre-1.0, numbers are cheap; pointers aren't.

## Open Questions

1. **Default-set growth OK?** (§Tradeoffs — my call is default-on;
   veto here.)
2. **The Ace's "0.4 (tier model) targeted this weekend"** — its 08-14
   state names a record-retention/tier model riding 0.4. No spec for it
   has crossed to this machine. Ship without it (my lean — it's
   design-gate work, wiki-SoT-entangled), or hold the cut?
   - *Phil (at ship): the tier model is a perfect split point — first
     slice of a feature dogfooded on the Ace over the coming weeks →
     **0.5**. Resolved: 0.4 ships without it.*
3. **`/ttyl` fold-to-`Cleared`** — the Ace's in-progress uses a
   "Cleared YYYY-MM-DD" convention (`fold to Cleared at /ttyl`) that
   isn't in the drift inventory. Harvest as part of `/ttyl` now, or
   leave for the state-model work? (My lean: leave — it's chunk-2
   adjacent and unspecified.)
4. **Measurement ledger** — 1a reports disposition counts inline;
   the *ledger* (per-run dimension verdicts accumulated somewhere) is
   deferred to the design gate. OK?

## Out of Scope

- Chunk 2 multi-user state model (was "v0.4" on the roadmap → becomes
  0.5; unchanged in content)
- `/spin` verb, agent-comment-markers (axis B), docstring-line
  followup, writing-framing datum — ferry items consumed into the
  design gate, not this cut
- comment-audience-pass measurement ledger proper (OQ4)
- The retro-reflective-half draft (its own branch, unmerged)
- causation buckets for external-PR review (Ace roadmap gap, not a
  hack — explicitly "roadmap item, not hack" in its 07-28 inventory)
