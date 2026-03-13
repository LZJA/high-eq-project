import { useEffect, useState } from "react";
import { Link } from "wouter";
import { profileAPI, replyAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { ArrowLeft, Clock, Copy, Heart, Trash2, User } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { ImagePreview } from "@/components/ImagePreview";

interface FavoriteSuggestion {
  id: string;
  content: string;
  reason: string;
  tone: string;
}

interface FavoriteItem {
  id: string;
  personProfileId?: string | null;
  chatContent: string;
  chatImage?: string;
  roleBackground: string;
  userIntent: string;
  createTime: string;
  suggestions: FavoriteSuggestion[];
}

interface ProfileSummary {
  id: string;
  name?: string;
  relationship?: string;
}

export default function Favorites() {
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profileSummaryMap, setProfileSummaryMap] = useState<Record<string, ProfileSummary>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const favoritesResponse = await replyAPI.getFavoriteHistory();
      setFavorites(favoritesResponse.data || []);

      try {
        const profilesResponse = await profileAPI.getProfiles();
        const profiles = (profilesResponse.data || []) as ProfileSummary[];
        const summaryMap = profiles.reduce((acc, profile) => {
          if (profile.id) {
            acc[profile.id] = profile;
          }
          return acc;
        }, {} as Record<string, ProfileSummary>);
        setProfileSummaryMap(summaryMap);
      } catch {
        setProfileSummaryMap({});
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "加载收藏失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: FavoriteItem) => {
    try {
      if (item.personProfileId) {
        await profileAPI.deleteProfileHistory(item.personProfileId, item.id);
      } else {
        await replyAPI.deleteHistory(item.id);
      }

      toast.success("已从收藏中删除");
      setFavorites((prev) => prev.filter((favorite) => favorite.id !== item.id));
      if (expandedId === item.id) {
        setExpandedId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    }
  };

  const handleToggleFavorite = async (item: FavoriteItem) => {
    try {
      if (item.personProfileId) {
        await profileAPI.toggleProfileHistoryFavorite(item.personProfileId, item.id);
      } else {
        await replyAPI.toggleFavorite(item.id);
      }

      setFavorites((prev) => prev.filter((favorite) => favorite.id !== item.id));
      if (expandedId === item.id) {
        setExpandedId(null);
      }
      toast.success("已取消收藏");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <AppNav activePage="favorites" />

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
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
          <p className="text-muted-foreground mt-2">共 {favorites.length} 条收藏</p>
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
                生成回复后点击收藏，或在人物档案聊天历史中收藏记录。
              </p>
              <Link href="/app">
                <Button>开始生成回复</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((item) => (
              <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {item.personProfileId ? (
                        <div className="mb-2 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">
                              {profileSummaryMap[item.personProfileId]?.name || "档案人物"}
                            </Badge>
                            <Badge variant="secondary">
                              {profileSummaryMap[item.personProfileId]?.relationship || "关系未设置"}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                              <Clock className="size-3" />
                              {item.createTime}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="w-fit text-xs text-muted-foreground"
                          >
                            人物档案
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {item.roleBackground && (
                            <Badge
                              variant="outline"
                            >
                              {item.roleBackground}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="size-3" />
                            {item.createTime}
                          </span>
                        </div>
                      )}
                      {item.chatImage && (
                        <img
                          src={item.chatImage}
                          alt="聊天截图"
                          className="w-16 h-16 object-cover rounded mb-2 cursor-pointer"
                          onClick={() => setPreviewImage(item.chatImage!)}
                        />
                      )}
                      <CardDescription className="line-clamp-2">{item.chatContent || "（图片内容）"}</CardDescription>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-3 text-xs"
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      >
                        {expandedId === item.id ? "收起" : "展开"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggleFavorite(item)}
                        title="取消收藏"
                      >
                        <Heart className="size-4 fill-red-500 text-red-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" title="删除记录">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              删除后无法恢复，确定删除这条收藏记录吗？
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item)}
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
                    {item.chatImage && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">聊天截图</h4>
                        <img
                          src={item.chatImage}
                          alt="聊天截图"
                          className="w-32 h-32 object-cover rounded cursor-pointer"
                          onClick={() => setPreviewImage(item.chatImage!)}
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <User className="size-4" />
                        对方聊天内容
                      </h4>
                      <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap">
                        {item.chatContent || "（图片内容）"}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">你的意图</h4>
                      <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap">
                        {item.userIntent}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-3">
                        推荐回复 ({item.suggestions?.length || 0})
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(item.suggestions || []).map((suggestion, index) => (
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
                              {suggestion.reason && (
                                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 mb-2">
                                  {suggestion.reason}
                                </div>
                              )}
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

      <ImagePreview
        src={previewImage}
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      />
    </div>
  );
}
