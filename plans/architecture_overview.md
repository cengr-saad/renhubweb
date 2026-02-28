# RentFlow System Architecture

## Overview
RentFlow is a peer-to-peer rental marketplace platform consisting of a React Native (Expo) mobile application and a Supabase backend.

## System Components

### 1. Mobile App (Frontend)
- **Framework:** React Native with Expo.
- **Language:** TypeScript.
- **Navigation:** React Navigation (Native Stack + Bottom Tabs).
- **State Management:** React Context (Auth, Favorites).
- **Styling:** Custom theme based on colors and UI components.
- **Backend Integration:** `@supabase/supabase-js`.

### 2. Supabase (Backend-as-a-Service)
- **Database:** PostgreSQL.
- **Authentication:** Supabase Auth (integrated with `users` table).
- **Realtime:** Postgres Changes for listings, requests, and chat.
- **Storage:** Supabase Storage for listing images and avatars.
- **Logic:** PL/pgSQL functions and RPCs for state transitions.

## Data Schema

```mermaid
erDiagram
    USERS ||--o{ LISTINGS : owns
    USERS ||--o{ RENT_REQUESTS : makes_as_renter
    USERS ||--o{ RENT_REQUESTS : receives_as_owner
    LISTINGS ||--o{ RENT_REQUESTS : has
    RENT_REQUESTS ||--o{ PAYMENT_SCHEDULES : generates
    RENT_REQUESTS ||--o{ REVIEWS : has
    USERS ||--o{ CONVERSATIONS : participates
    CONVERSATIONS ||--o{ MESSAGES : contains
    USERS ||--o{ NOTIFICATIONS : receives

    USERS {
        uuid id PK
        string email
        string full_name
        string phone
        string avatar_url
        boolean is_verified
        decimal rating
    }

    LISTINGS {
        uuid id PK
        uuid user_id FK
        string title
        string description
        string category
        string location
        string[] images
        decimal price_daily
        string[] allowed_durations
        boolean is_recurring
        enum status
    }

    RENT_REQUESTS {
        uuid id PK
        uuid listing_id FK
        uuid renter_id FK
        uuid owner_id FK
        enum status
        timestamp start_date_time
        timestamp end_date_time
        decimal total_amount
        string transaction_id
    }
```

## Core Workflows

### 1. Rental Lifecycle (State Machine)
The system uses a robust state machine for rental requests:
- **PENDING**: Initial state when a renter makes a request.
- **ACCEPTED**: Owner approves the request.
- **HANDOVER_PENDING**: Renter confirms payment and item pickup.
- **LIVE**: Owner confirms handover; rental is active.
- **RETURN_PENDING**: Renter or Owner requests return.
- **COMPLETED**: Return approved; security deposit handled.

### 2. Security & Policies
- **Row Level Security (RLS)**: Enforced on all tables. Users can only see their own requests/messages.
- **RPC Functions**: `transition_request_status` ensures state transitions are valid and authorized based on roles (renter vs. owner).

## Next Steps Plan
1. **Feature Implementation**: Enhance the handover process with image verification.
2. **UI/UX**: Refine the search and filtering experience.
3. **Robustness**: Add more comprehensive error handling for network-unstable environments.
