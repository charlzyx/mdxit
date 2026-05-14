---
id: mdxit-showcase
title: 组件展示
kind: reference
description: MDXit 全部写法展示。showcase.md 是当前语法的唯一标准。
---

# MDXit 组件展示

*Markdown 原生语法优先，语义化标签用于审查交互。*

---

## 语义组件

### Insight

单独使用：

<Insight ok badge="已批准">
  <b>核心决策</b>
  <small>Q4 技术选型</small>
  选择 PostgreSQL + Redis 组合。
</Insight>

三栏排列：

<Insights columns={3}>
  <Insight ok badge="低风险"><b>用户认证</b>JWT 双令牌方案。</Insight>
  <Insight risk badge="高风险"><b>数据迁移</b>1.2 亿条记录。</Insight>
  <Insight warn badge="待完善"><b>监控告警</b>阈值未配置。</Insight>
</Insights>

指标模式：

<Insights columns={4}>
  <Insight metric ok><b>API 可用性</b><small>过去 30 天</small>99.95%</Insight>
  <Insight metric ok><b>P99 延迟</b><small>目标 200ms</small>145ms</Insight>
  <Insight metric warn><b>错误率</b><small>超时为主</small>0.12%</Insight>
  <Insight metric risk><b>待修 Bug</b><small>2 个 P0</small>7</Insight>
</Insights>

<Fold>
  <b>源码</b>

```mdx
<Insight ok badge="已批准">
  <b>核心决策</b>
  <small>Q4 技术选型</small>
  选择 PostgreSQL + Redis 组合。
</Insight>

<Insights columns={3}>
  <Insight ok badge="低风险"><b>用户认证</b>JWT 双令牌方案。</Insight>
  <Insight risk badge="高风险"><b>数据迁移</b>1.2 亿条记录。</Insight>
  <Insight warn badge="待完善"><b>监控告警</b>阈值未配置。</Insight>
</Insights>

<Insights columns={4}>
  <Insight metric ok><b>API 可用性</b><small>过去 30 天</small>99.95%</Insight>
  <Insight metric ok><b>P99 延迟</b><small>目标 200ms</small>145ms</Insight>
  <Insight metric warn><b>错误率</b><small>超时为主</small>0.12%</Insight>
  <Insight metric risk><b>待修 Bug</b><small>2 个 P0</small>7</Insight>
</Insights>
```

</Fold>

---

### 进度与步骤

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

<Steps>
  <Step><b>需求评审</b>产品、开发、测试对齐需求范围</Step>
  <Step><b>技术方案</b>输出架构图、接口定义</Step>
  <Step><b>开发实现</b>按模块拆分任务</Step>
  <Step><b>灰度发布</b>1% → 10% → 100%</Step>
</Steps>

<Fold>
  <b>源码</b>

```mdx
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

<Steps>
  <Step><b>需求评审</b>产品、开发、测试对齐需求范围</Step>
  <Step><b>技术方案</b>输出架构图、接口定义</Step>
  <Step><b>开发实现</b>按模块拆分任务</Step>
  <Step><b>灰度发布</b>1% → 10% → 100%</Step>
</Steps>
```

</Fold>

---

### Tabs

<Tabs>
  <Tab label="方案 A">

**微服务拆分** — 独立部署，延迟 +2ms。

  </Tab>
  <Tab label="方案 B">

**模块化单体** — 零网络开销，部署简单。

  </Tab>
</Tabs>

<Fold>
  <b>源码</b>

```mdx
<Tabs>
  <Tab label="方案 A">

**微服务拆分** — 独立部署，延迟 +2ms。

  </Tab>
  <Tab label="方案 B">

**模块化单体** — 零网络开销，部署简单。

  </Tab>
</Tabs>
```

</Fold>

---

### Tree

<Tree>
  <ul>
    <li>
      src <small>源代码目录</small>
      <ul>
        <li>
          components <small>可复用组件</small>
          <ul>
            <li>ReviewPrimitives.tsx <small>审查原语</small></li>
            <li>Button.tsx <small>通用按钮</small></li>
          </ul>
        </li>
        <li>
          runtime <small>运行时核心</small>
          <ul>
            <li>mdx-components.tsx <small>MDX 组件注册</small></li>
            <li>Workbench.tsx <small>三栏工作台</small></li>
            <li>session.ts <small>会话事件</small></li>
          </ul>
        </li>
        <li>main.tsx <small>入口</small></li>
        <li>styles.css <small>全局样式</small></li>
      </ul>
    </li>
    <li>package.json</li>
    <li>tsconfig.json</li>
    <li>vite.config.ts <small>构建配置</small></li>
  </ul>
</Tree>

<Fold>
  <b>源码</b>

```mdx
<Tree>
  <ul>
    <li>
      src <small>源代码目录</small>
      <ul>
        <li>
          components <small>可复用组件</small>
          <ul>
            <li>ReviewPrimitives.tsx <small>审查原语</small></li>
            <li>Button.tsx <small>通用按钮</small></li>
          </ul>
        </li>
        <li>
          runtime <small>运行时核心</small>
          <ul>
            <li>mdx-components.tsx <small>MDX 组件注册</small></li>
            <li>Workbench.tsx <small>三栏工作台</small></li>
            <li>session.ts <small>会话事件</small></li>
          </ul>
        </li>
        <li>main.tsx <small>入口</small></li>
        <li>styles.css <small>全局样式</small></li>
      </ul>
    </li>
    <li>package.json</li>
    <li>tsconfig.json</li>
    <li>vite.config.ts <small>构建配置</small></li>
  </ul>
</Tree>
```

