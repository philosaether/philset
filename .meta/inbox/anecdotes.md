# Anecdotes

Concrete examples of philset principles in action. These are evidence,
not rules — they illustrate why the system works when used well.

---

## "Strong architectures expand easily to support unexpected features"

**Date**: 2026-05-20
**Project**: Chipper
**Context**: Building the cadence sentence demo for the Praxis practice
config pattern.

During demo iteration, we discovered that the cadenceOffset chip (in the
anchorDate clause, contingent on cadence) could read cadenceUnit from
ancestor context without any explicit configuration. The contingency
forest's structural context propagation — designed months earlier for
clause-level contingency — naturally supported cross-chip reactivity
for dynamic keyword labels, display values, and popup affixes.

The same session, we added the dayOfMonth alternative-coordinate chip.
Zero engine changes — the existing alt-coordinate archetype, designed
from the Praxis htmx prototype, handled tabs, multi-slot compose/decompose,
and display formatting entirely through configuration.

**Insight**: The deliberate design work in the philset lifecycle (/assess →
/draft → /ship) front-loaded architectural decisions that paid off as
unexpected features fell out of existing primitives. The contingency
forest and domain archetype system were designed for specific use cases
but generalized cleanly because the design phase forced us to think
about the abstractions, not just the immediate problem.
