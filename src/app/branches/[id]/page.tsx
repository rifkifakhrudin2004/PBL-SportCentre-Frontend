'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { branchApi, fieldApi } from '@/api';
import { Branch, Field } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BranchDetailPage() {
  const params = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mengambil data cabang
        const branchId = parseInt(params.id);
        const branchData = await branchApi.getBranchById(branchId);
        setBranch(branchData);

        // Mengambil daftar lapangan di cabang ini
        const fieldsData = await fieldApi.getFieldsByBranchId(branchId);
        setFields(fieldsData);
      } catch (err) {
        console.error('Error fetching branch details:', err);
        setError('Gagal memuat data cabang. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-[250px] bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !branch) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Cabang tidak ditemukan'}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/branches">
              <Button>Kembali ke Daftar Cabang</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{branch.name}</h1>
          <p className="text-muted-foreground">{branch.location}</p>
        </div>

        {branch.imageUrl && (
          <div
            className="w-full h-64 bg-muted rounded-lg mb-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${branch.imageUrl})` }}
          ></div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Daftar Lapangan</h2>

          {fields.length === 0 ? (
            <p className="text-muted-foreground">Belum ada lapangan tersedia di cabang ini.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((field) => (
                <Card key={field.id} className="h-full">
                  <CardHeader>
                    <CardTitle>{field.name}</CardTitle>
                    <CardDescription>
                      {field.status === 'available' ? 'Tersedia' : 
                       field.status === 'booked' ? 'Sedang Diboooking' :
                       field.status === 'maintenance' ? 'Dalam Pemeliharaan' : 'Tutup'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="h-[140px] rounded-md bg-muted mb-4 bg-cover bg-center"
                      style={{
                        backgroundImage: field.imageUrl
                          ? `url(${field.imageUrl})`
                          : 'none',
                      }}
                    />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Harga (Siang):</span>
                        <span className="font-semibold">
                          Rp {parseInt(field.priceDay.toString()).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Harga (Malam):</span>
                        <span className="font-semibold">
                          Rp {parseInt(field.priceNight.toString()).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/fields/${field.id}/book`} className="w-full">
                      <Button 
                        className="w-full"
                        disabled={field.status !== 'available'}
                      >
                        Pesan Sekarang
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Link href="/branches">
            <Button variant="outline">Kembali ke Daftar Cabang</Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
} 