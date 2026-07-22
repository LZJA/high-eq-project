# TalkType Stage 0 Content Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Stage 0 reusable content assets for TalkType: dimensions, 12 personality types, 24 test questions with scoring, 30 scorer scenarios, SEO metadata, FAQ copy, and validation tests.

**Architecture:** Keep Stage 0 as front-end static data plus pure scoring helpers. No pages, routes, APIs, or subscription logic are implemented in this phase; later phases consume these typed assets. Validation tests guard content completeness, scoring consistency, and TalkType personality matching logic.

**Tech Stack:** React/Vite project, TypeScript, Vitest, existing `high-eq-front` package scripts.

---

## File Structure

- Create `high-eq-front/client/src/data/talktype/types.ts`: shared TypeScript types for dimensions, questions, personality centers, scorer scenarios, SEO pages, and FAQ entries.
- Create `high-eq-front/client/src/data/talktype/personalityTypes.ts`: 12 TalkType personalities, S/W/B/C centers, result-page copy, and share lines.
- Create `high-eq-front/client/src/data/talktype/testQuestions.ts`: 24 complete public test questions, each with 4 options and S/W/B/C scores.
- Create `high-eq-front/client/src/data/talktype/scoring.ts`: pure helpers for dimension normalization, maturity score, nearest-center matching, and secondary tendency detection.
- Create `high-eq-front/client/src/data/talktype/scorerScenarios.ts`: 30 high-EQ scorer scenarios across relationship, workplace, friend, family, customer, boundary, apology, and follow-up categories.
- Create `high-eq-front/client/src/data/talktype/seoContent.ts`: SEO title, description, H1, FAQ, and internal-link copy for `/eq-test`, `/eq-score`, `/eq-emergency`, `/workplace-reply`, and `/relationship-reply`.
- Create `high-eq-front/client/src/data/talktype/index.ts`: stable export surface for later pages.
- Create `high-eq-front/client/src/data/talktype/talktype.test.ts`: Vitest coverage for data shape, scoring, and matching.
- Modify `high-eq-front/package.json`: add a narrow `test:talktype` script using Vitest.

## Task 1: Add a Failing Validation Test for TalkType Assets

**Files:**
- Create: `high-eq-front/client/src/data/talktype/talktype.test.ts`
- Modify: `high-eq-front/package.json`

- [ ] **Step 1: Add the test script**

In `high-eq-front/package.json`, add this script entry:

```json
"test:talktype": "vitest run client/src/data/talktype/talktype.test.ts"
```

The scripts block should include:

```json
{
  "dev": "vite --host",
  "build": "vite build && node scripts/prerender-home.mjs",
  "build:spa": "vite build",
  "preview": "vite preview --host",
  "check": "tsc --noEmit",
  "test:seo": "node --test scripts/seo-config.test.mjs",
  "test:talktype": "vitest run client/src/data/talktype/talktype.test.ts",
  "format": "prettier --write ."
}
```

- [ ] **Step 2: Write the failing test file**

Create `high-eq-front/client/src/data/talktype/talktype.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  TALKTYPE_DIMENSIONS,
  TALKTYPE_PERSONALITIES,
  TALKTYPE_TEST_QUESTIONS,
  TALKTYPE_SCORER_SCENARIOS,
  TALKTYPE_SEO_PAGES,
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
      expect(personality.recommendedModule).toMatch(/eq-test|eq-score|eq-emergency|app/);
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
      "/eq-test",
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
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run:

```bash
cd high-eq-front
pnpm test:talktype
```

Expected: FAIL because `client/src/data/talktype` exports do not exist yet.

- [ ] **Step 4: Commit the failing test**

```bash
git add high-eq-front/package.json high-eq-front/client/src/data/talktype/talktype.test.ts
git commit -m "test: add TalkType content validation"
```

## Task 2: Define TalkType Types, Dimensions, Personalities, and Scoring

**Files:**
- Create: `high-eq-front/client/src/data/talktype/types.ts`
- Create: `high-eq-front/client/src/data/talktype/personalityTypes.ts`
- Create: `high-eq-front/client/src/data/talktype/scoring.ts`
- Create: `high-eq-front/client/src/data/talktype/index.ts`

- [ ] **Step 1: Create shared types**

Create `high-eq-front/client/src/data/talktype/types.ts`:

```ts
export type TalkTypeDimensionKey = "S" | "W" | "B" | "C";

export type TalkTypeScoreVector = Record<TalkTypeDimensionKey, number>;

export interface TalkTypeDimension {
  key: TalkTypeDimensionKey;
  name: string;
  englishName: string;
  highLabel: string;
  lowLabel: string;
  description: string;
}

export interface TalkTypePersonality {
  id: string;
  name: string;
  codeName: string;
  center: TalkTypeScoreVector;
  tagline: string;
  summary: string;
  strengths: string[];
  blindSpots: string[];
  relationshipBehavior: string;
  workplaceBehavior: string;
  friendshipBehavior: string;
  trainingFocus: string[];
  recommendedModule: "eq-test" | "eq-score" | "eq-emergency" | "app";
  shareText: string;
}

