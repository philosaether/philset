---
Status: accepted
Date: 2026-04-30
Accepted: 2026-04-30
Assessment: ../assessments/philset-v021.md
---

# Skill Improvements — Desired State

Two additions to existing skills: a Tradeoffs section in `/draft` and
capacity estimation in `/assess`. Both surfaced from the 2026-04-29 retro
(EKS systems design session) and strengthen philset for both interview
prep and regular development work.

---

## 1. Tradeoffs section in `/draft`

### What changes

Add a `## Tradeoffs` section to the design doc template in Step 2 of
`skills/draft/skill.md`. Permanent section — not flag-gated.

### Placement

Between the body sections and Open Questions. Tradeoffs provide context
for open questions (per Phil's note), so reading order is:

```
## <Body sections>
## Tradeoffs
## Open Questions
## Out of Scope
```

### Template addition

In the Step 2 template block, add:

```markdown
## Tradeoffs

Alternatives considered and why each was chosen or rejected. Focus on
forks where the decision could plausibly go either way — not every
micro-choice, but the ones a reviewer or future reader would wonder about.

For each tradeoff:
- What the alternative was
- Why it was rejected (or chosen)
- What would change the calculus (conditions under which we'd revisit)
```

### Skill guidance

Add a brief instruction above the template in Step 2:

> The Tradeoffs section captures design forks — alternatives that were
> seriously considered. Include tradeoffs that surfaced in conversation,
> in the assessment, or from your own analysis. Don't pad — if there were
> no meaningful alternatives, a short section or empty section is fine.
>
> If an ambiguous choice will appear in Open Questions ("Should we use X
> or Y?"), it should also be a Tradeoffs item — lay out the alternatives
> and your analysis, even if the decision isn't made yet.

### File to modify

`skills/draft/skill.md` — Step 2 template block, plus a line of
instruction before it.

---

## 2. Capacity estimation in `/assess`

### What changes

Add an optional `## Capacity Estimate` section to the assessment template
in Step 3 of `skills/assess/skill.md`. Agent decides whether to include
it based on topic relevance.

### Trigger logic

Two paths to inclusion:
1. **Agent discretion**: if the topic involves infrastructure, scaling,
   data models, storage, or anything where quantities matter — include it
2. **Explicit request**: user passes `--capacity` flag or asks informally
   ("include a capacity estimation", "how much storage", etc.)

No trigger for UI, workflow, or process assessments unless explicitly asked.

### Template addition

In the Step 3 template, add after Gaps:

```markdown
## Capacity Estimate

Napkin math for the system under assessment. Estimate what matters for
the topic — not all of these will apply:

- Users / concurrency
- Requests (QPS, daily volume)
- Payload sizes
- Storage (total, growth rate)
- Bandwidth
- Cost implications

Show your math. Rough is fine — the goal is order-of-magnitude awareness,
not precision. Flag assumptions that would change the architecture if
wrong by 10x.
```

### Skill guidance

Add a note in Step 3 (before the template):

> If the topic involves infrastructure, scaling, or data — include a
> Capacity Estimate section with napkin math. Skip for UI, workflow, or
> process assessments unless the user asks for it. When in doubt, a few
> lines of rough math is better than none.

### File to modify

`skills/assess/skill.md` — Step 3 template block, plus instruction.

---

## Resolved Questions

1. **Tradeoffs in Step 1 (gather context)?** Yes — add a bullet to Step 1
   noting tradeoffs as something to collect alongside assessments and prior
   designs. No reason not to; it primes the agent to populate the section.

2. **`--capacity` in frontmatter description?** Yes — add the flag to the
   `/assess` description so it's visible in skill listings.

## Out of Scope

- Tradeoff analysis in `/assess` (assessments are descriptive, not
  prescriptive — tradeoffs belong in design docs)
- Capacity estimation in `/draft` (draft designs reference assessments;
  the math lives in the assessment, not the design doc)
- Interview-specific skill mode (e.g., `--interview` flag) — the
  improvements work for both contexts without special casing
