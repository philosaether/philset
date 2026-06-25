# Postvivem: /amend — Amendments to Accepted Designs

## Context

During the `philbas.com/feature/chipper-contact` session (2026-06-10),
we needed to add a Praxis signup intent path to an already-accepted
design (`contact-sentence.md`). The design had 8 intent paths; we
needed a 9th. Phil identified this as a gap in philset's skill pipeline:
there's no supported way to make scoped additions to accepted designs
without re-opening the whole doc or skipping design entirely.

## What We Improvised

An `/amend` pattern: a new "Amendments" section appended to the bottom
of an accepted design doc. Each amendment is a mini-design with its own
accept/reject lifecycle.

### Mechanics

1. **Frontmatter field**: `Amendments:` array with `id`, `title`,
   `date`, and `status` (proposed → accepted/rejected) per entry.

2. **Body section**: `## Amendments` at the end of the design doc,
   after the original content. Each amendment gets:
   - `### A{n}: Title (date)`
   - `**Status:** proposed`
   - `**Rationale:**` — why this addition is needed
   - `**Changes:**` — what's being added or modified
   - `**Supersedes:**` — what (if anything) in the original design
     this replaces
   - `**Tradeoff:**` — alternatives considered

3. **Accept flow**: Phil annotates inline (same as `/draft`), Claude
   updates, Phil says "accept A1", status flips to accepted, then
   implementation begins.

4. **Original body stays untouched**: The accepted design is read-only
   above the `## Amendments` divider. Amendments add to or selectively
   supersede parts of the original.

### Example (what we actually built)

```markdown
---
Status: accepted
Amendments:
  - id: A1
    title: Praxis signup intent path
    date: 2026-06-10
    status: accepted
---

# Contact Sentence Conversion Funnel — Desired State
[... original accepted design, untouched ...]

---

## Amendments

### A1: Praxis signup intent path (2026-06-10)

**Status:** accepted
**Rationale:** Praxis coming-soon page links to /contact/ but no
intent path covers product signups...
**Changes:** New intent keyword "try Praxis", one optional clause...
**Supersedes:** Nothing. Additive.
**Tradeoff:** Considered folding into "chat about your apps" but...
```

## What Worked

- **Low ceremony**: writing the amendment took ~5 minutes. Much faster
  than re-opening the full design via `/draft`.
- **Inline annotation loop**: Phil annotated the amendment the same
  way he annotates drafts. The workflow was already familiar.
- **Preserves original intent**: reading the design, you see the
  original 8-path plan, then the 9th as a clearly-dated addition.
  Git blame tells you the original was untouched.
- **Scope signal**: if an amendment grows too large, that's a signal
  it wants a v2 `/draft`, not more amendments. We didn't hit that
  threshold here (one intent path is well within scope).
- **Design reconciliation in /review worked naturally**: the review
  agent compared the design (including A1) against the implementation
  and flagged keyword divergences. The amendment was treated as part
  of the spec.

## What to Watch

- **Amendment creep**: if a design accumulates 3+ amendments, the
  original + patches become hard to read. At that point, ship a v2
  design that incorporates the amendments.
- **Supersedes semantics**: A1 was purely additive. We haven't tested
  an amendment that *replaces* part of the original design. The
  `**Supersedes:**` field is there for this, but the interaction with
  `/review`'s design reconciliation is untested.
- **Numbering**: A1, A2, A3... is simple. If amendments get rejected,
  do we reuse the number? Probably not — treat it like commit hashes,
  not line numbers. A rejected A2 stays A2; A3 follows.

## Recommendation

Formalize as `/amend` skill:

- **Trigger**: user says "amend [design]" or intent is recognized
  (adding scope to an accepted design without wanting to re-draft)
- **Input**: the design doc path + the proposed change
- **Output**: appends an amendment section (or adds to existing one),
  sets status to proposed, enters the inline-annotation loop
- **Accept**: user says "accept A{n}", status flips, implementation
  begins
- **Reject**: user says "reject A{n}", status flips, amendment stays
  in the doc as a record of the decision not to proceed
- **Scope guard**: if the amendment exceeds ~1 page of changes, nudge
  toward `/draft` v2 instead

The skill should also update `designs/index.md` with an amendment
count column so the index reflects that a design has been extended.
