import {
  Accordion as MantineAccordion,
  Alert,
  Badge,
  Box,
  Button,
  Card as MantineCard,
  Code,
  Group,
  List,
  Anchor,
  Divider,
  Progress as MantineProgress,
  SimpleGrid,
  Stepper as MantineStepper,
  Table,
  Tabs as MantineTabs,
  Text,
  Textarea,
  Timeline,
  Tree as MantineTree
} from "@mantine/core";
import {
  AlertTriangle,
  Check as CheckIcon,
  CircleCheck,
  Info,
  Lightbulb,
  MessageSquareText,
  ShieldAlert
} from "lucide-react";
import mermaid from "mermaid";
import { Children, isValidElement, ReactNode, useEffect, useId, useState } from "react";
import { getActiveDocumentPath, sendMdxitEvent } from "../runtime/session";

type Tone = "neutral" | "ok" | "warn" | "risk";
type AdmonitionType = "note" | "tip" | "ok" | "warning" | "danger";
type ToneProps = { ok?: boolean; warn?: boolean; risk?: boolean };

function resolveTone(props: ToneProps): Tone {
  if (props.ok) return "ok";
  if (props.warn) return "warn";
  if (props.risk) return "risk";
  return "neutral";
}

function toneColor(tone: Tone) {
  if (tone === "ok") return "teal";
  if (tone === "warn") return "yellow";
  if (tone === "risk") return "red";
  return "blue";
}

function admonitionIcon(type: AdmonitionType) {
  if (type === "tip") return <Lightbulb size={14} />;
  if (type === "ok") return <CheckIcon size={14} />;
  if (type === "danger") return <ShieldAlert size={14} />;
  if (type === "warning") return <AlertTriangle size={14} />;
  return <Info size={14} />;
}

function admonitionCssType(type: AdmonitionType) {
  if (type === "ok" || type === "tip") return "ok";
  if (type === "warning") return "warn";
  if (type === "danger") return "risk";
  return "neutral";
}

function matchTag(el: unknown, tagName: string): boolean {
  if (!isValidElement(el)) return false;
  const t = (el as React.ReactElement).type;
  return t === tagName || (typeof t === "function" && ((t as { displayName?: string }).displayName === tagName || (t as { name?: string }).name === tagName));
}

function flattenP(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((c) => {
    if (isValidElement(c) && (c as React.ReactElement).type === "p") {
      return flattenP((c as React.ReactElement<{ children?: ReactNode }>).props.children);
    }
    return [c];
  });
}

function extractTag(children: ReactNode, tagName: string): { found: ReactNode | null; rest: ReactNode[] } {
  const arr = flattenP(children);
  const idx = arr.findIndex((c) => matchTag(c, tagName));
  if (idx === -1) return { found: null, rest: arr };
  return {
    found: (arr[idx] as React.ReactElement<{ children?: ReactNode }>).props.children,
    rest: arr.filter((_, i) => i !== idx)
  };
}

function extractChildProps<T>(children: ReactNode): T[] {
  return Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child as React.ReactElement).props as unknown as T);
}

// ---- Insight / Insights ----

export function Insight({ title, subtitle, badge, metric, children, ...toneProps }: {
  title?: string; subtitle?: string; badge?: string; metric?: boolean; children?: ReactNode;
} & ToneProps) {
  const { found: bTitle, rest: afterTitle } = extractTag(children, "b");
  const { found: smSub, rest } = extractTag(afterTitle, "small");
  const finalTitle = title ?? bTitle;
  const finalSub = subtitle ?? smSub;
  const tone = resolveTone(toneProps);

  if (metric) {
    const value = rest.filter((c) => typeof c === "string" || typeof c === "number").join("").trim();
    return (
      <MantineCard className={`metric-card metric-card-${tone}`} withBorder radius="md">
        {finalTitle ? <Text c="dimmed" fw={700} size="xs">{finalTitle}</Text> : null}
        <Text className="metric-value" fw={800}>{value}</Text>
        {finalSub ? <Text c="dimmed" size="xs">{finalSub}</Text> : null}
      </MantineCard>
    );
  }

  return (
    <MantineCard className={`mdxit-block data-card data-card-${tone}`} withBorder radius="md">
      {finalTitle || finalSub || badge ? (
        <Group align="flex-start" justify="space-between" mb="xs" wrap="nowrap">
          <Box>
            {finalTitle ? <Text fw={750} size="sm">{finalTitle}</Text> : null}
            {finalSub ? <Text c="dimmed" size="xs">{finalSub}</Text> : null}
          </Box>
          {badge ? <Badge color={toneColor(tone)} radius="sm" variant="light">{badge}</Badge> : null}
        </Group>
      ) : null}
      <Box className="data-card-body">{rest}</Box>
    </MantineCard>
  );
}

