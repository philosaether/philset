# `philset mv` — context-aware directory moves

Bash command (not a skill) that moves a project directory and updates all
references across the philset context tree.

## Problem

Moving a directory in the philset tree breaks references in signpost.yml
links, WORKFLOW.md, breadcrumbs.log, design docs, and any other .meta/
file that contains paths. Currently this is a manual crawl.

## Interface

```
philset mv <old_path> <new_path>
```

Flags:
- `--dry-run` (default on first invocation) — show what would change, don't do it
- `--execute` — actually move and rewrite

## Behavior

1. **Dry run** — walk from tree root, grep all files under every `.meta/`
   for `old_path` (both `~/` and expanded `$HOME/` forms). Print each
   file and the lines that would change.
2. **Move** — `mv old new` (fail if target exists and isn't empty)
3. **Sweep** — find-and-replace old path → new path across every file in
   every `.meta/` directory in the tree. Handle both tilde and expanded
   path forms.
4. **Verify** — grep again, confirm zero remaining references. Warn on
   any stragglers.

## Design considerations

- **No signpost creation.** If the move introduces a new intermediate
  directory (e.g., creating a domain grouping), the user sets up the new
  signpost manually. `philset mv` only moves and rewrites.
- **Composable for restructures.** A multi-step restructure uses temp
  renames to avoid circular moves:
  ```bash
  philset mv ~/Development/meta ~/Development/career
  mkdir -p ~/Development/meta
  philset mv ~/Development/career ~/Development/meta/career
  philset mv ~/Development/patterns ~/Development/meta/patterns
  ```
- **Path normalization.** References might use `~/Development/...`,
  `/Users/phil/Development/...`, or relative forms. The sweep should
  catch all of them.
- **Git-aware.** If the source dir is a git repo, warn but don't block.
  The user may want to update remotes or .git config separately.

## Origin

Came up 2026-05-03 in patterns/ while discussing context tree
reorganization — wanting to rename meta/ to career/ and create a new
domain-level meta/ parent.
