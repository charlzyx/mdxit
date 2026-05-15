import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { Children, cloneElement, isValidElement, createElement, useLayoutEffect, useRef } from "react";
import { Blockquote as MantineBlockquote } from "@mantine/core";
import {
  Admonition,
  AskQuestion,
  Fold,
  Grid,
  GridItem,
  Insight,
  Insights,
  MarkdownA,
  MarkdownHr,
  MarkdownLi,
  MarkdownOl,
  MarkdownParagraph,
  MarkdownTable,
  MarkdownTbody,
  MarkdownTd,
  MarkdownTh,
  MarkdownThead,
  MarkdownTr,
  MarkdownUl,
  Mermaid,
  ProgressBar,
  SemanticCallout,
  Step,
  Steps,
  Tab,
  Tabs
} from "../components/ReviewPrimitives";
import { CodeBlock } from "./CodeBlock";
import { customComponents } from "./custom-components";

type AdmonitionType = "note" | "tip" | "ok" | "warning" | "danger";

const markerPattern = /^\s*\[!(NOTE|TIP|OK|WARNING|DANGER)\]\s*/i;

function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textFromNode(node.props.children);
  }
  return Children.toArray(node).map(textFromNode).join("");
}

function slugify(children: ReactNode) {
  const text = textFromNode(children)
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return text || "section";
}

function createHeading(level: 1 | 2 | 3) {
  return function Heading({ children }: { children?: ReactNode }) {
    const ref = useRef<HTMLHeadingElement | null>(null);
    const baseId = `${slugify(children)}-${level}`;

    useLayoutEffect(() => {
      const heading = ref.current;
      const container = heading?.closest(".document-stage") ?? document;
      const headings = Array.from(container.querySelectorAll<HTMLElement>("[data-toc-base-id]"));
      const counts = new Map<string, number>();

      for (const item of headings) {
        const base = item.dataset.tocBaseId ?? "section";
        const count = counts.get(base) ?? 0;
        counts.set(base, count + 1);

        const id = count === 0 ? base : `${base}-${count + 1}`;
        item.id = id;
        item.dataset.tocId = id;
      }
    }, [baseId]);

    return createElement(
      `h${level}`,
      { ref, id: baseId, "data-toc-base-id": baseId, "data-toc-id": baseId, "data-toc-level": level },
      children
    );
  };
}

function stripFromFirst(
  node: ReactNode,
  pattern: RegExp
): { match: RegExpMatchArray; result: ReactNode } | null {
  if (typeof node === "string") {
    const m = node.match(pattern);
    return m ? { match: m, result: node.replace(pattern, "") } : null;
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const inner = stripFromFirst(node.props.children, pattern);
    if (inner) return { match: inner.match, result: cloneElement(node, {}, inner.result) };
    return null;
  }
  const arr = Children.toArray(node);
  for (let i = 0; i < arr.length; i++) {
    const child = arr[i];
    if (typeof child === "string" && child.trim() === "") continue;
    const inner = stripFromFirst(child, pattern);
    if (inner) return { match: inner.match, result: [...arr.slice(0, i), inner.result, ...arr.slice(i + 1)] };
    break;
  }
  return null;
}

function Blockquote({ children }: { children?: ReactNode }) {
  const result = stripFromFirst(children, markerPattern);
  if (result) {
    return <Admonition type={result.match[1].toLowerCase() as AdmonitionType}>{result.result}</Admonition>;
  }
  return (
    <MantineBlockquote className="mdxit-block" cite={extractCite(children)} icon={null}>
      {children}
    </MantineBlockquote>
  );
}

function extractCite(children: ReactNode): string | undefined {
  const arr = Children.toArray(children);
  const last = arr[arr.length - 1];
  if (isValidElement<{ children?: ReactNode }>(last)) {
    const text = typeof last.props.children === "string" ? last.props.children : "";
    const m = text.match(/^—\s*(.+)$/);
    if (m) return m[1].trim();
  }
  return undefined;
}

export const mdxComponents: MDXComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  p: MarkdownParagraph,
  ul: MarkdownUl,
  ol: MarkdownOl,
  li: MarkdownLi,
  a: MarkdownA,
  hr: MarkdownHr,
  blockquote: Blockquote,
  table: MarkdownTable,
  thead: MarkdownThead,
  tbody: MarkdownTbody,
  tr: MarkdownTr,
  th: MarkdownTh,
  td: MarkdownTd,
  pre: CodeBlock,
  Admonition,
  AskQuestion,
  Fold,
  Grid,
  GridItem,
  Insight,
  Insights,
  Mermaid,
  ProgressBar,
  SemanticCallout,
  Step,
  Steps,
  Tab,
  Tabs,
  ...customComponents
};
