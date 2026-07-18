# Manual Alipay Redemption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let logged-in users pay Lite or Pro through Alipay, submit a no-screenshot payment notice, and receive an administrator-approved one-time redemption code by email.

**Architecture:** Spring Boot owns plans, prices, order state, code creation, authorization, and email. React renders an API-provided Alipay link on phones and QR image on desktops. A manually verified order is the only source of an activation code; redeeming that code is the only membership-upgrade path.

**Tech Stack:** Spring Boot 3, MyBatis-Plus, MySQL migration SQL, Spring Mail, JUnit 5/Mockito, React, TypeScript, Vite, Radix/shadcn, Axios.

---

## File Structure

- Create backend entities, mappers, DTOs, controllers and services under `high-eq-backend/src/main/java/com/highiq/{entity,mapper,dto/payment,controller,service}`.
- Create migration `high-eq-backend/src/main/resources/db/migration/V11__create_manual_payment_tables.sql`.
- Modify backend `pom.xml`, `application.yml`, `application-prod.yml`, `application.yml.example`, and `QuotaController.java`.
- Create service/controller tests under `high-eq-backend/src/test/java/com/highiq`.
- Copy supplied QR assets to `high-eq-front/client/public/images/payment/alipay-{lite,pro}.jpg`.
- Create `PaymentDialog.tsx`, `Orders.tsx`, `AdminPaymentOrders.tsx`; modify `api.ts`, `Home.tsx`, `QuotaIndicator.tsx`, `AdminStatistics.tsx`, and `App.tsx`.

### Task 1: Add the database schema and configuration

**Files:**
- Create: `high-eq-backend/src/main/resources/db/migration/V11__create_manual_payment_tables.sql`
- Modify: `high-eq-backend/pom.xml`, `high-eq-backend/src/main/resources/application*.yml`
- Test: `high-eq-backend/src/test/java/com/highiq/ManualPaymentSchemaTest.java`

- [ ] **Step 1: Write the failing migration test**

Load migrations against the existing test MySQL profile and assert tables `manual_payment_order`, `activation_code`, and `activation_code_redemption` exist along with unique `order_no` and `code_hash` indexes.

- [ ] **Step 2: Run it and verify failure**

Run: `cd high-eq-backend && mvn -Dtest=ManualPaymentSchemaTest test`

Expected: FAIL because V11 does not exist.

- [ ] **Step 3: Create V11, activate Flyway, and add mail configuration**

Create tables with UUID primary keys and these order fields: `order_no`, `user_id`, `email`, `tier`, `amount_cents`, `status`, `submitted_time`, `issued_time`, `mailed_time`, `reviewer_id`, `internal_note`, `activation_code_id`, timestamps. Use statuses `PENDING`, `SUBMITTED`, `ISSUED`, `MAILED`, and `REJECTED`.

Add `org.flywaydb:flyway-mysql` and `spring-boot-starter-mail`. Configure Flyway with `baseline-on-migrate: true` and `baseline-version: 10`, so existing production databases with V3-V10 schema changes receive only V11 while a newly initialized database also records the baseline before V11. Add the following configuration shape:

```yaml
spring:
  mail:
    host: ${MAIL_HOST:}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USERNAME:}
    password: ${MAIL_PASSWORD:}
payment:
  alipay:
    lite-url: ${PAYMENT_ALIPAY_LITE_URL:}
    pro-url: ${PAYMENT_ALIPAY_PRO_URL:}
    lite-qr-url: ${PAYMENT_ALIPAY_LITE_QR_URL:/images/payment/alipay-lite.jpg}
    pro-qr-url: ${PAYMENT_ALIPAY_PRO_QR_URL:/images/payment/alipay-pro.jpg}
  mail-from: ${PAYMENT_MAIL_FROM:}
```

- [ ] **Step 4: Run test and commit**

Run: `cd high-eq-backend && mvn -Dtest=ManualPaymentSchemaTest test`
Expected: PASS.

```bash
git add high-eq-backend/pom.xml high-eq-backend/src/main/resources high-eq-backend/src/test
git commit -m "feat: add manual payment persistence"
```

### Task 2: Implement order, code, and email services

