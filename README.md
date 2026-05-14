# MDXit

用语义组件提升 Markdown 的信息密度。Grid 多栏、Insight 指标卡、Fold 折叠、Steps 时间线——对 agent 仍是结构化文本，对人不再是线性滚动。

## 安装

```bash
npx skills add charlzyx/mdxit
bash .agents/skills/mdxit/scripts/setup.sh
```

Agent 安装 skill 后会自动引导用户执行 setup。运行时（src、Vite、React）已打包在 skill 目录内，无需额外 clone。

## 预览

```bash
cd .agents/skills/mdxit/runtime
npm run dev                     # HMR 实时刷新
node dist/cli/index.js preview <path>
```

## 技能说明

语法标准：`skills/mdxit/references/showcase.md`

Skill 触发场景：PRD、架构方案、QA 报告、迁移计划、决策记录、审查报告。
