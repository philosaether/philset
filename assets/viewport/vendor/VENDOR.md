# vendor/cm.js — CodeMirror 6 for `philset view`

A single-file IIFE bundle that sets `window.CM` so `editor.js` can stay a
plain classic script under the page's nonce CSP. philset itself has no
dependencies; this file is the whole editor stack, built once and committed.

## What is in it

| package | version | license |
|---|---|---|
| @codemirror/state | 6.7.6 | MIT |
| @codemirror/view | 6.43.13 | MIT |
| @codemirror/commands | 6.11.1 | MIT |
| @codemirror/language | 6.12.4 | MIT |
| @codemirror/lang-markdown | 6.5.2 | MIT |
| @lezer/markdown | 1.7.2 | MIT |
| @lezer/common | 1.5.3 | MIT |
| @lezer/highlight | 1.2.4 | MIT |
| @lezer/lr | 1.4.10 | MIT |
| style-mod | 4.1.4 | MIT |
| w3c-keyname | 2.2.8 | MIT |
| crelt | 1.0.7 | MIT |
| @marijn/find-cluster-break | 1.0.4 | MIT |

All by Marijn Haverbeke and contributors, MIT — <https://github.com/codemirror/dev/blob/main/LICENSE>.
Bundled with esbuild 0.28.2. Minified size: **330,924 bytes** (323 KiB), no source map.

`@codemirror/lang-markdown` imports `@codemirror/lang-html` only to nest-parse
HTML blocks and autocomplete tags. The viewer escapes every `<` and never
renders HTML, and that import drags in the HTML, CSS and JavaScript parsers
plus `@codemirror/autocomplete` and `@codemirror/lint` (the bundle would be
506,642 bytes). The build therefore aliases `@codemirror/lang-html` to a
six-line stub; `markdown()` still gets the LanguageSupport-shaped object it
destructures. `HTMLBlock` / `HTMLTag` nodes still appear in the tree, they
just are not parsed further. To take the real package instead, drop the
`--alias` flag.

## Exported surface (`window.CM`)

- `@codemirror/state`: `EditorState`, `EditorSelection`, `Compartment`, `Prec`, `RangeSetBuilder`, `Text`, `Transaction`, `Facet`, `StateEffect`, `StateField`
- `@codemirror/view`: `EditorView`, `keymap`, `Decoration`, `WidgetType`, `ViewPlugin`, `drawSelection`, `highlightActiveLine`
- `@codemirror/commands`: `defaultKeymap`, `history`, `historyKeymap`, `indentWithTab`, `undo`, `redo`
- `@codemirror/language`: `syntaxTree`, `ensureSyntaxTree`, `forceParsing`, `LanguageSupport`
- `@codemirror/lang-markdown`: `markdown`, `markdownLanguage`, `commonmarkLanguage`, `markdownKeymap`
- `@lezer/markdown`: `GFM`, `Table`, `TaskList`, `Strikethrough`, `Autolink`

## Rebuilding

In an empty directory outside the repo (nothing here touches `package.json`):

```sh
npm init -y
npm i -E @codemirror/state@6.7.6 @codemirror/view@6.43.13 @codemirror/commands@6.11.1 \
  @codemirror/language@6.12.4 @codemirror/lang-markdown@6.5.2 @lezer/markdown@1.7.2 \
  @lezer/common@1.5.3 @lezer/highlight@1.2.4 esbuild@0.28.2
```

`entry.js`:

```js
export { EditorState, EditorSelection, Compartment, Prec, RangeSetBuilder, Text, Transaction, Facet, StateEffect, StateField } from "@codemirror/state";
export { EditorView, keymap, Decoration, WidgetType, ViewPlugin, drawSelection, highlightActiveLine } from "@codemirror/view";
export { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo } from "@codemirror/commands";
export { syntaxTree, ensureSyntaxTree, forceParsing, LanguageSupport } from "@codemirror/language";
export { markdown, markdownLanguage, commonmarkLanguage, markdownKeymap } from "@codemirror/lang-markdown";
export { GFM, Table, TaskList, Strikethrough, Autolink } from "@lezer/markdown";
```

`stub-lang-html.js`:

```js
export function html() { return { support: [], language: { parser: null } }; }
export function htmlCompletionSource() { return null; }
```

Build:

```sh
npx esbuild entry.js --bundle --format=iife --global-name=CM --minify \
  --alias:@codemirror/lang-html=./stub-lang-html.js \
  --outfile=assets/viewport/vendor/cm.js
```
