import { describe, expect, it } from "vitest";

import {
  forgetPaymentAttempt,
  getInitialPaymentEmail,
  getMobilePaymentHref,
  getPaymentButtonLabel,
  getPaymentDialogStage,
  getRecoverablePaymentTier,
  openAlipayPayment,
  rememberPaymentAttempt,
  shouldShowPausePayment,
  shouldSubmitBeforeOpeningAlipay,
} from "./paymentDialogState";

describe("payment dialog state", () => {
  it("keeps submitted manual orders payable so users can recover from an abandoned Alipay launch", () => {
    expect(getPaymentDialogStage("SUBMITTED")).toBe("payment");
  });

  it("does not submit a manual order before opening Alipay", () => {
    expect(shouldSubmitBeforeOpeningAlipay()).toBe(false);
  });

  it("remembers the payment attempt so a refreshed page can reopen the dialog", () => {
    const storage = new Map<string, string>();

    rememberPaymentAttempt(storage, { tier: "pro", email: "buyer@example.com" });

    expect(getRecoverablePaymentTier(storage)).toBe("pro");
    expect(getInitialPaymentEmail(storage, undefined)).toBe("buyer@example.com");
  });

  it("prefers the authenticated email when there is no remembered payment email", () => {
    const storage = new Map<string, string>();

    expect(getInitialPaymentEmail(storage, "account@example.com")).toBe("account@example.com");
  });

  it("prefers the remembered payment email over the account email", () => {
    const storage = new Map<string, string>();

    rememberPaymentAttempt(storage, { tier: "lite", email: "payment@example.com" });

    expect(getInitialPaymentEmail(storage, "account@example.com")).toBe("payment@example.com");
  });

  it("forgets the payment attempt so the homepage stops reopening the dialog", () => {
    const storage = new Map<string, string>();

    rememberPaymentAttempt(storage, { tier: "lite", email: "payment@example.com" });
    forgetPaymentAttempt(storage);

    expect(getRecoverablePaymentTier(storage)).toBeNull();
  });

  it("keeps Alipay payment links as external scheme hrefs", () => {
    const href = "alipays://platformapi/startapp?saId=10000007&qrcode=https%3A%2F%2Fexample.com";

    expect(getMobilePaymentHref(href)).toBe(href);
  });

  it("opens Alipay with the previous JavaScript location navigation", () => {
    const location = { href: "" };
    const href = "alipays://platformapi/startapp?saId=10000007&qrcode=https%3A%2F%2Fexample.com";

    openAlipayPayment(location, href);

    expect(location.href).toBe(href);
  });

  it("shows pause payment only before the user submits payment for review", () => {
    expect(shouldShowPausePayment("PENDING")).toBe(true);
    expect(shouldShowPausePayment("SUBMITTED")).toBe(false);
  });

  it("labels submitted orders as repayable when the original payment did not succeed", () => {
    expect(getPaymentButtonLabel("PENDING")).toBe("打开支付宝付款");
    expect(getPaymentButtonLabel("SUBMITTED")).toBe("重新支付");
  });
});
