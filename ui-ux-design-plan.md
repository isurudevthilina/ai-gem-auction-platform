# UI/UX Design Plan: Gem Auction Platform 💎

A complete, page-by-page specification of every screen, element, interaction, and navigation flow in the application.

---

## 1. Design Tech Stack

| Tool | Purpose |
|---|---|
| **Figma (Free)** | Wireframes, high-fidelity mockups, interactive prototypes, design system |
| **Spline (Free)** | Create interactive 3D gem animations, export as React component |
| **Google Fonts** | *Plus Jakarta Sans* (UI), *Playfair Display* (Headings) |
| **React + Vite** | Frontend framework |
| **Tailwind CSS** | Utility-first CSS matching Figma tokens |
| **shadcn/ui + Radix** | Accessible, themeable UI primitives (Modals, Dropdowns, Tabs) |
| **Framer Motion** | Page transitions, hover/click micro-animations |
| **@react-three/fiber** | Render 3D Spline gem models inside React |

---

## 2. Figma-to-React Workflow

1. **Moodboard (Figma Page 1):** Collect references — luxury jewelry sites, Sri Lankan cultural patterns, minimalist white UIs.
2. **Design System (Figma Page 2):** Build a component library — Buttons, Inputs, Cards, Badges, Modals, Typography scale.
3. **Page Mockups (Figma Page 3+):** Assemble components into full-page designs for each page listed below.
4. **Prototype:** Link pages together in Figma's Prototype tab to simulate the full click-through flow.
5. **Handoff:** Use Figma's Inspect panel to copy exact padding, font sizes, and hex codes into Tailwind classes.
6. **Build:** Implement each page as a React route component inside `src/features/`.

---

## 3. Color Palette & Aesthetic

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Page backgrounds |
| `--bg-secondary` | `#F8FAFC` | Card backgrounds, alternating sections |
| `--bg-dark` | `#0F172A` | Dark mode surfaces, footer |
| `--text-primary` | `#0F172A` | Headings, body text |
| `--text-muted` | `#64748B` | Captions, timestamps |
| `--accent-gold` | `#D4AF37` | Primary buttons, cultural accent, active states |
| `--accent-blue` | `#2563EB` | Links, sapphire references |
| `--success` | `#16A34A` | Winning bid, verified badge |
| `--danger` | `#DC2626` | Outbid alert, errors, auction ending soon |
| `--border` | `#E2E8F0` | Card borders, input borders |

**Cultural Touch:** Use subtle Sri Lankan lotus/mandala patterns as faint watermarks on section backgrounds. Gold accent lines as section dividers.

---

## 4. Global Components (Present on Every Page)

### 4.1 Navbar (Sticky, Glassmorphism)
| Position | Element | Type | Action / Redirect |
|---|---|---|---|
| Left | Logo + "GemBid" text | Link | → Homepage `/` |
| Center | Search bar | Input + Icon | Type query → redirects to `/gems?search=query` |
| Center-Right | "Auctions" | Nav Link | → `/auctions` |
| Center-Right | "AI Predictor" | Nav Link | → `/ai-predictor` |
| Right | 🔔 Notification Bell | Icon Button | Opens notification dropdown panel |
| Right | User Avatar | Avatar Button | Opens user dropdown menu (see below) |
| Right (Guest) | "Login" | Text Button | → `/login` |
| Right (Guest) | "Sign Up" | Primary Button | → `/signup` |

**User Dropdown Menu (Logged In):**
| Item | Icon | Redirect |
|---|---|---|
| My Profile | 👤 | → `/profile` |
| My Dashboard | 📊 | → `/buyer-dashboard` or `/seller-dashboard` (role-based) |
| My Watchlist | ❤️ | → `/watchlist` |
| Settings | ⚙️ | → `/settings` |
| Logout | 🚪 | Clears session → `/` |

