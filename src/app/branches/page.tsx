'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { branchApi } from '@/api/branch.api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Branch } from '@/types';
import { Search } from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await branchApi.getAllBranches();
        setBranches(Array.isArray(data) ? data : []);
        setFilteredBranches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setError('Gagal memuat daftar cabang. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    // Filter branches based on search query
    if (searchQuery.trim() === '') {
      setFilteredBranches(branches);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = branches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(query) ||
          branch.location.toLowerCase().includes(query)
      );
      setFilteredBranches(filtered);
    }
  }, [searchQuery, branches]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The filtering is already handled by the useEffect
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Daftar Cabang</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Daftar Cabang</h1>
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Daftar Cabang</h1>

      <form onSubmit={handleSearch} className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Cari cabang berdasarkan nama atau lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      {filteredBranches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery.trim() !== '' 
              ? 'Tidak ada cabang yang sesuai dengan pencarian Anda.' 
              : 'Belum ada cabang tersedia.'}
          </p>
          {searchQuery.trim() !== '' && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Reset Pencarian
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="overflow-hidden">
              <div className="relative h-48">
                {branch.imageUrl ? (
                  <Image
                    src={branch.imageUrl}
                    alt={branch.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Tidak ada gambar</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">{branch.name}</h2>
                <p className="text-gray-700 mb-2 line-clamp-2">{branch.location}</p>
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      branch.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {branch.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-4">
                <Button asChild className="w-full">
                  <Link href={`/branches/${branch.id}`}>Lihat Detail</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 