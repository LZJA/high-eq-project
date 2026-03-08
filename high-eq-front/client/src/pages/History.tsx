import { useState, useEffect } from "react";

import { replyAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ArrowLeft, Clock, Heart, Trash2, User, Copy } from "lucide-react";
import { Link } from "wouter";
import { AppNav } from "@/components/AppNav";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface HistoryItem {
  id: string;
  chatContent: string;
  roleBackground: string;
  userIntent: string;
  createTime: string;
  isFavorite: boolean;
}

interface HistoryDetail {
  id: string;
  chatContent: string;
  roleBackground: string;
  userIntent: string;
  suggestions: Array<{
    id: string;
    content: string;
    reason: string;
    tone: string;
  }>;
  createTime: string;
  isFavorite: boolean;
}

export default function History() {

  const [isLoading, setIsLoading] = useState(true);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await replyAPI.getHistory(currentPage, pageSize);
      setHistoryList(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "加载历史记录失败");
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryDetail = async (historyId: string) => {
    setIsDetailLoading(true);
    try {
      const response = await replyAPI.getHistoryDetail(historyId);
      setSelectedHistory(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "加载详情失败");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (historyId: string) => {
    try {
      await replyAPI.deleteHistory(historyId);
      toast.success("删除成功");
      setHistoryList((prev) => prev.filter((item) => item.id !== historyId));
      if (selectedHistory?.id === historyId) {
        setSelectedHistory(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "删除失败");
    }
  };

  const handleToggleFavorite = async (historyId: string) => {
    try {
      await replyAPI.toggleFavorite(historyId);
      setHistoryList((prev) =>
        prev.map((item) =>
          item.id === historyId
            ? { ...item, isFavorite: !item.isFavorite }
            : item
        )
      );
      if (selectedHistory?.id === historyId) {
        setSelectedHistory((prev) =>
          prev ? { ...prev, isFavorite: !prev.isFavorite } : null
        );
      }
      toast.success("操作成功");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 导航栏 */}
      <AppNav activePage="history" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link href="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-2" />
              返回生成器
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">历史记录</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">记录列表</CardTitle>
                <CardDescription>共 {historyList.length} 条记录</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="size-12 mx-auto mb-4 opacity-50" />
                    <p>暂无历史记录</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historyList.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                          selectedHistory?.id === item.id ? "bg-accent border-primary" : ""
                        }`}
                        onClick={() => loadHistoryDetail(item.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.roleBackground}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(item.id);
                              }}
                            >
                              <Heart
                                className={`size-4 ${
                                  item.isFavorite ? "fill-red-500 text-red-500" : ""
                                }`}
                              />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    删除后无法恢复，确定要删除这条记录吗？
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.chatContent}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(item.createTime)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                            onClick={() =>
                              currentPage > 1 && setCurrentPage((p) => p - 1)
                            }
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                className="cursor-pointer"
                                isActive={currentPage === page}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        )}
                        <PaginationItem>
                          <PaginationNext
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                            onClick={() =>
                              currentPage < totalPages && setCurrentPage((p) => p + 1)
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧详情 */}
          <div className="lg:col-span-2">
            {isDetailLoading ? (
              <Card>
                <CardContent className="py-12 flex justify-center">
                  <Spinner />
                </CardContent>
              </Card>
            ) : !selectedHistory ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Clock className="size-12 mx-auto mb-4 opacity-50" />
                  <p>选择一条记录查看详情</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>记录详情</CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-start gap-2">
                        <Badge
                          variant="outline"
                          className="max-w-full h-auto shrink justify-start whitespace-normal break-words py-1 text-left leading-relaxed"
                        >
                          {selectedHistory.roleBackground}
                        </Badge>
                        <span className="text-xs">{formatDate(selectedHistory.createTime)}</span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFavorite(selectedHistory.id)}
                    >
                      <Heart
                        className={`size-4 mr-2 ${
                          selectedHistory.isFavorite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      {selectedHistory.isFavorite ? "已收藏" : "收藏"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 对方聊天内容 */}
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="size-4" />
                      对方聊天内容
                    </h3>
                    <div className="bg-muted/50 rounded-md p-3 text-sm">
                      {selectedHistory.chatContent}
                    </div>
                  </div>

                  {/* 用户意图 */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">您的意图</h3>
                    <div className="bg-muted/50 rounded-md p-3 text-sm">
                      {selectedHistory.userIntent}
                    </div>
                  </div>

                  {/* 回复建议 */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      回复建议 ({selectedHistory.suggestions.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedHistory.suggestions.map((suggestion, index) => (
                        <Card key={suggestion.id} className="shadow-sm">
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
