---
name: mdxit
description: 当用户要求输出 PRD、架构方案、QA 报告、迁移计划、技术决策记录、上线周报、审查报告，或任何需要人工审查/交互预览的 agent 文档产物时使用。也适用于"帮我整理一份方案"、"做个设计文档"、"写个技术方案"等场景。Markdown 优先，语义组件只用于提升信息密度。
---

# MDXit

用语义组件提升 Markdown 的信息密度，不变成 HTML。普通 Markdown 能表达的内容不要改写成组件。

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

## MDX 结构安全规则

MDX 组件标签会被 Markdown 列表缩进规则影响。生成或改写 `.md` / `.mdx` 时必须遵守：

1. 块级 XML 组件标签必须从行首开始，不要为了嵌套美观缩进。适用于 `<Tabs>`、`<Tab>`、`<Grid>`、`<Insight>`、`<Fold>`、`<Steps>`、`<Step>`、`<Tree>`、`<AskQuestion>` 等块级标签。
2. 如果组件内容以列表、表格、引用或代码块结束，闭合标签前后都保留一个空行，并且闭合标签仍然顶格写。
3. 不要把块级组件放进 Markdown 列表项里。需要在 Tab/Grid 中表达列表时，把列表写在组件内部，组件标签顶格。
4. 写完后自检：不存在形如 `  </Tab>`、`  <Tab ...>` 的缩进块级标签；否则 MDX 可能报 `Expected the closing tag ... after the end of listItem`。

Tabs 推荐写法：

```mdx
<Tabs>
<Tab label="方案 A">

- 第一条
- 第二条

</Tab>
<Tab label="方案 B">

正文或列表。

</Tab>
</Tabs>
```

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

用户在预览页回答 `AskQuestion` 或提交选中文字的修改意见后，事件写入 `.mdxit/session/events.jsonl`。需要处理这些事件时，读取 `references/events.md`。

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

## 安装

Skill 自带运行时，无需额外 clone。

```bash
npx skills add charlzyx/mdxit
cd skills/mdxit/runtime
npm install && npm run build
```

或运行 setup 脚本一键完成：

```bash
bash skills/mdxit/scripts/setup.sh
```
