# Enterprise Business Insights

React Native (Expo, TypeScript) mobile app, FastAPI backend, PostgreSQL database managed with Alembic.

```
.
├── frontend/                    Expo / React Native app
│   └── src/ components/ screens/ navigation/ hooks/ services/ types/ utils/ theme/ config/
├── backend/
│   ├── app/
│   │   ├── main.py              app, CORS, error handlers, router registration
│   │   ├── core/                config.py (env settings), business_rules.py (KPI definitions), errors.py
│   │   ├── db/                  base.py (metadata + naming convention), session.py (engine, get_db)
│   │   ├── models/              SQLAlchemy tables (persistent storage only)
│   │   ├── schemas/             Pydantic request/response models (API contract only)
│   │   ├── repositories/        all SQL
│   │   ├── services/            business rules, mapping rows -> schemas
│   │   ├── routers/             HTTP layer
│   │   └── utils/
│   ├── alembic/versions/        0001_initial_schema, 0002_add_orders_status_date_index
│   ├── alembic.ini
│   ├── scripts/seed_data.py     idempotent seed
│   ├── tests/                   pytest (SQLite by default, PostgreSQL optional)
│   ├── .env.example
│   └── requirements.txt
├── docker-compose.yml           optional local PostgreSQL
└── .env.example                 only for docker-compose
```

## 1. PostgreSQL
**Docker:** `copy .env.example .env`, set `POSTGRES_PASSWORD`, then `docker compose up -d`.
**Local install (pgAdmin / psql):** create an empty database: `CREATE DATABASE business_insights;`

## 2. Backend (Python 3.10+)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1                 
pip install -r requirements.txt
copy .env.example .env                     # then edit DATABASE_URL with YOUR user/password
alembic upgrade head                      
python -m scripts.seed_data                # inserts sample data
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
`backend/.env` (git-ignored):
```
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/business_insights
```
URL-encode special characters in the password (`@` becomes `%40`). `--host 0.0.0.0` lets a phone on the same Wi-Fi reach the API (allow Python through the Windows firewall).
Swagger UI: http://localhost:8000/docs

## 3. Frontend
```powershell
cd frontend
npm install
npx expo start -c            # Expo Go on your phone (same Wi-Fi), or press w for the browser
```
The API URL is detected from the machine serving Expo (`http://<pc-ip>:8000`); override with `EXPO_PUBLIC_API_URL` in `frontend/.env`. The app never talks to the database, only to FastAPI.

## 4. Tests
```powershell
cd backend
pip install -r requirements-dev.txt
pytest                                     # in-memory SQLite, 17 tests
$env:TEST_DATABASE_URL="postgresql+psycopg://USER:PASSWORD@localhost:5432/business_insights_test"; pytest   # PostgreSQL
```
Tests force `DATABASE_URL` to the test database, so your dev data is never touched. Use an empty database for `TEST_DATABASE_URL`: the tests create and drop tables.

---

## API
| Endpoint | Description |
|---|---|
| `GET /api/dashboard` | KPIs, analytics preview, recent activities (unchanged shape for the app; `ordersSummary.statusBreakdown` added) |
| `GET /api/orders?limit=20&offset=0&status=` | paginated orders, newest first. `limit` 1-100, `offset` ≥ 0, `status` one of pending/confirmed/shipped/delivered/cancelled/returned |
| `GET /api/customers?limit=20&offset=0&status=` | paginated customers (`active`/`inactive`) |
| `GET /api/activities?limit=10&offset=0` | recent activities, newest first (`limit` 1-50) |
| `GET /api/analytics/revenue-trend?start_date=2026-10-01&end_date=2026-10-12` | revenue per day (both dates optional; default = last 7 days) |
| `GET /health`, `GET /health/db` | liveness / database connectivity (503 if unreachable) |

