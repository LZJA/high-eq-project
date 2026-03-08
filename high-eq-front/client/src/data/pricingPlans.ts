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
      "每日少量基础生成次数",
      "常用模板场景与标准语气",
      "基础历史记录与收藏",
    ],
    ctaLabel: "免费开始使用",
  },
  {
    id: "pro",
    name: "Pro 版",
    priceLabel: "待验证定价",
    description: "面向高频沟通用户，强调更像你本人、更省时间",
    badge: "推荐验证",
    features: [
      "更高生成额度与多轮优化",
      "个性化语气、人设与自定义角色",
      "高级模板、收藏搜索与素材复用",
    ],
    ctaLabel: "查看 Pro 权益",
    emphasis: true,
  },
  {
    id: "credits",
    name: "点数包",
    priceLabel: "按需购买",
    description: "适合低频但有明确场景需求的用户",
    features: [
      "不订阅也可按次使用",
      "适合节日、职场关键场景、关系修复等低频需求",
      "可作为 Pro 之外的补充购买方式",
    ],
    ctaLabel: "按次试试",
  },
];
