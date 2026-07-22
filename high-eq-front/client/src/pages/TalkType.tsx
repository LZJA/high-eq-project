import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TALKTYPE_DIMENSIONS,
  TALKTYPE_TEST_QUESTIONS,
  buildTalkTypeShareText,
  calculateTalkTypeResult,
  getTalkTypePageSeo,
  getTalkTypeProgress,
  getTalkTypeVisualAsset,
  type TalkTypeAnswer,
} from "@/data/talktype";
import { ArrowLeft, ArrowRight, Brain, Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type TalkTypeStage = "intro" | "test" | "result";

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
  const [, navigate] = useLocation();
  const seo = getTalkTypePageSeo();
  const [stage, setStage] = useState<TalkTypeStage>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, string>>({});

  const currentQuestion = TALKTYPE_TEST_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answersByQuestionId).length;
  const progress = getTalkTypeProgress(answeredCount, TALKTYPE_TEST_QUESTIONS.length);
  const selectedOptionId = answersByQuestionId[currentQuestion.id];
  const canShowResult = answeredCount === TALKTYPE_TEST_QUESTIONS.length;

  const answers = useMemo<TalkTypeAnswer[]>(
    () =>
      TALKTYPE_TEST_QUESTIONS.flatMap((question) => {
        const optionId = answersByQuestionId[question.id];
        return optionId ? [{ questionId: question.id, optionId }] : [];
      }),
    [answersByQuestionId],
  );

  const result = useMemo(() => (canShowResult ? calculateTalkTypeResult(answers) : null), [answers, canShowResult]);
  const visualAsset = result ? getTalkTypeVisualAsset(result.personality.id) : null;
  const canonicalUrl = "https://www.higheq.top/talktype";
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

  const selectOption = (optionId: string) => {
    setAnswersByQuestionId((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const goNext = () => {
    if (currentIndex < TALKTYPE_TEST_QUESTIONS.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    if (canShowResult || selectedOptionId) {
      setStage("result");
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1);
      return;
    }

    setStage("intro");
  };

  const restart = () => {
    setAnswersByQuestionId({});
    setCurrentIndex(0);
    setStage("test");
  };

  const copyShareText = async () => {
    if (!result) return;

    const shareText = buildTalkTypeShareText({
      personalityName: result.personality.name,
      communicationCode: result.communicationCode,
      url: window.location.origin + "/talktype",
    });

    try {
      await navigator.clipboard.writeText(`${result.personality.shareText}\n${shareText}`);
      toast.success("分享文案已复制");
    } catch {
      toast.error("复制失败，可以手动截屏分享结果卡");
    }
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
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={() => setStage("test")}>
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

            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-500/10">
              <div className="relative rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-5">
                <div>
                  <div className="pr-20 sm:pr-24">
                    <p className="text-sm text-stone-500">示例人格</p>
                    <h2 className="mt-2 text-3xl font-semibold">情绪翻译官</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600 sm:whitespace-nowrap">别人没说出口的话，你常常已经听懂。</p>
                  <span className="absolute right-5 top-5 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-xs text-purple-700 shadow-sm">S90 W75</span>
                </div>

                <div className="mt-8 rounded-2xl bg-white/70 p-5 shadow-lg shadow-stone-300/30 backdrop-blur">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
                      <Sparkles className="h-9 w-9" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-500">沟通代码</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">S90 W75 B55 C75</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {[
                      { label: "情绪洞察", value: 90 },
                      { label: "表达温度", value: 75 },
                      { label: "边界稳定", value: 55 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-xs text-stone-500">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 rounded-xl bg-white/70 px-4 py-3 text-sm leading-6 text-stone-600">
                    你的优势是把暧昧、别扭、尴尬的情绪信号，翻译成更容易被接住的话。
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {["潜台词雷达", "关系修复", "沟通代码"].map((item) => (
                    <span key={item} className="rounded-full bg-white/80 px-3 py-1 text-xs text-purple-700 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <TalkTypeSeoContent seo={seo} />
        </main>
      )}

      {stage === "test" && (
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-sm text-stone-500">
              <span>
                {currentIndex + 1} / {TALKTYPE_TEST_QUESTIONS.length}
              </span>
              <span>{progress}% 完成</span>
            </div>
            <Progress value={progress} className="h-2 bg-blue-100 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-blue-600 [&_[data-slot=progress-indicator]]:to-purple-600" />
          </div>

          <section className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg shadow-blue-100/70 backdrop-blur md:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                {categoryLabels[currentQuestion.category]}
              </span>
              <span className="text-sm text-stone-500">{currentQuestion.scene}</span>
            </div>
            <h2 className="text-2xl font-semibold leading-snug md:text-3xl">{currentQuestion.prompt}</h2>

            <div className="mt-8 grid gap-3">
              {currentQuestion.options.map((option) => {
                const selected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(option.id)}
                    className={`flex min-h-16 items-start gap-4 rounded-xl border p-4 text-left transition ${
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
                    <span className="leading-7">{option.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" />
                上一题
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" disabled={!selectedOptionId} onClick={goNext}>
                {currentIndex === TALKTYPE_TEST_QUESTIONS.length - 1 ? "查看结果" : "下一题"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
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
                  <div className="mt-8 flex aspect-square items-center justify-center rounded-2xl bg-white/55">
                    <div className="text-center">
                      <Sparkles className="mx-auto h-16 w-16 text-purple-600" />
                      <p className="mt-5 max-w-56 text-sm leading-6 text-stone-700">{visualAsset.shareText}</p>
                    </div>
                  </div>
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
                <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 px-5 py-4 text-white">
                  <p className="text-xs text-white/70">成熟度</p>
                  <p className="mt-1 text-3xl font-semibold">{result.maturityScore}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {TALKTYPE_DIMENSIONS.map((dimension) => (
                  <div key={dimension.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">
                        {dimension.key} {dimension.name}
                      </span>
                      <span className="text-sm text-stone-500">{result.dimensionScores[dimension.key]}</span>
                    </div>
                    <Progress
                      value={result.dimensionScores[dimension.key]}
                      className="h-2 bg-blue-100 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-blue-600 [&_[data-slot=progress-indicator]]:to-purple-600"
                    />
                    <p className="mt-2 text-sm text-stone-500">{dimension.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <ResultList title="优势" items={result.personality.strengths} />
                <ResultList title="盲区" items={result.personality.blindSpots} />
                <ResultList title="训练方向" items={result.personality.trainingFocus} />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={copyShareText}>
                  <Copy className="h-4 w-4" />
                  复制分享文案
                </Button>
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
    </div>
  );
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
