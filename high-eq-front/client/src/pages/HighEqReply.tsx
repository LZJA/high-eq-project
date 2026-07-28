import SEO from "@/components/SEO";
import ContactSidebar from "@/components/ContactSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Tags,
  Wand2,
} from "lucide-react";
import { useLocation } from "wouter";

const scenarios = [
  {
    title: "职场沟通",
    description: "催进度、拒绝临时加班、解释延期、向领导同步风险时，既说清事实，也保留合作感。",
  },
  {
    title: "恋爱聊天",
    description: "面对冷淡、撒娇、误会和情绪化表达时，先接住对方的感受，再把关系往前推。",
  },
  {
    title: "朋友相处",
    description: "想关心但怕冒犯、想表达不满但不想翻脸时，用更自然的方式把话说出来。",
  },
  {
    title: "家庭边界",
    description: "回应催促、关心和分歧时，既不硬顶，也不委屈自己，让边界表达更温和。",
  },
];

const replyExamples = [
  {
    scene: "委婉拒绝",
    input: "今晚能不能帮我把这个方案也一起改了？",
    reply:
      "我今晚手上还有一个必须收尾的任务，怕硬接下来反而影响质量。要不我先帮你看最关键的部分，剩下的明天上午一起过？",
  },
  {
    scene: "安慰对方",
    input: "我感觉自己最近什么都做不好。",
    reply:
      "你不是做不好，你只是最近承受的事情太多了。先别急着否定自己，我们可以一件一件拆开看，至少我会陪你慢慢理清楚。",
  },
  {
    scene: "关系修复",
    input: "你刚才那句话真的让我不舒服。",
    reply:
      "你这么说我能理解，刚才那句话确实没有照顾到你的感受。我的本意不是那样，但表达方式有问题，我愿意重新说一次。",
  },
];

const advancedFeatures = [
  {
    title: "风格标签帮你快速判断",
    description:
      "同一段聊天默认给出多条候选，每条都会结合关系、情绪和场景生成贴合的风格标签。你不用先猜语气，扫一眼就能判断哪条更适合当下。",
    icon: Tags,
  },
  {
    title: "继续聊保留长上下文",
    description:
      "选中一条回复后可以进入继续聊，把对方后续回应、你实际发送的话和前面聊天内容一起保留下来。后面再生成回复时，AI 会参考完整长上下文，不会只看最后一句。",
    icon: MessageCircle,
  },
];

const heroCandidates = [
  {
    label: "柔软安抚",
    reply:
      "我不是不想理你，是这两天状态有点满，回复慢了让你不舒服了。你对我来说很重要，我会更主动一点跟你说清楚。",
  },
  {
    label: "认真负责",
    reply:
      "听到你这么说，我知道你可能有点失落。今晚我忙完会认真跟你聊一会儿，不让你一直猜我在想什么。",
  },
  {
    label: "轻松转场",
    reply:
      "不是不理你，是我这两天脑子有点塞车。你提醒得对，我不能只顾着忙，把你晾在旁边。",
  },
];

const faq = [
  {
    question: "高情商回复生成器适合什么场景？",
    answer:
      "适合不知道怎么回、担心说重了、想拒绝又怕伤关系、想安慰但怕显得敷衍等聊天场景。HighEQ 会根据关系、上下文和你的真实想法生成多条候选回复。",
  },
  {
    question: "生成的回复会不会很像模板？",
    answer:
      "HighEQ 默认给出多条不同表达角度的回复，并用风格标签标注差异。标签会根据具体聊天关系和语境变化生成，帮助你更快选出最贴近当下的一条。",
  },
  {
    question: "继续聊和普通回复生成有什么区别？",
    answer:
      "普通生成更适合快速回一句。继续聊会保留前面的聊天内容、你采纳过的回复和对方后续回应，形成长上下文记录，适合一段对话持续推进。",
  },
  {
    question: "可以上传聊天截图吗？",
    answer:
      "可以。HighEQ 支持聊天截图识别，也支持直接粘贴文字。截图适合长对话和复杂上下文，文字适合快速生成一句回复。",
  },
  {
    question: "为什么不是只给一个标准答案？",
    answer:
      "聊天没有唯一正确答案。不同关系、不同语气和不同目的会对应不同表达方式，所以 HighEQ 更适合提供几条可选回复，让你选最像自己的那条。",
  },
];

