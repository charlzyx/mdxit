---
name: mdxit
description: 当用户要求输出 PRD、架构方案、QA 报告、迁移计划、决策记录、审查报告，或需要人工审查/交互预览的 agent 文档产物时使用。Markdown 优先，语义组件只用于提升信息密度；语法标准以 references/showcase.md 为准。
---

# MDXit

用语义组件提升 Markdown 的信息密度，不变成 HTML。普通 Markdown 能表达的内容不要改写成组件。

## 安装

Skill 自带运行时，无需额外 clone。

```bash
npx skills add charlzyx/mdxit
cd skills/mdxit/runtime
npm install && npm run build
```

预览文档：

```bash
node dist/cli/index.js preview <file-or-dir>
npm run dev                    # dev server + HMR
```

或运行 setup 脚本一键完成：

```bash
bash skills/mdxit/scripts/setup.sh
```

## /mdxit 命令

用户输入 `/mdxit <path>` 时，将 `<path>` 作为要预览的 MD/MDX 文件或文件夹：

```bash
MDXIT_FILE=<path> npm run dev
```

路径可以是文件或目录。默认预览该路径下的所有 `.md` / `.mdx` 文件，自动生成导航树。

## 先判断

使用 MDXit：

- 用户要 PRD、架构方案、QA 报告、迁移计划、决策记录、审查报告。
- 文档需要对比、指标、折叠、进度、步骤、图表等空间组织。
- 用户需要交互预览，让审查者回答问题或提交修改意见。

不要使用 MDXit：

- 随口问答、短说明、纯聊天回复。
- 用户明确要求纯 Markdown 或纯文本。
- 长期归档且不需要预览时，不要加 `AskQuestion`。

不确定是否启用交互时，先问：这个文档需要用户在预览页里回答问题或提交修改意见吗？

## 对存量 Markdown 的工作模式

用户给到已有 `.md` 文件需要增强时，有三种模式：

1. **原地修改**：直接修改当前 `.md` 文件，将内容调整为 MDXit 增强语法。适合用户明确表示"改这个文件"的场景。
2. **复制增强**：复制原文件为 `<原名>.review.md`，在新文件中调整语法，原文件不动。适合用户想保留原始版本、或需要对比的场景。
3. **询问选择**：用户未明确时，先列出两种模式让用户选。**默认推荐复制方式**。

无论哪种模式，只做以下增强：
- 多段对比 → `<Grid>` / `[!Grid 2]`
- 指标数字 → `<Insight metric>`
- 进度/阶段 → `<ProgressBar>` / `<Steps>`
- 选项切换 → `<Tabs>`
- 详细展开 → `<Fold>`
- 文件清单 → `<Tree>`
- 需要确认的结论 → `<AskQuestion>`
- 风险/警告文本 → `[!NOTE/TIP/OK/WARNING/DANGER]`

不改动原文的事实性内容，不添加原文没有的信息。

## 写作原则

1. 正文、列表、表格、引用、代码块、task list 用标准 Markdown，组件只做空间组织。
2. `<b>` = 标题，`<small>` = 补充信息，children = 正文。
3. 状态用 `ok` / `warn` / `risk` 属性，对应绿/黄/红色调。
4. 块级增强使用独立标记行：`[!Steps]`、`[!Grid 2]`、`[!Table chart=bar]`。
5. 不改动原文事实，不添加原文没有的信息。
6. 用户用中文时文档也用中文。

## 语法速查

详细语法、场景和组合示例见 `references/showcase.md`——**增强前必须先读**。

| 组件 | 写法 | 用途 |
|------|------|------|
| `[!Grid 2]` + 标准列表 / `<Grid>` | 块级标记或 XML 标签 | 多栏对比、方案评估 |
| `<Insight ok badge="..">` | `<b>`标题 + `<small>`副题 | 决策卡、风险卡、指标卡 |
| `<ProgressBar value={72} ok>` | `<b>`标题 + 描述文本 | 进度百分比 |
| `<Steps active={2}>` + `<Step>` | 水平或垂直步骤 | 阶段、时间线、里程碑 |
| `<Tabs>` + `<Tab label="A">` | 每个 Tab 内放内容 | 多方案/多视图切换 |
| `<Fold>` + `<b>`标题 | 折叠内容 | 详情、堆栈、长文本 |
| `<Tree><ul><li>` + `<small>` | 原生列表语法 | 文件树、目录结构 |
| `<AskQuestion id="x" question="..">` | 描述作为 children | 收集审查者反馈 |
| `>[!NOTE\|TIP\|OK\|WARNING\|DANGER]` | blockquote | 提示、警告、状态 |
| ` ```mermaid` / ` ```chart \| bar` | fenced code block | 流程图、柱状/折线/饼图 |

## 交互事件

`mdxit preview` 启动后会监听页面交互，写入：

```text
.mdxit/session/events.jsonl
```

事件类型：

- `question.answer` — AskQuestion 的用户回答
- `selection.feedback` — 用户选中文字后提交的修改意见
- `selection.copy` — 用户通过浮层复制文本

agent 不会天然订阅这个文件。交互式预览要生效时，agent 或外层 wrapper 必须监听
`.mdxit/session/events.jsonl` 的新增行（`fs.watch`、轮询 size/mtime、或 `tail -f`）。

处理流程：

1. 监听 events.jsonl 新增行。
2. 只处理当前 session 的新事件，记录最后读取的行号或 `receivedAt`。
3. 根据 `question.answer` 或 `selection.feedback` 修改对应 `.md` / `.mdx` 源文档。
4. Vite HMR 自动刷新预览。

不要把监听逻辑做进组件；组件只发送事件。处理事件时优先做小范围文档修改。

## 定制目录

项目级：`.mdxit/` — session 事件、项目定制组件、主题。是否提交 Git 由项目决定。

全局：`~/.config/mdxit/` — 跨项目共享的组件和主题。

运行时自动加载路径：

- `.mdxit/components/`（项目级，覆盖 `src/mdxit/components/`）
- `src/mdxit/components/`（源码级）
- `.mdxit/themes/`（项目级，覆盖 `src/mdxit/themes/`）
- `src/mdxit/themes/`（源码级）

每个 `*.tsx` / `*.jsx` 文件自动注册。导出 `mdxitName` 指定标签名，否则取文件名。

```tsx
// .mdxit/components/RiskMatrix.tsx
export const mdxitName = "RiskMatrix";
export default function RiskMatrix({ items }) {
  return <section>{/* 项目专属审查交互 */}</section>;
}
```

自定义组件规则：

- 只在现有组件表达不了业务结构时添加。
- 优先写到 `.mdxit/components/`，不要修改 runtime 或内置 primitives。
- props 保持简单，适合 agent 生成和人类阅读。
- 不要为了普通排版创建组件。

## 预览

```bash
npm run dev                                          # dev server + HMR
node dist/cli/index.js preview examples              # 预览目录
node dist/cli/index.js preview docs/proposal.md      # 预览单文件
```

测试交互：

1. 在 `AskQuestion` 中输入回答，Enter 提交，Shift+Enter 换行。
2. 选中正文文字，点击浮层"修改意见"，输入反馈后提交。
3. 查看 `.mdxit/session/events.jsonl` 确认事件写入。
