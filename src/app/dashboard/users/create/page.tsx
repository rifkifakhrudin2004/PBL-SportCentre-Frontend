'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@/types';

export default function CreateUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      name,
      email,
      role,
    };
    
    // Simulasi API (ganti dengan real API call jika ada)
    console.log('User baru:', newUser);

    // Redirect ke halaman pengguna setelah simpan
    router.push('/dashboard/users');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tambah Pengguna</h1>

      <Card>
        <CardHeader>
          <CardTitle>Form Pengguna Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                placeholder="Nama pengguna"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email pengguna"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Peran</Label>
              <Select value={role} onValueChange={(val: Role) => setRole(val)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                  <SelectItem value={Role.ADMIN_CABANG}>Admin Cabang</SelectItem>
                  <SelectItem value={Role.OWNER_CABANG}>Owner Cabang</SelectItem>
                  <SelectItem value={Role.USER}>Pengguna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/users')}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}