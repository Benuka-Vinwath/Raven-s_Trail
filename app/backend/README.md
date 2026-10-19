# Raven's Trail API

Express + TypeScript + PostgreSQL backend for Raven's Trail.

## Setup

1. Start PostgreSQL (any Postgres 14+ works — a quick local one via Docker):
   ```bash
   docker run -d --name ravenstrail-postgres \
     -e POSTGRES_USER=ravenstrail -e POSTGRES_PASSWORD=ravenstrail -e POSTGRES_DB=ravenstrail \
     -p 5432:5432 postgres:16-alpine
   ```
2. Copy the env file and adjust if needed:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies, migrate, and seed with the same trail/shop/parking/review data the frontend ships with:
   ```bash
   npm install
   npm run migrate
   npm run seed
   ```
4. Run the dev server (hot reload via `tsx watch`):
   ```bash
   npm run dev
   ```
   API listens on `http://localhost:4000` by default.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the API with hot reload |
| `npm run build` | Type-check and compile to `dist/` |
| `npm start` | Run the compiled build (`dist/server.js`) |
| `npm run migrate` | Apply any unapplied SQL files in `src/db/sql/` |
| `npm run seed` | Wipe and reseed trails/shops/parking/reviews with demo data |

## API

All routes are under `/api`.

**Auth**
- `POST /auth/signup` — `{ name, email, password }` → `{ user, token }`
- `POST /auth/login` — `{ email, password }` → `{ user, token }`
- `GET /auth/me` — requires `Authorization: Bearer <token>`

**Trails**
- `GET /trails?q=&difficulty=&district=&sort=rating|elevation|distance`
- `GET /trails/:slug`
- `GET /trails/:slug/reviews`
- `POST /trails/:slug/reviews` — auth required, `{ rating, text, tags? }`

**Gear shops**
- `GET /gear-shops` — all shops with their items
- `GET /gear-shops?trail=:slug` — shops serving a specific trail

**Parking**
- `GET /parking`
- `GET /parking?trail=:slug`

**Trips** (saved budget plans, auth required)
- `GET /trips` — the signed-in user's saved trips
- `POST /trips` — `{ trailSlug, hikers, days, transport, foodPerDay, gearPerDay, parkingDays }`
- `DELETE /trips/:id`

Response shapes intentionally mirror the frontend's `src/types.ts` (`Trail`, `GearShop`, `ParkingSpot`, `Review`) so wiring the React app up to this API is a drop-in replacement for `src/lib/mockData.ts`.
