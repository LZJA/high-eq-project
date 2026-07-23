import { describe, expect, it } from "vitest";
import { TALKTYPE_PERSONALITIES, TALKTYPE_TEST_QUESTIONS } from ".";
import {
  buildTalkTypeShareImageFilename,
  buildTalkTypeSharePayload,
  buildTalkTypeShareText,
  getTalkTypeDimensionScoreInsight,
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

  it("describes dimension scores by range instead of using one fixed copy", () => {
    expect(getTalkTypeDimensionScoreInsight("S", 88)).toContain("很容易捕捉");
    expect(getTalkTypeDimensionScoreInsight("S", 38)).toContain("更相信对方说出来的话");
    expect(getTalkTypeDimensionScoreInsight("B", 92)).toContain("守住自己的节奏");
    expect(getTalkTypeDimensionScoreInsight("B", 42)).toContain("容易先顾全关系");
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

  it("builds native share payload without image generation data", () => {
    const payload = buildTalkTypeSharePayload({
      personalityName: "边界守门员",
      communicationCode: "S65 W70 B90 C75",
      url: "https://www.higheq.top/talktype",
    });

    expect(payload).toEqual({
      title: "我的 TalkType 是「边界守门员」",
      text: "我的 TalkType 是「边界守门员」，沟通代码 S65 W70 B90 C75。测测你的沟通人格：https://www.higheq.top/talktype",
      url: "https://www.higheq.top/talktype",
    });
    expect(Object.keys(payload)).not.toContain("image");
    expect(Object.keys(payload)).not.toContain("png");
  });

  it("builds a concise share text without repeating the personality intro", () => {
    const shareText = buildTalkTypeShareText({
      personalityName: "关系经营者",
      communicationCode: "S84 W73 B78 C74",
      url: "https://www.higheq.top/talktype",
      personalityShareText: "我的 TalkType 是「关系经营者」：关系不是靠运气，是靠一次次好好回应。",
    });

    expect(shareText).toBe(
      "我的 TalkType 是「关系经营者」：关系不是靠运气，是靠一次次好好回应。\n沟通代码 S84 W73 B78 C74。测测你的沟通人格：https://www.higheq.top/talktype",
    );
    expect(shareText.match(/我的 TalkType 是/g)).toHaveLength(1);
  });

  it("builds a stable share image filename", () => {
    expect(buildTalkTypeShareImageFilename("relationship-curator")).toBe("talktype-relationship-curator.png");
  });
});
