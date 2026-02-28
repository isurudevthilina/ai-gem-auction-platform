# AI-Powered Gem Auction Platform 💎

A fully featured, real-time Gem Auction platform tailored to the Sri Lankan cultural aesthetic, integrating minimal white design with dynamic 3D elements and advanced Artificial Intelligence. Built as an MVP for a 6-member university project team.

## Project Brief
This platform provides a comprehensive marketplace for gem trading. It features real-time bidding, direct buy options, user and seller profiles, gem certification verification, and a Machine Learning powered **Gem Price Predictor**. The goal is to create a performant, scalable, and visually interactive application within a 4-week development timeline.

**Key Tech Stack:**
- **Frontend**: React + Vite + Tailwind CSS + Zustand + React Query + Three.js (for 3D)
- **Backend**: Node.js + Express.js + Python (for Web Scraping & ML Model)
- **Database + Auth + Real-time**: Supabase (PostgreSQL)

---

## Modular Architecture & Team Breakdown
To facilitate parallel development for the 6 team members, the project is structured modularly. Both the frontend (`features/`) and backend (`modules/`) follow this domain-based division.

### 01. User Management System (IT24100316)
**Location:** `backend/src/modules/users` | `frontend/src/features/users`
- **C**reate: User registration (handled via Supabase Auth + profile trigger).
- **R**ead: Fetch user profile, fetch all users (Admin).
- **U**pdate: Update profile details, change user role (Admin).
- **D**elete: Deactivate/Delete user account.

### 02. Gem Listing Management & AI Predictor (IT24103156)
**Location:** `backend/src/modules/gems` | `frontend/src/features/gems`
- **AI Feature**: Predict Gem Price based on Weight, Cut, Clarity, etc., before listing (similar to Gemval.com). Includes **SHAP explainability** so buyers and sellers see exactly *why* a specific price was predicted (e.g., +$200 for VVS clarity). Available to both buyers and sellers.
- **C**reate: Add a new gem listing (choose between **Direct Sell** or **Auction**).
- **R**ead: Fetch listed gems, display AI predicted worth.
- **U**pdate: Edit listing type or gem attributes.
- **D**elete: Remove a listing.

### 03. Auction & Bidding System (IT24102032)
**Location:** `backend/src/modules/auctions` | `frontend/src/features/auctions`
- **C**reate: Start an auction for a gem, real-time bid placement.
- **R**ead: Live tracking of active auctions and bid histories.
- **U**pdate: Update auction status, process winning bids.
- **D**elete: Cancel an auction.

### 04. Favorites & Watchlist Folders (IT24102678)
**Location:** `backend/src/modules/watchlist` | `frontend/src/features/watchlist`
- **C**reate: Create custom Watchlist Folders (e.g., "Sapphires", "Gifts"), Add gems to specific folders.
- **R**ead: Fetch folders and contents.
- **U**pdate: Move a gem between watchlist folders, rename folders.
- **D**elete: Delete a custom folder, remove a gem from a folder.

### 05. Ratings & Review System (IT24104249)
**Location:** `backend/src/modules/reviews` | `frontend/src/features/reviews`
- **C**reate: Submit a review and rating for a seller post-transaction.
- **R**ead: Fetch reviews and calculate average rating.
- **U**pdate: Edit a previously submitted review.
- **D**elete: Remove a review.

### 06. Admin & Certification Management (IT24102701)
**Location:** `backend/src/modules/certificates` | `frontend/src/features/certificates`
- **C**reate: Upload a gem certification document.
- **R**ead: View gem certificate verification status.
- **U**pdate: Admin verifies or rejects a submitted certificate.
- **D**elete: Remove an invalid certificate.

---

## Machine Learning Price Predictor Details (SHAP Enabled)
The AI Price Prediction feature behaves similarly to *gemval.com*.
1. **Data Collection Phase:** Python script using `BeautifulSoup` to scrape `gemselect.com` for historical gem pricing data (Gem Type, Carat, Cut, Clarity, Color, Origin, Treatment, Price).
2. **Model Training:** Train a **Random Forest Regressor** or **XGBoost Regressor** on the scraped dataset.
3. **Explainability (SHAP):** Use SHAP to break down the "Why" behind every prediction. The API will return the specific dollar/percentage contributions of each feature.
4. **Integration:** A Python API (e.g. FastAPI/Flask) will be built as a microservice. Express.js sends gem details to the Python API, which returns the predicted price and SHAP values.
5. **User Flow:** 
   - **Sellers:** Input gem details, get AI prediction + SHAP breakdown, and use it to set Starting Prices for Auctions or Buy-Now prices for Direct Sells.
   - **Buyers:** See the AI Worth Evaluation badge on listings, and view the SHAP visual breakdown to understand fair market value before bidding.