export function Insights({ columns = 3, children }: { columns?: 2 | 3 | 4; children?: ReactNode }) {
  return (
    <SimpleGrid className="mdxit-block" cols={{ base: 1, sm: 2, lg: columns }} spacing="sm">
      {children}
    </SimpleGrid>
  );
}

// ---- Grid / GridItem ----

export function Grid({
  columns = 2,
  children
}: {
  columns?: 2 | 3 | 4;
  children?: ReactNode;
}) {
  return (
    <SimpleGrid className="mdxit-block comparison-grid" cols={{ base: 1, sm: columns === 4 ? 2 : columns, lg: columns }} spacing="sm">
      {children}
    </SimpleGrid>
  );
}

export function GridItem({
  title,
  badge,
  children,
  ...toneProps
}: {
  title?: string;
  badge?: string;
  children?: ReactNode;
} & ToneProps) {
  const { found: bTitle, rest: afterTitle } = extractTag(children, "b");
  const finalTitle = title ?? bTitle;
  const tone = resolveTone(toneProps);

  return (
    <MantineCard className={`comparison-cell comparison-cell-${tone}`} withBorder radius="md">
      {finalTitle || badge ? (
        <Group align="flex-start" justify="space-between" mb="xs" wrap="nowrap">
          {finalTitle ? <Text fw={760} size="sm">{finalTitle}</Text> : <span />}
          {badge ? <Badge color={toneColor(tone)} radius="sm" variant="light">{badge}</Badge> : null}
        </Group>
      ) : null}
      <Box className="comparison-cell-body">{title ? children : afterTitle}</Box>
    </MantineCard>
  );
}

// ---- ProgressBar ----

export function ProgressBar({ label, value, children, ...toneProps }: { label?: string; value: number; children?: ReactNode } & ToneProps) {
  const { found: bLabel, rest } = extractTag(children, "b");
  const finalLabel = label ?? bLabel ?? "Progress";
  const tone = resolveTone(toneProps);

  return (
    <MantineCard className="mdxit-block progress-summary" withBorder radius="md">
      <Group justify="space-between" mb="xs">
        <Text fw={750} size="sm">{finalLabel}</Text>
        <Badge color={toneColor(tone)} variant="light">{value}%</Badge>
      </Group>
      <MantineProgress color={toneColor(tone)} radius="var(--radius)" size="md" value={value} />
      {rest.length ? <Text c="dimmed" mt="xs" size="sm" component="div">{rest}</Text> : null}
    </MantineCard>
  );
}

// ---- AskQuestion ----

