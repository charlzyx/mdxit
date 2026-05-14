# 用户认证模块 PRD

## 方案对比

:::grid 2
:::item ok badge="推荐"
<b>方案A：模块化单体</b>
部署简单，适合当前团队规模5人。服务边界通过目录和接口约束表达。
:::
:::item warn badge="备选"
<b>方案B：微服务拆分</b>
独立发布能力更强，但需要额外处理链路追踪、网关治理和跨服务事务。目前团队没有相关经验。
:::
:::

## 风险评估

<Insights columns={2}>
  <Insight risk><b>风险等级</b>中等</Insight>
  <Insight warn><b>主要风险</b>JWT 令牌刷新逻辑复杂</Insight>
</Insights>

> [!WARNING]
> JWT 令牌刷新逻辑复杂，边界条件容易遗漏。

## 进度

<ProgressBar value={60} warn>
  <b>整体完成度</b>
  预计还需2周完成
</ProgressBar>

<Steps active={2}>
  <Step ok><b>数据模型设计</b>已完成</Step>
  <Step ok><b>API 接口定义</b>已完成</Step>
  <Step><b>单元测试</b>补全中</Step>
</Steps>
