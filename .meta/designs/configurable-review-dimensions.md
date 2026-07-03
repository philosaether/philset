---
Status: draft
Date: 2026-07-03
Assessment: (none — pulled forward from roadmap Tier 3/4)
Likely-supersedes: (none; subsumes the /review slice of "signpost per-skill config")
---

# Configurable /review Dimensions — Desired State

`/review` should stop hardcoding its six code dimensions and instead *resolve*
its review surface — from explicit config, else from session context, else by
asking — with a `/retro` hook that calibrates the agent's choices back into
config over time. The mechanism is medium-agnostic; code is just the first
proving ground.

---

## 0. Scope decision (settle this first)

Three threads braid here. Before filling content, we pick how wide the doc goes:

| Option | What we design **and build now** | Risk |
|--------|----------------------------------|------|
| **A. /review config only** | A `review.dimensions` field + resolution logic, for `/review` only. | Narrow; re-litigate the mechanism when the next skill wants config. |
| **B. /review as proving ground for per-skill config** *(proposed)* | Design the *general* per-skill-config convention (namespace, inheritance, resolution), but **implement only the `/review` slice**. | Slightly more design up front; but "build the specific thing first, then generalize" — we prove the pattern on `/review` before generalizing. |
| **C. Full per-skill-config framework** | The whole Tier-4 mechanism across skills. | Speculative; over-builds ahead of a second real consumer. |

**Proposed: B.** Design the convention so it's forward-compatible with the
Tier-4 "signpost per-skill config" item, but only wire `/review`. This is the
`used-then-iterated` axiom — `/review` is the reality-probe for the general
pattern.

**Bracing against the earlier feedback-gate.** The 2026-07-03 triage put the
`/review` *generalization* behind user feedback (Tier 3, non-code). We're pulling
it forward now because the **mechanism** isn't the feedback-gated part — it helps
*code* review too (the chipper "verify README ↔ API-surface" case). What stays
feedback-gated is the **content of non-code dimension sets** (the actual prose
dimensions). So: build the resolution mechanism + code defaults now; leave the
real prose dimension set for when a prose user shows up.

---

## 1. The dimension model

Split `/review`'s dimensions into two classes — this is the key structural move:

- **Structural dimensions (always on, medium-agnostic):** design reconciliation,
  track reconciliation, merge readiness. These are *philset-native* — they check
  the design/track/state artifacts, not the medium. They run for any project.
- **Medium dimensions (configurable):** the part that depends on *what* you're
  reviewing.
  - *Code default:* bugs, efficiency, redundancy, architecture consistency.
  - *Prose (illustrative, feedback-gated):* clarity, structure/flow, voice
    consistency, factual accuracy, audience fit.

Only the **medium dimensions** are resolved/configured. Structural ones are
constant. (Open question 4: is "redundancy" structural or medium?)

## 2. Resolution precedence

When `/review` runs, it resolves the medium dimensions in order:

```
1. Explicit config (highest precedence):
   - signpost.yml `review.dimensions: [...]`  (project → tree, inherited,
     child overrides — same walk as other signpost flags)
   - WORKFLOW.md declared dimensions (user-level default, lowest of the explicit)
2. Inferred from context (if unconfigured):
   - project type: code (has source / architecture:true) → code default set
                   non-code (architecture:false, prose-heavy) → prose set
   - session goals / what the branch actually changed
3. Ask (if genuinely ambiguous):
   - "This looks like a mixed docs+code branch — review for [X,Y] or add [Z]?"
```

**Transparency rule:** whenever `/review` resolved by **inference or ask** (i.e.
not fully configured), it *states the dimensions it used and why* in its output,
and offers to persist the choice to config. Configured runs stay silent.

## 3. Config surface

```yaml
# signpost.yml
review:
  dimensions: [bugs, efficiency, redundancy, architecture]   # replace medium set
  # extra-dimensions: [readme-api-alignment]                 # append to the default
```

- `dimensions` **replaces** the inferred medium set; `extra-dimensions` **appends**
  (covers chipper's "defaults + a docs-alignment check"). (Open question 1.)
- Inherited down the tree like every signpost flag.
- WORKFLOW.md can declare a personal default set in prose that `/review` reads
  (lower precedence than signpost). (Open question 3: structured vs prose.)

## 4. The novel part — agent-choice + /retro calibration

This is the piece worth designing carefully; it's a philset-native loop:

1. `/review` runs unconfigured → **infers** dimensions → announces them.
2. `/retro` gains a hook: surface recent *inferred* dimension choices for
   calibration — "Last review I chose bugs/efficiency/architecture and skipped
   redundancy — right criteria, or should I have asked?"
3. If the user corrects, `/retro` (or `/review` on the spot) **writes the
   corrected set to config** (signpost `review.dimensions` or WORKFLOW).
4. Next review is now *configured* → silent, correct.

Net: config **builds itself from calibrated inference** — the `used-then-iterated`
axiom made mechanical. You never have to configure up front; you correct once and
it sticks.

## 5. Cross-skill touchpoints

- **/review** — the resolution logic + transparency rule (Steps 2–3 of its skill).
- **/retro** — the calibration hook (Section 4).
- **signpost-schema.md / WORKFLOW.md** — document the `review.*` config.
- **/hello** — *maybe* surface configured review dimensions in the status readout
  (Open question 5). Probably not — noise.

## Tradeoffs

- **Replace vs. append config (`dimensions` vs `extra-dimensions`).** Supporting
  both is more surface but covers the two real cases (writer wants a totally
  different set; chipper wants defaults + one more). Alternative: replace-only
  (simpler, but forces re-listing the defaults to add one). *Revisit if* the
  append case turns out rare.
- **Structured WORKFLOW config vs. prose.** Signpost is structured YAML; WORKFLOW
  is prose the agent interprets. Reading dimensions from WORKFLOW prose is fuzzier
  but matches how WORKFLOW already works. Alternative: only signpost carries
  dimensions (WORKFLOW stays prose-only). *Leaning:* signpost is the structured
  home; WORKFLOW mentions are a soft default.
- **Inference vs. always-ask when unconfigured.** Always-ask is safest but nags;
  inference-with-transparency + retro-calibration trusts the agent and cleans up
  later. *Chosen:* infer + announce + calibrate, ask only when genuinely mixed.
- **Now vs. feedback-gated (the pull-forward).** Building the mechanism now risks
  designing non-code dimensions without a real non-code user. *Mitigated* by
  building only the mechanism + code defaults; prose sets stay gated.

## Open Questions

1. `dimensions` (replace) **and** `extra-dimensions` (append), or replace-only?
2. Is `redundancy` a structural (always-on) or medium (configurable) dimension?
   It applies to prose too — maybe it's structural.
3. Does WORKFLOW.md carry dimensions as *structured* data or interpreted prose?
4. Should `/review` *persist* an inferred set automatically after N consistent
   runs, or only ever on explicit user confirmation via `/retro`?
5. Does `/hello` surface configured review dimensions, or is that noise?
6. Naming: `review.dimensions` vs `review.criteria` vs `review.surface`?

## Out of Scope

- The **real prose/non-code dimension set** — illustrative here; stays
  feedback-gated until a prose user exists.
- **Generalizing the config mechanism to other skills** (the full Tier-4
  per-skill-config framework). We design the convention forward-compatibly but
  only wire `/review` (Scope decision B).
- `git-integration: false` and other non-code items — separate roadmap threads.
