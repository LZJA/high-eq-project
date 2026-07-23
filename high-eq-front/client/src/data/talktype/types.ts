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
  imagePath?: string;
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

export interface TalkTypeDeepReport {
  hiddenPattern: string;
  innerNeed: string;
  triggerPhrases: string[];
  misreadByOthers: string;
  relationshipNotes: {
    relationship: string;
    workplace: string;
    friendship: string;
  };
  growthSuggestion: string;
  practicePrompts: string[];
  modelUsed?: string;
  fallback?: boolean;
}

export interface TalkTypeDeepReportRequest {
  personalityName: string;
  codeName: string;
  communicationCode: string;
  maturityScore: number;
  dimensionScores: TalkTypeScoreVector;
  strengths: string[];
  blindSpots: string[];
  trainingFocus: string[];
  relationshipBehavior: string;
  workplaceBehavior: string;
  friendshipBehavior: string;
}

export interface TalkTypeSnapshotReport {
  identityInsight: {
    title: string;
    body: string;
  };
  externalImpression: {
    title: string;
    tags: string[];
    body: string;
  };
  blindSpotInsight: {
    title: string;
    body: string;
  };
}

export interface TalkTypeShareReportPayload {
  personalityId: string;
  personalityName: string;
  codeName: string;
  communicationCode: string;
  maturityScore?: number;
  dimensionScores?: TalkTypeScoreVector;
  tagline: string;
  summary: string;
  shareText: string;
  imagePath?: string;
  primaryColor: string;
  secondaryColor: string;
  tags: string[];
  identityInsight: string;
  strengths?: string[];
  blindSpots?: string[];
  trainingFocus?: string[];
  relationshipBehavior?: string;
  workplaceBehavior?: string;
  friendshipBehavior?: string;
  snapshotReport?: TalkTypeSnapshotReport;
  deepReport?: TalkTypeDeepReport;
}

export interface TalkTypeShareReport extends TalkTypeShareReportPayload {
  shareId: string;
  shareUrl: string;
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
