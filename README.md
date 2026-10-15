# Enterprise Business Insights

A mobile business intelligence application built using **React Native (Expo, TypeScript)**, **FastAPI**, and **PostgreSQL**. The application provides real-time business insights, sales analytics, customer information, order management, and performance monitoring through a mobile-friendly interface.

---

## 1. Technology Stack

### Frontend
- React Native
- Expo
- TypeScript
- React Navigation
- React Native Safe Area Context
- Axios / Centralized API Client
- Charts and reusable UI components

### Backend
- Python 3.10+
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- Uvicorn

### Database
- PostgreSQL
- pgAdmin / psql

---

## 2. Project Structure

```text
.
├── frontend/
│   ├── App.tsx
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── AnalyticsScreen.tsx
│   │   │   ├── AlertsScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── routeConfig.tsx
│   │   │   └── types.ts
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── theme/
│   │   └── config/
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── business_rules.py
│   │   │   └── errors.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── routers/
│   │   └── utils/
│   ├── alembic/
│   │   └── versions/
│   ├── scripts/
│   │   └── seed_data.py
│   ├── tests/
│   ├── alembic.ini
│   ├── .env.example
│   └── requirements.txt
│
├── docker-compose.yml
└── .env.example
```

---

## 3. PostgreSQL Database Setup

### Option A: Docker Setup

1. Copy `.env.example` to `.env`.
2. Set the PostgreSQL password.
3. Start PostgreSQL.

```powershell
docker compose up -d
```

### Option B: Local PostgreSQL Installation

Using pgAdmin or psql, create an empty database:

```sql
CREATE DATABASE business_insights;
```

The application uses PostgreSQL as its primary database.

---

## 4. Backend Setup

### Requirements

- Python 3.10+
- PostgreSQL
- pip

### Step 1: Navigate to Backend

```powershell
cd backend
```

### Step 2: Create Virtual Environment

```powershell
python -m venv .venv
```

### Step 3: Activate Virtual Environment

```powershell
.venv\Scripts\Activate.ps1
```

### Step 4: Install Dependencies

```powershell
pip install -r requirements.txt
```

### Step 5: Configure Environment Variables

Copy the example environment file:

```powershell
copy .env.example .env
```

Update `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/business_insights
```

Replace `USER` and `PASSWORD` with your PostgreSQL credentials.

URL-encode special characters in the password. For example, `@` becomes `%40`.

### Step 6: Run Database Migrations

```powershell
alembic upgrade head
```

### Step 7: Seed Sample Data

```powershell
python -m scripts.seed_data
```

### Step 8: Start FastAPI Server

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

## 5. Frontend Setup

### Requirements

- Node.js
- npm
- Expo CLI / Expo tooling

### Step 1: Navigate to Frontend

```powershell
cd frontend
```

### Step 2: Install Dependencies

```powershell
npm install
```

### Step 3: Configure API URL

Create or update `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8000
```

For example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
```

Use your computer's local Wi-Fi IP address when testing through Expo Go on a physical phone.

### Step 4: Start Expo

```powershell
npx expo start -c
```

Scan the QR code using Expo Go.

The mobile application communicates with FastAPI through HTTP APIs. It never connects directly to PostgreSQL.

---

## 6. Mobile Application Modules

### 6.1 Dashboard Screen

The Dashboard provides an overview of the business performance.

**Features:**

- Total revenue
- Total orders
- Total customers
- Total profit
- Revenue performance preview
- Recent business activities
- Orders grouped by status
- Sales target progress

**API integration:**

```text
GET /api/dashboard
```

Dashboard data is retrieved dynamically from FastAPI and PostgreSQL.

### 6.2 Analytics Screen

The Analytics Screen provides detailed business performance insights and sales analysis.

**Features:**

**1. Reporting Period Filters**

- Today
- Last 7 Days
- Last 30 Days
- This Month
- Custom Date Range

**2. Key Performance Indicators (KPIs)**

- Total Revenue
- Total Orders
- Total Profit
- Total Customers

**3. Revenue Trend**

Displays daily revenue through a chart for the selected reporting period.

**4. Orders Summary**

Displays the number of orders grouped by status:

- Pending
- Confirmed
- Shipped
- Delivered
- Cancelled
- Returned

**5. Top Category**

Displays the product category generating the highest revenue during the selected period.

**6. Period Comparison**

Compares the selected period against the previous equivalent period:

- Revenue change percentage
- Orders change percentage
- Profit change percentage

**Backend API integration:**

```http
GET /api/analytics/overview?start_date=2026-10-01&end_date=2026-10-12
```

**Frontend integration flow:**

```text
AnalyticsScreen
      ↓
