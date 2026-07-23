import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  TALKTYPE_DIMENSIONS,
  TALKTYPE_TEST_QUESTIONS,
  buildTalkTypeShareReportPayload,
  buildTalkTypeSnapshotReport,
  buildTalkTypeDeepReportRequest,
  buildTalkTypeShareImageFilename,
  buildTalkTypeSharePayload,
  calculateTalkTypeResult,
  getTalkTypePageSeo,
  getTalkTypeProgress,
  getTalkTypeDimensionScoreInsight,
  getTalkTypeVisualAsset,
  loadLatestTalkTypeAnswers,
  saveLatestTalkTypeResult,
  type TalkTypeDeepReport,
  type TalkTypeAnswer,
} from "@/data/talktype";
import { guestApi } from "@/lib/api";
import { ArrowLeft, ArrowRight, Brain, Check, Download, RotateCcw, Share2, Sparkles } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type TalkTypeStage = "intro" | "test" | "complete" | "result";

const categoryLabels: Record<string, string> = {
  relationship: "亲密关系",
  workplace: "职场沟通",
  friendship: "朋友相处",
  family: "家庭边界",
  boundary: "边界表达",
  repair: "关系修复",
};

function TalkTypeLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm shadow-blue-500/20">
        <Brain className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-none text-gray-900">TalkType</p>
        <p className="mt-1 text-xs text-stone-500">沟通人格测试</p>
      </div>
    </div>
  );
}