**Notification Dropdown:**
| Element | Details |
|---|---|
| Header | "Notifications" title + "Mark All Read" link |
| Items | List of notifications (icon, message, timestamp, read/unread dot) |
| Each Item Click | Redirects to relevant page (e.g., outbid → auction page) |
| Footer | "View All" link → `/notifications` |

### 4.2 Footer
| Section | Elements |
|---|---|
| Column 1 | Logo, tagline "Sri Lanka's Premier Gem Marketplace", social icons (Facebook, Instagram, Twitter) |
| Column 2 | Quick Links: Home, Auctions, AI Predictor, About Us |
| Column 3 | Support: FAQ, Contact Us, Terms & Conditions, Privacy Policy |
| Column 4 | Newsletter: Email input + "Subscribe" button |
| Bottom Bar | "© 2025 GemBid. All rights reserved." |

---

## 5. Page-by-Page Detailed Specification

---

### PAGE 1: Homepage `/`

**Purpose:** First impression. Showcases the platform's premium feel, 3D animation, and directs users to key actions.

#### Section 1: Hero
| Element | Type | Details | Action |
|---|---|---|---|
| Headline | H1 | "Discover Sri Lanka's Finest Gems" | — |
| Subheadline | Paragraph | "Bid on certified, ethically sourced gemstones..." | — |
| "Start Bidding" | Primary Button (Gold) | Large, prominent | → `/auctions` |
| "Predict Worth" | Secondary Button (Outline) | Next to primary | → `/ai-predictor` |
| 3D Gem | Spline Component | Large rotating sapphire, reacts to mouse hover (tilts) | Interactive only |

#### Section 2: Featured Live Auctions
| Element | Type | Details | Action |
|---|---|---|---|
| Section Title | H2 | "🔥 Live Auctions" | — |
| "View All" | Text Link | Right-aligned | → `/auctions?status=active` |
| Auction Cards | Horizontal scroll (4 cards) | Image, title, current bid, countdown, bid count | Card click → `/auction/:id` |

#### Section 3: How It Works
| Element | Details |
|---|---|
| Step 1 Icon + Text | "Create Account" — Register and verify your identity |
| Step 2 Icon + Text | "Discover Gems" — Browse certified listings |
| Step 3 Icon + Text | "Place Your Bid" — Compete in real-time auctions |
| Step 4 Icon + Text | "Win & Receive" — Secure payment and delivery |

#### Section 4: AI Feature Highlight
| Element | Type | Action |
|---|---|---|
| Headline | H2 | "Know What Your Gem Is Worth" |
| Description | Paragraph | Explains AI prediction + SHAP |
| Preview Image | Screenshot mockup of the AI result page | — |
| "Try It Now" | Primary Button | → `/ai-predictor` |

#### Section 5: Trust & Certification
| Element | Details |
|---|---|
| Badge 1 | ✅ "Certified Authentic" — Every gem verified |
| Badge 2 | 🌿 "Ethically Sourced" — Responsible mining |
| Badge 3 | 🤖 "AI Evaluated" — Fair market pricing |

#### Section 6: Testimonials
| Element | Details |
|---|---|
| Cards | 3 testimonial cards with avatar, name, quote, star rating |
| Navigation | Left/Right arrow buttons or auto-scroll carousel |

#### Section 7: FAQ (Expandable Accordion)
| Question Examples |
|---|
| "How does the bidding process work?" |
| "Is the AI prediction accurate?" |
| "How are gems certified?" |
| "What payment methods do you accept?" |

---

### PAGE 2: Sign Up `/signup`

**Layout:** Split screen — Left side: elegant gem background image. Right side: form.

