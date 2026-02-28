# User Roles & Use Case Diagrams

The platform serves three primary authenticated roles, alongside guest users.

## Role Capabilities

```mermaid
flowchart LR
    subgraph Actors
        G((Guest))
        B((Buyer))
        S((Seller))
        A((Admin))
    end
    
    subgraph System Features
        V_Gems(View Gems & Auctions)
        Predict(Predict Gem AI Price)
        Reg(Register Account)
        Bid(Place Bids)
        Watchlist(Manage Watchlist)
        Review(Submit Seller Reviews)
        ListGem(Create Listing / Direct Sell)
        StartAuc(Schedule Auctions)
        Cert(Upload Certificates)
        Manage(Manage Users & Disputes)
        ApproveCert(Approve Certificates)
    end
    
    %% Guest
    G --> V_Gems
    G --> Reg
    
    %% Buyer
    B --> V_Gems
    B --> Predict
    B --> Bid
    B --> Watchlist
    B --> Review
    
    %% Seller (inherits buyer)
    S --> V_Gems
    S --> Predict
    S --> Bid
    S --> Watchlist
    S --> Review
    S --> ListGem
    S --> StartAuc
    S --> Cert
    
    %% Admin (inherits buyer)
    A --> V_Gems
    A --> Manage
    A --> ApproveCert
```

## Key Workflows

### 1. Gem Listing & AI Prediction Workflow
1. **Seller** initiates a new Listing.
2. Seller inputs Carat, Cut, Clarity, Origin.
3. Seller clicks **"AI Prediction"**.
4. System queries Python ML Microservice.
5. System displays Predicted $ Price + SHAP visualization.
6. Seller sets "Starting Price" based on AI logic.
7. Seller publishes Gem to active Auction.

### 2. Live Bidding Workflow
1. **Buyer** navigates to an Active Auction.
2. Realtime WebSocket connects.
3. Buyer submits Bid.
4. Express Backend routes request to **Postgres RPC Function**.
5. Postgres performs Atomic check (Bid > Current Price + Increment).
6. Bid is saved.
7. Postgres trigger updates Auction `current_price` and `bid_count`.
8. Supabase Realtime pushes new price to all connected clients instantly.
