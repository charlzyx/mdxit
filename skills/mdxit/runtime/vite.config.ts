import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig, Plugin } from "vite";

function findFirstMdx(directory: string): string | undefined {
  const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = findFirstMdx(path);
      if (nested) {
        return nested;
      }
    }

    if (entry.isFile() && (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))) {
      return path;
    }
  }
}

function collectMdxFiles(directory: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectMdxFiles(path));
    } else if (entry.isFile() && (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))) {
      result.push(path);
    }
  }
  return result;
}

function getTarget() {
  const targetPath = resolve(process.env.MDXIT_FILE ?? "./references");
  const exists = existsSync(targetPath);
  const isDirectory = exists && statSync(targetPath).isDirectory();
  const fallbackDocument = isDirectory
    ? findFirstMdx(targetPath) ?? resolve("./references/showcase.md")
    : targetPath;

  return { targetPath, fallbackDocument, isDirectory };
}

function mdxitDocument(): Plugin {
  const virtualId = "virtual:mdxit-document";
  const resolvedVirtualId = `\0${virtualId}`;

  return {
    name: "mdxit-document",
    resolveId(id) {
      if (id === virtualId) {
        return resolvedVirtualId;
      }
    },
    load(id) {
      if (id !== resolvedVirtualId) {
        return;
      }

      return `export { default } from ${JSON.stringify(getTarget().fallbackDocument)};`;
    }
  };
}

function mdxitDocuments(): Plugin {
  const virtualId = "virtual:mdxit-documents";
  const resolvedVirtualId = `\0${virtualId}`;

  return {
    name: "mdxit-documents",
    resolveId(id) {
      if (id === virtualId) {
        return resolvedVirtualId;
      }
    },
    load(id) {
      if (id !== resolvedVirtualId) {
        return;
      }

      const { targetPath, isDirectory } = getTarget();
      const files = isDirectory ? collectMdxFiles(targetPath) : [targetPath];
      const imports = files.map((f, i) => `import * as m${i} from ${JSON.stringify(f)};`).join("\n");
      const entries = files.map((f, i) => `[${JSON.stringify(f)}, m${i}]`).join(",\n  ");
      return `${imports}\nexport const modules = Object.fromEntries([\n  ${entries}\n]);`;
    }
  };
}

type MdastNode = {
  type: string;
  value?: string;
  name?: string;
  attributes?: unknown[];
  checked?: boolean | null;
  ordered?: boolean;
  spread?: boolean;
  start?: number | null;
  children?: MdastNode[];
};

type SemanticCalloutMarker = {
  type: "steps" | "grid" | "table";
  attrs: Record<string, string | null>;
};

function remarkMdxitCalloutMarkers() {
  return (tree: MdastNode) => {
    transformCalloutMarkers(tree);
  };
}

function transformCalloutMarkers(parent: MdastNode) {
  const children = parent.children;
  if (!children) return;

  for (let index = 0; index < children.length; index += 1) {
    const marker = parseCalloutMarker(children[index]);
    if (!marker) {
      transformCalloutMarkers(children[index]);
      continue;
    }

    const child = children[index + 1];
    const split = splitCalloutChild(marker, child);
    const wrapped = createSemanticCalloutNode(marker, split.child);
    children.splice(index, split.consumeChild ? 2 : 1, wrapped, ...split.remainder);
    transformCalloutMarkers(wrapped);
  }
}

function parseCalloutMarker(node: MdastNode): SemanticCalloutMarker | null {
  if (node.type !== "paragraph" || node.children?.length !== 1) {
    return null;
  }

  const text = node.children[0];
  if (text.type !== "text" || typeof text.value !== "string") {
    return null;
  }

  const marker = readCalloutMarker(text.value);
  if (!marker) {
    return null;
  }

  return {
    type: normalizeCalloutType(marker.name),
    attrs: parseCalloutAttributes(marker.attrs, marker.name)
  };
}

function readCalloutMarker(value: string) {
  const text = value.trim();
  if (!text.startsWith("[!") || !text.endsWith("]")) {
    return null;
  }

  const body = text.slice(2, -1).trim();
  if (!body) {
    return null;
  }

  const separator = firstWhitespaceIndex(body);
  const name = separator === -1 ? body : body.slice(0, separator);
  const normalized = name.toUpperCase();
  if (normalized !== "STEP" && normalized !== "STEPS" && normalized !== "GRID" && normalized !== "TABLE") {
    return null;
  }

  return {
    name,
    attrs: separator === -1 ? "" : body.slice(separator + 1).trim()
  };
}

