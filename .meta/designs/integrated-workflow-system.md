---
Status: accepted
Date: 2026-07-01
Accepted: 2026-07-01
Amended: 2026-07-01
Amendments:
  - id: A1
    title: Step 6.5 calendar window — today + early-next-morning
    date: 2026-07-01
    status: accepted
Assessment: ../assessments/philset-praxis-relationship.md
Supersedes: (none — converges the roadmap's "PM integration via signpost flags" item)
Implementation: staged; Stage 1 (calendar-into-/hello + minimal CRM read) started 2026-07-01 (feature/integrated-workflow-system). Stages 2–4 tracked on the roadmap.
---

# Integrated Workflow System — Desired State

The system that keeps Phil's personal workflow scaling as his responsibilities
grow. It unifies what philset, Praxis, calendar, and a CRM each already do (or
should do) into **one leaf-set — everything on Phil's plate — indexed by
multiple orthogonal relations**, each surface rendering the relation it owns,
all converging at read-time. This doc fixes the *desired state* in sight so
that near-term work (chunk 2, the calendar/CRM hooks) stays conceptually
aligned while the details iterate. The desired state will move as we move; the
point is to have it visible enough to move effectively.

---

## North star

> **Keep Phil's personal workflow scaling to meet his rising responsibilities.**

Everything below is subordinate to this. When a move is ambiguous, it's chosen
by the **multi-dimensional-value test**: the best next move scales the workflow
*and* advances Praxis toward its value prop *and* throws off brand/writing
material *and* leaves Phil owning durable, portable infrastructure. Moves that
hit more of those axes at once win.

## Guiding principles (carried from the strategy conversation)

1. **Geodesic of multi-dimensional value.** Every investment returns multiple
   things of multiple types. Prefer moves that pay along several axes at once.
2. **Used-then-iterated, not designed-then-built.** Theory breaks on contact
   with reality; integrate reality fast and often. The draft is the conversation;
   the interim integration is the reality-contact that de-risks the real build.
3. **Porous boundary.** The philset↔Praxis line stays deliberately soft and is
   allowed to shift toward whatever serves the north star. We do **not** design
   toward a hardening event — Praxis open beta will be recognized by feel, not
   planned for here.

## The core model: one leaf-set, multiple relations

Everything on Phil's plate is a shared **leaf-set** (a work item / task /
milestone). The systems are not subsystems bolted together — they are
**orthogonal relations over those same leaves**, each answering a different
question and imposing its own ordering:

| Relation | Owner | Answers | Ordering logic |
|----------|-------|---------|----------------|
| **Practical (how)** | philset roadmap + `.meta/` tree | "what context do I move *with*, and in what practical order?" | **Local-relative**: items relate to *each other* first (B builds on A; X/Y/Z are a natural set; ship I/J/K before next month's UA session), to the calendar second, to who/why only tangentially. Bottom-up; global serves local. |
| **Importance (why / how much it matters)** | Praxis priority forest | "how much does this deserve motion?" | **Ideological**: priorities ordered relative to each other (P1·C1 > P1·C2 > P2·C1). Top-down. |
| **Urgency (when / who)** | Calendar (*when*) + CRM (*who*) | "how time-critical / relationally-weighted is this right now?" | Due-tomorrow > due-next-week; work > personal-brand. Drives urgency; distinct from importance. |

**Importance ⊥ Urgency.** They're genuinely orthogonal axes (both `0..10` in
Praxis). Praxis's **task tray** is the *collapse function* that folds them into
one actionable ordering, via a third contextual axis — **fit** — set by Praxis
**rules**: `score = (importance + urgency) × fit`. Fit is categorical
appropriateness ("set fit for deep-work tasks to 0.5 after noon"). philset's
`roadmap.md` order is a *different* collapse — practical/local. **Same leaves,
different orderings**, because each surface answers a different question. That's
the point, not a bug to reconcile away.

One consequence worth flagging early: **Praxis rules embody logic, they don't
justify it.** "Deep-work fit drops after noon" is a rule, but the concept of a
"morning focus block" isn't persisted anywhere today — it lives in Phil's head
and, implicitly, in the praxis scoring rules layer. Making the horizon's
time-aware guidance feel natural means **exposing the why-layer justification**
for praxis scoring rules to philset agent context (see Open Questions).

### Shared leaves, divergent branches

