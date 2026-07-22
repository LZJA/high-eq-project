import { describe, expect, it } from "vitest";
import {
  TALKTYPE_DIMENSIONS,
  TALKTYPE_PERSONALITIES,
  TALKTYPE_SCORER_SCENARIOS,
  TALKTYPE_SEO_PAGES,
  TALKTYPE_TEST_QUESTIONS,
  TALKTYPE_VISUAL_ASSETS,
  calculateTalkTypeResult,
} from ".";

const dimensionKeys = ["S", "W", "B", "C"] as const;

describe("TalkType content assets", () => {
  it("defines four SWBC dimensions", () => {
    expect(TALKTYPE_DIMENSIONS.map((dimension) => dimension.key)).toEqual(dimensionKeys);
  });

  it("defines 12 personality centers with complete result copy", () => {
    expect(TALKTYPE_PERSONALITIES).toHaveLength(12);

    for (const personality of TALKTYPE_PERSONALITIES) {
      expect(personality.id).toMatch(/^[a-z0-9-]+$/);
      expect(personality.name.length).toBeGreaterThanOrEqual(4);
      expect(personality.center.S).toBeGreaterThanOrEqual(0);
      expect(personality.center.S).toBeLessThanOrEqual(100);
      expect(personality.center.W).toBeGreaterThanOrEqual(0);
      expect(personality.center.W).toBeLessThanOrEqual(100);
      expect(personality.center.B).toBeGreaterThanOrEqual(0);
      expect(personality.center.B).toBeLessThanOrEqual(100);
      expect(personality.center.C).toBeGreaterThanOrEqual(0);
      expect(personality.center.C).toBeLessThanOrEqual(100);
      expect(personality.summary).toContain(personality.name);
      expect(personality.shareText).toContain(personality.name);
      expect(personality.strengths).toHaveLength(3);
      expect(personality.blindSpots).toHaveLength(3);
      expect(personality.relationshipBehavior.length).toBeGreaterThan(20);
      expect(personality.workplaceBehavior.length).toBeGreaterThan(20);
      expect(personality.friendshipBehavior.length).toBeGreaterThan(20);
      expect(personality.trainingFocus).toHaveLength(3);
      expect(personality.recommendedModule).toMatch(/talktype|eq-score|eq-emergency|app/);
    }
  });

  it("defines one visual asset spec for every personality", () => {
    expect(TALKTYPE_VISUAL_ASSETS).toHaveLength(12);
    expect(TALKTYPE_VISUAL_ASSETS.map((asset) => asset.personalityId).sort()).toEqual(
      TALKTYPE_PERSONALITIES.map((personality) => personality.id).sort(),
    );

    for (const asset of TALKTYPE_VISUAL_ASSETS) {
      expect(asset.assetId).toMatch(/^[a-z0-9-]+$/);
      expect(asset.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(asset.secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(asset.symbolicObjects).toHaveLength(3);
      expect(asset.prompt).toContain("TalkType");
      expect(asset.prompt.length).toBeGreaterThan(300);
      expect(asset.avoid).toHaveLength(3);
    }
  });

  it("defines 24 complete public test questions with four scored options each", () => {
    expect(TALKTYPE_TEST_QUESTIONS).toHaveLength(24);

    const categories = new Set(TALKTYPE_TEST_QUESTIONS.map((question) => question.category));
    expect(categories).toEqual(new Set(["relationship", "workplace", "friendship", "family", "boundary", "repair"]));

    for (const question of TALKTYPE_TEST_QUESTIONS) {
      expect(question.prompt.length).toBeGreaterThan(10);
      expect(question.options).toHaveLength(4);
      for (const option of question.options) {
        for (const key of dimensionKeys) {
          expect(option.score[key]).toBeGreaterThanOrEqual(0);
          expect(option.score[key]).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it("matches answers to the nearest personality center instead of assigning by total score", () => {
    const highSensitiveAnswers = TALKTYPE_TEST_QUESTIONS.map((question) => {
      const sorted = [...question.options].sort((left, right) => {
        const leftSignal = left.score.S * 3 + left.score.W - left.score.B - left.score.C;
        const rightSignal = right.score.S * 3 + right.score.W - right.score.B - right.score.C;
        return rightSignal - leftSignal;
      });
      return { questionId: question.id, optionId: sorted[0].id };
    });

    const result = calculateTalkTypeResult(highSensitiveAnswers);

    expect(result.personality.name).toBe("高敏雷达型");
    expect(result.dimensionScores.S).toBeGreaterThan(result.dimensionScores.B);
    expect(result.matchDistance).toBeGreaterThanOrEqual(0);
  });

  it("defines 30 scorer scenarios across at least eight categories", () => {
    expect(TALKTYPE_SCORER_SCENARIOS).toHaveLength(30);
    expect(new Set(TALKTYPE_SCORER_SCENARIOS.map((scenario) => scenario.category)).size).toBeGreaterThanOrEqual(8);

    for (const scenario of TALKTYPE_SCORER_SCENARIOS) {
      expect(scenario.opponentMessage.length).toBeGreaterThan(4);
      expect(scenario.userGoal.length).toBeGreaterThan(4);
      expect(scenario.evaluationFocus).toHaveLength(3);
    }
  });

  it("defines SEO content for five public pages with FAQ entries", () => {
    expect(TALKTYPE_SEO_PAGES.map((page) => page.path)).toEqual([
      "/talktype",
      "/eq-score",
      "/eq-emergency",
      "/workplace-reply",
      "/relationship-reply",
    ]);

    for (const page of TALKTYPE_SEO_PAGES) {
      expect(page.title.length).toBeGreaterThan(10);
      expect(page.description.length).toBeGreaterThan(30);
      expect(page.h1.length).toBeGreaterThan(4);
      expect(page.faq).toHaveLength(4);
    }
  });

  it("defines long-form SEO sections for the TalkType landing page", () => {
    const talkTypePage = TALKTYPE_SEO_PAGES.find((page) => page.path === "/talktype");

    expect(talkTypePage?.contentSections).toEqual([
      expect.objectContaining({ title: expect.stringContaining("原理") }),
      expect.objectContaining({ title: expect.stringContaining("适合") }),
      expect.objectContaining({ title: expect.stringContaining("MBTI") }),
      expect.objectContaining({ title: expect.stringContaining("搜索") }),
    ]);

    for (const section of talkTypePage?.contentSections ?? []) {
      expect(section.body.length).toBeGreaterThan(80);
      expect(section.keywords.length).toBeGreaterThanOrEqual(3);
    }
  });
});
