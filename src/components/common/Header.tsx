import Link from 'next/link';
import { useAuth } from '@/context/auth.context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            Sport Center
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:underline">
            Beranda
          </Link>
          <Link href="/branches" className="text-sm font-medium hover:underline">
            Cabang
          </Link>
          <Link href="/fields" className="text-sm font-medium hover:underline">
            Lapangan
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/bookings" className="text-sm font-medium hover:underline">
                Pemesanan
              </Link>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-sm font-medium"
                >
                  {user?.name}
                </Button>
                
                {isMenuOpen && (
                  <Card className="absolute right-0 mt-2 w-48 p-2 space-y-2">
                    <Link 
                      href="/profile" 
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    <Link 
                      href="/notifications" 
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Notifikasi
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                    >
                      Keluar
                    </button>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-sm font-medium">
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" className="text-sm font-medium">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-background border-b md:hidden">
            <div className="container py-4 space-y-4">
              <Link 
                href="/" 
                className="block py-2 text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link 
                href="/branches" 
                className="block py-2 text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                Cabang
              </Link>
              <Link 
                href="/fields" 
                className="block py-2 text-sm font-medium hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                Lapangan
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/bookings" 
                    className="block py-2 text-sm font-medium hover:underline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pemesanan
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block py-2 text-sm font-medium hover:underline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <Link 
                    href="/notifications" 
                    className="block py-2 text-sm font-medium hover:underline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Notifikasi
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-sm font-medium text-red-600 hover:underline"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/auth/login" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      Masuk
                    </Button>
                  </Link>
                  <Link 
                    href="/auth/register" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="default" className="w-full">
                      Daftar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 