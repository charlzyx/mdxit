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

function mdxitCalloutMarkers(): Plugin {
  return {
    name: "mdxit-callout-markers",
    enforce: "pre",
    transform(code, id) {
      const path = id.split("?", 1)[0];
      if (!/\.(md|mdx)$/.test(path) || !code.includes("[!")) {
        return;
      }

      return {
        code: transformMdxitCalloutMarkers(code),
        map: null
      };
    }
  };
}

function transformMdxitCalloutMarkers(code: string) {
  const lines = code.split("\n");
  const out: string[] = [];
  let fence: { marker: "`" | "~"; length: number } | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0] as "`" | "~";
      const length = fenceMatch[1].length;
      if (fence && fence.marker === marker && length >= fence.length) {
        fence = null;
      } else if (!fence) {
        fence = { marker, length };
      }
      out.push(line);
      continue;
    }

    if (fence) {
      out.push(line);
      continue;
    }

    const marker = line.match(/^\s*\[!(STEPS?|GRID|TABLE)([^\]]*)\]\s*$/i);
    if (!marker) {
      out.push(line);
      continue;
    }

    const type = normalizeCalloutType(marker[1]);
    const attrs = marker[2];
    i += 1;

    while (i < lines.length && lines[i].trim() === "") {
      i += 1;
    }

    const block: string[] = [];
    while (i < lines.length) {
      const current = lines[i];
      if (current.trim() === "") {
        break;
      }
      block.push(current);
      i += 1;
    }

    out.push(`<SemanticCallout type="${type}"${formatCalloutAttrs(attrs, type)}>`);
    out.push("");
    out.push(...block);
    out.push("");
    out.push("</SemanticCallout>");

    if (i < lines.length) {
      out.push(lines[i]);
    }
  }

  return out.join("\n");
}

function normalizeCalloutType(source: string) {
  const key = source.toUpperCase();
  if (key === "STEP" || key === "STEPS") return "steps";
  if (key === "GRID") return "grid";
  return "table";
}

function formatCalloutAttrs(source: string, type: string) {
  if (type === "grid") {
    const match = source.trim().match(/^(\d+)$/);
    return match ? ` columns={${match[1]}}` : "";
  }

  const attrs: string[] = [];
  const text = source.trim();
  if (!text) return "";

  const pattern = /([A-Za-z_][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const [, key, doubleQuoted, singleQuoted, bareValue] = match;
    const value = doubleQuoted ?? singleQuoted ?? bareValue;
    if (value === undefined) {
      attrs.push(key);
    } else if (/^-?\d+(\.\d+)?$/.test(value) || value === "true" || value === "false") {
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
    mdxitCalloutMarkers(),
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