export interface TalkTypeQuestionOption {
  id: string;
  text: string;
  score: TalkTypeScoreVector;
}

export type TalkTypeQuestionCategory =
  | "relationship"
  | "workplace"
  | "friendship"
  | "family"
  | "boundary"
  | "repair";

export interface TalkTypeQuestion {
  id: string;
  category: TalkTypeQuestionCategory;
  scene: string;
  prompt: string;
  options: TalkTypeQuestionOption[];
}

export interface TalkTypeAnswer {
  questionId: string;
  optionId: string;
}

export interface TalkTypeResult {
  personality: TalkTypePersonality;
  secondaryPersonality: TalkTypePersonality | null;
  dimensionScores: TalkTypeScoreVector;
  maturityScore: number;
  communicationCode: string;
  matchDistance: number;
}

export type TalkTypeScorerCategory =
  | "relationship"
  | "workplace"
  | "friendship"
  | "family"
  | "customer"
  | "boundary"
  | "apology"
  | "follow_up"
  | "ice_breaking"
  | "pressure";

export interface TalkTypeScorerScenario {
  id: string;
  category: TalkTypeScorerCategory;
  title: string;
  role: string;
  opponentMessage: string;
  userGoal: string;
  suggestedTone: string;
  evaluationFocus: string[];
}

export interface TalkTypeFaqItem {
  question: string;
  answer: string;
}

export interface TalkTypeSeoPage {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  faq: TalkTypeFaqItem[];
  internalLinks: Array<{ label: string; path: string }>;
}
```

- [ ] **Step 2: Create dimensions and 12 personalities**

Create `high-eq-front/client/src/data/talktype/personalityTypes.ts` with 4 dimensions and all 12 personalities. Use the center points from `docs/superpowers/specs/2026-07-22-eq-seo-growth-modules-design.md`.

The exported constants must be named exactly:

```ts
export const TALKTYPE_DIMENSIONS: TalkTypeDimension[] = [];
export const TALKTYPE_PERSONALITIES: TalkTypePersonality[] = [];
```

Replace the empty arrays with the four dimensions and twelve personalities defined in the Stage 0 spec. Each personality must include three strengths, three blind spots, relationship/workplace/friendship behavior, three training focus items, a recommended module, and a share text containing the personality name.

- [ ] **Step 3: Create scoring helpers**

Create `high-eq-front/client/src/data/talktype/scoring.ts`:

```ts
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
```

- [ ] **Step 4: Create stable exports**

Create `high-eq-front/client/src/data/talktype/index.ts`:

```ts
export * from "./types";
export * from "./personalityTypes";
export * from "./testQuestions";
export * from "./scoring";
export * from "./scorerScenarios";
export * from "./seoContent";
```

- [ ] **Step 5: Run the test to verify remaining expected failures**

Run:

```bash
cd high-eq-front
pnpm test:talktype
```

Expected: FAIL because `testQuestions.ts`, `scorerScenarios.ts`, and `seoContent.ts` do not exist yet. The failure should no longer mention missing `types.ts`, `personalityTypes.ts`, or `scoring.ts`.

- [ ] **Step 6: Commit dimensions, personalities, and scoring**

```bash
git add high-eq-front/client/src/data/talktype/types.ts \
  high-eq-front/client/src/data/talktype/personalityTypes.ts \
  high-eq-front/client/src/data/talktype/scoring.ts \
  high-eq-front/client/src/data/talktype/index.ts
