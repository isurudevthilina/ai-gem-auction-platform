# UI/UX Design Plan: Gem Auction Platform 💎

This document outlines the complete A-to-Z flow for designing the Gem Auction Platform. The goal is to create a **minimalist, modern, white-themed web application** that incorporates **Sri Lankan cultural aesthetics** and **interactive 3D gem animations**, providing a premium User Experience (UX).

---

## 1. Design Tech Stack & Tooling

To achieve a high-end, dynamic UI/UX, we will use the following tools:

### Design Phase
*   **Figma (Free Tier):** For creating wireframes, high-fidelity mockups, and interactive prototypes.
*   **Spline Design (Free):** For creating the interactive 3D gem animations without needing advanced Blender knowledge. Spline exports easily to React.
*   **Google Fonts:** For modern typography (e.g., *Inter* or *Plus Jakarta Sans* for UI elements, paired with an elegant serif like *Playfair Display* for headings to give a premium, cultural feel).

### Implementation Phase (Frontend)
*   **React + Vite:** The core framework for building the UI rapidly.
*   **Tailwind CSS:** For styling. It allows pixel-perfect implementation of Figma designs directly in the code.
*   **shadcn/ui & Radix UI:** For accessible, unstyled UI components (dropdowns, modals, sliders) that can be perfectly themed to match the Figma designs.
*   **Framer Motion:** For smooth page transitions, stagger animations on gem grids, and interactive micro-interactions (hover states, button clicks).
*   **Three.js / @react-three/fiber:** For rendering the exported 3D gem models directly inside the React components.

---

## 2. A-to-Z Flow: Figma to React Development

Here is the step-by-step process for translating your vision into code:

### Step 1: Inspiration & Moodboarding (Figma)
*   Create a "Moodboard" page in Figma.
*   Gather images of high-end jewelry brands, minimalist architecture, and subtle Sri Lankan cultural patterns (e.g., modernized lotus motifs, traditional brass/gold color accents).
*   Define the **Color Palette**:
    *   **Backgrounds:** Pure White (`#FFFFFF`) and Off-Whites (`#F8FAFC`).
    *   **Text:** Deep Charcoal or Soft Black (`#0F172A`) for high readability without harsh contrast.
    *   **Accents (Cultural touch):** Rich Brass/Gold (`#D4AF37`) or deep Royal Blue (representing Sapphires).
    *   **Status Colors:** Muted Green (Success/Winning), Deep Red (Danger/Outbid).

