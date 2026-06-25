---
Status: accepted
Date: 2026-06-25
Accepted: 2026-06-25
Assessment: ../assessments/philset-development-state.md
---

# Close the Loop — Lifecycle & State-Transition Machinery (Theme A)

philset has rich verbs for **opening** state (`/draft`, `/assess`, `/defer`,
`/riff`) and weak verbs for **closing** it. Accepted designs accrete
amendments with no home; completed roadmap/to-do items don't graduate;
consumed inbox files never clear; and archival happens in two conflicting
layouts. This design gives every `.meta/` artifact a defined close
transition and one place for closed things to live.

Unifying frame: **every artifact has a lifecycle — created → active →
closed.** This chunk standardizes "closed" and adds the missing close
verbs. Four parts, foundation first.

---

## 1. Standard archival convention (the foundation)

Everything else writes here, so settle it first.

**Problem.** Two layouts exist in the wild today:
- Top-level: `/ship` moves superseded designs to `archive/designs/`;
  `/review` Step 8 graduates roadmap items to `archive/rearview.md`.
- Per-type subdir: `/review` Step 9 archives assessments to
  `assessments/archive/`; the 2026-06-25 hygiene pass put consumed inbox
  files in `inbox/archive/`.

`standardize-archival.png` (chipper's `.meta/`) shows both `archive/designs`
*and* `assessments/archive` side by side — the inconsistency is real and
visible.

**Proposed convention: one top-level `.meta/archive/` that mirrors the
live structure.**

```
.meta/
  designs/            archive/
  assessments/    →     designs/
  inbox/                assessments/
  roadmap.md            inbox/
                        rearview.md      ← completed roadmap/to-do items
```

Rules:
- Closed artifacts move to `archive/<same-relative-path>`.
- Single-file logs that accumulate *entries* rather than *files* (completed
  roadmap/to-do items) append to `archive/rearview.md`.
- `tracks/` do **not** archive (decided 2026-05-23 — they live in `tracks/`,
  git log is their history). Unchanged.
- A date prefix is added on archival where it aids ordering (assessments
  already do `YYYY-MM-DD-<slug>.md`); designs keep their name (status
  frontmatter + git carry the date).

**Migration (this is a behavior change, flag it):**
- `assessments/archive/` → `archive/assessments/`
- `inbox/archive/` → `archive/inbox/` (undoes the per-type layout the
  hygiene pass just used — see Tradeoffs; honest reversal)
- Update `/review` Step 9 to write `archive/assessments/`.
- `/ship` Step 3 (`archive/designs/`) and `/review` Step 8
  (`archive/rearview.md`) already match — no change.
- Document the convention in `references/archival.md` (tree root
  `.meta/references/`) so every skill points to one spec.

**Cross-project note:** other repos (chipper) carry the old layout. Fixed
lazily when their skills next run, or in bulk via a future `philset sync` /
`philset mv`. Not blocking.

## 2. `/amend` skill (new)

Improvised twice (`amend-postvivem.md` 2026-06-10, `amend-skill-notes.md`
2026-06-25) with a near-identical shape — ready to formalize. Fills the gap
between "edit a draft" and "supersede an accepted design": **an accepted
design's supporting reasoning needs updating without changing its decision
or structure.**

**Mechanics** (append-only, like `decisions.md`):
1. Original body and `Status: accepted` stay **untouched**.
2. Append (or extend) an `## Amendments` section at the end. Each entry:
   - `### <date> — <what changed>`
   - **Trigger:** the new work/info that prompted it (link source design/assessment)
   - **Refined reasoning:** written as a layer *on top of* the original,
     referencing original sections by number ("§4 ceiling holds, but…") —
     not a rewrite.
   - **Unchanged:** explicit list of what the amendment does *not* touch
     (states the blast radius).
   - **Supersedes:** what (if anything) in the original this replaces
     (default: "Nothing. Additive.").
3. Frontmatter gets an `Amendments:` list (`date`, `title`, `status`) and
   the `Amended: <date>` marker.
4. Log a one-line `decisions.md` entry: amended (not superseded).
5. Update `designs/index.md` — show `amended <date>` so it's discoverable
   without opening the doc.

**Two modes — let the substance decide, don't impose ceremony:**
- *Settled* (the change was decided in conversation — "that'll fix the edge
  case, /amend and ship"): write the amendment as `accepted` directly. No
  loop. It's a decision that happens to need to live *in the design* rather
  than only in `decisions.md`. This is the common, reactive case.
- *Iterating* (the amendment itself needs design work): write it `proposed`,
  enter the inline-annotation loop (same as `/draft`), accept later.

**Lifecycle:** `accepted` or `proposed` on entry per the mode above; "reject
A{n}" flips a proposed entry to `rejected` and it stays as a record. Numbers
are like commit hashes — never reused; a rejected A2 stays A2.

**Decision rule (amend vs. supersede vs. decisions-line):**
- *decisions.md line* — a choice was made; no design reader needs it inline.
- *amend* — the design's decision/structure stands; only supporting
  reasoning shifts, **and a future reader of the design would be misled
  without it.**
- *supersede* (`/draft` v2 → `/ship`) — the decision itself changes, or
  amendments have piled up (3+ → ship a v2).

**Invocation:** user-invoked (`/amend <design>`) **and** agent-recognized,
mirroring `/defer` — when amendment intent surfaces ("this updates our
pricing assumption but doesn't change the design"), Claude proposes
`/amend` rather than waiting.

**Scope guard:** if the amendment exceeds ~1 page, nudge toward `/draft` v2.

**`/review` interaction:** design reconciliation (Step 2 dim 5) already
reads the whole doc including `## Amendments` and treated A1 as spec in the
contact-sentence session. No change needed — amendments are part of the spec.

## 3. The item lifecycle: triage & graduation

**The model (confirmed).** `todo.md` and `roadmap.md` aren't different
*kinds* of list — they're different *stages*. `todo.md` lives in `inbox/`
because it **is** the inbox for work *items*, exactly as `inbox/` is the
inbox for *files*. Triage promotes an item to the curated, ordered backlog
(`roadmap.md`) the way triage promotes an inbox file into `designs/`.

```
inbox/todo.md   →[/triage]→   roadmap.md   →[done]→   archive/rearview.md
 (staging,                    (curated,                (completed)
  unordered)                   ordered)
```

- **Difference** = triaged/committed vs. untriaged/staged. Ordering is the
  surface symptom; *priority* is what a roadmap item has earned.
- **Promotion is optional ceremony.** A small item can go todo → done →
  rearview directly. You only promote to roadmap when you want to prioritize
  it against other committed work.
- **Graduation pulls from wherever the item lived when it got done** — todo
  *or* roadmap. No forced todo→roadmap→done march.
- This confirms `/defer`'s existing two destinations: local curated work →
  roadmap; cross-project / quick capture → todo. No change to `/defer`.

**Rename: `to-do.md` → `todo.md`** (fewer keystrokes). Mechanical, but it
must execute **atomically at `/ship`** alongside the skill edits + `philset
sync` — renaming the file while deployed skills still look for `to-do.md`
would break `/hello` and `/defer` in the window between. Decided now,
executed at ship, everywhere at once (file, all skills, CLAUDE.md,
references, .meta docs).

### `/triage` (new skill)

The triage-gate verb — the complement to `/defer`. Walks open `todo.md`
items and, per item, proposes: **promote** to roadmap (with a priority
placement), **do-now** (small enough to just knock out), **resolve/discard**
(stale or already handled — like today's hygiene pass), or **leave** (still
staging). Optional — never forced.

- **`/hello` nudge:** when `todo.md` has grown past a threshold, surface it
  in the summary — *"todo.md has 12 items; want to run a /triage session?"*
  (Threshold TBD; start ~10.)

### Graduation mechanics

- `/review` Step 8 already graduates **roadmap** items → extend it to
  `todo.md` too. Same target (`archive/rearview.md`), same
  `Completed: <date> (<branch>)` stamp.
- Add graduation to `/riff` (when a note is played, graduate a matching
  source item) and `/ship` (graduate a matching roadmap item the design
  fulfills, at acceptance — today only `/review` does).
- **Matching:** semantic/keyword (no item IDs — too much ceremony for
  hand-written backlogs). **Confirmatory by default** ("this looks done,
  graduate it?"); automatic only for files a skill consumed itself this
  session (e.g. `/ttyl` clearing an inbox file it just processed).

### Riff "targets" (resolves the old Riff Scope question)

Riff scope is an *input to the riff*, not a feature of todo/roadmap — so
there is **no marker injected into `todo.md`**. Instead the **track file**
(per-branch) gets an aspirational `## Targets` list, populated at riff start
by pulling candidate items from roadmap and/or todo: "items under
consideration this session." Aspirational, not prescriptive. As notes are
played, matching source items graduate. todo/roadmap stay clean; ephemeral
session-scope lives where ephemeral things live.

## 4. `/ttyl` auto-clean (new step)

`/ttyl` leaves consumed inbox files in place, so they pile up — the direct
cause of the present backlog.

**New `/ttyl` step (after breadcrumb cleanup):** detect inbox files
consumed this session (content folded into a design/decision/skill, or
explicitly resolved) and move them to `archive/inbox/`. Report what was
archived; ask before archiving anything ambiguous.

**Screenshots** (SII files, e.g. `*.png`) are usually throwaway once acted
on. Default: **delete** consumed screenshots rather than archive them; a
signpost flag (`archive-screenshots: true`) opts into keeping them.

**Out of scope here — gated on chunk 2:** the *other* half of the `/ttyl`
enhancement (commit `.meta/` state at session end) depends on the chunk 2
state model deciding *where* the commit lands so multi-dev repos don't
conflict. Auto-clean ships now; the commit step waits.

---

## Skills & files touched

| Skill / file | Change |
|---|---|
| `references/archival.md` | **New** — the one archival spec |
| `/amend` (`skills/amend/skill.md`) | **New skill** (§2) |
| `/triage` (`skills/triage/skill.md`) | **New skill** (§3) |
| `/ttyl` | Auto-clean consumed inbox files; default-delete screenshots (§4) |
| `/riff` | Graduate played notes; track `## Targets` list (§3) |
| `/ship` | Graduate matching roadmap item at acceptance (§3) |
| `/hello` | Nudge `/triage` when todo is large; surface designs with proposed amendments (§2, §3) |
| `/review` | Step 8 extends to `todo.md`; Step 9 → `archive/assessments/` (§1, §3) |
| `designs/index.md` | `amended <date>` marker support (§2) |
| Rename | `to-do.md` → `todo.md` everywhere, atomically at ship (§3) |
| Existing archives | Migrate to top-level `.meta/archive/` (§1) |

---

## Tradeoffs

- **Archival layout: top-level `.meta/archive/` vs. per-type `<type>/archive/`.**
  Chose top-level. Per-type keeps archived items beside their live dir
  (`ls assessments/` shows both), but it has no clean home for
  *entry-level* graduation (completed roadmap items aren't files — there's
  no `roadmap/` dir), forcing `archive/rearview.md` to be top-level anyway
  and splitting the convention. Top-level handles both dir-types and
  file-types uniformly and is already what `/ship` and `/review` Step 8
  assume. Cost: it reverses the 2026-06-25 hygiene move (`inbox/archive/`)
  and migrates `assessments/archive/`. Revisit if per-dir locality turns
  out to matter more than uniformity in practice.

- **Graduation: automatic vs. confirmatory.** Chose confirmatory by default,
  automatic only for self-consumed files. Silent removal of hand-curated
  backlog items risks deleting something the matcher misread; a one-line
  "graduate it?" is cheap insurance. Revisit toward more automation once
  the matcher proves reliable.

- **Item matching: semantic/keyword vs. explicit IDs.** Chose keyword. IDs
  would make matching exact but impose ceremony on every hand-written
  to-do/roadmap entry — against philset's low-friction grain. Revisit if
  mismatches become common.

- **`/amend` invocation: user-only vs. agent-recognized.** Chose both
  (mirror `/defer`). Agent-recognition risks proposing amendments the user
  didn't want, but `/defer` has shown the recognize-and-propose pattern
  works without being intrusive.

- **One big chunk vs. four small drafts.** Kept as one design because §1
  (archival) is the shared foundation the other three write to; splitting
  would force §1 to be designed in isolation from its consumers.

- **`/triage` as its own skill vs. a `/hello` sub-step.** Chose a skill —
  triage is a real per-item judgment session worth invoking anytime, not
  just at startup. `/hello` only *nudges* ("todo is large, want to triage?").

- **Rename now vs. at ship.** Chose ship-time, executed atomically with the
  skill edits + sync. Renaming the file while deployed skills still
  reference `to-do.md` would break `/hello`/`/defer` in the interim.

## Open Questions

- `/triage` nudge threshold — start at ~10 todo items, tune in practice?
- `/triage` autonomy — always interactive per-item (it's a judgment
  session), or batch-propose like graduation? (Leaning: interactive.)

**Resolved during iteration (2026-06-25):**
- archival.md is a *short* convention note skills link to. ✓
- `/hello` surfaces designs with proposed amendments (try it, see how it
  plays). ✓ — in `/hello` row of the table.
- Riff scope → aspirational `## Targets` list in the track, not a marker in
  todo. ✓ (§3)
- Graduation: confirmatory by default, auto only for self-consumed files. ✓
- `archive/rearview.md`: one flat completed-items log per project. ✓

## Out of Scope

- **`/ttyl` commit step** — gated on chunk 2 (multi-user state model).
- **Multi-user state partitioning, `/suspend`, `/bounce`** — chunks 2 & 4.
- **Roadmap-inbox association** (linking inbox files to roadmap items and
  suppressing them from `/hello` scans) — related lifecycle idea, but an
  organization feature, not a close verb. Defer.
- **Bulk cross-project archive migration** (`philset sync`) — note it;
  don't build it here.