export function AskQuestion({
  id,
  question,
  placeholder = "输入你的回答...",
  children
}: {
  id: string;
  question: string;
  placeholder?: string;
  children?: ReactNode;
}) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState("");

  const submit = () => {
    const trimmed = answer.trim();
    if (!trimmed) {
      return;
    }

    sendMdxitEvent({
      type: "question.answer",
      id,
      question,
      answer: trimmed,
      documentPath: getActiveDocumentPath()
    });
    setSubmitted(true);
    setSubmittedAt(new Date().toLocaleTimeString());
  };

  return (
    <MantineCard className="mdxit-block ask-question" withBorder radius="md">
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Box className="ask-question-icon">
          <MessageSquareText size={18} />
        </Box>
        <Box className="ask-question-body">
          <Text fw={780} size="sm">{question}</Text>
          {children ? <Box className="ask-question-context">{children}</Box> : null}
          <Textarea
            autosize
            className="ask-question-input"
            minRows={2}
            onChange={(event) => {
              setAnswer(event.currentTarget.value);
              setSubmitted(false);
              setSubmittedAt("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            value={answer}
          />
          <Group gap="xs" justify="space-between" mt="xs">
            <Text className={submitted ? "ask-question-sent" : ""} c={submitted ? "teal" : "dimmed"} size="xs">
              {submitted ? `已发送 ${submittedAt}` : "Enter 提交，Shift+Enter 换行"}
            </Text>
            <Button
              color={submitted ? "teal" : undefined}
              disabled={!answer.trim()}
              leftSection={submitted ? <CircleCheck size={14} /> : undefined}
              onClick={submit}
              size="compact-sm"
              variant={submitted ? "light" : "filled"}
            >
              {submitted ? "已发送" : "提交"}
            </Button>
          </Group>
        </Box>
      </Group>
    </MantineCard>
  );
}

// ---- Tabs / Tab ----

export function Tab(_props: { label?: string; children?: ReactNode }) {
  return null;
}

export function Tabs({ children }: { children?: ReactNode }) {
  const items = extractChildProps<{ label?: string; children?: ReactNode }>(children).map((item) => {
    const { found: bLabel, rest } = extractTag(item.children, "b");
    return { label: item.label ?? (typeof bLabel === "string" ? bLabel : "Tab"), children: item.label ? item.children : rest };
  });
  const defaultValue = items[0]?.label;

  return (
    <MantineTabs className="mdxit-block" defaultValue={defaultValue} keepMounted={false} variant="outline">
      <MantineTabs.List>
        {items.map((item) => <MantineTabs.Tab key={item.label} value={item.label}>{item.label}</MantineTabs.Tab>)}
      </MantineTabs.List>
      {items.map((item) => <MantineTabs.Panel key={item.label} pt="md" value={item.label}>{item.children}</MantineTabs.Panel>)}
    </MantineTabs>
  );
}

// ---- Steps / Step (vertical timeline + horizontal stepper) ----

export function Step(_props: { title?: string; children?: ReactNode }) {
  return null;
}

export function Steps({ horizontal, active, children }: { horizontal?: boolean; active?: number; children?: ReactNode }) {
  const items = extractChildProps<{ title?: string; children?: ReactNode }>(children).map((item) => {
    const { found: bTitle, rest } = extractTag(item.children, "b");
    return { title: item.title ?? (typeof bTitle === "string" ? bTitle : "Step"), detail: item.title ? item.children : rest };
  });

  if (horizontal) {
    return (
      <MantineStepper
        active={active ?? 0}
        allowNextStepsSelect={false}
        className="mdxit-block review-stepper"
        classNames={{ separator: "review-stepper-separator", stepBody: "review-stepper-step-body", stepDescription: "review-stepper-step-description", stepIcon: "review-stepper-step-icon", stepLabel: "review-stepper-step-label" }}
        color="var(--accent)" iconSize={30} size="sm"
      >
        {items.map((item) => <MantineStepper.Step key={item.title} label={item.title} description={item.detail ? <Text size="xs">{item.detail}</Text> : undefined} />)}
      </MantineStepper>
    );
  }

  return (
    <Timeline active={items.length - 1} bulletSize={18} className="step-list" lineWidth={2}>
      {items.map((item, index) => (
        <Timeline.Item bullet={index + 1} key={item.title} title={item.title}>
          {item.detail ? <Text c="dimmed" size="sm">{item.detail}</Text> : null}
        </Timeline.Item>
      ))}
    </Timeline>
  );
}

// ---- Admonition ----

export function Admonition({ type = "note", title, children }: { type?: AdmonitionType; title?: string; children: ReactNode }) {
  return (
    <Alert className={`mdxit-block review-alert review-alert-${admonitionCssType(type)}`}
      classNames={{ body: "review-alert-body", icon: "review-alert-icon", message: "review-alert-message", title: "review-alert-title", wrapper: "review-alert-wrapper" }}
      icon={admonitionIcon(type)} radius="md" title={title ?? type.toUpperCase()}
    >
      {children}
    </Alert>
  );
}

// ---- Fold ----

export function Fold({ title, children, open }: { title?: string; children?: ReactNode; open?: boolean }) {
  const { found: bTitle, rest } = extractTag(children, "b");
  const finalTitle = title ?? (typeof bTitle === "string" ? bTitle : "Details");
  return (
    <MantineAccordion className="mdxit-block section-accordion" defaultValue={open ? finalTitle : undefined} variant="separated">
      <MantineAccordion.Item value={finalTitle}>
        <MantineAccordion.Control><Text fw={640} size="sm">{finalTitle}</Text></MantineAccordion.Control>
        <MantineAccordion.Panel>{title ? children : rest}</MantineAccordion.Panel>
      </MantineAccordion.Item>
    </MantineAccordion>
  );
}

// ---- Mermaid ----

export function Mermaid({ chart }: { chart: string }) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: document.documentElement.dataset.theme === "ink" ? "dark" : "neutral" });
    mermaid.render(`mdxit-mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`, chart)
      .then((r) => { if (!cancelled) { setSvg(r.svg); setError(""); } })
      .catch((e: unknown) => { if (!cancelled) { setError(e instanceof Error ? e.message : String(e)); setSvg(""); } });
    return () => { cancelled = true; };
  }, [chart, reactId]);
  return (
    <MantineCard className="mdxit-block mermaid-block" withBorder radius="md">
      {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : null}
      {error ? <Code block>{error}</Code> : null}
    </MantineCard>
  );
}

