'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldStatus, Branch } from '@/types';
import { fieldApi } from '@/api/field.api';
import { branchApi } from '@/api/branch.api';

import FieldAvailabilityClient from '@/components/field/FieldAvailability';
import FieldReviewsClient from '@/components/field/FieldReview';
import { useParams } from 'next/navigation';
import TimeSlotSelector from '@/components/booking/TimeSlotSelector';

export default function FieldDetailPage() {
  const params = useParams<{ id: string }>();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');
  const fieldId = parseInt(params.id);[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [selectedBranchName, setSelectedBranchName] =useState<String>("Cabang");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);

  useEffect(() => {
      const fetchBranches = async () => {
        try {
          const response = await branchApi.getBranches();
          const branches = response.data || [];
          console.log("branches: ", branches);
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
      
      const fetchFields = async () => {
        setLoading(true);
        setError(null);
        try {
          const fields = await fieldApi.getAllFields();
          setFields(Array.isArray(fields) ? fields : []);
        } catch (error) {
          console.error("Error fetching user bookings:", error);
          setError("Gagal memuat lapangan. Silakan coba lagi nanti.");
        } finally {
          setLoading(false);
        }
      };
      
      const fetchField = async () => {
        try {
          const fieldId = parseInt(params.id);
          console.log("fieldId: ", fieldId);
          const fieldResponse = await fieldApi.getFieldById(fieldId);
          console.log("field data page: ", fieldResponse);
          if (fieldResponse) {
            console.log("field data decision: ", fieldResponse);
            setField(Array.isArray(fieldResponse) ? fieldResponse[0] : fieldResponse);
          } else {
            throw new Error('Data lapangan tidak ditemukan.');
          }
        } catch (error) {
          console.error("Error fetching field:", error);
          setField(null);
        } finally {
          setLoading(false);
        }
      };

      fetchBranches();
      fetchFields();
      fetchField();
    }, []);
  
    useEffect(() => {
      const query = searchQuery.toLowerCase();
  
      const filtered = fields.filter((field) => {
        const matchesBranch = selectedBranch === 0 || field.branchId === selectedBranch;
        const matchesSearch = query === '' || field.name.toLowerCase().includes(query) || field.type.name.toLowerCase().includes(query);
        return matchesBranch && matchesSearch;
      });
  
      setFilteredFields(filtered);
    }, [searchQuery, selectedBranch, fields]);
  
    const handleRefresh = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fieldApi.getAllFields();
        
        setFields(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('[ERROR] Error refreshing branches:', error);
        setError('Gagal memuat daftar cabang. Silakan coba lagi nanti.');
        setDebug(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };
    
  
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    };
    
    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    };
    
    const branchChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const branchId = Number(e.target.value);
      setSelectedBranch(branchId);
  
      const branch = branches.find((branch) => branch.id === branchId);
      setSelectedBranchName(branch?.name || "Cabang");
      handleFilter;
    };

  if (!field) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Lapangan tidak ditemukan</h1>
          <Button asChild className="mt-4">
            <Link href="/branches">Kembali ke Daftar Cabang</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAvailable = field.status === FieldStatus.AVAILABLE;

  return (
    <div className="container mx-auto mt-5 py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
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
        <div>
          <h1 className="text-3xl font-bold mb-4">{field.name}</h1>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Tipe Lapangan</h2>
            <p className="text-gray-700">{field.type.name}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Harga</h2>
            <p className="text-gray-700">Siang: Rp{field.priceDay.toLocaleString()}</p>
            <p className="text-gray-700">Malam: Rp{field.priceNight.toLocaleString()}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Status</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              field.status === FieldStatus.AVAILABLE ? 'bg-green-100 text-green-800' : 
              field.status === FieldStatus.BOOKED ? 'bg-yellow-100 text-yellow-800' : 
              field.status === FieldStatus.MAINTENANCE ? 'bg-orange-100 text-orange-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {field.status === FieldStatus.AVAILABLE ? 'Tersedia' : 
                field.status === FieldStatus.BOOKED ? 'Sudah Dibooking' : 
                field.status === FieldStatus.MAINTENANCE ? 'Maintenance' : 
                'Tutup'}
            </span>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full" disabled={!isAvailable}>
              <Link href={isAvailable ? "/booking" : "#"}>
                {isAvailable ? 'Pesan Sekarang' : 'Tidak Tersedia'}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        <div className="mt-10 w-auto">
          <h2 className="text-2xl font-bold mb-6">Jadwal Ketersediaan</h2>
          <FieldAvailabilityClient field={field}/>
        </div>

        <div className="mt-10 w-[50%]">
          <h2 className="text-2xl font-bold mb-6">Ulasan</h2>
          <FieldReviewsClient fieldId={field.id} />
        </div>
      </div>

      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href={`/fields`}>Kembali ke Daftar Lapangan</Link>
        </Button>
      </div>
    </div>
  );
}


