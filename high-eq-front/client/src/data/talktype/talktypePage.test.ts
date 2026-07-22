import { describe, expect, it } from "vitest";
import { TALKTYPE_PERSONALITIES, TALKTYPE_TEST_QUESTIONS } from ".";
import {
  buildTalkTypeShareText,
  getTalkTypePageSeo,
  getTalkTypeProgress,
  getTalkTypeVisualAsset,
} from "./talktypePage";

describe("TalkType page helpers", () => {
  it("uses /talktype as the primary public SEO path", () => {
    expect(getTalkTypePageSeo().path).toBe("/talktype");
    expect(getTalkTypePageSeo().h1).toContain("TalkType");
  });

  it("does not expose unfinished module links on the TalkType page", () => {
    expect(getTalkTypePageSeo().internalLinks).toEqual([{ label: "进入高情商回复生成器", path: "/app" }]);
  });

  it("calculates bounded question progress from answered count", () => {
    expect(getTalkTypeProgress(0, TALKTYPE_TEST_QUESTIONS.length)).toBe(0);
    expect(getTalkTypeProgress(12, TALKTYPE_TEST_QUESTIONS.length)).toBe(50);
    expect(getTalkTypeProgress(99, TALKTYPE_TEST_QUESTIONS.length)).toBe(100);
  });

  it("matches a personality to its visual asset", () => {
    const asset = getTalkTypeVisualAsset(TALKTYPE_PERSONALITIES[0].id);

    expect(asset.personalityId).toBe(TALKTYPE_PERSONALITIES[0].id);
    expect(asset.primaryColor).toMatch(/^#/);
  });

  it("builds share text with personality name and communication code", () => {
    const shareText = buildTalkTypeShareText({
      personalityName: "情绪翻译官",
      communicationCode: "S88 W76 B54 C71",
      url: "https://www.higheq.top/talktype",
    });

    expect(shareText).toContain("情绪翻译官");
    expect(shareText).toContain("S88 W76 B54 C71");
    expect(shareText).toContain("https://www.higheq.top/talktype");
  });
});
