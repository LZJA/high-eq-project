# HighEQ Product Docs

这组文档把当前仓库的产品迭代与变现方向拆成可执行规格，优先服务于三个目标：

- 提升首次使用转化与复用率
- 建立可验证的付费分层
- 在情感沟通与职场表达之间做聚焦判断

文档索引：

- `retention-loop.md`: 留存优先的用户闭环、模板场景、二次改写、收藏复用、个人画像
- `monetization-tier.md`: 免费版、Pro 版、点数包的权益边界与验证顺序
- `vertical-focus.md`: 情感沟通 vs 职场表达的聚焦建议与判断指标

对应代码落点：

- 高频模板场景数据：`high-eq-front/client/src/data/scenarioTemplates.ts`
- 收费分层展示数据：`high-eq-front/client/src/data/pricingPlans.ts`
- 模板入口页面：`high-eq-front/client/src/pages/ReplyApp.tsx`
- 价格验证入口页面：`high-eq-front/client/src/pages/Home.tsx`