useAnalyticsData
      ↓
analyticsService
      ↓
apiClient
      ↓
FastAPI Analytics Router
      ↓
Analytics Service
      ↓
Analytics Repository
      ↓
PostgreSQL
```

**Data handling:**

- Fetches dynamic data from the backend.
- Supports reporting period filters.
- Supports custom date ranges.
- Displays loading states.
- Handles API errors.
- Supports retry functionality.
- Supports pull-to-refresh.
- Uses TypeScript response types.
- Uses reusable components and centralized API services.

**Database integration:**

Analytics calculations use existing PostgreSQL tables:

- `orders`
- `order_items`
- `customers`
- `products`
- `categories`

No additional database tables are required for Analytics.

### 6.3 Alerts Screen

The Alerts Screen provides notifications about business activities and important updates.

**Features:**

- Notification list
- Alert badge in Bottom Navigation
- Alert status indicators
- Notification details

### 6.4 Profile Screen

The Profile Screen provides user-related application information and settings.

**Features:**

- User profile information
- Account settings
- Application preferences

---

## 7. Bottom Navigation

The application uses React Navigation Bottom Tabs.

**Navigation tabs:**

1. Dashboard
2. Analytics
3. Alerts
4. Profile

**Features:**

- Active and inactive tab icons
- Selected tab background styling
- Active and inactive icon colors
- Notification badge
- Safe area support
- Reusable route configuration

The Bottom Navigation is implemented using:

```text
src/navigation/RootNavigator.tsx
src/navigation/routeConfig.tsx
src/navigation/types.ts
```

New navigation tabs can be configured through the centralized route configuration.

---

## 8. Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/health/db` | Database connectivity |
| GET | `/api/dashboard` | Dashboard KPIs and activities |
| GET | `/api/orders` | Paginated orders |
| GET | `/api/customers` | Paginated customers |
| GET | `/api/activities` | Recent business activities |
| GET | `/api/analytics/revenue-trend` | Daily revenue trend |
| GET | `/api/analytics/overview` | Analytics overview and KPIs |

### Orders API

```http
GET /api/orders?limit=20&offset=0&status=
```

Supported statuses:

- pending
- confirmed
- shipped
- delivered
- cancelled
- returned

### Customers API

```http
GET /api/customers?limit=20&offset=0&status=
```

Supported customer statuses:

- active
- inactive

### Activities API

```http
GET /api/activities?limit=10&offset=0
```

### Revenue Trend API

```http
GET /api/analytics/revenue-trend?start_date=2026-10-01&end_date=2026-10-12
```

Returns daily revenue for the selected date range.

Every date in the requested range is included, even if revenue is zero.

### Analytics Overview API

```http
GET /api/analytics/overview?start_date=2026-10-01&end_date=2026-10-12
```

Returns analytics information such as:

- Reporting period
- Total revenue
- Total orders
- Total profit
- Total customers
- Revenue trend
- Orders summary
- Top category
- Period comparisons

Date parameters are optional if supported by the backend defaults.

---

## 9. Business Rules

Business calculations are centralized in:

```text
backend/app/core/business_rules.py
```

### Qualifying Orders

Only the following order statuses are included in revenue and profit calculations:

- confirmed
- shipped
- delivered

Pending, cancelled and returned orders are excluded.

### Revenue Calculation

```text
Revenue = SUM(quantity × unit_price)
```

### Profit Calculation

```text
Profit = SUM(quantity × (unit_price − unit_cost))
```

### Total Orders

```text
COUNT(DISTINCT order_id)
```

### Active Customers

Counts distinct customers with at least one qualifying order during the reporting period.

### Orders Summary

All order statuses are grouped and zero-filled for the selected period.

### Top Category

The category with the highest revenue is identified through:

```text
order_items → products → categories
```

### Revenue Trend

Revenue is calculated daily based on qualifying orders.

### Target Achieved

```text
Target Achieved (%) = (Period Revenue / Monthly Sales Target) × 100
```