| Element | Type | Validation | Action |
|---|---|---|---|
| Page Title | H1 | — | "Create Your Account" |
| Full Name | Text Input | Required, min 2 chars | — |
| Email | Email Input | Required, valid email format | — |
| Password | Password Input + Toggle visibility icon | Required, min 8 chars, must include number | — |
| Confirm Password | Password Input | Must match Password | — |
| Role Selection | Radio buttons | "I want to Buy" / "I want to Sell" (default: Buy) | Sets `role` field |
| Terms & Conditions | Checkbox | Required | "I agree to T&C" (link opens `/terms`) |
| "Create Account" | Primary Button | Disabled until all valid | Calls Supabase Auth signup → redirects to `/verify-email` |
| "Already have an account?" | Text Link | — | → `/login` |
| Divider | "OR" | — | — |
| "Sign up with Google" | OAuth Button | — | Supabase Google OAuth → `/` |

---

### PAGE 3: Login `/login`

**Layout:** Same split-screen layout as Sign Up for consistency.

| Element | Type | Validation | Action |
|---|---|---|---|
| Page Title | H1 | — | "Welcome Back" |
| Email | Email Input | Required | — |
| Password | Password Input + Toggle visibility | Required | — |
| "Remember Me" | Checkbox | — | Persists session |
| "Forgot Password?" | Text Link | — | → `/forgot-password` |
| "Sign In" | Primary Button | Disabled until valid | Supabase Auth login → role-based redirect (see below) |
| "Don't have an account?" | Text Link | — | → `/signup` |
| "Sign in with Google" | OAuth Button | — | Supabase Google OAuth |

**Post-Login Redirect Logic:**
| User Role | Redirect To |
|---|---|
| Buyer | → `/buyer-dashboard` |
| Seller | → `/seller-dashboard` |
| Admin | → `/admin-dashboard` |

---

### PAGE 4: Forgot Password `/forgot-password`

| Element | Type | Action |
|---|---|---|
| Title | H2 | "Reset Your Password" |
| Description | Paragraph | "Enter your email and we'll send a reset link." |
| Email | Email Input (Required) | — |
| "Send Reset Link" | Primary Button | Calls Supabase `resetPasswordForEmail()` → shows success toast |
| "Back to Login" | Text Link | → `/login` |

---

### PAGE 5: Reset Password `/reset-password`

*(User arrives here from the email link)*

| Element | Type | Action |
|---|---|---|
| Title | H2 | "Set New Password" |
| New Password | Password Input | Min 8 chars |
| Confirm New Password | Password Input | Must match |
| "Update Password" | Primary Button | Calls Supabase `updateUser()` → success toast → `/login` |

---

### PAGE 6: Email Verification `/verify-email`

| Element | Type | Action |
|---|---|---|
| Illustration | Email icon/animation | — |
| Title | H2 | "Check Your Email" |
| Description | Paragraph | "We've sent a verification link to your@email.com" |
| "Resend Email" | Text Button | Resends verification email via Supabase |
| "Back to Login" | Text Link | → `/login` |

---

### PAGE 7: User Profile `/profile`

**Access:** Any logged-in user (Buyer, Seller, Admin).

#### Section 1: Profile Header
| Element | Type | Action |
|---|---|---|
| Avatar | Large circular image (150px) | — |
| "Change Photo" | Small text button/overlay on avatar | Opens file picker → uploads to Supabase Storage → updates `profiles.avatar_url` |
| Full Name | Displayed as H2 | — |
| Role Badge | Colored badge ("Buyer", "Seller", "Admin") | — |
| Email | Displayed (muted text) | — |
| "Edit Profile" | Secondary Button | Toggles inline editing mode (see below) |

#### Section 2: Edit Profile (Inline or Modal)
| Field | Type | Validation | Action |
|---|---|---|---|
| Full Name | Text Input | Required, min 2 chars | — |
| Phone Number | Text Input | Optional, valid phone | — |
| Address | Textarea | Optional | — |
| Bio | Textarea | Optional, max 250 chars | — |
| "Save Changes" | Primary Button | — | PATCH `/api/users/:id` → success toast |
| "Cancel" | Ghost Button | — | Reverts changes, exits edit mode |

#### Section 3: Security
| Element | Type | Action |
|---|---|---|
| "Change Password" | Button | Opens modal with: Current Password, New Password, Confirm Password fields + "Update" button. Calls Supabase `updateUser()` |
| Two-Factor Auth | Toggle Switch (Future) | — |

