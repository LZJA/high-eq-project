import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { profileAPI } from "@/lib/api";
import { PersonProfile, GENDERS, ZODIAC_SIGNS, CHINESE_ZODIAC, RELATIONSHIPS } from "@/types";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, User } from "lucide-react";

interface PersonProfileFormProps {
  profileId?: string;
}

export default function PersonProfileForm({ profileId }: PersonProfileFormProps) {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 表单字段
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState<string>("");
  const [personality, setPersonality] = useState("");
  const [occupation, setOccupation] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [chineseZodiac, setChineseZodiac] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");

  const isEdit = !!profileId;

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await profileAPI.getProfile(profileId!);
      const profile = response.data;
      setName(profile.name || "");
      setGender(profile.gender || "");
      setAge(profile.age?.toString() || "");
      setPersonality(profile.personality || "");
      setOccupation(profile.occupation || "");
      setZodiacSign(profile.zodiacSign || "");
      setChineseZodiac(profile.chineseZodiac || "");
      setHobbies(profile.hobbies || "");
      setRelationship(profile.relationship || "");
      setNotes(profile.notes || "");
    } catch (error) {
      toast.error("加载人物档案失败");
      setLocation("/profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("请输入姓名");
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        name: name.trim(),
        gender: gender || undefined,
        age: age ? parseInt(age) : undefined,
        personality: personality.trim() || undefined,
        occupation: occupation.trim() || undefined,
        zodiacSign: zodiacSign || undefined,
        chineseZodiac: chineseZodiac || undefined,
        hobbies: hobbies.trim() || undefined,
        relationship: relationship || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEdit) {
        await profileAPI.updateProfile(profileId!, data);
        toast.success("更新成功");
        setLocation(`/profiles/${profileId}`);
      } else {
        const response = await profileAPI.createProfile(data);
        toast.success("创建成功");
        setLocation("/profiles");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "保存失败");
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <AppNav showLogout />

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handleGoBack}
        >
          <ArrowLeft className="size-4 mr-2" />
          返回列表
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-blue-600" />
              {isEdit ? "编辑人物档案" : "新建人物档案"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  姓名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">年龄</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="输入年龄"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">职业</Label>
                <Input
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="输入职业"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">与您的关系</Label>
              <Select  value={relationship} onValueChange={setRelationship}>
                <SelectTrigger className="w-[48.7%]">
                  <SelectValue placeholder="选择关系" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">性格特点</Label>
              <Textarea
                id="personality"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="描述这个人的性格特点..."
                rows={2}
              />
            </div>

            {/* 星座属相 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>星座</Label>
                <Select value={zodiacSign} onValueChange={setZodiacSign}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择星座" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZODIAC_SIGNS.map((z) => (
                      <SelectItem key={z} value={z}>
                        {z}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>属相</Label>
                <Select value={chineseZodiac} onValueChange={setChineseZodiac}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择属相" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHINESE_ZODIAC.map((z) => (
                      <SelectItem key={z} value={z}>
                        {z}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hobbies">兴趣爱好</Label>
              <Input
                id="hobbies"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                placeholder="多个爱好用逗号分隔，如：阅读, 旅游, 美食"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="其他补充信息..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Spinner className="mr-2" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    保存
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                disabled={isSaving}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

