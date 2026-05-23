# Reference: tracks/

Design scratchpads for `/riff` sessions. One file per riff branch.
Tracks are the conversation artifact — the thing iterated on, not a
summary of the conversation.

## Format

```markdown
# riff/<topic-slug>

<One-line scope description.>

Started: <date>

---

## Note 1: <topic>

<Design content. Iterated in place until approved, then frozen.>

## Note 2: <topic>

<Next item. Notes accumulate as the session progresses.>
```

## Guidelines

- **One track per branch.** The filename matches the branch name:
  `tracks/riff-demo-task-sentence.md` for branch `riff/demo-task-sentence`.
- **Note-before-code.** Changes that introduce behavior or concepts get
  a note written *before* implementation. The user approves the note,
  then Claude builds. Bug fixes and mechanical changes skip notes — git
  log is the record.
- **Append-forward.** Notes are iterated in place until played, then
  frozen. Don't revise Note 1 after moving to Note 3. If Note 1's
  approach turns out wrong, write a new note explaining the correction.
- **Not session logs.** Tracks contain things that need iteration between
  user and Claude. git log with descriptive commit messages is the session
  log.
- **Tracks stay in `tracks/`.** No archival after merge — they're small
  and have lookup value for git blame context.