function firstWhitespaceIndex(value: string) {
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === " " || value[i] === "\t" || value[i] === "\n") {
      return i;
    }
  }
  return -1;
}

function normalizeCalloutType(source: string): SemanticCalloutMarker["type"] {
  const key = source.toUpperCase();
  if (key === "STEP" || key === "STEPS") return "steps";
  if (key === "GRID") return "grid";
  return "table";
}

function parseCalloutAttributes(source: string, name: string) {
  const attrs: Record<string, string | null> = {};
  const text = source.trim();
  if (!text) return attrs;

  if (normalizeCalloutType(name) === "grid" && isUnsignedInteger(text)) {
    attrs.columns = text;
    return attrs;
  }

  for (const token of tokenizeAttributes(text)) {
    const separator = token.indexOf("=");
    if (separator === -1) {
      attrs[token] = null;
      continue;
    }

    const key = token.slice(0, separator);
    const rawValue = token.slice(separator + 1);
    if (key) {
      attrs[key] = unquote(rawValue);
    }
  }

  return attrs;
}

function tokenizeAttributes(value: string) {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | "\"" | null = null;

  for (const char of value) {
    if ((char === "'" || char === "\"") && !quote) {
      quote = char;
      current += char;
      continue;
    }

    if (quote === char) {
      quote = null;
      current += char;
      continue;
    }

    if (!quote && (char === " " || char === "\t" || char === "\n")) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function unquote(value: string) {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === "\"" && last === "\"") || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function isUnsignedInteger(value: string) {
  if (!value) return false;
  for (const char of value) {
    if (char < "0" || char > "9") {
      return false;
    }
  }
  return true;
}

function createSemanticCalloutNode(marker: SemanticCalloutMarker, child?: MdastNode): MdastNode {
  return {
    type: "mdxJsxFlowElement",
    name: "SemanticCallout",
    attributes: [
      { type: "mdxJsxAttribute", name: "type", value: marker.type },
      ...Object.entries(marker.attrs).map(([name, value]) => ({
        type: "mdxJsxAttribute",
        name,
        value
      }))
    ],
    children: child ? [child] : []
  };
}

function splitCalloutChild(marker: SemanticCalloutMarker, node: MdastNode | undefined) {
  if (!canWrapCalloutChild(node)) {
    return { child: undefined, consumeChild: false, remainder: [] as MdastNode[] };
  }

  if (marker.type !== "grid" || node.type !== "list" || !node.children) {
    return { child: node, consumeChild: true, remainder: [] as MdastNode[] };
  }

  const firstTaskIndex = node.children.findIndex((item) => item.checked !== null && item.checked !== undefined);
  if (firstTaskIndex <= 0) {
    return { child: node, consumeChild: true, remainder: [] as MdastNode[] };
  }

  const taskList: MdastNode = {
    ...node,
    children: node.children.slice(firstTaskIndex)
  };
  const gridList: MdastNode = {
    ...node,
    children: [...node.children.slice(0, firstTaskIndex), createChecklistGridItem(taskList)]
  };

  return { child: gridList, consumeChild: true, remainder: [] as MdastNode[] };
}

function canWrapCalloutChild(node: MdastNode | undefined): node is MdastNode {
  return Boolean(node && node.type !== "heading" && !parseCalloutMarker(node));
}

function createChecklistGridItem(taskList: MdastNode): MdastNode {
  return {
    type: "listItem",
    checked: null,
    spread: true,
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "strong",
            children: [{ type: "text", value: "检查项" }]
          }
        ]
      },
      taskList
    ]
  };
}

export default defineConfig({
  define: {
    __MDXIT_TARGET_IS_DIR__: JSON.stringify(getTarget().isDirectory),
    __MDXIT_TARGET_DIR__: JSON.stringify(getTarget().targetPath),
    __MDXIT_SESSION_ID__: JSON.stringify(process.env.MDXIT_SESSION_ID ?? ""),
    __MDXIT_WS_URL__: JSON.stringify(process.env.MDXIT_WS_URL ?? "")
  },
  plugins: [
    mdxitDocument(),
    mdxitDocuments(),
    mdx({
      format: "mdx",
      include: ["**/*.mdx", "**/*.md"],
      mdExtensions: [],
      mdxExtensions: [".mdx", ".md"],
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkMdxitCalloutMarkers]
    }),
    react()
  ],
  build: {
    outDir: "dist/site"
  }
});
