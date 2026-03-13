import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { profileAPI } from "@/lib/api";
import { PersonProfile } from "@/types";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Plus, User, Heart, Trash2, MessageCircle, Pencil, Eye } from "lucide-react";
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

export default function PersonProfiles() {
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await profileAPI.getProfiles();
      setProfiles(response.data || []);
    } catch (error) {
      toast.error("加载人物档案失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await profileAPI.deleteProfile(deleteId);
      setProfiles((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("删除成功");
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <AppNav activePage="profiles" showLogout />

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">人物档案</h1>
            <p className="text-muted-foreground mt-1">
              管理您常联系的人，获得更精准的回复建议
            </p>
          </div>
          <Link href="/profiles/new">
            <Button>
              <Plus className="size-4 mr-2" />
              新建档案
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="size-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">暂无人物档案</p>
              <p className="text-sm text-muted-foreground mt-1">
                创建人物档案，预设对方的属性，让 AI 生成更贴合实际的回复
              </p>
              <Link href="/profiles/new">
                <Button className="mt-4">创建第一个档案</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setLocation(`/profiles/${profile.id}`)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="size-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="size-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{profile.name}</h3>
                        {profile.isFavorite && (
                          <Heart className="size-4 text-red-500 fill-red-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.relationship && (
                          <Badge variant="outline" className="text-xs">
                            {profile.relationship}
                          </Badge>
                        )}
                        {profile.occupation && (
                          <Badge variant="secondary" className="text-xs">
                            {profile.occupation}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile.personality && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {profile.personality}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Link href={`/profiles/${profile.id}/chat`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="default" size="sm" className="w-full">
                        <MessageCircle className="size-4 mr-1" />
                        开始聊天
                      </Button>
                    </Link>
                    <Link href={`/profiles/${profile.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                    <Link href={`/profiles/${profile.id}/edit`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm">
                        <Pencil className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(profile.id);
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个人物档案吗？此操作无法撤销。
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
