import { TALKTYPE_SEO_PAGES } from "./seoContent";
import { TALKTYPE_VISUAL_ASSETS } from "./visualAssets";

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
}): string {
  return `我的 TalkType 是「${input.personalityName}」，沟通代码 ${input.communicationCode}。测测你的沟通人格：${input.url}`;
}
