export type PaymentDialogStage = "payment" | "submitted";
export type PaymentTier = "lite" | "pro";

type PaymentAttempt = {
  tier: PaymentTier;
  email: string;
};

const PAYMENT_ATTEMPT_KEY = "high-eq-payment-attempt";

type PaymentAttemptStorage = {
  get?: (key: string) => string | undefined;
  set?: (key: string, value: string) => unknown;
  delete?: (key: string) => unknown;
  getItem?: (key: string) => string | null;
  setItem?: (key: string, value: string) => unknown;
  removeItem?: (key: string) => unknown;
};

export function getPaymentDialogStage(status: string): PaymentDialogStage {
  return status === "PENDING" || status === "SUBMITTED" ? "payment" : "submitted";
}

export function shouldSubmitBeforeOpeningAlipay() {
  return false;
}

export function getMobilePaymentHref(paymentUrl: string) {
  return paymentUrl;
}

export function openAlipayPayment(location: Pick<Location, "href">, paymentUrl: string) {
  location.href = paymentUrl;
}

export function shouldShowPausePayment(status: string) {
  return status === "PENDING";
}

export function getPaymentButtonLabel(status: string) {
  return status === "SUBMITTED" ? "重新支付" : "打开支付宝付款";
}

export function rememberPaymentAttempt(storage: PaymentAttemptStorage, attempt: PaymentAttempt) {
  writeStorage(storage, PAYMENT_ATTEMPT_KEY, JSON.stringify(attempt));
}

export function forgetPaymentAttempt(storage: PaymentAttemptStorage) {
  if (storage.removeItem) {
    storage.removeItem(PAYMENT_ATTEMPT_KEY);
    return;
  }
  storage.delete?.(PAYMENT_ATTEMPT_KEY);
}

export function getRecoverablePaymentTier(storage: PaymentAttemptStorage): PaymentTier | null {
  return readPaymentAttempt(storage)?.tier || null;
}

export function getInitialPaymentEmail(storage: PaymentAttemptStorage, userEmail?: string) {
  return readPaymentAttempt(storage)?.email || userEmail || "";
}

function readPaymentAttempt(storage: PaymentAttemptStorage): PaymentAttempt | null {
  const rawValue = readStorage(storage, PAYMENT_ATTEMPT_KEY);
  if (!rawValue) return null;

  try {
    const value = JSON.parse(rawValue) as Partial<PaymentAttempt>;
    if ((value.tier === "lite" || value.tier === "pro") && typeof value.email === "string") {
      return { tier: value.tier, email: value.email };
    }
  } catch {
    return null;
  }

  return null;
}

function readStorage(storage: PaymentAttemptStorage, key: string) {
  if (storage.getItem) return storage.getItem(key);
  return storage.get?.(key) || null;
}

function writeStorage(storage: PaymentAttemptStorage, key: string, value: string) {
  if (storage.setItem) {
    storage.setItem(key, value);
    return;
  }
  storage.set?.(key, value);
}
