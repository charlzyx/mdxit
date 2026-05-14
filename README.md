# MDXit

用语义组件提升 Markdown 的信息密度，不增加复杂度。

[Thariq 最近写了一篇文章](https://x.com/trq212/status/2052809885763747935)，
论证 agent 应该输出 HTML 而非 Markdown——HTML 信息密度更高、视觉更好、可交互。
但他也承认了代价：HTML diff 嘈杂、token 消耗大、agent 改动成本高。

MDXit 走另一条路：保留 Markdown 的文本优势，只补它缺的东西——**空间组织**。
Grid 把单列变多列，指标卡把数字抬高，折叠把细节收起。对 agent 来说仍是结构化文本，
对人来说不再是几百行线性滚动。

`skills/mdxit/references/showcase.md` 是唯一语法标准。

## 思路

```
Markdown 文本优势（diff、grep、编辑）
         +
语义组件的空间组织（Grid、卡片、折叠、Tab）
         =
一份文档，agent 当文本读写，人当界面浏览
```

不替代 Markdown，不变成 HTML。在文本上面加一层空间组织。

## 安装

### 1. 安装 Skill（给 agent 用）

```bash
npx skills add charlzyx/mdxit
```

### 2. 安装运行时（渲染预览需要）

```bash
git clone https://github.com/charlzyx/mdxit.git && cd mdxit
npm install && npm run build
```

或直接用项目里的 setup 脚本：

```bash
bash skills/mdxit/scripts/setup.sh
```

### 3. 预览

```bash
node dist/cli/index.js preview examples          # 预览目录
node dist/cli/index.js preview docs/proposal.md  # 预览单文件
npm run dev                                       # dev server + HMR
```

`preview` 接受单个 `.md` / `.mdx` 文件或目录。

## 怎么提升密度

**指标卡**：4 行文字 → 4 个并排卡片。

```mdx
<Insights columns={4}>
  <Insight metric ok><b>可用性</b>99.95%</Insight>
  <Insight metric warn><b>错误率</b>0.12%</Insight>
</Insights>
```

**Grid 对比**：长篇描述 → 横排方案对比。

```mdx
<Insights columns={2}>
  <Insight ok badge="推荐"><b>模块化单体</b></Insight>
  <Insight warn badge="备选"><b>微服务</b></Insight>
</Insights>
```

**折叠**、**Tab**、**Steps**、**ProgressBar** —— 都是把线性文本压进空间结构。
组件对 agent 来说语义比纯文本更精确（`<Insight risk>` 比"此处有风险"明确），
没有信息折损。

## 工作台

三栏预览：文档树 | 渲染区 | 自动 TOC。
内置 Mermaid、Shiki 高亮、Diff 着色、task list、`[!NOTE]` 提示块。
双主题，`.mdxit/themes/*.json` 自定义。

**交互**：`<AskQuestion>` 和选区反馈写入 `.mdxit/session/events.jsonl`，
agent 读取事件、改文档、HMR 刷新——协作闭环不离开文件系统。

## 自定义

`.mdxit/components/`（项目）或 `~/.config/mdxit/components/`（全局），
`import.meta.glob` 自动注册。

## 路线图

全局 CLI、静态 HTML 导出、更多交互组件。