---

## Database Schema (Supabase / PostgreSQL)

### Core Tables

| Table | Key Columns |
|---|---|
| `profiles` | `id` (FK → auth.users), `email`, `full_name`, `avatar_url`, `role` (admin/seller/buyer), `is_verified`, timestamps |
| `categories` | `id`, `name`, `slug`, `description`, `parent_id` (self-referencing for sub-categories) |
| `gems` | `id`, `seller_id`, `category_id`, `title`, `description`, `carat_weight`, `color`, `clarity`, `cut`, `origin`, `certification`, `images[]`, `listing_type` (auction/direct_sell), `status` (draft/listed/in_auction/sold), `buy_now_price`, `predicted_price` (from ML), timestamps |
| `auctions` | `id`, `gem_id` (unique), `seller_id`, `starting_price`, `reserve_price`, `current_price`, `min_bid_increment`, `start_time`, `end_time`, `status` (scheduled/active/completed/cancelled/reserve_not_met), `winner_id`, `bid_count`, timestamps |
| `bids` | `id`, `auction_id`, `bidder_id`, `amount`, `is_winning`, `created_at` (immutable) |
| `transactions` | `id`, `auction_id`, `gem_id`, `buyer_id`, `seller_id`, `amount`, `type` (auction_win/buy_now), `status` (pending/completed/disputed/refunded), `payment_reference`, timestamps |
| `notifications` | `id`, `user_id`, `type` (outbid/auction_won/auction_ending/etc.), `title`, `message`, `data` (JSONB), `is_read`, `created_at` |
| `watchlist_folders` | `id`, `user_id`, `name` (e.g. "Sapphires I want", "Gifts"), timestamps |
| `watchlist` | `id`, `user_id`, `auction_id`, `folder_id` (FK → watchlist_folders), UNIQUE(user_id, auction_id) |

### Critical DB Function — Atomic Bid Placement
Postgres function `place_bid(auction_id, bidder_id, amount)` runs atomically to:
1. Validate active auction and end\_time.
2. Check amount > current\_price + min\_increment.
3. Insert bid and update current\_price.
4. Prevents race conditions.

---

## Folder Structure (Codebase)

```text
server/
├── src/
│   ├── config/
│   │   ├── env.js                  # dotenv + env var validation
│   │   ├── supabase.js             # Server Supabase client (service_role key)
│   │   └── constants.js            # App-wide constants (roles, statuses, enums)
│   ├── modules/                    # Feature-based modules
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   ├── gems/
│   │   │   ├── gems.controller.js
│   │   │   ├── gems.service.js
│   │   │   ├── gems.repository.js
│   │   │   ├── gems.routes.js
│   │   │   └── gems.validation.js
│   │   ├── auctions/
│   │   │   ├── auctions.controller.js
│   │   │   ├── auctions.service.js
│   │   │   ├── auctions.repository.js
│   │   │   ├── auctions.routes.js
│   │   │   └── auctions.validation.js
│   │   ├── bids/
│   │   │   ├── bids.controller.js
│   │   │   ├── bids.service.js
│   │   │   ├── bids.repository.js
│   │   │   ├── bids.routes.js
│   │   │   └── bids.validation.js
│   │   ├── transactions/           # Same pattern
│   │   ├── notifications/
│   │   ├── users/
│   │   ├── categories/
│   │   └── watchlist/
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification via Supabase
│   │   ├── rbac.middleware.js       # Role guard: authorize('admin', 'seller')
│   │   ├── validate.middleware.js   # Zod schema validation runner
│   │   ├── errorHandler.js          # Global error handler
│   │   ├── rateLimiter.js           # express-rate-limit config
│   │   └── upload.middleware.js     # Multer for file uploads
│   ├── jobs/
│   │   ├── queue.js                 # BullMQ queue + worker setup
│   │   ├── auctionEnd.job.js        # Process ended auctions
│   │   └── notificationSend.job.js  # Send email notifications
│   ├── utils/
│   │   ├── apiResponse.js           # { success, data, meta } helper
│   │   ├── apiError.js              # Custom error class with statusCode
│   │   ├── catchAsync.js            # Async wrapper for controllers
│   │   ├── logger.js                # Pino logger
│   │   └── email.js                 # Resend/Nodemailer wrapper
│   ├── app.js                       # Express app setup
│   └── server.js                    # Entry point
├── .env
├── package.json
└── nodemon.json
```

