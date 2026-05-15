---
id: mdxit-events
title: 交互事件处理
kind: reference
description: mdxit preview 产生的事件格式与 agent 处理流程。
---

# 交互事件处理

`mdxit preview` 启动后，页面交互写入：

```text
.mdxit/session/events.jsonl
```

## 事件类型

- `question.answer` — AskQuestion 的用户回答
- `selection.feedback` — 用户选中文字后提交的修改意见
- `selection.copy` — 用户通过浮层复制文本

## Agent 处理流程

agent 不会天然订阅这个文件。交互式预览要生效时，agent 或外层 wrapper 必须监听 `.mdxit/session/events.jsonl` 的新增行（`fs.watch`、轮询 size/mtime、或 `tail -f`）。

1. 监听 events.jsonl 新增行。
2. 只处理当前 session 的新事件，记录最后读取的行号或 `receivedAt`。
3. 根据 `question.answer` 或 `selection.feedback` 修改对应 `.md` / `.mdx` 源文档。
4. Vite HMR 自动刷新预览。

不要把监听逻辑做进组件；组件只发送事件。处理事件时优先做小范围文档修改。
