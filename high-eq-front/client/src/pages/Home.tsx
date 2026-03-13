import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
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
  BookmarkCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PRICING_PLANS } from "@/data/pricingPlans";
import { analytics } from "@/lib/analytics";
import { toast } from "sonner";
import ContactSidebar from "@/components/ContactSidebar";

const ROLE_OPTIONS = [
  { value: "同事", emoji: "💼", color: "from-blue-500 to-blue-600" },
  { value: "朋友", emoji: "👥", color: "from-green-500 to-green-600" },
  { value: "家人", emoji: "👨‍👩‍👧", color: "from-pink-500 to-pink-600" },
  { value: "领导", emoji: "👔", color: "from-purple-500 to-purple-600" },
  { value: "客户", emoji: "🤝", color: "from-orange-500 to-orange-600" },
  { value: "伴侣", emoji: "💕", color: "from-red-500 to-red-600" },
];

const TONE_OPTIONS = [
  { value: "温和友善", emoji: "🌸", desc: "充满关怀和理解" },
  { value: "正式得体", emoji: "🎯", desc: "保持专业和礼貌" },
  { value: "幽默风趣", emoji: "😄", desc: "轻松活泼的表达" },
  { value: "真诚直接", emoji: "💬", desc: "坦率表达想法" },
  { value: "委婉含蓄", emoji: "🌙", desc: "间接表达意思" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStart = () => {
    const hasToken = !!localStorage.getItem("access_token");
    if (isAuthenticated || hasToken) {
      navigate("/app");
      return;
    }
    navigate("/login");
  };

  const handleUpgradeClick = async (planId: string) => {
    const targetTier = planId === 'lite' ? 'lite' : 'pro';
    await analytics.trackUpgradeClick(targetTier);
    toast.info('支付功能开发中，敬请期待');
  };

  const handleShowClicks = async () => {
    try {
      const response = await apiClient.get('/analytics/upgrade-clicks');
      if (response.data.code === 200) {
        console.log('Upgrade clicks:', response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch clicks:', error);
    }
  };

  const demoScenarios = [
    {
      role: "同事",
      input: "老板说今天要加班...",
      intent: "想委婉拒绝",
      output: "收到，不过我今天已经有些个人安排了，能否看看其他同事的时间？或者我明天优先处理这个任务？😊"
    },
    {
      role: "朋友",
      input: "说好周末一起吃饭却放鸽子",
      intent: "表达不满但不想伤感情",
      output: "哈哈，我可是饿着肚子等了一整天呢😂 不过没事，我知道你肯定是有急事。这周末再约？这次我请你，不许再跑啦～"
    },
    {
      role: "伴侣",
      input: "问我觉得他/她最近胖了",
      intent: "安抚对方的焦虑",
      output: "傻瓜，说什么呢😊 我喜欢的是你这个人，不管怎样你在我心里都是最可爱的。而且我们还可以一起运动呀，正好我想有人陪呢～"
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <ContactSidebar />
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HighEQ
            </span>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105"
            onClick={handleStart}
          >
            开始使用 <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section - 温暖渐变背景 */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00cy0yLTItNC0yYzAgMCAyLTIgMi00czItNCAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        </div>

        {/* 浮动装饰 */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className={`container mx-auto px-4 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto text-center">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-float">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI 驱动的高情商沟通助手
              </span>
            </div>

            {/* 主标题 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                说话也是一种艺术
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              面对棘手的聊天场景，<span className="font-semibold text-blue-600">HighEQ</span> 帮你生成
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold"> 既得体又高情商</span> 的完美回复
            </p>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in-up animation-delay-200">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                onClick={handleStart}
              >
                <Wand2 className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                立即体验
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 text-lg px-8 py-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                查看演示
              </Button>
            </div>

            {/* 信任指标 */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500 dark:text-gray-400 opacity-0 animate-fade-in-up animation-delay-400">
              <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <Image className="w-5 h-5" />
                <span>截图识别</span>
              </div>
              <div className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <UserCircle className="w-5 h-5" />
                <span>人物档案</span>
              </div>
              <div className="flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <Users className="w-5 h-5" />
                <span>多角色适配</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <Sparkles className="w-5 h-5" />
                <span>5种语气风格</span>
              </div>
              <div className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110 cursor-pointer">
                <BookmarkCheck className="w-5 h-5" />
                <span>收藏历史</span>
              </div>
            </div>
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
            <p className="text-gray-600 dark:text-gray-400">三步搞定高情商回复</p>
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
                        推荐
                      </span>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl rounded-tl-none px-4 py-3 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                      <p className="text-gray-800 dark:text-gray-200">{demoScenarios[activeDemo].output}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>这条回复既表达了你的立场，又照顾了对方的感受</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 角色背景展示 */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                灵活适配各种关系场景
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">无论面对谁，都能找到最合适的表达方式</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {ROLE_OPTIONS.map((role) => (
              <Card
                key={role.value}
                className="p-4 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer border-2 hover:border-purple-300 dark:hover:border-purple-700 group"
              >
                <div className={`text-4xl mb-2 transform group-hover:scale-110 transition-transform`}>
                  {role.emoji}
                </div>
                <div className={`text-sm font-semibold bg-gradient-to-r ${role.color} bg-clip-text text-transparent`}>
                  {role.value}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 dark:text-gray-400">支持自定义更多角色...</p>
          </div>
        </div>
      </section>

      {/* 语气风格展示 */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                五种语气，灵活切换
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">根据场景需要，选择最适合的沟通风格</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {TONE_OPTIONS.map((tone) => (
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
                <div className="text-xs text-gray-500 dark:text-gray-400">
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

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 text-center hover:shadow-xl transition-all border-2 hover:border-blue-300 dark:hover:border-blue-700">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">截图识别</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                上传聊天截图，AI 自动识别提取对话内容
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl transition-all border-2 hover:border-purple-300 dark:hover:border-purple-700">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">人物档案</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                创建常联系人档案，AI 生成更贴合对方性格的回复
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl transition-all border-2 hover:border-pink-300 dark:hover:border-pink-700">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <BookmarkCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">收藏历史</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                收藏精彩回复，建立你的个人沟通智慧库
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 价格验证区 */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                先免费用，再决定要不要升级
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
              onClick={handleShowClicks}
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
          <p className="text-xs mt-2">
            <a href="http://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400">
              浙ICP备2025210322号-2
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
