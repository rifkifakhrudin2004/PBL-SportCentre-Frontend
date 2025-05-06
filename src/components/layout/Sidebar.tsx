'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  BuildingIcon, 
  CalendarIcon, 
  UsersIcon, 
  SettingsIcon, 
  ChartIcon, 
  MenuIcon, 
  XIcon,
  ActivityLogIcon,
  PromotionIcon,
} from '@/components/ui/icons';
import useAuth from '@/hooks/useAuth.hook';
import { Role } from '@/types';

// Definisi menu berdasarkan role
const menuByRole = {
  [Role.SUPER_ADMIN]: [
    { label: 'Dashboard', icon: <HomeIcon />, href: '/dashboard' },
    { label: 'Cabang', icon: <BuildingIcon />, href: '/dashboard/branches' },
    { label: 'Pengguna', icon: <UsersIcon />, href: '/dashboard/users' },
    { label: 'Promosi', icon: <PromotionIcon />, href: '/dashboard/promotions' },
    { label: 'Aktivitas', icon: <ActivityLogIcon />, href: '/dashboard/activity-logs' },
    { label: 'Pengaturan', icon: <SettingsIcon />, href: '/dashboard/settings' },
  ],
  [Role.ADMIN_CABANG]: [
    { label: 'Dashboard', icon: <HomeIcon />, href: '/dashboard' },
    { label: 'Lapangan', icon: <BuildingIcon />, href: '/dashboard/fields' },
    { label: 'Booking', icon: <CalendarIcon />, href: '/dashboard/bookings' },
    { label: 'Pembayaran', icon: <ChartIcon />, href: '/dashboard/payments' },
    { label: 'Laporan', icon: <ChartIcon />, href: '/dashboard/reports' },
  ],
  [Role.OWNER_CABANG]: [
    { label: 'Dashboard', icon: <HomeIcon />, href: '/dashboard' },
    { label: 'Cabang', icon: <BuildingIcon />, href: '/dashboard/branches' },
    { label: 'Admin', icon: <UsersIcon />, href: '/dashboard/admins' },
    { label: 'Laporan', icon: <ChartIcon />, href: '/dashboard/reports' },
    { label: 'Pengaturan', icon: <SettingsIcon />, href: '/dashboard/settings' },
  ],
  [Role.USER]: [
    { label: 'Dashboard', icon: <HomeIcon />, href: '/dashboard' },
    { label: 'Booking', icon: <CalendarIcon />, href: '/dashboard/bookings' },
    { label: 'Riwayat', icon: <ActivityLogIcon />, href: '/dashboard/history' },
    { label: 'Profil', icon: <UsersIcon />, href: '/dashboard/profile' },
  ],
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const menuItems = user.role && menuByRole[user.role] ? menuByRole[user.role] : menuByRole[Role.USER];

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/auth/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Sidebar for mobile (slide-in) */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition duration-200 ease-in-out md:relative z-30 md:z-0 md:w-64 bg-white shadow-lg md:shadow-none`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Sport Center</h2>
            <p className="text-sm text-gray-600">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>

          <nav className="flex-1 overflow-y-auto pt-2">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname === item.href
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="w-5 h-5">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}; 