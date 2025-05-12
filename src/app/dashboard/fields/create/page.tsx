'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth/auth.context';
import { fieldApi } from '@/api/field.api';
import { branchApi } from '@/api/branch.api';
import { Role, Branch, FieldType, FieldStatus } from '@/types';

// Validasi form menggunakan Zod
const createFieldSchema = z.object({
  name: z.string().min(3, 'Nama lapangan minimal 3 karakter'),
  typeId: z.string().min(1, 'Tipe lapangan harus dipilih'),
  branchId: z.string().min(1, 'Cabang harus dipilih'),
  priceDay: z.string().min(1, 'Harga siang harus diisi').regex(/^\d+$/, 'Harga harus berupa angka'),
  priceNight: z.string().min(1, 'Harga malam harus diisi').regex(/^\d+$/, 'Harga harus berupa angka'),
  status: z.string().min(1, 'Status harus dipilih'),
  imageUrl: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
});

type CreateFieldFormValues = z.infer<typeof createFieldSchema>;

export default function CreateFieldPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const defaultBranchId = searchParams.get('branchId');

  const form = useForm<CreateFieldFormValues>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      name: '',
      typeId: '',
      branchId: defaultBranchId || '',
      priceDay: '',
      priceNight: '',
      status: 'available',
      imageUrl: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Dapatkan daftar cabang
        const branchResponse = await branchApi.getBranches();
        setBranches(branchResponse.data || []);

        // Dapatkan daftar tipe lapangan
        const fieldTypeResponse = await fieldApi.getFieldTypes();
        setFieldTypes(fieldTypeResponse || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Redirect jika bukan admin cabang
  if (user && user.role !== Role.ADMIN_CABANG && user.role !== Role.SUPER_ADMIN) {
    router.push('/dashboard');
    return null;
  }

  const onSubmit = async (data: CreateFieldFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Cari tipe lapangan berdasarkan ID
      const selectedTypeId = parseInt(data.typeId);
      const selectedType = fieldTypes.find(type => type.id === selectedTypeId);
      
      if (!selectedType) {
        throw new Error('Tipe lapangan tidak ditemukan');
      }

      // Persiapkan data untuk dikirim ke API
      const submitData = {
        name: data.name,
        typeId: selectedTypeId,
        branchId: parseInt(data.branchId),
        priceDay: parseFloat(data.priceDay),
        priceNight: parseFloat(data.priceNight),
        status: data.status as FieldStatus,
        type: {
          id: selectedTypeId,
          name: selectedType.name
        },
        imageUrl: data.imageUrl || undefined,
      };

      await fieldApi.createField(submitData);
      
      // Redirect ke halaman daftar lapangan atau detail cabang
      if (defaultBranchId) {
        router.push(`/dashboard/branches/${defaultBranchId}`);
      } else {
        router.push('/dashboard/fields');
      }
    } catch (err) {
      console.error('Error creating field:', err);
      setError('Gagal membuat lapangan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tambah Lapangan Baru</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lapangan</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Lapangan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabang</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!!defaultBranchId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih cabang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Lapangan</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe lapangan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priceDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Siang</FormLabel>
                      <FormControl>
                        <Input placeholder="100000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Malam</FormLabel>
                      <FormControl>
                        <Input placeholder="150000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Tersedia</SelectItem>
                        <SelectItem value="maintenance">Pemeliharaan</SelectItem>
                        <SelectItem value="closed">Tutup</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => defaultBranchId ? 
                    router.push(`/dashboard/branches/${defaultBranchId}`) : 
                    router.push('/dashboard/fields')}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 