// ---- Markdown overrides ----

export function MarkdownTable({ children }: { children: ReactNode }) {
  return <Table.ScrollContainer className="markdown-table" minWidth={560}><Table highlightOnHover striped withColumnBorders withTableBorder>{children}</Table></Table.ScrollContainer>;
}
export function MarkdownParagraph({ children }: { children: ReactNode }) {
  return <Text className="markdown-p" component="p">{children}</Text>;
}
export function MarkdownUl({ children }: { children: ReactNode }) {
  const isTaskList = hasTaskItem(children);
  return <List className={`markdown-list ${isTaskList ? "task-list" : ""}`} listStyleType={isTaskList ? "none" : undefined}>{children}</List>;
}
export function MarkdownOl({ children }: { children: ReactNode }) {
  return <List className="markdown-list" type="ordered">{children}</List>;
}
export function MarkdownLi({ children }: { children: ReactNode }) {
  const parsed = parseTaskListItem(children);
  if (parsed) {
    return (
      <List.Item className="task-list-item">
        <span className={`task-check ${parsed.checked ? "task-check-done" : ""}`}>{parsed.checked ? <CheckIcon size={14} /> : null}</span>
        <span className="task-label">{parsed.content}</span>
      </List.Item>
    );
  }
  return <List.Item>{children}</List.Item>;
}

function parseTaskListItem(children: ReactNode): { checked: boolean; content: ReactNode } | null {
  const arr = Children.toArray(children);
  if (!arr.length) return null;
  const first = arr[0];
  if (!isValidElement<{ type?: string; checked?: unknown }>(first) || first.props.type !== "checkbox") return null;
  return { checked: Boolean(first.props.checked), content: arr.slice(1) };
}

function hasTaskItem(children: ReactNode): boolean {
  return Children.toArray(children).some((c) => isValidElement<{ children?: ReactNode }>(c) && parseTaskListItem(c.props.children) !== null);
}

