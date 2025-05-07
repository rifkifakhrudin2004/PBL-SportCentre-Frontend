'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/auth.context';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { redirect } from 'next/navigation';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // Redirect jika user belum login
  if (!isLoading && !user) {
    redirect('/auth/login');
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
} 