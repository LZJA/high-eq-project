// 订阅类型
export type SubscriptionTier = 'free' | 'lite' | 'pro';

// 配额状态
export interface QuotaStatus {
  tier: SubscriptionTier;
  dailyQuota: number;
  dailyQuotaUsed: number;
  remainingQuota: number;
  isUnlimited: boolean;
  resetDate: string | null;
  availableModels: string[];
  subscriptionEndTime: string | null;
  subscriptionRemainingSeconds: number | null;
  subscriptionExpired: boolean;
}

// 人物档案
export interface PersonProfile {
  id: string;
  userId: string;
  name: string;
  gender?: string;
  age?: number;
  personality?: string;
  occupation?: string;
  zodiacSign?: string;
  chineseZodiac?: string;
  hobbies?: string;
  relationship?: string;
  notes?: string;
  avatarUrl?: string;
  isFavorite: boolean;
  createTime: string;
  updateTime: string;
}

// AI 模型配置
export interface AiModel {
  value: string;
  label: string;
  tier: SubscriptionTier[];
  description?: string;
  supportsImage?: boolean;
}

export const AI_MODELS: AiModel[] = [
  { value: "deepseek-chat", label: "普通模型", tier: ['free', 'lite', 'pro'] },
  { value: "qwen-vl-plus", label: "高级模型（支持截图）", tier: ['lite', 'pro'], description: "Lite/PRO", supportsImage: true },
  { value: "doubao-seed-1-8-251228", label: "专业模型（支持截图）", tier: ['pro'], description: "PRO 专属", supportsImage: true },
];

// 星座
export const ZODIAC_SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"
];

// 生肖
export const CHINESE_ZODIAC = [
  "鼠", "牛", "虎", "兔", "龙", "蛇",
  "马", "羊", "猴", "鸡", "狗", "猪"
];

// 性别
export const GENDERS = ["男", "女", "其他"];

// 关系类型
export const RELATIONSHIPS = [
  "同事", "朋友", "家人", "领导", "客户", "伴侣", "老师", "同学", "其他"
];
