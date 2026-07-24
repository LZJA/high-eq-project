import { TALKTYPE_SEO_PAGES } from "./seoContent";
import { TALKTYPE_VISUAL_ASSETS } from "./visualAssets";
import type { TalkTypeDimensionKey } from "./types";

const TALKTYPE_DIMENSION_SCORE_INSIGHTS: Record<TalkTypeDimensionKey, Record<"low" | "midLow" | "midHigh" | "high", string>> = {
  S: {
    low: "你更相信对方说出来的话，不太会主动猜潜台词；这让你少一些内耗，但遇到含蓄表达时可能会慢半拍。",
    midLow: "你能察觉一部分情绪变化，但通常需要对方给出更明确的信号，才会确认自己是不是读对了。",
    midHigh: "你对语气、停顿和关系氛围比较敏感，很多时候能在对方说出口前先感到不对劲。",
    high: "你很容易捕捉到别人没说出口的情绪和潜台词，常常能听懂“没事”背后真正的意思。",
  },
  W: {
    low: "你的表达更偏直接和效率，优点是清楚不绕弯；但在情绪敏感的场景里，别人可能会觉得有点硬。",
    midLow: "你愿意照顾对方感受，但在紧张或赶时间时，表达温度容易被效率感盖过去。",
    midHigh: "你说话通常有照顾感，能在表达立场时保留善意，让对方更容易接住你的意思。",
    high: "你的表达很有安抚感，擅长让紧张气氛先降下来，也容易让别人觉得被理解、被照顾。",
  },
  B: {
    low: "你容易先顾全关系和场面，哪怕自己有点委屈也会先忍一忍；需要练习把需求说得更清楚。",
    midLow: "你有边界意识，但在熟人、亲密关系或压力场景里，还是可能因为不想破坏关系而退让。",
    midHigh: "你能在多数时候守住自己的节奏，也愿意用比较体面的方式说明限制和底线。",
    high: "你很能守住自己的节奏和底线，不太容易被关系压力推着走；如果再多一点铺垫，会更柔和。",
  },
  C: {
    low: "冲突或尴尬出现时，你可能更想先避开现场，等情绪过去再说；这能减少爆炸，但也可能拖慢修复。",
    midLow: "你能处理一部分沟通压力，但遇到突然质疑、误会或对方情绪很强时，容易被场面带走。",
    midHigh: "你多数时候能把对话拉回正轨，既不完全逃避，也不会急着硬碰硬。",
    high: "你很擅长稳定局面、拆解问题和推进对话，越复杂的场景越能体现你的控场感。",
  },
};

function getScoreRange(score: number): "low" | "midLow" | "midHigh" | "high" {
  if (score >= 85) return "high";
  if (score >= 65) return "midHigh";
  if (score >= 45) return "midLow";
  return "low";
}

export function getTalkTypePageSeo() {
  const page = TALKTYPE_SEO_PAGES.find((item) => item.path === "/talktype");

  if (!page) {
    throw new Error("TalkType SEO page is not configured");
  }

  return page;
}

export function getTalkTypeProgress(answeredCount: number, totalCount: number): number {
  if (totalCount <= 0) {
    return 0;
  }

  const rawProgress = Math.round((answeredCount / totalCount) * 100);
  return Math.min(100, Math.max(0, rawProgress));
}

export function getTalkTypeDimensionScoreInsight(dimensionKey: TalkTypeDimensionKey, score: number): string {
  return TALKTYPE_DIMENSION_SCORE_INSIGHTS[dimensionKey][getScoreRange(score)];
}

export function getTalkTypeVisualAsset(personalityId: string) {
  const asset = TALKTYPE_VISUAL_ASSETS.find((item) => item.personalityId === personalityId);

  if (!asset) {
    throw new Error(`TalkType visual asset is not configured: ${personalityId}`);
  }

  return asset;
}

export function buildTalkTypeShareText(input: {
  personalityName: string;
  communicationCode: string;
  url: string;
  personalityShareText?: string;
}): string {
  if (input.personalityShareText) {
    return `${input.personalityShareText}\n沟通代码 ${input.communicationCode}。测测你的沟通人格：${input.url}`;
  }

  return `我的 TalkType 是「${input.personalityName}」，沟通代码 ${input.communicationCode}。测测你的沟通人格：${input.url}`;
}

export function buildTalkTypeSharePayload(input: {
  personalityName: string;
  communicationCode: string;
  url: string;
  personalityShareText?: string;
}): { title: string; text: string; url: string } {
  return {
    title: `我的 TalkType 是「${input.personalityName}」`,
    text: buildTalkTypeShareText(input),
    url: input.url,
  };
}

export function buildTalkTypeWechatSharePayload(input: {
  personalityName: string;
  communicationCode: string;
  url: string;
  imagePath?: string;
  identityInsight?: string;
  personalityShareText?: string;
  siteUrl?: string;
}): { title: string; desc: string; link: string; imgUrl: string } {
  const siteUrl = input.siteUrl || "https://www.higheq.top";
  const descText = input.identityInsight || input.personalityShareText || "测测你的沟通人格，看看你在关系里最自然的表达方式。";

  return {
    title: `我的 TalkType 是「${input.personalityName}」`,
    desc: `沟通代码 ${input.communicationCode}。${descText}`,
    link: input.url,
    imgUrl: input.imagePath ? new URL(input.imagePath, siteUrl).toString() : `${siteUrl}/icons/icon-512x512.png`,
  };
}

export function getTalkTypeSharePath(shareUrl: string): string {
  if (shareUrl.startsWith("/")) {
    return shareUrl;
  }

  return new URL(shareUrl).pathname;
}

export function isWeChatBrowser(userAgent: string): boolean {
  return /MicroMessenger/i.test(userAgent);
}

export function shouldUseNativeShare(input: { canNativeShare: boolean; userAgent: string }): boolean {
  return input.canNativeShare && !isWeChatBrowser(input.userAgent);
}

export function buildTalkTypeShareImageFilename(assetId: string): string {
  return `talktype-${assetId}.png`;
}