</Fold>

---

## 轻交互

### AskQuestion

<AskQuestion id="release-risk-confirm" question="这个发布风险是否可以接受？">
当前方案将支付回调超时归因为外部网关抖动，但还没有给出 mock 网关重跑后的数据。用户提交回答后，事件会写入 `.mdxit/session/events.jsonl`，agent 可以读取事件并修改源文档。
</AskQuestion>

<Fold>
  <b>源码</b>

```mdx
<AskQuestion id="release-risk-confirm" question="这个发布风险是否可以接受？">
当前方案将支付回调超时归因为外部网关抖动，但还没有给出 mock 网关重跑后的数据。用户提交回答后，事件会写入 `.mdxit/session/events.jsonl`，agent 可以读取事件并修改源文档。
</AskQuestion>
```

</Fold>

---

### 选区反馈

选中下面这句话，会出现一个轻量浮层。点击"修改意见"后输入一句反馈，事件同样会写入本地事件流。

这段描述故意保留一个可以被用户指出的问题：支付稳定性只依赖一次压测结果，没有说明重试策略、告警阈值和回滚触发条件。

<Fold>
  <b>源码</b>

```mdx
选中下面这句话，会出现一个轻量浮层。点击"修改意见"后输入一句反馈，事件同样会写入本地事件流。

这段描述故意保留一个可以被用户指出的问题：支付稳定性只依赖一次压测结果，没有说明重试策略、告警阈值和回滚触发条件。
```

</Fold>

---

## 基础写作

### 提示块

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

<Fold>
  <b>源码</b>

```mdx
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
```

</Fold>

---

### Grid 布局

:::grid columns=3
:::item
<b>接口表格</b>

| 方法 | 路径 | 认证 |
|------|------|------|
| GET | `/api/users` | Bearer |
| DELETE | `/api/users/:id` | Admin |

:::
:::item ok
<b>检查项</b>

- [x] 数据模型设计
- [x] API 接口定义
- [ ] 单元测试补全

:::
:::item
<b>引用</b>

> 好的架构应该让变更的成本与变更的范围成正比。
>
> — Martin Fowler

:::
:::

带状态和徽章：

:::grid 2
:::item ok badge="推荐"
<b>模块化单体</b>
部署链路简单，适合当前团队规模。

:::
:::item warn badge="备选"
<b>微服务拆分</b>
独立发布能力更强，但需要额外处理链路追踪和网关治理。

:::
:::

<Fold>
  <b>源码</b>

```mdx
:::grid columns=3
:::item
<b>接口表格</b>

| 方法 | 路径 | 认证 |
|------|------|------|
| GET | `/api/users` | Bearer |
| DELETE | `/api/users/:id` | Admin |

:::
:::item ok
<b>检查项</b>

- [x] 数据模型设计
- [x] API 接口定义
- [ ] 单元测试补全

:::
:::item
<b>引用</b>

> 好的架构应该让变更的成本与变更的范围成正比。
>
> — Martin Fowler

:::
:::

:::grid 2
:::item ok badge="推荐"
<b>模块化单体</b>
部署链路简单，适合当前团队规模。

:::
:::item warn badge="备选"
<b>微服务拆分</b>
独立发布能力更强，但需要额外处理链路追踪和网关治理。

:::
:::
```

</Fold>

---

## 组合示例

:::grid 2
:::item ok
<b>当前结论</b>

> [!OK]
> 测试完成，8 个失败均为支付回调超时，与业务逻辑无关。

:::
:::item warn
<b>后续动作</b>

> [!WARNING]
> 建议使用 mock 替代真实支付网关后重跑。

- [x] 核心流程：注册/登录/下单全链路
- [x] 边界条件：空值、并发冲突
- [x] 性能回归：P99 无劣化
- [ ] 支付稳定性：需替换 mock 网关重跑

:::
:::

<AskQuestion id="payment-next-step" question="支付稳定性这条检查项应该如何补充？">
这条回答适合由 agent 转换成检查项、风险说明或后续行动。
</AskQuestion>

<Fold>
  <b>源码</b>

```mdx
:::grid 2
:::item ok
<b>当前结论</b>

> [!OK]
> 测试完成，8 个失败均为支付回调超时，与业务逻辑无关。

:::
:::item warn
<b>后续动作</b>

> [!WARNING]
> 建议使用 mock 替代真实支付网关后重跑。

- [x] 核心流程：注册/登录/下单全链路
- [x] 边界条件：空值、并发冲突
- [x] 性能回归：P99 无劣化
- [ ] 支付稳定性：需替换 mock 网关重跑

:::
:::

<AskQuestion id="payment-next-step" question="支付稳定性这条检查项应该如何补充？">
这条回答适合由 agent 转换成检查项、风险说明或后续行动。
</AskQuestion>
```

</Fold>

---

## 图表

:::grid 2
:::item
<b>柱状图</b>

```antv | bar
{
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

:::
:::item
<b>折线图</b>

```antv | line
{
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

:::
:::

<Fold>
  <b>源码</b>

````mdx
:::grid 2
:::item
<b>柱状图</b>

```antv | bar
{
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

:::
:::item
<b>折线图</b>

```antv | line
{
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

:::
:::
````

</Fold>
