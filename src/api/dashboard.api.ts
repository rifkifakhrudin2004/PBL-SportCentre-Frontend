import axiosInstance from './axios.config';
import { Role } from '../types';

// Interface untuk dashboard stats
interface SuperAdminStats {
  totalBranches: number;
  totalUsers: number;
  totalFields: number;
  activePromotions: number;
}

interface AdminCabangStats {
  totalBookings: number;
  pendingPayments: number;
  totalIncome: number;
  availableFields: number;
}

interface OwnerCabangStats {
  totalBranches: number;
  totalAdmins: number;
  totalIncome: number;
  totalBookings: number;
}

interface UserStats {
  activeBookings: number;
  completedBookings: number;
  favoriteField: string;
  unreadNotifications: number;
}

type DashboardStats = SuperAdminStats | AdminCabangStats | OwnerCabangStats | UserStats;

class DashboardApi {
  /**
   * Mendapatkan statistik dashboard sesuai role
   */
  async getDashboardStats(role: Role): Promise<DashboardStats> {
    try {
      let endpoint = '';
      
      switch (role) {
        case Role.SUPER_ADMIN:
          endpoint = '/dashboard/super-admin';
          break;
        case Role.ADMIN_CABANG:
          endpoint = '/dashboard/admin-cabang';
          break;
        case Role.OWNER_CABANG:
          endpoint = '/dashboard/owner-cabang';
          break;
        case Role.USER:
        default:
          endpoint = '/dashboard/user';
          break;
      }
      
      const response = await axiosInstance.get<DashboardStats>(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching dashboard stats for ${role}:`, error);
      
      // Fallback data jika API tidak tersedia
      if (role === Role.SUPER_ADMIN) {
        return {
          totalBranches: 0,
          totalUsers: 0,
          totalFields: 0,
          activePromotions: 0,
        };
      } else if (role === Role.ADMIN_CABANG) {
        return {
          totalBookings: 0,
          pendingPayments: 0,
          totalIncome: 0,
          availableFields: 0,
        };
      } else if (role === Role.OWNER_CABANG) {
        return {
          totalBranches: 0,
          totalAdmins: 0,
          totalIncome: 0,
          totalBookings: 0,
        };
      } else {
        return {
          activeBookings: 0,
          completedBookings: 0,
          favoriteField: '',
          unreadNotifications: 0,
        };
      }
    }
  }
}

export const dashboardApi = new DashboardApi(); 