export default function TalkType() {
  const [location, navigate] = useLocation();
  const seo = getTalkTypePageSeo();
  const [stage, setStage] = useState<TalkTypeStage>(location === "/talktype/result" ? "result" : "intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, string>>({});
  const [sharePreviewImage, setSharePreviewImage] = useState<{ url: string; filename: string } | null>(null);
  const [deepReport, setDeepReport] = useState<TalkTypeDeepReport | null>(null);
  const [isDeepReportLoading, setIsDeepReportLoading] = useState(false);
  const [isDeepReportFailed, setIsDeepReportFailed] = useState(false);
  const [isResultRouteReady, setIsResultRouteReady] = useState(false);
  const [deepReportRetryCount, setDeepReportRetryCount] = useState(0);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const deepReportRequestKeyRef = useRef<string | null>(null);

  const currentQuestion = TALKTYPE_TEST_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answersByQuestionId).length;
  const progress = getTalkTypeProgress(answeredCount, TALKTYPE_TEST_QUESTIONS.length);
  const selectedOptionId = answersByQuestionId[currentQuestion.id];
  const canShowResult = answeredCount === TALKTYPE_TEST_QUESTIONS.length;
  const isLastQuestion = currentIndex === TALKTYPE_TEST_QUESTIONS.length - 1;
  const canViewResult = canShowResult && (stage === "complete" || isLastQuestion);

  const answers = useMemo<TalkTypeAnswer[]>(
    () =>
      TALKTYPE_TEST_QUESTIONS.flatMap((question) => {
        const optionId = answersByQuestionId[question.id];
        return optionId ? [{ questionId: question.id, optionId }] : [];
      }),
    [answersByQuestionId],
  );
  const answersKey = useMemo(() => answers.map((answer) => `${answer.questionId}:${answer.optionId}`).join("|"), [answers]);

  const result = useMemo(() => (canShowResult ? calculateTalkTypeResult(answers) : null), [answers, canShowResult]);
  const visualAsset = result ? getTalkTypeVisualAsset(result.personality.id) : null;
  const snapshotReport = result ? buildTalkTypeSnapshotReport(result) : null;
  const introVisualAsset = getTalkTypeVisualAsset("emotion-translator");
  const canonicalUrl = "https://www.higheq.top/talktype";
  const isOwnResultRoute = location === "/talktype/result";
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: seo.h1,
      description: seo.description,
      url: canonicalUrl,
      inLanguage: "zh-CN",
      educationalUse: "Self assessment",
      assesses: ["沟通人格", "情绪洞察", "表达温度", "边界稳定", "局势掌控"],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current === null) return;

    window.clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = null;
  };

  const selectOption = (optionId: string) => {
    clearAutoAdvanceTimer();
    const questionIndex = currentIndex;
    const questionId = currentQuestion.id;
    const nextAnswersByQuestionId = { ...answersByQuestionId, [questionId]: optionId };

    setAnswersByQuestionId(nextAnswersByQuestionId);

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;

      if (questionIndex < TALKTYPE_TEST_QUESTIONS.length - 1) {
        setCurrentIndex((value) => (value === questionIndex ? questionIndex + 1 : value));
        return;
      }

      const answeredQuestionIds = new Set(Object.keys(nextAnswersByQuestionId));

      if (answeredQuestionIds.size === TALKTYPE_TEST_QUESTIONS.length) {
        setStage("complete");
        return;
      }

      const firstMissingQuestionIndex = TALKTYPE_TEST_QUESTIONS.findIndex((question) => !answeredQuestionIds.has(question.id));
      if (firstMissingQuestionIndex >= 0) {
        setStage("test");
        setCurrentIndex(firstMissingQuestionIndex);
        toast.message(`还有 ${TALKTYPE_TEST_QUESTIONS.length - answeredQuestionIds.size} 道题未完成，先补一下`);
      }
    }, 180);
  };

  const viewResult = () => {
    if (!canShowResult) return;

    saveLatestTalkTypeResult(answers);
    setStage("result");
    navigate("/talktype/result");
  };

  const goBack = () => {
    clearAutoAdvanceTimer();

    if (stage === "complete") {
      setStage("test");
    }

    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1);
      return;
    }

    setStage("intro");
  };

  const restart = () => {
    deepReportRequestKeyRef.current = null;
    setAnswersByQuestionId({});
    setCurrentIndex(0);
    setStage("test");
    navigate("/talktype");
  };

  useEffect(() => {
    if (!isOwnResultRoute) {
      setIsResultRouteReady(false);
      return;
    }

    setIsResultRouteReady(false);

    const latestAnswers = loadLatestTalkTypeAnswers();
    if (!latestAnswers.length) {
      setStage("result");
      setIsResultRouteReady(true);
      return;
    }

    setAnswersByQuestionId(
      Object.fromEntries(latestAnswers.map((answer) => [answer.questionId, answer.optionId])),
    );
    setCurrentIndex(TALKTYPE_TEST_QUESTIONS.length - 1);
    setStage("result");
    setIsResultRouteReady(true);
  }, [isOwnResultRoute]);

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();

      if (sharePreviewImage) {
        URL.revokeObjectURL(sharePreviewImage.url);
      }
    };
  }, [sharePreviewImage]);

  useEffect(() => {
    if (stage !== "result" || !result || !isOwnResultRoute || !isResultRouteReady) {
      setDeepReport(null);
      setIsDeepReportLoading(false);
      setIsDeepReportFailed(false);
      if (stage !== "result") {
        deepReportRequestKeyRef.current = null;
      }
      return;
    }

    if (!result) return;

    const requestKey = `${answersKey}#${deepReportRetryCount}`;
    if (deepReportRequestKeyRef.current === requestKey) {
      return;
    }

    let ignore = false;
    deepReportRequestKeyRef.current = requestKey;
    setDeepReport(null);
    setIsDeepReportLoading(true);
    setIsDeepReportFailed(false);

    guestApi
      .generateTalkTypeDeepReport(buildTalkTypeDeepReportRequest(result))
      .then((response) => {
        if (!ignore && response.data) {
          if (!response.data.hiddenPattern) {
            deepReportRequestKeyRef.current = null;
            setDeepReport(null);
            setIsDeepReportFailed(true);
            return;
          }
          setDeepReport(response.data);
        }
      })
      .catch(() => {
        if (!ignore) {
          deepReportRequestKeyRef.current = null;
          setDeepReport(null);
          setIsDeepReportFailed(true);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsDeepReportLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [answersKey, deepReportRetryCount, isOwnResultRoute, isResultRouteReady, stage]);

  const retryDeepReport = () => {
    deepReportRequestKeyRef.current = null;
    setDeepReport(null);
    setIsDeepReportFailed(false);
    setDeepReportRetryCount((value) => value + 1);
  };

  const ensureDeepReportForShare = async () => {
    if (!result) return null;
    if (deepReport) return deepReport;

    toast.message("正在补全 AI 深度报告，马上就能分享完整结果");
    setIsDeepReportLoading(true);
    setIsDeepReportFailed(false);

    const response = await guestApi.generateTalkTypeDeepReport(buildTalkTypeDeepReportRequest(result));
    if (!response.data?.hiddenPattern) {
      throw new Error("AI deep report is empty");
    }
    setDeepReport(response.data);
    setIsDeepReportLoading(false);
    return response.data;
  };

  const createPublicShareUrl = async () => {
    if (!result || !visualAsset) return window.location.origin + "/talktype";

    const reportForShare = await ensureDeepReportForShare();
    const response = await guestApi.createTalkTypeShareReport(buildTalkTypeShareReportPayload(result, visualAsset, reportForShare));
    return window.location.origin + response.data.shareUrl;
  };

  const shareResult = async () => {
    if (!result) return;

    try {
      const shareUrl = await createPublicShareUrl();
      const payload = buildTalkTypeSharePayload({
        personalityName: result.personality.name,
        communicationCode: result.communicationCode,
        url: shareUrl,
        personalityShareText: result.personality.shareText,
      });

      if (navigator.share) {
        await navigator.share(payload);
        return;
      }

      await navigator.clipboard.writeText(payload.text);
      toast.success("分享文案已复制");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setIsDeepReportLoading(false);
      if (error instanceof Error && error.message === "AI deep report is empty") {
        setIsDeepReportFailed(true);
      }
      toast.error("分享失败，可以稍后再试");
    }
  };

  const saveShareCardImage = async () => {
    if (!result || !visualAsset) return;

    try {
      const filename = buildTalkTypeShareImageFilename(visualAsset.assetId);
      const blob = await buildShareCardBlob({
        communicationCode: result.communicationCode,
        personalityName: result.personality.name,
        primaryColor: visualAsset.primaryColor,
        secondaryColor: visualAsset.secondaryColor,
        shareText: visualAsset.shareText,
        tagline: result.personality.tagline,
        testUrl: window.location.origin + "/talktype",
        visualAssetImagePath: visualAsset.imagePath,
      });
      const isMobileLike = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

      if (isMobileLike) {
        if (sharePreviewImage) {
          URL.revokeObjectURL(sharePreviewImage.url);
        }
        setSharePreviewImage({ filename, url: URL.createObjectURL(blob) });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("结果卡图片已保存");
    } catch {
      toast.error("保存图片失败，可以先复制文案或手动截图");
    }
  };

  const closeSharePreview = (open: boolean) => {
    if (open) return;

    if (sharePreviewImage) {
      URL.revokeObjectURL(sharePreviewImage.url);
    }
    setSharePreviewImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords="TalkType,沟通人格测试,情商测试,EQ测试,高情商测试,MBTI式人格测试,高情商回复"
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />

      <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button type="button" onClick={() => navigate("/")} className="text-left">
            <TalkTypeLogo />
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="hidden text-stone-600 sm:inline-flex" onClick={() => navigate("/app")}>
              高情商回复
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={() => {
              setStage("test");
              navigate("/talktype");
            }}>
              开始测试
            </Button>
          </div>
        </div>
      </header>

      {stage === "intro" && (
        <main>
          <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1fr_420px] md:items-center md:py-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/70 px-4 py-2 text-sm text-blue-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-purple-600" />
                24 道真实沟通场景，生成专属沟通代码
              </div>
              <h1 className="max-w-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-semibold leading-tight tracking-normal text-transparent md:text-6xl">
                TalkType 沟通人格测试
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
                你不是情商高或低，你只是有一种独特的说话方式。用 SWBC 四维模型测出你的沟通人格、表达优势和容易踩坑的关系场景。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 px-7 text-white hover:from-blue-700 hover:to-purple-700" onClick={() => setStage("test")}>
                  开始测试 <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-10 grid gap-3 text-sm text-stone-600 sm:grid-cols-3">
                {["SWBC 四维画像", "结果可分享", "12 种人格结果"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-500/10">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
                <div className="absolute left-5 top-5 z-10 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-purple-700 shadow-sm backdrop-blur">示例人格</div>
                <div className="absolute right-5 top-5 z-10 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-xs text-purple-700 shadow-sm backdrop-blur">S90 W75</div>
                <div className="aspect-[4/5] overflow-hidden">
                  {introVisualAsset?.imagePath ? (
                    <img
                      src={introVisualAsset.imagePath}
                      alt="情绪翻译官人格插画"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Sparkles className="h-16 w-16 text-purple-600" />
                    </div>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-white/0 px-5 pb-5 pt-20">
                  <h2 className="text-3xl font-semibold text-gray-900">情绪翻译官</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">别人没说出口的话，你常常已经听懂。</p>
                  <div className="mt-4 rounded-2xl bg-white/80 p-4 shadow-lg shadow-stone-300/25 backdrop-blur">
                    <p className="text-xs font-medium text-stone-500">沟通代码</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">S90 W75 B55 C75</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["潜台词雷达", "关系修复", "表达翻译"].map((item) => (
                        <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <TalkTypeSeoContent seo={seo} />
        </main>
      )}

      {(stage === "test" || stage === "complete") && (
        <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 md:py-10">
          <div className="mb-4 md:mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-stone-500 sm:text-sm">
              <span>
                {currentIndex + 1} / {TALKTYPE_TEST_QUESTIONS.length}
              </span>
              <span>{progress}% 完成</span>
            </div>
            <Progress value={progress} className="h-2 bg-blue-100 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-blue-600 [&_[data-slot=progress-indicator]]:to-purple-600" />
          </div>

          <section className="rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-lg shadow-blue-100/70 backdrop-blur md:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-6 md:gap-3">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                {categoryLabels[currentQuestion.category]}
              </span>
              <span className="text-xs text-stone-500 sm:text-sm">{currentQuestion.scene}</span>
            </div>
            <h2 className="text-xl font-semibold leading-snug sm:text-2xl md:text-3xl">{currentQuestion.prompt}</h2>

            <div className="mt-4 grid gap-2.5 md:mt-8 md:gap-3">
              {currentQuestion.options.map((option) => {
                const selected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(option.id)}
                    className={`flex min-h-14 items-start gap-3 rounded-xl border p-3 text-left text-sm transition sm:min-h-16 sm:gap-4 sm:p-4 sm:text-base ${
                      selected
                        ? "border-blue-300 bg-blue-50 text-gray-900 shadow-sm"
                        : "border-blue-100 bg-white hover:border-purple-300 hover:bg-blue-50/40"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        selected ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white" : "bg-blue-50 text-slate-600"
                      }`}
                    >
                      {option.id.toUpperCase()}
                    </span>
                    <span className="leading-6 sm:leading-7">{option.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between md:mt-8">
              <Button variant="outline" className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" />
                上一题
              </Button>
              {canViewResult ? (
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={viewResult}>
                  查看我的结果 <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <span className="text-xs text-stone-400">选择后自动进入下一题</span>
              )}
            </div>
          </section>
        </main>
      )}

      {stage === "result" && !result && (
        <main className="mx-auto max-w-3xl px-4 py-16">
          <section className="rounded-2xl border border-blue-100 bg-white/90 p-8 text-center shadow-lg shadow-blue-100/70">
            <Sparkles className="mx-auto h-10 w-10 text-purple-600" />
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">还没有可查看的 TalkType 结果</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              完成 24 道沟通场景题后，会在这里生成你的完整人格报告。
            </p>
            <Button className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={() => {
              setStage("test");
              navigate("/talktype");
            }}>
              开始测试
            </Button>
          </section>
        </main>
      )}

      {stage === "result" && result && visualAsset && (
        <main className="mx-auto max-w-6xl px-4 py-10">
          <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-100/70">
              <div
                className="p-6"
                style={{
                  background: `linear-gradient(135deg, ${visualAsset.primaryColor}, ${visualAsset.secondaryColor})`,
                }}
              >
                <div className="rounded-2xl bg-white/80 p-5 backdrop-blur">
                  <p className="text-sm text-stone-600">我的 TalkType 是</p>
                  <h2 className="mt-2 text-4xl font-semibold">{result.personality.name}</h2>
                  <p className="mt-3 text-stone-700">{result.personality.tagline}</p>
                  <div className="mt-8 overflow-hidden rounded-2xl bg-white/55">
                    {visualAsset.imagePath ? (
                      <img
                        src={visualAsset.imagePath}
                        alt={`${result.personality.name}人格插画`}
                        className="aspect-square w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center">
                        <div className="text-center">
                          <Sparkles className="mx-auto h-16 w-16 text-purple-600" />
                          <p className="mt-5 max-w-56 text-sm leading-6 text-stone-700">{visualAsset.shareText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700">{visualAsset.shareText}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {visualAsset.symbolicObjects.map((item) => (
                      <span key={item} className="rounded-full bg-white px-3 py-1 text-xs text-stone-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg shadow-blue-100/70 backdrop-blur md:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-blue-100 pb-6 md:flex-row md:items-start">
                <div>
                  <p className="text-sm text-stone-500">沟通代码</p>
                  <h3 className="mt-2 text-3xl font-semibold">{result.communicationCode}</h3>
                  <p className="mt-3 max-w-2xl leading-7 text-stone-600">{result.personality.summary}</p>
                </div>
                <div className="min-w-20 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 px-5 py-4 text-center text-white">
                  <p className="whitespace-nowrap text-xs text-white/70">成熟度</p>
                  <p className="mt-1 text-3xl font-semibold">{result.maturityScore}</p>
                </div>
              </div>

              {snapshotReport && (
                <SnapshotReportCards report={snapshotReport} />
              )}

              <div className="mt-6 grid gap-4">
                {TALKTYPE_DIMENSIONS.map((dimension) => {
                  const score = result.dimensionScores[dimension.key];

                  return (
                    <div key={dimension.key}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">
                          {dimension.key} {dimension.name}
                        </span>
                        <span className="text-sm text-stone-500">{score}</span>
                      </div>
                      <Progress
                        value={score}
                        className="h-2 bg-blue-100 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-blue-600 [&_[data-slot=progress-indicator]]:to-purple-600"
                      />
                      <p className="mt-2 text-sm leading-6 text-stone-500">
                        {getTalkTypeDimensionScoreInsight(dimension.key, score)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {isDeepReportLoading && <DeepReportLoadingSection />}
              {!isDeepReportLoading && isDeepReportFailed && <DeepReportErrorSection onRetry={retryDeepReport} />}
              {!isDeepReportLoading && deepReport && <DeepReportSection report={deepReport} />}

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <ResultList title="优势" items={result.personality.strengths} />
                <ResultList title="盲区" items={result.personality.blindSpots} />
                <ResultList title="训练方向" items={result.personality.trainingFocus} />
              </div>

              <div className="mt-8 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-5">
                <div className="grid gap-5 xl:grid-cols-[1fr_260px] xl:items-center">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">分享你的 TalkType 身份卡</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
                      保存带二维码的结果卡，朋友扫码就能直接进入测试页。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 px-3 text-white hover:from-blue-700 hover:to-purple-700" onClick={saveShareCardImage}>
                      <Download className="h-4 w-4 shrink-0" />
                      <span className="truncate">保存图片</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 border-blue-200 bg-white px-3 text-blue-700 hover:bg-blue-50"
                      onClick={shareResult}
                      disabled={isDeepReportLoading}
                    >
                      <Share2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{isDeepReportLoading ? "生成中" : "分享结果"}</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50" onClick={restart}>
                  <RotateCcw className="h-4 w-4" />
                  重新测试
                </Button>
              </div>
            </div>
          </section>

          <section className="mt-8">
            {seo.internalLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                className="flex w-full flex-col justify-between gap-4 rounded-xl border border-blue-100 bg-white p-5 text-left transition hover:border-purple-300 hover:shadow-md sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{link.label}</p>
                  <p className="mt-2 text-sm text-stone-500">把刚测出的沟通人格，用到真实聊天回复里。</p>
                </div>
                <ArrowRight className="h-4 w-4 text-purple-600" />
              </button>
            ))}
          </section>
        </main>
      )}

      <Dialog open={!!sharePreviewImage} onOpenChange={closeSharePreview}>
        <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto p-4 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>保存 TalkType 结果卡</DialogTitle>
            <DialogDescription>长按图片，选择“保存图片”即可存到手机相册。</DialogDescription>
          </DialogHeader>
          {sharePreviewImage && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                <img
                  src={sharePreviewImage.url}
                  alt="TalkType 结果卡预览"
                  className="h-auto w-full select-auto"
                  draggable={false}
                />
              </div>
              <p className="text-center text-xs leading-5 text-stone-500">
                如果浏览器不支持长按保存，可以截图保存这张卡片。
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

async function buildShareCardBlob(input: {
  communicationCode: string;
  personalityName: string;
  primaryColor: string;
  secondaryColor: string;
  shareText: string;
  tagline: string;
  testUrl: string;
  visualAssetImagePath?: string;
}): Promise<Blob> {
  const [personaImage, qrImage] = await Promise.all([
    loadCanvasImage(input.visualAssetImagePath),
    QRCode.toDataURL(input.testUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    }).then(loadCanvasImage),
  ]);
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1500;
  const scale = window.devicePixelRatio > 1 ? 2 : 1;
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported");
  }

  context.scale(scale, scale);
  drawTalkTypeShareCard(context, {
    width,
    height,
    personaImage,
    qrImage,
    personalityName: input.personalityName,
    tagline: input.tagline,
    shareText: input.shareText,
    communicationCode: input.communicationCode,
    testUrl: input.testUrl,
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor,
  });

  return canvasToPngBlob(canvas);
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Failed to render canvas as PNG"));
    }, "image/png");
  });
}

function loadCanvasImage(src?: string): Promise<HTMLImageElement> {
  if (!src) {
    return Promise.reject(new Error("Image source is missing"));
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function drawTalkTypeShareCard(
  context: CanvasRenderingContext2D,
  input: {
    width: number;
    height: number;
    personaImage: HTMLImageElement;
    qrImage: HTMLImageElement;
    personalityName: string;
    tagline: string;
    shareText: string;
    communicationCode: string;
    testUrl: string;
    primaryColor: string;
    secondaryColor: string;
  },
) {
  const background = context.createLinearGradient(0, 0, input.width, input.height);
  background.addColorStop(0, input.primaryColor);
  background.addColorStop(1, input.secondaryColor);
  context.fillStyle = background;
  context.fillRect(0, 0, input.width, input.height);

  context.fillStyle = "rgba(255,255,255,0.9)";
  drawRoundRect(context, 64, 64, input.width - 128, input.height - 128, 48);
  context.fill();

  context.fillStyle = "#4F46E5";
  context.font = '600 34px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText("TalkType 沟通人格测试", 112, 138);

  context.fillStyle = "#6B7280";
  context.font = '400 26px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText("我的 TalkType 是", 112, 208);

  context.fillStyle = "#111827";
  context.font = '700 76px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(input.personalityName, 112, 300);

  context.fillStyle = "#374151";
  context.font = '400 30px "PingFang SC", "Microsoft YaHei", sans-serif';
  wrapCanvasText(context, input.tagline, 112, 360, 856, 42, 2);

  drawCoverImage(context, input.personaImage, 112, 430, 856, 620, 40);

  context.fillStyle = "#374151";
  context.font = '400 30px "PingFang SC", "Microsoft YaHei", sans-serif';
  wrapCanvasText(context, input.shareText, 152, 1144, 620, 42, 2);

  context.fillStyle = "#111827";
  context.font = '700 34px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(input.communicationCode, 152, 1210);

  context.fillStyle = "#FFFFFF";
  drawRoundRect(context, 740, 1106, 180, 180, 24);
  context.fill();
  context.drawImage(input.qrImage, 760, 1126, 140, 140);

  context.fillStyle = "#6B7280";
  context.font = '400 24px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText("扫码测试", 778, 1328);

  context.fillStyle = "#6B7280";
  context.font = '400 22px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.fillText(input.testUrl, 112, 1394);
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.save();
  drawRoundRect(context, x, y, width, height, radius);
  context.clip();

  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = Math.max(0, (image.height - sourceHeight) * 0.08);
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  context.restore();
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const characters = Array.from(text);
  let line = "";
  let lines = 0;

  for (const character of characters) {
    const testLine = line + character;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(lines === maxLines - 1 ? `${line}…` : line, x, y);
      lines += 1;
      if (lines >= maxLines) return;
      y += lineHeight;
      line = character;
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    context.fillText(line, x, y);
  }
}

function drawRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function TalkTypeSeoContent({ seo }: { seo: ReturnType<typeof getTalkTypePageSeo> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
      <div className="border-t border-blue-100 pt-10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-blue-600">TalkType 指南</p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900 md:text-3xl">先理解自己的沟通人格，再训练高情商表达</h2>
          <p className="mt-4 leading-7 text-stone-600">{seo.intro}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {seo.contentSections?.map((section) => (
            <article key={section.title} className="rounded-2xl border border-blue-100 bg-white/85 p-5 shadow-sm shadow-blue-100/60">
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{section.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {section.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    {keyword}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-purple-100 bg-white/85 p-5 shadow-sm shadow-purple-100/60">
          <h2 className="text-xl font-semibold text-gray-900">常见问题</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {seo.faq.map((item) => (
              <article key={item.question}>
                <h3 className="font-medium text-gray-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DeepReportLoadingSection() {
  return (
    <section className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-5 shadow-sm shadow-amber-100/70 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            AI 深度报告
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-gray-900">AI 正在认真读懂你</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            正在生成专属深度报告，可能需要几秒钟。先别急，这份报告正在努力变得更像你。
          </p>
        </div>
        <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-xs text-amber-700 ring-1 ring-amber-100">
          生成中
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {[0, 1].map((item) => (
          <article key={item} className="rounded-2xl bg-white/85 p-5 ring-1 ring-amber-100">
            <div className="h-4 w-32 animate-pulse rounded-full bg-amber-100" />
            <div className="mt-5 space-y-3">
              <div className="h-3 animate-pulse rounded-full bg-stone-100" />
              <div className="h-3 w-11/12 animate-pulse rounded-full bg-stone-100" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-stone-100" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DeepReportErrorSection({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mt-8 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-sm shadow-rose-100/60 md:p-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-100">
        <Sparkles className="h-3.5 w-3.5" />
        AI 深度报告
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-gray-900">情商太高啦，服务器先懵了一下</h3>
      <p className="mt-2 text-sm leading-7 text-stone-600">
        这次 AI 深度报告生成失败了，不是你的问题，是服务器刚刚没接住你的高阶沟通信号。可以稍后重新进入结果页再试一次。
      </p>
      <Button className="mt-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={onRetry}>
        重新生成
      </Button>
    </section>
  );
}

function DeepReportSection({ report }: { report: TalkTypeDeepReport }) {
  const relationshipLabels = {
    relationship: "亲密关系里的你",
    workplace: "职场沟通里的你",
    friendship: "朋友眼中的你",
  };

  return (
    <section className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-5 shadow-sm shadow-amber-100/70 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            AI 深度报告
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-gray-900">为什么你会这样沟通？</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            把你的四维分数和人格画像翻译成更生活化的解读，看看哪些沟通习惯正在影响你的关系体验。
          </p>
        </div>
        <span className="w-fit whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-xs text-stone-500 ring-1 ring-stone-100">
          解读完成
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl bg-white/85 p-5 ring-1 ring-amber-100">
          <p className="text-sm font-semibold text-amber-700">AI 读到的隐藏模式</p>
          <p className="mt-3 text-sm leading-7 text-stone-700">{report.hiddenPattern}</p>
          <div className="mt-5 rounded-xl bg-amber-50/80 p-4">
            <p className="text-sm font-semibold text-gray-900">你真正需要的</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">{report.innerNeed}</p>
          </div>
        </article>

        <article className="rounded-2xl bg-white/85 p-5 ring-1 ring-blue-100">
          <p className="text-sm font-semibold text-blue-700">最容易戳中你的三句话</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {report.triggerPhrases.slice(0, 3).map((phrase) => (
              <span key={phrase} className="rounded-full bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {phrase}
              </span>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-blue-50/80 p-4">
            <p className="text-sm font-semibold text-gray-900">别人可能误解你的地方</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">{report.misreadByOthers}</p>
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {Object.entries(report.relationshipNotes).map(([key, value]) => (
          <article key={key} className="rounded-2xl bg-white/80 p-4 ring-1 ring-stone-100">
            <p className="text-sm font-semibold text-gray-900">{relationshipLabels[key as keyof typeof relationshipLabels]}</p>
            <p className="mt-2 text-sm leading-7 text-stone-600">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl bg-white/80 p-5 ring-1 ring-purple-100">
          <p className="text-sm font-semibold text-purple-700">一句专属提醒</p>
          <p className="mt-3 text-sm leading-7 text-stone-700">{report.growthSuggestion}</p>
        </article>
        <article className="rounded-2xl bg-white/80 p-5 ring-1 ring-green-100">
          <p className="text-sm font-semibold text-green-700">接下来可以练什么</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
            {report.practicePrompts.slice(0, 3).map((prompt) => (
              <li key={prompt}>· {prompt}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function SnapshotReportCards({ report }: { report: ReturnType<typeof buildTalkTypeSnapshotReport> }) {
  const cards: Array<{ title: string; body: string; tags?: string[] }> = [
    report.identityInsight,
    report.externalImpression,
    report.blindSpotInsight,
  ];

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 p-4 shadow-sm shadow-blue-100/50">
          <h4 className="text-base font-semibold text-gray-900">{card.title}</h4>
          {card.tags && (
            <div className="mt-3 flex flex-wrap gap-2">
              {card.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-blue-700 ring-1 ring-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm leading-7 text-stone-600">{card.body}</p>
        </article>
      ))}
    </section>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-blue-50/70 p-4">
      <h4 className="font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
