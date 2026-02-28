# System Architecture & Data Flow

This document details the high-level system components, integrations, and request lifecycle for the platform.

## High-Level System Diagram

```mermaid
flowchart TD
    Client[React + Vite + Three.js Client]
    
    subgraph Backend_Infrastructure [Backend Infrastructure]
        API[Express.js Node Backend]
        Redis[Redis / BullMQ]
        AI[Python FastApi ML Microservice]
    end
    
    subgraph Supabase_Ecosystem [Supabase Ecosystem]
        DB[(PostgreSQL DB)]
        Storage[Storage Buckets]
        Realtime[Realtime WS]
        Auth[Supabase Auth]
    end
    
    %% Client Connections
    Client -- "REST API (JSON)" --> API
    Client -- "WebSocket (Bids/Status)" --> Realtime
    Client -- "Login / OAuth" --> Auth
    Client -- "Fetch/Upload Images" --> Storage
    
    %% Backend Connections
    API -- "CRUD & Atomic RPCs" --> DB
    API -- "Background Jobs" --> Redis
    API -- "Gem Data" --> AI
    
    %% Redis Workers
    Redis -- "Updates Auction Endings" --> DB
    
    %% Internal Supabase
    Realtime -. "Listens to" .-> DB
    Auth -. "Triggers Profile Creation" .-> DB
```

## Request Lifecycle (Backend Data Flow)

To ensure clean code and strict separation of concerns, every API request in the Express application flows through the following pipeline:

```mermaid
flowchart LR
    Req((HTTP Request)) --> Route[1. Routes]
    Route --> AuthMW[2. Auth Middleware]
    AuthMW --> RBAC[3. RBAC Middleware]
    RBAC --> Validate[4. Data Validation]
    Validate --> Controller[5. Controller]
    Controller --> Service[6. Service Logic]
    Service --> Repos[7. Repository]
    Repos --> DB[(Supabase Postgres)]
    
    DB --> Repos
    Repos --> Service
    Service --> Controller
    Controller --> Res((HTTP Response))
```

### Layer Responsibilities:
1. **Routes:** Maps URL paths and HTTP verbs to specific controllers. Applies middlewares.
2. **Auth Middleware:** Verifies Supabase JWT tokens via `service_role` checks.
3. **RBAC Middleware:** Checks the `req.user.role` (e.g., `role_guard('admin', 'seller')`).
4. **Validation:** Runs Zod schema validations on `req.body` and `req.params`.
5. **Controller:** Extracts data from the request, passes it to the Service, and formats the response using standard `apiResponse` utility. Contains **no business logic**.
6. **Service:** Contains all business rules (e.g., checking if an auction is active before placing a bid).
7. **Repository:** Thin wrapper over the Supabase query builder (e.g., `.from('gems').select()`); Abstracts database complexity from the service layer.
