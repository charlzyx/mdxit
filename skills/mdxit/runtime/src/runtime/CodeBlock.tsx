import { isValidElement, ReactElement, ReactNode, useEffect, useMemo, useState } from "react";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubDark from "@shikijs/themes/github-dark";
import githubLight from "@shikijs/themes/github-light";
import css from "@shikijs/langs/css";
import json from "@shikijs/langs/json";
import markdown from "@shikijs/langs/markdown";
import shellscript from "@shikijs/langs/shellscript";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import { Mermaid } from "../components/ReviewPrimitives";
import { AntVChart } from "../components/AntVChart";

const highlighterPromise = createHighlighterCore({
  themes: [githubLight, githubDark],
  langs: [css, json, markdown, shellscript, tsx, typescript],
  engine: createJavaScriptRegexEngine()
});

const languageAliases: Record<string, string> = {
  bash: "shellscript",
  sh: "shellscript",
  shell: "shellscript",
  js: "typescript",
  jsx: "tsx",
  mjs: "typescript",
  ts: "typescript",
  md: "markdown",
  mdx: "markdown"
};

function textFromChildren(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  return String(children ?? "");
}

function DiffView({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="diff-view">
      <pre>
        <code>
          {lines.map((line, i) => {
            let cls = "diff-line";
            if (line.startsWith("+")) cls += " diff-add";
            else if (line.startsWith("-")) cls += " diff-del";
            else if (line.startsWith("@@")) cls += " diff-hunk";
            return <span className={cls} key={i}>{line}{"\n"}</span>;
          })}
        </code>
      </pre>
    </div>
  );
}

export function CodeBlock({ children, ...preProps }: { children?: ReactNode } & Record<string, unknown>) {
  const codeElement = isValidElement<{ className?: string; children?: ReactNode }>(children)
    ? (children as ReactElement<{ className?: string; children?: ReactNode }>)
    : undefined;
  const code = useMemo(
    () => textFromChildren(codeElement?.props.children ?? children).replace(/\n$/, ""),
    [children, codeElement]
  );
  const language = codeElement?.props.className?.match(/language-([\w-]+)/)?.[1] ?? "text";

  if (language === "mermaid") return <Mermaid chart={code} />;
  if (language === "diff") return <DiffView code={code} />;
  if (language === "chart") {
    const codeProps = codeElement?.props as Record<string, unknown> | undefined;
    // Meta can be in many places depending on rehype/MDX version
    const metaRaw = (
      codeProps?.meta ??
      codeProps?.metastring ??
      codeProps?.["data-meta"] ??
      preProps.meta ??
      preProps["data-meta"] ??
      preProps["metastring"] ??
      preProps["data-language"] ??
      ""
    ) as string;
    const chartType = metaRaw.replace(/^\|\s*/, "") || "bar";
    return <AntVChart chartType={chartType} code={code} />;
  }
  return <HighlightedCode code={code} language={language} />;
}

function HighlightedCode({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState("");
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeVersion((v) => v + 1));
    observer.observe(document.documentElement, {
      attributeFilter: ["data-code-theme", "data-theme"],
      attributes: true
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const codeTheme = document.documentElement.dataset.codeTheme === "github-dark" ? "github-dark" : "github-light";
    highlighterPromise
      .then((h) => h.codeToHtml(code, { lang: languageAliases[language] ?? language, theme: codeTheme }))
      .then((result) => { if (!cancelled) setHtml(result); })
      .catch(() => { if (!cancelled) setHtml(""); });
    return () => { cancelled = true; };
  }, [code, language, themeVersion]);

  if (html) return <div className="shiki-block" dangerouslySetInnerHTML={{ __html: html }} />;
  return <pre><code>{code}</code></pre>;
}