#### Section 4: Account Actions
| Element | Type | Action |
|---|---|---|
| "Delete Account" | Danger Button (Red text) | Opens confirmation modal: "Are you sure? This cannot be undone." → "Yes, Delete" / "Cancel". Calls DELETE `/api/users/:id` → logout → `/` |

#### Section 5: Seller-Only – My Reviews
*(Visible only if role is Seller)*
| Element | Details |
|---|---|
| Average Rating | Large star display (e.g., ★★★★☆ 4.2) |
| Review List | Scrollable list of buyer reviews: avatar, name, rating, comment, date |

---

### PAGE 8: Gem Listing Grid `/gems`

**Purpose:** Browse/search all available gems.

#### Top Bar
| Element | Type | Action |
|---|---|---|
| Page Title | H1 | "Explore Gems" |
| Search Input | Text + icon | Filters grid in real-time |
| Sort Dropdown | Select | Options: "Newest", "Price: Low→High", "Price: High→Low", "Ending Soon" |
| View Toggle | Icon Buttons | Grid View (default) / List View |

#### Sidebar Filters
| Filter | Type | Options |
|---|---|---|
| Gem Type | Checkbox group | Sapphire, Ruby, Emerald, Diamond, Other |
| Listing Type | Radio | All, Auction Only, Direct Buy Only |
| Price Range | Dual-handle slider | Min $0 – Max $100,000 |
| Carat Weight | Dual-handle slider | 0.1 – 20.0 ct |
| Cut | Checkbox group | Round, Oval, Cushion, Pear, Emerald Cut |
| Clarity | Checkbox group | IF, VVS1, VVS2, VS1, VS2, SI1 |
| Origin | Checkbox group | Sri Lanka, Myanmar, Colombia, Other |
| "Apply Filters" | Primary Button | Refetches grid with filter params |
| "Clear All" | Text Link | Resets all filters |

#### Gem Card (Repeated in Grid)
| Element | Type | Action |
|---|---|---|
| Image | Thumbnail (16:9) | — |
| ❤️ Heart Icon | Toggle button (top-right corner) | Adds/removes from default watchlist folder. If not logged in → redirect `/login` |
| Title | Bold text | — |
| Gem Type Badge | Small colored pill | e.g., "Sapphire" in blue |
| Listing Type | Small tag | "Auction" (orange) or "Buy Now" (green) |
| Price | Bold text | Current Bid (if auction) or Buy Now price |
| Countdown | Timer text (if auction) | e.g., "2h 15m left" (red if < 1hr) |
| **Card Click** | — | → `/gem/:id` (Direct Sell) or → `/auction/:id` (Auction) |

#### Pagination
| Element | Type | Action |
|---|---|---|
| "← Previous" | Button | Loads previous page |
| Page Numbers | Numbered buttons | Loads specific page |
| "Next →" | Button | Loads next page |

---

### PAGE 9: Gem Detail (Direct Sell) `/gem/:id`

#### Left Column
| Element | Type | Action |
|---|---|---|
| Main Image | Large display (500px height) | — |
| Thumbnail Strip | Horizontal row of small images | Click to swap main image |
| 3D Viewer Toggle | Button: "View in 3D" | Swaps main image for interactive 3D Spline viewer |

#### Right Column
| Element | Type | Action |
|---|---|---|
| Title | H1 | Gem name |
| Seller Name | Link text | → `/seller/:id` (public seller profile) |
| Seller Rating | Stars + number | — |
| ✅ Badge | "Certified" or "Pending Verification" | — |
| Origin | Text | e.g., "Sri Lanka (Ceylon)" |
| AI Predicted Price | Badge | "AI Value: $X,XXX" – click opens SHAP modal |
| Buy Now Price | Large H2 bold text | e.g., "$12,500" |
| "Buy Now" | Large Primary Button | Opens Purchase Confirmation Modal (see below) |
| ❤️ "Save to Watchlist" | Secondary Button | Opens folder selector dropdown → saves to selected folder |
| "Share" | Icon Button | Copies link / opens share sheet |

