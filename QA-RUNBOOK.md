# GemBid LK — QA Runbook

> **When:** Tomorrow, at your desk.  
> **Time needed:** 1.5–2 hours for manual QA + 10 min Playwright setup.  
> **What you need:** All three services running (frontend `5173`, backend `5001`, ML `8000`).

---

## Pre-Flight Checklist

Before you start, confirm everything is running:

```bash
# Terminal 1 — Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
# Expected: 200

# Terminal 2 — Backend
curl -s http://localhost:5001/api/health | python3 -m json.tool
# Expected: { "status": "ok" } or similar success response

# Terminal 3 — ML
curl -s http://localhost:8000/health | python3 -m json.tool
# Expected: { "status": "ok", "model_loaded": true }
```

If any returns an error, start the missing service before continuing.

---

## Part 1 — Smoke Tests (15 minutes)

If any of these fail, stop and fix before continuing.

### 1.1 Landing Page Renders
- **URL:** `http://localhost:5173/`
- **Steps:**
  1. Open in browser.
  2. Wait 3 seconds for 3D sapphire to load.
  3. Scroll down slowly through all three sections.
- **Expected:** 3D gem visible, dot-grid background, "DISCOVER · FOREVER · BRILLIANCE" text, CTA buttons at bottom.
- **Pass/Fail:** [ ]

### 1.2 Register → Login → Logout
- **URL:** `http://localhost:5173/` → click "Sign In" or "Register"
- **Steps:**
  1. Register a new user with a **throwaway email** (e.g. `qa-test-<random>@mailinator.com`).
  2. Select role: **Buyer**.
  3. Check email for verification link (or skip if Supabase auto-confirms in dev).
  4. Login with the same credentials.
  5. Verify you're redirected to dashboard or home.
  6. Logout and confirm you're back at the landing page.
- **Expected:** Registration succeeds, login persists, logout clears session.
- **Pass/Fail:** [ ]

### 1.3 Create a Gem Listing
- **Steps:**
  1. Register/login as a **Seller** (or use the same account if role can be changed).
  2. Navigate to "Sell a Gem" or "My Listings" → "Add New".
  3. Fill minimum required fields:
     - Title: `QA Test Ruby`
     - Gem Family: `Ruby`
     - Carat Weight: `2.5`
     - Color: `Red`
     - Clarity: `VVS`
     - Shape: `Round`
     - Treatment: `Untreated`
     - Listing Type: `Auction`
  4. Submit.
- **Expected:** Listing created, success toast/notification, gem appears in browse page.
- **Pass/Fail:** [ ]

### 1.4 AI Price Predictor Works
- **URL:** Navigate to "AI Valuation" or similar from nav.
- **Steps:**
  1. Fill form:
     - Gem Family: `Sapphire`
     - Shape: `Oval`
     - Color: `Blue`
     - Clarity: `VVS (Eye Clean 1)`
     - Treatment: `Untreated`
     - Carat Weight: `3.0`
  2. Click "Predict Price".
- **Expected:** Predicted price in LKR appears within 2-3 seconds. SHAP breakdown chart or list visible showing feature contributions.
- **Pass/Fail:** [ ]

### 1.5 Place a Bid
- **Steps:**
  1. Go to "Live Auctions" or "Browse Gems".
  2. Find the gem you created in 1.3 (or any active auction).
  3. Click "Place Bid".
  4. Enter amount = `current price + min increment`.
  5. Submit.
- **Expected:** Bid accepted, bid history updates, you're shown as highest bidder.
- **Pass/Fail:** [ ]

### 1.6 Watchlist
- **Steps:**
  1. On any gem/auction card, click heart/star "Add to Watchlist".
  2. Go to "My Watchlist" page.
- **Expected:** Item appears in watchlist. Can be removed.
- **Pass/Fail:** [ ]

### 1.7 Service Health (Terminal)
```bash
curl -s http://localhost:5001/api/health
curl -s http://localhost:8000/health
```
- **Expected:** Both return `200 OK` with JSON status.
- **Pass/Fail:** [ ]

---

## Part 2 — Frontend Functional QA (45–60 minutes)

