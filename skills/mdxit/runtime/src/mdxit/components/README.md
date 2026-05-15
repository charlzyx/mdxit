# MDXit Custom Components

Put user-specific review components in this directory.

The runtime automatically registers every `*.tsx` and `*.jsx` file here:

- `RiskMatrix.tsx` becomes `<RiskMatrix />`.
- A file can override its MDX tag with `export const mdxitName = "MyTag"`.
- The component should default export a React component.

This keeps new interactions out of the core runtime. When a user asks for a new review control, create one file here and use it directly in MDX.
