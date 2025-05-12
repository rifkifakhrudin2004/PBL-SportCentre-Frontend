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
import { User, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { branchApi } from '@/api/branch.api';

// Interface untuk data admin cabang
interface BranchAdmin {
  userId: number;
  branchId: number;
  user: User;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<BranchAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        // Dalam implementasi sebenarnya, kita akan mendapatkan daftar cabang milik owner
        // Kemudian mengambil admin dari setiap cabang
        // Untuk contoh, kita gunakan cabang dengan ID 1
        const branchId = 1;
        const adminList = await branchApi.getBranchAdmins(branchId);
        
        // Filter berdasarkan pencarian jika ada
        const filteredAdmins = searchQuery 
          ? adminList.filter(admin => 
              admin.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              admin.user.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : adminList;
          
        setAdmins(filteredAdmins);
      } catch (error) {
        console.error('Error fetching admins:', error);
        setAdmins([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddAdmin = () => {
    router.push('/dashboard/admins/add');
  };

  const handleRemoveAdmin = async (branchId: number, userId: number) => {
    try {
      await branchApi.removeBranchAdmin(branchId, userId);
      // Refresh daftar admin setelah menghapus
      setAdmins(admins.filter(admin => admin.userId !== userId || admin.branchId !== branchId));
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Gagal menghapus admin. Silakan coba lagi.');
    }
  };

  // Redirect jika bukan owner cabang
  if (user && user.role !== Role.OWNER_CABANG) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Admin Cabang</h1>
        <Button onClick={handleAddAdmin}>Tambah Admin</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cari Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Cari berdasarkan nama atau email..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada admin yang sesuai dengan pencarian' : 'Belum ada admin cabang'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={`${admin.branchId}-${admin.userId}`}>
                    <TableCell>{admin.userId}</TableCell>
                    <TableCell>{admin.user.name}</TableCell>
                    <TableCell>{admin.user.email}</TableCell>
                    <TableCell>{admin.branchId}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.branchId, admin.userId)}
                      >
                        Hapus
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