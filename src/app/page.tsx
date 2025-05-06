'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { branchApi } from '@/api';
import { Branch } from '@/types';

export default function HomePage() {
  const [featuredBranches, setFeaturedBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branches = await branchApi.getAllBranches();
        // Pastikan branches berupa array sebelum menggunakan slice
        if (Array.isArray(branches)) {
          // Hanya tampilkan maksimal 4 cabang
          setFeaturedBranches(branches.slice(0, 4));
        } else {
          console.error('branches is not an array:', branches);
          setFeaturedBranches([]);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setFeaturedBranches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Reservasi Lapangan Olahraga Jadi Lebih Mudah
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Temukan dan pesan lapangan olahraga favorit Anda dengan cepat dan mudah.
            Bayar online dan dapatkan konfirmasi instan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/branches">
              <Button size="lg">Jelajahi Cabang</Button>
            </Link>
            <Link href="/fields">
              <Button size="lg" variant="outline">
                Lihat Lapangan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Branches */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Cabang Populer</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-[300px] rounded-lg bg-muted"
                ></div>
              ))}
            </div>
          ) : featuredBranches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBranches.map((branch) => (
                <Card key={branch.id} className="h-full">
                  <CardHeader>
                    <CardTitle>{branch.name}</CardTitle>
                    <CardDescription>{branch.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="h-[140px] rounded-md bg-muted mb-4 bg-cover bg-center"
                      style={{
                        backgroundImage: branch.imageUrl
                          ? `url(${branch.imageUrl})`
                          : 'none',
                      }}
                    />
                  </CardContent>
                  <CardFooter>
                    <Link href={`/branches/${branch.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        Lihat Detail
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">Belum ada cabang tersedia</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link href="/branches">
              <Button variant="outline">Lihat Semua Cabang</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50 rounded-lg">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Mengapa Memilih Kami?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-center">Pemesanan Cepat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Pesan lapangan hanya dalam hitungan menit, tanpa perlu antre
                  atau menelepon. Gunakan aplikasi kapan saja dan di mana saja.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-center">Pembayaran Aman</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Berbagai metode pembayaran yang aman dan terpercaya, termasuk
                  transfer bank, kartu kredit, dan e-wallet populer.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-center">Kualitas Terjamin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Semua lapangan telah diverifikasi kualitasnya. Lihat review
                  dari pengguna lain sebelum melakukan pemesanan.
                </p>
              </CardContent>
            </Card>
          </div>
    </div>
      </section>
    </MainLayout>
  );
}
