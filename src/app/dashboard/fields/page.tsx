'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Field, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { fieldApi } from '@/api/field.api';

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setIsLoading(true);
        // Dalam implementasi sebenarnya, kita perlu mendapatkan branchId dari pengguna
        // yang login sebagai admin cabang
        const branchId = 1; // Contoh branchId
        const response = await fieldApi.getFieldsByBranchId(branchId);
        
        // Filter berdasarkan pencarian jika ada
        const filteredFields = searchQuery 
          ? response.filter(field => 
              field.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : response;
          
        setFields(filteredFields);
      } catch (error) {
        console.error('Error fetching fields:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFields();
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddField = () => {
    router.push('/dashboard/fields/create');
  };

  const handleViewField = (id: number) => {
    router.push(`/dashboard/fields/${id}`);
  };

  // Redirect jika bukan admin cabang
  if (user && user.role !== Role.ADMIN_CABANG) {
    router.push('/dashboard');
    return null;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'booked':
        return 'Dibooking';
      case 'maintenance':
        return 'Pemeliharaan';
      case 'closed':
        return 'Tutup';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Lapangan</h1>
        <Button onClick={handleAddField}>Tambah Lapangan</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cari Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Cari berdasarkan nama lapangan..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada lapangan yang sesuai dengan pencarian' : 'Belum ada lapangan'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Harga (Siang)</TableHead>
                  <TableHead>Harga (Malam)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>{field.id}</TableCell>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.type?.name || '-'}</TableCell>
                    <TableCell>
                      Rp {parseInt(field.priceDay.toString()).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      Rp {parseInt(field.priceNight.toString()).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          field.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : field.status === 'booked'
                            ? 'bg-blue-100 text-blue-800'
                            : field.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {getStatusLabel(field.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewField(field.id)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}