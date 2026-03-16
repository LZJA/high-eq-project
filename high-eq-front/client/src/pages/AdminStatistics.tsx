import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, TrendingUp } from "lucide-react";

interface OverviewData {
  todayNewGuests: number;
  todayNewUsers: number;
  totalGuests: number;
  totalUsers: number;
  freeUsers: number;
  liteUsers: number;
  proUsers: number;
}

interface StatisticsData {
  id: string;
  userId?: string;
  username?: string;
  clientIp?: string;
  userType: "GUEST" | "REGISTERED";
  subscriptionTier?: string;
  replyCount: number;
  profileReplyCount: number;
  upgradeClickCount?: number;
  liteUpgradeClickCount?: number;
  proUpgradeClickCount?: number;
  totalCount: number;
  createTime: string;
  updateTime: string;
}

export default function AdminStatistics() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [stats, setStats] = useState<StatisticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "GUEST" | "REGISTERED">("ALL");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      setLocation("/404");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const [overviewRes, statsRes] = await Promise.all([
          axios.get(`/api/statistics/overview`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/statistics/all`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { userType: filter, page, pageSize }
          })
        ]);

        setOverview(overviewRes.data.data);
        setStats(statsRes.data.data.data);
        setTotalCount(statsRes.data.data.total);
      } catch (error: any) {
        if (error.response?.status === 403) {
          setLocation("/404");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLocation, user, filter, page]);

  const filteredStats = stats || [];

  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedStats = filteredStats;

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center"><div className="text-lg">加载中...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent opacity-0 animate-fade-in-up">数据统计</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-0 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <Card className="p-6 bg-white/80 backdrop-blur border-purple-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">今日新增游客</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview?.todayNewGuests || 0}</p>
          </Card>
          <Card className="p-6 bg-white/80 backdrop-blur border-pink-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-pink-600" />
              </div>
              <span className="text-sm text-gray-600">今日新增注册用户</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview?.todayNewUsers || 0}</p>
          </Card>
          <Card className="p-6 bg-white/80 backdrop-blur border-orange-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600">总游客数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview?.totalGuests || 0}</p>
          </Card>
          <Card className="p-6 bg-white/80 backdrop-blur border-blue-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">总注册用户数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview?.totalUsers || 0}</p>
          </Card>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <h2 className="text-xl font-bold mb-4 text-gray-900">订阅统计</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">免费用户</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.freeUsers || 0}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Lite用户</p>
              <p className="text-2xl font-bold text-blue-600">{overview?.liteUsers || 0}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Pro用户</p>
              <p className="text-2xl font-bold text-purple-600">{overview?.proUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur opacity-0 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">用户列表</h2>
            <div className="flex gap-2">
              <Button variant={filter === "ALL" ? "default" : "outline"} size="sm" onClick={() => { setFilter("ALL"); setPage(1); }}>全部</Button>
              <Button variant={filter === "GUEST" ? "default" : "outline"} size="sm" onClick={() => { setFilter("GUEST"); setPage(1); }}>游客</Button>
              <Button variant={filter === "REGISTERED" ? "default" : "outline"} size="sm" onClick={() => { setFilter("REGISTERED"); setPage(1); }}>注册用户</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">用户名/IP</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">普通回复</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">档案回复</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Lite点击</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Pro点击</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">上次使用</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStats && paginatedStats.length > 0 ? (
                  paginatedStats.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.userType === "GUEST" ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-700"}`}>
                          {item.userType === "GUEST" ? "游客" : "注册用户"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {item.username || (item.clientIp === '0:0:0:0:0:0:0:1' ? 'localhost' : item.clientIp)}
                        {item.userType === "REGISTERED" && item.subscriptionTier && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            item.subscriptionTier === "PRO" ? "bg-purple-100 text-purple-700" :
                            item.subscriptionTier === "LITE" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {item.subscriptionTier === "PRO" ? "Pro" : item.subscriptionTier === "LITE" ? "Lite" : "普通"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.replyCount}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.profileReplyCount}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.liteUpgradeClickCount || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.proUpgradeClickCount || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{new Date(item.updateTime).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{new Date(item.createTime).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalCount > 0 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一页</Button>
              <span className="text-sm text-gray-600">第 {page} / {totalPages} 页 (共 {totalCount} 条)</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一页</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
