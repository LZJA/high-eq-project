import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { profileAPI } from "@/lib/api";
import { PersonProfile, GENDERS, ZODIAC_SIGNS, CHINESE_ZODIAC, RELATIONSHIPS } from "@/types";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Edit, MessageCircle, Trash2, User, Heart } from "lucide-react";
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

interface PersonProfileDetailProps {
  profileId: string;
}

interface HistoryItem {
  id: string;
  chatContent: string;
  userIntent: string;
  createTime: string;
  isFavorite: boolean;
}

export default function PersonProfileDetail({ profileId }: PersonProfileDetailProps) {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile(profileId);
      setProfile(response.data);
      loadHistory();
    } catch (error) {
      toast.error("加载人物档案失败");
      setLocation("/profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await profileAPI.getProfileHistory(profileId);
      setHistory(response.data || []);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await profileAPI.deleteProfile(deleteId);
      setLocation("/profiles");
      toast.success("删除成功");
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setDeleteId(null);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppNav showLogout />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handleGoBack}
        >
          <ArrowLeft className="size-4 mr-2" />
          返回列表
        </Button>

        {/* 人物信息卡片 */}
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
                  {profile.age && <Badge variant="outline">{profile.age}岁</Badge>}
                  {profile.relationship && (
                    <Badge variant="secondary">{profile.relationship}</Badge>
                  )}
                  {profile.occupation && (
                    <Badge variant="outline">{profile.occupation}</Badge>
                  )}
                </div>
                {profile.personality && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {profile.personality}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocation(`/profiles/${profileId}/chat`)}
                  >
                    <MessageCircle className="size-4 mr-2" />
                    开始聊天
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/profiles/${profileId}/edit`)}
                  >
                    <Edit className="size-4 mr-2" />
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteId(profileId)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 详细信息和历史记录标签页 */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">详细信息</TabsTrigger>
            <TabsTrigger value="history">
              聊天历史 ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* 详细信息标签页 */}
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
                    <p className="text-sm text-muted-foreground">属相</p>
                    <p className="font-medium">{profile.chineseZodiac}</p>
                  </div>
                )}
                {profile.hobbies && (
                  <div>
                    <p className="text-sm text-muted-foreground">兴趣爱好</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {JSON.parse(profile.hobbies).map((hobby: string) => (
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

          {/* 聊天历史标签页 */}
          <TabsContent value="history">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="size-12 mx-auto mb-4 opacity-50" />
                  <p>暂无聊天记录</p>
                  <p className="text-sm mt-1">
                    与 {profile.name} 开始聊天后，记录将显示在这里
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.chatContent}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.createTime}
                          </p>
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

      {/* 删除确认对话框 */}
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
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
