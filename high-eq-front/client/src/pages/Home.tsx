import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Heart,
  Star,
  Users,
  SparklesIcon,
  Wand2,
  ChevronRight,
  Image,
  UserCircle,
  BookmarkCheck,
  MessageCircle,
  Tags,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PRICING_PLANS } from "@/data/pricingPlans";
import { analytics } from "@/lib/analytics";
import { toast } from "sonner";
import ContactSidebar from "@/components/ContactSidebar";
import { PaymentDialog } from "@/components/PaymentDialog";
import { getRecoverablePaymentTier } from "@/components/paymentDialogState";
import { useAuth } from "@/contexts/AuthContext";

const STYLE_FEATURES = [
  { value: "柔软安抚", emoji: "🤍", desc: "先接住情绪，再给回应" },
  { value: "轻松转场", emoji: "🌿", desc: "缓和氛围，不让聊天变僵" },
  { value: "边界清晰", emoji: "🧭", desc: "温和表达立场，不委屈" },
  { value: "认真负责", emoji: "🎯", desc: "适合解释、承诺和推进" },
  { value: "俏皮亲近", emoji: "✨", desc: "让关系感更自然地冒出来" },
];

const FEATURE_CARDS = [
  {
    title: "5 条智能候选",
    desc: "默认一次生成 5 条回复，不再让你先选语气。AI 会根据关系和语境自动拆出不同表达角度。",
    icon: Sparkles,
    color: "from-blue-500 to-purple-600",
  },
  {
    title: "风格标签",
    desc: "每条回复都有灵活标签，比如温柔安抚、轻松转场、边界清晰，扫一眼就知道哪条适合发。",
    icon: Tags,
    color: "from-purple-500 to-pink-600",
  },
  {
    title: "继续聊",
    desc: "采用回复后进入会话，记录对方说了什么、你实际发了什么，后面遇到难回的地方可以接着生成。",
    icon: MessageCircle,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "人物档案",
    desc: "为常联系的人保存关系、性格和相处方式，AI 会按你们真实的关系分寸生成更贴近的回复。",
    icon: UserCircle,
    color: "from-orange-500 to-rose-600",
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [activeDemo, setActiveDemo] = useState(0);
  const [paymentTier, setPaymentTier] = useState<"lite" | "pro" | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    setPaymentTier((currentTier) => currentTier || getRecoverablePaymentTier(sessionStorage));
  }, [isAuthenticated]);
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "高情商回复生成助手",
    alternateName: "HighEQ",
    url: "https://www.higheq.top/",
    description: "HighEQ 是 AI 高情商回复生成助手，支持聊天截图识别、5 条智能候选、动态风格标签、人物档案和继续聊上下文记录，帮你把一段聊天自然接下去。",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CNY",
    },
  };

  const handleStart = () => {
    navigate("/app");
  };

  const handleUpgradeClick = async (planId: string) => {
    const targetTier = planId === 'lite' ? 'lite' : 'pro';
    await analytics.trackUpgradeClick(targetTier);
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setPaymentTier(targetTier);
  };

  const demoScenarios = [
    {
      role: "同事",
      input: "这个方案今天能不能先给我？",
      intent: "想说明时间不够，但不想显得推脱",
      output: "我可以先把核心框架给你，细节我怕今天赶出来不够稳。要不我今晚先发一版可讨论的，明早再补完整？",
      label: "负责推进",
    },
    {
      role: "朋友",
      input: "最近有点烦，不太想说话。",
      intent: "想关心，但不想追问太多",
      output: "那你先缓缓，我不追问。你想安静我就在旁边，想吐槽的时候我也在。",
      label: "安静陪伴",
    },
    {
      role: "伴侣",
      input: "你今天在公司吃完再回来吧。",
      intent: "她想让我早点吃饭，回家好运动",
      output: "好呀，那我在公司先吃点，回去就能陪你运动。你这是把我的晚饭和健康都安排明白了😂",
      label: "甜甜接住",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <SEO
        title="HighEQ 高情商回复生成助手 - 5条候选、截图识别和继续聊"
        description="HighEQ 根据聊天内容、关系和真实想法生成 5 条高情商回复，支持动态风格标签、人物档案、聊天截图识别和继续聊上下文记录。"
        keywords="HighEQ,高情商回复,AI回复生成,聊天截图识别,继续聊,风格标签,人物档案,恋爱聊天回复,职场沟通"
        structuredData={homeStructuredData}
      />
      <ContactSidebar />
      {paymentTier && <PaymentDialog tier={paymentTier} open={true} onOpenChange={(open) => !open && setPaymentTier(null)} />}
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2"
            aria-label="HighEQ 首页"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HighEQ
            </span>
          </a>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="hidden border-purple-200 bg-white/70 text-purple-700 hover:bg-purple-50 sm:inline-flex dark:border-purple-800 dark:bg-gray-900/70 dark:text-purple-300 dark:hover:bg-purple-900/20"
            >
              <a href="/talktype">沟通人格测试</a>
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105"
              onClick={handleStart}
            >
              开始使用 <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - 温暖渐变背景 */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00cy0yLTItNC0yYzAgMCAyLTIgMi00czItNCAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        </div>

        {/* 浮动装饰 */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI 高情商回复 · 支持继续聊
              </span>
            </div>

            {/* 主标题 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                不知道怎么回？
                <br />
                让 HighEQ 接住这段聊天
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              粘贴对方说的话，或上传聊天截图。<span className="font-semibold text-blue-600">HighEQ</span> 会结合关系、语境和你的真实想法，生成
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold"> 5 条不同风格的回复</span>，还能继续聊下去。
            </p>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="group h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                onClick={handleStart}
              >
                <Wand2 className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                免费试用
              </Button>
            </div>

            {/* 免费试用说明 */}
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              🎉 无需注册，每日 3 点免费体验 · 登录后可保存继续聊记录
            </p>

            <a
              href="/talktype"
              className="mx-auto mt-6 flex w-full max-w-md items-center gap-4 rounded-2xl border border-purple-100 bg-white/80 p-3 text-left shadow-lg shadow-purple-100/60 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-purple-200/70 dark:border-purple-900/40 dark:bg-gray-900/70 dark:shadow-none"
            >
              <img
                src="/images/talktype/personas/emotion-translator.png"
                alt="TalkType 沟通人格插画"
                className="h-16 w-16 shrink-0 rounded-xl object-cover object-top"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">不知道怎么回，可能和你的沟通人格有关</span>
                <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">24 道题测出你的 TalkType，生成可分享人格卡</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-purple-600" />
            </a>

            {/* 信任指标 */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <Image className="w-5 h-5" />
                <span>截图识别</span>
              </div>
              <div className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <MessageCircle className="w-5 h-5" />
                <span>继续聊</span>
              </div>
              <div className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <Tags className="w-5 h-5" />
                <span>风格标签</span>
              </div>
              <div className="flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <Users className="w-5 h-5" />
                <span>多角色适配</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <Sparkles className="w-5 h-5" />
                <span>5条智能候选</span>
              </div>
              <div className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <BookmarkCheck className="w-5 h-5" />
                <span>会话记录</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TalkType 测试入口 */}
      <section className="bg-white py-14 dark:bg-gray-950 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 shadow-xl shadow-blue-100/70 dark:border-purple-900/40 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950/20 md:grid-cols-[1fr_320px] md:p-8">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-purple-700 shadow-sm dark:bg-gray-900/80 dark:text-purple-300">
                <Sparkles className="h-3.5 w-3.5" />
                新增公开测试
              </div>
              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100 md:text-4xl">
                你是哪种说话人格？
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 md:text-base">
                别人说“没事”，你会继续追问、先安抚，还是等情绪过去？TalkType 用真实聊天场景测出你的沟通人格、优势和容易踩坑的表达方式。
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["情绪翻译官", "边界守门员", "直球真诚派"].map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-1 text-xs text-blue-700 shadow-sm dark:bg-gray-900 dark:text-blue-300">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-7">
                <Button
                  asChild
                  className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 px-6 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  <a href="/talktype">开始 3 分钟测试 <ArrowRight className="ml-1 h-4 w-4" /></a>
                </Button>
              </div>
            </div>

            <a
              href="/talktype"
              className="group rounded-2xl bg-white p-3 shadow-lg shadow-purple-100/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-200/80 dark:bg-gray-900 dark:shadow-none"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="/images/talktype/personas/boundary-guardian.png"
                  alt="TalkType 边界守门员人格插画"
                  className="aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-4 pt-16 text-left dark:from-gray-950 dark:via-gray-950/90">
                  <p className="text-xs text-gray-500 dark:text-gray-400">示例人格</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">边界守门员</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">我可以温柔，但不会被拿捏。</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 演示区域 */}
      <section id="demo" className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                看看它是如何工作的
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">从一句难回的话，变成 5 个可选择的表达方向</p>
          </div>

          {/* 演示卡片 */}
          <Card className="max-w-3xl mx-auto overflow-hidden shadow-2xl border-0 hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/40 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-white/40 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 rounded-full bg-white/40 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-white/90 text-sm font-medium">HighEQ 演示</span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* 场景选择器 */}
              <div className="flex justify-center gap-2 mb-8 flex-wrap">
                {demoScenarios.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveDemo(index)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeDemo === index
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:scale-105"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105"
                    }`}
                  >
                    {scenario.role}
                  </button>
                ))}
              </div>

              {/* 演示内容 */}
              <div className="space-y-6">
                {/* 对方消息 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">对方 · {demoScenarios[activeDemo].role}</div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                      {demoScenarios[activeDemo].input}
                    </div>
                  </div>
                </div>

                {/* 用户意图 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">我的意图</div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl rounded-tl-none px-4 py-3 border border-blue-200 dark:border-blue-800">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">💭 {demoScenarios[activeDemo].intent}</span>
                    </div>
                  </div>
                </div>

                {/* AI 回复 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                      <span>HighEQ 回复建议</span>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full">
                        5 条候选
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl rounded-tl-none px-4 py-3 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                        <div className="mb-2 inline-flex rounded-full bg-white px-2 py-0.5 text-xs font-medium text-purple-700 shadow-sm dark:bg-gray-900 dark:text-purple-300">
                          {demoScenarios[activeDemo].label}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">{demoScenarios[activeDemo].output}</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {["温柔一点", "轻松一点", "边界清晰", "更会撒娇"].map((label) => (
                          <div key={label} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>选中后可保存实际发送内容，后面继续按上下文生成</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 继续聊展示 */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                不止生成一句，还能陪你继续聊
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">采用某条回复后，HighEQ 会记录这段会话的上下文，下次遇到难回的地方可以接着生成</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="overflow-hidden border-2 border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/60 dark:border-blue-900/40 dark:bg-gray-950 dark:shadow-none">
              <div className="relative mb-4">
                <h3 className="pr-28 text-xl font-bold text-gray-900 dark:text-gray-100">一段对话，一直跟得上</h3>
                <p className="mt-1 text-sm text-gray-500 md:whitespace-nowrap dark:text-gray-400">对方说了什么、你实际发了什么，都会成为下一轮建议的背景。</p>
                <span className="absolute right-0 top-0 whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">第 3/100 轮</span>
              </div>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-gray-900">
                <div className="max-w-[72%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <p className="mb-1 text-xs text-gray-500">对方</p>
                  <p>那明晚下班后一起去吃火锅？</p>
                </div>
                <div className="ml-auto max-w-[78%] rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white shadow-sm">
                  <p className="mb-1 text-xs text-blue-100">我</p>
                  <p>好呀，我正好想见你。明晚我提前把时间留出来。</p>
                </div>
                <div className="max-w-[78%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <p className="mb-1 text-xs text-gray-500">对方</p>
                  <p>今晚可能去不了了，我临时被留下开会。</p>
                </div>
                <div className="ml-auto max-w-[78%] rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white shadow-sm">
                  <p className="mb-1 text-xs text-blue-100">AI 建议</p>
                  <p>没关系，工作先忙完。你别因为答应过我就有压力，火锅可以改天，但我期待见你这件事没变。</p>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ["按你实际发出的内容记", "AI 不只记“推荐答案”，也记你最终改成什么样。你越按自己的话保存，后面越像你本人在说。"],
                ["长上下文更懂当前场景", "它会参考前面的关系背景、情绪变化和聊天进展，再推荐更贴近当下语境的回复，不会像每次都从零开始。"],
                ["重要关系可以接着聊", "暧昧推进、伴侣安抚、客户跟进这类长线聊天，下次打开记录就能从上一段状态继续。"],
              ].map(([title, desc]) => (
                <Card key={title} className="border-2 border-gray-100 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:hover:border-blue-900">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 智能风格展示 */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                五条候选，各有侧重
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">AI 根据关系、语境和真实意图生成不同风格标签，帮你更快选到合适表达</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {STYLE_FEATURES.map((tone) => (
              <Card
                key={tone.value}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer group"
              >
                <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">
                  {tone.emoji}
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {tone.value}
                </div>
                <div className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {tone.desc}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 功能特点 */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                为什么选择 HighEQ
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 text-center hover:shadow-xl transition-all border-2 hover:border-blue-300 dark:hover:border-blue-700">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shadow-blue-500/20`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-6">
                    {feature.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 价格验证区 */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                先免费用，再决定升不升级
              </span>
            </h2>
              <p className="text-gray-600 dark:text-gray-400">
                HighEQ 提供三档订阅方案，满足不同使用需求。免费版体验基础功能，不支持上传聊天截图；Lite 版和 Pro 版支持上传聊天截图。
              </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 border-2 transition-all hover:-translate-y-1 hover:shadow-xl ${
                  plan.emphasis
                    ? "border-purple-300 dark:border-purple-700 shadow-lg"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="text-xl font-bold">{plan.name}</div>
                    <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                      {plan.priceLabel}
                    </div>
                  </div>
                  {plan.badge && (
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                  {plan.description}
                </p>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm">
                      <div className="mt-1 size-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.emphasis
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                      : ""
                  }`}
                  variant={plan.emphasis ? "default" : "outline"}
                  onClick={() => plan.id === 'free' ? handleStart() : handleUpgradeClick(plan.id)}
                >
                  {plan.ctaLabel}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwIDItMiAyLTRzMi00IDItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm"
            >
              <SparklesIcon className="w-4 h-4 text-yellow-300" />
              <span className="text-white/90 text-sm">准备好提升沟通技巧了吗？</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              让每次回复都恰到好处
            </h2>

            <p className="text-xl text-white/80 mb-8">
              加入我们，开启高情商沟通之旅
            </p>

            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
              onClick={handleStart}
            >
              免费开始使用
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">HighEQ</span>
          </div>
          <p className="text-sm">高情商回复生成助手 · 让沟通更有温度</p>
          <p className="text-xs mt-4 text-gray-500">© 2026 HighEQ. All rights reserved.</p>
          <div className="text-xs mt-2 flex items-center gap-1 justify-center">
            <a href="http://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400">
              浙ICP备2025210322号-2
            </a>
            <span className="w-[1px] h-[10px] bg-gray-500 block mx-[4px]" />
            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=33010202005538" rel="noreferrer" target="_blank" className="text-gray-500 hover:text-gray-400 inline-flex items-center gap-1">
              <img src="/images/beian_icon.png" alt="公安备案" className="w-3 h-3" />
              浙公网安备33010202005538号
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
