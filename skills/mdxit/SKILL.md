---
name: mdxit
description: Use this skill when the user asks for a PRD, architecture proposal, QA report, migration plan, technical decision record, launch weekly report, review report, or any agent-generated document that benefits from human review or interactive preview. Also use it for requests like "organize this into a proposal", "write a design document", or "draft a technical plan". Prefer standard Markdown; use semantic components only when they increase information density.
---

# MDXit

Use semantic components to increase Markdown information density without turning the document into HTML. If standard Markdown can express the content clearly, keep it as standard Markdown.

## `/mdxit` Command

When the user enters `/mdxit <path>`, treat `<path>` as the MD/MDX file or folder to preview:

```bash
MDXIT_FILE=<path> npm run dev
```

The path can be a file or a directory. By default, the preview loads all `.md` / `.mdx` files under that path and generates a navigation tree automatically.

## Decide First

Use MDXit when:

- The user needs a PRD, architecture proposal, QA report, migration plan, decision record, or review report.
- The document needs spatial organization such as comparisons, metrics, folds, progress, steps, or charts.
- The user needs an interactive preview where reviewers can answer questions or submit change suggestions.

Do not use MDXit when:

- The user is asking a casual question, requesting a short explanation, or chatting.
- The user explicitly asks for plain Markdown or plain text.
- The document is only for long-term archive and does not need preview; in that case, avoid `AskQuestion`.

If you are unsure whether interaction is needed, ask: "Does this document need reviewers to answer questions or submit change suggestions in the preview page?"

## Working With Existing Markdown

When the user provides an existing `.md` file to enhance, choose one of these modes:

1. **Edit in place**: Modify the current `.md` file directly and convert suitable sections to MDXit enhanced syntax. Use this when the user explicitly says to edit the file.
2. **Copy and enhance**: Copy the original file to `<original-name>.review.md`, then enhance the copy while leaving the original unchanged. Use this when the user wants to preserve the original or compare versions.
3. **Ask the user to choose**: If the user has not specified a mode, present the two options and ask them to choose. **Recommend the copy-and-enhance mode by default.**

Only apply these enhancements:

- Multi-part comparisons -> `<Grid>` / `[!Grid 2]`
- Metrics and numbers -> `<Insight metric>`
- Progress or phases -> `<ProgressBar>` / `<Steps>`
- Option switching -> `<Tabs>`
- Expandable details -> `<Fold>`
- File lists -> `<Tree>`
- Conclusions that need confirmation -> `<AskQuestion>`
- Risk or warning text -> `[!NOTE/TIP/OK/WARNING/DANGER]`

Do not change factual content from the source text. Do not add facts that are not present in the source text.

## Writing Principles

1. Use standard Markdown for prose, lists, tables, blockquotes, code blocks, and task lists. Use components only for spatial organization.
2. Use `<b>` for titles, `<small>` for supplementary text, and component children for body content.
3. Use `ok` / `warn` / `risk` status props for green / yellow / red visual tones.
4. Use block enhancement markers as standalone lines: `[!Steps]`, `[!Grid 2]`, `[!Table chart=bar]`.
5. Do not alter source facts or add information that was not in the source.
6. Match the user's document language. If the user writes in Chinese, the generated document can be Chinese, but this `SKILL.md` must remain English.

## MDX Structure Safety Rules

Markdown list indentation can affect MDX component tags. When generating or rewriting `.md` / `.mdx` files, follow these rules:

1. Block-level XML component tags must start at the beginning of the line. Do not indent them for visual nesting. This applies to `<Tabs>`, `<Tab>`, `<Grid>`, `<Insight>`, `<Fold>`, `<Steps>`, `<Step>`, `<Tree>`, `<AskQuestion>`, and similar block-level tags.
2. If component content ends with a list, table, blockquote, or code block, leave a blank line before and after the closing tag, and keep the closing tag flush left.
3. Do not place block-level components inside Markdown list items. If a Tab/Grid needs lists, put the lists inside the component body and keep the component tags flush left.
4. Self-check after writing: there should be no indented block-level tags such as `  </Tab>` or `  <Tab ...>`. Otherwise MDX may fail with errors like `Expected the closing tag ... after the end of listItem`.

Recommended Tabs pattern:

```mdx
<Tabs>
<Tab label="Option A">

- First item
- Second item

</Tab>
<Tab label="Option B">

Body text or a list.

</Tab>
</Tabs>
```

## Syntax Quick Reference

Read `references/showcase.md` for detailed syntax, scenarios, and composition examples. **Always read it before enhancing a document.**

| Component | Syntax | Use |
|------|------|------|
| `[!Grid 2]` + standard list / `<Grid>` | Block marker or XML tag | Multi-column comparison, option evaluation |
| `<Insight ok badge="..">` | `<b>` title + `<small>` subtitle | Decision card, risk card, metric card |
| `<ProgressBar value={72} ok>` | `<b>` title + body text | Progress percentage |
| `<Steps active={2}>` + `<Step>` | Horizontal or vertical steps | Phases, timeline, milestones |
| `<Tabs>` + `<Tab label="A">` | One tab panel per option | Multiple options or views |
| `<Fold>` + `<b>` title | Foldable content | Details, stack traces, long text |
| `<Tree><ul><li>` + `<small>` | Native list syntax | File tree, directory structure |
| `<AskQuestion id="x" question="..">` | Description as children | Collect reviewer feedback |
| `>[!NOTE\|TIP\|OK\|WARNING\|DANGER]` | Blockquote | Notes, warnings, status callouts |
| ` ```mermaid` / ` ```chart \| bar` | Fenced code block | Flowcharts, bar/line/pie charts |

## Interaction Events

When the user answers an `AskQuestion` prompt or submits a suggestion for selected text in the preview page, events are written to `.mdxit/session/events.jsonl`. If you need to process those events, read `references/events.md`.

## Customization Directories

Project-level: `.mdxit/` for session events, project-specific components, and themes. Whether to commit this directory is project-specific.

Global: `~/.config/mdxit/` for shared cross-project components and themes.

Runtime auto-load paths:

- `.mdxit/components/` (project-level, overrides `src/mdxit/components/`)
- `src/mdxit/components/` (source-level)
- `.mdxit/themes/` (project-level, overrides `src/mdxit/themes/`)
- `src/mdxit/themes/` (source-level)

Each `*.tsx` / `*.jsx` file is registered automatically. Export `mdxitName` to specify the tag name; otherwise the file name is used.

```tsx
// .mdxit/components/RiskMatrix.tsx
export const mdxitName = "RiskMatrix";
export default function RiskMatrix({ items }) {
  return <section>{/* project-specific review interaction */}</section>;
}
```

Custom component rules:

- Add a custom component only when existing components cannot express the business structure.
- Prefer writing it under `.mdxit/components/`; do not modify runtime or built-in primitives.
- Keep props simple so agents can generate them and humans can read them.
- Do not create components for ordinary layout or typography.

## Preview

```bash
npm run dev                                          # dev server + HMR
node dist/cli/index.js preview examples              # preview a directory
node dist/cli/index.js preview docs/proposal.md      # preview a single file
```

Test interactions:

1. Type an answer in `AskQuestion`, press Enter to submit, and use Shift+Enter for a line break.
2. Select body text, click the floating "Change suggestion" action, enter feedback, and submit.
3. Check `.mdxit/session/events.jsonl` to confirm events were written.

## Installation

The skill includes its runtime and does not require an extra clone.

```bash
npx skills add charlzyx/mdxit
cd skills/mdxit/runtime
npm install && npm run build
```

Or run the setup script:

```bash
bash skills/mdxit/scripts/setup.sh
```
