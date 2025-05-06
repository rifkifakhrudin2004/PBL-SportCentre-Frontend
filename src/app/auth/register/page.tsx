'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import useAuth from '@/hooks/useAuth.hook';
import { MainLayout } from '@/components/layout/MainLayout';
import { Role } from '@/types';

// Interface untuk Error dengan response
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    phone: z
      .string()
      .min(10, 'Nomor telepon minimal 10 digit')
      .regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh berisi angka dan tanda +')
      .optional(),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
    role: z.enum([Role.USER, Role.OWNER_CABANG, Role.ADMIN_CABANG, Role.SUPER_ADMIN]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: Role.USER,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await register(data.name, data.email, data.password, data.phone, data.role);
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Register error:', error);
      // Handle error response dari server jika ada
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Gagal mendaftar. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Pendaftaran Berhasil</h1>
          <Alert className="mb-4">
            <AlertDescription>
              Pendaftaran berhasil! Anda akan dialihkan ke halaman login dalam beberapa detik.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Link href="/auth/login">
              <Button variant="link">Kembali ke halaman login</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Daftar</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nama@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+628xxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mendaftar Sebagai</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Role.USER}>Pengguna</SelectItem>
                      <SelectItem value={Role.OWNER_CABANG}>Pemilik Cabang</SelectItem>
                      <SelectItem value={Role.ADMIN_CABANG}>Admin Cabang</SelectItem>
                      <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input placeholder="******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <p>
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 