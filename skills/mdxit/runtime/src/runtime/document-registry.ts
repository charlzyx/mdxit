import type { ComponentType } from "react";
import { modules as rawModules } from "virtual:mdxit-documents";

export type MdxitDocument = {
  id: string;
  title: string;
  group: string;
  description: string;
  path: string;
  Component: ComponentType;
};

type Frontmatter = {
  id?: string;
  title?: string;
  group?: string;
  description?: string;
  kind?: string;
};

type DocumentModule = {
  default: ComponentType;
  frontmatter?: Frontmatter;
};

function titleFromFile(path: string) {
  return (
    path
      .split("/")
      .pop()
      ?.replace(/\.(mdx|md)$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ?? "Untitled"
  );
}

function relativePath(absolutePath: string) {
  const prefix = __MDXIT_TARGET_DIR__;
  if (absolutePath.startsWith(prefix + "/")) {
    return absolutePath.slice(prefix.length + 1);
  }
  return absolutePath.split("/").pop() ?? absolutePath;
}

export const documents: MdxitDocument[] = Object.entries(rawModules as Record<string, DocumentModule>)
  .map(([path, module]) => {
    const fallbackTitle = titleFromFile(path);
    const meta = module.frontmatter ?? {};

    return {
      id: meta.id ?? path,
      title: meta.title ?? fallbackTitle,
      group: meta.group ?? meta.kind ?? "Review",
      description: meta.description ?? "MDXit review document",
      path: relativePath(path),
      Component: module.default
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));
