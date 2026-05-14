# ADR-003: 缓存层选型

<Insights columns={3}>
  <Insight metric><b>当前 P99</b>210ms</Insight>
  <Insight metric><b>目标 P99</b><50ms</Insight>
  <Insight metric ok><b>Redis 预估 P99</b>~45ms</Insight>
</Insights>

## 背景

需要为 API 网关引入缓存层，降低数据库压力。当前 P99 延迟 210ms，目标是降到 50ms 以内。

## 方案

:::grid 3
:::item ok
<b>方案 A：Redis Cluster</b>
成熟稳定，运维成本中等，P99 预估 45ms。
:::
:::item
<b>方案 B：本地内存缓存</b>
零运维，但不支持多实例共享，命中率低。
:::
:::item
<b>方案 C：Cloudflare KV</b>
全球边缘节点，延迟不稳定，P99 波动大。
:::
:::

## 决策

> [!OK]
> 选择方案 A Redis Cluster。理由：P99 延迟可降到 45ms，团队已有 Redis 运维经验，社区生态成熟。

## 后续动作

<Steps>
  <Step><b>搭建测试环境</b>搭建 Redis Cluster 测试环境</Step>
  <Step><b>压测验证</b>压测验证 P99 延迟指标</Step>
  <Step><b>失效策略</b>制定缓存失效策略</Step>
  <Step><b>监控告警</b>补充监控告警规则</Step>
</Steps>
