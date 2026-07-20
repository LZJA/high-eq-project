import { useEffect, useState } from "react";
import { paymentAPI, PaymentOrder } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PaymentDialog({ tier, open, onOpenChange }: { tier: "lite" | "pro"; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) { setEmail(user?.email || ""); setOrder(null); } }, [open, user?.email, tier]);

  const createOrder = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("请输入有效邮箱"); return; }
    setLoading(true);
    try {
      const response = await paymentAPI.createOrder({ tier, email });
      setOrder(response.data);
    } catch (error: any) { toast.error(error.response?.data?.message || "创建订单失败"); }
    finally { setLoading(false); }
  };

  const submitOrder = async () => {
    if (!order) return;
    setLoading(true);
    try {
      await paymentAPI.submitOrder(order.id);
      setOrder({ ...order, status: "SUBMITTED" });
      toast.success("已提交，到账核对后将发送兑换码");
    } catch (error: any) { toast.error(error.response?.data?.message || "提交失败"); }
    finally { setLoading(false); }
  };

  const openMobilePayment = async () => {
    if (!order) return;
    setLoading(true);
    try {
      await paymentAPI.submitOrder(order.id);
      setOrder({ ...order, status: "SUBMITTED" });
      window.location.href = order.paymentUrl;
    } catch (error: any) { toast.error(error.response?.data?.message || "提交核账通知失败"); }
    finally { setLoading(false); }
  };

  const amount = order ? (order.amountCents / 100).toFixed(2) : tier === "lite" ? "4.99" : "9.99";
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-sm">
    <DialogHeader><DialogTitle>{tier === "lite" ? "Lite 月度会员" : "Pro 月度会员"}</DialogTitle><DialogDescription>付款确认后，兑换码将发送到填写的邮箱。</DialogDescription></DialogHeader>
    {!order ? <div className="space-y-4"><div className="space-y-2"><Label htmlFor="payment-email">接收兑换码的邮箱</Label><Input id="payment-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><Button className="w-full" onClick={createOrder} disabled={loading}>继续支付 ¥{amount}</Button></div> : order.status === "SUBMITTED" ? <p className="py-5 text-center text-sm text-muted-foreground">已提交付款通知，人工核账后会发送兑换码。</p> : <div className="space-y-4"><p className="text-center text-lg font-semibold">支付 ¥{amount}</p><Button className="w-full md:hidden" onClick={openMobilePayment} disabled={loading}>{loading ? "正在打开支付宝..." : "打开支付宝并提交核账"}</Button><img className="hidden md:block mx-auto size-56 object-contain" src={order.qrImageUrl} alt="支付宝付款码" /><Button variant="outline" className="w-full" onClick={submitOrder} disabled={loading}>我已完成支付</Button></div>}
  </DialogContent></Dialog>;
}
