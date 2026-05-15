import { ActionIcon, Button, Group, Paper, Textarea, Tooltip } from "@mantine/core";
import { Check, Copy, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveDocumentPath, sendMdxitEvent } from "./session";

type SelectionState = {
  text: string;
  x: number;
  y: number;
  heading?: string;
  contextBefore?: string;
  contextAfter?: string;
};

export function SelectionToolbar() {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const update = () => {
      const current = window.getSelection();
      const text = current?.toString().trim() ?? "";
      if (!current || !text || current.rangeCount === 0) {
        if (!commenting) {
          setSelection(null);
        }
        return;
      }

      const range = current.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const stage = document.querySelector(".document-stage");
      const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as Element);
      if (!stage || !parent || !stage.contains(parent)) {
        return;
      }

      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) {
        return;
      }

      const stageText = stage.textContent ?? "";
      const index = stageText.indexOf(text);
      const heading = findNearestHeading(parent);
      setSelection({
        text,
        x: rect.left + rect.width / 2,
        y: Math.max(68, rect.top - 10),
        heading,
        contextBefore: index > -1 ? stageText.slice(Math.max(0, index - 120), index).trim() : undefined,
        contextAfter: index > -1 ? stageText.slice(index + text.length, index + text.length + 120).trim() : undefined
      });
    };

    document.addEventListener("selectionchange", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      document.removeEventListener("selectionchange", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [commenting]);

  if (!selection) {
    return null;
  }

  const close = () => {
    setSelection(null);
    setCommenting(false);
    setComment("");
    window.getSelection()?.removeAllRanges();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(selection.text);
    sendMdxitEvent({
      type: "selection.copy",
      selectedText: selection.text,
      documentPath: getActiveDocumentPath(),
      heading: selection.heading
    });
    close();
  };

  const submit = () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      return;
    }

    sendMdxitEvent({
      type: "selection.feedback",
      selectedText: selection.text,
      comment: trimmed,
      documentPath: getActiveDocumentPath(),
      heading: selection.heading,
      contextBefore: selection.contextBefore,
      contextAfter: selection.contextAfter
    });
    close();
  };

  return (
    <Paper
      className={`selection-toolbar ${commenting ? "selection-toolbar-open" : ""}`}
      shadow="lg"
      style={{ left: selection.x, top: selection.y }}
      withBorder
    >
      {commenting ? (
        <>
          <Textarea
            autosize
            autoFocus
            className="selection-comment-input"
            minRows={2}
            onChange={(event) => setComment(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="输入修改意见..."
            value={comment}
          />
          <Group gap={6} justify="flex-end" mt={6}>
            <Tooltip label="取消">
              <ActionIcon aria-label="取消" onClick={close} size="sm" variant="subtle">
                <X size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="提交意见">
              <ActionIcon aria-label="提交意见" disabled={!comment.trim()} onClick={submit} size="sm">
                <Check size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </>
      ) : (
        <Group gap={4} wrap="nowrap">
          <Tooltip label="复制">
            <ActionIcon aria-label="复制选中内容" onClick={copy} size="sm" variant="subtle">
              <Copy size={14} />
            </ActionIcon>
          </Tooltip>
          <Button
            leftSection={<MessageSquare size={14} />}
            onClick={() => setCommenting(true)}
            size="compact-xs"
            variant="subtle"
          >
            修改意见
          </Button>
          <Tooltip label="关闭">
            <ActionIcon aria-label="关闭" onClick={close} size="sm" variant="subtle">
              <X size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </Paper>
  );
}

function findNearestHeading(element: Element) {
  let cursor: Element | null = element;
  while (cursor && !cursor.matches?.("[data-toc-id]")) {
    let previous = cursor.previousElementSibling;
    while (previous) {
      if (previous.matches("[data-toc-id]")) {
        return previous.textContent?.trim();
      }
      const nested = previous.querySelector?.("[data-toc-id]");
      if (nested) {
        return nested.textContent?.trim();
      }
      previous = previous.previousElementSibling;
    }
    cursor = cursor.parentElement;
  }

  return cursor?.textContent?.trim();
}
