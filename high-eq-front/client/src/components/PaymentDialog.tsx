import { useEffect, useState } from "react";
import { paymentAPI, PaymentOrder } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  forgetPaymentAttempt,
  getInitialPaymentEmail,
  getPaymentButtonLabel,
  getPaymentDialogStage,
  openAlipayPayment,
  rememberPaymentAttempt,
  shouldShowPausePayment,
} from "./paymentDialogState";

export function PaymentDialog({ tier, open, onOpenChange }: { tier: "lite" | "pro"; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setEmail(getInitialPaymentEmail(sessionStorage, user?.email));
    setOrder(null);
    paymentAPI.getMyOrders()
      .then((result) => {
        const existingOrder = (result.data || []).find((item: PaymentOrder) => item.tier === tier && getPaymentDialogStage(item.status) === "payment");
        if (existingOrder) {
          setOrder(existingOrder);
          setEmail(existingOrder.email || getInitialPaymentEmail(sessionStorage, user?.email));
          rememberPaymentAttempt(sessionStorage, { tier, email: existingOrder.email || getInitialPaymentEmail(sessionStorage, user?.email) });
        }
      })
      .catch(() => {});
  }, [open, user?.email, tier]);

  const createOrder = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("请输入有效邮箱"); return; }
    setLoading(true);
    try {
      const response = await paymentAPI.createOrder({ tier, email });
      setOrder(response.data);
      rememberPaymentAttempt(sessionStorage, { tier, email });
    } catch (error: any) { toast.error(error.response?.data?.message || "创建订单失败"); }
    finally { setLoading(false); }
  };

  const submitOrder = async () => {
    if (!order) return;
    setLoading(true);
    try {
      await paymentAPI.submitOrder(order.id);
      setOrder({ ...order, status: "SUBMITTED" });
      rememberPaymentAttempt(sessionStorage, { tier, email: order.email || email });
      toast.success("已提交，到账核对后将发送兑换码");
    } catch (error: any) { toast.error(error.response?.data?.message || "提交失败"); }
    finally { setLoading(false); }
  };

  const rememberCurrentPaymentAttempt = () => {
    if (!order) return;
    rememberPaymentAttempt(sessionStorage, { tier, email: order.email || email });
  };

  const openMobilePayment = () => {
    if (!order) return;
    if (!order.paymentUrl) {
      toast.error("付款链接未生成，请重新打开支付弹窗后再试");
      return;
    }
    rememberCurrentPaymentAttempt();
    openAlipayPayment(window.location, order.paymentUrl);
  };

  const pausePayment = () => {
    forgetPaymentAttempt(sessionStorage);
    onOpenChange(false);
  };

  const copyUsername = async () => {
    if (!user?.username) {
      toast.error("未获取到用户名，请重新登录后再试");
      return;
    }

    try {
      await navigator.clipboard.writeText(user.username);
      toast.success("用户名已复制，可在支付宝备注中粘贴");
    } catch {
      toast.error("复制失败，请手动复制用户名");
    }
  };

  const amount = order ? (order.amountCents / 100).toFixed(2) : tier === "lite" ? "4.99" : "9.99";
  const stage = order ? getPaymentDialogStage(order.status) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{tier === "lite" ? "Lite 月度会员" : "Pro 月度会员"}</DialogTitle>
          <DialogDescription>付款确认后，兑换码将发送到填写的邮箱。</DialogDescription>
        </DialogHeader>

        {!order ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-email">接收兑换码的邮箱</Label>
              <Input id="payment-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Button className="w-full" onClick={createOrder} disabled={loading}>
              继续支付 ¥{amount}
            </Button>
          </div>
        ) : stage === "submitted" ? (
          <p className="py-5 text-center text-sm text-muted-foreground">已提交付款通知，人工核账后会发送兑换码。</p>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-lg font-semibold">支付 ¥{amount}</p>
            {order.status === "SUBMITTED" && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                这笔订单已提交核账通知。若刚才没有完成付款，可以继续打开支付宝付款；付款后等待人工核账即可。
              </p>
            )}
            <div className="rounded-md border bg-muted/40 p-3 space-y-2">
              <p className="text-sm text-muted-foreground">支付宝付款时，请在备注中填写你的用户名，方便核对开通。</p>
              <div className="flex items-center gap-2">
                <Input value={user?.username || ""} readOnly placeholder="未获取到用户名" aria-label="付款备注用户名" />
                <Button type="button" variant="outline" size="icon" onClick={copyUsername} disabled={!user?.username} aria-label="复制用户名">
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <Button className="w-full md:hidden" onClick={openMobilePayment} disabled={loading}>
              {getPaymentButtonLabel(order.status)}
            </Button>
            <img className="hidden md:block mx-auto size-56 object-contain" src={order.qrImageUrl} alt="支付宝付款码" />
            {shouldShowPausePayment(order.status) ? (
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={submitOrder} disabled={loading}>
                  我已完成支付
                </Button>
                <Button type="button" variant="ghost" className="w-full text-sm" onClick={pausePayment}>
                  暂不支付
                </Button>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                已通知核账，完成付款后无需重复提交；若刚才未支付成功，可重新支付。
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