Revenue and profit are calculated separately because product costs are stored in the database.

---

## 10. Database Schema

The database contains the following main tables:

| Table | Purpose |
|---|---|
| categories | Product category information |
| products | Product details and pricing |
| customers | Customer information |
| orders | Customer orders |
| order_items | Individual order line items |
| activities | Business activity records |
| sales_targets | Sales target information |
| users | User information |
| alerts | Application notifications |

### Table Relationships

```text
categories
    |
    └── products
           |
           └── order_items
                    |
                    └── orders
                           |
                           └── customers

activities
sales_targets
users
alerts
```

### Database Constraints

**categories**
- Unique category name.

**products**
- Unique SKU.
- Foreign key to categories.
- Non-negative unit price.
- Non-negative unit cost.
- Status check: active/discontinued.

**customers**
- Unique email.
- Registration date.
- Status check: active/inactive.

**orders**
- Unique order number.
- Foreign key to customers.
- Order date.
- Status validation.
- Index on order date.
- Composite index on status and order date.

**order_items**
- Foreign key to orders with CASCADE.
- Foreign key to products.
- Positive quantity.
- Unique combination of order and product.

**activities**
- Activity type validation.
- Description.
- Reference type and reference ID.
- Indexed occurrence timestamp.

### Important Database Design Decisions

- Order totals are calculated from order items.
- Product categories are obtained through product relationships.
- Activity amounts are retrieved through references to orders.
- Product cost snapshots are stored in order items.
- PostgreSQL CHECK constraints validate supported statuses.
- Unique constraints prevent duplicate business records.

---

## 11. Alembic Database Migrations

Alembic manages database schema changes.

Migration files:

```text
backend/alembic/versions/
    0001_initial_schema
    0002_add_orders_status_date_index
```

### Common Migration Commands

Check current revision:

```powershell
alembic current
```

Apply migrations:

```powershell
alembic upgrade head
```

Generate a new migration:

```powershell
alembic revision --autogenerate -m "describe change"
```

Undo the latest migration:

```powershell
alembic downgrade -1
```

Check model and database differences:

```powershell
alembic check
```

Generate SQL without applying it:

```powershell
alembic upgrade head --sql
```

**Important:** Review autogenerated migration files before applying them.

The application does not create database tables automatically at startup. Alembic is responsible for schema creation and updates.

---

## 12. Sample Data Seeding

Seed script:

```text
backend/scripts/seed_data.py
```

Run:

```powershell
python -m scripts.seed_data
```

The script generates deterministic sample data:

- 5 categories
- 20 products
- 400 customers
- Approximately 2,700 orders
- 1–3 items per order
- Six order statuses
- 5 activities derived from real records

### Idempotent Seeding

The seed script avoids duplicates using natural keys and unique constraints.

Running the script again does not create duplicate records.

Expected output when the database is already populated:

```text
Database already up to date
```

To reset and reseed:

```powershell
python -m scripts.seed_data --reset
```

Optional date anchor:

```powershell
python -m scripts.seed_data --anchor 2026-10-15
```

---

## 13. Error Handling

The backend provides centralized error handling.

| Situation | Expected Response |
|---|---|
| PostgreSQL unavailable | HTTP 503 |
| Database query failure | HTTP 500 |
| Empty result | HTTP 200 with empty or zero-filled data |
| Invalid pagination | HTTP 422 |
| Invalid order status | HTTP 422 |
| Invalid date format | HTTP 422 |
| Start date after end date | HTTP 422 |
| Date range exceeds 366 days | HTTP 422 |

Database credentials, SQL statements and stack traces remain on the server side.

The mobile application displays friendly error messages and retry options.

---

## 14. Automated Testing

Backend tests use pytest.

### Install Development Dependencies

```powershell
cd backend
pip install -r requirements-dev.txt
```

### Run Tests

```powershell
pytest
```

The default test environment uses in-memory SQLite.

The test suite includes 17 tests.

### PostgreSQL Testing

Set a separate test database:

```powershell
$env:TEST_DATABASE_URL="postgresql+psycopg://USER:PASSWORD@localhost:5432/business_insights_test"
```

Run:

```powershell
pytest
```

Tests create and drop tables in the configured test database.

**Important:** Use an empty test database. Never point `TEST_DATABASE_URL` at your development database.

---

## 15. Frontend and Backend Integration

