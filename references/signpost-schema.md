# Reference: signpost.yml

Optional philset configuration file in any `.meta/` directory. Controls
tree walk behavior and feature flags.

## Schema

All fields optional. File itself optional. Unset fields use defaults.

```yaml
# Root signpost — stops the tree walk here
root: true

# Display name (default: directory name)
name: "My Projects"

# Directories to skip during sibling listing
ignore:
  - node_modules
  - .git
  - backups

# Whether /hello maintains logical-architecture.md
# Default: true. Inherited down the tree; child can override.
architecture: true

# Named shortcuts to frequently-used files
# Merged across tree walk: parent + child, child overrides on key collision.
links:
  career-plan: ~/Development/meta/.meta/designs/career-trajectory.md
  workflow-improvements: ~/Development/meta/.meta/inbox/workflow-improvements.md

# Re-enable /plan and /ultraplan (overridden by philset by default)
# Default: false. Inherited down the tree; child can override.
allow-plan: false
```

## Inheritance

Flags inherit from parent to child. A child can override any inherited
flag by setting it explicitly in its own `signpost.yml`.

Example: if `~/Development/.meta/signpost.yml` sets `architecture: false`,
all projects inherit that. But `~/Development/praxis/.meta/signpost.yml`
can set `architecture: true` to opt back in.

## Links

The `links` field is a map of name → file path. `/hello` collects links
during the tree walk and displays them in the session summary as clickable
paths. Links are also stored in `breadcrumbs.log` under `## Quick Links`
for context compaction resilience.

Links merge across the tree: root links are available everywhere, child
signposts can add more or override by key.

## Special values

- `root: true` — Marks this directory as the tree root. `/hello` stops
  walking here. Also used to create isolated context subtrees.
- `allow-plan: true` — Re-enables `/plan` and `/ultraplan`, which philset
  overrides by default in favor of the assess → draft → ship flow.