#### Specifications Tab (Below images)
| Field | Value Example |
|---|---|
| Type | Blue Sapphire |
| Carat Weight | 2.50 ct |
| Cut | Cushion |
| Clarity | VVS1 |
| Color | Royal Blue |
| Treatment | None (Natural) |
| Dimensions | 8.2 × 6.5 × 4.1 mm |
| Certificate | GIA #12345678 (link to view PDF) |

#### Purchase Confirmation Modal
| Element | Type | Action |
|---|---|---|
| Title | H3 | "Confirm Purchase" |
| Gem Summary | Image + name + price | — |
| "Confirm & Pay" | Primary Button | POST `/api/gems/:id/buy-now` → redirect `/buyer-dashboard?tab=purchases` |
| "Cancel" | Ghost Button | Closes modal |

---

### PAGE 10: Live Auction Page `/auction/:id`

#### Left Column (Same as Gem Detail)
| Element | Details |
|---|---|
| Main Image, Thumbnails, 3D Toggle | Same as Page 9 |

#### Right Column — Bidding Area
| Element | Type | Action |
|---|---|---|
| Title | H1 | Gem name |
| Seller Name | Link | → `/seller/:id` |
| ✅ Certificate Badge | Badge | — |
| AI Predicted Price | Info badge | Click → SHAP modal |
| **Countdown Timer** | Large, bold, ticking | Format: `02h 15m 30s`. Turns RED if < 1 hour |
| **Current Bid** | Very large H1 text | e.g., "$12,750" — updates in real-time via Supabase Realtime |
| Total Bids | Muted text | e.g., "47 bids placed" |
| Min Next Bid | Muted text | e.g., "Min: $12,800 (+$50 increment)" |
| Bid Amount | Number Input | Pre-filled with min next bid amount |
| "Place Bid" | Large Primary Button | Validates amount → POST `/api/auctions/:id/bids` → real-time update. If not logged in → `/login` |
| ❤️ "Watch Auction" | Secondary Button | Adds to watchlist folder |

#### Live Bid Feed (Below bidding area)
| Element | Details |
|---|---|
| Header | "Recent Bids" + live green dot indicator |
| Feed Items | Scrolling list: "User***8 — $12,750 — 2 min ago". New bids animate in from top |

#### Specifications & Reviews Tabs
| Tab | Content |
|---|---|
| Specifications | Same table as Page 9 |
| Seller Reviews | List of reviews with star ratings |

---

### PAGE 11: AI Price Predictor `/ai-predictor`

#### Header
| Element | Type |
|---|---|
| Title | H1: "AI Gem Price Predictor" |
| Subtitle | "Get an instant market valuation powered by Machine Learning" |

#### The Prediction Form (Multi-Step or Single Page)
| Step | Field | Type | Options |
|---|---|---|---|
| 1 | Gem Type | Dropdown | Sapphire, Ruby, Emerald, Diamond, Alexandrite, Other |
| 1 | Carat Weight | Number Input | 0.01 – 50.0 |
| 2 | Cut | Dropdown | Round, Oval, Cushion, Pear, Emerald Cut, Marquise, Heart |
| 2 | Clarity | Dropdown | IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1 |
| 3 | Color | Dropdown / Color picker | Varies by gem type |
| 3 | Origin | Dropdown | Sri Lanka, Myanmar, Colombia, Brazil, Madagascar, Other |
| 3 | Treatment | Dropdown | None, Heat Treated, Fracture Filled, Irradiated |
| — | "Predict Price" | Primary Button | POST to Python ML API → displays result below |

