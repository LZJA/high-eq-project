import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { profileAPI, replyAPI } from "@/lib/api";
import { AI_MODELS, PersonProfile } from "@/types";
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
import { ArrowLeft, Copy, Heart, MessageCircle, User, Wand2, Upload, X } from "lucide-react";
import { ImagePreview } from "@/components/ImagePreview";
import { uploadChatImageToOss } from "@/lib/oss";

interface PersonProfileChatProps {
  profileId: string;
}

interface ReplySuggestion {
  id: string;
  content: string;
  reason: string;
  tone: string;
}

const TONE_OPTIONS = [
  { value: "温和友善", label: "温和友善" },
  { value: "正式得体", label: "正式得体" },
  { value: "幽默风趣", label: "幽默风趣" },
  { value: "真诚直接", label: "真诚直接" },
  { value: "委婉含蓄", label: "委婉含蓄" },
];

export default function PersonProfileChat({ profileId }: PersonProfileChatProps) {
  const [, setLocation] = useLocation();
  const { remainingQuota, isUnlimited, tier, refresh: refreshQuota } = useQuota();

  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatContent, setChatContent] = useState("");
  const [userIntent, setUserIntent] = useState("");
  const [tone, setTone] = useState("");
  const [modelPreference, setModelPreference] = useState("deepseek-chat");
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [generatedHistoryId, setGeneratedHistoryId] = useState<string | null>(null);
  const [isGeneratedFavorite, setIsGeneratedFavorite] = useState(false);
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const selectedModel = AI_MODELS.find((m) => m.value === modelPreference);
  const supportsImage = selectedModel?.supportsImage || false;

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  useEffect(() => {
    if (!supportsImage && chatImage) {
      setChatImage(null);
    }
  }, [supportsImage, chatImage]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile(profileId);
      setProfile(response.data);
    } catch {
      toast.error("加载人物档案失败");
      setLocation("/profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const buildRoleBackground = () => {
    if (!profile) return "";

    const parts: string[] = [profile.name || "对方"];
    if (profile.relationship) parts.push(profile.relationship);
    if (profile.gender) parts.push(profile.gender);
    if (profile.age) parts.push(`${profile.age}岁`);
    if (profile.occupation) parts.push(profile.occupation);
    if (profile.personality) parts.push(`性格：${profile.personality}`);
    if (profile.hobbies) parts.push(`兴趣爱好：${profile.hobbies}`);
    if (profile.zodiacSign) parts.push(profile.zodiacSign);
    if (profile.chineseZodiac) parts.push(`${profile.chineseZodiac}`);

    return parts.join("，");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("请上传图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过5MB");
      return;
    }
    setIsUploadingImage(true);
    uploadChatImageToOss(file)
      .then((publicUrl: string) => {
        setChatImage(publicUrl);
        toast.success("图片上传成功");
      })
      .catch((error: any) => {
        toast.error(error?.message || "图片上传失败");
      })
      .finally(() => {
        setIsUploadingImage(false);
        e.target.value = "";
      });
  };

  const handleRemoveImage = () => {
    setChatImage(null);
  };

  const handleGenerate = async () => {
    if (!chatContent.trim() && !chatImage) {
      toast.error("请输入对方聊天内容或上传聊天截图");
      return;
    }
    if (isUploadingImage) {
      toast.error("图片上传中，请稍后再试");
      return;
    }
    if (!userIntent.trim()) {
      toast.error("请输入您的真实意图");
      return;
    }
    if (!isUnlimited && remainingQuota <= 0) {
      const upgradeMessage = tier === 'free'
        ? "今日配额已用完，请升级到 Lite 获取更多次数"
        : "今日配额已用完，请升级到 PRO 获取无限次数";
      toast.error(upgradeMessage);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await replyAPI.generateReplies({
        chatContent,
        roleBackground: buildRoleBackground(),
        userIntent,
        replyCount: 3,
        modelPreference,
        tone,
        personProfileId: profileId,
        chatImage,
      });

      setSuggestions(response.data.suggestions || []);
      setGeneratedHistoryId(response.data.historyId || null);
      setIsGeneratedFavorite(false);
      refreshQuota();
      toast.success("回复建议已生成");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const handleToggleFavorite = async () => {
    if (!generatedHistoryId) {
      toast.error("请先生成回复");
      return;
    }

    try {
      await profileAPI.toggleProfileHistoryFavorite(profileId, generatedHistoryId);
      const nextFavorite = !isGeneratedFavorite;
      setIsGeneratedFavorite(nextFavorite);
      toast.success(nextFavorite ? "已加入收藏" : "已取消收藏");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "收藏失败");
    }
  };

  const handleReset = () => {
    setChatContent("");
    setChatImage(null);
    setUserIntent("");
    setTone("");
    setSuggestions([]);
    setGeneratedHistoryId(null);
    setIsGeneratedFavorite(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <AppNav activePage="profiles" showLogout />

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{profile.name}</h1>
                  {profile.relationship && (
                    <Badge variant="outline" className="text-xs">
                      {profile.relationship}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="ml-auto hidden sm:block">
            <QuotaIndicator overrideRemainingQuota={remainingQuota} />
            </div>
          </div>

          <div className="sm:hidden">
          <QuotaIndicator overrideRemainingQuota={remainingQuota} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MessageCircle className="size-4" />
                <span className="text-sm">{profile.name} 的对话</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {profile.name} 说的话<span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder={`输入 ${profile.name} 对你说的话...`}
                  value={chatContent}
                  onChange={(e) => setChatContent(e.target.value)}
                  rows={4}
                  disabled={isGenerating || isUploadingImage}
                />
                {(supportsImage || !!chatImage) && (
                  <div className="flex items-center gap-2">
                    {!chatImage && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="profile-image-upload"
                          disabled={isGenerating || isUploadingImage}
                        />
                        <label htmlFor="profile-image-upload" className="flex-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isGenerating || isUploadingImage}
                            className="w-full"
                            asChild
                          >
                            <span className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              {isUploadingImage ? "图片上传中..." : "上传聊天截图"}
                            </span>
                          </Button>
                        </label>
                      </>
                    )}
                    {chatImage && (
                      <div className="relative inline-block">
                        <img
                          src={chatImage}
                          alt="聊天截图"
                          className="h-20 w-20 object-cover rounded border cursor-pointer hover:opacity-80"
                          onClick={() => setPreviewImage(chatImage)}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={handleRemoveImage}
                          disabled={isGenerating || isUploadingImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">语气风格</label>
                  <Select value={tone} onValueChange={setTone} disabled={isGenerating}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择语气" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                    disabled={isGenerating || isUploadingImage}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={isGenerating || isUploadingImage} className="flex-1">
                  {isGenerating ? (
                    <>
                      <Spinner className="mr-2" />
                      生成中...
                    </>
                  ) : isUploadingImage ? (
                    <>
                      <Spinner className="mr-2" />
                      图片上传中...
                    </>
                  ) : (
                    "生成回复建议"
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={isGenerating || isUploadingImage}>
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                回复建议 {suggestions.length > 0 && `(${suggestions.length})`}
              </h2>
              {suggestions.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleToggleFavorite}>
                  <Heart
                    className={`size-4 mr-2 ${
                      isGeneratedFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {isGeneratedFavorite ? "已收藏" : "收藏本次记录"}
                </Button>
              )}
            </div>

            {suggestions.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Wand2 className="size-12 mx-auto mb-4 opacity-50" />
                  <p>输入对话内容后点击生成</p>
                  <p className="text-sm mt-2">
                    AI 会根据 {profile.name} 的档案信息生成推荐回复
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
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopy(suggestion.content)}
                          title="复制"
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>
                      <p className="text-base mb-3 whitespace-pre-wrap">{suggestion.content}</p>
                      {suggestion.reason && (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                          <span className="font-medium">推荐理由</span>
                          {suggestion.reason}
                        </div>
                      )}
                      {suggestion.tone && (
                        <Badge variant="outline" className="mt-3">
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
      <ImagePreview src={previewImage} open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)} />
    </div>
  );
}