The mobile application communicates with FastAPI using centralized API services.

### Dashboard Integration

```text
DashboardScreen
    ↓
useDashboardData
    ↓
dashboardService
    ↓
apiClient
    ↓
GET /api/dashboard
```

### Analytics Integration

```text
AnalyticsScreen
    ↓
useAnalyticsData
    ↓
analyticsService
    ↓
apiClient
    ↓
GET /api/analytics/overview
```

### Orders Integration

```text
Orders Screen
    ↓
ordersService
    ↓
apiClient
    ↓
GET /api/orders
```

### Customers Integration

```text
Customers Screen
    ↓
customersService
    ↓
apiClient
    ↓
GET /api/customers
```

The frontend uses TypeScript interfaces to maintain API response consistency.

The mobile application never accesses PostgreSQL directly.

---

## 16. Security and Configuration

- Database credentials are stored in environment variables.
- `.env` files are excluded from version control.
- Backend APIs use centralized error handling.
- CORS is configured in FastAPI.
- Database access is managed through SQLAlchemy sessions.
- API responses expose only required fields.
- The frontend communicates with the backend over HTTP.

For production deployment, use HTTPS, secure authentication, restricted CORS origins and appropriate database credentials.

---

## 17. Troubleshooting

### Error: No module named psycopg2

Use the supported PostgreSQL driver URL:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/business_insights
```

### Error: relation "orders" does not exist

Run:

```powershell
alembic upgrade head
```

### Error: Connection refused

Check:

- PostgreSQL service is running.
- Database host is correct.
- Port is correct.
- Firewall settings allow connections.

### Error: Password authentication failed

Check the PostgreSQL username and password in `backend/.env`.

### Mobile App Cannot Connect to Backend

Check:

- Phone and computer are connected to the same Wi-Fi.
- Backend is running with `--host 0.0.0.0`.
- `EXPO_PUBLIC_API_URL` uses the computer's local IP.
- Windows Firewall allows Python connections.
- Restart Expo with:

```powershell
npx expo start -c
```

---

## 18. Submission Checklist

### PostgreSQL / pgAdmin

- [ ] PostgreSQL database is created.
- [ ] Alembic migrations are applied.
- [ ] Tables are visible in pgAdmin.
- [ ] Orders table contains sample data.
- [ ] Products and customers contain sample records.

### FastAPI / Swagger

- [ ] Backend starts successfully.
- [ ] `/health` returns a successful response.
- [ ] `/health/db` confirms database connectivity.
- [ ] `/api/dashboard` returns dashboard data.
- [ ] `/api/orders` returns paginated orders.
- [ ] `/api/customers` returns customer records.
- [ ] `/api/analytics/revenue-trend` returns daily revenue.
- [ ] `/api/analytics/overview` returns analytics data.

### Mobile Application

- [ ] Expo application starts successfully.
- [ ] Dashboard displays backend data.
- [ ] Analytics screen displays dynamic data.
- [ ] Analytics period filters work.
- [ ] Custom date range works.
- [ ] Revenue trend chart displays correctly.
- [ ] Orders summary displays correctly.
- [ ] Top category displays correctly.
- [ ] Bottom Navigation works.
- [ ] Loading and error states work.
- [ ] Pull-to-refresh works.

### Recommended Screenshots

1. pgAdmin database tables.
2. Orders table showing the first 100 rows.
3. Swagger `/api/dashboard` response.
4. Swagger `/api/orders` response.
5. Swagger `/api/analytics/revenue-trend` response.
6. Swagger `/api/analytics/overview` response.
7. Mobile Dashboard screen.
8. Mobile Analytics screen.
9. Mobile Bottom Navigation.

---

## 19. Conclusion

Enterprise Business Insights is a mobile business intelligence application that combines React Native, FastAPI and PostgreSQL to provide dynamic business reporting and analytics.

The application follows a layered architecture that separates frontend presentation, backend business logic, database operations and API contracts.

It provides dashboard monitoring, sales analytics, order management, customer information and business activity tracking through a centralized and maintainable architecture.

**Key Benefits:**

- Real-time backend-driven business insights.
- Dynamic analytics with date-range filtering.
- Centralized business rules.
- Reliable PostgreSQL data storage.
- Version-controlled database migrations.
- Reusable React Native components.
- Type-safe frontend API integration.
- Automated backend testing.
