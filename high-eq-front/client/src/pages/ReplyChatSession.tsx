import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { ModelSelector } from "@/components/ModelSelector";
import { QuotaIndicator } from "@/components/QuotaIndicator";
import { useQuota } from "@/hooks/useQuota";
import { AI_MODELS } from "@/types";
import { replyChatAPI } from "@/lib/api";
import { uploadChatImageToOss } from "@/lib/oss";
import { ImagePreview } from "@/components/ImagePreview";
import { toast } from "sonner";
import { ArrowLeft, Copy, RefreshCw, Send, Sparkles, Upload, X } from "lucide-react";

interface ReplyChatSessionProps {
  sessionId: string;
}

interface ChatMessage {
  id: string;
  role: "opponent" | "user";
  content: string;
  source: string;
  turnIndex: number;
}

interface ChatSuggestion {
  id: string;
  content: string;
  reason?: string;
  styleLabel?: string;
  isAdopted?: number;
}

interface ChatSession {
  id: string;
  turnCount: number;
  maxTurnCount: number;
  warnTurnCount: number;
  status: string;
  modelPreference?: string;
  messages: ChatMessage[];
  latestSuggestions: ChatSuggestion[];
}

export default function ReplyChatSession({ sessionId }: ReplyChatSessionProps) {
  const [, navigate] = useLocation();
  const { remainingQuota, isUnlimited, tier, refresh: refreshQuota } = useQuota();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isAdopting, setIsAdopting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [opponentMessage, setOpponentMessage] = useState("");
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userIntent, setUserIntent] = useState("");
  const [modelPreference, setModelPreference] = useState("deepseek-v4-flash");
  const [adoptingSuggestion, setAdoptingSuggestion] = useState<ChatSuggestion | null>(null);
  const [finalContent, setFinalContent] = useState("");

  const selectedModel = AI_MODELS.find((model) => model.value === modelPreference);
  const selectedModelCost = selectedModel?.costPoints ?? 1;
  const supportsImage = selectedModel?.supportsImage || false;
  const effectiveMaxTurnCount = Math.max(session?.maxTurnCount ?? 100, 100);
  const effectiveWarnTurnCount = Math.max(session?.warnTurnCount ?? 85, 85);
  const isSessionEnded = session?.status !== "active" || (session?.turnCount ?? 0) >= effectiveMaxTurnCount;
  const shouldWarnLimit = (session?.turnCount ?? 0) >= effectiveWarnTurnCount;

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (!supportsImage && chatImage) {
      setChatImage(null);
    }
  }, [supportsImage, chatImage]);

  const suggestions = useMemo(() => session?.latestSuggestions || [], [session]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate("/app");
  };

  const loadSession = async (showPageLoading = true) => {
    if (showPageLoading) {
      setIsLoading(true);
    }
    try {
      const response = await replyChatAPI.getSession(sessionId);
      setSession(response.data);
      if (response.data?.modelPreference) {
        setModelPreference(response.data.modelPreference);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "继续聊会话不存在");
      navigate("/app");
    } finally {
      if (showPageLoading) {
        setIsLoading(false);
      }
    }
  };

  const ensureQuota = () => {
    if (!isUnlimited && remainingQuota < selectedModelCost) {
      const message = tier === "free"
        ? "今日点数不足，请升级到 Lite 获取更多点数"
        : `当前模型需要 ${selectedModelCost} 点，今日剩余 ${remainingQuota} 点`;
      toast.error(message);
      return false;
    }
    return true;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请上传图片文件");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过10MB");
      return;
    }

    setIsUploadingImage(true);
    uploadChatImageToOss(file)
      .then((publicUrl) => {
        setChatImage(publicUrl);
        toast.success("图片上传成功");
      })
      .catch((error: any) => {
        toast.error(error?.message || "图片上传失败");
      })
      .finally(() => {
        setIsUploadingImage(false);
        event.target.value = "";
      });
  };

  const handleRemoveImage = () => {
    setChatImage(null);
  };

  const handleGenerate = async () => {
    if (!opponentMessage.trim() && !chatImage) {
      toast.error("请输入对方说了什么");
      return;
    }
    if (chatImage && !supportsImage) {
      toast.error("上传聊天截图需要选择支持截图的模型");
      return;
    }
    if (isUploadingImage) {
      toast.error("图片还在上传中，请稍等");
      return;
    }
    if (!ensureQuota()) return;

    setIsGenerating(true);
    try {
      const response = await replyChatAPI.generateSuggestions(sessionId, {
        opponentMessage,
        chatImage,
        userIntent,
        modelPreference,
      });
      setSession((prev) => prev ? { ...prev, latestSuggestions: response.data.suggestions } : prev);
      setOpponentMessage("");
      setChatImage(null);
      setUserIntent("");
      refreshQuota();
      toast.success("已生成这一轮回复");
      await loadSession(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!ensureQuota()) return;

    setIsRegenerating(true);
    try {
      const response = await replyChatAPI.regenerateSuggestions(sessionId, {
        userIntent,
        modelPreference,
        excludeSuggestionIds: suggestions.map((suggestion) => suggestion.id),
      });
      setSession((prev) => prev ? { ...prev, latestSuggestions: response.data.suggestions } : prev);
      refreshQuota();
      toast.success("已换一批新的表达");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "换一批失败，请稍后重试");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const handleOpenAdopt = (suggestion: ChatSuggestion) => {
    setAdoptingSuggestion(suggestion);
    setFinalContent(suggestion.content);
  };

  const handleAdopt = async () => {
    if (!adoptingSuggestion || !finalContent.trim()) {
      toast.error("请输入你实际发给对方的话");
      return;
    }

    setIsAdopting(true);
    try {
      const response = await replyChatAPI.adoptSuggestion(sessionId, {
        suggestionId: adoptingSuggestion.id,
        finalContent,
      });
      setSession(response.data);
      setAdoptingSuggestion(null);
      setFinalContent("");
      toast.success("已保存到这段继续聊");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "保存失败");
    } finally {
      setIsAdopting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav activePage="app" showLogout />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav activePage="app" showLogout />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col px-4 py-2 sm:py-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3 sm:gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 size-4" />
            返回上一页
          </Button>
          <Badge variant={isSessionEnded ? "secondary" : "outline"}>
            {session.status === "active" ? `第 ${session.turnCount}/${effectiveMaxTurnCount} 轮` : "已结束"}
          </Badge>
          {shouldWarnLimit && !isSessionEnded && (
            <Badge variant="secondary">接近上限，建议收尾</Badge>
          )}
          <div className="basis-full sm:ml-auto sm:basis-auto">
            <QuotaIndicator showSubscriptionRemaining={false} />
          </div>
        </div>

        <div className="grid gap-2.5 lg:grid-cols-[1fr_360px] lg:gap-3">
          <Card className="border-slate-200 py-0 shadow-sm">
            <CardContent className="flex flex-col p-3">
              <div className="mb-2.5">
                <h1 className="text-lg font-semibold sm:text-xl">继续聊</h1>
                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                  这里会记录对方说了什么、你实际发了什么，AI 会按这段上下文继续给建议。
                </p>
              </div>

              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1.5 sm:max-h-[460px] sm:pr-2 lg:max-h-[calc(100vh-260px)]">
                {session.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === "user"
                          ? "border-blue-500 bg-blue-600 text-white shadow-blue-100"
                          : "border-slate-200 bg-white text-slate-900 shadow-slate-100"
                      }`}
                    >
                      <div className={`mb-1 text-xs ${message.role === "user" ? "text-blue-100" : "text-slate-500"}`}>
                        {message.role === "user" ? "我" : "对方"}
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2.5 lg:space-y-3">
            <Card className="py-0 shadow-sm">
              <CardContent className="space-y-2.5 p-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">对方说了什么</label>
                  <Textarea
                    value={opponentMessage}
                    onChange={(event) => setOpponentMessage(event.target.value)}
                    placeholder="可以粘贴对方刚说的话，也可以总结最近几轮对方大概表达了什么..."
                    rows={4}
                    maxLength={500}
                    disabled={isGenerating || isUploadingImage || isSessionEnded}
                    className="resize-none"
                  />
                  <p className="text-right text-xs text-muted-foreground">{opponentMessage.length}/500</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">我的真实想法（可选）</label>
                  <Textarea
                    value={userIntent}
                    onChange={(event) => setUserIntent(event.target.value)}
                    placeholder="比如：我想答应，但不想显得太急..."
                    rows={3}
                    maxLength={300}
                    disabled={isGenerating || isSessionEnded}
                    className="resize-none"
                  />
                  <p className="text-right text-xs text-muted-foreground">{userIntent.length}/300</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI 模型</label>
                  <ModelSelector value={modelPreference} onChange={setModelPreference} disabled={isGenerating || isUploadingImage || isSessionEnded} />
                  <p className="text-xs text-muted-foreground">本次将消耗 {selectedModelCost} 点</p>
                </div>
                {(supportsImage || !!chatImage) && (
                  <div className="space-y-2">
                    {!chatImage ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="reply-chat-image-upload"
                          disabled={isGenerating || isUploadingImage || isSessionEnded}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isGenerating || isUploadingImage || isSessionEnded}
                          onClick={() => document.getElementById("reply-chat-image-upload")?.click()}
                        >
                          <Upload className="mr-2 size-4" />
                          {isUploadingImage ? "图片上传中..." : "上传聊天截图"}
                        </Button>
                      </div>
                    ) : (
                      <div className="relative inline-block">
                        <img
                          src={chatImage}
                          alt="聊天截图"
                          className="h-20 w-20 cursor-pointer rounded border object-cover hover:opacity-80"
                          onClick={() => setPreviewImage(chatImage)}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                          onClick={handleRemoveImage}
                          disabled={isGenerating || isUploadingImage || isSessionEnded}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || isUploadingImage || isSessionEnded}>
                  {isGenerating ? <Spinner className="mr-2" /> : <Sparkles className="mr-2 size-4" />}
                  生成这一轮回复
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="font-semibold">当前候选</h2>
              {suggestions.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isRegenerating || isSessionEnded}>
                  {isRegenerating ? <Spinner className="mr-2" /> : <RefreshCw className="mr-2 size-4" />}
                  换一批
                </Button>
              )}
            </div>

            {suggestions.length === 0 ? (
              <Card className="py-0 shadow-sm">
                <CardContent className="py-5 text-center text-sm text-muted-foreground">
                  输入对方说了什么后，这里会出现 5 条可选回复。
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="py-0 shadow-sm">
                    <CardContent className="space-y-2.5 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{suggestion.styleLabel || "自然得体"}</Badge>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">{suggestion.content}</p>
                      {suggestion.reason && (
                        <p className="rounded-md bg-muted/60 p-2 text-xs leading-5 text-muted-foreground">
                          {suggestion.reason}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(suggestion.content)}>
                          <Copy className="mr-2 size-4" />
                          复制
                        </Button>
                        <Button size="sm" onClick={() => handleOpenAdopt(suggestion)} disabled={isSessionEnded}>
                          <Send className="mr-2 size-4" />
                          采用并保存
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={!!adoptingSuggestion} onOpenChange={(open) => !open && setAdoptingSuggestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存我实际发出的内容</DialogTitle>
            <DialogDescription>
              如果你复制后自己改过，这里按你最终发给对方的版本保存，后续上下文会更准。
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={finalContent}
            onChange={(event) => setFinalContent(event.target.value)}
            rows={5}
            maxLength={500}
            disabled={isAdopting}
            className="resize-none"
          />
          <p className="text-right text-xs text-muted-foreground">{finalContent.length}/500</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdoptingSuggestion(null)} disabled={isAdopting}>
              取消
            </Button>
            <Button onClick={handleAdopt} disabled={isAdopting || !finalContent.trim()}>
              {isAdopting && <Spinner className="mr-2" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ImagePreview src={previewImage} open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)} />
    </div>
  );
}
