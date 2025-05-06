'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { fieldApi } from '@/api/field.api';
import { bookingApi } from '@/api/booking.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldStatus } from '@/types';
import Link from 'next/link';

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const fieldId = parseInt(params.id);

  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState<string>('');

  // Fetch field data
  useEffect(() => {
    const fetchField = async () => {
      setLoading(true);
      try {
        const data = await fieldApi.getFieldById(fieldId);
        setField(data);
      } catch (error) {
        console.error('Error fetching field details:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data lapangan. Silakan coba lagi.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchField();
  }, [fieldId, toast]);

  // Fetch availability when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date) return;

      setLoadingSlots(true);
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const { slots } = await fieldApi.checkFieldAvailability(fieldId, formattedDate);
        setAvailableSlots(slots);

        // Extract available start times
        const availableStartTimeList = slots
          .filter((slot) => slot.available)
          .map((slot) => slot.time);
        setAvailableStartTimes(availableStartTimeList);
        
        // Reset selected times
        setStartTime('');
        setEndTime('');
        setAvailableEndTimes([]);
      } catch (error) {
        console.error('Error fetching field availability:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat ketersediaan lapangan. Silakan coba lagi.',
          variant: 'destructive',
        });
        setAvailableSlots([]);
        setAvailableStartTimes([]);
        setAvailableEndTimes([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [date, fieldId, toast]);

  // Update available end times when start time changes
  useEffect(() => {
    if (!startTime) {
      setAvailableEndTimes([]);
      setEndTime('');
      return;
    }

    // Find the index of the selected start time
    const startTimeIndex = availableSlots.findIndex(slot => slot.time === startTime);
    if (startTimeIndex === -1) return;

    // Get continuous available slots after the start time
    const endTimeChoices: string[] = [];
    
    for (let i = startTimeIndex + 1; i < availableSlots.length; i++) {
      const slot = availableSlots[i];
      if (!slot.available) break; // Stop at first unavailable slot
      endTimeChoices.push(slot.time);
    }

    setAvailableEndTimes(endTimeChoices);
    setEndTime(endTimeChoices.length > 0 ? endTimeChoices[0] : '');
  }, [startTime, availableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!field || !date || !startTime || !endTime) {
      toast({
        title: 'Error',
        description: 'Silakan lengkapi semua data booking.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const bookingData = {
        fieldId,
        bookingDate: formattedDate,
        startTime,
        endTime,
        promoCode: promoCode || undefined,
        notes: notes || undefined,
        branchId: field.branchId,
      };

      const booking = await bookingApi.createBooking(bookingData);
      
      toast({
        title: 'Sukses',
        description: 'Booking berhasil dibuat. Silakan lanjutkan ke pembayaran.',
      });
      
      if (booking.payment?.paymentUrl) {
        window.location.href = booking.payment.paymentUrl;
      } else {
        router.push(`/bookings/${booking.id}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat booking. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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

  if (field.status !== FieldStatus.AVAILABLE) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Lapangan tidak tersedia untuk dibooking</h1>
          <Button asChild className="mt-4">
            <Link href={`/fields/${fieldId}`}>Kembali ke Detail Lapangan</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Booking Lapangan</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="date">Tanggal Booking</Label>
                  <div className="mt-2">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      className="border rounded-md p-4"
                      locale={id}
                      disabled={{ before: new Date() }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Jam Mulai</Label>
                    <Select
                      value={startTime}
                      onValueChange={setStartTime}
                      disabled={loadingSlots || availableStartTimes.length === 0}
                    >
                      <SelectTrigger id="startTime">
                        <SelectValue placeholder="Pilih jam mulai" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStartTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="endTime">Jam Selesai</Label>
                    <Select
                      value={endTime}
                      onValueChange={setEndTime}
                      disabled={loadingSlots || !startTime || availableEndTimes.length === 0}
                    >
                      <SelectTrigger id="endTime">
                        <SelectValue placeholder="Pilih jam selesai" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEndTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promoCode">Kode Promo (opsional)</Label>
                  <Input
                    id="promoCode"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Masukkan kode promo jika ada"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Masukkan catatan jika ada"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/fields/${fieldId}`)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !startTime || !endTime}
                  >
                    {submitting ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detail Lapangan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Nama Lapangan</h3>
                  <p>{field.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Tipe</h3>
                  <p>{field.type.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Harga</h3>
                  <p>Siang: Rp{field.priceDay.toLocaleString()}</p>
                  <p>Malam: Rp{field.priceNight.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Tanggal</h3>
                  <p>{date ? format(date, 'dd MMMM yyyy', { locale: id }) : '-'}</p>
                </div>
                {startTime && endTime && (
                  <div>
                    <h3 className="font-semibold">Waktu</h3>
                    <p>{startTime} - {endTime}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 