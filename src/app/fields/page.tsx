'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { branchApi } from '@/api/branch.api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Branch, Field } from '@/types';
import { fieldApi } from '@/api';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function FieldPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [selectedBranchName, setSelectedBranchName] =useState<String>("Cabang");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // const limit = 20;
  const [limit, setLimit] = useState(20);

  const fetchFields = async (currenPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fieldApi.getAllFields({limit, page: currenPage});
      setFields(response.data || []);
      setTotalItems(response.meta?.totalItems || 0);
    } catch (error) {
      console.error("Error fetching fields:", error);
      setError("Gagal memuat lapangan. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFields = async () => {
  try {
    const response = await fieldApi.getAllFields({ limit: 10000, page: 1 }); // anggap 10.000 cukup untuk semua data
    setFields(response.data || []);
    setTotalItems(response.meta?.totalItems || 0);
  } catch (error) {
    console.error("Error fetching all fields:", error);
    setError("Gagal memuat semua data lapangan untuk pencarian.");
  }
};

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchApi.getBranches();
        const branches = response.data || [];
        console.log("branches: ",branches);
        if (Array.isArray(branches)) {
          setBranches(branches);
        } else {
          console.error("branches is not an array:", branches);
          setBranches([]);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
    fetchFields(page);
  }, [page, selectedBranch]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();

    // const filtered = fields.filter((field) => {
    //   const matchesBranch = selectedBranch === 0 || field.branchId === selectedBranch;
    //   const matchesSearch = query === '' || field.name.toLowerCase().includes(query) || field.type.name.toLowerCase().includes(query);
    //   return matchesBranch && matchesSearch;
    // });

    // setFilteredFields(filtered);

    const performFiltering = () => {
    const filtered = fields.filter((field) => {
      const matchesBranch = selectedBranch === 0 || field.branchId === selectedBranch;
      const matchesSearch =
        query === '' ||
        field.name.toLowerCase().includes(query) ||
        field.type.name.toLowerCase().includes(query);
      return matchesBranch && matchesSearch;
    });

    setFilteredFields(filtered);
  };

  if (query !== '') {
    // jika ada pencarian, ambil semua data dulu
    fetchAllFields().then(() => {
      performFiltering();
    });
  } else {
    performFiltering();
  }
  }, [searchQuery, selectedBranch, fields]);

  const handleRefresh = async () => {
    fetchFields(page);
  };
  

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  
  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  
  const branchChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = Number(e.target.value);
    if (branchId !== 0) {
      setLimit(1000)
    } else if (branchId === 0) {
      setLimit(20)
    }
    setSelectedBranch(branchId);

    const branch = branches.find((branch) => branch.id === branchId);
    setSelectedBranchName(branch?.name || "Cabang");
    handleFilter;
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
        <Button onClick={handleRefresh}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar {`${selectedBranch === 0 ? "Semua Lapangan" : "Lapangan " + selectedBranchName}`}</h1>
        <div className="flex items-center">
          <Button variant="outline" onClick={handleRefresh}>
            Muat Ulang
          </Button>
          <select
              name="branch"
              id="branch"
              onChange={branchChanged}
              value={selectedBranch}
              className="ml-4 p-1.5 border h-[40px] border-gray-300 rounded-md focus:outline-none "
            >
              <option key={0} value={0} defaultValue={0}>Semua Cabang</option>
              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                  className="text-black"
                >
                  {branch.name}
                </option>
              ))}
            </select>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Cari lapangan berdasarkan nama atau cabang..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      {filteredFields.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            Cabang yang anda pilih belum memiliki lapangan
          </p>  
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFields.map((field) => (
              <Card key={field.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img
                    src={field.imageUrl || "images/img_not_found.png"}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "images/img_not_found.png";
                      target.className = "h-full w-full object-contain";
                    }}
                    alt={field.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className='flex flex-row items-center justify-between'>
                    <h2 className="text-xl items font-bold mb-auto">{field.name}</h2>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        field.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {field.status === 'available' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 line-clamp-2" title={field.name}>
                    06:00 - 17:00 Rp.{field.priceDay}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2" title={field.name}>
                    18:00 - 23:00 Rp.{field.priceNight}
                    </p>
                  </div>
                  <div className="mb-2">
                  </div>
                  {field.type && (
                    <p className="text-sm text-gray-500">
                      Lapangan {field.type.name}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-4">
                  <Button asChild className="w-full">
                    <Link href={`/fields/${field.id}`}>Lihat Detail</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {totalItems > limit && (
            <div className="flex justify-between items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-500">Halaman {page} dari {Math.ceil(totalItems / limit)}</span>
              <Button 
                variant="outline" 
                disabled={page >= Math.ceil(totalItems / limit)} 
                onClick={() => setPage((prev) => prev + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 