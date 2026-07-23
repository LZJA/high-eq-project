import { describe, expect, it } from "vitest";
import { TALKTYPE_PERSONALITIES } from "./personalityTypes";
import { TALKTYPE_VISUAL_ASSETS } from "./visualAssets";
import { buildFallbackTalkTypeDeepReport, buildTalkTypeDeepReportRequest, buildTalkTypeShareReportPayload, buildTalkTypeSnapshotReport } from "./talktypeReport";
import type { TalkTypeResult } from "./types";

describe("TalkType deep report helpers", () => {
  it("builds the three readable snapshot modules for the result page", () => {
    const snapshot = buildTalkTypeSnapshotReport(sampleResult());

    expect(snapshot.identityInsight.title).toBe("一句话读懂你");
    expect(snapshot.identityInsight.body).toContain("关系经营者");
    expect(snapshot.externalImpression.title).toBe("别人眼中的你");
    expect(snapshot.externalImpression.tags).toEqual(["长期主义", "回应稳定", "懂得维护关系质量"]);
    expect(snapshot.blindSpotInsight.title).toBe("你容易忽略的事");
    expect(snapshot.blindSpotInsight.body).toContain("你不是不懂");
  });

  it("builds an API request from the calculated result without asking AI to decide the type", () => {
    const result = sampleResult();

    expect(buildTalkTypeDeepReportRequest(result)).toMatchObject({
      personalityName: "关系经营者",
      codeName: "Relationship Curator",
      communicationCode: "S84 W73 B78 C74",
      maturityScore: 77,
      dimensionScores: { S: 84, W: 73, B: 78, C: 74 },
      relationshipBehavior: result.personality.relationshipBehavior,
    });
  });

  it("builds a public share report payload without full AI deep report content", () => {
    const payload = buildTalkTypeShareReportPayload(sampleResult(), TALKTYPE_VISUAL_ASSETS[7]);

    expect(payload.personalityName).toBe("关系经营者");
    expect(payload.communicationCode).toBe("S84 W73 B78 C74");
    expect(payload.tags).toEqual(["长期主义", "回应稳定", "懂得维护关系质量"]);
    expect(payload.identityInsight).toContain("关系经营者");
    expect(Object.keys(payload)).not.toContain("hiddenPattern");
    expect(Object.keys(payload)).not.toContain("innerNeed");
  });

  it("builds a complete local fallback report for guests when AI is unavailable", () => {
    const report = buildFallbackTalkTypeDeepReport(sampleResult());

    expect(report.hiddenPattern).toContain("关系经营者");
    expect(report.triggerPhrases).toHaveLength(3);
    expect(report.relationshipNotes).toEqual({
      relationship: TALKTYPE_PERSONALITIES[7].relationshipBehavior,
      workplace: TALKTYPE_PERSONALITIES[7].workplaceBehavior,
      friendship: TALKTYPE_PERSONALITIES[7].friendshipBehavior,
    });
    expect(report.practicePrompts.length).toBeGreaterThan(0);
    expect(report.fallback).toBe(true);
  });
});

function sampleResult(): TalkTypeResult {
  return {
    personality: TALKTYPE_PERSONALITIES[7],
    secondaryPersonality: null,
    dimensionScores: { S: 84, W: 73, B: 78, C: 74 },
    maturityScore: 77,
    communicationCode: "S84 W73 B78 C74",
    matchDistance: 4.2,
  };
}
