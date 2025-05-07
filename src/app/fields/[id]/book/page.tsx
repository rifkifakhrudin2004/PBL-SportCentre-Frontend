'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, isBefore, startOfToday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { useAuth } from '@/context/auth.context';
import { fieldApi } from '@/api/field.api';
import { bookingApi } from '@/api/booking.api';
import { Field } from '@/types';

interface TimeSlot {
  time: string;
  available: boolean;
}

// Validasi form menggunakan Zod
const bookingSchema = z.object({
  date: z.date({
    required_error: 'Tanggal wajib diisi',
  }),
  startTime: z.string({
    required_error: 'Waktu mulai wajib dipilih',
  }),
  duration: z.string({
    required_error: 'Durasi wajib dipilih',
  }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [field, setField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const fieldId = parseInt(params.id as string);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: undefined,
      startTime: '',
      duration: '1',
      notes: '',
    },
  });

  // Ambil detail lapangan dan periksa ketersediaan
  useEffect(() => {
    const fetchField = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Dapatkan detail lapangan
        const fieldData = await fieldApi.getFieldById(fieldId);
        setField(fieldData);

        // Atur tanggal default ke hari ini dan periksa ketersediaan
        const today = startOfToday();
        await checkAvailability(today);
        
        form.setValue('date', today);
      } catch (err) {
        console.error('Error fetching field:', err);
        setError('Gagal memuat data lapangan. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };

    if (fieldId) {
      fetchField();
    }
  }, [fieldId, form]);

  // Fungsi untuk memeriksa ketersediaan lapangan untuk tanggal tertentu
  const checkAvailability = async (date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const availability = await fieldApi.checkFieldAvailability(fieldId, formattedDate);
      setTimeSlots(availability.slots || []);
    } catch (err) {
      console.error('Error checking availability:', err);
      setTimeSlots([]);
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=booking');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Siapkan data booking
      const startTime = parse(data.startTime, 'HH:mm', new Date());
      const hoursDuration = parseInt(data.duration);
      
      // Gunakan tanggal dari formulir dan waktu dari startTime
      const bookingDate = new Date(data.date);
      const startTimeDate = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );
      
      // Hitung waktu akhir dengan menambahkan durasi
      const endTimeDate = new Date(startTimeDate);
      endTimeDate.setHours(endTimeDate.getHours() + hoursDuration);
      
      const bookingData = {
        fieldId,
        bookingDate: format(bookingDate, 'yyyy-MM-dd'),
        startTime: format(startTimeDate, "yyyy-MM-dd'T'HH:mm:ss"),
        endTime: format(endTimeDate, "yyyy-MM-dd'T'HH:mm:ss"),
        notes: data.notes,
      };

      // Buat booking
      const response = await bookingApi.createBooking(bookingData);
      
      // Redirect ke halaman pembayaran atau detail booking
      router.push(`/bookings/${response.id}`);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Gagal membuat reservasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle perubahan tanggal dari Calendar
  const handleDateChange = async (date: Date | undefined) => {
    if (date) {
      form.setValue('date', date);
      await checkAvailability(date);
      form.setValue('startTime', '');  // Reset waktu mulai ketika tanggal berubah
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Lapangan tidak ditemukan'}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pesan Lapangan</h1>
          <p className="text-muted-foreground">
            {field.name} - {field.type?.name || 'Tipe Lapangan'}
          </p>
        </div>

        {!isAuthenticated && (
          <Alert className="mb-6">
            <AlertDescription>
              Silakan login terlebih dahulu untuk melanjutkan pemesanan.
              Anda akan dialihkan ke halaman login saat melakukan pemesanan.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Detail Lapangan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {field.imageUrl && (
                  <div className="w-full h-48 bg-muted rounded-md overflow-hidden">
                    <img
                      src={field.imageUrl}
                      alt={field.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div>
                  <Label>Nama Lapangan</Label>
                  <p className="font-medium">{field.name}</p>
                </div>
                
                <div>
                  <Label>Cabang</Label>
                  <p className="font-medium">ID: {field.branchId}</p>
                </div>
                
                <div>
                  <Label>Tipe</Label>
                  <p className="font-medium">{field.type?.name || '-'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Harga Siang</Label>
                    <p className="font-medium">Rp {parseInt(field.priceDay.toString()).toLocaleString('id-ID')}/jam</p>
                  </div>
                  <div>
                    <Label>Harga Malam</Label>
                    <p className="font-medium">Rp {parseInt(field.priceNight.toString()).toLocaleString('id-ID')}/jam</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Formulir Pemesanan</CardTitle>
                <CardDescription>
                  Pilih tanggal, waktu, dan durasi pemesanan Anda
                </CardDescription>
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
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Tanggal</FormLabel>
                          <div className="flex items-center rounded-md border border-input bg-background px-3 py-2">
                            {field.value ? (
                              format(field.value, "d MMMM yyyy")
                            ) : (
                              <span className="text-muted-foreground">Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </div>
                          <div className="mt-2">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={handleDateChange}
                              disabled={(date) => isBefore(date, startOfToday())}
                              initialFocus
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Mulai</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {timeSlots.map((slot) => (
                                <div key={slot.time}>
                                  <input
                                    type="radio"
                                    id={`time-${slot.time}`}
                                    value={slot.time}
                                    checked={field.value === slot.time}
                                    onChange={() => field.onChange(slot.time)}
                                    disabled={!slot.available}
                                    className="sr-only"
                                  />
                                  <label
                                    htmlFor={`time-${slot.time}`}
                                    className={cn(
                                      "flex items-center justify-center px-3 py-2 border rounded-md cursor-pointer",
                                      field.value === slot.time
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : slot.available
                                        ? "border-input hover:bg-accent hover:text-accent-foreground"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                  >
                                    <ClockIcon className="mr-2 h-4 w-4" />
                                    {slot.time}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durasi (Jam)</FormLabel>
                          <FormControl>
                            <div className="flex space-x-2">
                              {[1, 2, 3].map((hours) => (
                                <div key={hours}>
                                  <input
                                    type="radio"
                                    id={`duration-${hours}`}
                                    value={hours.toString()}
                                    checked={field.value === hours.toString()}
                                    onChange={() => field.onChange(hours.toString())}
                                    className="sr-only"
                                  />
                                  <label
                                    htmlFor={`duration-${hours}`}
                                    className={cn(
                                      "flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer",
                                      field.value === hours.toString()
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-input hover:bg-accent hover:text-accent-foreground"
                                    )}
                                  >
                                    {hours} jam
                                  </label>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catatan (Opsional)</FormLabel>
                          <FormControl>
                            <textarea
                              placeholder="Catatan tambahan untuk pemesanan"
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 