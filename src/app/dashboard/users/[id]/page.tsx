'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';

const getUserById = async (id: number): Promise<User | null> => {
  const allUsers: User[] = [
    {
      id: 1,
      name: 'Admin Utama',
      email: 'admin@example.com',
      role: Role.SUPER_ADMIN,
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Owner Cabang A',
      email: 'owner@example.com',
      role: Role.OWNER_CABANG,
      createdAt: '2023-01-02T00:00:00Z',
    },
    {
      id: 3,
      name: 'Admin Cabang A',
      email: 'admincabang@example.com',
      role: Role.ADMIN_CABANG,
      createdAt: '2023-01-03T00:00:00Z',
    },
    {
      id: 4,
      name: 'Pengguna Biasa',
      email: 'user@example.com',
      role: Role.USER,
      createdAt: '2023-01-04T00:00:00Z',
    },
  ];

  return allUsers.find(user => user.id === id) || null;
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = Number(params.id);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const foundUser = await getUserById(userId);
        setUser(foundUser);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleEdit = () => {
    router.push(`/dashboard/users/${userId}/edit`);
  };

  const handleDelete = () => {
    const confirmDelete = confirm('Apakah Anda yakin ingin menghapus pengguna ini?');
    if (confirmDelete) {
      // Panggil API delete user (simulasi)
      alert(`User dengan ID ${userId} berhasil dihapus (simulasi).`);
      router.push('/dashboard/users');
    }
  };

  if (!authUser || authUser.role !== Role.SUPER_ADMIN) {
    router.push('/dashboard');
    return null;
  }

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (!user) {
    return <p className="p-4 text-red-600">Pengguna tidak ditemukan.</p>;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Detail Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Nama:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Peran:</strong> {user.role}</p>
            <p><strong>Tanggal Daftar:</strong> {new Date(user.createdAt).toLocaleDateString('id-ID')}</p>

            <div className="flex space-x-4 mt-6">
              <Button onClick={handleEdit}>Edit</Button>
              <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
              <Button variant="outline" onClick={() => router.back()}>Kembali</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}