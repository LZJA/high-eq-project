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
  recommendedModule: "talktype" | "eq-score" | "eq-emergency" | "app";
  shareText: string;
}

export interface TalkTypeVisualAsset {
  personalityId: string;
  assetId: string;
  primaryColor: string;
  secondaryColor: string;
  characterAction: string;
  symbolicObjects: string[];
  backgroundElements: string;
  avoid: string[];
  shareText: string;
  prompt: string;
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

export interface TalkTypeSeoContentSection {
  title: string;
  body: string;
  keywords: string[];
}

export interface TalkTypeSeoPage {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  faq: TalkTypeFaqItem[];
  contentSections?: TalkTypeSeoContentSection[];
  internalLinks: Array<{ label: string; path: string }>;
}
