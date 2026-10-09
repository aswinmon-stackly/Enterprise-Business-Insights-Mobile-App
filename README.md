# Enterprise Business Insights

Enterprise Business Insights is a mobile application built using **React Native, Expo, and TypeScript**. It uses a **FastAPI backend** and a **PostgreSQL database** to display business information.

## Project Structure

```text
.
├── frontend/                  Expo / React Native app
│   └── src/
│       ├── components/        Reusable UI components
│       ├── screens/           App screens
│       ├── navigation/        Screen navigation
│       ├── hooks/             Custom React hooks
│       ├── services/          API and data services
│       ├── types/             TypeScript types
│       ├── utils/             Helper functions
│       ├── theme/             App styles and colors
│       └── config/            App configuration
│
├── backend/                   FastAPI backend
│   ├── app/
│   │   ├── main.py            Main app, CORS, and health checks
│   │   ├── config.py          Environment settings
│   │   ├── routers/           API endpoints
│   │   ├── schemas/           API request and response models
│   │   ├── services/          Business logic
│   │   ├── repositories/      Database queries
│   │   ├── models/            Database table models
│   │   ├── db/                Database connection and seed script
│   │   └── utils/             Helper functions
│   └── tests/                 Backend tests
│
└── docker-compose.yml         PostgreSQL 16 setup
```

## 1. Set Up the Database

There are two ways to set up PostgreSQL.

### Option A: Use Docker

Run this command from the project root folder:

```powershell
docker compose up -d
```

This starts the PostgreSQL database using Docker.

### Option B: Use Local PostgreSQL

Install PostgreSQL on your computer or use pgAdmin.

Create a database named `business_insights`.

Then, update the database username and password in `backend/.env`.

## 2. Set Up the Backend

The backend requires Python 3.10 or later.

Open PowerShell and run these commands:

```powershell
cd backend

python -m venv .venv

.venv\Scripts\Activate.ps1

pip install -r requirements.txt

copy .env.example .env
```

Open the `.env` file and update the database connection details if needed.

Next, create the database tables and insert sample data:

```powershell
python -m app.db.seed
```

To reset the sample data, run:

```powershell
python -m app.db.seed --reset
```

Start the backend server:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Backend URLs

- **Swagger API documentation:** http://localhost:8000/docs
- **Dashboard API:** `GET /api/dashboard`
- **Health check:** `GET /health`
- **Database health check:** `GET /health/db`

You can use Swagger to test the API endpoints.

### Run Backend Tests

Install the development dependencies:

```powershell
pip install -r requirements-dev.txt
```

Run the tests:

```powershell
pytest
```

The tests use an in-memory SQLite database, so a PostgreSQL database is not required to run them.

**Note:** The `--host 0.0.0.0` option allows other devices on the same Wi-Fi network to access the backend. On Windows, allow Python through the firewall for private networks.

## 3. Set Up the Frontend

Open a new terminal and run:

```powershell
cd frontend

npm install

npx expo start -c
```

You can run the app in two ways:

- **Mobile:** Scan the QR code using Expo Go. Your phone and computer should be connected to the same Wi-Fi network.
- **Browser:** Press `w` in the Expo terminal to open the web version, if supported by the project.

### Configure the API URL

The frontend connects to the FastAPI backend.

By default, it detects the computer's IP address and uses port `8000`.

If needed, create or update `frontend/.env` with the following setting:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8000
```

Replace `YOUR_PC_IP` with your computer's local IP address.

Check the `.env.example` file for the expected configuration.

## 4. Database Tables

The database contains the following tables:

| Table | Purpose |
|---|---|
| `categories` | Stores product or business categories |
| `customers` | Stores customer information and regions |
| `orders` | Stores order amounts, costs, statuses, categories, customers, and dates |
| `sales_targets` | Stores monthly sales targets |
| `activities` | Stores recent business activities |
| `alerts` | Stores notifications and their read status |
| `users` | Stores user profile information shown in the app |

## 5. How Dashboard Data Is Calculated

The dashboard calculates its numbers directly from the database using SQL queries. The calculated dashboard values are not stored in separate database fields.

- **KPIs:** Compare the latest 30 days with the previous 30 days using SQL functions such as `SUM`, `COUNT`, and `COUNT DISTINCT`.
- **Percentage change:** Calculate the difference between the two periods.
- **Revenue trend:** Calculate daily revenue for the latest seven days and show zero for days without sales.
- **Top category:** Find the category with the highest sales amount by joining the categories and orders tables.
- **Target achievement:** Calculate revenue divided by the sales target.
- **Order fulfilment:** Calculate delivered orders divided by total eligible orders, excluding cancelled orders.

The dashboard uses the date of the latest order to calculate the reporting periods. This helps the sample data fill the dashboard's date ranges.

To generate fresh sample data, run:

```powershell
python -m app.db.seed --reset
```

## 6. How Data Flows Through the Application

The dashboard follows this process:

1. `DashboardScreen` displays the dashboard UI.
2. `useDashboardData` manages dashboard data loading.
3. `dashboardService` handles dashboard-related data requests.
4. `apiClient` sends a request to the backend.
5. The backend receives the request through `GET /api/dashboard`.
6. The router gets a database session using `Depends(get_db)`.
7. The dashboard service applies the business logic.
8. The dashboard repository runs SQLAlchemy queries against PostgreSQL.
9. `DashboardResponse` validates the response data using Pydantic and returns JSON in camelCase format.
10. `mapDashboard()` converts the API response into the format used by the frontend components.

### Error Handling

If the database is unavailable, the backend returns a `503` error with a general error message.

The frontend displays a friendly error message and a Retry option. Detailed technical errors remain in the backend logs.

## 7. Important Notes

- Database tables are created automatically at startup using `create_all`. This is convenient for development.
- Before using the application in production, use Alembic migrations to manage database changes.
- Authentication and user-specific data have not been implemented yet. The application currently uses a single demo user.
- The Analytics tab still uses local mock data. It has not yet been connected to the backend.
