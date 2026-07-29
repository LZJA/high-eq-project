import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { guestApi } from "@/lib/api";
import {
  appendGuestChatMessages,
  buildGuestChatContent,
  getGuestChatSession,
  updateGuestChatSuggestions,
  type GuestChatSession,
  type GuestChatSuggestion,
} from "@/lib/guestReplyChat";
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
import { toast } from "sonner";
import { ArrowLeft, Copy, LogIn, Send, Sparkles } from "lucide-react";

interface GuestReplyChatSessionProps {
  sessionId: string;
}

export default function GuestReplyChatSession({ sessionId }: GuestReplyChatSessionProps) {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<GuestChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdopting, setIsAdopting] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(3);
  const [opponentMessage, setOpponentMessage] = useState("");
  const [userIntent, setUserIntent] = useState("");
  const [adoptingSuggestion, setAdoptingSuggestion] = useState<GuestChatSuggestion | null>(null);
  const [finalContent, setFinalContent] = useState("");

  useEffect(() => {
    const currentSession = getGuestChatSession(sessionId);
    setSession(currentSession);
    setIsLoading(false);

    guestApi
      .getRemainingQuota()
      .then((response) => {
        if (response.code === 200) {
          setRemainingQuota(response.data);
        }
      })
      .catch(() => {
        setRemainingQuota(0);
      });
  }, [sessionId]);

  const suggestions = useMemo(() => session?.latestSuggestions || [], [session]);
  const isSessionEnded = !session || session.turnCount >= session.maxTurnCount;

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate("/app");
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const handleGenerate = async () => {
    if (!session) return;
    if (!opponentMessage.trim()) {
      toast.error("请输入对方说了什么");
      return;
    }
    if (remainingQuota <= 0) {
      toast.error("今日免费点数已用完，登录后可以继续使用", {
        action: {
          label: "去登录",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await guestApi.generateReplies({
        chatContent: buildGuestChatContent(session, opponentMessage),
        roleBackground: session.roleBackground,
        userIntent: userIntent.trim() || session.initialUserIntent || "结合当前聊天上下文自然回复",
      });

      if (response.code !== 200) {
        toast.error(response.message || "生成失败");
        return;
      }

      const withOpponent = appendGuestChatMessages(session.id, [
        { role: "opponent", content: opponentMessage, source: "guest_input" },
      ]);
      const nextSession = updateGuestChatSuggestions(withOpponent.id, response.data.suggestions || []);
      setSession(nextSession);
      setOpponentMessage("");
      setUserIntent("");
      setRemainingQuota((prev) => Math.max(0, prev - 1));
      toast.success("已生成这一轮回复");
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("今日免费点数已用完，登录后可以继续使用", {
          action: {
            label: "去登录",
            onClick: () => navigate("/login"),
          },
        });
      } else {
        toast.error(error.response?.data?.message || "生成失败，请稍后重试");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenAdopt = (suggestion: GuestChatSuggestion) => {
    setAdoptingSuggestion(suggestion);
    setFinalContent(suggestion.content);
  };

  const handleAdopt = async () => {
    if (!session || !adoptingSuggestion || !finalContent.trim()) {
      toast.error("请输入你实际发给对方的话");
      return;
    }

    setIsAdopting(true);
    try {
      const nextSession = appendGuestChatMessages(session.id, [
        { role: "user", content: finalContent, source: "adopted_suggestion" },
      ]);
      setSession(nextSession);
      setAdoptingSuggestion(null);
      setFinalContent("");
      toast.success("已记到这段临时继续聊");
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setIsAdopting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <Card className="mx-auto max-w-md py-0 shadow-sm">
          <CardContent className="space-y-4 p-5 text-center">
            <h1 className="text-lg font-semibold">这段临时继续聊已失效</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              游客继续聊只保存在当前浏览器会话里，关闭页面后可能无法找回。登录后可以使用正式继续聊和更多可用点数。
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => navigate("/app")}>
                返回生成器
              </Button>
              <Button onClick={() => navigate("/login")}>
                <LogIn className="mr-2 size-4" />
                登录使用
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent"
            onClick={() => navigate("/")}
          >
            HighEQ
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">游客临时体验</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              登录使用正式功能
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-5xl flex-col px-4 py-2 sm:py-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 size-4" />
            返回上一页
          </Button>
          <Badge variant={isSessionEnded ? "secondary" : "outline"}>
            {isSessionEnded ? "临时体验已到上限" : `第 ${session.turnCount}/${session.maxTurnCount} 轮`}
          </Badge>
          <div className="basis-full text-xs text-muted-foreground sm:ml-auto sm:basis-auto">
            今日剩余: <span className="font-semibold text-blue-600">{remainingQuota}/3 点</span>
          </div>
        </div>

        <div className="mb-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
          游客继续聊不会进入历史记录，关闭页面后可能无法找回。登录后可以使用正式继续聊，并获得更多可用点数。
        </div>

        <div className="grid gap-2.5 lg:grid-cols-[1fr_360px] lg:gap-3">
          <Card className="border-slate-200 py-0 shadow-sm">
            <CardContent className="flex flex-col p-3">
              <div className="mb-2.5">
                <h1 className="text-lg font-semibold sm:text-xl">继续聊</h1>
                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                  对方说了什么、你实际发了什么，都会成为下一轮建议的背景。
                </p>
              </div>

              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1.5 sm:max-h-[460px] sm:pr-2 lg:max-h-[calc(100vh-300px)]">
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
                    placeholder="粘贴对方刚说的话，或总结最近几轮对方大概表达了什么..."
                    rows={4}
                    maxLength={500}
                    disabled={isGenerating || isSessionEnded}
                    className="resize-none"
                  />
                  <p className="text-right text-xs text-muted-foreground">{opponentMessage.length}/500</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">我的真实想法（可选）</label>
                  <Textarea
                    value={userIntent}
                    onChange={(event) => setUserIntent(event.target.value)}
                    placeholder="比如：我想关心，但别显得太黏..."
                    rows={3}
                    maxLength={300}
                    disabled={isGenerating || isSessionEnded}
                    className="resize-none"
                  />
                  <p className="text-right text-xs text-muted-foreground">{userIntent.length}/300</p>
                </div>
                <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || isSessionEnded}>
                  {isGenerating ? <Spinner className="mr-2" /> : <Sparkles className="mr-2 size-4" />}
                  生成这一轮回复
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="font-semibold">当前候选</h2>
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
                      <Badge variant="outline">{suggestion.styleLabel || suggestion.tone || "自然得体"}</Badge>
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
                          采用并继续
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
            <DialogTitle>确认你实际发出的内容</DialogTitle>
            <DialogDescription>
              如果你复制后自己改过，这里按最终发给对方的版本记录，下一轮理解会更准。
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
              记入继续聊
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
