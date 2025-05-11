"use client";

import { UseFormReturn } from "react-hook-form";

type BookingFormProps = {
  selectedFieldName: String;
  selectedBranchName: String;
  selectedStartTime: string;
  times: string[];
  form: UseFormReturn<any>;
  onSubmit: (formData: any) => Promise<void>;
};

export default function BookingForm({
  selectedFieldName,
  selectedBranchName,
  selectedStartTime,
  times,
  form,
  onSubmit,
}: BookingFormProps) {
  // Filter waktu selesai yang valid (harus lebih besar dari waktu mulai)
  const getValidEndTimes = () => {
    if (selectedStartTime === "-") return [];
    
    const startHour = parseInt(selectedStartTime.split(":")[0], 10);
    return times.filter(time => {
      const hour = parseInt(time.split(":")[0], 10);
      return hour > startHour;
    });
  };
  
  const validEndTimes = getValidEndTimes();

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-center mb-2">Pesanan Anda</h2>
      <div className="mb-6 text-center">
        <h4 className="text-lg font-medium text-black">
          Lapangan {selectedFieldName === "Lapangan" ? "Belum Dipilih" : selectedFieldName}
        </h4>
        <p className="text-black">
          Cabang {selectedBranchName === "Cabang" ? "Pilih Cabang" : selectedBranchName}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Jam Mulai:
            </label>
            <input
              type="text"
              name="startTime"
              value={selectedStartTime}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              Jam Selesai:
            </label>
            <select
              id="endTime"
              {...form.register("endTime")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={selectedStartTime === "-" || validEndTimes.length === 0}
            >
              <option value="">Pilih Jam Selesai</option>
              {validEndTimes.map((time, index) => (
                <option key={index} value={time}>{time}</option>
              ))}
            </select>
            {selectedStartTime !== "-" && validEndTimes.length === 0 && (
              <p className="text-red-500 text-sm mt-1">Tidak ada jam tersedia setelah {selectedStartTime}</p>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            disabled={selectedStartTime === "-" || validEndTimes.length === 0}
          >
            Booking
          </button>
        </div>
      </form>
    </div>
  );
} 