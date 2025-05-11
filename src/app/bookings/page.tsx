"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingApi } from "@/api/booking.api";
import { useForm } from "react-hook-form";
import { BookingWithPayment, Field, Branch, Booking } from "@/types";
import { branchApi, fieldApi } from "@/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { format } from "date-fns";
import { initSocket, joinFieldAvailabilityRoom, subscribeToFieldAvailability, requestAvailabilityUpdate } from "@/config/socket.config";

// Komponen-komponen terpisah untuk halaman booking
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingForm from "@/components/booking/BookingForm";
import LoadingState from "@/components/booking/LoadingState";
import ErrorState from "@/components/booking/ErrorState";

const bookingSchema = z.object({
  fieldId: z.number(),
  bookingDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;
type BookingRequest = {
  userId: number;
  fieldId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithPayment[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [selectedField, setSelectedField] = useState<number>(0);
  const [selectedBranchName, setSelectedBranchName] =
    useState<String>("Cabang");
  const [selectedFieldName, setSelectedFieldName] =
    useState<String>("Lapangan");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("-");
  const [bookedTimeSlots, setBookedTimeSlots] = useState<{[key: number]: string[]}>({});
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  // Pindahkan array times ke luar agar tidak dibuat ulang setiap render
  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21.00",
    "22:00",
    "23:00",
  ];
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fieldId: 0,
      bookingDate: "",
      startTime: "",
      endTime: "",
    },
  });
  
  const user = useAuth();
  const userId = user?.user?.id || 0; 

  // Fungsi untuk memperbarui data ketersediaan lapangan
  const refreshAvailability = useCallback(async () => {
    if (!selectedBranch || !selectedDate) return;
    
    setRefreshing(true);
    
    try {
      console.log("Manually refreshing availability data for date:", selectedDate);
      
      // Hapus cache untuk memastikan data di-refresh
      sessionStorage.removeItem(`${selectedBranch}_${selectedDate}`);
      
      // Request update melalui socket.io
      requestAvailabilityUpdate(selectedDate, selectedBranch);
      
      // Fallback ke API REST jika socket tidak berfungsi
      const bookedSlots = await fieldApi.fetchBookedTimeSlots(
        selectedBranch,
        selectedDate,
        fields,
        times
      );
      
      setBookedTimeSlots(bookedSlots);
    } catch (error) {
      console.error("Error refreshing availability data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedBranch, selectedDate, fields, times]);

  // Mengambil data cabang dan lapangan
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Ambil data cabang
        const response = await branchApi.getBranches();
        const branches = response.data || [];
        
        if (Array.isArray(branches) && branches.length > 0) {
          setSelectedBranch(branches[0].id);
          setSelectedBranchName(branches[0].name);
          setBranches(branches);
        } else {
          console.error("branches is not an array or empty:", branches);
          setBranches([]);
        }
        
        // Ambil data lapangan
        const fields = await fieldApi.getAllFields();
        setFields(Array.isArray(fields) ? fields : []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
        setLoading(false);
      }
    };

    fetchData();
    
    // Inisialisasi socket.io
    try {
      const socket = initSocket();
      console.log('Socket initialized in booking page');
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
    
  }, []);

  // Setup socket.io subscription untuk update real-time
  useEffect(() => {
    if (selectedDate && selectedBranch) {
      // Gabung room berdasarkan tanggal dan cabang
      joinFieldAvailabilityRoom(selectedBranch, selectedDate);
      
      // Subscribe untuk pembaruan ketersediaan lapangan
      const unsubscribe = subscribeToFieldAvailability((data) => {
        console.log('Received field availability update from socket.io:', data);
        // Update bookedTimeSlots berdasarkan data dari server
        if (data && Array.isArray(data)) {
          const newBookedSlots: {[key: number]: string[]} = {};
          
          // Proses data dari socket
          data.forEach((fieldData: any) => {
            if (fieldData.fieldId) {
              const fieldId = fieldData.fieldId;
              const availableTimeSlots = fieldData.availableTimeSlots || [];
              
              // Konversi slot waktu tersedia menjadi jam
              const availableHours = new Set<string>();
              availableTimeSlots.forEach((slot: any) => {
                const startTime = new Date(slot.start);
                const endTime = new Date(slot.end);
                
                for (let hour = startTime.getHours(); hour < endTime.getHours(); hour++) {
                  availableHours.add(`${hour.toString().padStart(2, '0')}:00`);
                }
              });
              
              // Cari jam yang tidak tersedia (terpesan)
              const bookedHours = times.filter(time => !Array.from(availableHours).includes(time));
              newBookedSlots[fieldId] = bookedHours;
            }
          });
          
          setBookedTimeSlots(newBookedSlots);
        }
      });
      
      // Set up interval untuk meminta pembaruan data setiap 30 detik
      const refreshInterval = setInterval(() => {
        requestAvailabilityUpdate(selectedDate, selectedBranch);
      }, 30000); // 30 detik
      
      // Cleanup subscription dan interval saat unmount atau dependency berubah
      return () => {
        unsubscribe();
        clearInterval(refreshInterval);
      };
    }
  }, [selectedDate, selectedBranch, times]);

  // Mengambil data slot waktu yang terpesan
  useEffect(() => {
    const getBookedTimeSlots = async () => {
      if (selectedBranch && selectedDate && fields.length > 0) {
        console.log("Getting booked time slots for date:", selectedDate);
        
        const bookedSlots = await fieldApi.fetchBookedTimeSlots(
          selectedBranch,
          selectedDate,
          fields,
          times
        );
        setBookedTimeSlots(bookedSlots);
      }
    };

    getBookedTimeSlots();
    
    // Hapus times dari dependency array karena sekarang stabil dan tidak berubah
  }, [selectedBranch, selectedDate, fields]);

  // Handler untuk form submission
  const onSubmit = async (formData: BookingFormValues) => {
    setLoading(true);
    setError(null);

    if (!selectedField || selectedStartTime === "-" || !formData.endTime) {
      setError("Silakan pilih lapangan dan waktu terlebih dahulu");
      setLoading(false);
      return;
    }

    // Pastikan waktu mulai kurang dari waktu selesai
    const startHour = parseInt(selectedStartTime.split(":")[0], 10);
    const endHour = parseInt(formData.endTime.split(":")[0], 10);

    if (startHour >= endHour) {
      setError("Waktu selesai harus lebih besar dari waktu mulai");
      setLoading(false);
      return;
    }

    const dataToSend: BookingRequest = {
      userId: userId,
      fieldId: selectedField,
      bookingDate: selectedDate,
      startTime: selectedStartTime,
      endTime: formData.endTime,
    };

    try {
      const bookingResult = await bookingApi.createBooking(dataToSend);
      console.log("Booking Berhasil:", bookingResult);
      
      // Hapus cache ketersediaan untuk memastikan data di-refresh di halaman selanjutnya
      const cacheKey = `${selectedBranch}_${selectedDate}`;
      sessionStorage.removeItem(cacheKey);
      
      // Refresh ketersediaan lapangan
      refreshAvailability();
      
      // Arahkan ke halaman riwayat booking
      router.push("/bookings/history");
    } catch (error) {
      console.error("Booking error:", error);
      setError("Data booking salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const branchChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = Number(e.target.value);
    setSelectedBranch(branchId);

    const branch = branches.find((branch) => branch.id === branchId);
    setSelectedBranchName(branch?.name || "Cabang");
  };

  const dateValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const selectTimeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [time, field, fieldName] = e.target.value.split("|");
    setSelectedStartTime(time);
    setSelectedField(Number(field));
    setSelectedFieldName(fieldName);
  };

  const showPicker = () => {
    const dateInput = document.getElementById(
      "hiddenDateInput"
    ) as HTMLInputElement;
    if (dateInput) {
      dateInput.showPicker();
    }
  };

  // Render states
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Main render
  return (
    <div className="container mx-auto py-8 px-4 ">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-center font-bold">
          Jadwal Booking
        </h1>
        <button 
          onClick={refreshAvailability}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2"
        >
          {refreshing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memperbarui...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Perbarui Ketersediaan</span>
            </>
          )}
        </button>
      </div>
      <section className="flex flex-col mt-5">
        <BookingHeader
          selectedDate={selectedDate}
          selectedBranch={selectedBranch}
          branches={branches}
          dateValueHandler={dateValueHandler}
          branchChanged={branchChanged}
          showPicker={showPicker}
        />
        
        <TimeSlotSelector
          fields={fields}
          times={times}
          selectedBranch={selectedBranch}
          bookedTimeSlots={bookedTimeSlots}
          selectTimeHandle={selectTimeHandle}
        />
      </section>

      <section className="mt-8">
        <BookingForm
          selectedFieldName={selectedFieldName}
          selectedBranchName={selectedBranchName}
          selectedStartTime={selectedStartTime}
          times={times}
          form={form}
          onSubmit={onSubmit}
        />
      </section>
    </div>
  );
}