List endpoints return `{ "items": [...], "total": N, "limit": L, "offset": O }`.
Revenue trend returns `{ startDate, endDate, interval: "day", totalRevenue, points: [{date, revenue}] }`. Every day in the range is present (0 when there were no sales), so an empty period has the same shape as a populated one. Invalid dates or `start_date > end_date` or a range over 366 days return `422` with a clear message.

## Business rules (`backend/app/core/business_rules.py`)
| Metric | Definition |
|---|---|
| Reporting period | last 30 days ending at the most recent order in the database, compared with the 30 days before |
| Qualifying order | status `confirmed`, `shipped` or `delivered` (pending, cancelled and returned excluded) |
| **Revenue** | `SUM(quantity × unit_price)` over qualifying order items |
| **Profit** | `SUM(quantity × (unit_price − unit_cost))`, i.e. revenue minus cost of goods sold |
| Orders | `COUNT(DISTINCT order)` among qualifying orders |
| Customers | `COUNT(DISTINCT customer)` with at least one qualifying order in the period (active customers) |
| Orders summary | every order placed in the period grouped by status (all statuses, zero-filled); fulfilment rate = delivered / orders placed |
| Top category | category with the highest revenue in the period (`JOIN order_items → products → categories`) |
| Revenue trend | revenue per day for the last 7 days; the pill compares the last 7×24h with the 7×24h before |
| Target achieved | period revenue / monthly sales target |
| Recent activities | latest rows of `activities`, `ORDER BY occurred_at DESC`; the amount of an order event comes from a JOIN to that order |

Revenue and profit differ because cost is stored: `products.unit_cost` is the catalogue cost and `order_items.unit_cost` is a snapshot taken at sale time.

## Database schema
```
categories 1───* products 1───* order_items *───1 orders *───1 customers
                                                   activities (reference_type + reference_id → order/customer/product/target)
sales_targets   users   alerts          (supporting tables for the dashboard header / badge / target bar)
```
| Table | Key columns and constraints |
|---|---|
| `categories` | `name` UNIQUE |
| `products` | `sku` UNIQUE, `category_id` FK, `unit_price` ≥ 0, `unit_cost` ≥ 0, `status` CHECK (active/discontinued) |
| `customers` | `email` UNIQUE, `registered_at`, `status` CHECK (active/inactive) |
| `orders` | `order_number` UNIQUE, `customer_id` FK, `order_date`, `status` CHECK; indexes on `order_date`, `(status, order_date)` |
| `order_items` | `order_id` FK (CASCADE), `product_id` FK, `quantity` > 0, `unit_price`, `unit_cost`, UNIQUE (`order_id`, `product_id`) |
| `activities` | `activity_type` CHECK, `description`, `reference_type`/`reference_id` (both set or both NULL), `occurred_at` indexed |

Design notes: an order's total is **not stored** (it is `SUM(quantity × unit_price)` of its items), so it can never disagree with the line items. An order's category comes from its products, so it is not duplicated either. Activity amounts are joined from the referenced order instead of copied. Statuses are `VARCHAR` + `CHECK` rather than PostgreSQL ENUM types, which keeps future migrations simple.

## Migrations (Alembic)
```powershell
cd backend
alembic upgrade head                                    # create / update the schema (existing data is kept)
alembic current                                         # which revision the database is at
alembic revision --autogenerate -m "describe change"    # after editing app/models/*, generate a migration
alembic upgrade head                                    # apply it (review the generated file first!)
alembic downgrade -1                                    # undo the last migration
alembic upgrade head --sql                              # print the SQL instead of running it
alembic check                                           # fails if models and database have drifted
```
`alembic/env.py` reads `DATABASE_URL` from the same settings as the app, and `Base.metadata` uses a naming convention so constraint names are stable. The application does **not** create tables at startup; if you forget to migrate, the API returns a safe `500` and logs the cause. `0001` creates the schema and `0002` adds the `(status, order_date)` index, as an example of an incremental change applied to an existing database.

