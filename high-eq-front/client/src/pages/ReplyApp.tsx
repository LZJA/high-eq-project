import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { replyAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Copy, Heart, Wand2 } from "lucide-react";
import { AppNav } from "@/components/AppNav";

// 预设角色
const PRESET_ROLES = [
  { value: "同事", label: "同事" },
  { value: "朋友", label: "朋友" },
  { value: "家人", label: "家人" },
  { value: "领导", label: "领导" },
  { value: "客户", label: "客户" },
  { value: "陌生人", label: "陌生人" },
  { value: "伴侣", label: "伴侣" },
  { value: "老师", label: "老师" },
];

// AI 模型选项
const AI_MODELS = [
  { value: "deepseek", label: "DeepSeek (推荐)" },
  // { value: "doubao", label: "豆包" },
  // { value: "wenxin", label: "百度文心一言" },
];

// 语气/风格选项
const TONE_OPTIONS = [
  { value: "温和友善", label: "温和友善", description: "充满关怀和理解" },
  { value: "正式得体", label: "正式得体", description: "保持专业和礼貌" },
  { value: "幽默风趣", label: "幽默风趣", description: "轻松活泼的表达" },
  { value: "真诚直接", label: "真诚直接", description: "坦率表达想法" },
  { value: "委婉含蓄", label: "委婉含蓄", description: "间接表达意思" },
];

interface ReplySuggestion {
  id: string;
  content: string;
  reason: string;
  tone: string;
}

export default function ReplyApp() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatContent, setChatContent] = useState("");
  const [roleBackground, setRoleBackground] = useState("");
  const [userIntent, setUserIntent] = useState("");
  const [replyCount, setReplyCount] = useState(3);
  const [modelPreference, setModelPreference] = useState("deepseek");
  const [tone, setTone] = useState("");
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!chatContent.trim()) {
      toast.error("请输入对方聊天内容");
      return;
    }
    if (!roleBackground) {
      toast.error("请选择角色背景");
      return;
    }
    if (!userIntent.trim()) {
      toast.error("请输入您的真实意图");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await replyAPI.generateReplies({
        chatContent,
        roleBackground,
        userIntent,
        replyCount,
        modelPreference,
        tone,
      });

      setSuggestions(response.data.suggestions || []);
      setCurrentHistoryId(response.data.historyId);
      toast.success("回复建议生成成功！");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const handleToggleFavorite = async (suggestionId: string) => {
    if (!currentHistoryId) return;

    try {
      await replyAPI.toggleFavorite(currentHistoryId);
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(suggestionId)) {
          newFavorites.delete(suggestionId);
          toast.success("已取消收藏");
        } else {
          newFavorites.add(suggestionId);
          toast.success("已收藏");
        }
        return newFavorites;
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    }
  };

  const handleReset = () => {
    setChatContent("");
    setRoleBackground("");
    setUserIntent("");
    setTone("");
    setSuggestions([]);
    setCurrentHistoryId(null);
    setFavorites(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 导航栏 */}
      <AppNav activePage="app" showLogout />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 输入区域 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 左侧输入表单 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="size-5 text-blue-600" />
                生成高情商回复
              </CardTitle>
              <CardDescription>
                填写以下信息，AI 将为您生成得体的回复建议
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 对方聊天内容 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  对方聊天内容 <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="粘贴对方的聊天内容..."
                  value={chatContent}
                  onChange={(e) => setChatContent(e.target.value)}
                  rows={4}
                  disabled={isGenerating}
                  className="resize-none"
                />
              </div>

              {/* 角色背景 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  对方角色 <span className="text-destructive">*</span>
                </label>
                <Select
                  value={roleBackground}
                  onValueChange={setRoleBackground}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择对方的角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 用户意图 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  您的真实意图 <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="描述您想要达到的目的，比如：委婉拒绝、表达感谢、缓和气氛..."
                  value={userIntent}
                  onChange={(e) => setUserIntent(e.target.value)}
                  rows={2}
                  disabled={isGenerating}
                  className="resize-none"
                />
              </div>

              {/* 语气/风格选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">语气/风格（可选）</label>
                <Select
                  value={tone}
                  onValueChange={setTone}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择回复语气" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 高级选项 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">回复数量</label>
                  <Select
                    value={replyCount.toString()}
                    onValueChange={(v) => setReplyCount(parseInt(v))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 条</SelectItem>
                      <SelectItem value="2">2 条</SelectItem>
                      <SelectItem value="3">3 条</SelectItem>
                      <SelectItem value="5">5 条</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI 模型</label>
                  <Select
                    value={modelPreference}
                    onValueChange={setModelPreference}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Spinner className="mr-2" />
                      生成中...
                    </>
                  ) : (
                    "生成回复建议"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isGenerating}
                >
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 右侧回复建议 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                回复建议 {suggestions.length > 0 && `(${suggestions.length})`}
              </h2>
            </div>

            {suggestions.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Wand2 className="size-12 mx-auto mb-4 opacity-50" />
                  <p>填写左侧信息后点击"生成回复建议"</p>
                  <p className="text-sm mt-2">AI 将为您生成多条高情商回复</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={suggestion.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary">方案 {index + 1}</Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleCopy(suggestion.content)}
                            title="复制"
                          >
                            <Copy className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggleFavorite(suggestion.id)}
                            title={favorites.has(suggestion.id) ? "取消收藏" : "收藏"}
                          >
                            <Heart
                              className={`size-4 ${
                                favorites.has(suggestion.id)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                          </Button>
                        </div>
                      </div>
                      <p className="text-base mb-3 whitespace-pre-wrap">
                        {suggestion.content}
                      </p>
                      {suggestion.reason && (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                          <span className="font-medium">推荐理由：</span>
                          {suggestion.reason}
                        </div>
                      )}
                      {suggestion.tone && (
                        <Badge variant="outline" className="mt-2">
                          {suggestion.tone}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