The trees **agree at the leaf and diverge above it.** A Praxis *Initiative* ≈ a
philset *project* — leaf-adjacent parity is forceable without distorting either
model. But higher structure diverges: `philbas.com` and `eventsnyourcity.com`
sit together under `html/` in the philset tree (practical grouping), yet live
under completely *different* top-level priorities in Praxis (ideological
grouping). **So the sync surface is the leaf, never the tree** — parity via an
association key, not a structural merge.

### The leak this closes

Today **Phil is the connective tissue** between these relations: each morning he
eyeballs Praxis (or his gut), picks which project to open a session in, and
holds "important-but-not-urgent" in working memory where it can slip. Praxis is
meant to be the GUI on the whole loop, but the loop currently runs through
Phil's head. The integrated system's job is to **close that loop** — the
importance/urgency relations actively inform where and how the practical work
starts, instead of Phil being the manual sync.

## Desired end state (the horizon — not all built now)

- **Multiple entry points** over one leaf-set: start from a project
  (philset-first), a priority (Praxis-first), the calendar (a meeting pulls up
  its context + people), or a person (CRM-first). Each entry point renders the
  other relations for that leaf.
- **Cross-machine coherence**: the leaf-set is the same whether Phil is on the
  work machine or the personal machine.
- **Praxis as the GUI on the loop** — the importance/urgency orientation surface
  — with roadmap-item ↔ Praxis-task **leaf parity** wiring the relations together.
- **Urgency- and time-aware session guidance** (the fun horizon that shapes
  storage/sync now): *"Your morning work block is long over, but you're still in
  a code repo with five networking tasks pending — one of them urgent. Sure you
  don't want to `/ttyl` and write some emails?"* Not needed soon; worth having in
  sight because it dictates what state the system must be able to see.
- Calendar and CRM are first-class relations, not afterthoughts: `/hello` opens
  the day already knowing what's time-bound and who's on deck.

### Session-start surfaces: `/hello` and a lighter `/hey`

