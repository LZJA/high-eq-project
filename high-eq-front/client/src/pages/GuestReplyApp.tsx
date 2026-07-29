import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { guestApi } from "@/lib/api";
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
import { Copy, LogIn, MessageCircle, Wand2 } from "lucide-react";
import { createGuestChatSession } from "@/lib/guestReplyChat";

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

interface ReplySuggestion {
  id: string;
  content: string;
  reason: string;
  tone: string;
  styleLabel?: string;
}

export default function GuestReplyApp() {
  const [, navigate] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatContent, setChatContent] = useState("");
  const [roleBackground, setRoleBackground] = useState("");
  const [userIntent, setUserIntent] = useState("");
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [remainingQuota, setRemainingQuota] = useState(3);
  const [continueSuggestion, setContinueSuggestion] = useState<ReplySuggestion | null>(null);
  const [sentReplyDraft, setSentReplyDraft] = useState("");

  useEffect(() => {
    loadQuota();
  }, []);

  const loadQuota = async () => {
    try {
      const response = await guestApi.getRemainingQuota();
      if (response.code === 200) {
        setRemainingQuota(response.data);
      }
    } catch (error) {
      console.error("Failed to load quota", error);
    }
  };

  const handleGenerate = async () => {
    if (!chatContent.trim()) {
      toast.error("请输入对话内容");
      return;
    }
    if (!roleBackground) {
      toast.error("请选择对方角色");
      return;
    }
    if (!userIntent.trim()) {
      toast.error("请输入您的真实意图");
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);
    try {
      const response = await guestApi.generateReplies({
        chatContent,
        roleBackground,
        userIntent,
      });

      if (response.code === 200) {
        setSuggestions(response.data.suggestions);
        setRemainingQuota(prev => Math.max(0, prev - 1));
        toast.success("回复生成成功");
      } else {
        toast.error(response.message || "生成失败");
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("今日免费点数已用完，请注册后继续使用", {
          action: {
            label: "去注册",
            onClick: () => navigate("/register"),
          },
        });
      } else {
        toast.error("生成失败，请稍后重试");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const handleOpenContinue = (suggestion: ReplySuggestion) => {
    setContinueSuggestion(suggestion);
    setSentReplyDraft(suggestion.content);
  };

  const handleCreateContinueChat = () => {
    if (!continueSuggestion) return;
    if (!sentReplyDraft.trim()) {
      toast.error("请输入你实际发给对方的话");
      return;
    }

    const session = createGuestChatSession({
      initialOpponentMessage: chatContent,
      roleBackground,
      initialUserIntent: userIntent,
      selectedReply: continueSuggestion.content,
      sentReply: sentReplyDraft,
    });
    toast.success("已开启临时继续聊");
    navigate(`/guest-reply-chat/${session.id}`);
  };

  const handleReset = () => {
    setChatContent("");
    setUserIntent("");
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              免费体验
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              每日 3 点免费体验
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              剩余点数: <span className="font-bold text-blue-600">{remainingQuota}/3</span>
            </div>
            <Button onClick={() => navigate("/register")} variant="outline" size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              注册解锁更多
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  disabled={isGenerating}
                  className="resize-none transition-transform focus:scale-[1.02]"
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

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || remainingQuota === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Spinner className="mr-2" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      生成高情商回复
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={isGenerating}
                  variant="outline"
                >
                  重置
                </Button>
              </div>
              {remainingQuota === 0 && (
                <p className="text-sm text-red-600 text-center">
                  今日次数已用完，
                  <button
                    onClick={() => navigate("/register")}
                    className="underline font-medium"
                  >
                    注册
                  </button>
                  后继续使用
                </p>
              )}
            </CardContent>
          </Card>

          {/* 右侧回复建议 */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                回复建议 {suggestions.length > 0 && `(${suggestions.length})`}
              </h2>
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
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="py-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:px-6">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <Badge variant="outline">{suggestion.styleLabel || suggestion.tone || "自然得体"}</Badge>
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

        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-medium text-gray-900 mb-1">想要更多功能？</p>
                  <p className="text-sm text-gray-600">
                    注册后可使用：历史记录、收藏、人物档案等功能
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Button onClick={() => navigate("/register")} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    注册账号
                  </Button>
                  <Button onClick={() => navigate("/login")} variant="outline">
                    已有账号登录
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={!!continueSuggestion} onOpenChange={(open) => !open && setContinueSuggestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>开启临时继续聊</DialogTitle>
            <DialogDescription>
              先确认你实际发给对方的话。游客继续聊只保存在当前浏览器会话里，关闭页面后可能无法找回。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">我实际发出的内容</label>
            <Textarea
              value={sentReplyDraft}
              onChange={(event) => setSentReplyDraft(event.target.value)}
              rows={5}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">{sentReplyDraft.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContinueSuggestion(null)}>
              取消
            </Button>
            <Button onClick={handleCreateContinueChat} disabled={!sentReplyDraft.trim()}>
              进入继续聊
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
