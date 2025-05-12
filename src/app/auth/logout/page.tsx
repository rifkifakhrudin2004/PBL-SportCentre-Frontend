'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/auth.context';
import { Button } from '@/components/ui/button';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Redirect ke halaman login setelah logout berhasil
        router.push('/auth/login');
      } catch (error) {
        console.error('Gagal logout:', error);
        // Tetap redirect ke login jika terjadi error
        router.push('/auth/login');
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Sedang Keluar...</h1>
        <div className="flex justify-center my-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
        <p className="text-center text-gray-600">
          Anda sedang dalam proses keluar dari akun. Mohon tunggu sebentar.
        </p>
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/auth/login')}
          >
            Kembali ke Login
          </Button>
        </div>
      </div>
    </div>
  );
} 