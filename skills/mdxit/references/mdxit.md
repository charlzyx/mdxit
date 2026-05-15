---
id: mdxit-capability
title: MDXit
group: Capability
description: MDXit 能力演示——同一份源文件，三栏布局 + 指标卡 + 折叠 + 时间线 + 图表。
---

# MDXit

**用语义组件提升 Markdown 的信息密度，不变成 HTML。** 对 agent 仍是结构化文本，对人不再是线性滚动。

---

## 能力一览

<Insights columns={4}>
  <Insight metric ok><b>XML 标签</b><small>主力语法</small>9+</Insight>
  <Insight metric ok><b>Callout 增强</b><small>块级标记</small>7</Insight>
  <Insight metric ok><b>Fence Language</b><small>图表/代码</small>5</Insight>
  <Insight metric ok><b>预览主题</b><small>可扩展</small>3</Insight>
</Insights>

---

## 设计约束

<Grid columns={2}>
<GridItem ok badge="原则 1">
<b>Markdown 语义不丢失</b>

源文件是标准 Markdown。XML 标签在无渲染器环境下不可见，内容安全。Fence Language 退化为普通代码块。

</GridItem>
<GridItem ok badge="原则 2">
<b>语法复杂度不增加</b>

两条语法路径：XML 标签（精确模式）+ 标记行便捷写法（`> [!NOTE]` / `[!Steps]`）。不发明新 block 语法。

</GridItem>
<GridItem ok badge="原则 3">
<b>预览信息密度提升</b>

多栏布局、指标卡片、折叠详情、时间线步骤——空间组织代替线性滚动。同一屏信息量 3x。

</GridItem>
<GridItem ok badge="原则 4">
<b>Agent 可读性优先</b>

`<Insight metric ok>` 比 `<div class="metric-card green">` 更省 token、更结构化的语义。Agent 生成和解析成本低。

</GridItem>
</Grid>

---

## 语法路径

> [!NOTE]
> **两条路径，出口一致。** 需要精确控制属性或多层嵌套 → XML 标签。追求简洁、人手写 → Callout。

### 决策卡与指标

<Insights columns={3}>
  <Insight ok badge="已批准">
    <b>核心决策</b>
    <small>Q4 技术选型</small>
    选择 PostgreSQL + Redis 组合。
  </Insight>
  <Insight risk badge="高风险">
    <b>数据迁移</b>
    <small>1.2 亿条记录</small>
    需分批迁移，灰度验证。
  </Insight>
  <Insight warn badge="待完善">
    <b>监控告警</b>
    <small>覆盖率 60%</small>
    支付链路阈值未配置。
  </Insight>
</Insights>

<Insights columns={4}>
  <Insight metric ok><b>API 可用性</b><small>过去 30 天</small>99.95%</Insight>
  <Insight metric ok><b>P99 延迟</b><small>目标 200ms</small>145ms</Insight>
  <Insight metric warn><b>错误率</b><small>超时为主</small>0.12%</Insight>
  <Insight metric risk><b>待修 Bug</b><small>2 个 P0</small>7</Insight>
</Insights>

<Fold>
  <b>XML 标签写法</b>

```mdx
<Insights columns={4}>
  <Insight metric ok><b>API 可用性</b><small>过去 30 天</small>99.95%</Insight>
  <Insight metric ok><b>P99 延迟</b><small>目标 200ms</small>145ms</Insight>
  <Insight metric warn><b>错误率</b><small>超时为主</small>0.12%</Insight>
  <Insight metric risk><b>待修 Bug</b><small>2 个 P0</small>7</Insight>
</Insights>
```

</Fold>

### 步骤与进度

<ProgressBar value={72} ok>
  <b>整体完成度</b>
  18 / 25 个任务已完成
</ProgressBar>

<Steps horizontal active={2}>
  <Step><b>需求锁定</b>已完成</Step>
  <Step><b>开发中</b>进行中</Step>
  <Step><b>测试</b>下周开始</Step>
  <Step><b>发布</b>待排期</Step>
</Steps>

标记行便捷写法：

[!Steps]

1. **需求锁定** 对齐需求边界和交付边界
2. **方案确认** 定义接口和依赖关系
3. **开发实现** 按模块推进
4. **联调验收** 检查回归和风险

<Fold>
  <b>标记行写法</b>

