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
    priceLabel: "注册即享",
    description: "适合轻度使用的用户",
    features: [
      "每日 10 点，基础回复约 10 次",
      "最多 3 个人物档案",
      "仅基础模型可用",
      "不支持上传聊天截图",
      "历史记录和收藏功能",
    ],
    ctaLabel: "免费注册",
  },
  {
    id: "lite",
    name: "Lite 版",
    priceLabel: "4.99 元/月",
    description: "适合中频使用的用户",
    features: [
      "每日 60 点，基础回复约 60 次",
      "最多 10 个人物档案",
      "高级文字/截图模型可用（3 点/次）",
      "支持上传聊天截图，约 20 次/天",
      "历史记录和收藏功能",
    ],
    ctaLabel: "升级 Lite",
  },
  {
    id: "pro",
    name: "Pro 版",
    priceLabel: "9.99 元/月",
    description: "面向高频沟通用户，更多点数与专业模型",
    badge: "推荐",
    features: [
      "每日 150 点，基础回复约 150 次",
      "无限人物档案",
      "全部模型可用，专业模型 8 点/次",
      "支持上传聊天截图，专业模型约 18 次/天",
      "历史记录和收藏功能",
    ],
    ctaLabel: "升级 Pro",
    emphasis: true,
  },
];
