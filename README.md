# Enterprise Business Insights (Expo + TypeScript)

## How to Run

    npm install
    npx expo start
    npm run typecheck

- Scan the QR code using Expo Go.

## Project Structure

        - src/navigation` – Bottom tabs and route types.
        - src/screens – Dashboard and other screens.
        - src/components – Reusable UI components like KpiCard, KpiGrid, ActivityList, and TrendChart.
        - src/types – Types for API data.
        - src/data – Static mock data.
        - src/services – getDashboardData() for fetching dashboard data.
        - src/hooks – useDashboardData for loading, error, and refresh handling.
        - src/utils – Utility functions.
        - src/theme – App theme and styles.
        - src/assets – Images and other assets.

## Moving to FastAPI

1. Create the Pydantic response model to match the DashboardData type.
2. Update getDashboardData() to fetch data from /api/v1/dashboard.
3. Add a mapper if the API uses snake_case.
4. No component changes are needed. The UI will continue to use the typed data.