import { useEffect, useState } from "react";
import { paymentAPI, redemptionAPI } from "@/lib/api";
import { useQuota } from "@/contexts/QuotaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AppNav } from "@/components/AppNav";

type Order = { id: string; orderNo: string; tier: string; amountCents: number; status: string; createTime?: string };

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { refresh } = useQuota();
  useEffect(() => { paymentAPI.getMyOrders().then(result => setOrders(result.data || [])).catch(() => toast.error("加载订单失败")); }, []);
  const redeem = async () => { if (!code.trim()) return; setSubmitting(true); try { await redemptionAPI.redeem(code); await refresh(); setCode(""); toast.success("兑换成功，会员已开通"); } catch (error: any) { toast.error(error.response?.data?.message || "兑换失败"); } finally { setSubmitting(false); } };
  return <><AppNav activePage="orders" showLogout /><main className="mx-auto max-w-3xl space-y-8 p-6"><section className="space-y-3"><h1 className="text-2xl font-bold">兑换码开通</h1><div className="flex gap-2"><Input value={code} onChange={event => setCode(event.target.value)} placeholder="输入兑换码" /><Button onClick={redeem} disabled={submitting}>{submitting ? "兑换中" : "兑换"}</Button></div></section><section><h2 className="mb-3 text-xl font-semibold">我的订单</h2><div className="space-y-2">{orders.length ? orders.map(order => <div key={order.id} className="flex items-center justify-between border p-3"><div><p className="font-medium">{order.tier.toUpperCase()} ¥{(order.amountCents / 100).toFixed(2)}</p><p className="text-xs text-muted-foreground">{order.orderNo}</p></div><span className="text-sm">{order.status === "SUBMITTED" ? "等待核账" : order.status === "MAILED" ? "兑换码已发送" : order.status}</span></div>) : <p className="text-sm text-muted-foreground">暂无订单</p>}</div></section></main></>;
}
