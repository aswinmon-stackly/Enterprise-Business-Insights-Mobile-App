import { mockDashboard } from '../data/mockDashboard';
import { DashboardData } from '../types';

/**
 * Single seam between UI and data. Screens only reach this via useDashboardData.
 *
 * To switch to FastAPI later, replace the body with:
 *   const res = await fetch(`${API_BASE_URL}/api/v1/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
 *   if (!res.ok) throw new Error(`Dashboard request failed (${res.status})`);
 *   return mapDashboard(await res.json());   // snake_case -> camelCase mapper
 * DashboardData is the contract the FastAPI Pydantic response model should match.
 */
export async function getDashboardData(): Promise<DashboardData> {
  await new Promise<void>((r) => setTimeout(r, 600)); // simulate network latency
  return mockDashboard;
}