```text
client/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx               # React Router v6 config
│   │   └── providers.jsx            # QueryClient + Auth + Zustand providers
│   ├── config/
│   │   ├── supabase.js              # Client Supabase (anon key)
│   │   └── constants.js
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/          # LoginForm, RegisterForm, RoleSelect
│   │   │   ├── hooks/               # useAuth, useSession
│   │   │   ├── pages/               # LoginPage, RegisterPage
│   │   │   ├── services/            # auth API calls
│   │   │   └── context/             # AuthContext + AuthProvider
│   │   ├── gems/
│   │   │   ├── components/          # GemCard, GemGrid, GemDetail, GemForm
│   │   │   ├── hooks/               # useGems, useGemById
│   │   │   ├── pages/               # GemListPage, GemDetailPage, CreateGemPage
│   │   │   └── services/            # API calls
│   │   ├── auctions/
│   │   │   ├── components/          # AuctionCard, BidPanel, Countdown, LiveBidFeed
│   │   │   ├── hooks/               # useAuction, useLiveBids, useCountdown
│   │   │   ├── pages/               # AuctionListPage, LiveAuctionPage
│   │   │   └── services/
│   │   ├── dashboard/
│   │   │   ├── seller/              # SellerDashboard, MyListings, MyAuctions
│   │   │   └── admin/               # AdminDashboard, UserManagement, Disputes
│   │   ├── notifications/
│   │   ├── transactions/
│   │   └── watchlist/
│   ├── shared/
│   │   ├── components/              # Button, Modal, Input, Layout, Navbar, Footer
│   │   ├── hooks/                   # useDebounce, useLocalStorage
│   │   ├── utils/                   # formatCurrency, formatDate, formatCarat
│   │   └── guards/                  # ProtectedRoute, RoleGuard
│   ├── api/
│   │   ├── client.js                # Axios instance with JWT interceptor
│   │   └── endpoints.js             # API URL constants
│   ├── stores/
│   │   └── uiStore.js               # Zustand: sidebar, modals, theme
│   └── styles/
│       └── index.css                # Tailwind entry
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

**Data Flow (Backend):**
`Route → Auth Middleware → RBAC Middleware → Validation Middleware → Controller → Service → Repository → Supabase`

---

## REST API Routes (Base: `/api/v1`)

| Resource | Routes |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| **Users** | `GET /users`, `GET /users/:id`, `PATCH /users/:id` |
| **Gems** | `GET /gems`, `GET /gems/:id`, `POST /gems`, `PATCH /gems/:id`, `DELETE /gems/:id` |
| **Auctions** | `GET /auctions`, `GET /auctions/:id`, `POST /auctions`, `PATCH /auctions/:id`, `DELETE /auctions/:id` |
| **Bids** | `GET /auctions/:id/bids`, `POST /auctions/:id/bids` |
| **Transactions/Buy Now**| `POST /gems/:id/buy-now`, `GET /transactions` |
| **Watchlist** | `GET /watchlist`, `POST /watchlist`, `DELETE /watchlist/:auctionId` |
| **Watchlist Folders** | `GET /watchlist/folders`, `POST /watchlist/folders`, `DELETE /watchlist/folders/:id` |
| **Reviews** | `GET /reviews`, `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id` |
| **Certificates** | `GET /certificates`, `POST /certificates`, `PATCH /certificates/:id`, `DELETE /certificates/:id` |

---

## Background Jobs (BullMQ + Redis)
- **node-cron**: Triggers every minute for `end_time <= now()` to complete auctions.
- **Queue Workers**: Handle dispatching outbid notification emails and "Auction Ending Soon" alerts via custom Redis queues.
