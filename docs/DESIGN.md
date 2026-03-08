# Garage Sale Marketplace — Consolidated System Design

## 1. Product Vision

A **hyper-local marketplace** for garage sales and yard sales. Sellers create a **sale event** (representing a physical garage sale at a location and time), add multiple items to it with photos, and set pricing rules including automatic price decay over the sale's duration. Buyers discover sales and items on a **map-first interface**, claim items with a hold/payment via Stripe, and pick them up in person using a confirmation token.

The platform is **not** a general classified ads board. It is purpose-built for the garage sale use case: ephemeral, location-anchored, multi-item, time-bounded sale events.

---

## 2. Core Domain Concepts

| Concept | Description |
|---------|-------------|
| **User** | A registered account. Can be a seller, buyer, or both. Has a trust score. |
| **Sale** | A garage sale event at a specific location and time window. Owned by a seller. Contains multiple listings. |
| **Listing** | A single item for sale within a Sale. Has photos, description, starting price, minimum price, and category. Subject to automatic price decay. |
| **Transaction** | A claim on a listing by a buyer. Progresses through states: `CLAIMED → PAID → PICKUP_CONFIRMED → COMPLETED` or `CANCELLED`. |
| **Message Thread** | A conversation between a buyer and seller about a specific listing. |
| **Message** | An individual message within a thread. |
| **Review** | A post-transaction rating and comment left by a buyer about a seller. |
| **Saved Item** | A listing bookmarked by a user for later. |

### Domain Relationships

```
USER ──owns──────> SALE ──contains──> LISTING
USER ──claims────> TRANSACTION <────── LISTING
USER ──messages──> MESSAGE_THREAD <─── LISTING
USER ──saves─────> SAVED_ITEM <──────── LISTING
USER ──reviews───> REVIEW <──────────── USER (seller)
```

---

## 3. Technology Stack

### 3.1 Backend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | **Kotlin 1.9** | Concise, null-safe, excellent JVM interop |
| Framework | **Micronaut 4** | Fast startup, compile-time DI, cloud-native |
| HTTP Server | **Netty** (via Micronaut) | Non-blocking, high throughput |
| Database | **PostgreSQL 16 + PostGIS** | Mature, geospatial queries, JSONB support |
| Migrations | **Flyway** | Industry standard, simple versioned SQL files |
| ORM / Data | **Micronaut Data JDBC** | Compile-time query generation, no reflection |
| Cache / Rate Limiting | **Redis 7** (via Lettuce) | Rate limiting, session caching, WebSocket pub/sub |
| Object Storage | **AWS S3** (MinIO locally) | Image storage with presigned URLs |
| Payments | **Stripe Connect** | Marketplace splits, escrow, payouts |
| Auth | **JWT** (Auth0 java-jwt) | Stateless, access + refresh token pattern |
| Password Hashing | **BCrypt** (jBCrypt) | Industry standard |
| WebSockets | **Micronaut WebSocket** | Real-time messaging and notifications |
| Build | **Gradle 8 (Kotlin DSL)** | Standard for Kotlin/JVM projects |
| Code Quality | **Detekt** | Kotlin static analysis |
| Security Scanning | **OWASP Dependency Check** | Known vulnerability detection |

### 3.2 Frontend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Expo SDK 52 + React Native** | Single codebase for iOS, Android, Web |
| Language | **TypeScript** | Type safety |
| Navigation | **React Navigation 6** (tabs + stacks) | Standard for Expo apps |
| State Management | **Zustand** | Lightweight, simple, no boilerplate |
| Server State | **TanStack React Query** | Cache, dedup, background refresh for API calls |
| HTTP Client | **Axios** | Interceptors for auth tokens, consistent API |
| Maps | **react-native-maps** (Google Maps / Apple Maps) | Native map performance on mobile; Expo compatible |
| Image Picker | **expo-image-picker** | Multi-image selection for rapid listing creation |
| Camera | **expo-camera** | QR/token scanning for pickup confirmation |
| Push Notifications | **expo-notifications + FCM/APNs** | Real-time alerts |
| Forms | **React Hook Form** | Performant form handling |
| Testing | **Jest + React Native Testing Library** | Unit and component tests |
| E2E Testing | **Playwright** (web) / **Detox** (mobile) | End-to-end acceptance tests |

### 3.3 Infrastructure