#### Result View (Appears after prediction)
| Element | Type | Details |
|---|---|---|
| Predicted Price | Very large H1 | e.g., "$14,250" with confidence range "± $1,200" |
| **SHAP Breakdown** | Horizontal bar chart | Each bar = one feature's contribution. e.g., "Origin: Ceylon → +$3,200", "Clarity: VVS1 → +$2,100", "Treatment: None → +$1,500" |
| "Predict Another" | Secondary Button | Resets form |
| "List This Gem" (Seller only) | Primary Button | → `/create-listing` with form data pre-filled |

---

### PAGE 12: Watchlist `/watchlist`

#### Folder Management Bar
| Element | Type | Action |
|---|---|---|
| Page Title | H1 | "My Watchlist" |
| "Create Folder" | Primary Button | Opens modal: Folder Name input + "Create" button. POST `/api/watchlist/folders` |

#### Folder Grid
| Element | Type | Action |
|---|---|---|
| Folder Card | Card with folder icon + name + item count | Click → filters the gem list below to show only items in that folder |
| "All Items" | Default tab/card | Shows every saved gem across all folders |
| Folder Options | ⋮ Menu (on each folder card) | "Rename" → inline edit. "Delete" → confirmation modal → DELETE `/api/watchlist/folders/:id` |

#### Saved Gems Grid
| Element | Type | Action |
|---|---|---|
| Gem Cards | Same design as Page 8 gem cards | Click → `/gem/:id` or `/auction/:id` |
| "Remove" | ✕ icon on each card | DELETE `/api/watchlist/:auctionId` → removes from list |
| "Move to Folder" | Dropdown on each card | Moves item to a different folder |

---

### PAGE 13: Create Listing `/create-listing`

**Access:** Seller role only. If buyer visits → redirect to `/buyer-dashboard`.

#### Form Sections
| Section | Fields | Type |
|---|---|---|
| **Basic Info** | Title | Text Input (required) |
| | Description | Rich Textarea (required) |
| | Category | Dropdown (Sapphire, Ruby, etc.) |
| **Gem Details** | Carat Weight | Number Input |
| | Cut | Dropdown |
| | Clarity | Dropdown |
| | Color | Dropdown |
| | Origin | Dropdown |
| | Treatment | Dropdown |
| **Images** | Image Upload | Drag & drop zone. Up to 6 images. First image = thumbnail. Uploaded to Supabase Storage |
| **Certification** | Certificate PDF | File upload (Optional). Uploaded to Supabase Storage |
| **Pricing & Listing Type** | Listing Type | Radio: "Direct Sell" / "Auction" |
| *If Direct Sell:* | Buy Now Price | Currency Input (required) |
| *If Auction:* | Starting Price | Currency Input (required) |
| | Reserve Price | Currency Input (optional) |
| | Min Bid Increment | Currency Input (default $50) |
| | Auction Duration | Dropdown: 1 day, 3 days, 5 days, 7 days |
| **AI Feature** | "Get AI Price Prediction" | Secondary Button → calls ML API → shows predicted price inline with SHAP chart. Auto-fills the price field with suggestion |

#### Form Actions
| Element | Type | Action |
|---|---|---|
| "Save as Draft" | Ghost Button | POST `/api/gems` with status `draft` → redirect `/seller-dashboard` |
| "Publish Listing" | Primary Button | POST `/api/gems` with status `listed` (or creates auction) → redirect `/seller-dashboard` |

---

### PAGE 14: Buyer Dashboard `/buyer-dashboard`

**Layout:** Sidebar (left) + Main Content (right).

#### Sidebar Navigation
| Item | Icon | Action |
|---|---|---|
| Overview | 📊 | Default view |
| My Bids | 🔨 | Shows active/past bids |
| Watchlist | ❤️ | → `/watchlist` |
| Purchases | 🛒 | Shows completed purchases |
| Notifications | 🔔 | → `/notifications` |
| Settings | ⚙️ | → `/settings` |

