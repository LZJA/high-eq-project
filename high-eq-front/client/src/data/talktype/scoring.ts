import { TALKTYPE_PERSONALITIES } from "./personalityTypes";
import { TALKTYPE_TEST_QUESTIONS } from "./testQuestions";
import type { TalkTypeAnswer, TalkTypeResult, TalkTypeScoreVector } from "./types";

const dimensionKeys = ["S", "W", "B", "C"] as const;

function emptyVector(): TalkTypeScoreVector {
  return { S: 0, W: 0, B: 0, C: 0 };
}

function distance(left: TalkTypeScoreVector, right: TalkTypeScoreVector): number {
  const sum = dimensionKeys.reduce((total, key) => total + Math.pow(left[key] - right[key], 2), 0);
  return Math.sqrt(sum);
}

export function calculateTalkTypeResult(answers: TalkTypeAnswer[]): TalkTypeResult {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.optionId]));
  const rawScores = emptyVector();
  const maxScores = emptyVector();

  for (const question of TALKTYPE_TEST_QUESTIONS) {
    const selectedOptionId = answerMap.get(question.id);
    const selectedOption = question.options.find((option) => option.id === selectedOptionId);

    for (const key of dimensionKeys) {
      maxScores[key] += Math.max(...question.options.map((option) => option.score[key]));
      if (selectedOption) {
        rawScores[key] += selectedOption.score[key];
      }
    }
  }

  const dimensionScores = emptyVector();
  for (const key of dimensionKeys) {
    dimensionScores[key] = maxScores[key] === 0 ? 0 : Math.round((rawScores[key] / maxScores[key]) * 100);
  }

  const ranked = TALKTYPE_PERSONALITIES
    .map((personality) => ({ personality, matchDistance: distance(dimensionScores, personality.center) }))
    .sort((left, right) => left.matchDistance - right.matchDistance);

  const [primary, secondary] = ranked;
  const secondaryPersonality =
    secondary && secondary.matchDistance <= primary.matchDistance * 1.05 ? secondary.personality : null;
  const maturityScore = Math.round(
    dimensionKeys.reduce((total, key) => total + dimensionScores[key], 0) / dimensionKeys.length,
  );

  return {
    personality: primary.personality,
    secondaryPersonality,
    dimensionScores,
    maturityScore,
    communicationCode: `S${dimensionScores.S} W${dimensionScores.W} B${dimensionScores.B} C${dimensionScores.C}`,
    matchDistance: Math.round(primary.matchDistance * 100) / 100,
  };
}
