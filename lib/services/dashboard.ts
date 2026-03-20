import { api } from '../api-client';
import { Dashboard } from '../types';

export interface DashboardData extends Dashboard {
  revenueTrend: { month: string; revenue: number; orders: number; target?: number; growth?: number }[];
  equipmentStatus: { name: string; value: number; fill: string }[];
  categoryDistribution: { name: string; count: number }[];
  utilizationTrend: { week: string; utilization: number; availability: number }[];
}

export interface CompanyPerformance {
  name: string;
  revenue: number;
  orders: number;
  rating: number;
  growth: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardData> {
    return api.get<DashboardData>('/api/dashboard/stats');
  },

  async getRecentActivity(): Promise<any[]> {
    return api.get<any[]>('/api/dashboard/activity');
  },

  async getCompanyPerformance(): Promise<CompanyPerformance[]> {
    return api.get<CompanyPerformance[]>('/api/dashboard/company-performance');
  }
};
