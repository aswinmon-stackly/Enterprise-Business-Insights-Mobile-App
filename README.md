# Enterprise Business Insights

React Native (Expo + TypeScript) mobile app, FastAPI backend, PostgreSQL database.

```
.
├── frontend/                 Expo / React Native app
│   └── src/ components/ screens/ navigation/ hooks/ services/ types/ utils/ theme/ config/
├── backend/                  FastAPI app
│   ├── app/
│   │   ├── main.py           app, CORS, lifespan, /health
│   │   ├── config.py         settings (DATABASE_URL via .env)
│   │   ├── routers/          HTTP layer
│   │   ├── schemas/          Pydantic response models (the API contract)
│   │   ├── services/         business rules (periods, % change, target progress)
│   │   ├── repositories/     all SQL (SQLAlchemy queries)
│   │   ├── models/           SQLAlchemy tables
│   │   ├── db/               engine/session, seed script
│   │   └── utils/
│   └── tests/
└── docker-compose.yml        PostgreSQL 16
```

## 1. Database (PostgreSQL)
**Option A: Docker**
```powershell
docker compose up -d
```
**Option B: local PostgreSQL** (installer or pgAdmin): create a database named `business_insights`, then set your own user/password in `backend/.env`.

## 2. Backend (Python 3.10+)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env                # edit DATABASE_URL if your credentials differ
python -m app.db.seed                 # creates tables + demo data (use --reset to re-seed)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Swagger: http://localhost:8000/docs
- `GET /api/dashboard`, `GET /health`, `GET /health/db`
- Tests (no PostgreSQL needed, uses in-memory SQLite): `pip install -r requirements-dev.txt` then `pytest`

`--host 0.0.0.0` lets a phone on the same Wi-Fi reach the API. On Windows, allow Python through the firewall (private networks).

## 3. Frontend
```powershell
cd frontend
npm install
npx expo start -c
```
Scan the QR in Expo Go (same Wi-Fi) or press `w` for the browser. The API URL is detected from the machine serving Expo (`http://<pc-ip>:8000`). Override via `frontend/.env` (`EXPO_PUBLIC_API_URL`, see `.env.example`).

## Database schema
| Table | Purpose |
|---|---|
| `categories`, `customers` | reference data (customers have a region) |
| `orders` | amount, cost, status (`delivered/pending/cancelled`), category, customer, `created_at` |
| `sales_targets` | monthly sales target |
| `activities` | recent business events |
| `alerts` | notifications (`is_read` drives the unread badge) |
| `users` | profile shown in the header |

Dashboard numbers are **computed with SQL aggregates** (nothing is stored pre-calculated):
- KPIs = last 30 days vs the previous 30 days (`SUM`, `COUNT`, `COUNT DISTINCT`), % change derived from both
- revenue trend = last 7 days, `GROUP BY date`, zero-filled
- top category = `JOIN categories ... GROUP BY name ORDER BY SUM(amount) DESC`
- target achieved = revenue / `sales_targets.amount`; fulfilment = delivered / orders (cancelled orders excluded)

Periods are anchored on the latest order, so the demo data always fills the window. Re-run `python -m app.db.seed --reset` to regenerate.

## Data flow
```
DashboardScreen -> useDashboardData -> dashboardService -> apiClient (fetch)
  -> GET /api/dashboard
  -> router (Depends(get_db)) -> dashboard_service (business rules)
  -> dashboard_repository (SQLAlchemy) -> PostgreSQL
  -> DashboardResponse (Pydantic validation, camelCase JSON)
  -> mapDashboard() -> reusable components
```
A database failure returns `503` with a generic message; the app shows its friendly error + Retry (raw errors stay in server logs).

## Notes
- Tables are created on startup via `create_all` (dev convenience). Use Alembic migrations before production.
- Authentication and per-user data are the next step; today there is a single demo user.
- The Analytics tab still uses local mock data.
