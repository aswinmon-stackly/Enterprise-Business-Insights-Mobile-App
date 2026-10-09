import { DashboardData } from '../types';
import { DashboardResponse } from '../types/api';
import { apiGet } from './apiClient';
import { mapDashboard } from './dashboardMapper';

/** GET /api/dashboard -> typed UI model. */
export async function getDashboardData(signal?: AbortSignal): Promise<DashboardData> {
  const response = await apiGet<DashboardResponse>('/api/dashboard', { signal });
  return mapDashboard(response);
}
