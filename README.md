# 🏷️ Box Drop Marketplace

A **hyper-local marketplace** for garage sales and yard sales. Sellers create sale events at a physical location and time, add multiple items with photos and automatic price decay, and buyers discover sales on a map-first interface — claiming items with Stripe payments and picking them up in person.

## Architecture Overview

- **Backend:** Micronaut 4 + Kotlin — stateless REST API with WebSocket support, running on Netty
- **Frontend:** Expo SDK 52 + React Native + TypeScript — single codebase for iOS, Android, and Web
- **Database:** PostgreSQL 16 + PostGIS — geospatial queries for map-based discovery
- **Cache:** Redis 7 — rate limiting, WebSocket pub/sub, session caching
- **Object Storage:** AWS S3 (MinIO locally) — image storage with presigned URLs
- **Payments:** Stripe Connect — marketplace splits, escrow, payouts

## Prerequisites

| Tool | Version |
| --- | --- |
| Java | 21 (Temurin) |
| Node.js | 20+ |
| Docker & Docker Compose | Latest |
| Expo CLI | `npx expo` |

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/garage-sale.git
cd garage-sale

# 2. Start infrastructure (Postgres, Redis, MinIO)
docker compose up -d

# 3. Start the backend (runs on http://localhost:8080)
cd backend
./gradlew run

# 4. Start the frontend (Expo dev server)
cd ../mobile-web
npm install
npx expo start
```

## Seed Test Data

To populate the database with sample sales and listings near Fredericktown, MO:

```bash
docker exec -i boxdrop-db-1 psql -U postgres -d boxdrop < scripts/seed_test_sales.sql
```

This creates 5 test seller accounts (password: `password123`), 5 active sales at different locations, and 13 listings across those sales. The script is idempotent for users (uses `ON CONFLICT DO NOTHING`), but will fail if sales/listings with the same IDs already exist — delete them first or drop and recreate the database.

## Project Structure

```
garage-sale/
├── backend/                  # Micronaut + Kotlin API
│   ├── build.gradle.kts
│   ├── Dockerfile
│   └── src/
│       ├── main/
│       │   ├── kotlin/com/garagesale/
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/     # Flyway SQL files
│       └── test/
├── mobile-web/               # Expo + React Native frontend
│   ├── App.tsx
│   ├── package.json
│   └── app/
│       ├── screens/
│       ├── components/
│       ├── stores/           # Zustand state
│       ├── services/         # API client (Axios)
│       ├── hooks/
│       ├── types/
│       └── navigation/
├── tests/
│   ├── e2e/                  # Playwright E2E specs
│   └── load/                 # k6 load test scripts
├── deploy/
│   └── nginx/nginx.conf
├── .github/
│   └── workflows/ci.yml
├── docker-compose.yml
└── README.md
```

## Backend

### Run

```bash
cd backend
./gradlew run
```

The API starts at `http://localhost:8080`. Key endpoints:

| Endpoint | Description |
| --- | --- |
| `POST /api/auth/register` | Register a new user |
| `POST /api/auth/login` | Login, returns JWT tokens |
| `GET /api/sales/nearby` | Browse sales by location |
| `GET /api/search` | Unified text + geo search |
| `POST /api/sales` | Create a sale event |
| `POST /api/sales/{id}/listings` | Add a listing to a sale |
| `POST /api/images/upload` | Upload images (presigned URL) |

### Test

```bash
cd backend
./gradlew test
```

### Key Technologies

- **Micronaut Data JDBC** — compile-time query generation
- **Flyway** — versioned database migrations
- **Testcontainers** — PostgreSQL + PostGIS for repository tests
- **Mockk** — mocking for unit tests
- **Detekt** — Kotlin static analysis

## Frontend

### Run

```bash
cd mobile-web
npm install
npx expo start
```

Press `w` to open in web browser, `i` for iOS simulator, `a` for Android emulator.

### Test

```bash
cd mobile-web
npm test
```

### Key Technologies

- **React Navigation 6** — tab and stack navigation
- **Zustand** — lightweight state management
- **TanStack React Query** — server state caching and synchronization
- **Axios** — HTTP client with auth interceptors
- **react-native-maps** — native map integration
- **React Hook Form** — performant form handling

## Testing

### Unit & Integration Tests

```bash
# Backend
cd backend && ./gradlew test

# Frontend
cd mobile-web && npm test
```

### E2E Tests (Playwright)

```bash
cd tests/e2e
npx playwright install
npx playwright test
```

Runs against the Expo web build at `http://localhost:8081`. The Playwright config automatically starts the Expo web server if not already running.

### Load Tests (k6)

```bash
# Install k6: https://k6.io/docs/get-started/installation/
cd tests/load

# Run against local backend
k6 run api_load_test.js

# Run against a different environment
k6 run -e BASE_URL=https://staging.example.com api_load_test.js
```

Load test scenarios (weighted):

- **40%** — Browse nearby sales (`GET /api/sales/nearby`)
- **30%** — Search listings (`GET /api/search`)
- **20%** — View sale detail (`GET /api/sales/{id}`)
- **10%** — View listing detail (`GET /api/listings/{id}`)

Thresholds: p(95) response time &lt; 500ms, error rate &lt; 1%.

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `DATASOURCES_DEFAULT_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/garagesale` |
| `DATASOURCES_DEFAULT_USERNAME` | DB username | `garagesale` |
| `DATASOURCES_DEFAULT_PASSWORD` | DB password | `garagesale` |
| `REDIS_URI` | Redis connection URI | `redis://localhost:6379` |
| `S3_ENDPOINT` | S3/MinIO endpoint | `http://localhost:9000` |
| `S3_ACCESS_KEY` | S3 access key | `minioadmin` |
| `S3_SECRET_KEY` | S3 secret key | `minioadmin` |
| `S3_BUCKET` | Image storage bucket | `garage-sale-images` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | — |
| `JWT_SECRET` | Secret for signing JWT tokens | — |

## Docker Compose Services

| Service | Image | Ports | Purpose |
| --- | --- | --- | --- |
| `db` | `postgis/postgis:16-3.4` | `5432` | PostgreSQL + PostGIS database |
| `redis` | `redis:7-alpine` | `6379` | Cache, rate limiting, pub/sub |
| `minio` | `minio/minio` | `9000`, `9001` | Local S3-compatible object storage |

## API Documentation

API documentation is available via the design document at `docs/DESIGN.md`, which includes full endpoint specifications, request/response schemas, and domain model documentation.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with tests
4. Ensure all tests pass: `./gradlew test` and `npm test`
5. Submit a pull request

Please follow existing code conventions and include tests for new functionality.

## License

MIT