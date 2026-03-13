import { useState, useEffect } from "react";
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
import { Copy, Heart, Wand2, Upload, X } from "lucide-react";
import { AI_MODELS } from "@/types";
import { AppNav } from "@/components/AppNav";
import { QuotaIndicator } from "@/components/QuotaIndicator";
import { ModelSelector } from "@/components/ModelSelector";
import { useQuota } from "@/hooks/useQuota";
import { ImagePreview } from "@/components/ImagePreview";
import { uploadChatImageToOss } from "@/lib/oss";

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
  const { remainingQuota: hookRemainingQuota, isUnlimited, tier, refresh: refreshQuota } = useQuota();
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatContent, setChatContent] = useState("");
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [roleBackground, setRoleBackground] = useState("");
  const [userIntent, setUserIntent] = useState("");
  const [replyCount, setReplyCount] = useState(3);
  const [modelPreference, setModelPreference] = useState("deepseek-chat");
  const [tone, setTone] = useState("");
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [remainingQuota, setRemainingQuota] = useState(hookRemainingQuota);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const selectedModel = AI_MODELS.find(m => m.value === modelPreference);
  const supportsImage = selectedModel?.supportsImage || false;

  useEffect(() => {
    setRemainingQuota(hookRemainingQuota);
  }, [hookRemainingQuota]);

  useEffect(() => {
    if (!supportsImage && chatImage) {
      setChatImage(null);
    }
  }, [supportsImage, chatImage]);

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
        console.log(publicUrl);
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
    if (!roleBackground) {
      toast.error("请选择角色背景");
      return;
    }
    if (!userIntent.trim()) {
      toast.error("请输入您的真实意图");
      return;
    }

    // 检查配额
    if (!isUnlimited && remainingQuota <= 0) {
      const upgradeMessage = tier === 'free'
        ? "今日配额已用尽，请升级到 Lite 版本获取更多次数"
        : "今日配额已用尽，请升级到 PRO 版本获取无限次数";
      toast.error(upgradeMessage);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await replyAPI.generateReplies({
        chatContent,
        chatImage,
        roleBackground,
        userIntent,
        replyCount,
        modelPreference,
        tone,
      });

      setSuggestions(response.data.suggestions || []);
      setCurrentHistoryId(response.data.historyId);
      setRemainingQuota(prev => Math.max(0, prev - 1));
      toast.success("回复建议生成成功！");
      setTimeout(() => refreshQuota(), 300);
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
    setChatImage(null);
    setRoleBackground("");
    setUserIntent("");
    setTone("");
    setSuggestions([]);
    setCurrentHistoryId(null);
    setFavorites(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* 导航栏 */}
      <AppNav activePage="app" showLogout />

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* 输入区域 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 左侧输入表单 */}
          <Card className="shadow-lg animate-fade-in-up">
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
                  disabled={isGenerating || isUploadingImage}
                  className="resize-none transition-transform focus:scale-[1.02]"
                />
                {(supportsImage || !!chatImage) && (
                  <div className="space-y-2">
                    {!chatImage ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="chat-image-upload"
                          disabled={isGenerating || isUploadingImage}
                        />
                        <label htmlFor="chat-image-upload">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={isGenerating || isUploadingImage}
                            onClick={() => document.getElementById('chat-image-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploadingImage ? "图片上传中..." : "或上传聊天截图"}
                          </Button>
                        </label>
                      </div>
                    ) : (
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

              {/* 角色背景 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  对方角色 <span className="text-destructive">*</span>
                </label>
                <Select
                  value={roleBackground}
                  onValueChange={setRoleBackground}
                  disabled={isGenerating || isUploadingImage}
                >
                  <SelectTrigger className="w-full transition-transform focus:scale-[1.02]">
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
                  className="resize-none transition-transform focus:scale-[1.02]"
                />
              </div>

              {/* 语气/风格选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">语气/风格（可选）</label>
                <Select
                  value={tone}
                  onValueChange={setTone}
                  disabled={isGenerating || isUploadingImage}
                >
                  <SelectTrigger className="w-full transition-transform focus:scale-[1.02]">
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
                    disabled={isGenerating || isUploadingImage}
                  >
                    <SelectTrigger className="w-full transition-transform focus:scale-[1.02]">
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
                  <ModelSelector
                    value={modelPreference}
                    onChange={setModelPreference}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isUploadingImage}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isGenerating || isUploadingImage}
                >
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 右侧回复建议 */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  回复建议 {suggestions.length > 0 && `(${suggestions.length})`}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <QuotaIndicator overrideRemainingQuota={remainingQuota} />
                  </div>
                  {/* {user?.username && (
                    <Badge variant="outline" className="hidden sm:inline-flex">当前用户：{user.username}</Badge>
                  )} */}
                </div>
              </div>
              <div className="sm:hidden mt-3">
                <QuotaIndicator overrideRemainingQuota={remainingQuota} />
              </div>
            </div>

            {suggestions.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Wand2 className="size-12 mx-auto mb-4 opacity-50" />
                  <p>填写信息后点击"生成回复建议"</p>
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
      <ImagePreview src={previewImage} open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)} />
    </div>
  );
}
