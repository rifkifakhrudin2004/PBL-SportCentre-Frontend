'use client'

import { useState, useEffect, use } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, Role, Branch } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { fieldApi } from '@/api/field.api';
import { branchApi } from '@/api/branch.api';
import { useToast } from '@/components/ui/use-toast';

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFieldsLoading, setIsFieldsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedBranchName, setSelectedBranchName] = useState<string>("Pilih cabang");
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch branches when component mounts
  useEffect(() => {
    const fetchUserBranches = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        let userBranches: Branch[] = [];

        if (user.role === Role.SUPER_ADMIN) {
          const response = await branchApi.getBranches({ status: 'active' });
          userBranches = response.data || [];
        } else {
          // Gunakan endpoint yang benar untuk managed branches
          const response = await branchApi.getUserManagedBranches();
          userBranches = response.data || [];

          // Filter hanya cabang yang aktif
          userBranches = userBranches.filter(branch => branch.status === 'active');
        }

        setBranches(userBranches);

        // Otomatis pilih cabang pertama jika tersedia
        if (userBranches.length > 0) {
          const firstBranch = userBranches[0];
          setSelectedBranchId(firstBranch.id);
          setSelectedBranchName(firstBranch.name);
        } else {
          setSelectedBranchId(null);
          toast({
            title: "Tidak Ada Cabang",
            description: "Tidak ada cabang aktif yang tersedia",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data cabang",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBranches();
  }, [user, toast]);

  // Fetch fields when selected branch changes
  useEffect(() => {
    const fetchFields = async () => {
      if (!selectedBranchId) {
        setFields([]);
        setFilteredFields([]);
        return;
      }

      try {
        setIsFieldsLoading(true);
        // Pastikan cabang aktif sebelum mengambil data lapangan
        const selectedBranch = branches.find(b => b.id === selectedBranchId);
        if (!selectedBranch || selectedBranch.status !== 'active') {
          toast({
            title: "Cabang Tidak Aktif",
            description: "Cabang yang dipilih tidak aktif",
            variant: "destructive"
          });
          setFields([]);
          setFilteredFields([]);
          return;
        }

        console.log("Fetching fields for branchId:", selectedBranchId, "type:", typeof selectedBranchId);

        // Pastikan selectedBranchId adalah number dan valid
        if (selectedBranchId === null || isNaN(Number(selectedBranchId))) {
          throw new Error('Branch ID is invalid');
        }

        // Konversi ke number untuk memastikan tipe data konsisten
        const branchIdNumber = Number(selectedBranchId);

        const fieldData = await fieldApi.getFieldsByBranchId(branchIdNumber);
        console.log("Field data received:", fieldData);

        if (Array.isArray(fieldData)) {
          setFields(fieldData);
          setFilteredFields(searchQuery
            ? fieldData.filter(field => field.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : fieldData
          );
        } else {
          console.error("Unexpected field data format:", fieldData);
          toast({
            title: "Error Format Data",
            description: "Data lapangan tidak dalam format yang diharapkan",
            variant: "destructive"
          });
          setFields([]);
          setFilteredFields([]);
        }
      } catch (error: any) {
        console.error('Error fetching fields:', error);
        const errorMessage = error.message || "Gagal memuat data lapangan";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        setFields([]);
        setFilteredFields([]);
      } finally {
        setIsFieldsLoading(false);
      }
    };

    if (selectedBranchId) {
      fetchFields();
    }
  }, [selectedBranchId, branches, searchQuery, toast]);

  // Apply search filter when search query changes
  useEffect(() => {
    if (fields.length > 0) {
      const filtered = searchQuery
        ? fields.filter(field =>
          field.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : fields;

      setFilteredFields(filtered);
    }
  }, [searchQuery, fields]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBranchChange = (branchId: string) => {
    const id = parseInt(branchId, 10);

    console.log("Branch changed to:", branchId, "parsed as:", id);

    if (isNaN(id)) {
      toast({
        title: "Error",
        description: "ID cabang tidak valid",
        variant: "destructive"
      });
      return;
    }

    setSelectedBranchId(id);

    // Update selected branch name
    const branch = branches.find(b => b.id === id);
    setSelectedBranchName(branch?.name || "Pilih cabang");

    // Reset search query when branch changes
    setSearchQuery('');
  };

  const handleAddField = () => {
    // Hapus parameter branchId agar tidak ada cabang yang dipilih secara otomatis
    router.push(`/dashboard/fields/create`);
  };

  const handleViewField = (id: number) => {
    router.push(`/dashboard/fields/${id}`);
  };

  // Redirect if not an admin_cabang or owner_cabang or super_admin
  useEffect(() => {
    if (user &&
      user.role !== Role.ADMIN_CABANG &&
      user.role !== Role.OWNER_CABANG &&
      user.role !== Role.SUPER_ADMIN) {
      router.push('/dashboard');
    }
  }, [user, router]);

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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user is restricted to specific branches (admin_cabang)
  const isBranchSelectionDisabled = user?.role === Role.ADMIN_CABANG && branches.length === 1;

  if (!user) {
    return null; // Don't render anything until user data is loaded
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Lapangan</h1>
        <Button onClick={handleAddField}>Tambah Lapangan</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Branch Selection Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pilih Cabang
              </label>
              <Select
                value={selectedBranchId?.toString() || ""}
                onValueChange={handleBranchChange}
                disabled={isBranchSelectionDisabled || isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedBranchName} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                  {branches.length === 0 && (
                    <SelectItem value="no-branch" disabled>
                      Tidak ada cabang
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Cari Lapangan
              </label>
              <Input
                placeholder="Cari berdasarkan nama lapangan..."
                value={searchQuery}
                onChange={handleSearch}
                disabled={!selectedBranchId || isFieldsLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Lapangan {selectedBranchName !== "Pilih cabang" ? selectedBranchName : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedBranchId ? (
            <div className="text-center py-8 text-muted-foreground">
              Silakan pilih cabang terlebih dahulu
            </div>
          ) : isLoading || isFieldsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredFields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada lapangan yang sesuai dengan pencarian' : 'Belum ada lapangan untuk cabang ini'}
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filteredFields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.id}</TableCell>
                      <TableCell>{field.name}</TableCell>
                      <TableCell>{field.type?.name || '-'}</TableCell>
                      <TableCell>
                        Rp {parseFloat(field.priceDay.toString()).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        Rp {parseFloat(field.priceNight.toString()).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(field.status)}`}
                        >
                          {getStatusLabel(field.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewField(field.id)}
                          >
                            Detail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}