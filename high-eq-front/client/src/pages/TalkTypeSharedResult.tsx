import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  TALKTYPE_DIMENSIONS,
  TALKTYPE_PERSONALITIES,
  buildTalkTypeSharePayload,
  buildTalkTypeSnapshotReport,
  buildTalkTypeWechatSharePayload,
  getTalkTypeSharedResultShareAction,
  getTalkTypeDimensionScoreInsight,
  isWeChatBrowser,
  type TalkTypeDeepReport,
  type TalkTypeShareReport,
} from "@/data/talktype";
import { guestApi } from "@/lib/api";
import { ArrowRight, Brain, Share2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    wx?: {
      config: (config: {
        debug: boolean;
        appId: string;
        timestamp: number;
        nonceStr: string;
        signature: string;
        jsApiList: string[];
      }) => void;
      ready: (callback: () => void) => void;
      error: (callback: (error: unknown) => void) => void;
      updateAppMessageShareData: (payload: { title: string; desc: string; link: string; imgUrl: string }) => void;
      updateTimelineShareData: (payload: { title: string; link: string; imgUrl: string }) => void;
      onMenuShareAppMessage?: (payload: { title: string; desc: string; link: string; imgUrl: string }) => void;
      onMenuShareTimeline?: (payload: { title: string; link: string; imgUrl: string }) => void;
    };
  }
}

const WECHAT_JS_SDK_URL = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
let wechatJsSdkPromise: Promise<void> | null = null;