### 2.1 Landing Page — Visual & Interaction
- [ ] Page loads without console errors (open DevTools → Console).
- [ ] 3D sapphire model renders and rotates on mouse move.
- [ ] Scroll-linked animations work (Lenis smooth scroll active).
- [ ] Three liquid-glass feature cards visible with correct stats (94.7%, GIA/GRS, Real-Time).
- [ ] "Explore Auctions" CTA navigates to auctions page.
- [ ] "AI Valuation" CTA navigates to predictor page.
- [ ] Section dots on right edge scroll to correct sections on click.
- [ ] Responsive: check at 375px (mobile), 768px (tablet), 1440px (desktop) — no layout breaks.
- [ ] No 404s in Network tab for assets (especially `/models/blue_sapphire.glb`).

### 2.2 Authentication Flows
- [ ] **Register as Buyer:** Form validates email format, password strength. Success creates account.
- [ ] **Register as Seller:** Same as above, role stored correctly.
- [ ] **Login:** Valid credentials redirect to app. Invalid shows error message.
- [ ] **Session persistence:** Refresh page while logged in → still logged in.
- [ ] **Protected routes:** Visiting `/dashboard` or `/admin` while logged out redirects to login.
- [ ] **Role guards:** Buyer cannot access seller dashboard. Non-admin cannot access admin panel.
- [ ] **Logout:** Clears session, redirects home, protected routes now redirect to login.
- [ ] **Password change:** Available in profile/settings, validates old password.
- [ ] **Avatar upload:** Can upload image, preview updates, persists on refresh.

### 2.3 Gem Marketplace
- [ ] **Browse page:** Gems load, pagination works.
- [ ] **Filters:** Filter by gem family, color, clarity, shape, price range → results update.
- [ ] **Search:** Search by title/description → relevant results.
- [ ] **Sort:** Sort by price (low/high), date (newest), carat weight.
- [ ] **Gem detail page:** All fields display correctly. Image gallery works (prev/next or thumbnails).
- [ ] **3D model viewer:** If gem has a 3D model, viewer loads and is interactive.
- [ ] **Seller info:** Seller name, rating, and profile link visible.
- [ ] **Certificate badge:** Verified gems show certificate icon.

### 2.4 AI Price Predictor
- [ ] **Happy path:** All 8 gem families return valid predictions:
  - Amethyst, Citrine, Pyrope Garnet, Ruby, Sapphire, Spinel, Topaz, Tourmaline
- [ ] **SHAP chart:** Shows feature contributions (positive/negative) for each prediction.
- [ ] **Confidence interval:** Low and high bounds displayed alongside predicted price.
- [ ] **Invalid input handling:** Zero or negative carat weight shows validation error.
- [ ] **Extreme input:** Very high carat weight (e.g. 50ct) still returns prediction without crashing.
- [ ] **Network failure:** ML service down shows graceful error (not infinite spinner).
- [ ] **Response time:** Prediction returns within 3 seconds on local machine.

### 2.5 Auction & Bidding System
- [ ] **Create auction:** Seller can create auction from gem listing. Set start price, reserve price, duration.
- [ ] **Countdown timer:** Timer visible and decrements correctly.
- [ ] **Bid placement:** Buyer can place bid above current price + minimum increment.
- [ ] **Bid validation:** Bid below minimum shows error. Bid on own auction rejected.
- [ ] **Bid history:** All bids listed chronologically with bidder names and amounts.
- [ ] **Winning bid highlight:** Highest bid visually distinguished.
- [ ] **Auto-complete:** Auction expires → status changes to "completed", winner notified.
- [ ] **Buy Now:** Direct purchase option works if set, bypasses auction.
- [ ] **Edit auction:** Seller can edit before first bid. Cannot edit after bids placed.
- [ ] **Cancel auction:** Seller can cancel before first bid.

### 2.6 Watchlist & Folders
- [ ] **Add to watchlist:** Heart icon toggles on gem/auction cards.
- [ ] **Create folder:** "Create Folder" button works, name saved.
- [ ] **Move item:** Can move watchlist item into a folder.
- [ ] **Folder rename:** Edit folder name, persists.
- [ ] **Folder delete:** Delete folder, items return to default or are removed based on design.
- [ ] **Remove item:** Click heart again to remove from watchlist.

