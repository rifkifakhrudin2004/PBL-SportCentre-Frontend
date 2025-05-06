import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fieldApi } from '@/api/field.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldStatus } from '@/types';

async function getFieldData(id: number): Promise<Field | null> {
  try {
    const field = await fieldApi.getFieldById(id);
    return field;
  } catch (error) {
    console.error('Error fetching field data:', error);
    return null;
  }
}

export default async function FieldDetailPage({ params }: { params: { id: string } }) {
  const fieldId = parseInt(params.id);
  const field = await getFieldData(fieldId);

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
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          {field.imageUrl ? (
            <Image
              src={field.imageUrl}
              alt={field.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Tidak ada gambar</span>
            </div>
          )}
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
              <Link href={`/fields/${field.id}/book`}>
                {isAvailable ? 'Pesan Sekarang' : 'Tidak Tersedia'}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Jadwal Ketersediaan</h2>
        <FieldAvailabilityClient fieldId={field.id} />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Ulasan</h2>
        <FieldReviewsClient fieldId={field.id} />
      </div>

      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href={`/branches/${field.branchId}`}>Kembali ke Detail Cabang</Link>
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { fieldApi } from '@/api/field.api';
import { Star, StarHalf } from 'lucide-react';
import { FieldReview } from '@/types';

function FieldAvailabilityClient({ fieldId }: { fieldId: number }) {
  const [date, setDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const { slots } = await fieldApi.checkFieldAvailability(fieldId, formattedDate);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error fetching field availability:', error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [fieldId, date]);

  return (
    <div>
      <Tabs defaultValue="calendar">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="list">Daftar Slot</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <Card>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="mx-auto"
                locale={id}
                disabled={{ before: new Date() }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Slot Tersedia Tanggal {format(date, 'dd MMMM yyyy', { locale: id })}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-center text-gray-500 py-6">Tidak ada data ketersediaan</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md text-center ${
                        slot.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {slot.time}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FieldReviewsClient({ fieldId }: { fieldId: number }) {
  const [reviews, setReviews] = useState<FieldReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await fieldApi.getFieldReviews(fieldId);
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching field reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [fieldId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className="text-center text-gray-500 py-6">Belum ada ulasan</p>;
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} fill="currentColor" size={18} className="text-yellow-500" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" fill="currentColor" size={18} className="text-yellow-500" />);
    }

    return stars;
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <div className="flex mr-2">{renderStars(review.rating)}</div>
              <span className="text-sm text-gray-600">
                {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: id })}
              </span>
            </div>
            {review.review && <p className="text-gray-700">{review.review}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 