### Step 2: Component Design (Figma Design System)
*   Don't design full pages immediately. Start by designing individual components:
    *   **Buttons:** Primary (Gold background), Secondary (Outline), Ghost (Text only).
    *   **Inputs:** Clean borders, soft focus states.
    *   **Cards:** Gem display cards with subtle shadows (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`) to make them "float" on the white background.
    *   **Typography Scale:** Define your H1 down to paragraph sizes.

### Step 3: Page Mockups & Prototyping (Figma)
*   Assemble the components into full page mockups (detailed in section 4).
*   Link buttons to pages in Figma's "Prototype" tab to test the flow (e.g., clicking "Bid" opens a modal).

### Step 4: 3D Asset Creation (Spline)
*   Open Spline (spline.design).
*   Create or import a glowing, reflective gem model (e.g., a Blue Sapphire).
*   Add a slow rotation animation and an interactive "hover" state (e.g., the gem tilts towards the mouse pointer).
*   Export the scene as a React component.

### Step 5: The React Conversion Build
*   **Setup Tailwind:** Configure `tailwind.config.js` with the exact color hex codes and fonts from Figma.
*   **Component Assembly:** Build the React components (`src/shared/components/`) matching the Figma designs. Use `shadcn/ui` to speed this up.
*   **Integration:** Drop the Spline 3D component into the React Hero section. Use Framer Motion to add the entrance animations established in Figma.

---

## 3. The Aesthetic Guidelines

*   **Cultural & Modern:** Avoid overly busy traditional patterns. Use them as *subtle watermarks* in the background or as fine divider lines. The UI should breathe (lots of whitespace).
*   **Glassmorphism (Sparingly):** Use frosted glass effects (blur backdrops) on floating elements like the Navbar or Bidding Modals so the 3D gem can be seen softly behind them.
*   **Micro-interactions:** Buttons should gently scale down when clicked; gem cards should slightly elevate on hover.

---

## 4. Page-by-Page Breakdown & Requirements

### 1. Homepage (The "Wow" Factor)
*   **Navbar:** Sticky, Glassmorphism. Logo (Left), Search Bar (Center), Links (Auctions, AI Predictor), User Avatar/Login (Right).
*   **Hero Section:**
    *   **Left:** Bold, elegant typography ("Discover Sri Lanka's Finest Gems"). "Start Bidding" (Primary Button) & "Predict Worth" (Secondary Button).
    *   **Right (The 3D Element):** The large, interactive 3D Sapphire rotating slowly.
*   **Live Auctions Strip:** A horizontal scrolling row of 3-4 active auction `GemCard` components.
*   **Cultural Trust Section:** Three minimalist icons highlighting "Certified Authentic," "Ethical Sourcing," and "AI Evaluated."
*   **Footer:** Clean links, newsletter signup, subtle cultural pattern background.

### 2. Search & Discover (Gem Grid)
*   **Sidebar Filters:** Checkboxes for Cut (Oval, Cushion), Sliders for Carat Weight, Range inputs for Price, and Multi-select for Gem Type (Sapphire, Ruby).
*   **Main Area:** Grid of `GemCard`s.
    *   *GemCard Design:* Large high-quality image, Title, Current Bid/Price, Countdown timer (if auction), and a small "Watchlist Heart" icon in the top right.

### 3. Gem Detail / Live Auction Page (The Most Important Page)
*   **Left Column (Visuals):** Heavy focus on imagery. Main image gallery with thumbnails. Optional: the 3D viewer for the specific gem if available.
*   **Right Column (Action & Details):**
    *   **Header:** Title, Origin, Certification Badge.
    *   **AI Predictor Badge:** A sleek UI element showing "AI Estimated Value: $X,XXX" with a link to view the SHAP breakdown.
    *   **The Bidding Area (If Auction):**
        *   Large "Current Bid" display.
        *   Live countdown timer (red text if < 1 hour).
        *   Input box for Custom Bid Amount.
        *   "Place Bid" Button (Large, prominent).
    *   **Live Bid Feed:** A scrolling, real-time list showing recent bids (e.g., "User***8 placed $500").
*   **Below Fold (Specs):** Tabbed interface for "Specifications" (Weight, Clarity, Cut) and "Seller Reviews".

### 4. AI Predictor Page (Interactive Form)
*   **Header:** "Evaluate Your Gem's Worth instantly using AI."
*   **The Form:** Clean, segmented input areas. Step 1: Gem Type & Carat. Step 2: Cut & Clarity. Step 3: Color & Origin.
*   **Result View:**
    *   Large display of the predicted price.
    *   **SHAP Visualizer:** A beautiful, easy-to-read horizontal bar chart showing exactly *why* the price is what it is (e.g., "+$500 because Origin is Ceylon").

### 5. Dashboards (Buyer & Seller)

*Dashboards should utilize a sidebar layout for navigation.*

#### Buyer Dashboard
*   **Metrics Row:** Total Bids Placed, Active Bids Winning, Active Bids Losing.
*   **Active Bids List:** Table showing the auction name, current price, and a green/red indicator if they are currently winning or losing.
*   **Watchlist Folders:** A masonry grid displaying their custom folders (e.g., "Gifts", "Sapphires") containing saved gems.
*   **Purchase History:** Table of won auctions/direct buys.

#### Seller Dashboard
*   **Metrics Row:** Total Revenue, Active Listings, Pending Auctions.
*   **Quick Action:** Large "Create New Listing" button.
*   **My Listings:** Table of active listings with options to Edit, View, or Delete.
*   **Recent Sales:** Table showing completed transactions awaiting shipment/tracking details.

#### Admin Dashboard (Internal look)
*   **Overview:** System health, total users, pending disputes.
*   **Certification Queue:** List of newly uploaded certificates requiring manual verification. "Approve" (Green Button) / "Reject" (Red Button) actions.

---

## 5. Q&A and Next Steps

Before we jump into creating these components in the code, here are a few questions regarding your vision:

**Q1:** For the 3D element on the homepage, do you want a floating abstract gem, or something more grounded like a gem resting on a minimalist pedestal?
**Q2:** Regarding the "Cultural theme," would you prefer the accent colors to lean more towards traditional Gold/Brass, or the Blue/Red colors indicative of Sri Lankan Sapphires and Rubies?
**Q3:** Should the dashboards be integrated into the main site navigation flow, or feel like a separate "admin-like" workspace for the user?
