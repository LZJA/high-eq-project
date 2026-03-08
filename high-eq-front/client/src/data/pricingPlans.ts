export interface PricingPlan {
  id: string;
  name: string;
  priceLabel: string;
  description: string;
  badge?: string;
  features: string[];
  ctaLabel: string;
  emphasis?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "免费版",
    priceLabel: "0 元",
    description: "适合第一次体验 HighEQ 的用户",
    features: [
      "每日 5 次回复生成",
      "仅普通模型可用",
      "历史记录与收藏功能",
    ],
    ctaLabel: "免费开始使用",
  },
  {
    id: "lite",
    name: "Lite 版",
    priceLabel: "4.99 元/月",
    description: "适合中频使用的用户",
    features: [
      "每日 50 次回复生成",
      "普通模型 + 高级模型",
      "历史记录与收藏功能",
    ],
    ctaLabel: "升级 Lite",
  },
  {
    id: "pro",
    name: "Pro 版",
    priceLabel: "9.99 元/月",
    description: "面向高频沟通用户，无限制使用",
    badge: "推荐",
    features: [
      "无限次数回复生成",
      "全部模型可用（含专业模型）",
      "历史记录与收藏功能",
    ],
    ctaLabel: "升级 Pro",
    emphasis: true,
  },
];