### 2.7 Wallet & Transactions
- [ ] **Wallet page:** Balance displays correctly.
- [ ] **Top-up UI:** Form accepts amount, shows payment method selection.
- [ ] **Gem purchase:** Buy-now flow deducts balance or shows payment modal.
- [ ] **Transaction history:** Lists all transactions with status (pending/completed/refunded).
- [ ] **Withdrawal form:** Available for sellers, validates amount ≤ balance.

### 2.8 Reviews & Ratings
- [ ] **Submit review:** After transaction completes, buyer can rate 1-5 stars and write comment.
- [ ] **Review validation:** Empty comment or no rating blocked.
- [ ] **Toxicity check:** Toxic/review flagged or blocked (uses TensorFlow.js model).
- [ ] **Edit review:** Buyer can edit their own review within time limit.
- [ ] **Delete review:** Buyer can delete their review.
- [ ] **Report review:** Report button works, admin sees report.
- [ ] **Average rating:** Seller profile shows correct average from all reviews.

### 2.9 Admin Dashboard
- [ ] **Admin login:** Admin role required to access `/admin`.
- [ ] **Stats cards:** Dashboard shows user count, auction count, revenue, pending certificates.
- [ ] **User management:** Search users, view profiles, change roles, deactivate accounts.
- [ ] **Certificate verification:** Pending certificates list, verify/reject with notes.
- [ ] **Review reports:** Reported reviews listed, can dismiss or remove.

---

## Part 3 — Backend API Validation (20–30 minutes)

Run these in your terminal. Replace `<token>` with a valid JWT from your logged-in session (get it from DevTools → Application → Local Storage → supabase.auth.token, or from the Authorization header in Network tab).

### 3.1 Health Checks
```bash
curl -s http://localhost:5001/api/health | python3 -m json.tool
curl -s http://localhost:8000/health | python3 -m json.tool
```
- [ ] Both return `200` with status JSON.

### 3.2 Auth Flow
```bash
# Register
curl -s -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-tester-1@example.com","password":"TestPass123!","full_name":"QA Tester","role":"buyer"}' \
  | python3 -m json.tool

# Login
curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-tester-1@example.com","password":"TestPass123!"}' \
  | python3 -m json.tool

# Get Me (requires Bearer token from login response)
curl -s http://localhost:5001/api/v1/auth/me \
  -H "Authorization: Bearer <token>" \
  | python3 -m json.tool
```
- [ ] Register returns success.
- [ ] Login returns access token.
- [ ] `/me` returns user profile matching the registered email.

### 3.3 Gem CRUD
```bash
# List gems (public)
curl -s http://localhost:5001/api/gems | python3 -m json.tool

# Get categories
curl -s http://localhost:5001/api/gems/categories | python3 -m json.tool

# Search gems
curl -s "http://localhost:5001/api/gems/search?q=ruby" | python3 -m json.tool

# Create gem (requires seller token)
curl -s -X POST http://localhost:5001/api/gems \
  -H "Authorization: Bearer <seller_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Sapphire",
    "category_id": "<category_uuid>",
    "carat_weight": 2.0,
    "color": "Blue",
    "clarity": "VVS",
    "shape": "Oval",
    "treatment": "Untreated",
    "listing_type": "auction"
  }' | python3 -m json.tool
```
- [ ] List returns array of gems.
- [ ] Categories return array.
- [ ] Search returns filtered results.
- [ ] Create returns the created gem object.

### 3.4 Auction & Bid
```bash
# List auctions
curl -s http://localhost:5001/api/auctions | python3 -m json.tool

# Get my auctions (seller)
curl -s http://localhost:5001/api/auctions/my \
  -H "Authorization: Bearer <seller_token>" \
  | python3 -m json.tool

# Place bid (buyer token)
curl -s -X POST "http://localhost:5001/api/auctions/<auction_id>/bids" \
  -H "Authorization: Bearer <buyer_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 15000}' | python3 -m json.tool

# Get bids for auction
curl -s "http://localhost:5001/api/auctions/<auction_id>/bids" | python3 -m json.tool
```
- [ ] Auction list returns active auctions.
- [ ] Bid placement succeeds with valid amount.
- [ ] Bid history includes the new bid.