```mdx
[!Steps]

1. **需求锁定** 对齐需求边界和交付边界
2. **方案确认** 定义接口和依赖关系
3. **开发实现** 按模块推进
4. **联调验收** 检查回归和风险
```

</Fold>

### 方案对比

<Grid columns={2}>
<GridItem ok badge="推荐">
<b>模块化单体</b>

部署链路简单，适合当前团队规模。零网络开销，调试成本低。

> [!OK]
> P99 延迟 145ms，满足目标。

</GridItem>
<GridItem warn badge="备选">
<b>微服务拆分</b>

独立发布能力更强，但需要额外处理链路追踪和网关治理。

> [!WARNING]
> 运维复杂度增加，需评估团队能力。

</GridItem>
</Grid>

### 检查项


- [x] 数据模型设计
- [x] API 接口定义
- [ ] 单元测试补全
- [ ] 支付稳定性验证

### 横向卡片列表

[!Grid]

- **认证能力**
  - 支持双令牌
  - 支持 SSO
- **同步能力**
  - 支持增量拉取
  - 支持冲突提示

### 折叠详情

<Fold>
  <b>部署方案详情</b>

1. 灰度 1% → 10% → 50% → 100%
2. 每个阶段观察 30 分钟
3. 回滚条件：错误率 > 0.5% 或 P99 > 300ms

监控面板：[Grafana](https://grafana.example.com)

</Fold>

### 多方案切换

<Tabs>
<Tab label="方案 A">

**微服务拆分** — 独立部署，延迟 +2ms。

</Tab>
<Tab label="方案 B">

**模块化单体** — 零网络开销，部署简单。

</Tab>
</Tabs>

### 时间线

<Steps>
  <Step><b>需求评审</b>产品、开发、测试对齐需求范围</Step>
  <Step><b>技术方案</b>输出架构图、接口定义</Step>
  <Step><b>开发实现</b>按模块拆分任务</Step>
  <Step><b>灰度发布</b>1% → 10% → 100%</Step>
</Steps>

### 提示与警告

> [!NOTE]
> 这是一条普通说明，提供补充背景信息。

> [!TIP]
> 建议使用 `--dry-run` 参数先验证迁移脚本。

> [!OK]
> 压测通过，P99 延迟稳定在 150ms 以内。

> [!WARNING]
> 此操作会清空测试环境全部数据。

> [!DANGER]
> 生产环境禁止直接执行 DDL。

### 图表

<Grid columns={2}>
<GridItem>
<b>柱状图</b>

```chart | bar
{
  "type": "bar",
  "data": [
    { "month": "1月", "value": 28 },
    { "month": "2月", "value": 55 },
    { "month": "3月", "value": 43 },
    { "month": "4月", "value": 91 },
    { "month": "5月", "value": 62 }
  ],
  "x": "month",
  "y": "value"
}
```

</GridItem>
<GridItem>
<b>折线图</b>

```chart | line
{
  "type": "line",
  "data": [
    { "time": "10:00", "p99": 145, "avg": 88 },
    { "time": "11:00", "p99": 152, "avg": 91 },
    { "time": "12:00", "p99": 213, "avg": 120 },
    { "time": "13:00", "p99": 167, "avg": 95 }
  ],
  "x": "time",
  "y": "p99"
}
```

</GridItem>
</Grid>

### 流程图

```mermaid
graph LR
  A[需求锁定] --> B[技术方案]
  B --> C[开发实现]
  C --> D[灰度发布]
  D --> E[全量上线]
  B --> F[风险评估]
  F --> C
```

---

## 审查交互

<AskQuestion id="mdxit-feedback" question="MDXit 的语法设计是否满足你的需求？">
当前设计：XML 标签为主力语法，Callout 为便捷写法，Fence Language 处理图表。如果你需要某个场景的特定组件或语法支持，请在此回答。
</AskQuestion>

---

## 对比 HTML

| 维度 | HTML 方案 | MDXit 方案 |
|------|----------|-----------|
| 信息密度 | 完全自由 | 语义组件提升，源文件 Markdown |
| Agent 可读性 | 需解析 DOM | 原生结构化文本 |
| Git diff | 噪声大，不可 review | 可读、可 grep、可 review |
| 退化行为 | 无渲染器也能读 | XML 标签不渲染但内容可见 |
| 迭代成本 | 每轮 2-4× token | 标准 Markdown 增量 |
| 交互 | 内嵌 JS | 事件流分离，源文件不改 |
