# Assessment: Deferral Patterns Across Philset Workflows
Date: 2026-05-23
Branch: feature/riff-defer-skills

## Current State

Deferral happens organically across every project using philset. There is
no formalized skill — items get routed manually to various destinations
depending on context and habit. The pattern appears in ~60% of /retros,
~20% of casual coding questions, and nearly every grab-bag branch.

### Destinations observed

| Destination | Example | When used |
|-------------|---------|-----------|
| `roadmap.md` | chipper/.meta/roadmap.md | Categorized backlog with provenance and trigger conditions |
| `inbox/to-do.md` | philset/.meta/inbox/to-do.md, praxis/.meta/inbox/to-do.md | Quick capture, informal, un-triaged |
| `in-progress.md` Parked section | praxis/.meta/in-progress.md | In-flight work with a branch, explicitly paused |
| `in-progress.md` To Explore section | philset/.meta/in-progress.md | Ideas worth pursuing, no branch yet |
| `decisions.md` inline | praxis, chipper | "Deferred X to post-beta" appended to decision entries |
| Cross-project inbox | philset/.meta/inbox/ (from chipper retros, meta retros) | Items that belong to a different project than the one active |

`roadmap.md` is a new pattern I'd like to formalize as part of this work.
  - praxis has had a beta-roadmap.md file for most of its life. It predates the philset, actually
  - I've found myself wanting a roadmap in other projects when they get complex
    - Seems to me /defer will interact with the roadmap quite a lot
    - /hello should read it
    - /assess should take it into consideration -- "is this work already on the roadmap? Are there any features on the roadmap which are closely connected to this work?"
  - I'm not sure to what extent roadmap.md is redundant with in-progress.md, specifically the Parked and To Explore sections.
    - My instinct is that in-progress.md should be a present-state snapshot of work being done, while roadmap is a future-state projection of work yet to do
    - "To Explore" feels like a roadmap concern (pure future work), while "Parked" is arguably both present and future (is paused, will resume)
    - Thoughts?

### Format observed

**Chipper roadmap.md** (most mature format):
```
- **Item name** — Problem/rationale.
  Deferred from: [source session/doc] ([date]).
  Trigger: [explicit resumption condition].
```

Organized by category: Design Sessions Needed, Tech Debt, Accessibility,
Future Modes, Integration, etc.

**Praxis in-progress.md** Parked section:
```
- **Feature** — Branch: `feature/X`. Status note. Parked [date].
```

**Philset inbox/to-do.md**: Freeform bullets, no provenance, no triggers.
Items accumulate without structure.

**Cross-project**: Currently manual. A retro in chipper produces a note
that Phil drops in philset/.meta/inbox/. The routing is human-mediated —
no skill assists.
- I also sometimes just open a project's to-do.md in vs code and add items by hand as it occurs to me to do so
  - That's a usage pattern I want to maintain, but it's worth formalizing -- items dropped by /defer and items added manually may want different sections.
  - As you point out below, "Provenance and trigger conditions are often missing when Phil does it manually"
    - Should that be fixed at any point in the flow? /review, maybe?
      - "These to-do items need to be fleshed out?"
    - I'm leaning "no," but open to suggestions.

### How deferral currently happens

1. Mid-session, scope exceeds the current work mode (riff or draft)
2. Phil says something like "defer that" or "add that to the roadmap"
3. Claude writes the item to the appropriate file, or Phil does it himself
4. Provenance and trigger conditions are included when Claude writes them,
   often missing when Phil does it manually
5. Cross-project items get dropped as inbox files with a header noting origin

## What's Working

- **Provenance + triggers** (chipper roadmap): When present, these make the
  roadmap actionable. "Deferred from riff/demo-task-sentence, trigger:
  second consumer theme" tells the next session exactly when to pick it up.
    - From my perspective, triggers are less helpful than a general idea of which features build on work done by features before.
    - Less "build when" and more "don't build until"
    - When I run /hello, I scan the list of roadmap items to look for proximate, salient items and then pick the one I'm vibing with that morning
      - So the model is a heap to pull from, in which items can be blocked or unblocked, proximate or distant to recent work.
      - Not really a queue -- at least, if it is a queue, backpressure == 0.
- **Category grouping** (chipper roadmap): Items organized by type (design
  sessions needed, tech debt, etc.) makes scanning fast.
- **Decisions.md logging**: Deferral decisions get logged alongside other
  decisions, creating a record of *why* something was deferred.
- **Clean escalation from riff**: The riff/demo-task-sentence session
  deferred 5 items smoothly. The overhead was ~30 seconds per item.

## Gaps

### 1. No consistent format across projects

Chipper has a structured roadmap.md. Praxis uses in-progress.md sections.
Philset uses unstructured inbox/to-do.md. There's no shared convention
for what a deferred item looks like or where it goes.
- The praxis beta-roadmap.md is another potential input for format considerations

