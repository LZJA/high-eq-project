import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { profileAPI, replyAPI } from "@/lib/api";
import { PersonProfile } from "@/types";
import { AppNav } from "@/components/AppNav";
import { QuotaIndicator } from "@/components/QuotaIndicator";
import { ModelSelector } from "@/components/ModelSelector";
import { useQuota } from "@/hooks/useQuota";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Copy, Heart, Wand2, User, MessageCircle } from "lucide-react";

interface PersonProfileChatProps {
  profileId: string;
}

// 语气/风格选项
const TONE_OPTIONS = [
  { value: "温和友善", label: "温和友善" },
  { value: "正式得体", label: "正式得体" },
  { value: "幽默风趣", label: "幽默风趣" },
  { value: "真诚直接", label: "真诚直接" },
  { value: "委婉含蓄", label: "委婉含蓄" },
];

interface ReplySuggestion {
  id: string;
  content: string;
  reason: string;
  tone: string;
}

export default function PersonProfileChat({ profileId }: PersonProfileChatProps) {
  const [, setLocation] = useLocation();
  const { remainingQuota, isUnlimited, refresh: refreshQuota } = useQuota();

  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // 聊天相关
  const [chatContent, setChatContent] = useState("");
  const [userIntent, setUserIntent] = useState("");
  const [tone, setTone] = useState("");
  const [modelPreference, setModelPreference] = useState("deepseek-chat");
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile(profileId);
      setProfile(response.data);
    } catch (error) {
      toast.error("加载人物档案失败");
      setLocation("/profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!chatContent.trim()) {
      toast.error("请输入对方聊天内容");
      return;
    }
    if (!userIntent.trim()) {
      toast.error("请输入您的真实意图");
      return;
    }

    // 检查配额
    if (!isUnlimited && remainingQuota <= 0) {
      toast.error("今日配额已用尽，请升级到 PRO 版本获取无限次数");
      return;
    }

    setIsGenerating(true);
    try {
      // 构建角色背景，包含人物档案信息
      const roleBackground = buildRoleBackground();

      const response = await replyAPI.generateReplies({
        chatContent,
        roleBackground,
        userIntent,
        replyCount: 3,
        modelPreference,
        tone,
        personProfileId: profileId,
      });

      setSuggestions(response.data.suggestions || []);
      toast.success("回复建议生成成功！");
      refreshQuota();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const buildRoleBackground = () => {
    if (!profile) return "";
    const parts = [profile.relationship || "对方"];
    if (profile.gender) parts.push(`性别：${profile.gender}`);
    if (profile.age) parts.push(`年龄：${profile.age}岁`);
    if (profile.occupation) parts.push(`职业：${profile.occupation}`);
    if (profile.personality) parts.push(`性格：${profile.personality}`);
    return parts.join("，");
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const handleToggleFavorite = async (suggestionId: string) => {
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
  };

  const handleReset = () => {
    setChatContent("");
    setUserIntent("");
    setTone("");
    setSuggestions([]);
    setFavorites(new Set());
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    setLocation("/profiles");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <AppNav showLogout />
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppNav activePage="profiles" showLogout />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部信息 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
          >
            <ArrowLeft className="size-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <User className="size-5 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              <div className="flex gap-1">
                {profile.relationship && (
                  <Badge variant="outline" className="text-xs">
                    {profile.relationship}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <QuotaIndicator />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 左侧输入 */}
          <Card className="shadow-lg">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MessageCircle className="size-4" />
                <span className="text-sm">与 {profile.name} 的对话</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {profile.name} 说的话 <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder={`输入 ${profile.name} 对您说的话...`}
                  value={chatContent}
                  onChange={(e) => setChatContent(e.target.value)}
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  您的真实意图 <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="描述您想要达到的目的..."
                  value={userIntent}
                  onChange={(e) => setUserIntent(e.target.value)}
                  rows={2}
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">语气风格</label>
                  <Select
                    value={tone}
                    onValueChange={setTone}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择语气" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI 模型</label>
                  <ModelSelector
                    value={modelPreference}
                    onChange={setModelPreference}
                    disabled={isGenerating}
                  />
                </div>
              </div>

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

          {/* 右侧建议 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              回复建议 {suggestions.length > 0 && `(${suggestions.length})`}
            </h2>

            {suggestions.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Wand2 className="size-12 mx-auto mb-4 opacity-50" />
                  <p>输入对话内容后点击生成</p>
                  <p className="text-sm mt-2">
                    AI 会根据 {profile.name} 的性格特点生成回复
                  </p>
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
                          >
                            <Copy className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggleFavorite(suggestion.id)}
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
