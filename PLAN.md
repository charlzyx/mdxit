# MDXit 演进规划

基于设计约束：**保留 Markdown 语义、不增加语法复杂度、提升预览信息密度。**

---

## 当前状态

- `showtime.md` / `mdxit.md` 已恢复到期望版本。
- `skills/mdxit/runtime` 已回补：`[!Steps]` / `[!Grid]` / `[!Table chart=bar]` 的语义落点、`chart` fence、history 路由。
- 主目录调整为 `skills/mdxit`，旧 `.agents` / `.claude` 入口已删除。
- 这次优先修代码，不再继续改文档语义定义。

---

## 已完成

- [x] 语法收敛：`:::` 全面删除，统一为 XML 标签 + Callout 两条路径
- [x] 三层设计模型写入 README 和 SKILL.md（CSS / Callout / XML 标签）
- [x] 反驳文 `mdxit-vs-html.md`
- [x] Callout 块级增强：`[!Steps]` / `[!Grid 2]` / `[!Table chart=bar]`

---

## Phase 1：能力补齐（工程化基础）

### 1.1 `mdxit build` — 静态导出

```bash
mdxit build <file-or-dir> -o dist/
```

产出可分享的独立 HTML 文件。源文件 Markdown 不变，git diff 可读。

**子任务：**
- [ ] Vite SSG 或自定义构建脚本，将 MD/MDX 渲染为静态 HTML
- [ ] `<script>` 去除交互组件（AskQuestion 转静态占位，SelectionToolbar 移除）
- [ ] 多文档目录输出为 index + 分页 HTML，导航树保留
- [ ] 主题注入到静态 HTML，无需 JS 运行时

### 1.2 相对路径图片处理

`![alt](./images/diagram.png)` 在 build 和 dev 下都能正确渲染。

**子任务：**
- [ ] Dev server：扫描 MD/MDX 中的 `![alt](path)` 模式，加入 Vite 静态资源依赖
- [ ] Build：小图（< 50KB，icon/badge 级）→ base64 内联
- [ ] Build：大图 → 复制到 `dist/` 保持相对目录结构，或统一进 `dist/assets/`
- [ ] 可配置阈值和内联策略（`.mdxit/config.toml` 或 frontmatter）

### 1.3 `mdxit strip` — 退化工具

```bash
mdxit strip <file> -o stripped.md
```

将 MDXit 增强 Markdown 转回纯标准 Markdown。

**子任务：**
- [ ] `<Insight ok badge="已批准">…</Insight>` → `> [!OK] 已批准：…`
- [ ] `<Grid>` `<GridItem>` → 序列化为分隔的小标题 + 引用块
- [ ] `<Fold>` → 展开内容 + 标题作为 `###` 标题
- [ ] `<Steps>` `<Step>` → 有序列表
- [ ] `<Tabs>` → 每个 Tab 转为一节 `##` 标题
- [ ] `<ProgressBar>` → 文字描述 "进度：72% — 18/25 个任务已完成"
- [ ] `<AskQuestion>` → `> **待确认**：问题内容`
- [ ] `<Tree>` → 缩进列表

---

## Phase 2：信息密度提升（语法扩展）

### 2.1 Fence Language 类型扩展

标准 Markdown 语法，退化零损失。每个新类型只需在 `CodeBlock.tsx` 加一个分支。

- [ ] ` ```sql SELECT ...` → 渲染为表格（自动检测列名）
- [ ] ` ```csv …` / ` ```csv-table` → 渲染为表格
- [ ] ` ```dot digraph { … }` → Graphviz 渲染有向图
- [ ] ` ```katex E = mc^2` → KaTeX 渲染公式
- [ ] ` ```vega …` → Vega-Lite 声明式图表

### 2.3 Auto-Insight 检测（Layer 1 智能升级）

不改 Markdown 语法，渲染层自动识别正文中的"数字 + 标签"模式。

```
原文：P99 延迟 145ms，目标 200ms。错误率 0.12%。
                          ↓ 渲染层
P99 延迟 [145ms ✓] 目标 200ms。错误率 [0.12% ⚠️]。
```

识别规则：`数值` + `单位`（ms、%、次）在短句中出现。高亮为微型 metric 徽章，hover 显示上下文。

---

## Phase 3：信息架构增强

### 3.1 渐进式信息披露

同一文档三个视图：

| 视图 | 内容 | 适用场景 |
|------|------|---------|
| 摘要 | Insights + ProgressBar + Callout | 快速扫描 |
| 审查 | 全内容 + AskQuestion + 选区反馈 | 深度审查 |
| 源码 | 原始 Markdown | 编辑/对比 |

渲染层控制，不改变源文件。工具栏一行切换按钮。

### 3.2 Diff 感知渲染

当 MDXit 文档在 git diff 中被查看时，渲染层高亮变更：

```
<Insight metric ok><b>P99 延迟</b>145ms → 152ms</Insight>
                                              ↑ 变更高亮
```

- [ ] 读取 git diff 内容 → 解析组件属性变更
- [ ] 数字变化：旧值/新值并排显示 + 趋势箭头
- [ ] 新增/删除块：卡片增加 `added` / `removed` 视觉标记

### 3.3 跨文档内联预览

文档 A 引用文档 B 时，hover 展开内联卡片显示 B 的摘要。

```md
详见 [技术方案](./tech-design.md) 的部署章节。
     ↑ hover → 卡片预览：标题 + Insights + ProgressBar
```

- [ ] 解析跨文档链接 → 预加载目标文档 frontmatter + Insights + ProgressBar
- [ ] Hover 浮层渲染摘要卡片
- [ ] 对 build 输出：静态模式下预计算，内联嵌入摘要

---

## Phase 4：运行时体验

### 4.1 移动端自适应

- [ ] Grid 在窄屏（< 768px）自动从多栏折叠为垂直堆叠
- [ ] Insight 卡片在移动端去掉 Badge 侧标签，信息单列
- [ ] Steps horizontal 在移动端降级为 vertical timeline
- [ ] Tabs 在移动端可选下拉选择替代水平 tab 栏

### 4.2 事件通路统一

- [ ] `events.jsonl` 作为事件主通路，`fs.watch` 为默认监听方式
- [ ] WebSocket 降级为"可用则用"的加速层，不依赖额外进程
- [ ] CLI 输出的 session ID 和 events 路径写入 `.mdxit/session/.active`

### 4.3 主题系统完善

- [ ] 主题变量从 tokens JSON 注入 CSS custom properties，组件直接使用 `var(--x)`
- [ ] 内建 3 个主题：light（阅读）、dark（暗色）、print（打印/黑白）
- [ ] 项目级 `.mdxit/themes/` 加载和热切换

---

## 不做的事项（划定边界）

- **不做在线协作**：MDXit 是本地预览 + 静态导出工具，不引入 WebSocket 多客户端同步
- **不做 WYSIWYG 编辑器**：Markdown 源文件是唯一真相，预览是只读渲染
- **不做自定义 block 语法**：不发明 `:::` 替代品，XML 标签 + Callout 够用
- **不做 MDX 以外的新格式**：不引入 `.mdxit` 文件扩展名，`.md` / `.mdx` 就是源文件后缀
- **不做组件市场**：项目级自定义组件通过 `.mdxit/components/` 目录，不提供中央注册/发现