**Files:**
- Create: `entity/{ManualPaymentOrder,ActivationCode,ActivationCodeRedemption}.java`
- Create: `mapper/{ManualPaymentOrderMapper,ActivationCodeMapper,ActivationCodeRedemptionMapper}.java`
- Create: `config/PaymentProperties.java`
- Create: `service/{ManualPaymentService,ActivationCodeService,RedemptionMailService}.java`
- Test: `service/{ManualPaymentServiceTest,ActivationCodeServiceTest}.java`

- [ ] **Step 1: Write failing service tests**

Create Mockito tests for exactly these behaviours:

```java
@Test void submittedOrderCanBeIssuedOnceAndCreatesOneRecipientBoundCode() { }
@Test void normalUserCannotIssueAnotherUsersOrder() { }
@Test void secondIssueAttemptReturnsExistingCodeWithoutCreatingAnother() { }
@Test void mailFailureLeavesIssuedCodeAvailableForRetry() { }
@Test void redemptionRejectsCodeForADifferentUser() { }
@Test void redemptionConsumesCodeAndCallsQuotaUpgradeOnce() { }
```

- [ ] **Step 2: Run tests and verify failure**

Run: `cd high-eq-backend && mvn -Dtest=ManualPaymentServiceTest,ActivationCodeServiceTest test`

Expected: compilation failure because services do not exist.

- [ ] **Step 3: Implement minimal services**

Create public order numbers as `PM` plus 16 uppercase base-32 characters. Create display codes as `HEQ-LITE-XXXX-XXXX-XXXX` or `HEQ-PRO-XXXX-XXXX-XXXX`; normalize by removing spaces/hyphens and uppercasing, persist only a SHA-256 hex hash.

`issueCode(orderId, adminId)` locks the order, requires `SUBMITTED`, creates only one recipient-bound code, and marks the order `ISSUED`. `sendIssuedCode` sends after the state transaction, marks `MAILED` only on success, and leaves `ISSUED` retryable on failure. `redeem` locks the code, validates recipient/expiry, writes an audit row, consumes the code, then calls `quotaService.upgradeSubscription(userId, tier, durationMonths)`.

- [ ] **Step 4: Run tests and commit**

Run: `cd high-eq-backend && mvn -Dtest=ManualPaymentServiceTest,ActivationCodeServiceTest test`
Expected: PASS.

```bash
git add high-eq-backend/src/main/java high-eq-backend/src/test
git commit -m "feat: add payment order and redemption services"
```

### Task 3: Add APIs and remove the free upgrade endpoint

**Files:**
- Create: DTOs under `high-eq-backend/src/main/java/com/highiq/dto/payment`
- Create: `PaymentController.java`, `AdminPaymentController.java`, `RedemptionController.java`
- Modify: `QuotaController.java`
- Test: `PaymentControllerTest.java`

- [ ] **Step 1: Write failing HTTP tests**

Verify authenticated creation/submission/listing, owner-only order access, non-admin 403 for admin APIs, administrator issue idempotency, and that normal users cannot call `POST /quota/upgrade`.

- [ ] **Step 2: Run tests and verify failure**

Run: `cd high-eq-backend && mvn -Dtest=PaymentControllerTest test`
Expected: FAIL because routes do not exist and the free upgrade route remains.

- [ ] **Step 3: Implement API boundaries**

Expose:

```text
POST /payment/orders                    { tier, email }
POST /payment/orders/{id}/submit
GET  /payment/orders
POST /redemption/redeem                 { code }
GET  /admin/payment-orders?status=SUBMITTED&page=1&pageSize=20
POST /admin/payment-orders/{id}/issue
POST /admin/payment-orders/{id}/resend
POST /admin/payment-orders/{id}/reject  { internalNote }
```

Load the caller from the bearer token like `StatisticsController`; every admin endpoint must query the role server-side and require `ADMIN`. Delete the `POST /quota/upgrade` mapping and frontend wrapper.

- [ ] **Step 4: Run backend tests and commit**

Run: `cd high-eq-backend && mvn test`
Expected: PASS.

```bash
git add high-eq-backend/src/main/java high-eq-backend/src/test
git commit -m "feat: expose manual payment APIs"
```

### Task 4: Build the mobile-first payment and redemption UI

