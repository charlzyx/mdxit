# MDXit

用语义组件提升 Markdown 的信息密度。Grid 多栏、Insight 指标卡、Fold 折叠、Steps 时间线——对 agent 仍是结构化文本，对人不再是线性滚动。

## 设计思路

设计约束：**保留 Markdown 语义不丢失、语法复杂度不增加、预览信息密度提升。**

所有增强按"是否改变 DOM 结构"分为三层：

### 第 1 层：CSS 样式增强

只改视觉，不改 DOM。标准 Markdown 元素自动获得更好的渲染。

- task list 美化、表格斑马纹、callout 图标和颜色
- 工具：`<style>` 注入
- 退化：✅ 完美——任何 Markdown 环境都能正常渲染
- 适用：`> [!NOTE/TIP/OK/WARNING/DANGER]` callout、GFM 表格

### 第 2 层：Callout 块级增强

`[!Steps]` / `[!Grid]` / `[!Table chart=bar]` —— 独立标记行声明下一个块的渲染模式。语法上仍是普通文本标记，渲染时由 runtime 接管紧随其后的块级元素。

```mdx
[!Steps]

1. **需求锁定** 对齐边界
2. **技术方案** 输出架构
3. **开发实现** 按模块拆分
```

匹配规则：标记行 + 紧随的 Markdown 块。匹配失败时回退为普通 blockquote。

- 工具：Vite/MDX 预处理 + `SemanticRenderScope`
- 退化：标记行在纯文本下可读（`[!Steps]`），内容不丢失
- 适用：有序列表→Steps、task list→Checks、嵌套列表→横向 Grid cards、表格→增强表格/图表

### 第 3 层：XML 标签

`<Grid>` `<Insight>` `<Fold>` `<Steps>` `<Tabs>` `<ProgressBar>` `<Tree>` `<AskQuestion>` —— 所有组件统一使用 XML 标签包裹 Markdown 内容。属性显式、嵌套无歧义，是 agent 生成文档的精确模式。

```mdx
<Insight ok badge="已批准">
  <b>核心决策</b>
  <small>Q4 技术选型</small>
  选择 PostgreSQL + Redis 组合。
</Insight>
```

- 工具：MDX 组件解析
- 退化：未知 XML 标签在标准预览下不渲染，内容可见
- 适用：所有需要精确控制属性、多层嵌套的场景

### 标签 vs Callout

| | XML 标签 | Callout 块级标记 |
|---|---|---|
| 精确度 | 高——属性显式挂载 | 中——依赖匹配规则 |
| 嵌套 | 原生支持 | 不适合嵌套 |
| 退化 | 标签不可见，内容安全 | 标记行可读为提示文字 |
| 作者体验 | agent 首选 | 人手写更自然 |

两条路径在 parser 里汇合到同一组件，出口一致。选哪个看场景——需要精确用标签，追求简洁用 callout。

### 选择原则

| 场景 | 推荐写法 |
|------|----------|
| 提醒/警告 | `> [!NOTE/TIP/OK/WARNING/DANGER]` |
| 步骤列表 | `<Steps>` 或 `[!Steps]` |
| 横向卡片列表 | `<Grid>` 或 `[!Grid 2]` |
| 增强表格 | `[!Table]` / `[!Table chart=bar]` |
| 容器/布局（多栏、网格） | `<Grid>` `<GridItem>` |
| 指标卡、决策卡 | `<Insight>` `<Insights>` |
| 折叠细节 | `<Fold>` |
| 多方案切换 | `<Tabs>` `<Tab>` |
| 进度条 | `<ProgressBar>` |
| 审查反馈 | `<AskQuestion>` |
| 图表 | ` ```chart \| type` ` ```mermaid` |

## 安装

```bash
npx skills add charlzyx/mdxit
bash skills/mdxit/scripts/setup.sh
```

Agent 安装 skill 后会自动引导用户执行 setup。运行时（src、Vite、React）已打包在 skill 目录内，无需额外 clone。

## 预览

```bash
cd skills/mdxit/runtime
npm run dev                     # HMR 实时刷新
node dist/cli/index.js preview <path>
```

## 技能说明

语法标准：`skills/mdxit/references/showcase.md`

Skill 触发场景：PRD、架构方案、QA 报告、迁移计划、决策记录、审查报告。
