"use client";

import { Button } from "@/components/ui/button";
import { useBooking } from "@/hooks/useBooking.hook";
import { useDurationCalculator } from "@/hooks/useDurationCalculator.hook";

export default function BookingForm() {
  // Menggunakan hook context
  const {
    selectedFieldName,
    selectedBranchName,
    selectedStartTime,
    selectedEndTime,
    form,
    onSubmit,
    loading
  } = useBooking();

  // Menggunakan custom hook untuk menghitung durasi
  const { durationInHours } = useDurationCalculator();

  // Pastikan format waktu yang ditampilkan sesuai dengan timezone lokal
  const formattedStartTime = selectedStartTime === "-" ? "" : selectedStartTime;
  const formattedEndTime = selectedEndTime || "";

  return (
    <div className="max-w-xl mx-auto bg-white shadow rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-center mb-6">Pesanan Anda</h2>
      
      {loading ? (
        <div className="flex flex-col items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-lg font-medium">Memproses pemesanan...</p>
          <p className="text-sm text-gray-500">Mohon tunggu sebentar</p>
        </div>
      ) : (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Lapangan:</span>
            <span className="font-medium">{selectedFieldName === "Lapangan" ? "-" : selectedFieldName}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cabang:</span>
            <span className="font-medium">{selectedBranchName === "Cabang" ? "-" : selectedBranchName}</span>
          </div>
          
          <hr className="my-2" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="startTime" className="block text-sm text-gray-600">
                Jam Mulai:
              </label>
              <input
                type="text"
                name="startTime"
                value={formattedStartTime}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="endTime" className="block text-sm text-gray-600">
                Jam Selesai:
              </label>
              <input
                type="text"
                name="endTime"
                value={formattedEndTime}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700"
              />
            </div>
          </div>
        </div>

        {selectedStartTime !== "-" && selectedEndTime && (
          <div className="border border-gray-200 rounded p-3 bg-gray-50 text-center">
            <p className="text-sm text-gray-600 mb-1">Durasi Booking:</p>
            <p className="font-medium">
              {formattedStartTime} - {formattedEndTime}
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {durationInHours} jam
              </span>
            </p>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full py-3 bg-black hover:bg-black/90 text-white font-medium rounded transition-all"
            disabled={selectedStartTime === "-" || !selectedEndTime}
          >
            Booking & Bayar Sekarang
          </Button>
        </div>
      </form>
      )}
    </div>
  );
} 