#### Overview Tab
| Element | Type | Details |
|---|---|---|
| Stat Card 1 | Metric | "Active Bids: 5" |
| Stat Card 2 | Metric (green) | "Winning: 3" |
| Stat Card 3 | Metric (red) | "Outbid: 2" |
| Stat Card 4 | Metric | "Total Purchases: 12" |
| "Active Bids" Table | Table | Columns: Gem Name, Current Bid, Your Bid, Status (Winning ✅ / Outbid ❌), Time Left, Action ("View" button → `/auction/:id`) |

#### My Bids Tab
| Filter | Options |
|---|---|
| Status Filter | Tabs: "All", "Winning", "Outbid", "Won", "Lost" |
| Table | Same columns as overview + "Bid History" expand row showing all your bids on that auction |

#### Purchases Tab
| Table Columns | Details |
|---|---|
| Gem Name | Link → `/gem/:id` |
| Purchase Type | "Auction Win" or "Direct Buy" |
| Amount Paid | Currency |
| Date | Timestamp |
| Status | "Completed", "Shipped", "Delivered" |
| Action | "Leave Review" button → opens review modal (if not already reviewed) |

---

### PAGE 15: Seller Dashboard `/seller-dashboard`

**Layout:** Same sidebar layout as Buyer Dashboard.

#### Sidebar Navigation
| Item | Icon | Action |
|---|---|---|
| Overview | 📊 | Default view |
| My Listings | 💎 | Manage all listings |
| Create Listing | ➕ | → `/create-listing` |
| Sales | 💰 | Completed sales |
| Reviews | ⭐ | View buyer reviews |
| Settings | ⚙️ | → `/settings` |

#### Overview Tab
| Element | Type |
|---|---|
| Stat Card 1 | "Total Revenue: $45,200" |
| Stat Card 2 | "Active Listings: 8" |
| Stat Card 3 | "Active Auctions: 3" |
| Stat Card 4 | "Pending Certifications: 1" |
| Recent Activity | Timeline of recent bids/sales on seller's items |

#### My Listings Tab
| Filter | Options |
|---|---|
| Status Filter | Tabs: "All", "Active", "Draft", "In Auction", "Sold" |
| **Table Columns** | Gem Name, Type (Auction/Direct), Price/Current Bid, Status, Views, Actions |
| **Actions Column** | "Edit" (→ `/edit-listing/:id`), "View" (→ `/gem/:id`), "Delete" (confirmation modal → DELETE `/api/gems/:id`) |

#### Sales Tab
| Table Columns |
|---|
| Gem Name, Buyer, Amount, Sale Type, Date, Status (Pending Payment / Completed) |

#### Reviews Tab
| Element | Details |
|---|---|
| Average Rating | Large star display |
| Review List | Buyer avatar, name, stars, comment, date. No edit/delete by seller |

---

### PAGE 16: Admin Dashboard `/admin-dashboard`

**Access:** Admin role only.

#### Sidebar Navigation
| Item | Icon |
|---|---|
| System Overview | 📊 |
| User Management | 👥 |
| Listing Management | 💎 |
| Certification Queue | 📜 |
| Reports & Disputes | ⚠️ |

#### System Overview
| Stat Cards | Details |
|---|---|
| Total Users | Count |
| Active Auctions | Count |
| Pending Certifications | Count (with alert badge if > 0) |
| Revenue (This Month) | Sum |

#### User Management
| Table Columns | Details |
|---|---|
| Name, Email, Role, Verified, Joined Date, Status (Active/Suspended) |
| **Actions** | "View Profile", "Change Role" (dropdown), "Suspend" (toggle), "Delete" (confirmation modal) |

#### Certification Queue
| Table Columns | Details |
|---|---|
| Gem Title, Seller Name, Submitted Date, Certificate Preview (PDF link) |
| **Actions** | "✅ Approve" (green button) → PATCH status to verified, "❌ Reject" (red button) → opens reason input modal |

#### Reports & Disputes
| Table Columns |
|---|
| Reporter, Reported Item/User, Reason, Date, Status (Open/Resolved) |
| **Actions** | "Review" → opens detail modal, "Resolve" → marks as handled |