**Files:**
- Create: `high-eq-front/client/src/components/PaymentDialog.tsx`, `high-eq-front/client/src/pages/Orders.tsx`
- Modify: `api.ts`, `Home.tsx`, `QuotaIndicator.tsx`, `App.tsx`
- Create: QR assets under `high-eq-front/client/public/images/payment`

- [ ] **Step 1: Add typed API clients**

Add `paymentAPI.createOrder`, `paymentAPI.submitOrder`, `paymentAPI.getMyOrders`, and `redemptionAPI.redeem`. The returned order has `id`, `orderNo`, `tier`, `amountCents`, `email`, `status`, `paymentUrl`, `qrImageUrl`, and an issued code only for its owner.

- [ ] **Step 2: Create the dialog**

Default email from `useAuth().user?.email`, validate it, create the order before payment, and render the responsive controls:

```tsx
<a href={order.paymentUrl} className="md:hidden">
  <Button className="w-full">打开支付宝支付 ¥{(order.amountCents / 100).toFixed(2)}</Button>
</a>
<img className="hidden md:block mx-auto size-56" src={order.qrImageUrl} alt="支付宝付款码" />
```

On return, “我已完成支付” submits once and displays an awaiting-review state. Do not ask for screenshots, transaction IDs, or payer details.

- [ ] **Step 3: Wire entry points and orders**

Replace both `支付功能开发中` toasts in `Home.tsx` and `QuotaIndicator.tsx` with the dialog, redirect anonymous users to login, and add protected `/orders`. The orders page shows statuses, recipient-owned issued codes, and a redeem input that calls `useQuota().refresh()` after success.

- [ ] **Step 4: Copy QR images and verify front end**

```bash
cp /Users/lizijian/Downloads/IMG_2367.JPG high-eq-front/client/public/images/payment/alipay-lite.jpg
cp /Users/lizijian/Downloads/IMG_2368.JPG high-eq-front/client/public/images/payment/alipay-pro.jpg
cd high-eq-front && pnpm check && pnpm build
```

Expected: type check and build PASS.

- [ ] **Step 5: Commit**

```bash
git add high-eq-front/client
git commit -m "feat: add mobile Alipay purchase flow"
```

### Task 5: Add the admin queue and prepare deployment

**Files:**
- Create: `high-eq-front/client/src/components/AdminPaymentOrders.tsx`
- Modify: `high-eq-front/client/src/pages/AdminStatistics.tsx`, `application.yml.example`, deployment documentation

- [ ] **Step 1: Build the review queue**

Add “待核账订单” to `/admin`, defaulted to `SUBMITTED`. Display order number, plan, amount, email, submit time, and status. Provide “确认并发送兑换码”, retry for `ISSUED`, and reject commands. Refresh from the API after each command; do not optimistically alter payment status.

- [ ] **Step 2: Document server-only environment variables**

Document this shape only in the example file and deployment documentation:

```dotenv
PAYMENT_ALIPAY_LITE_URL=https://qr.alipay.com/fkx13678ugdq9rjgxvq8l11
PAYMENT_ALIPAY_PRO_URL=https://qr.alipay.com/fkx15144l2dpquafgpgyf39
PAYMENT_ALIPAY_LITE_QR_URL=/images/payment/alipay-lite.jpg
PAYMENT_ALIPAY_PRO_QR_URL=/images/payment/alipay-pro.jpg
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=sender@example.com
MAIL_PASSWORD=app-specific-password
PAYMENT_MAIL_FROM=sender@example.com
```

- [ ] **Step 3: Verify and deploy only with supplied SMTP credentials**

Run:

```bash
cd high-eq-backend && mvn test
cd ../high-eq-front && pnpm check && pnpm build
```

Expected: all commands exit 0.

Before production deploy, inspect `/opt/high-eq-project` status, preserve its existing changes, set the real SMTP app password only in server `.env.production`, restart through the existing deployment process, and verify the payment assets, authorization, and mobile Alipay link. Do not deploy placeholder SMTP credentials.

- [ ] **Step 4: Commit**

```bash
git add high-eq-front/client high-eq-backend/src/main/resources deployment
git commit -m "feat: add payment review administration"
```