export default function TalkTypeSharedResult({ shareId }: { shareId: string }) {
  const [, navigate] = useLocation();
  const [report, setReport] = useState<TalkTypeShareReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [sharedDeepReport, setSharedDeepReport] = useState<TalkTypeDeepReport | null>(null);
  const [shareGuideOpen, setShareGuideOpen] = useState(false);
  const [wechatShareReady, setWechatShareReady] = useState(false);
  const [wechatShareDebug, setWechatShareDebug] = useState<string[]>([]);

  const isWechatDebugEnabled =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("wechatDebug") === "1";
  const isWechatClient = typeof navigator !== "undefined" && isWeChatBrowser(navigator.userAgent);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setFailed(false);

    guestApi
      .getTalkTypeShareReport(shareId)
      .then((response) => {
        if (!ignore) {
          setReport(response.data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setFailed(true);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [shareId]);

  const title = report ? `TA 的 TalkType 是「${report.personalityName}」` : "TalkType 沟通人格结果";
  const localPersonality = report ? TALKTYPE_PERSONALITIES.find((item) => item.id === report.personalityId) : undefined;
  const fallbackSnapshot = localPersonality
    ? buildTalkTypeSnapshotReport({
      personality: localPersonality,
      secondaryPersonality: null,
      dimensionScores: report?.dimensionScores || localPersonality.center,
      maturityScore: report?.maturityScore || 0,
      communicationCode: report?.communicationCode || "",
      matchDistance: 0,
    })
    : null;
  const snapshotReport = report?.snapshotReport?.identityInsight ? report.snapshotReport : fallbackSnapshot;
  const dimensionScores = report?.dimensionScores && Object.keys(report.dimensionScores).length ? report.dimensionScores : localPersonality?.center;
  const strengths = report?.strengths?.length ? report.strengths : localPersonality?.strengths || report?.tags || [];
  const blindSpots = report?.blindSpots?.length ? report.blindSpots : localPersonality?.blindSpots || [];
  const trainingFocus = report?.trainingFocus?.length ? report.trainingFocus : localPersonality?.trainingFocus || [];
  const relationshipBehavior = report?.relationshipBehavior || localPersonality?.relationshipBehavior;
  const workplaceBehavior = report?.workplaceBehavior || localPersonality?.workplaceBehavior;
  const friendshipBehavior = report?.friendshipBehavior || localPersonality?.friendshipBehavior;
  const shareUrl = `https://www.higheq.top/talktype/result/${shareId}`;
  const sharePayload = report
    ? buildTalkTypeSharePayload({
      personalityName: report.personalityName,
      communicationCode: report.communicationCode,
      url: shareUrl,
      personalityShareText: report.shareText,
    })
    : null;
  const shareImageUrl = report?.imagePath ? new URL(report.imagePath, "https://www.higheq.top").toString() : undefined;

  useEffect(() => {
    if (!report) {
      setSharedDeepReport(null);
      return;
    }

    if (report.deepReport?.hiddenPattern) {
      setSharedDeepReport(report.deepReport);
      return;
    }

    setSharedDeepReport(null);
  }, [report]);

  useEffect(() => {
    if (!report) return;

    const expectedPath = `/talktype/result/${shareId}`;
    if (window.sessionStorage.getItem("talktype-open-share-guide") === expectedPath) {
      window.sessionStorage.removeItem("talktype-open-share-guide");
      setShareGuideOpen(true);
    }
  }, [report, shareId]);

  useEffect(() => {
    const pushWechatDebug = (message: string) => {
      if (!isWechatDebugEnabled) return;
      setWechatShareDebug((items) => [...items.slice(-10), `${new Date().toLocaleTimeString()} ${message}`]);
    };

    if (!report || !shareImageUrl || !isWeChatBrowser(window.navigator.userAgent)) {
      setWechatShareReady(false);
      pushWechatDebug(`skip config: report=${Boolean(report)} image=${Boolean(shareImageUrl)} wechat=${isWeChatBrowser(window.navigator.userAgent)}`);
      return;
    }

    let ignore = false;
    setWechatShareReady(false);
    const wechatSharePayload = buildTalkTypeWechatSharePayload({
      personalityName: report.personalityName,
      communicationCode: report.communicationCode,
      url: shareUrl,
      imagePath: shareImageUrl,
      identityInsight: report.identityInsight || report.snapshotReport?.identityInsight?.body,
    });
    const signatureUrl = window.location.href.split("#")[0];
    pushWechatDebug(`start config url=${signatureUrl}`);
    pushWechatDebug(`payload link=${wechatSharePayload.link}`);
    pushWechatDebug(`payload img=${wechatSharePayload.imgUrl}`);

    loadWechatJsSdk()
      .then(() => {
        pushWechatDebug(`sdk loaded wx=${Boolean(window.wx)}`);
        return guestApi.getWechatJsSdkSignature(signatureUrl);
      })
      .then((response) => {
        if (ignore || !window.wx) return;
        pushWechatDebug(`signature ok apis=${response.data.jsApiList.join(",")}`);

        window.wx.config({
          debug: false,
          appId: response.data.appId,
          timestamp: response.data.timestamp,
          nonceStr: response.data.nonceStr,
          signature: response.data.signature,
          jsApiList: response.data.jsApiList,
        });
        window.wx.ready(() => {
          if (!window.wx) return;
          pushWechatDebug("wx.ready");
          window.wx.updateAppMessageShareData(wechatSharePayload);
          window.wx.onMenuShareAppMessage?.(wechatSharePayload);
          window.wx.updateTimelineShareData({
            title: wechatSharePayload.title,
            link: wechatSharePayload.link,
            imgUrl: wechatSharePayload.imgUrl,
          });
          window.wx.onMenuShareTimeline?.({
            title: wechatSharePayload.title,
            link: wechatSharePayload.link,
            imgUrl: wechatSharePayload.imgUrl,
          });
          setWechatShareReady(true);
        });
        window.wx.error((error) => {
          setWechatShareReady(false);
          pushWechatDebug(`wx.error ${JSON.stringify(error)}`);
          console.warn("WeChat JS-SDK config failed", error);
        });
      })
      .catch((error) => {
        setWechatShareReady(false);
        pushWechatDebug(`setup failed ${error instanceof Error ? error.message : String(error)}`);
        console.warn("WeChat JS-SDK share setup failed", error);
      });

    return () => {
      ignore = true;
    };
  }, [report, shareId, shareImageUrl, shareUrl]);

  const handleShareResult = async () => {
    if (!sharePayload) return;

    const action = getTalkTypeSharedResultShareAction({
      canNativeShare: typeof navigator.share === "function",
      userAgent: navigator.userAgent,
    });

    if (action === "native-share") {
      try {
        await navigator.share(sharePayload);
        setShareGuideOpen(false);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    setShareGuideOpen(true);
  };

  const copyShareLink = async () => {
    if (!sharePayload) return;

    await navigator.clipboard.writeText(`${sharePayload.text}\n${sharePayload.url}`);
    setShareGuideOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900">
      <SEO
        title={`${title} - TalkType 沟通人格测试`}
        description={report?.identityInsight || "查看朋友分享的 TalkType 沟通人格结果，并测测你自己的沟通人格。"}
        canonicalUrl={shareUrl}
        imageUrl={shareImageUrl}
      />

      <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button type="button" onClick={() => navigate("/talktype")} className="flex items-center gap-2 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm shadow-blue-500/20">
              <Brain className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-none text-gray-900">TalkType</span>
              <span className="mt-1 block text-xs text-stone-500">沟通人格测试</span>
            </span>
          </button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={() => navigate("/talktype")}>
            我也测测
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {loading && (
          <section className="rounded-2xl border border-blue-100 bg-white/90 p-8 text-center shadow-lg shadow-blue-100/70">
            <Sparkles className="mx-auto h-10 w-10 animate-pulse text-purple-600" />
            <p className="mt-4 text-stone-600">正在打开这份 TalkType 结果...</p>
          </section>
        )}

        {!loading && failed && (
          <section className="rounded-2xl border border-blue-100 bg-white/90 p-8 text-center shadow-lg shadow-blue-100/70">
            <h1 className="text-2xl font-semibold text-gray-900">这份分享结果暂时无法查看</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">可能是链接已失效，或者网络暂时不可用。你可以先测测自己的 TalkType。</p>
            <Button className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={() => navigate("/talktype")}>
              开始测试
            </Button>
          </section>
        )}

        {!loading && report && (
          <section className="grid gap-6 lg:grid-cols-[420px_1fr] lg:items-start">
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-100/70">
              <div
                className="p-6"
                style={{
                  background: `linear-gradient(135deg, ${report.primaryColor}, ${report.secondaryColor})`,
                }}
              >
                <div className="rounded-2xl bg-white/80 p-5 backdrop-blur">
                  <p className="text-sm text-stone-600">TA 的 TalkType 是</p>
                  <h1 className="mt-2 text-4xl font-semibold">{report.personalityName}</h1>
                  <p className="mt-3 text-stone-700">{report.tagline}</p>
                  {report.imagePath && (
                    <div className="mt-8 overflow-hidden rounded-2xl bg-white/55">
                      <img src={report.imagePath} alt={`${report.personalityName}人格插画`} className="aspect-square w-full object-cover object-top" />
                    </div>
                  )}
                  <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700">{report.shareText}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg shadow-blue-100/70 backdrop-blur md:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-blue-100 pb-6 md:flex-row md:items-start">
                <div>
                  <p className="text-sm text-stone-500">沟通代码</p>
                  <h2 className="mt-2 text-3xl font-semibold">{report.communicationCode}</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-stone-600">{report.summary}</p>
                </div>
                {typeof report.maturityScore === "number" && (
                  <div className="min-w-20 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 px-5 py-4 text-center text-white">
                    <p className="whitespace-nowrap text-xs text-white/70">成熟度</p>
                    <p className="mt-1 text-3xl font-semibold">{report.maturityScore}</p>
                  </div>
                )}
              </div>

              {snapshotReport && <SharedSnapshotReportCards report={snapshotReport} />}

              {dimensionScores && (
                <div className="mt-6 grid gap-4">
                  {TALKTYPE_DIMENSIONS.map((dimension) => {
                    const score = dimensionScores[dimension.key];

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
              )}

              {sharedDeepReport && <SharedDeepReportSection report={sharedDeepReport} />}

              {(relationshipBehavior || workplaceBehavior || friendshipBehavior) && (
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {relationshipBehavior && <SharedBehaviorCard title="亲密关系里的 TA" body={relationshipBehavior} />}
                  {workplaceBehavior && <SharedBehaviorCard title="职场沟通里的 TA" body={workplaceBehavior} />}
                  {friendshipBehavior && <SharedBehaviorCard title="朋友眼中的 TA" body={friendshipBehavior} />}
                </div>
              )}

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <SharedResultList title="优势" items={strengths} />
                <SharedResultList title="盲区" items={blindSpots} />
                <SharedResultList title="训练方向" items={trainingFocus} />
              </div>

              <div className="mt-8 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-gray-900">你会是哪种沟通人格？</p>
                  <Button variant="outline" className="w-fit border-blue-200 bg-white text-blue-700 hover:bg-blue-50" onClick={handleShareResult}>
                    <Share2 className="h-4 w-4" />
                    分享这份结果
                  </Button>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  用 24 道真实聊天场景测出你的 TalkType，看看你在关系里最自然的表达方式。
                </p>
                <Button className="mt-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={() => navigate("/talktype")}>
                  我也测测 TalkType <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {isWechatDebugEnabled && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
            <p className="font-semibold">微信分享诊断</p>
            <p className="break-all">UA: {navigator.userAgent}</p>
            <p>isWeChat: {String(isWechatClient)}</p>
            <p>ready: {String(wechatShareReady)}</p>
            <div className="mt-2 space-y-1">
              {wechatShareDebug.map((item, index) => (
                <p key={`${item}-${index}`} className="break-all">
                  {item}
                </p>
              ))}
            </div>
          </section>
        )}
      </main>

      <Dialog open={shareGuideOpen} onOpenChange={setShareGuideOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-3xl p-5">
          <DialogHeader>
            <DialogTitle>分享这份结果</DialogTitle>
            <DialogDescription>
              {isWechatClient ? "请点微信右上角菜单，选择“发送给朋友”或“分享到朋友圈”。" : "当前浏览器不支持直接分享时，可以先复制链接发给朋友。"}
            </DialogDescription>
          </DialogHeader>
          {sharePayload && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 ring-1 ring-blue-100">
                    <Share2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {isWechatClient ? (wechatShareReady ? "微信卡片已准备好" : "正在准备微信卡片") : "复制链接备用"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-stone-600">
                      {isWechatClient
                        ? (wechatShareReady ? "现在从右上角分享，会以卡片形式发出去。" : "如果稍等后仍没有变好，可以先复制链接备用。")
                        : "系统分享不可用时，复制链接也能打开完整结果页。"}
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50" onClick={copyShareLink}>
                复制链接备用
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function loadWechatJsSdk(): Promise<void> {
  if (window.wx) {
    return Promise.resolve();
  }
  if (wechatJsSdkPromise) {
    return wechatJsSdkPromise;
  }

  wechatJsSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${WECHAT_JS_SDK_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("WeChat JS-SDK load failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = WECHAT_JS_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("WeChat JS-SDK load failed"));
    document.head.appendChild(script);
  });

  return wechatJsSdkPromise;
}

function SharedSnapshotReportCards({ report }: { report: NonNullable<TalkTypeShareReport["snapshotReport"]> }) {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-3">
      {[report.identityInsight, report.externalImpression, report.blindSpotInsight].map((item) => (
        <article key={item.title} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 p-4 shadow-sm shadow-blue-100/50">
          <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
          {"tags" in item && Array.isArray(item.tags) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-blue-700 ring-1 ring-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm leading-7 text-stone-600">{item.body}</p>
        </article>
      ))}
    </section>
  );
}

function SharedDeepReportLoadingSection() {
  return (
    <section className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-5 shadow-sm shadow-amber-100/70 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            AI 深度报告
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-gray-900">AI 正在认真读懂这份结果</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            正在生成完整深度报告，稍等几秒，就能看到更细的沟通模式解读。
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

function SharedDeepReportSection({ report }: { report: TalkTypeDeepReport }) {
  const relationshipLabels = {
    relationship: "亲密关系里的 TA",
    workplace: "职场沟通里的 TA",
    friendship: "朋友眼中的 TA",
  };

  return (
    <section className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-5 shadow-sm shadow-amber-100/70 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            AI 深度报告
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-gray-900">为什么 TA 会这样沟通？</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            把 TA 的四维分数和人格画像翻译成更生活化的解读，看看哪些沟通习惯正在影响 TA 的关系体验。
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
            <p className="text-sm font-semibold text-gray-900">TA 真正需要的</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">{report.innerNeed}</p>
          </div>
        </article>

        <article className="rounded-2xl bg-white/85 p-5 ring-1 ring-blue-100">
          <p className="text-sm font-semibold text-blue-700">最容易戳中 TA 的三句话</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {report.triggerPhrases.slice(0, 3).map((phrase) => (
              <span key={phrase} className="rounded-full bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {phrase}
              </span>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-blue-50/80 p-4">
            <p className="text-sm font-semibold text-gray-900">别人可能误解 TA 的地方</p>
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

function SharedBehaviorCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl bg-white/80 p-4 ring-1 ring-stone-100">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-stone-600">{body}</p>
    </article>
  );
}

function SharedResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-blue-50/50 p-4">
      <p className="font-semibold text-gray-900">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