---

### PAGE 17: Settings `/settings`

**Access:** Any logged-in user.

| Section | Fields | Action |
|---|---|---|
| **Profile** | Update Name, Phone, Bio | "Save" button → PATCH `/api/users/:id` |
| **Email** | Current email (read-only), "Change Email" button | Opens modal: New Email input → Supabase sends verification |
| **Password** | "Change Password" button | Opens modal: Current Password, New Password, Confirm → Supabase `updateUser()` |
| **Notifications Preferences** | Toggle switches | "Email on outbid", "Email on auction won", "Email on auction ending soon", "Push notifications" |
| **Appearance** | Theme toggle | Light/Dark mode switch → saves to local storage |
| **Delete Account** | "Delete My Account" | Red danger button → confirmation modal: type "DELETE" to confirm → deletes → logout → `/` |

---

### PAGE 18: Notifications `/notifications`

| Element | Type | Details |
|---|---|---|
| Page Title | H1 | "Notifications" |
| "Mark All as Read" | Text Button | Marks all as read |
| Filter Tabs | Tabs | "All", "Bids", "Auctions", "System" |
| Notification Item | Card/Row | Icon (type-specific), Title, Message, Timestamp, Read/Unread dot |
| **Item Click** | — | Marks as read + redirects to relevant page |

**Notification Types & Redirects:**
| Type | Message Example | Click Redirect |
|---|---|---|
| Outbid | "You've been outbid on Royal Sapphire" | → `/auction/:id` |
| Auction Won | "Congratulations! You won the Ceylon Ruby" | → `/buyer-dashboard?tab=purchases` |
| Auction Ending | "Royal Sapphire auction ends in 30 minutes" | → `/auction/:id` |
| New Bid (Seller) | "New bid of $5,200 on your Blue Sapphire" | → `/auction/:id` |
| Certificate Approved | "Your gem certificate has been verified" | → `/gem/:id` |
| System | "Welcome to GemBid! Complete your profile" | → `/profile` |

---

### PAGE 19: Public Seller Profile `/seller/:id`

**Access:** Any user (even guests).

| Element | Type | Details |
|---|---|---|
| Avatar | Large circular | — |
| Name | H1 | — |
| "Seller" Badge | Badge | — |
| Member Since | Muted text | "Joined March 2025" |
| Average Rating | Stars + count | "★★★★☆ (4.3 from 128 reviews)" |
| **Active Listings Tab** | Grid of GemCards | Only this seller's active gems. Click → `/gem/:id` or `/auction/:id` |
| **Reviews Tab** | List | Same format as profile reviews section |

---

## 6. Navigation & Redirect Summary

```
/ (Homepage)
├── /signup                → Create account
├── /login                 → Sign in
│   ├── /forgot-password   → Request reset link
│   └── /reset-password    → Set new password (from email)
├── /verify-email          → Email confirmation page
├── /gems                  → Browse all gems
│   └── /gem/:id           → Single gem detail (Direct Sell)
├── /auctions              → Browse all auctions
│   └── /auction/:id       → Live auction page
├── /ai-predictor          → AI price prediction form
├── /profile               → User's own profile (edit, photo, password)
├── /settings              → Account settings, notifications, delete
├── /watchlist             → Watchlist folders + saved gems
├── /notifications         → All notifications
├── /create-listing        → Seller: create new gem listing
├── /edit-listing/:id      → Seller: edit existing listing
├── /buyer-dashboard       → Buyer's control panel
├── /seller-dashboard      → Seller's control panel
├── /admin-dashboard       → Admin control panel
└── /seller/:id            → Public seller profile
```

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop | ≥ 1280px | Full layout, sidebar visible, 4-column gem grid |
| Tablet | 768–1279px | Sidebar collapses to icons, 2-column grid |
| Mobile | < 768px | Bottom navigation bar, single-column, hamburger menu |