## Seeding
`python -m scripts.seed_data [--reset] [--anchor YYYY-MM-DD]`
- Generates a deterministic dataset (fixed RNG seed): 5 categories, 20 products, 400 customers, about 2,700 orders with 1-3 items over 60 days in six statuses, and 5 activities derived from real rows.
- **No duplicates:** every record has a natural key (category name, product SKU, customer email, order number, user name, alert message, activity type + reference). The script loads the keys that already exist and inserts only the missing ones. A second run prints `Database already up to date`. The key columns also carry UNIQUE constraints as a safety net.
- Each order and its items are inserted together in one transaction.
- `--reset` deletes business rows (not tables) and seeds again.

## Error handling
| Situation | Response |
|---|---|
| PostgreSQL unreachable / connection dropped | `503` "database temporarily unavailable" (connect timeout 5 s so requests fail fast) |
| Query failure, e.g. migrations not applied | `500` "A database error occurred." |
| Empty result | `200` with `items: []` / zero-filled points / "No sales yet" category |
| Invalid `limit`, `offset`, `status`, date format | `422` (FastAPI validation) |
| `start_date` after `end_date`, range > 366 days | `422` with a readable message |

Connection strings, credentials, SQL and stack traces are logged on the server only; clients get generic messages. The mobile app maps these to a friendly error screen with Retry; loading, retry and pull-to-refresh work as in Task 2.

## Frontend integration
`DashboardScreen → useDashboardData → dashboardService → apiClient → GET /api/dashboard`. The response contract is unchanged except for one additive field, `analytics.ordersSummary.statusBreakdown`, which feeds the new "Orders by status" row (frontend types updated in `src/types/api.ts`, mapped in `dashboardMapper.ts`). The Analytics tab still uses local mock data.

## Review questions
- **How does FastAPI get a database session?** `get_db()` in `db/session.py` is a dependency: it opens a `Session` from the engine's connection pool per request and closes it afterwards; routers receive it through `Depends(get_db)`.
- **Why separate SQLAlchemy models and Pydantic schemas?** Models describe stored tables (columns, constraints, relationships); schemas describe what the API accepts and returns. Splitting them lets the database change without breaking the app, and exposes only the fields the frontend needs (e.g. no `unit_cost` or internal ids leak by accident).
- **Revenue vs profit?** See the business rules above: both come from `order_items`, profit subtracts the stored `unit_cost`.
- **How are duplicate seed records prevented?** Natural keys + "insert only the missing" + UNIQUE constraints.
- **Pagination and filters at database level?** `LIMIT/OFFSET`, `WHERE` and `GROUP BY` are in the SQLAlchemy queries (`repositories/`), plus a separate `COUNT(*)` for `total`. The trend filters `order_date >= start AND < end+1 day` in SQL and Python only fills days with no sales.
- **PostgreSQL unavailable?** SQLAlchemy raises `OperationalError`; a global handler returns `503` with a safe message and logs the cause; the app shows "Unable to reach the server" with Retry.
- **Schema changes?** Edit the models, `alembic revision --autogenerate`, review, `alembic upgrade head`; Alembic records the revision in `alembic_version` and applies only what is new.

## Submission checklist (screenshots)
1. pgAdmin: Databases → business_insights → Schemas → public → Tables, and `orders` → View/Edit Data → First 100 Rows.
2. Swagger `/docs`: `GET /api/dashboard` → Try it out → Execute (response body).
3. The mobile dashboard in Expo Go (also the Swagger responses for `/api/orders` and `/api/analytics/revenue-trend`).

## Troubleshooting
- `No module named 'psycopg2'`: your `DATABASE_URL` uses an old driver prefix. Use `postgresql+psycopg://` (the app also rewrites `postgresql://` automatically).
- `relation "orders" does not exist`: run `alembic upgrade head`.
- `connection refused` / 503: PostgreSQL is not running, or host/port in `.env` is wrong.
- `password authentication failed`: wrong user/password in `.env`.
