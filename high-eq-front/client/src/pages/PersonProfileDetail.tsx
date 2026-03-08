import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { profileAPI } from "@/lib/api";
import { PersonProfile } from "@/types";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Edit, Heart, MessageCircle, Trash2, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PersonProfileDetailProps {
  profileId: string;
}

interface HistorySuggestion {
  id: string;
  content: string;
  reason: string;
  tone: string;
}

interface HistoryItem {
  id: string;
  chatContent: string;
  roleBackground?: string;
  userIntent: string;
  createTime: string;
  isFavorite: boolean;
}

interface HistoryDetail extends HistoryItem {
  suggestions: HistorySuggestion[];
}

function parseHobbies(hobbies?: string[] | string): string[] {
  if (!hobbies) return [];
  if (Array.isArray(hobbies)) return hobbies;

  try {
    const parsed = JSON.parse(hobbies);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function PersonProfileDetail({ profileId }: PersonProfileDetailProps) {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<HistoryDetail | null>(null);
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false);
  const [isHistoryDetailLoading, setIsHistoryDetailLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadHistory = async () => {
    try {
      const response = await profileAPI.getProfileHistory(profileId);
      setHistory(response.data || []);
    } catch (error) {
      console.error("Failed to load profile history", error);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile(profileId);
      setProfile(response.data);
      await loadHistory();
    } catch {
      toast.error("加载人物档案失败");
      setLocation("/profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!deleteId) return;

    try {
      await profileAPI.deleteProfile(deleteId);
      toast.success("删除成功");
      setLocation("/profiles");
    } catch {
      toast.error("删除失败");
    } finally {
      setDeleteId(null);
    }
  };

  const handleOpenHistoryDetail = async (historyId: string) => {
    setIsHistoryDetailLoading(true);
    setIsHistoryDetailOpen(true);

    try {
      const response = await profileAPI.getProfileHistoryDetail(profileId, historyId);
      setSelectedHistory(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "加载聊天详情失败");
      setIsHistoryDetailOpen(false);
    } finally {
      setIsHistoryDetailLoading(false);
    }
  };

  const handleToggleHistoryFavorite = async (historyId: string) => {
    try {
      await profileAPI.toggleProfileHistoryFavorite(profileId, historyId);

      setHistory((prev) =>
        prev.map((item) =>
          item.id === historyId ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
      setSelectedHistory((prev) =>
        prev && prev.id === historyId ? { ...prev, isFavorite: !prev.isFavorite } : prev
      );

      toast.success("收藏状态已更新");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    }
  };

  const handleGoBack = () => {
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

  const hobbies = parseHobbies(profile.hobbies);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppNav showLogout />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={handleGoBack}>
          <ArrowLeft className="size-4 mr-2" />
          返回列表
        </Button>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="size-8 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  {profile.isFavorite && (
                    <Heart className="size-5 text-red-500 fill-red-500" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.gender && <Badge>{profile.gender}</Badge>}
                  {profile.age && <Badge variant="outline">{profile.age} 岁</Badge>}
                  {profile.relationship && <Badge variant="secondary">{profile.relationship}</Badge>}
                  {profile.occupation && <Badge variant="outline">{profile.occupation}</Badge>}
                </div>

                {profile.personality && (
                  <p className="text-sm text-muted-foreground mb-3">{profile.personality}</p>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setLocation(`/profiles/${profileId}/chat`)}>
                    <MessageCircle className="size-4 mr-2" />
                    开始聊天
                  </Button>
                  <Button variant="outline" onClick={() => setLocation(`/profiles/${profileId}/edit`)}>
                    <Edit className="size-4 mr-2" />
                    编辑
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleteId(profileId)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">详细信息</TabsTrigger>
            <TabsTrigger value="history">聊天历史 ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {profile.zodiacSign && (
                  <div>
                    <p className="text-sm text-muted-foreground">星座</p>
                    <p className="font-medium">{profile.zodiacSign}</p>
                  </div>
                )}

                {profile.chineseZodiac && (
                  <div>
                    <p className="text-sm text-muted-foreground">生肖</p>
                    <p className="font-medium">{profile.chineseZodiac}</p>
                  </div>
                )}

                {hobbies.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">兴趣爱好</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {hobbies.map((hobby) => (
                        <Badge key={hobby} variant="outline">
                          {hobby}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">备注</p>
                    <p className="text-sm">{profile.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="size-12 mx-auto mb-4 opacity-50" />
                  <p>暂无聊天记录</p>
                  <p className="text-sm mt-1">开始与 {profile.name} 聊天后，记录会显示在这里。</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenHistoryDetail(item.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.chatContent}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{item.createTime}</p>
                        </div>
                        {item.isFavorite && (
                          <Heart className="size-4 text-red-500 fill-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                        意图：{item.userIntent}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 {profile.name} 的档案吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfile}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isHistoryDetailOpen}
        onOpenChange={(open) => {
          setIsHistoryDetailOpen(open);
          if (!open) {
            setSelectedHistory(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>聊天记录详情</DialogTitle>
            <DialogDescription>查看这次聊天的推荐回复和收藏状态。</DialogDescription>
          </DialogHeader>

          {isHistoryDetailLoading || !selectedHistory ? (
            <div className="py-10 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  {selectedHistory.roleBackground && (
                    <Badge
                      variant="outline"
                      className="max-w-full h-auto shrink justify-start whitespace-normal break-words py-1 text-left leading-relaxed"
                    >
                      {selectedHistory.roleBackground}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">{selectedHistory.createTime}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => handleToggleHistoryFavorite(selectedHistory.id)}
                >
                  <Heart
                    className={`size-4 mr-2 ${
                      selectedHistory.isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {selectedHistory.isFavorite ? "已收藏" : "收藏"}
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">对方聊天内容</p>
                <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap">
                  {selectedHistory.chatContent}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">你的意图</p>
                <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap">
                  {selectedHistory.userIntent}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">
                  推荐回复 ({selectedHistory.suggestions?.length || 0})
                </p>
                {selectedHistory.suggestions?.map((suggestion, index) => (
                  <Card key={suggestion.id}>
                    <CardContent className="pt-4 space-y-2">
                      <Badge variant="secondary">方案 {index + 1}</Badge>
                      <p className="text-sm whitespace-pre-wrap">{suggestion.content}</p>
                      {suggestion.reason && (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                          {suggestion.reason}
                        </div>
                      )}
                      {suggestion.tone && <Badge variant="outline">{suggestion.tone}</Badge>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
