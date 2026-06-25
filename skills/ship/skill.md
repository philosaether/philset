---
name: ship
description: Bless a design doc and begin implementation. Marks the design as accepted, archives superseded docs, updates state files, then starts building.
---

# Ship

The user typed `/ship` — the design is ready. Mark it accepted, handle
housekeeping, and begin implementation immediately.

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 1: Identify the design

- If the user specifies a doc (e.g., `/ship coworking-ux`), use that
- Otherwise, look for the most recent draft in `designs/`
- If ambiguous, ask

## Step 2: Finalize the header

Update the design doc's frontmatter:

```markdown
---
Status: accepted
Date: <original date>
Accepted: <today>
Assessment: <link, if one exists>
Supersedes: <link, if applicable>
---
```

## Step 3: Handle superseded docs

If the design has a `Likely-supersedes` field (from /draft) and the user
didn't object during iteration, treat it as confirmed:

- Add supersession header to the old doc:
  ```markdown
  ---
  Status: superseded
  Superseded: <today>
  Superseded-by: <new design filename>
  ---
  ```
- Move the old doc to `archive/designs/`
- Remove it from `designs/index.md`

## Step 4: Update state files

- Update `designs/index.md`: change status from draft to accepted
- Append to `decisions.md`: one-line summary of what was accepted (create the file if it doesn't exist)
- Update `in-progress.md`: add the work to the Active section (create the file if it doesn't exist)

## Step 5: Graduate a fulfilled roadmap item

If this design fulfills an item already on `roadmap.md` (or `inbox/todo.md`),
graduate it now per the archival convention (`references/archival.md`):
remove it from its source file and append it to `archive/rearview.md` with a
`Completed: <today> (<branch>)` stamp. Match semantically; confirm before
removing a hand-curated item. If nothing matches, skip.

## Step 6: Begin implementation

`/ship` is license to start building immediately. No confirmation step.
Proceed with implementation based on the accepted design.
