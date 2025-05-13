import axiosInstance from '@/config/axios.config';
import { Role } from '@/types';
import { PeriodType } from '@/components/dashboard/filters/PeriodFilter';
import {
  SuperAdminStats,
  OwnerCabangStats, 
  AdminCabangStats,
  UserStats
} from '@/hooks/useDashboardStats';

// Type untuk hasil respons API
type DashboardStatsResponse = 
  | SuperAdminStats
  | OwnerCabangStats
  | AdminCabangStats
  | UserStats;

/**
 * API client untuk fitur dashboard
 */
export const dashboardApi = {
  /**
   * Mendapatkan statistik dashboard berdasarkan role dan periode
   * @param role Role pengguna
   * @param period Periode waktu
   * @returns Data statistik dashboard
   */
  getDashboardStats: async (role: Role, period: PeriodType = 'monthly'): Promise<DashboardStatsResponse> => {
    try {
      let response;
      
      // Untuk OWNER_CABANG bisa memanfaatkan endpoint dari booking controller yang sudah dioptimalkan
      if (role === Role.OWNER_CABANG) {
        // URL yang benar menggunakan /bookings bukan /booking sesuai dengan konfigurasi di backend
        response = await axiosInstance.get<{data: OwnerCabangStats, status: boolean}>(`/bookings/owner/dashboard/stats`, {
          params: { period }
        });
        
        // Jika response dalam format { data: ... }
        if (response.data && response.data.data) {
          return response.data.data;
        }
        
        return response.data as unknown as OwnerCabangStats;
      } else {
        // Untuk role lain, tetap gunakan endpoint dashboard
        response = await axiosInstance.get<DashboardStatsResponse>(`/dashboard/stats`, {
          params: { role, period }
        });
        
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}; 