# Enhanced Entity-Relationship (EER) Diagram

The following diagram illustrates the full database schema for the GemBid platform, including all 11 tables, their columns, and FK relationships.

> **Tables:** profiles · categories · gems · auctions · bids · transactions · notifications · watchlist_folders · watchlist · certificates · reviews

```mermaid
erDiagram

    %% ── Core ownership relationships ──────────────────────────────
    PROFILES ||--o{ GEMS              : "seller_id → creates listings"
    PROFILES ||--o{ AUCTIONS          : "seller_id → manages auctions"
    PROFILES ||--o{ BIDS              : "bidder_id → places bids"
    PROFILES ||--o{ TRANSACTIONS      : "buyer_id / seller_id → parties"
    PROFILES ||--o{ NOTIFICATIONS     : "user_id → receives alerts"
    PROFILES ||--o{ WATCHLIST_FOLDERS : "user_id → owns folders"
    PROFILES ||--o{ WATCHLIST         : "user_id → saves items"
    PROFILES ||--o{ CERTIFICATES      : "seller_id → uploads certs"
    PROFILES ||--o{ REVIEWS           : "reviewer_id → writes reviews"
    PROFILES ||--o{ REVIEWS           : "seller_id → receives reviews"
    PROFILES ||--o|  CERTIFICATES     : "verified_by → admin approves"
    PROFILES ||--o|  AUCTIONS         : "winner_id → won auction"

    %% ── Category hierarchy ─────────────────────────────────────────
    CATEGORIES ||--o{ CATEGORIES : "parent_id → subcategory"
    CATEGORIES ||--o{ GEMS       : "category_id → categorizes gem"

    %% ── Gem relationships ──────────────────────────────────────────
    GEMS ||--o| AUCTIONS      : "gem_id → one active auction"
    GEMS ||--o{ TRANSACTIONS  : "gem_id → sold via"
    GEMS ||--o| CERTIFICATES  : "gem_id → one certificate"

    %% ── Auction relationships ──────────────────────────────────────
    AUCTIONS ||--o{ BIDS         : "auction_id → receives bids"
    AUCTIONS ||--o{ WATCHLIST    : "auction_id → tracked by users"
    AUCTIONS ||--o{ TRANSACTIONS : "auction_id → results in sale"

    %% ── Watchlist folder grouping ──────────────────────────────────
    WATCHLIST_FOLDERS ||--o{ WATCHLIST : "folder_id → groups saved items"

    %% ── Review requires completed transaction ──────────────────────
    TRANSACTIONS ||--o{ REVIEWS : "transaction_id → enables review"

    %% ═══════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS
    %% ═══════════════════════════════════════════════════════════════

    PROFILES {
        uuid    id          PK  "FK → auth.users(id)"
        string  email
        string  full_name
        string  avatar_url
        string  role            "admin | seller | buyer"
        boolean is_verified
        datetime created_at
    }

    CATEGORIES {
        uuid   id        PK
        string name
        string slug
        string description
        uuid   parent_id FK     "self-ref → parent category"
    }

    GEMS {
        uuid    id              PK
        uuid    seller_id       FK  "→ profiles"
        uuid    category_id     FK  "→ categories"
        string  title
        string  description
        float   carat_weight
        string  color
        string  clarity             "IF | VVS1 | VVS2 | VS1 | VS2 | SI1 | SI2 | I1"
        string  cut                 "Round | Oval | Cushion | ..."
        string  origin              "Sri Lanka | Myanmar | ..."
        string  treatment           "None | Heat Treated | Fracture Filled | Irradiation"
        string  certification
        string  image_url
        string  listing_type        "auction | direct_sell"
        string  status              "draft | listed | in_auction | sold"
        float   buy_now_price
        float   predicted_price     "From ML model"
        datetime created_at
    }

    AUCTIONS {
        uuid     id                PK
        uuid     gem_id            FK  "→ gems (UNIQUE)"
        uuid     seller_id         FK  "→ profiles"
        float    starting_price
        float    reserve_price
        float    current_price
        float    min_bid_increment
        datetime start_time
        datetime end_time
        string   status               "scheduled | active | completed | cancelled | reserve_not_met"
        uuid     winner_id         FK  "→ profiles"
        int      bid_count
        datetime created_at
    }

    BIDS {
        uuid     id          PK
        uuid     auction_id  FK  "→ auctions"
        uuid     bidder_id   FK  "→ profiles"
        float    amount
        boolean  is_winning
        datetime created_at      "immutable — no updates allowed"
    }

    TRANSACTIONS {
        uuid     id                PK
        uuid     auction_id        FK  "→ auctions (nullable for direct_sell)"
        uuid     gem_id            FK  "→ gems"
        uuid     buyer_id          FK  "→ profiles"
        uuid     seller_id         FK  "→ profiles"
        float    amount
        string   type                  "auction_win | buy_now"
        string   status                "pending | completed | disputed | refunded"
        string   payment_reference
        datetime created_at
    }

    NOTIFICATIONS {
        uuid     id          PK
        uuid     user_id     FK  "→ profiles"
        string   type            "outbid | auction_won | auction_ending | new_bid | auction_cancelled"
        string   title
        string   message
        json     data            "JSONB extra context (auction_id, amount, etc.)"
        boolean  is_read
        datetime created_at
    }

    WATCHLIST_FOLDERS {
        uuid     id          PK
        uuid     user_id     FK  "→ profiles"
        string   name            "e.g. Sapphires I Want, Gifts"
        datetime created_at
        datetime updated_at
    }

    WATCHLIST {
        uuid     id          PK
        uuid     user_id     FK  "→ profiles"
        uuid     auction_id  FK  "→ auctions"
        uuid     folder_id   FK  "→ watchlist_folders (nullable)"
        datetime created_at
    }

    CERTIFICATES {
        uuid     id                 PK
        uuid     gem_id             FK  "→ gems (UNIQUE — one cert per gem)"
        uuid     seller_id          FK  "→ profiles"
        string   certificate_number
        string   issued_by              "GIA | AGS | IGI | GRS | GIT | GGTL | Other"
        date     issued_date
        string   document_url           "Supabase Storage URL"
        string   status                 "pending | verified | rejected"
        uuid     verified_by        FK  "→ profiles (admin who acted)"
        datetime verified_at
        string   notes                  "Admin rejection reason or remarks"
        datetime created_at
        datetime updated_at
    }

    REVIEWS {
        uuid     id             PK
        uuid     reviewer_id    FK  "→ profiles (buyer)"
        uuid     seller_id      FK  "→ profiles"
        uuid     transaction_id FK  "→ transactions (UNIQUE per reviewer — post-purchase gate)"
        int      rating             "1 – 5"
        string   comment
        datetime created_at
        datetime updated_at
    }
```

---

## Key Constraints & Business Rules

| Rule | Enforced By |
|---|---|
| One active auction per gem | `UNIQUE(gem_id)` on `auctions` |
| One certificate per gem | `UNIQUE INDEX` on `certificates(gem_id)` |
| One review per buyer per transaction | `UNIQUE(reviewer_id, transaction_id)` on `reviews` |
| Buyer cannot review themselves | `CHECK (reviewer_id != seller_id)` on `reviews` |
| Seller cannot bid on own auction | Enforced inside `place_bid()` RPC |
| Bids are immutable (audit log) | `no_update_bids` rule on `bids` |
| Bid must exceed current price + increment | Validated inside `place_bid()` RPC |
| Certificate editable only while `pending` | RLS UPDATE policy on `certificates` |
| Review editable only within 7 days | RLS UPDATE policy on `reviews` |
| `treatment` column in gems feeds AI predictor | `CHECK` constraint on allowed values |