| Layer | Technology |
|-------|-----------|
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Reverse Proxy | Nginx |
| Load Testing | k6 |
| Monitoring (future) | Prometheus + Grafana |
| Error Tracking (future) | Sentry |
| Log Aggregation (future) | Loki or ELK |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│   │ iOS App  │  │ Android  │  │ Web App  │                        │
│   │ (Expo)   │  │ (Expo)   │  │ (Expo)   │                        │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘                        │
│        └──────────────┼──────────────┘                              │
│                       │ HTTPS + WSS                                 │
└───────────────────────┼─────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────────┐
│                       ▼                                             │
│              ┌────────────────┐                                     │
│              │     Nginx      │  SSL termination, routing           │
│              │  Reverse Proxy │                                     │
│              └───────┬────────┘                                     │
│                      │                                              │
│              ┌───────▼────────┐                                     │
│              │   Micronaut    │  Kotlin Backend                     │
│              │   Application  │                                     │
│              │                │                                     │
│              │  ┌───────────┐ │                                     │
│              │  │ REST API  │ │  /api/*                             │
│              │  ├───────────┤ │                                     │
│              │  │ WebSocket │ │  /ws/*                              │
│              │  ├───────────┤ │                                     │
│              │  │ Scheduled │ │  Price decay, cleanup jobs          │
│              │  │   Jobs    │ │                                     │
│              │  └───────────┘ │                                     │
│              └──┬──┬──┬──┬───┘                                     │
│                 │  │  │  │                                          │
│    ┌────────────┘  │  │  └──────────────┐                          │
│    ▼               ▼  ▼                 ▼                          │
│ ┌──────────┐ ┌────────────┐ ┌────────┐ ┌─────────┐               │
│ │PostgreSQL│ │   Redis    │ │  S3 /  │ │ Stripe  │               │
│ │+ PostGIS │ │            │ │ MinIO  │ │ Connect │               │
│ └──────────┘ └────────────┘ └────────┘ └─────────┘               │
│   Database    Rate limits    Images     Payments                   │
│               WS pub/sub                                           │
│               Cache                                                │
│                                              Infrastructure Layer  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Backend Architecture

### 5.1 Package Structure

```
com.garagesale/
├── Application.kt                    # Entry point
├── auth/
│   ├── AuthController.kt            # POST /api/auth/register, /login, /refresh
│   ├── AuthService.kt               # Registration, login logic
│   ├── JwtService.kt                # Token generation and validation
│   └── PasswordService.kt           # BCrypt hashing
├── users/
│   ├── UserController.kt            # GET /api/users/me, PUT /api/users/me
│   ├── UserService.kt               # Profile management
│   ├── User.kt                      # Entity
│   └── UserRepository.kt            # Data access
├── sales/
│   ├── SaleController.kt            # CRUD for sale events
│   ├── SaleService.kt               # Sale lifecycle logic
│   ├── Sale.kt                      # Entity
│   └── SaleRepository.kt            # Data access
├── listings/
│   ├── ListingController.kt         # CRUD for listings within sales
│   ├── ListingService.kt            # Listing logic, price decay
│   ├── Listing.kt                   # Entity
│   ├── ListingImage.kt              # Entity
│   ├── ListingRepository.kt         # Data access (includes geo queries)
│   └── ListingImageRepository.kt    # Data access
├── transactions/
│   ├── TransactionController.kt     # Claim, confirm pickup, cancel
│   ├── TransactionService.kt        # Transaction state machine
│   ├── StripeService.kt             # Stripe payment intents, captures
│   ├── Transaction.kt               # Entity
│   └── TransactionRepository.kt     # Data access
├── messaging/
│   ├── MessageController.kt         # REST endpoints for threads/messages
│   ├── MessageService.kt            # Thread and message logic
│   ├── MessageWebSocket.kt          # Real-time message delivery
│   ├── MessageThread.kt             # Entity
│   ├── Message.kt                   # Entity
│   ├── MessageThreadRepository.kt   # Data access
│   └── MessageRepository.kt         # Data access
├── search/
│   ├── SearchController.kt          # GET /api/search (unified)
│   ├── SearchService.kt             # Full-text + geo search
│   └── MapController.kt             # GET /api/map/listings (lightweight)
├── images/
│   ├── ImageController.kt           # POST /api/images/upload
│   └── ImageStorageService.kt       # S3/MinIO presigned URL management
├── saved/
│   ├── SavedController.kt           # Save/unsave listings
│   ├── SavedItem.kt                 # Entity
│   └── SavedItemRepository.kt       # Data access
├── reviews/
│   ├── ReviewController.kt          # POST /api/reviews, GET seller reviews
│   ├── ReviewService.kt             # Review logic
│   ├── Review.kt                    # Entity
│   └── ReviewRepository.kt          # Data access
├── trust/
│   ├── TrustService.kt              # Trust score calculation and updates
│   ├── UserTrustScore.kt            # Entity
│   └── TrustScoreRepository.kt      # Data access
├── notifications/
│   ├── NotificationService.kt       # Push notification dispatch
│   └── NotificationWebSocket.kt     # Real-time notification channel
├── moderation/
│   ├── ReportController.kt          # Abuse reporting endpoints
│   ├── ReportService.kt             # Report processing
│   ├── Report.kt                    # Entity
│   └── ReportRepository.kt          # Data access
├── jobs/
│   ├── PriceDecayJob.kt             # Scheduled: updates listing prices
│   └── CleanupJob.kt                # Scheduled: archives old data
├── security/
│   ├── JwtAuthenticationFilter.kt   # HTTP filter: validates JWT on requests
│   ├── RateLimitFilter.kt           # HTTP filter: Redis-backed rate limiting
│   └── CorsFilter.kt                # CORS configuration
├── config/
│   ├── RedisConfig.kt               # Redis connection factory
│   ├── S3Config.kt                  # S3 client configuration
│   └── StripeConfig.kt              # Stripe API key configuration
└── common/
    ├── dto/                          # Request/response DTOs
    │   ├── AuthRequest.kt
    │   ├── AuthResponse.kt
    │   ├── PaginatedResponse.kt
    │   ├── SaleRequest.kt
    │   ├── ListingRequest.kt
    │   └── ...
    ├── exceptions/
    │   ├── GlobalExceptionHandler.kt # Uniform error responses
    │   ├── NotFoundException.kt
    │   ├── UnauthorizedException.kt
    │   └── BadRequestException.kt
    └── extensions/
        └── SecurityExtensions.kt    # Helper to extract user from JWT context
```

### 5.2 Layered Architecture

```
HTTP Request
     │
     ▼
┌─────────────────┐
│   Filters        │  Auth, Rate Limiting, CORS
├─────────────────┤
│   Controllers    │  Request validation, routing, response mapping
├─────────────────┤
│   Services       │  Business logic, orchestration
├─────────────────┤
│   Repositories   │  Database access (Micronaut Data JDBC)
├─────────────────┤
│   Database       │  PostgreSQL + PostGIS
└─────────────────┘
```

---

## 6. Database Schema

All tables use **UUID** primary keys. All timestamps are `TIMESTAMPTZ`. Flyway manages all migrations as versioned SQL files.

### 6.1 Core Tables

#### users
```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name  TEXT,
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_email ON users(email);
```

#### sales
```sql
CREATE TABLE sales (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id     UUID NOT NULL REFERENCES users(id),
    title         TEXT NOT NULL,
    description   TEXT,
    address       TEXT NOT NULL,
    location      GEOGRAPHY(Point, 4326) NOT NULL,
    starts_at     TIMESTAMPTZ NOT NULL,
    ends_at       TIMESTAMPTZ NOT NULL,
    status        TEXT NOT NULL DEFAULT 'DRAFT',  -- DRAFT, ACTIVE, ENDED, CANCELLED
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sales_seller ON sales(seller_id);
CREATE INDEX idx_sales_location ON sales USING GIST(location);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_dates ON sales(starts_at, ends_at);
```

#### listings
```sql
CREATE TABLE listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id         UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    starting_price  NUMERIC(10,2) NOT NULL,
    minimum_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
    current_price   NUMERIC(10,2) NOT NULL,
    category        TEXT NOT NULL,
    condition       TEXT,           -- NEW, LIKE_NEW, GOOD, FAIR, POOR
    status          TEXT NOT NULL DEFAULT 'AVAILABLE',  -- AVAILABLE, CLAIMED, SOLD, REMOVED
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listings_sale ON listings(sale_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(current_price);
```

#### listing_images
```sql
CREATE TABLE listing_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);
```

#### transactions
```sql
CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          UUID NOT NULL REFERENCES listings(id),
    buyer_id            UUID NOT NULL REFERENCES users(id),
    seller_id           UUID NOT NULL REFERENCES users(id),
    amount              NUMERIC(10,2) NOT NULL,
    platform_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'CLAIMED',
        -- CLAIMED, PAYMENT_PENDING, PAID, PICKUP_CONFIRMED, COMPLETED, CANCELLED, REFUNDED
    pickup_token        TEXT,
    stripe_payment_id   TEXT,
    claimed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at             TIMESTAMPTZ,
    confirmed_at        TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_listing ON transactions(listing_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

### 6.2 Messaging Tables

#### messaging_threads
```sql
CREATE TABLE messaging_threads (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id    UUID NOT NULL REFERENCES users(id),
    seller_id   UUID NOT NULL REFERENCES users(id),
    listing_id  UUID NOT NULL REFERENCES listings(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_threads_buyer ON messaging_threads(buyer_id);
CREATE INDEX idx_threads_seller ON messaging_threads(seller_id);
CREATE INDEX idx_threads_listing ON messaging_threads(listing_id);
```

#### messages
```sql
CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id   UUID NOT NULL REFERENCES messaging_threads(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES users(id),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at     TIMESTAMPTZ
);
CREATE INDEX idx_messages_thread ON messages(thread_id);
```

### 6.3 Trust & Moderation Tables

#### user_trust_scores
```sql
CREATE TABLE user_trust_scores (
    user_id                 UUID PRIMARY KEY REFERENCES users(id),
    score                   INTEGER NOT NULL DEFAULT 50,
    successful_sales        INTEGER NOT NULL DEFAULT 0,
    successful_purchases    INTEGER NOT NULL DEFAULT 0,
    reports_received        INTEGER NOT NULL DEFAULT 0,
    reports_confirmed       INTEGER NOT NULL DEFAULT 0,
    email_verified          BOOLEAN NOT NULL DEFAULT false,
    phone_verified          BOOLEAN NOT NULL DEFAULT false,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### reviews
```sql
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id),
    reviewer_id     UUID NOT NULL REFERENCES users(id),
    seller_id       UUID NOT NULL REFERENCES users(id),
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_seller ON reviews(seller_id);
CREATE UNIQUE INDEX idx_reviews_transaction ON reviews(transaction_id);
```

#### reports
```sql
CREATE TABLE reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id   UUID NOT NULL REFERENCES users(id),
    target_type   TEXT NOT NULL,  -- USER, LISTING, MESSAGE
    target_id     UUID NOT NULL,
    reason        TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'OPEN',  -- OPEN, REVIEWED, RESOLVED, DISMISSED
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at   TIMESTAMPTZ
);
CREATE INDEX idx_reports_status ON reports(status);
```

### 6.4 User Preferences Tables

#### saved_items
```sql
CREATE TABLE saved_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    listing_id  UUID NOT NULL REFERENCES listings(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, listing_id)
);
CREATE INDEX idx_saved_items_user ON saved_items(user_id);
```

### 6.5 Migration Plan

```
db/migration/
├── V1__create_users.sql
├── V2__create_sales.sql
├── V3__create_listings.sql
├── V4__create_listing_images.sql
├── V5__create_transactions.sql
├── V6__create_messaging.sql
├── V7__create_trust_and_reviews.sql
├── V8__create_reports.sql
├── V9__create_saved_items.sql
└── V10__add_postgis_and_indexes.sql
```

---

## 7. API Design

Base URL: `/api`

All authenticated endpoints require `Authorization: Bearer <token>`.

### 7.1 Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns access + refresh tokens |
| POST | `/api/auth/refresh` | Exchange refresh token for new access token |

### 7.2 Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile (display name, avatar) |
| GET | `/api/users/{id}` | Get public profile of another user |

### 7.3 Sales

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sales` | Create a new sale event |
| GET | `/api/sales` | List current user's sales |
| GET | `/api/sales/{id}` | Get sale details with listings |
| PUT | `/api/sales/{id}` | Update sale (title, times, etc.) |
| DELETE | `/api/sales/{id}` | Cancel/delete a sale |
| POST | `/api/sales/{id}/activate` | Publish a draft sale |
| GET | `/api/sales/nearby` | Find sales near a location |

### 7.4 Listings

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sales/{saleId}/listings` | Add listing to a sale |
| GET | `/api/sales/{saleId}/listings` | List items in a sale |
| GET | `/api/listings/{id}` | Get listing detail |
| PUT | `/api/listings/{id}` | Update listing |
| DELETE | `/api/listings/{id}` | Remove listing |

### 7.5 Search & Map

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search` | Full-text search listings (`?q=bike&category=Sports&priceMin=10&priceMax=100&lat=...&lng=...&radius=10`) |
| GET | `/api/map/listings` | Lightweight listing markers for map viewport (`?north=...&south=...&east=...&west=...`) |
| GET | `/api/map/sales` | Sale event markers for map viewport |

### 7.6 Transactions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/transactions/claim` | Claim a listing (creates payment intent) |
| POST | `/api/transactions/{id}/confirm-payment` | Confirm payment succeeded (webhook-driven) |
| POST | `/api/transactions/{id}/confirm-pickup` | Seller scans pickup token |
| POST | `/api/transactions/{id}/cancel` | Cancel a transaction |
| GET | `/api/transactions` | List user's transactions (as buyer or seller) |
| GET | `/api/transactions/{id}` | Get transaction detail |

### 7.7 Messaging

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/messages/threads` | Create or get existing thread for a listing |
| GET | `/api/messages/threads` | List user's conversation threads (inbox) |
| GET | `/api/messages/threads/{id}` | Get messages in a thread |
| POST | `/api/messages/threads/{id}` | Send a message to a thread |
| WebSocket | `/ws/messages` | Real-time message delivery |

### 7.8 Images

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/images/upload` | Upload image (multipart), returns URL |
| POST | `/api/images/presign` | Get presigned upload URL (for direct-to-S3) |

### 7.9 Saved Items

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/saved/{listingId}` | Save a listing |
| DELETE | `/api/saved/{listingId}` | Unsave a listing |
| GET | `/api/saved` | Get user's saved listings |

### 7.10 Reviews

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reviews` | Leave a review (post-transaction) |
| GET | `/api/users/{id}/reviews` | Get reviews for a seller |

### 7.11 Reports

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reports` | Report a user, listing, or message |

### 7.12 Webhooks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

### 7.13 Standard Response Formats

**Success (single):**
```json
{ "data": { ... } }
```

**Success (paginated):**
```json
{
  "data": [ ... ],
  "page": 0,
  "size": 20,
  "totalElements": 124,
  "totalPages": 7
}
```

**Error:**
```json
{
  "error": "NOT_FOUND",
  "message": "Listing not found",
  "status": 404
}
```

### 7.14 Rate Limits

| Endpoint Group | Limit |
|---------------|-------|
| Auth (login/register) | 10/minute |
| Listing creation | 30/hour |
| Message sending | 60/minute |
| Image upload | 20/minute |
| General API | 100/minute |

---

## 8. Key Business Logic

### 8.1 Price Decay

Listings can have automatic price reduction over the sale's duration.

```
decay_rate = (starting_price - minimum_price) / sale_duration_hours

current_price = max(
    minimum_price,
    starting_price - (decay_rate × hours_elapsed)
)
```

A **scheduled job** runs every 5 minutes, recalculating `current_price` for all listings in active sales. Price changes trigger notifications to users who saved that listing.

### 8.2 Transaction State Machine

```
                    ┌──────────┐
                    │ CLAIMED  │
                    └────┬─────┘
                         │ Stripe PaymentIntent created
                         ▼
               ┌──────────────────┐
               │ PAYMENT_PENDING  │
               └────┬────────┬───┘
        Payment OK  │        │  Payment failed / timeout
                    ▼        ▼
              ┌──────┐   ┌───────────┐
              │ PAID │   │ CANCELLED │
              └──┬───┘   └───────────┘
                 │ Seller confirms pickup
                 ▼
        ┌──────────────────┐
        │ PICKUP_CONFIRMED │
        └────────┬─────────┘
                 │ Payment captured
                 ▼
           ┌───────────┐
           │ COMPLETED │
           └───────────┘
```

### 8.3 Pickup Token Flow

1. Buyer claims item → backend generates a unique pickup token (short alphanumeric code + QR)
2. Buyer shows token at pickup
3. Seller scans/enters token via the app → `POST /api/transactions/{id}/confirm-pickup`
4. Backend validates token, captures Stripe payment, marks transaction COMPLETED
5. Trust scores updated for both parties

### 8.4 Location Privacy

- Listing locations inherit from their parent Sale's location
- Public map display applies **random jitter** of up to 100m to the sale location
- Exact address is revealed to the buyer **only after payment** (in the transaction detail)
- Sale address is stored but never included in search/map API responses

### 8.5 Search

- **Text search**: PostgreSQL `tsvector` full-text search on `listings.title` and `listings.description`
- **Geo search**: PostGIS `ST_DWithin` for radius queries on `sales.location`
- **Filters**: category, price range, condition, sale status
- **Sorting**: distance, price (asc/desc), newest, ending soon

---

## 9. Frontend Architecture

### 9.1 Screen Structure

```
Tab Navigator
├── Home Tab
│   ├── HomeScreen (feed of nearby sales + trending listings)
│   └── SaleDetailScreen (sale info + listing grid)
│       └── ListingDetailScreen (photos, price, claim button)
│           └── ClaimScreen (payment flow)
├── Map Tab
│   └── MapScreen (map with sale/listing markers)
│       └── SaleDetailScreen → ListingDetailScreen
├── Create Sale Tab
│   ├── CreateSaleScreen (sale event form: title, location, times)
│   └── AddListingsScreen (rapid multi-item photo + price entry)
├── Saved Tab
│   └── SavedScreen (bookmarked listings)
│       └── ListingDetailScreen
├── Profile Tab
    ├── ProfileScreen (user info, stats, settings)
    ├── MySalesScreen (manage active/past sales)
    ├── MyTransactionsScreen (purchases + sales as seller)
    ├── InboxScreen (message threads)
    │   └── ChatScreen (individual conversation)
    └── SettingsScreen

Auth Stack (unauthenticated)
├── LoginScreen
└── RegisterScreen
```

### 9.2 State Management

| Store | Contents |
|-------|----------|
| `useAuthStore` (Zustand) | User session, tokens, login/logout |
| `useLocationStore` (Zustand) | Device GPS, selected search location |
| React Query | All server data: sales, listings, messages, etc. |

### 9.3 API Client

```typescript
// services/api.ts
const api = axios.create({ baseURL: API_BASE_URL });

// Request interceptor adds Bearer token
// Response interceptor handles 401 → refresh token → retry
```

### 9.4 Real-time

- WebSocket connection established on login
- Receives: new messages, transaction status changes, price drop alerts
- Zustand store for unread counts / notification badges

---

## 10. Security

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT access tokens (15min) + refresh tokens (7d) |
| Password storage | BCrypt with cost factor 12 |
| API authorization | Filter checks JWT on all `/api/*` except auth endpoints |
| Rate limiting | Redis sliding window, per-IP and per-user |
| Input validation | Micronaut bean validation on all DTOs |
| SQL injection | Parameterized queries via Micronaut Data |
| XSS | No server-side HTML rendering; JSON-only API |
| CORS | Restricted to known frontend origins |
| File uploads | Type validation, size limits (10MB), virus scan (future) |
| Secrets | Environment variables, never in code or config files |
| Stripe webhooks | Signature verification on all webhook payloads |
| Location privacy | Jitter on public coordinates; exact address post-payment only |

---

## 11. Testing Strategy

### 11.1 Backend

| Level | Tool | Scope |
|-------|------|-------|
| Unit | JUnit 5 + Mockk | Services, business logic, price decay, trust scoring |
| Repository | Testcontainers (PostgreSQL + PostGIS) | Query correctness, migration validation |
| Integration | Micronaut Test + Testcontainers | Full request/response through controllers |
| Security | Micronaut Test | Auth filter, rate limiting, authorization |

### 11.2 Frontend

| Level | Tool | Scope |
|-------|------|-------|
| Unit | Jest | Zustand stores, utility functions |
| Component | Jest + RNTL | Screen rendering, user interactions |
| E2E (Web) | Playwright | Full user flows on web build |

### 11.3 Acceptance Tests (End-to-End Scenarios)

1. **New seller flow**: Register → Create sale → Add 3 listings with photos → Activate sale → Verify appears on map
2. **Buyer discovery flow**: Open map → Browse nearby → View sale → View listing → Save listing
3. **Purchase flow**: Claim listing → Complete payment → Receive pickup token → Seller confirms → Transaction complete
4. **Messaging flow**: Buyer asks question about listing → Seller replies → Real-time delivery
5. **Price decay flow**: Create sale with 4hr duration → Verify prices decrease over time → Verify minimum price floor
6. **Trust flow**: Complete transaction → Leave review → Verify trust score updated

### 11.4 Load Testing

k6 scripts simulating:
- 100 concurrent users browsing map
- 50 concurrent searches
- 20 concurrent transactions

---

## 12. Local Development

### 12.1 Prerequisites

- Java 21 (Temurin)
- Node.js 20+
- Docker & Docker Compose
- Expo CLI (`npx expo`)

### 12.2 docker-compose.yml Services

| Service | Image | Ports |
|---------|-------|-------|
| `db` | `postgis/postgis:16-3.4` | 5432 |
| `redis` | `redis:7-alpine` | 6379 |
| `minio` | `minio/minio` | 9000, 9001 |

### 12.3 Build & Run

```bash
# Start infrastructure
docker compose up -d

# Backend
cd backend
./gradlew run            # Dev server at http://localhost:8080

# Frontend
cd mobile-web
npm install
npx expo start           # Expo dev server

# Tests
cd backend && ./gradlew test
cd mobile-web && npm test
npx playwright test      # E2E (web)
```

---

## 13. Production Deployment Recommendations

### 13.1 Architecture

```
Internet
    │
    ▼
┌──────────────────┐
│  Load Balancer   │  (AWS ALB / Cloud Load Balancer)
│  SSL Termination │
└──────┬───────────┘
       │
       ├── /api/* ──────────► Backend Container Cluster
       │                      (ECS Fargate / Cloud Run / K8s)
       │                      2+ replicas, auto-scaling
       │
       └── /* ──────────────► CDN / Static Hosting
                              (CloudFront + S3 / Vercel)
                              Expo web build

Backend connects to:
  ├── RDS PostgreSQL (Multi-AZ) with PostGIS
  ├── ElastiCache Redis (cluster mode)
  ├── S3 bucket (images, with CloudFront CDN)
  └── Stripe Connect (external)
```

### 13.2 Key Recommendations

| Concern | Recommendation |
|---------|---------------|
| Database | AWS RDS PostgreSQL with PostGIS, Multi-AZ, automated backups |
| Redis | AWS ElastiCache or managed Redis, for rate limits + WS pub/sub |
| Images | S3 + CloudFront CDN, presigned uploads from client |
| Backend scaling | Stateless containers, 2+ replicas behind load balancer |
| Mobile apps | Expo EAS Build for iOS/Android app store submissions |
| Web app | `expo export:web` deployed to CDN (Vercel, CloudFront+S3) |
| Secrets | AWS Secrets Manager or environment variables via container platform |
| Monitoring | Prometheus metrics from Micronaut, Grafana dashboards |
| Error tracking | Sentry for both backend (JVM) and frontend (React Native) |
| Logging | Structured JSON logs → CloudWatch / Loki |
| CI/CD | GitHub Actions: test → build Docker image → push to ECR → deploy |

---

## 14. Project Directory Structure (Final)

```
garage-sale/
├── backend/
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   ├── gradle.properties
│   ├── Dockerfile
│   ├── gradlew / gradlew.bat
│   └── src/
│       ├── main/
│       │   ├── kotlin/com/garagesale/  (see §5.1)
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-prod.yml
│       │       └── db/migration/       (Flyway SQL files)
│       └── test/
│           └── kotlin/com/garagesale/  (mirrors main structure)
├── mobile-web/
│   ├── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── app/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── navigation/
│   └── __tests__/
├── tests/
│   ├── e2e/           (Playwright specs)
│   └── load/          (k6 scripts)
├── deploy/
│   └── nginx/nginx.conf
├── .github/
│   └── workflows/ci.yml
├── docker-compose.yml
└── README.md
```

---

## 15. Implementation Phases

### Phase 1 — Foundation (MVP)
- Auth (register, login, JWT)
- Users (profile)
- Sales CRUD
- Listings CRUD (within sales)
- Image upload
- Map display with sales/listings
- Search (text + geo + filters)
- Saved items
- Full test suite for above

### Phase 2 — Transactions
- Stripe Connect integration
- Transaction state machine (claim → pay → pickup → complete)
- Pickup token generation and verification
- Price decay scheduled job
- Transaction history

### Phase 3 — Communication
- Messaging (threads, messages, WebSocket delivery)
- Push notifications (price drops, messages, transaction updates)
- Reviews and ratings

### Phase 4 — Trust & Safety
- Trust scoring system
- Abuse reporting
- Location privacy (jitter)
- Moderation tools
- Enhanced rate limiting

### Phase 5 — Production Hardening
- Production Docker builds
- CI/CD pipeline
- Load testing
- Monitoring and alerting
- Documentation
