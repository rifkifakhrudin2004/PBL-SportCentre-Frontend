"use client";

import { useTimeSlot } from "@/hooks/useTimeSlot.hook";

/**
 * Time Slot Selector Component
 * 
 * CATATAN PENTING TENTANG TIME SLOTS:
 * - Semua endTime bersifat exclusive (tidak termasuk dalam booking)
 * - Contoh: booking 08:00-10:00 berarti dari jam 08:00 sampai 09:59:59
 * - Dalam tampilan UI, slot 08:00 dan 09:00 akan ditampilkan sebagai "Terpesan"
 * - Slot 10:00 akan tersedia untuk booking berikutnya
 * - Ini penting agar tidak terjadi overlap booking
 */

export default function TimeSlotSelector() {
  // Menggunakan custom hook untuk memisahkan logika
  const {
    filteredFields,
    getTimeSlotStatus,
    getTimeSlotClass,
    getStatusIcon,
    isTimeSlotDisabled,
    handleTimeClick
  } = useTimeSlot();

  // Render SVG icon menggunakan dangerouslySetInnerHTML
  const renderIcon = (iconHTML: string) => {
    return (
      <div dangerouslySetInnerHTML={{ __html: iconHTML }} />
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {filteredFields.length > 0 ? (
        filteredFields.map((field) => (
          <div key={field.id} className="border border-gray-200 rounded overflow-hidden bg-white">
            <div className="text-center py-2 font-semibold border-b border-gray-200">
              {field.name}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {[...Array(16)].map((_, index) => {
                const time = `${(index + 8).toString().padStart(2, '0')}:00`;
                const status = getTimeSlotStatus(field, time);
                const isDisabled = isTimeSlotDisabled(field, time);
                const iconHTML = getStatusIcon(field, time);
                
                return (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center border-b border-gray-100 last:border-b-0 cursor-pointer ${isDisabled ? 'cursor-not-allowed' : ''}`}
                    onClick={() => handleTimeClick(time, field)}
                  >
                    <div className="py-2 px-3 w-[30%] text-left border-r border-gray-100">
                      {time}
                    </div>
                    <div className={`py-2 px-3 flex-1 flex justify-between items-center ${getTimeSlotClass(field, time)}`}>
                      <span className="font-medium text-sm">
                        {status}
                      </span>
                      {iconHTML && renderIcon(iconHTML)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-8 text-center bg-red-50 rounded border border-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-500 font-semibold">Cabang Belum Memiliki Lapangan</p>
        </div>
      )}
    </div>
  );
} 