### 3.5 ML Proxy
```bash
curl -s -X POST http://localhost:5001/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{
    "gemFamily": "ruby",
    "shape": "Round",
    "color": "Red",
    "clarity": "VVS (Eye Clean 1)",
    "treatment": "Untreated",
    "caratWeight": 1.5
  }' | python3 -m json.tool
```
- [ ] Returns `success: true` with predicted price, confidence range, and SHAP values.

### 3.6 Error Handling
```bash
# 401 — No token
curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/auctions/my
# Expected: 401

# 404 — Invalid route
curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/nonexistent
# Expected: 404

# 400 — Invalid bid (below minimum)
curl -s -X POST "http://localhost:5001/api/auctions/<auction_id>/bids" \
  -H "Authorization: Bearer <buyer_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1}' | python3 -m json.tool
# Expected: 400 error
```
- [ ] All error responses return correct status codes and JSON error messages.

---

## Part 4 — ML Service Direct Validation (10 minutes)

These hit the Python FastAPI service directly (port 8000), bypassing the Node backend.

### 4.1 Health
```bash
curl -s http://localhost:8000/health | python3 -m json.tool
```
- [ ] `model_loaded: true`

### 4.2 Predictions Per Gem Family
Run one for each family to verify model handles all categories:
```bash
for family in amethyst citrine "pyrope garnet" ruby sapphire spinel topaz tourmaline; do
  echo "=== $family ==="
  curl -s -X POST http://localhost:8000/predict \
    -H "Content-Type: application/json" \
    -d "{\"gemFamily\":\"$family\",\"shape\":\"Round\",\"color\":\"Red\",\"clarity\":\"VVS\",\"treatment\":\"Untreated\",\"caratWeight\":2.0}" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);print(f'Price: {d[\"predictedPrice\"]:,.0f} LKR | SHAP items: {len(d[\"shapValues\"])}')"
done
```
- [ ] All 8 families return valid prices.
- [ ] All responses include `shapValues` array.

### 4.3 Edge Cases
```bash
# Zero carat (should handle gracefully)
curl -s -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"gemFamily":"ruby","shape":"Round","color":"Red","clarity":"VVS","treatment":"Untreated","caratWeight":0}' \
  | python3 -m json.tool

# Very large carat
curl -s -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"gemFamily":"sapphire","shape":"Oval","color":"Blue","clarity":"VVS","treatment":"Untreated","caratWeight":50}' \
  | python3 -m json.tool

# Invalid gem family (should error gracefully)
curl -s -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"gemFamily":"diamond","shape":"Round","color":"Clear","clarity":"VVS","treatment":"Untreated","caratWeight":1}' \
  | python3 -m json.tool
```
- [ ] Zero carat: returns prediction or validation error (not a crash).
- [ ] 50ct: returns prediction.
- [ ] Invalid family: returns `422` or descriptive error.

---

## Part 5 — Bug Log

Copy this table into a new file `BUG-LOG.md` tomorrow. Fill it as you test.

| # | Module | Severity | Steps to Reproduce | Expected | Actual | Screenshot |
|---|--------|----------|-------------------|----------|--------|------------|
| 1 | | 🔴 High / 🟡 Med / 🟢 Low | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

**Severity:**
- 🔴 **High** — Crash, data loss, security issue, payment broken, auth bypass.
- 🟡 **Med** — Feature partially broken, confusing UX, incorrect data display.
- 🟢 **Low** — Visual glitch, typo, minor layout issue.

---

## Part 6 — Playwright Setup Guide (Do this AFTER manual QA)

Once manual QA is done and bugs are logged, set up automated tests so you never have to click through all this manually again.

### Step 1 — Install Playwright
```bash
cd frontend
npm init playwright@latest
# Select: TypeScript, tests inside e2e/, install browsers, install OS deps
```

### Step 2 — Configure `playwright.config.ts`
Replace the generated `playwright.config.ts` with:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 3 — Create Test Files

