<div align="center">

```
  ██████╗ ███████╗███╗   ███╗██████╗ ██╗██████╗     ██╗     ██╗  ██╗
 ██╔════╝ ██╔════╝████╗ ████║██╔══██╗██║██╔══██╗    ██║     ██║ ██╔╝
 ██║  ███╗█████╗  ██╔████╔██║██████╔╝██║██║  ██║    ██║     █████╔╝
 ██║   ██║██╔══╝  ██║╚██╔╝██║██╔══██╗██║██║  ██║    ██║     ██╔═██╗
 ╚██████╔╝███████╗██║ ╚═╝ ██║██████╔╝██║██████╔╝    ███████╗██║  ██╗
  ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═════╝ ╚═╝╚═════╝     ╚══════╝╚═╝  ╚═╝
```

# GemBid LK — AI-Powered Gem Auction Platform

**DISCOVER · FOREVER · BRILLIANCE**

*A real-time gem auction marketplace tailored to the Sri Lankan gem trade,*
*fusing AI-powered valuations, GIA-certified transparency, and immersive 3D design.*

---

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.183-black?style=flat-square&logo=three.js)](https://threejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)

</div>

---

## Overview

**GemBid LK** is a fully featured, real-time gem auction platform built for the Sri Lankan gem market. It combines a luxury editorial design language with cutting-edge technology — an animated 3D sapphire, scroll-driven cinematic sections, AI price prediction with SHAP explainability, and WebSocket-powered live bidding.

Built as a university MVP by a 6-member team within a 4-week sprint.

## Project Brief

This platform provides a comprehensive marketplace for gem trading. It features real-time bidding, direct buy options, user and seller profiles, gem certification verification, and a Machine Learning powered **Gem Price Predictor**. The goal is to create a performant, scalable, and visually interactive application within a 4-week development timeline.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 7 |
| **3D & Animation** | Three.js · React Three Fiber · React Three Drei · Framer Motion · Lenis (smooth scroll) |
| **Post-Processing** | `@react-three/postprocessing` — Bloom, Chromatic Aberration |
| **State & Data** | Zustand · TanStack React Query |
| **Styling** | Tailwind CSS 4 · inline React styles (glass morphism system) |
| **Routing** | React Router DOM 7 |
| **Backend** | Node.js · Express 5 |
| **Database / Auth / Realtime** | Supabase (PostgreSQL + Row Level Security + Realtime channels) |
| **AI / ML** | Python · Random Forest / XGBoost · SHAP · FastAPI microservice |
| **Background Jobs** | BullMQ + Redis · node-cron |

---

## Landing Page — Design System

The landing page (`ScrollLandingPage.jsx`) is built as a **cinematic scroll experience** — three full-viewport sections driven by scroll progress, with a single animated 3D sapphire gem that moves, rotates, and scales across them.

### Visual Identity

| Token | Value | Use |
|---|---|---|
| **bg-parchment** | `#F0EDE8` | Page background — warm off-white |
| **accent-sapphire** | `#1A4D8C` | Primary brand color — deep sapphire blue |
| **accent-gold** | `var(--accent-gold)` | Section dots, nav active state |
| **font-display** | `'Cormorant Garamond', serif` | All body, headings, stats, cards |
| **font-brand** | `'Cinzel', serif` | Logo wordmark, runway ghost text |

### Layer Stack (z-index)

```
z-index 0   — Solid parchment background (#F0EDE8)
z-index 1   — Dot-grid overlay (2.5 px sapphire dots, 40 px grid, blurred)
z-index 2   — Film-grain noise texture (subtle, full-viewport)
z-index 3   — Vignette gradient (dark edges, darker at bottom)
z-index 5   — Three.js Canvas (3D sapphire gem)
z-index 10+ — Scroll overlay sections (text, glass cards)
z-index 200 — Fixed minimal navbar
z-index 100 — Section nav dots (right edge)
```

### Dot-Grid Background

A CSS `radial-gradient` pattern creates a subtle sapphire dot field behind all content:
- **Dot color**: `rgba(26,77,140,0.35)` — 35% opacity sapphire
- **Dot radius**: 2.5 px
- **Grid size**: 40 × 40 px
- **Filter**: `blur(3px)` — soft, non-distracting
- **Opacity**: 35%

### Grain Texture

A full-viewport SVG `feTurbulence` noise filter at `zIndex: 2` sits between the background layers and all UI content, giving the page a premium matte finish reminiscent of stone or fine paper.

### Runway Ghost Text

Behind each section's main UI panel, two massive ghost words span the upper portion of the viewport:
- **Section 1**: DISCOVER · FOREVER
- **Section 2**: RARE · BRILLIANCE
- **Font**: `'Cinzel', serif`, 700 weight, `blur(6px)`, `rgba(30,41,80,0.38)` opacity
- **Position**: Centered at `top: 18%`, full width, `text-align: center`

### 3D Blue Sapphire

A GLTF model (`/public/models/blue_sapphire.glb`) rendered via React Three Fiber. It travels through three keyframe positions as the user scrolls:

| Section | Position | Rotation | Scale |
|---|---|---|---|
| Hero (S1) | Left-center `[-1.2, 0.1, 0.3]` | `[0.35, 0.6, -0.15]` | 1.8× |
| Features (S2) | Right `[1.6, 0.3, 0.5]` | `[0.3, π×0.6, 0.2]` | 2.0× |
| CTA (S3) | Centered-bottom `[0, -0.5, 0.5]` | `[-0.2, π×1.2, 0]` | 2.2× |

- **Material**: `MeshTransmissionMaterial` (physically-based glass/crystal)
- **Gem color**: `#629BFA` blue sapphire
- **Tone mapping**: `LinearToneMapping` (preserves natural gem brilliance)
- **Post-processing**: Bloom (threshold 0.75, strength 0.4) + Chromatic Aberration (0.0008)
- **Mouse parallax**: Continuous idle rotation + cursor-driven micro tilt

### Liquid Glass Cards (Feature Strip)

Three feature cards rendered in Section 1 using a unified sapphire glass-morphism style:

| Card | Headline | Description |
|---|---|---|
| AI Accuracy | 94.7% | SHAP-explainable pricing with transparent valuations |
| Certified | GIA / GRS | GIA, GRS & IGI verified for every stone listed |
| Live Bidding | Real-Time | WebSocket-powered live auction feed |

Card styling:
- **Background**: `linear-gradient(145deg, rgba(26,77,140,0.14), rgba(26,77,140,0.06), rgba(212,175,55,0.05))`
- **Backdrop filter**: `blur(40px) saturate(2)`
- **Border**: `1px solid rgba(26,77,140,0.25)`
- **Box shadow**: multi-layer with sapphire glow + inner highlight + gold ring
- **Hover**: `translateY(-4px)` lift + intensified shadow
- **Bottom accent bar**: sapphire gradient line

### Scroll Sections

The page uses `Lenis` for buttery smooth scrolling and `framer-motion`'s `useScroll` / `useTransform` for scroll-linked animations.

**Section 1 — Hero**
- Gem positioned left-center
- Hero heading: serif italic tagline + large display title
- CTA buttons: "Explore Auctions" + "AI Valuation"
- Three liquid glass feature cards below

**Section 2 — Gem Showcase**
- Gem moves to the right
- Central glass panel: large gem statistics, grade details
- Heritage ornament (Liyawela SVG motif) for editorial depth

**Section 3 — Live Auction CTA**
- Gem centered and enlarged at the base
- Final CTA: "Explore Live Auctions" gradient button

### Navigation

- **Fixed minimal navbar** — frosted glass `rgba(240,237,232,0.75)` + `backdrop-filter: blur(20px)`
- **Brand name**: `GemBid LK` — Cinzel, 700 weight, uppercase, tracked
- **Nav links**: Live Auctions · The Vault · AI Valuation · Sign In
- **Section dots**: Right-edge vertical dot strip — 3 dots, gold active state, smooth scroll on click

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
| `gems` | `id`, `seller_id`, `category_id`, `title`, `description`, `carat_weight`, `color`, `clarity`, `cut`, `origin`, `treatment`, `certification`, `images[]`, `listing_type` (auction/direct_sell), `status` (draft/listed/in_auction/sold), `buy_now_price`, `predicted_price` (from ML), timestamps |
| `auctions` | `id`, `gem_id` (unique), `seller_id`, `starting_price`, `reserve_price`, `current_price`, `min_bid_increment`, `start_time`, `end_time`, `status` (scheduled/active/completed/cancelled/reserve_not_met), `winner_id`, `bid_count`, timestamps |
| `bids` | `id`, `auction_id`, `bidder_id`, `amount`, `is_winning`, `created_at` (immutable) |
| `transactions` | `id`, `auction_id`, `gem_id`, `buyer_id`, `seller_id`, `amount`, `type` (auction_win/buy_now), `status` (pending/completed/disputed/refunded), `payment_reference`, timestamps |
| `notifications` | `id`, `user_id`, `type` (outbid/auction_won/auction_ending/etc.), `title`, `message`, `data` (JSONB), `is_read`, `created_at` |
| `watchlist_folders` | `id`, `user_id`, `name` (e.g. "Sapphires I want", "Gifts"), timestamps |
| `watchlist` | `id`, `user_id`, `auction_id`, `folder_id` (FK → watchlist_folders), UNIQUE(user_id, auction_id) |
| `certificates` | `id`, `gem_id` (FK → gems), `seller_id` (FK → profiles), `certificate_number`, `issued_by` (GIA/AGS/IGI/GRS/GIT/GGTL/Other), `issued_date`, `document_url`, `status` (pending/verified/rejected), `verified_by` (FK → profiles, admin), `verified_at`, `notes` (admin rejection reason), timestamps |
| `reviews` | `id`, `reviewer_id` (FK → profiles, buyer), `seller_id` (FK → profiles), `transaction_id` (FK → transactions, ensures post-purchase only), `rating` (1–5 integer), `comment`, UNIQUE(reviewer_id, transaction_id), timestamps |

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

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A [Supabase](https://supabase.com) project (free tier works)
- Redis (for background job queues — optional for basic dev)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/ai-gem-auction-platform.git
cd ai-gem-auction-platform
```

### 2. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Start the dev server:

```bash
npm run dev
# → http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

### 3. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
```

Start the dev server:

```bash
npm run dev    # nodemon watch mode
npm start      # production
```

### 4. Database migration

Run the combined SQL migration against your Supabase project:

```bash
# Via Supabase dashboard SQL editor, or:
psql "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres" \
  -f backend/src/config/migrations/combined_migration.sql
```

### 5. 3D Model

Place the sapphire GLTF model at:

```
frontend/public/models/blue_sapphire.glb
```

The landing page `ScrollLandingPage.jsx` references this path via `useGLTF('/models/blue_sapphire.glb')`.

---

## Project Structure

```
ai-gem-auction-platform/
├── frontend/                          # React + Vite SPA
│   ├── public/
│   │   └── models/
│   │       └── blue_sapphire.glb      # 3D gem model
│   └── src/
│       ├── config/
│       │   └── supabase.js            # Supabase client (anon key)
│       ├── context/
│       │   └── ThemeContext.jsx
│       ├── features/                  # Domain-driven modules
│       │   ├── auctions/              # AuctionCard, BidPanel, Countdown, LiveBidFeed
│       │   ├── gems/                  # GemDetails, AI Predictor, SHAP chart
│       │   ├── users/                 # Login, Signup, Dashboards, Profile
│       │   ├── certificates/
│       │   ├── reviews/
│       │   └── watchlist/
│       └── shared/
│           └── components/
│               ├── ScrollLandingPage.jsx  # ← Cinematic landing page
│               ├── Navbar.jsx
│               ├── Footer.jsx
│               ├── GemCard.jsx
│               └── ...
│
└── backend/                           # Node.js + Express API
    └── src/
        ├── config/
        │   ├── supabase.js            # Supabase admin client
        │   └── migrations/
        │       └── combined_migration.sql
        ├── middleware/
        │   └── auth.middleware.js
        └── modules/                   # Domain-driven route modules
            ├── auctions/
            ├── bids/
            ├── gems/
            ├── users/
            ├── certificates/
            ├── reviews/
            └── watchlist/
```

---

## REST API Routes (Base: `/api/v1`)

| Resource | Routes |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| **Users** | `GET /users`, `GET /users/:id`, `PATCH /users/:id` |
| **Gems** | `GET /gems`, `GET /gems/:id`, `POST /gems`, `PATCH /gems/:id`, `DELETE /gems/:id` |
| **Auctions** | `GET /auctions`, `GET /auctions/:id`, `POST /auctions`, `PATCH /auctions/:id`, `DELETE /auctions/:id` |
| **Bids** | `GET /auctions/:id/bids`, `POST /auctions/:id/bids` |
| **Buy Now** | `POST /gems/:id/buy-now`, `GET /transactions` |
| **Watchlist** | `GET /watchlist`, `POST /watchlist`, `DELETE /watchlist/:auctionId` |
| **Watchlist Folders** | `GET /watchlist/folders`, `POST /watchlist/folders`, `DELETE /watchlist/folders/:id` |
| **Reviews** | `GET /reviews`, `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id` |
| **Certificates** | `GET /certificates`, `POST /certificates`, `PATCH /certificates/:id`, `DELETE /certificates/:id` |

Data flow: `Route → Auth Middleware → RBAC Middleware → Validation → Controller → Service → Supabase`

---

## Team

| Member ID | Module |
|---|---|
| IT24100316 | User Management System |
| IT24103156 | Gem Listing Management & AI Price Predictor |
| IT24102032 | Auction & Bidding System |
| IT24102678 | Favorites & Watchlist Folders |
| IT24104249 | Ratings & Review System |
| IT24102701 | Admin & Certification Management |

---

## License

This project is licensed under the terms of the [LICENSE](./LICENSE) file included in this repository.

---

<div align="center">
  <sub>Built with passion for the Sri Lankan gem trade · GemBid LK © 2025</sub>
</div>

