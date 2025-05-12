'use client';

import { useEffect } from 'react';
import useAuth from '@/hooks/useAuth.hook';
import { Role } from '@/types';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { AdminCabangDashboard } from '@/components/dashboard/AdminCabangDashboard';
import { OwnerCabangDashboard } from '@/components/dashboard/OwnerCabangDashboard';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // React hook untuk SSR
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center p-8 rounded-lg bg-red-50 text-red-500 border border-red-200">
        Silakan login untuk melihat dashboard
      </div>
    );
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