### 2. Cross-project routing is manual

This is the biggest friction point. philset's inbox has 11 items, many
originated in other projects' retros or sessions. The routing is
Phil-mediated: he creates a file, gives it a name, drops it in the inbox.
No skill assists, no provenance trail from the originating session.

### 3. Provenance is inconsistent

When Claude writes the deferral, provenance and triggers are included.
When Phil does it manually, they're often missing. A skill would make
provenance automatic.

### 4. No distinction between "add to backlog" and "park active work"

Two different operations get conflated:
- **Defer an idea**: "We should do X someday" → roadmap.md or to-do.md
- **Park active work**: "Stop working on X, come back later" → in-progress.md Parked

The first is backlog-building. The second is workstream management
(closer to /suspend). A /defer skill should handle the first;
/suspend (future skill) handles the second.
- Hold on, let me think through the situations in which I would use these skills. I haven't felt the need to /suspend in a while; I'd forgotten we had scoped that at all tbh.
  - I'm following a cognitive thread; it begins to fray. "Damn," I think, "this will take effort I do not want to spend right now."
    - /defer
  - /suspend, as envisioned, was to support pivoting. "We've developed half this feature, and now I realize I need to develop something else."
    - Hasn't happened in a while, can be prevented by good priority selection
    - But, in principle, always a risk that it *may* happen. Still needs support.
    - in-progress.md Parked does indeed feel like the right place for a suspended workstream -- it remains present-tense.
      - If that workstream is also mentioned in the roadmap, it should maintain an "in-progress" status, but maybe also gain a "parked" indicator.
- NB: We're crossing streams with task management software.
  - For time-bound items in particular (set up ENYC website, apply for that grant), I would want a Praxis task added to my queue
  - That suggests task management integration at some point downstream... but let's /defer that, lol.

### 5. Destination ambiguity

Where does a deferred item go? Options:
- `roadmap.md` — if the project has one and the item is substantial
- `inbox/to-do.md` — if it's quick capture
- `in-progress.md` To Explore — if it's an idea worth investigating
- Another project's inbox — if it belongs elsewhere

The user currently makes this choice implicitly. A skill needs a rule
or a prompt.

### 6. roadmap.md doesn't exist in every project

Chipper has one. Praxis has beta-roadmap.md (archived). Philset doesn't
have one — it uses in-progress.md To Explore and inbox/to-do.md instead.
The skill needs to handle projects that don't have a roadmap yet.
  - I'm thinking we make roadmap.md and inbox/to-do.md full canonical philset meta files, like in-progress.md and decisions.md
    - So set them up in philset begin, scaffold in /hello, the works
  - By extension, /defer can create the file if it doesn't exist yet.

## External Input

From inbox items in this project:

- **lightning-round-proposal.md**: "/defer routes items to the roadmap with
  provenance" — established during first riff session design.
- **riff-defer-postvivem.md**: 5 items deferred in one session, all with
  provenance and triggers. Cross-project routing discussed but not tested.
- **to-do.md**: "I catch myself wanting to say 'add that to our feature
  list'" — the impulse that drives deferral.
- **workstream-switching.md**: Distinguishes deferral (backlog-building)
  from suspension (parking active work with a branch).

From WORKFLOW.md:
- "Favor salience over plan: work on whatever is most useful from where
  we're standing." Deferral is the mechanism that lets you follow salience
  without losing track of what you're skipping.
  - While suspension supports the (undesirable but sometimes unavoidable) edge case where salience takes a hard turn.

## Sample Use Cases (live, from 2026-05-23 cofounder call)

Four items deferred mid-conversation, each with different routing needs.
These illustrate the metadata /defer needs to capture and the destination
logic it needs to resolve.

### 1. "Apply for the grant Ronique found by 6/15"

- **Item**: Grant application
- **Deadline**: 2026-06-15
- **Context**: Ronique (cofounder) identified the grant; Phil needs to act
- **Natural destination**: `proper-elevation/.meta/roadmap.md` — PE is the
  nonprofit, grants are core operations
- **Metadata needed**: what (grant app), who-surfaced-it (Ronique), deadline
  (6/15), action-owner (Phil)
- **Interesting because**: Has a hard deadline, not just a trigger condition.
  The chipper roadmap format uses "Trigger: [condition]" but this needs
  "Deadline: 2026-06-15" — a date, not an event. The skill needs to handle
  both.
  - Eventually, we will want rules (configured in signpost.yml?) to create a praxis task under certain conditions.

### 2. "Put up the ENYC website by 6/5"

