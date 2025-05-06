'use client';

import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth.hook';
import { Role } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/api/dashboard.api';

// Tipe data untuk statistik dashboard
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

// Dashboard untuk Super Admin
const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<SuperAdminStats>({
    totalBranches: 0,
    totalUsers: 0,
    totalFields: 0,
    activePromotions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getDashboardStats(Role.SUPER_ADMIN);
        setStats(data as SuperAdminStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching super admin dashboard:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Super Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cabang"
          value={stats.totalBranches}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Pengguna"
          value={stats.totalUsers}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Lapangan"
          value={stats.totalFields}
          isLoading={isLoading}
        />
        <StatCard
          title="Promosi Aktif"
          value={stats.activePromotions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Dashboard untuk Admin Cabang
const AdminCabangDashboard = () => {
  const [stats, setStats] = useState<AdminCabangStats>({
    totalBookings: 0,
    pendingPayments: 0,
    totalIncome: 0,
    availableFields: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getDashboardStats(Role.ADMIN_CABANG);
        setStats(data as AdminCabangStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching admin cabang dashboard:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin Cabang</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Booking Bulan Ini"
          value={stats.totalBookings}
          isLoading={isLoading}
        />
        <StatCard
          title="Pembayaran Pending"
          value={stats.pendingPayments}
          isLoading={isLoading}
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value={`Rp ${stats.totalIncome.toLocaleString()}`}
          isLoading={isLoading}
        />
        <StatCard
          title="Lapangan Tersedia"
          value={stats.availableFields}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Dashboard untuk Owner Cabang
const OwnerCabangDashboard = () => {
  const [stats, setStats] = useState<OwnerCabangStats>({
    totalBranches: 0,
    totalAdmins: 0,
    totalIncome: 0,
    totalBookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getDashboardStats(Role.OWNER_CABANG);
        setStats(data as OwnerCabangStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching owner cabang dashboard:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Owner Cabang</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cabang"
          value={stats.totalBranches}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Admin"
          value={stats.totalAdmins}
          isLoading={isLoading}
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value={`Rp ${stats.totalIncome.toLocaleString()}`}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Booking"
          value={stats.totalBookings}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Dashboard untuk User
const UserDashboard = () => {
  const [stats, setStats] = useState<UserStats>({
    activeBookings: 0,
    completedBookings: 0,
    favoriteField: '',
    unreadNotifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getDashboardStats(Role.USER);
        setStats(data as UserStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user dashboard:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Pengguna</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Booking Aktif"
          value={stats.activeBookings}
          isLoading={isLoading}
        />
        <StatCard
          title="Booking Selesai"
          value={stats.completedBookings}
          isLoading={isLoading}
        />
        <StatCard
          title="Lapangan Favorit"
          value={stats.favoriteField}
          isLoading={isLoading}
        />
        <StatCard
          title="Notifikasi Baru"
          value={stats.unreadNotifications}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Komponen Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  isLoading: boolean;
}

const StatCard = ({ title, value, isLoading }: StatCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-3/4" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </CardContent>
  </Card>
);

// Dashboard Page yang menampilkan dashboard berdasarkan role
export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center">Memuat...</div>;
  }

  if (!user) {
    return <div>Silakan login untuk melihat dashboard</div>;
  }

  // Render dashboard berdasarkan role
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case Role.ADMIN_CABANG:
      return <AdminCabangDashboard />;
    case Role.OWNER_CABANG:
      return <OwnerCabangDashboard />;
    case Role.USER:
      return <UserDashboard />;
    default:
      return <UserDashboard />;
  }
} 