Adding calendar/CRM (and later Praxis) reads makes `/hello` heavier — a full
tree walk *plus* MCP/API calls — even when the day only needs a light, local
status check (Phil signals this today with "light session, Claude" / "super
focused on X" in the opening prompt). The pressure valve is a **`/hey` skill**:
like `/hello` but informal — loads light, local context only — with an
**escalation gate** (à la `/riff`) that pulls the full tree walk + external
reads if the session goes deeper than expected. `/hey` keeps the cheap path
cheap as the integrated system loads more onto session-start.

## Staged path

Staged so each stage is usable on its own and the earliest ships in days.

### Stage 1 — Evolutionary MCP hooks (ships this week; the reality-contact)
The cheapest move that scales Phil now and de-risks everything after it.
- **`/hello` reads the calendar.** On session start, surface today's meetings
  (Google Calendar MCP — already available in this environment). "You have 2
  meetings today: 3pm nonprofit mixer, 5pm warm intro."
- **`/refresh <contact>` pulls contact info for meeting prep.** Scoped to the one
  use case that actually bites: prepping for a meeting/mixer. Source is
  **Google Contacts via MCP** — we rely on the external CRM until there's a
  compelling reason not to. (CRM read may enter at other points eventually, but
  meeting-prep is the only real need today, so we don't overbuild entry points.)
- No sync, no new datastore, no Praxis dependency. Pure read-into-the-flow.

### Stage 2 — Multi-user state model (chunk 2) + `private-meta`
Runs entangled with Stage 1, not after it. The structural prerequisite for the
practical tree to survive a shared codebase (the imminent job) and to be
*portable* across machines. `private-meta` is the standalone stopgap; chunk 2 is
the real state-partition model (thread-vs-project, branch-based `.meta`,
ttyl-commit location). **The version of philset installed on the work machine
comes out of here.**

### Stage 3 — Cross-machine leaf sync (Praxis prod DB as the shared store)
The first concrete bridge value is **not** Praxis-as-GUI — Phil is a CLI/philset
user today, not a Praxis-GUI user. It's **using the prod Praxis DB to keep the
two machines' roadmaps coherent.** Motivating flow: `/defer` a philset-skill
improvement from the *work* machine → it shows up in the *personal* machine's
roadmap. Neither machine talks to the other directly; **Praxis is the shared
store between them.**

- **Association keys are minted by Praxis** (the DB is source-of-truth for
  identity): a new agent-API endpoint `generateAssociationKey(user)`, keys
  **unique per Praxis user**. Content sync is bidirectional peers; the *identity
  namespace* is Praxis-owned.
- **A roadmap item acquires its key during `/triage`** — the promotion gate
  (staging → curated backlog) is exactly where an item becomes a synced leaf.
  This is a significant `/triage` integration.
- **Opt-in, never assumed.** The whole path is gated behind a **signpost flag**
  (e.g. `praxis-sync: true`) — philset must work fully without Praxis; sync is a
  capability a tree opts into.
- `/hello` (or `/hey`-on-escalation) does a **batched pull** of relevant leaves
  and reconciles against local `roadmap.md` by association key / **conceptual
  match**.
- **Merge = conceptual match, bidirectional.** When two items are conceptually
  indistinguishable, associate them and move on. Genuine double-entries (e.g. an
  "about-us page" task created in a meeting when the roadmap *and* a Praxis task
  already have one) surface on cadence in **`/triage` or `/ttyl`** — never
  resolved eagerly. (A later Praxis version may surface the same conflict in its
  own quick-sort flow — the Praxis equivalent of `/triage`.)

#### Integration layer (sketch — package ownership deferred)
Per "sketch the layer first, then decide which package owns it," the bridge is a
thin client of the Praxis agent API, invoked by philset skills:
- **Association key** — Praxis-minted (`generateAssociationKey(user)`), stamped
  on a roadmap item at `/triage`; the stable identity that makes conceptual-match
  reconciliation possible.
- **Push** — `/defer` / roadmap edits upsert the leaf to Praxis (origin-tagged).
- **Pull** — `/hello` batched-pulls relevant leaves, reconciles by key /
  conceptual match, surfaces new + conflicting items.
- **Conflict** — surfaced on cadence (`/triage`, `/ttyl`), not eagerly.
- **Gate** — the `praxis-sync` signpost flag; absent/false ⇒ the whole layer is
  inert and philset behaves exactly as it does today.

Whether this lives in **`praxis-daemon`** (MCP server) or **`philset-mcp`**
(philset-side client) is decided once the layer's shape firms up — they may be
the same thing.

### Stage 4 — Toward the end state
Praxis-as-orientation-GUI (importance/urgency informing session-start),
urgency/time-aware nudges, more entry points, Praxis-native calendar/CRM
relations — built out as use reveals the shape. Deliberately under-specified;
this is the horizon we steer by, not a blueprint. Two shapes already looming:

- **Exposing Praxis's why-layer to philset agent context** — so an agent reading
  a task can see the *justification* behind a `fit`/rule (e.g. the "morning focus
  block" concept that today lives only implicitly in the Praxis rules layer) and
  reason about it naturally. Likely mechanism: an `agent context` field (+
  document-vector score) on the Praxis **Rules** primitive — Praxis tasks already
  carry agent context hidden from human users, and priorities should too. This is
  what makes the time-aware nudge natural (see the core model + Open Questions).
- **The Praxis notebook ↔ philset inbox convergence.** Phil historically kept a
  running day-log (notes, scratch calc, errant thoughts); Praxis's β.0 vision is
  a *forest of `.md` docs* optionally associated with priorities/tasks, viewable
  split-screen beside the item. In the solo-dev era the day-log has been almost
  entirely subsumed by `.meta/` — and when raw notes *do* happen (meeting notes,
  napkin math before a deep dive) they land in a **philset inbox** for
  processing. So Praxis's notebook and philset's inbox are the same primitive
  ("where raw thought lands before processing") from two directions. Cries out
  for formalization — eventually.

## Tradeoffs

- **Calendar/CRM: build-into-Praxis vs. integrate-external-MCP.**
  *Chosen:* hybrid, external-first. Ship Google MCP hooks now (Stage 1); rely on
  the external CRM (Google Contacts) until there's a compelling reason not to;
  design Praxis-native relations later as use proves the shape. *Why:* the two
  axioms pull opposite ways — multi-dimensional-value favors owned/Praxis-native,
  used-then-iterated favors integrating the reality that already exists today.
  External-first lets the interim integration *be* the reality-contact that
  de-risks the owned build. *Revisit when:* the hooks prove a stable shape, or
  Praxis's Postgres/multi-tenant migration makes a Person/Event model cheap.

- **Sync the tree vs. sync the leaf.** *Chosen:* the **leaf**. *Why:* the two
  trees share leaves but diverge in branch structure (the `html/` vs.
  top-priority example), so a structural/tree merge would fight both data models.
  Leaf-level parity via an association key preserves each tree's independent
  higher organization. *Revisit when:* a use case actually needs structural
  correspondence (none foreseen).

- **Leaf-sync direction: single-source-of-truth vs. bidirectional peers.**
  *Chosen:* **bidirectional content sync, conceptual-match merge**, with
  **Praxis owning the identity namespace** (keys). Conflicts surfaced on cadence.
  *Why not single source of truth:* the practical order (philset) and the
  importance/urgency order (Praxis) answer *different questions* — collapsing one
  into the other destroys the value of having two. Motion flows both ways but
  asymmetrically: Praxis owns why/how-much, philset owns how. *Cost accepted:*
  needs the Praxis key endpoint and a periodic dedup pass (in `/triage` / `/ttyl`).

- **Praxis sync: assumed vs. opt-in.** *Chosen:* **opt-in via signpost flag.*
  *Why:* philset ships and works with zero Praxis dependency; integration is a
  capability a tree turns on, never a baked-in assumption. Keeps the boundary
  porous and philset independently valuable.

- **Bridge-first-value: cross-machine roadmap sync vs. Praxis-as-orientation.**
  *Chosen:* cross-machine sync first. *Why:* Phil doesn't use the Praxis GUI yet;
  the acute need is the two machines sharing one roadmap (the cross-machine
  `/defer`). Praxis-as-orientation is real but horizon (Stage 4).

- **Design toward open beta vs. not.** *Chosen:* not. Recognize the moment by
  feel. *Why:* per Phil — premature boundary-hardening violates the porous
  principle. *Revisit when:* Praxis gains external users (the felt moment).

## Open Questions

1. **Integration-layer package ownership** — `philset-mcp` vs. `praxis-daemon`,
   decided after the layer sketch firms (they may be one thing). Comfortable
   leaving open for now.
2. **Exposing Praxis's why-layer to philset agent context.** Natural time-aware
   guidance needs a philset agent to see the *justification* behind Praxis's
   `fit`/rules — the concept (e.g. "morning focus block") that the rule enforces
   but doesn't record. Direction is **Praxis → philset** (not philset's how-layer
   into Praxis's scoring). *Likely fix:* add an `agent context` field + a
   document-vector score to the Praxis **Rules** primitive; Praxis tasks already
   carry agent context hidden from human users, and priorities should too. Not
   near-term — worked out in practice once the model supports it — but the target
   shapes what the Rules primitive needs to store.

## Out of Scope

- **Planning Praxis open beta** — recognized by feel, not designed here.
- **The full real-time-sync build** — named as the horizon (Stage 4), not
  specified now. Near-term is batched pull-on-`/hello`, not always-on sync.
- **Praxis's own product roadmap** (β.0 notebooks, focus mode, EKS migration) —
  referenced only where it gates integration (the key endpoint, Postgres/
  multi-tenant, and the notebook convergence are the touch points).
- **Building a CRM from scratch as a product** — the "dream CRM / habit-science
  proof-of-concept" is acknowledged as a real latent project and a plausible
  future flagship, but *this* doc scopes only the CRM *relation* the workflow
  needs, not the product. (Its multi-dimensional payoff may pull it forward
  later — tracked separately.)

## Amendments

### A1: Step 6.5 calendar window — today + early-next-morning (2026-07-01)

**Status:** accepted
**Trigger:** Same-session dogfood of Stage 1 (the first real `/hello` calendar
read). Today's calendar was empty while a **7:30 AM next-morning** meeting sat
just outside the window — an evening `/hello` would have surfaced nothing, hiding
an early start the user would want flagged the night before.
**Refined reasoning:** Stage 1's "surface *today's* meetings" is too narrow at
the day boundary. Widen the read to **today + early next morning** (so an evening
session warns about an early start), and add a one-line **"N more this week"**
tail for lookahead without bloat. This holds the session-light constraint — still
a single `list_events` call, just over a slightly wider window.
**Unchanged:** The Stage 1 decision (calendar-into-`/hello` via Google MCP), the
`calendar` signpost flag and opt-in gating, the on-demand contact-context offer,
Stages 2–4, and the core model. Only the read *window* widens.
**Supersedes:** Nothing. Additive — refines the window in Stage 1 / Step 6.5.
