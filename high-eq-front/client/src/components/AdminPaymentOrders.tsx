import { useEffect, useState } from "react";
import { adminPaymentAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Order = { id: string; orderNo: string; email: string; tier: string; amountCents: number; submittedTime?: string };

export function AdminPaymentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const load = async () => { try { const result = await adminPaymentAPI.list(); setOrders(result.data || []); } catch { toast.error("加载待核账订单失败"); } };
  useEffect(() => { load(); }, []);
  const issue = async (id: string) => { setLoadingId(id); try { await adminPaymentAPI.issue(id); toast.success("兑换码已发送"); await load(); } catch (error: any) { toast.error(error.response?.data?.message || "发码失败"); } finally { setLoadingId(null); } };
  return <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">待核账订单</h2><Button size="sm" variant="outline" onClick={load}>刷新</Button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="p-2 text-left">订单号</th><th className="p-2 text-left">套餐</th><th className="p-2 text-left">金额</th><th className="p-2 text-left">邮箱</th><th className="p-2 text-left">提交时间</th><th className="p-2" /></tr></thead><tbody>{orders.length ? orders.map(order => <tr key={order.id} className="border-b"><td className="p-2 font-mono">{order.orderNo}</td><td className="p-2">{order.tier.toUpperCase()}</td><td className="p-2">¥{(order.amountCents / 100).toFixed(2)}</td><td className="p-2">{order.email}</td><td className="p-2">{order.submittedTime ? new Date(order.submittedTime).toLocaleString() : "-"}</td><td className="p-2 text-right"><Button size="sm" onClick={() => issue(order.id)} disabled={loadingId === order.id}>{loadingId === order.id ? "发送中" : "确认并发码"}</Button></td></tr>) : <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">暂无待核账订单</td></tr>}</tbody></table></div></section>;
}
