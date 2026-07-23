import type { TalkTypeDeepReport, TalkTypeDeepReportRequest, TalkTypeResult } from "./types";

export function buildTalkTypeSnapshotReport(result: TalkTypeResult) {
  const { personality } = result;
  const topDimension = Object.entries(result.dimensionScores).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "S";
  const lowDimension = Object.entries(result.dimensionScores).sort((left, right) => left[1] - right[1])[0]?.[0] ?? "W";
  const topDimensionText = dimensionStrengthText[topDimension] ?? "把关系里的重点看得比较清楚";
  const lowDimensionText = dimensionGrowthText[lowDimension] ?? "偶尔也需要给自己一点整理和确认的时间";
  const [firstBlindSpot = "把沟通责任放在自己身上"] = personality.blindSpots;

  return {
    identityInsight: {
      title: "一句话读懂你",
      body: `你是典型的「${personality.name}」：${personality.tagline}${topDimensionText}，但${lowDimensionText}。这让你的沟通方式既有鲜明优势，也有很真实的成长空间。`,
    },
    externalImpression: {
      title: "别人眼中的你",
      tags: personality.strengths.slice(0, 3),
      body: `别人常常会先感受到你身上的「${personality.strengths.slice(0, 2).join("、")}」。在相处里，你不是只会把话说漂亮，而是会用自己的方式让关系继续往前走。`,
    },
    blindSpotInsight: {
      title: "你容易忽略的事",
      body: `你不是不懂沟通，只是容易在「${firstBlindSpot}」这里多消耗一点。越是在意的人和场景，你越需要提醒自己：表达得体很重要，照顾自己的感受也同样重要。`,
    },
  };
}

export function buildTalkTypeDeepReportRequest(result: TalkTypeResult): TalkTypeDeepReportRequest {
  return {
    personalityName: result.personality.name,
    codeName: result.personality.codeName,
    communicationCode: result.communicationCode,
    maturityScore: result.maturityScore,
    dimensionScores: result.dimensionScores,
    strengths: result.personality.strengths,
    blindSpots: result.personality.blindSpots,
    trainingFocus: result.personality.trainingFocus,
    relationshipBehavior: result.personality.relationshipBehavior,
    workplaceBehavior: result.personality.workplaceBehavior,
    friendshipBehavior: result.personality.friendshipBehavior,
  };
}

export function buildFallbackTalkTypeDeepReport(result: TalkTypeResult): TalkTypeDeepReport {
  const { personality } = result;
  const [firstBlindSpot = "容易把沟通责任放在自己身上"] = personality.blindSpots;
  const practicePrompts = personality.trainingFocus.slice(0, 3);

  return {
    hiddenPattern: `你的「${personality.name}」特质说明，你在沟通里不只是追求把话说对，也很在意关系能不能被好好接住。你可能会主动观察对方反应，尝试把误会、沉默或别扭重新变成可以谈的内容。`,
    innerNeed: `你真正需要的不是每次都表现得完美，而是一种稳定、清楚、愿意互相回应的连接。只要对方愿意认真沟通，你通常也愿意把关系继续往好的方向带。`,
    triggerPhrases: getFallbackTriggerPhrases(result),
    misreadByOthers: `别人可能只看到你${personality.strengths[0] ?? "会照顾关系"}，却没有意识到你也会在意自己的感受。你不是没有需求，只是常常先把话说得体，再慢慢处理「${firstBlindSpot}」带来的消耗。`,
    relationshipNotes: {
      relationship: personality.relationshipBehavior,
      workplace: personality.workplaceBehavior,
      friendship: personality.friendshipBehavior,
    },
    growthSuggestion: `下次想把关系修好之前，先问自己一句：这次我是清楚表达需要，还是又在替双方承担沟通责任？`,
    practicePrompts: practicePrompts.length ? practicePrompts : ["表达自己的期待", "确认对方的真实需求", "练习温和但清楚的边界"],
    modelUsed: "local-fallback",
    fallback: true,
  };
}

function getFallbackTriggerPhrases(result: TalkTypeResult): string[] {
  const { S, W, B, C } = result.dimensionScores;

  if (S >= 80 && B < 50) {
    return ["你想太多了", "别这么敏感", "我没那个意思"];
  }
  if (B >= 80 && W < 60) {
    return ["你怎么这么冷", "就帮我这一次", "你太计较了"];
  }
  if (C >= 80) {
    return ["你看着办吧", "这事现在必须解决", "你给个说法"];
  }
  return ["随便你吧", "我最近太忙了", "没事，不用管"];
}

const dimensionStrengthText: Record<string, string> = {
  S: "你很容易捕捉到语气、情绪和潜台词",
  W: "你擅长把话说得柔和、有照顾感",
  B: "你能在关系压力里守住自己的节奏",
  C: "你擅长把复杂场面重新拉回可沟通的轨道",
};

const dimensionGrowthText: Record<string, string> = {
  S: "有时会更相信字面信息，慢一点读到对方没说出口的情绪",
  W: "紧张时表达容易偏效率，少了一点缓冲",
  B: "在关系压力下容易先顾全对方，晚一点才想起自己的边界",
  C: "遇到突然的冲突或误会时，可能会先被场面带走",
};