#### `e2e/landing.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('landing page loads with 3D scene', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=DISCOVER')).toBeVisible();
  await expect(page.locator('text=FOREVER')).toBeVisible();
  await expect(page.locator('text=BRILLIANCE')).toBeVisible();
  // 3D canvas should exist
  await expect(page.locator('canvas')).toBeVisible();
});

test('navigation links work', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Live Auctions');
  await expect(page).toHaveURL(/.*auctions.*/);
});
```

#### `e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

const TEST_EMAIL = `playwright-test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123!';

test('user can register and login', async ({ page }) => {
  await page.goto('/register');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.fill('input[name="full_name"]', 'Playwright Tester');
  await page.selectOption('select[name="role"]', 'buyer');
  await page.click('button[type="submit"]');
  
  // Should redirect or show success
  await expect(page.locator('text=Welcome')).toBeVisible();
  
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Should be authenticated
  await expect(page.locator('text=Logout')).toBeVisible();
});

test('protected routes redirect when logged out', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/.*login.*/);
});
```

#### `e2e/predictor.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('AI predictor returns price and SHAP values', async ({ page }) => {
  await page.goto('/ai-valuation'); // or whatever your route is
  
  await page.selectOption('select[name="gemFamily"]', 'ruby');
  await page.selectOption('select[name="shape"]', 'Round');
  await page.selectOption('select[name="color"]', 'Red');
  await page.selectOption('select[name="clarity"]', 'VVS (Eye Clean 1)');
  await page.selectOption('select[name="treatment"]', 'Untreated');
  await page.fill('input[name="caratWeight"]', '2.5');
  
  await page.click('button:has-text("Predict")');
  
  // Wait for result
  await expect(page.locator('text=LKR')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=SHAP')).toBeVisible();
});
```

#### `e2e/auction.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('auction listing and bidding flow', async ({ page }) => {
  // Note: This test requires a logged-in seller and buyer.
  // In a real suite, use setup projects for auth state.
  
  await page.goto('/auctions');
  await expect(page.locator('text=Live Auctions')).toBeVisible();
  
  // Click first auction
  await page.locator('[data-testid="auction-card"]').first().click();
  
  // Verify auction detail loads
  await expect(page.locator('text=Current Price')).toBeVisible();
  await expect(page.locator('text=Bid History')).toBeVisible();
});
```

#### `e2e/api-health.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('backend and ML health endpoints respond', async ({ request }) => {
  const backend = await request.get('http://localhost:5001/api/health');
  expect(backend.ok()).toBeTruthy();
  
  const ml = await request.get('http://localhost:8000/health');
  expect(ml.ok()).toBeTruthy();
  const mlBody = await ml.json();
  expect(mlBody.model_loaded).toBe(true);
});
```

### Step 4 — Run Tests
```bash
# Interactive UI mode (great for debugging)
npx playwright test --ui

# Headless run (CI mode)
npx playwright test

# Run specific test file
npx playwright test e2e/landing.spec.ts

# Show report
npx playwright show-report
```

### Step 5 — Add to GitHub Actions (Optional)
Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
        working-directory: frontend
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        working-directory: frontend
      - name: Run Playwright tests
        run: npx playwright test
        working-directory: frontend
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30
```

---

## Appendix — Supported ML Input Values

Use these exact strings when testing the AI predictor:

| Field | Valid Values |
|-------|-------------|
| **Gem Family** | `amethyst`, `citrine`, `pyrope garnet`, `ruby`, `sapphire`, `spinel`, `topaz`, `tourmaline` |
| **Shape** | `Cushion`, `Fancy`, `Heart`, `Marquise`, `Octagon`, `Other`, `Oval`, `Pear`, `Round`, `Trillion` |
| **Clarity** | `I1`, `SI1`, `SI2`, `VS`, `VVS` |
| **Treatment** | `Be Heated`, `Fracture Filled`, `Heated`, `Irradiated`, `Untreated` |
| **Carat Weight** | Any positive decimal (e.g. `0.5`, `1.5`, `10.0`) |

Colors include: Black, Blood Red, Blue, Brown, Gold, Green, Iris, Lavender, Magenta, Multicolor, Orange, Orange-Gold, Pink, Pinkish Red, Purple, Red, Rose, Violet, White, Wine, Wine Red, Yellow.