export default function HighEqReply() {
  const [, navigate] = useLocation();
  const canonicalUrl = "https://www.higheq.top/high-eq-reply";
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "高情商回复生成器",
      alternateName: "HighEQ",
      url: canonicalUrl,
      description:
        "HighEQ 高情商回复生成器可以根据聊天内容、关系和表达目的生成多条带风格标签的 AI 回复，并通过继续聊保留长上下文聊天内容。",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CNY",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <SEO
        title="高情商回复生成器 - 多风格标签和继续聊长上下文"
        description="HighEQ 高情商回复生成器根据聊天内容生成多条带风格标签的 AI 回复，帮你快速判断不同表达差异，并通过继续聊保留长上下文聊天内容。"
        keywords="高情商回复生成器,高情商回复,AI聊天回复,风格标签,继续聊,长上下文聊天,AI回复生成器,职场回复,恋爱聊天回复"
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <ContactSidebar />

      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/85 backdrop-blur dark:border-gray-800 dark:bg-gray-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-2" aria-label="HighEQ 首页">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">HighEQ</span>
          </a>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden text-gray-600 sm:inline-flex dark:text-gray-300">
              <a href="/talktype">沟通人格测试</a>
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              onClick={() => navigate("/app")}
            >
              免费生成
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950/20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-900/50 dark:bg-gray-900/80 dark:text-blue-300">
                <Sparkles className="h-4 w-4" />
                智能风格标签 · 继续聊保留长上下文
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-gray-950 dark:text-white md:text-6xl">
                高情商回复生成器
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                遇到不好回的消息，HighEQ 会先生成多条候选回复，并根据当下语境给每条标注贴合的风格标签；你可以快速判断哪种表达更合适，选中后还能继续聊，保留前后长上下文聊天内容。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 px-7 text-white hover:from-blue-700 hover:to-purple-700"
                  onClick={() => navigate("/app")}
                >
                  <Wand2 className="h-5 w-5" />
                  立即免费生成
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-purple-200 bg-white/80 px-7 text-purple-700 hover:bg-purple-50 dark:border-purple-900 dark:bg-gray-900/80 dark:text-purple-300"
                >
                  <a href="/talktype">先测沟通人格</a>
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden border-blue-100 bg-white/90 p-5 shadow-xl shadow-blue-100/70 dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-none">
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">对方发来</p>
                <p className="mt-2 rounded-2xl bg-white p-4 leading-7 text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200">
                  “你是不是最近都不太想理我？”
                </p>
                <p className="mt-5 text-sm font-medium text-blue-600 dark:text-blue-300">HighEQ 候选回复 · 风格标签可选</p>
                <div className="mt-3 space-y-3">
                  {heroCandidates.map((item, index) => (
                    <div key={item.label} className="rounded-2xl border border-blue-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-300">
                        <CheckCircle2 className="h-4 w-4" />
                        候选 {index + 1} · #{item.label}
                      </div>
                      <p className="text-sm leading-7 text-gray-700 dark:text-gray-200">
                        {item.reply}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-16 dark:bg-gray-950 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-5xl">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">核心链路</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">先看懂差异，再带着上下文继续聊</h2>
              <p className="mt-4 max-w-none leading-7 text-gray-600 dark:text-gray-300 xl:whitespace-nowrap">
                HighEQ 的重点不是只给一句“万能回复”，而是帮你看懂每条回复的表达差异，并把这次选择接入后续对话。
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {advancedFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="border-blue-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-gray-950 dark:text-white">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 dark:bg-gray-950 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">适用场景</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">把难回的话，变成有分寸的表达</h2>
              <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
                高情商不是讨好，也不是把话说得很圆滑，而是在不同关系里把情绪、事实和边界都表达清楚。
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.title} className="border-gray-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold text-gray-950 dark:text-white">{scenario.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">{scenario.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 dark:bg-gray-900/40 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
              <div>
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-300">回复示例</p>
                <h2 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">同一句话，可以有更好的说法</h2>
                <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
                  HighEQ 会给出多条带风格标签的候选，而不是只给一个模板答案。你可以按关系亲疏、语气轻重和当下目的选择最适合的一条，再进入继续聊保留长上下文。
                </p>
              </div>
              <div className="space-y-4">
                {replyExamples.map((example) => (
                  <Card key={example.scene} className="border-gray-200 p-5 dark:border-gray-800 dark:bg-gray-950">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
                      <MessageCircle className="h-4 w-4" />
                      {example.scene}
                    </div>
                    <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">原消息：{example.input}</p>
                    <p className="mt-3 rounded-2xl bg-blue-50 p-4 text-sm leading-7 text-gray-700 dark:bg-blue-950/30 dark:text-gray-200">
                      {example.reply}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 dark:bg-gray-950 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">常见问题</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">关于 AI 高情商回复生成</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <article key={item.question} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="font-semibold text-gray-950 dark:text-white">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">{item.answer}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
              <h2 className="text-2xl font-bold md:text-3xl">把你正在纠结的那句话，交给 HighEQ 试试</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/80">
                支持文字输入和聊天截图识别；风格标签会跟着语境变化，继续聊会保留长上下文，适合临场回复、关系修复、职场沟通和聊天复盘。
              </p>
              <Button
                size="lg"
                className="mt-6 bg-white text-purple-700 hover:bg-gray-100"
                onClick={() => navigate("/app")}
              >
                免费开始使用 <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
