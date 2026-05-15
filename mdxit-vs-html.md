# MDXit vs HTML：Markdown 还没被淘汰

Thariq 写了一篇[《HTML 的惊人有效性》](https://x.com/trq212/status/2017024445244924382)，论证 Agent 输出 HTML 全面优于 Markdown。论点很直白——Markdown 太线性、不好读、不能交互、没法画图。

他用 HTML 解决的都是真问题。但**问题出在渲染层，不是 Markdown 语法本身**。把整个格式换成 HTML，代价太高。MDXit 走了另一条路。

## HTML 派的核心论点，逐个看

### "超过 100 行的 Markdown 我读不下去"

这是**渲染问题**，不是格式问题。标准 Markdown 预览把两万字的方案渲染成一长条——谁看完算谁赢。但同样两万字用 `<Grid>` 分栏、用 `<Fold>` 折叠细节、用 `<Insight>` 高亮关键数字，阅读体验和 HTML 没有本质差距。

信息密度不靠换格式，靠**空间组织**。左栏放结论，右栏放证据；上面是进度条，下面折叠源码。这些 MDXit 全能做到，源文件还是 Markdown。

### "HTML 能画图、能用颜色、能做表格"

表格和颜色 Markdown 原生就有。图表——MDXit 走 fence language 路线（类别 4），用 ````chart | bar` 和 ````mermaid` 渲染柱状图、流程图。数据存在代码块里，没有渲染器时退化为普通代码块，不丢信息。

ASCII 图的原始形式确实粗糙，但解决方案是在 Markdown 上加图表组件，不是把整个文档都变成 HTML。

### "HTML 可以交互"

MDXit 的 `<AskQuestion>` 和选区反馈就是交互——审查者在预览页回答问题或选中文字提交修改意见，事件写入 `.mdxit/session/events.jsonl`，agent 监听后修改源文档，HMR 自动刷新。

区别在哪：HTML 的交互绑在文档本体上，改一次就要重写整个 HTML。MDXit 的交互和内容分离——源文件是纯 Markdown，交互事件是附加流。内容归内容，反馈归反馈。

### "HTML 容易分享——上传 S3 发个链接就行"

需要 S3 这一步就已经输了。Markdown 天生的主场包括：GitHub 直接渲染、Notion/Obsidian/飞书原生支持、任何 Git 平台自动 diff、邮件/IM 粘贴即读。

MDXit 的预览是运行时渲染，不改变源文件。分享源码走 GitHub，分享预览走 dev server 或部署静态站点。不需要把内容锁定在 HTML 里才能给人看。

## HTML 真正的代价

### Git diff 不可读

Thariq 自己也承认了——"HTML diffs are noisy and hard to review"。Agent 生成的文档是活的，需要迭代、审查、合并。HTML diff 噪声大到人基本没法读，Markdown diff 是结构化的、可 grep 的、可 review 的。

把文档从 Markdown 换成 HTML，等于用**当下好看**换走**长期可维护**。

### Agent 可读性退化

你让 agent 读一个 HTML 文档推断内容结构，它要解析 DOM、去标签、猜测语义。Markdown 本身就是结构化的——标题是 `##`，列表是 `-`，代码是 ` ``` `。Agent 读 Markdown 比读 HTML 准确、快速、省 token。

**Markdown 是 agent 和人之间的中间语言**。它首先为 agent 结构化，然后才为人渲染。HTML 反过来——优先人眼，agent 要绕路。

### Token 成本是迭代税

Thariq 承认 HTML 生成时间是 Markdown 的 2-4 倍，但说大窗口下无所谓。这忽略了**迭代场景**——文档不会只生成一次。改一个数字、补一个段落、调整布局：每轮 Agent 都要重新序列化、用户审查、再修改。2-4x 的 token 成本在单次看来小，在多轮迭代中是指数级放大的。

### HTML 是封闭终点，Markdown 是开放中间态

HTML 定位是"最终产物"——渲染给人看的终点。Markdown 定位是"中间态"——随时可以编辑、diff、再生成、再渲染。Agent 工作流里绝大部分文档都不是终点，是中间环节。用封闭格式承载开放流程，天然错配。

## MDXit 的立场

MDXit 不反对 HTML 能做的事——它只是在 Markdown 里做到了同样的信息密度，同时保住了 Markdown 的结构优势。

| 维度 | HTML 方案 | MDXit 方案 |
|------|----------|-----------|
| 信息密度 | 完全自由 | 语义组件提升，不换格式 |
| Agent 可读性 | 需解析 DOM | 原生结构化文本 |
| Git diff | 噪声大，不可 review | 可读、可 grep、可 review |
| 退化行为 | 无渲染器也能读 | XML 标签在标准预览下不渲染但内容可见；fence language 全兼容 |
| 迭代成本 | 每轮 2-4x token | 标准 Markdown 增量 |
| 分享 | 需 S3 或本地打开 | GitHub / Notion / Obsidian 原生 |
| 交互 | 内嵌 JS | 事件流分离，内容不改 |

**结论不是什么胜过什么，而是什么场景用什么。** HTML 适合最终展示物——发布会 demo、一次性报告、交互原型。Markdown + 语义增强适合需要迭代、审查、diff、多人协作的文档。Agent 的日常产出来说，后者才是主战场。

HTML 能解决"今天好看"的问题。但要解决"A 改了三个指标 B 补了两段分析——合并一下"，你得靠 Markdown。
