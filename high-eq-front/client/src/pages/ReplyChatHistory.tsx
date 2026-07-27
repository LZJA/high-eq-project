import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { replyChatAPI } from "@/lib/api";
import { ArrowLeft, Clock, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ReplyChatHistoryItem {
  id: string;
  roleBackground?: string;
  initialChatContent?: string;
  latestMessage?: string;
  turnCount?: number;
  maxTurnCount?: number;
  status?: string;
  createTime?: string;
  updateTime?: string;
}

export default function ReplyChatHistory() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<ReplyChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadSessions();
  }, [currentPage]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await replyChatAPI.listSessions(currentPage, pageSize);
      setItems(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "加载继续聊记录失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await replyChatAPI.deleteSession(sessionId);
      toast.success("删除成功");
      setItems((prev) => prev.filter((item) => item.id !== sessionId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "删除失败");
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    return new Date(value).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav activePage="replyChatHistory" showLogout />
      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
            <ArrowLeft className="mr-2 size-4" />
            返回生成器
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>继续聊记录</CardTitle>
            <CardDescription>共 {total} 段会话，点击记录可以接着聊</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <MessageCircle className="mx-auto mb-3 size-10 opacity-50" />
                <p>暂无继续聊记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-white p-4 transition-colors hover:bg-accent"
                    onClick={() => navigate(`/reply-chat/${item.id}`)}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Badge variant="outline">{item.roleBackground || "未设置关系"}</Badge>
                        <Badge variant={item.status === "active" ? "secondary" : "outline"}>
                          {item.status === "active" ? "进行中" : "已结束"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.turnCount || 0}/{item.maxTurnCount || 100} 轮
                        </span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              删除后这段继续聊会被彻底移除，无法恢复。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(item.id)}
                            >
                              删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-900">
                      {item.latestMessage || item.initialChatContent || "这段会话还没有更多内容"}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span>{formatDate(item.updateTime || item.createTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Pagination
              className="mt-5"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
