# RentFlow - Rental Marketplace

## Overview

RentFlow is a mobile-first P2P rental marketplace application built with React Native (Expo) and Supabase backend. Users can post and discover properties or assets for rent based on location. The platform supports multiple rental categories including houses, rooms, apartments, vehicles, land, parking, storage, offices, and shops.

## Project Structure

The project contains two parts:
- **Web app** (original): Located in root directory (React + Express + PostgreSQL via Drizzle)
- **Mobile app** (new): Located in `mobile/` directory (React Native Expo + Supabase)

## Mobile App Architecture

### Core Technologies
- **Framework**: React Native with Expo SDK 50
- **Navigation**: React Navigation (bottom tabs + native stack)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Validation**: Zod for schema validation
- **State Management**: React hooks + Supabase realtime subscriptions

### Directory Structure
```
mobile/
├── App.tsx                    # Main entry with auth state
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Tab + stack navigation
│   ├── screens/
│   │   ├── LoginScreen.tsx    # User login
│   │   ├── RegisterScreen.tsx # User registration
│   │   ├── HomeScreen.tsx     # Listings grid with categories
│   │   ├── SearchScreen.tsx   # Search functionality
│   │   ├── PostListingScreen.tsx # Create listings
│   │   ├── OrdersScreen.tsx   # Rent request management
│   │   ├── ProfileScreen.tsx  # User profile
│   │   ├── ListingDetailScreen.tsx # Listing details + booking
│   │   └── RequestDetailScreen.tsx # Request lifecycle management
│   ├── services/
│   │   ├── auth.ts            # Authentication service
│   │   ├── listings.ts        # Listings CRUD
│   │   └── requests.ts        # Rent requests + RPC calls
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client config
│   │   └── stateMachine.ts    # State transitions
│   ├── validation/
│   │   └── duration.ts        # Duration + recurring validation
│   └── types/
│       └── database.ts        # TypeScript types
└── supabase/
    └── schema.sql             # Database schema + RPC functions
```

## Key Business Logic

### Duration Constraints
- **Half Day**: 3-12 hours
- **Full Day**: 12-24 hours
- **Daily**: 2-7 days (48-168 hours)
- **Weekly**: 7-27 days (168-648 hours)
- **Monthly**: 28+ days (672+ hours)

### Recurring Payment Eligibility
Recurring payments are **only** available for:
- Daily durations
- Weekly durations
- Monthly durations

Half-day and full-day rentals do NOT support recurring payments.

### 10-State Rental Lifecycle
```
PENDING → ACCEPTED → HANDOVER_PENDING → LIVE → RETURN_PENDING → COMPLETED
         ↓                                ↓            ↓
      REJECTED                        DISPUTED    (auto 72h)
         ↓
      CANCELLED (both can cancel)
         ↓
      WITHDRAWN (renter only)
```

**State Transitions:**
- PENDING: Renter can withdraw/edit, Owner can accept/reject
- ACCEPTED: Both can cancel, Renter submits handover
- HANDOVER_PENDING: Owner approves/rejects handover
- LIVE: Both can request return, Both can dispute
- RETURN_PENDING: Both approve return, Owner can reject
- DISPUTED: Awaiting resolution
- COMPLETED: Terminal state (allows reviews)
- CANCELLED/REJECTED/WITHDRAWN: Terminal states

### Security Model
- **RLS Policies**: Row-level security on all tables
- **RPC Functions**: State transitions enforced via `transition_request_status()` function
- **Insert Validation**: Rent requests validated against listing allowed_durations
- **Recurring Constraint**: Database-level checks for recurring eligibility

## Supabase Setup

### Required Steps
1. Create a Supabase project at https://supabase.com
2. Copy the project URL and anon key
3. Run the SQL schema in `mobile/supabase/schema.sql` via SQL Editor
4. Set environment variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Database Tables
- `users`: User profiles with ratings
- `listings`: Rental listings with pricing
- `rent_requests`: Rental transactions
- `payment_schedules`: Recurring payment tracking
- `reviews`: User reviews
- `dispute_logs`: Dispute tracking

### Realtime Subscriptions
- Listings changes
- Rent request updates
- Payment schedule updates

## Environment Variables

### Mobile App (Expo)
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Web App (Legacy)
- `DATABASE_URL`: PostgreSQL connection string

## Running the Mobile App

1. Navigate to mobile directory: `cd mobile`
2. Install dependencies: `npm install`
3. Start Expo: `npx expo start`
4. Use Expo Go app to scan QR code

## User Preferences

- Simple, everyday language for communication
- Mobile-first design approach
- Production-ready security patterns
- Comprehensive validation on both client and server
