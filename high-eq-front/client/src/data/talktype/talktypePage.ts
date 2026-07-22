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

export function buildTalkTypeShareImageFilename(assetId: string): string {
  return `talktype-${assetId}.png`;
}
