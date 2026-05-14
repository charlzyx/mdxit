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
  const targetPath = resolve(process.env.MDXIT_FILE ?? "skills/mdxit/references");
  const exists = existsSync(targetPath);
  const isDirectory = exists && statSync(targetPath).isDirectory();
  const fallbackDocument = isDirectory
    ? findFirstMdx(targetPath) ?? resolve("skills/mdxit/references/showcase.md")
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

function mdxitDirectives(): Plugin {
  return {
    name: "mdxit-directives",
    enforce: "pre",
    transform(code, id) {
      if (!/\.(md|mdx)$/.test(id) || !code.includes(":::")) {
        return;
      }

      return {
        code: transformMdxitDirectives(code),
        map: null
      };
    }
  };
}

function transformMdxitDirectives(code: string) {
  const stack: string[] = [];
  const lines = code.split("\n");
  let fence: { marker: "`" | "~"; length: number } | null = null;

  return lines
    .map((line) => {
      const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
      if (fenceMatch) {
        const marker = fenceMatch[1][0] as "`" | "~";
        const length = fenceMatch[1].length;
        if (fence && fence.marker === marker && length >= fence.length) {
          fence = null;
        } else if (!fence) {
          fence = { marker, length };
        }
        return line;
      }

      if (fence) {
        return line;
      }

      const open = line.match(/^:::\s*(grid|item|grid-item)\b(.*)$/i);
      if (open) {
        const tag = open[1].toLowerCase() === "grid" ? "Grid" : "GridItem";
        stack.push(tag);
        return `<${tag}${formatDirectiveAttrs(open[2], tag)}>`;
      }

      if (/^:::\s*$/.test(line) && stack.length) {
        const tag = stack.pop();
        return `</${tag}>`;
      }

      return line;
    })
    .join("\n");
}

function formatDirectiveAttrs(source: string, tag: string) {
  const attrs: string[] = [];
  const text = source.trim();
  if (!text) {
    return "";
  }

  if (tag === "Grid") {
    const positionalColumns = text.match(/^([234])(?:\s|$)/);
    if (positionalColumns) {
      attrs.push(`columns={${positionalColumns[1]}}`);
    }
  }

  const pattern = /([A-Za-z_][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const [, key, doubleQuoted, singleQuoted, bareValue] = match;
    if (/^[234]$/.test(key) && tag === "Grid") {
      continue;
    }

    const value = doubleQuoted ?? singleQuoted ?? bareValue;
    if (value === undefined) {
      attrs.push(key);
      continue;
    }

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      attrs.push(`${key}={${value}}`);
    } else if (value === "true" || value === "false") {
      attrs.push(`${key}={${value}}`);
    } else {
      attrs.push(`${key}=${JSON.stringify(value)}`);
    }
  }

  return attrs.length ? ` ${attrs.join(" ")}` : "";
}

export default defineConfig({
  define: {
    __MDXIT_TARGET_IS_DIR__: JSON.stringify(getTarget().isDirectory),
    __MDXIT_TARGET_DIR__: JSON.stringify(getTarget().targetPath),
    __MDXIT_SESSION_ID__: JSON.stringify(process.env.MDXIT_SESSION_ID ?? ""),
    __MDXIT_WS_URL__: JSON.stringify(process.env.MDXIT_WS_URL ?? "")
  },
  plugins: [
    mdxitDirectives(),
    mdxitDocument(),
    mdxitDocuments(),
    mdx({
      format: "mdx",
      include: ["**/*.mdx", "**/*.md"],
      mdExtensions: [],
      mdxExtensions: [".mdx", ".md"],
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm]
    }),
    react()
  ],
  build: {
    outDir: "dist/site"
  }
});