git commit -m "feat: add TalkType scoring model"
```

## Task 3: Add 24 Complete TalkType Test Questions

**Files:**
- Create: `high-eq-front/client/src/data/talktype/testQuestions.ts`

- [ ] **Step 1: Create test questions**

Create `high-eq-front/client/src/data/talktype/testQuestions.ts` exporting:

```ts
export const TALKTYPE_TEST_QUESTIONS: TalkTypeQuestion[] = [];
```

Replace the empty array with 24 question objects. Content requirements:

- Exactly 24 questions.
- Exactly 4 options per question.
- Each option has S/W/B/C scores from 0 to 3.
- Categories must cover exactly: `relationship`, `workplace`, `friendship`, `family`, `boundary`, `repair`.
- At least 4 questions must be workplace scenes.
- At least 4 questions must be relationship scenes.
- No option text should explicitly name a dimension or personality.
- Questions should feel like real decisions, not academic self-rating.

Required scene coverage:

```text
1. 对方说“随便你吧”
2. 朋友突然冷淡
3. 领导临时加任务
4. 客户质疑方案
5. 伴侣说“你根本不懂我”
6. 同事迟迟不交付
7. 家人催婚或催决定
8. 朋友临时取消约定
9. 别人越界开玩笑
10. 群聊冷场
11. 对方阴阳怪气
12. 自己说错话后的修复
13. 拒绝借钱
14. 拒绝加班
15. 客户压价
16. 领导批评
17. 朋友求安慰
18. 伴侣冷战
19. 家人不理解选择
20. 同事抢功
21. 陌生人冒犯
22. 项目延期说明
23. 迟回消息解释
24. 对方已读不回后再次开口
```

- [ ] **Step 2: Run TalkType validation**

Run:

```bash
cd high-eq-front
pnpm test:talktype
```

Expected: FAIL only because scorer scenarios and SEO content are still missing.

- [ ] **Step 3: Commit test questions**

```bash
git add high-eq-front/client/src/data/talktype/testQuestions.ts
git commit -m "feat: add TalkType public test questions"
```

## Task 4: Add 30 Scorer Scenarios

**Files:**
- Create: `high-eq-front/client/src/data/talktype/scorerScenarios.ts`

- [ ] **Step 1: Create scorer scenarios**

Create `high-eq-front/client/src/data/talktype/scorerScenarios.ts` exporting:

```ts
export const TALKTYPE_SCORER_SCENARIOS: TalkTypeScorerScenario[] = [];
```

Replace the empty array with 30 scenario objects. Content requirements:

- Exactly 30 scenarios.
- At least 8 categories.
- Each scenario includes title, category, role, opponent message, user goal, suggested tone, and 3 evaluation focus items.
- The same opponent message must not appear twice.
- Include at least 10 workplace/customer scenarios and at least 10 relationship/friend/family scenarios.

Required evaluation focus vocabulary:

```text
接住情绪
表达边界
澄清重点
给出行动
避免防御
保留关系
推进问题
降低误会
```

- [ ] **Step 2: Run TalkType validation**

Run:

```bash
cd high-eq-front
pnpm test:talktype
```

Expected: FAIL only because SEO content is still missing.

- [ ] **Step 3: Commit scorer scenarios**

```bash
git add high-eq-front/client/src/data/talktype/scorerScenarios.ts
git commit -m "feat: add high EQ scorer scenarios"
```

## Task 5: Add SEO and FAQ Content

**Files:**
- Create: `high-eq-front/client/src/data/talktype/seoContent.ts`

- [ ] **Step 1: Create SEO content**

Create `high-eq-front/client/src/data/talktype/seoContent.ts` exporting:

```ts
export const TALKTYPE_SEO_PAGES: TalkTypeSeoPage[] = [];
```

Replace the empty array with five SEO page objects. Content requirements:

- Exactly five pages in this path order: `/eq-test`, `/eq-score`, `/eq-emergency`, `/workplace-reply`, `/relationship-reply`.
- `/eq-test` title must include `TalkType` and `情商测试`.
- Each page has 4 FAQ entries.
- Each page has at least 2 internal links.
- FAQ answers must avoid claiming clinical, diagnostic, hiring, or professional psychological-test validity.

Required page intent:

```text
/eq-test: TalkType 沟通人格测试，主打 24 题完整免费测
/eq-score: 高情商评分器，主打随机场景实战评分
/eq-emergency: 情商急诊室，主打聊天截图或文本诊断
/workplace-reply: 职场表达专题，主打回复领导、同事、客户
/relationship-reply: 恋爱关系专题，主打冷战、误会、安抚和边界
```

- [ ] **Step 2: Run TalkType validation**

Run:

```bash
cd high-eq-front
pnpm test:talktype
```

Expected: PASS.

- [ ] **Step 3: Commit SEO content**

```bash
git add high-eq-front/client/src/data/talktype/seoContent.ts
git commit -m "feat: add TalkType SEO content"
```

## Task 6: Final Verification

**Files:**
- Verify: every file under `high-eq-front/client/src/data/talktype/`
- Verify: `high-eq-front/package.json`

- [ ] **Step 1: Run TalkType validation**

Run:

```bash
cd high-eq-front
pnpm test:talktype
```

Expected: PASS.

- [ ] **Step 2: Run TypeScript check**

Run:

```bash
cd high-eq-front
pnpm check
```

Expected: PASS. If this fails due to unrelated existing project changes, record the exact errors and do not change unrelated files.

- [ ] **Step 3: Inspect git status**

Run:

```bash
git status --short
```

Expected: only committed Stage 0 changes should be absent from the working tree. Any unrelated modified files must be left untouched.

## Self-Review

- Spec coverage: This plan implements the Stage 0 content and structure requirements from `docs/superpowers/specs/2026-07-22-eq-seo-growth-modules-design.md`: TalkType naming, SWBC dimensions, 12 personality centers, 24 public questions, option scoring, scorer scenarios, SEO/FAQ content, and test coverage.
- Completion scan: No unfinished markers are intentionally left in implementation steps.
- Type consistency: All exports used by the test are defined by the planned files and re-exported through `index.ts`.
