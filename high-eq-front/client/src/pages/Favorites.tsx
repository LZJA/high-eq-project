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

interface FavoriteItem {
  id: string;
  chatContent: string;
  roleBackground: string;
  userIntent: string;
  createTime: string;
  suggestions: Array<{
    id: string;
    content: string;
    reason: string;
    tone: string;
  }>;
}

export default function Favorites() {

  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await replyAPI.getFavoriteHistory();
      setFavorites(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "加载收藏失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (historyId: string) => {
    try {
      await replyAPI.deleteHistory(historyId);
      toast.success("已从收藏中移除");
      setFavorites((prev) => prev.filter((item) => item.id !== historyId));
      if (expandedId === historyId) {
        setExpandedId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    }
  };

  const handleToggleFavorite = async (historyId: string) => {
    try {
      await replyAPI.toggleFavorite(historyId);
      setFavorites((prev) => prev.filter((item) => item.id !== historyId));
      toast.success("已取消收藏");
      if (expandedId === historyId) {
        setExpandedId(null);
      }
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
      <AppNav activePage="favorites" />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link href="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-2" />
              返回生成器
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="size-8 text-red-500 fill-red-500" />
            我的收藏
          </h1>
          <p className="text-muted-foreground mt-2">
            共 {favorites.length} 条收藏
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <Spinner />
            </CardContent>
          </Card>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground mb-2">暂无收藏</p>
              <p className="text-sm text-muted-foreground mb-6">
                在生成回复或查看历史记录时，点击心形图标即可收藏
              </p>
              <Link href="/app">
                <Button>开始生成回复</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((item) => (
              <Card
                key={item.id}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.roleBackground}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDate(item.createTime)}
                        </span>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {item.chatContent}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      >
                        {expandedId === item.id ? "收起" : "展开"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggleFavorite(item.id)}
                        title="取消收藏"
                      >
                        <Heart className="size-4 fill-red-500 text-red-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="删除"
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
                </CardHeader>

                {expandedId === item.id && (
                  <CardContent className="space-y-4 pt-0">
                    {/* 对方聊天内容 */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <User className="size-4" />
                        对方聊天内容
                      </h4>
                      <div className="bg-muted/50 rounded-md p-3 text-sm">
                        {item.chatContent}
                      </div>
                    </div>

                    {/* 用户意图 */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">您的意图</h4>
                      <div className="bg-muted/50 rounded-md p-3 text-sm">
                        {item.userIntent}
                      </div>
                    </div>

                    {/* 回复建议 */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">
                        回复建议 ({item.suggestions.length})
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {item.suggestions.map((suggestion, index) => (
                          <Card key={suggestion.id} className="shadow-sm">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  方案 {index + 1}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleCopy(suggestion.content)}
                                  title="复制"
                                >
                                  <Copy className="size-4" />
                                </Button>
                              </div>
                              <p className="text-sm mb-3 whitespace-pre-wrap line-clamp-4">
                                {suggestion.content}
                              </p>
                              {suggestion.tone && (
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.tone}
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