export function MarkdownA({ href, children }: { href?: string; children: ReactNode }) {
  return <Anchor href={href} target={href?.startsWith("http") ? "_blank" : undefined}>{children}</Anchor>;
}
export function MarkdownHr() { return <Divider className="markdown-hr" />; }
export function MarkdownThead({ children }: { children: ReactNode }) { return <Table.Thead>{children}</Table.Thead>; }
export function MarkdownTbody({ children }: { children: ReactNode }) { return <Table.Tbody>{children}</Table.Tbody>; }
export function MarkdownTr({ children }: { children: ReactNode }) { return <Table.Tr>{children}</Table.Tr>; }
export function MarkdownTh({ children }: { children: ReactNode }) { return <Table.Th>{children}</Table.Th>; }
export function MarkdownTd({ children }: { children: ReactNode }) { return <Table.Td>{children}</Table.Td>; }

// ---- Tree ----

type TreeDataNode = {
  label: string;
  value: string;
  comment?: string;
  children?: TreeDataNode[];
};

function isUList(el: unknown): el is React.ReactElement {
  if (!isValidElement(el)) return false;
  const t = (el as React.ReactElement).type;
  return t === "ul" || t === MarkdownUl;
}

function isLItem(el: unknown): el is React.ReactElement {
  if (!isValidElement(el)) return false;
  const t = (el as React.ReactElement).type;
  return t === "li" || t === MarkdownLi;
}

function extractTreeText(children: ReactNode): string {
  return Children.toArray(children)
    .filter((c) => !isValidElement(c) || (!isUList(c) && !isLItem(c) && !matchTag(c, "small")))
    .map((c) => {
      if (typeof c === "string" || typeof c === "number") return String(c);
      if (isValidElement(c)) {
        const el = c as React.ReactElement<{ children?: ReactNode }>;
        return extractTreeText(el.props.children);
      }
      return "";
    })
    .join("")
    .trim();
}

function extractComment(children: ReactNode): string {
  return Children.toArray(children)
    .filter((c) => isValidElement(c) && matchTag(c, "small"))
    .map((c) => extractTreeText((c as React.ReactElement<{ children?: ReactNode }>).props.children))
    .join(" ")
    .trim();
}

function extractSublist(children: ReactNode): React.ReactElement | null {
  const arr = Children.toArray(children);
  for (const c of arr) {
    if (isUList(c)) return c;
  }
  return null;
}

function parseTreeData(children: ReactNode, prefix = ""): TreeDataNode[] {
  const arr = Children.toArray(children);
  const result: TreeDataNode[] = [];
  for (const c of arr) {
    if (!isUList(c)) continue;
    const ul = c as React.ReactElement<{ children?: ReactNode }>;
    const ulChildren = Children.toArray(ul.props.children);
    for (const li of ulChildren) {
      if (!isLItem(li)) continue;
      const liEl = li as React.ReactElement<{ children?: ReactNode }>;
      const sublist = extractSublist(liEl.props.children);
      const label = extractTreeText(liEl.props.children);
      if (!label) continue;
      const comment = extractComment(liEl.props.children);
      const value = `${prefix}${label}`;
      result.push({
        label,
        value,
        comment: comment || undefined,
        children: sublist ? parseTreeData([sublist], `${value}/`) : undefined,
      });
    }
  }
  return result;
}

function renderTreeNode(payload: {
  node: { label: ReactNode; value: string; comment?: string; children?: TreeDataNode[] };
  expanded: boolean;
  hasChildren: boolean;
  elementProps: Record<string, unknown>;
}): ReactNode {
  const { node, elementProps } = payload;
  const label = typeof node.label === "string" ? node.label : "";

  return (
    <Group gap={4} py={2} wrap="nowrap" {...elementProps}>
      <Text size="sm">{label}</Text>
      {node.comment ? <Text c="dimmed" size="xs">{node.comment}</Text> : null}
    </Group>
  );
}

export function Tree({ children }: { children?: ReactNode }) {
  const data = parseTreeData(children);
  if (!data.length) return null;
  return (
    <MantineTree
      data={data as any}
      levelOffset="md"
      renderNode={renderTreeNode as any}
      withLines
    />
  );
}
