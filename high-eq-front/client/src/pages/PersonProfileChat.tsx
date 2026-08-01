import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { profileAPI, replyAPI, replyChatAPI } from "@/lib/api";
import { AI_MODELS, PersonProfile } from "@/types";
import { AppNav } from "@/components/AppNav";
import { QuotaIndicator } from "@/components/QuotaIndicator";
import { ModelSelector } from "@/components/ModelSelector";
import { useQuota } from "@/hooks/useQuota";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ArrowLeft, Copy, Heart, MessageCircle, RefreshCw, User, Wand2, Upload, X } from "lucide-react";
import { ImagePreview } from "@/components/ImagePreview";
import { uploadChatImageToOss } from "@/lib/oss";

interface PersonProfileChatProps {
  profileId: string;
}

interface ReplySuggestion {
  id: string;
  content: string;
  reason: string;
  styleLabel?: string;
}

export default function PersonProfileChat({ profileId }: PersonProfileChatProps) {
  const [, setLocation] = useLocation();
  const { remainingQuota, isUnlimited, tier, refresh: refreshQuota } = useQuota();

  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [chatContent, setChatContent] = useState("");
  const [userIntent, setUserIntent] = useState("");
  const [modelPreference, setModelPreference] = useState("deepseek-v4-flash");
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [generatedHistoryId, setGeneratedHistoryId] = useState<string | null>(null);
  const [continueSuggestion, setContinueSuggestion] = useState<ReplySuggestion | null>(null);
  const [sentReplyDraft, setSentReplyDraft] = useState("");
  const [isGeneratedFavorite, setIsGeneratedFavorite] = useState(false);
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const selectedModel = AI_MODELS.find((m) => m.value === modelPreference);
  const supportsImage = selectedModel?.supportsImage || false;
  const selectedModelCost = selectedModel?.costPoints ?? 1;

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
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过10MB");
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
    if (!isUnlimited && remainingQuota < selectedModelCost) {
      const upgradeMessage = tier === 'free'
        ? "今日点数不足，请升级到 Lite 获取更多点数"
        : `当前模型需要 ${selectedModelCost} 点，今日剩余 ${remainingQuota} 点，请切换模型或升级会员`;
      toast.error(upgradeMessage);
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);
    try {
      const response = await replyAPI.generateReplies({
        chatContent,
        roleBackground: buildRoleBackground(),
        userIntent,
        modelPreference,
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

  const handleRegenerate = async () => {
    if (!generatedHistoryId) {
      toast.error("请先生成回复");
      return;
    }
    if (!isUnlimited && remainingQuota < selectedModelCost) {
      toast.error(`当前模型需要 ${selectedModelCost} 点，今日剩余 ${remainingQuota} 点`);
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await replyAPI.regenerateReplies(generatedHistoryId, {
        modelPreference,
        excludeSuggestionIds: suggestions.map((suggestion) => suggestion.id),
        excludeContents: suggestions.map((suggestion) => suggestion.content),
      });
      setSuggestions(response.data.suggestions || []);
      refreshQuota();
      toast.success("已换一批新的表达");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "换一批失败，请稍后重试");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOpenContinue = (suggestion: ReplySuggestion) => {
    if (!generatedHistoryId) {
      toast.error("请先生成回复");
      return;
    }
    setContinueSuggestion(suggestion);
    setSentReplyDraft(suggestion.content);
  };

  const handleCreateContinueChat = async () => {
    if (!generatedHistoryId || !continueSuggestion) return;
    if (!sentReplyDraft.trim()) {
      toast.error("请输入你实际发给对方的话");
      return;
    }

    setIsCreatingChat(true);
    try {
      const response = await replyChatAPI.createSession({
        historyId: generatedHistoryId,
        suggestionId: continueSuggestion.id,
        sentReply: sentReplyDraft,
      });
      toast.success("已开启继续聊");
      setLocation(`/reply-chat/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "开启继续聊失败");
    } finally {
      setIsCreatingChat(false);
    }
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

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl relative z-10">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-4 mb-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="size-4 mr-2" />
              返回
            </Button>

            <div className="hidden sm:fflex items-center gap-3">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">AI 模型</label>
                <ModelSelector
                  value={modelPreference}
                  onChange={setModelPreference}
                  disabled={isGenerating || isUploadingImage}
                />
                <p className="text-xs text-muted-foreground">
                  本次将消耗 {selectedModelCost} 点，今日剩余 {remainingQuota} 点
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isUploadingImage || (!isUnlimited && remainingQuota < selectedModelCost)}
                  className="flex-1"
                >
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isGenerating || isRegenerating || isUploadingImage}
                  >
                    {isRegenerating ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 size-4" />}
                    换一批
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleToggleFavorite}>
                    <Heart
                      className={`size-4 mr-2 ${
                        isGeneratedFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    {isGeneratedFavorite ? "已收藏" : "收藏本次记录"}
                  </Button>
                </div>
              )}
            </div>

            {isGenerating ? (
              <Card className="shadow-sm">
                <CardContent className="py-12 text-center">
                  <Spinner className="size-12 mx-auto mb-4" />
                  <p className="text-muted-foreground">AI 正在生成回复建议...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    根据 {profile.name} 的档案信息分析中
                  </p>
                </CardContent>
              </Card>
            ) : suggestions.length === 0 ? (
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
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="py-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:px-6">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <Badge variant="outline">{suggestion.styleLabel || "自然得体"}</Badge>
                        <div className="ml-auto flex shrink-0 items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(suggestion.content)}
                            title="复制"
                          >
                            <Copy className="mr-1.5 size-4" />
                            复制
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenContinue(suggestion)}
                            title="继续聊"
                          >
                            <MessageCircle className="mr-1.5 size-4" />
                            继续聊
                          </Button>
                        </div>
                      </div>
                      <p className="text-base mb-3 whitespace-pre-wrap">{suggestion.content}</p>
                      {suggestion.reason && (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                          <span className="font-medium">推荐理由</span>
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
      <Dialog open={!!continueSuggestion} onOpenChange={(open) => !open && setContinueSuggestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>开启继续聊</DialogTitle>
            <DialogDescription>
              先确认你实际发给对方的话。你可以按自己的习惯改一下，后续 AI 会按这句话继续理解上下文。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">我实际发出的内容</label>
            <Textarea
              value={sentReplyDraft}
              onChange={(event) => setSentReplyDraft(event.target.value)}
              rows={5}
              maxLength={500}
              disabled={isCreatingChat}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{sentReplyDraft.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContinueSuggestion(null)} disabled={isCreatingChat}>
              取消
            </Button>
            <Button onClick={handleCreateContinueChat} disabled={isCreatingChat || !sentReplyDraft.trim()}>
              {isCreatingChat && <Spinner className="mr-2" />}
              进入继续聊
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ImagePreview src={previewImage} open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)} />
    </div>
  );
}
