import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Database, Zap, BarChart3, MessageSquare, History } from "lucide-react";
import { useState } from "react";

/**
 * 高情商回复生成助手 - 技术方案展示网站
 * 
 * 设计理念: 现代科技 + 人文温暖
 * 色彩方案: 深蓝 (#1e40af) + 紫罗兰 (#7c3aed) + 翠绿 (#10b981)
 * 排版: Poppins 字体系统，清晰的信息层级
 */

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663233560975/cdUP8urfTUHkfkomBzem7t/hero-bg-GTqjkcnCb9iuNVpTt7nztB.webp";
const FEATURE_AI = "https://d2xsxph8kpxj0f.cloudfront.net/310519663233560975/cdUP8urfTUHkfkomBzem7t/feature-ai-LDhsREqyfgQMEXhByuXnQz.webp";
const FEATURE_ARCH = "https://d2xsxph8kpxj0f.cloudfront.net/310519663233560975/cdUP8urfTUHkfkomBzem7t/feature-architecture-nXJxF6cghiVkF3ZwxPtPms.webp";
const FEATURE_HISTORY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663233560975/cdUP8urfTUHkfkomBzem7t/feature-history-JqqpaseLBF88bB8uzPLUme.webp";

export default function Home() {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">HighEQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">功能</a>
            <a href="#architecture" className="text-gray-600 hover:text-gray-900 transition">架构</a>
            <a href="#tech-stack" className="text-gray-600 hover:text-gray-900 transition">技术栈</a>
            <a href="#models" className="text-gray-600 hover:text-gray-900 transition">AI 模型</a>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">开始使用</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${HERO_BG}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <span className="text-blue-600 font-medium text-sm">🚀 智能回复生成平台</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              用 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span> 赋能
              <br />
              <span className="text-gray-700">高情商的沟通</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              结合对方聊天内容、预设角色背景和您的真实意图，
              <br />
              通过先进的 AI 模型生成既得体又富有情商的回复建议。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                查看完整方案 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300">
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">核心功能</h2>
            <p className="text-lg text-gray-600">完整的功能体系，帮助用户提升沟通效率</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200">
              <div className="mb-6">
                <img src={FEATURE_AI} alt="AI 生成" className="w-full h-48 object-cover rounded-lg" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI 智能生成</h3>
              </div>
              <p className="text-gray-600">
                接入 DeepSeek、豆包等先进 AI 模型，根据聊天内容、角色背景和个人意图，
                生成多条高情商的回复建议。
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200">
              <div className="mb-6">
                <img src={FEATURE_ARCH} alt="系统架构" className="w-full h-48 object-cover rounded-lg" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">完整架构</h3>
              </div>
              <p className="text-gray-600">
                前后端分离架构，React+Vite 前端，Java+Spring Boot 后端，
                MySQL 数据库，确保系统稳定性和可扩展性。
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200">
              <div className="mb-6">
                <img src={FEATURE_HISTORY} alt="历史记录" className="w-full h-48 object-cover rounded-lg" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <History className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">历史管理</h3>
              </div>
              <p className="text-gray-600">
                完整的会话历史记录，支持查看、编辑、收藏和删除，
                帮助用户积累高情商回复的经验库。
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200">
              <div className="mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-24 h-24 text-blue-300" />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">角色背景</h3>
              </div>
              <p className="text-gray-600">
                预设多种角色背景（同事、朋友、家人、领导等），
                支持自定义角色，确保回复符合特定场景。
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">系统架构</h2>
            <p className="text-lg text-gray-600">前后端分离，清晰的数据流向</p>
          </div>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 border border-blue-200">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">前端层 (React + Vite)</h3>
                  <p className="text-gray-600">用户界面交互，负责聊天内容输入、角色设置、意图表达</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">后端服务 (Java + Spring Boot)</h3>
                  <p className="text-gray-600">处理业务逻辑、用户认证、数据验证、AI 模型调用</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">数据层 (MySQL)</h3>
                  <p className="text-gray-600">存储用户信息、会话历史、AI 生成的回复建议</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">AI 服务 (DeepSeek / 豆包)</h3>
                  <p className="text-gray-600">调用先进的大语言模型，生成高情商回复</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">技术栈</h2>
            <p className="text-lg text-gray-600">现代、稳定、高性能的技术选择</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Frontend Stack */}
            <Card className="p-8 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">前端技术栈</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">⚛️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">React 18+</h4>
                    <p className="text-sm text-gray-600">组件化开发，高效构建 UI</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold text-sm">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Vite 5+</h4>
                    <p className="text-sm text-gray-600">极速开发体验，高性能构建</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">🎨</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Tailwind CSS 4</h4>
                    <p className="text-sm text-gray-600">快速构建响应式界面</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">📝</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">TypeScript</h4>
                    <p className="text-sm text-gray-600">增强代码可维护性和健壮性</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Backend Stack */}
            <Card className="p-8 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">后端技术栈</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 font-bold text-sm">☕</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Java 17+</h4>
                    <p className="text-sm text-gray-600">稳定、高性能的企业级语言</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">🍃</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Spring Boot 3+</h4>
                    <p className="text-sm text-gray-600">快速构建 RESTful API 服务</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">🗄️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">MySQL 8+</h4>
                    <p className="text-sm text-gray-600">成熟稳定的关系型数据库</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold text-sm">🔧</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">MyBatis-Plus</h4>
                    <p className="text-sm text-gray-600">简化数据库操作的 ORM 框架</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section id="models" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">AI 模型选型</h2>
            <p className="text-lg text-gray-600">多种高性能模型，满足不同场景需求</p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* DeepSeek Model */}
            <Card 
              className="p-6 border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setExpandedModel(expandedModel === 'deepseek' ? null : 'deepseek')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">DeepSeek-V3</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">推荐首选</span>
                  </div>
                  <p className="text-gray-600 mb-3">逻辑能力强，语义理解精准，性价比高</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">免费额度:</span>
                      <span className="font-bold text-gray-900 ml-2">10元 (约 500-1000万 tokens)</span>
                    </div>
                    <div>
                      <span className="text-gray-500">价格:</span>
                      <span className="font-bold text-gray-900 ml-2">1元/M 输入 + 2元/M 输出</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedModel === 'deepseek' ? 'rotate-90' : ''}`} />
              </div>
              {expandedModel === 'deepseek' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 mb-4">
                    DeepSeek-V3 是国产最强开源模型，特别适合处理"高情商"这种需要复杂逻辑和语气模拟的场景。
                    提供 OpenAI 兼容的 API，易于集成。
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>优势:</strong> 语义理解精准、逻辑推理能力强、成本低、支持长上下文
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Doubao Model */}
            <Card 
              className="p-6 border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setExpandedModel(expandedModel === 'doubao' ? null : 'doubao')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">豆包 (Doubao)</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">备选方案</span>
                  </div>
                  <p className="text-gray-600 mb-3">语气自然，响应速度快，适合移动端实时交互</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">免费额度:</span>
                      <span className="font-bold text-gray-900 ml-2">50万 tokens (常有促销)</span>
                    </div>
                    <div>
                      <span className="text-gray-500">价格:</span>
                      <span className="font-bold text-gray-900 ml-2">极低 (0.15-0.6元/M)</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedModel === 'doubao' ? 'rotate-90' : ''}`} />
              </div>
              {expandedModel === 'doubao' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 mb-4">
                    字节跳动豆包模型背靠抖音生态，语气更自然、更接地气。响应速度极快，
                    特别适合移动端应用。通过火山引擎平台提供 API 接口。
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>优势:</strong> 响应速度快、语气自然、成本极低、生态完善
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Baidu Model */}
            <Card 
              className="p-6 border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setExpandedModel(expandedModel === 'baidu' ? null : 'baidu')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">百度文心一言 (ERNIE)</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">成本最低</span>
                  </div>
                  <p className="text-gray-600 mb-3">针对中文优化，部分轻量级模型完全免费</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">免费额度:</span>
                      <span className="font-bold text-gray-900 ml-2">部分模型永久免费</span>
                    </div>
                    <div>
                      <span className="text-gray-500">价格:</span>
                      <span className="font-bold text-gray-900 ml-2">免费 ~ 极低</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedModel === 'baidu' ? 'rotate-90' : ''}`} />
              </div>
              {expandedModel === 'baidu' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 mb-4">
                    百度千帆平台提供多种模型选择，某些轻量级模型（如 ERNIE-Speed/Tiny）
                    在千帆平台上是完全免费提供的，是成本敏感项目的理想选择。
                  </p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>优势:</strong> 部分模型免费、中文优化好、生态完善、稳定性高
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">准备好了吗？</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            这是一个完整的技术方案展示。如果您对项目感兴趣，可以基于此方案开始开发。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              获取完整方案文档
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              联系我们
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">HighEQ</span>
              </div>
              <p className="text-sm">高情商回复生成助手</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">功能</a></li>
                <li><a href="#" className="hover:text-white transition">定价</a></li>
                <li><a href="#" className="hover:text-white transition">文档</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">公司</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">关于</a></li>
                <li><a href="#" className="hover:text-white transition">博客</a></li>
                <li><a href="#" className="hover:text-white transition">联系</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">法律</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">隐私</a></li>
                <li><a href="#" className="hover:text-white transition">条款</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 HighEQ. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
