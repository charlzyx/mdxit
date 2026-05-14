# MDXit Agent And Runtime Boundaries

MDXit has three layers with different ownership rules.

## 1. Built-In Runtime

Owned by the MDXit program.

Examples:

- `src/runtime/`
- `src/components/ReviewPrimitives.tsx`
- `src/cli/`
- `vite.config.ts`
- core CSS layout and default theme tokens

Purpose:

- Load MDX documents.
- Provide the workbench.
- Register built-in and custom components.
- Run Vite preview with HMR.
- Render diagrams and highlighted code.

Agent rule:

- Do not change this layer during normal document authoring.
- Change it only when the user asks to extend MDXit platform behavior.

## 2. User Customization Layer

Owned by the project or user.

Examples:

- `src/mdxit/components/`
- `src/mdxit/templates/`
- `src/mdxit/themes/`
- optional user-provided root `DESIGN.md`

Purpose:

- Add business-specific review components.
- Store reusable MDX document templates.
- Define project style tokens or UI guidance.
- Give agents UI rules without making them edit the runtime.

Agent rule:

- This is the preferred write area for new interactions and project-specific style.
- Keep components semantic and document-oriented.
- Keep themes token-based.

## 3. MDX Document Layer

Owned by document authors and agents.

Examples:

- `examples/**/*.md`
- `examples/**/*.mdx`
- future `docs/**/*.md`
- future `docs/**/*.mdx`
- user-provided document packs

Purpose:

- Carry reviewable content.
- Use MDX JSX tags as XML-like semantic markers.
- Remain understandable without rendering.

Agent rule:

- Prefer editing this layer when the task is about content.
- Treat `examples/showcase.md` as the syntax source of truth.
- Use headings, Markdown task lists, `Insight` / `Insights`, `Tabs`, `Steps`, `ProgressBar`, `Fold`, and Mermaid diagrams to expose structure.
- Use Markdown task lists for checks.

## Execution Boundary

Agent-side files such as a user-provided `DESIGN.md` are instructions, not runtime inputs.

Program execution consumes:

- MDX source files.
- React components from `src/mdxit/components/`.
- CSS/theme tokens from explicit runtime imports.

Program execution does not automatically interpret arbitrary prose guidance. An agent must translate `DESIGN.md` into concrete MDX, component, template, or theme changes when requested.

## Dynamic Modification Policy

During normal authoring, agents may dynamically create or update:

- `.md` documents.
- `.mdx` documents.
- component files in `src/mdxit/components/`.
- template files in `src/mdxit/templates/`.
- theme token files in `src/mdxit/themes/`.

Agents should ask or state intent before modifying:

- built-in primitives.
- runtime loading logic.
- CLI behavior.
- Vite/Rolldown config.
- shared CSS that affects all documents.