- **Item**: EventsNYC website launch
- **Deadline**: 2026-06-05
- **Natural destination**: Depends on where ENYC lives. Could be
  `html/.meta/roadmap.md` (if it's a page on philbas.com),
  a standalone project, or `business/.meta/roadmap.md`.
- **Metadata needed**: what (website), deadline (6/5)
- **Interesting because**: Destination is ambiguous — /defer needs to either
  know the project topology or ask. Also a deadline item, reinforcing that
  triggers aren't always conditional.
  - This would be a new project under the html/ domain directory
  - That implies two features to support the /defer skill:
    - an ambiguity resolution mechanism: "there's no EventsNYC website project yet, where should I put this item?"
    - an explicit domain to-do read time: "The html domain also has an unactioned to-do item, should we work on it now?"
      - When would it surface? Gut says "during /hello on any project under the html domain." Thoughts?

### 3. "Set up my dot card before I move back to NYC"

- **Item**: Set up digital business card (dot card)
- **Trigger**: Before NYC move (fuzzy deadline, life event)
- **Natural destination**: `meta/.meta/roadmap.md` or
  `business/.meta/roadmap.md` — personal/professional ops
- **Metadata needed**: what (dot card setup), trigger (NYC move)
- **Interesting because**: The trigger is a life event, not a code condition
  or a calendar date. "Before I move" is the kind of fuzzy trigger that
  the format needs to support without forcing false precision.
  - Interesting edge case. This one feels like it might be a praxis task but NOT a roadmap item.
    - /defer can't assume task management software integration, and it definitely can't assume praxis integration.
    - So yeah -- we'll need to support fuzzy triggers. And this does seem to touch work in both the meta and business projects
    - "Fuzzy cross-project concern" is a real-world need for the /defer skill.

### 4. "Figure out student merch commissions for PE"

- **Item**: Research how to give commissions to students who design merch;
  set up structure and financial tracking
- **Trigger**: None obvious — exploratory, needs research before action
- **Natural destination**: `proper-elevation/.meta/roadmap.md` — nonprofit
  operations, possibly under a "Programs" or "Operations" category
- **Metadata needed**: what (commission structure + tracking), scope (research
  + implementation), complexity (involves legal/financial questions)
- **Interesting because**: This isn't a task, it's a research question that
  will *produce* tasks. /defer needs to handle "figure out X" items that
  don't have clear action steps yet. The item is the investigation, not
  the implementation.

### What these cases reveal about /defer's requirements

**Metadata the skill must capture:**
1. **What** — the item itself (always required)
2. **Provenance** — where/when it was deferred (automatic: session, branch,
   date, project)
3. **Resumption condition** — one of:
   - **Deadline**: a date (6/15, 6/5)
   - **Trigger**: a conditional event ("before NYC move", "when second
     consumer theme ships")
     - Mmm, these examples are making me rethink my "zero-backpressure queue with random access" model
      - And honestly, "hey you're getting close to moving back to NY, this "set up your dot card" task is becoming more urgent is exactly the logic praxis is meant to support
      - Reproducing it here under /defer is solving the same problem twice -- but for two different audiences in two different contexts, so maybe it's a valid concern for defer
   - **None**: exploratory items with no clear pickup signal
4. **Destination project** — which project owns this item (required for
   cross-project; inferred for local)

**Metadata the skill should NOT require:**
- Category (let the user organize roadmap.md themselves, or let the skill
  suggest one)
- Priority (the roadmap's ordering handles this)
- Assignee (single-developer flow for now; multi-dev is future)

**Destination resolution logic:**
- If the user names a project (`/defer X to PE`): route to that project's
  roadmap.md (or inbox/to-do.md if no roadmap exists)
- If the user doesn't name a project: default to current project's
  roadmap.md
- If the destination project is reachable via the signpost tree: resolve
  the path automatically
- If not reachable: ask. Don't guess.

**Format implications:**
- The chipper format (provenance + trigger) is nearly right, but needs to
  accommodate deadlines alongside conditional triggers
- Proposed format:
  ```
  - **Item name** — Description.
    Deferred from: [project]/[branch] ([date]).
    Due: [date] | Trigger: [condition] | (none)
  ```

## Recommended Next Steps

1. **Draft /defer skill.md** — Two modes:
   - **Local**: `/defer X for Y` → append to `roadmap.md` in the current
     project with provenance and trigger. Create roadmap.md if needed.
   - **Cross-project**: `/defer X to {project}` → append to
     `{project}/.meta/inbox/to-do.md` (or roadmap.md) with provenance.

2. **Establish roadmap.md as the canonical deferral destination** within
   a project. Formalize the chipper format (item + provenance + trigger +
   category) as a reference doc.

3. **Log deferrals in decisions.md** — every deferral is a decision.
   Brief, one-line: "Deferred: X. Trigger: Y."

4. **/hello reads roadmap.md** — surface upcoming triggers during session
   startup. "3 roadmap items, 1 trigger may apply to today's work."

5. **Separate from /suspend** — /defer is "add to backlog." /suspend is
   "park active work with branch state." Different operations, different
   skills.
