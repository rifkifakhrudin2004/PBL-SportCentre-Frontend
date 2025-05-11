"use client";

import { Field } from "@/types";
import { useState, useEffect, useMemo } from "react";

type TimeSlotSelectorProps = {
  fields: Field[];
  times: string[];
  selectedBranch: number;
  bookedTimeSlots: {[key: number]: string[]};
  selectTimeHandle: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function TimeSlotSelector({
  fields,
  times,
  selectedBranch,
  bookedTimeSlots,
  selectTimeHandle,
}: TimeSlotSelectorProps) {
  // Gunakan useMemo untuk mencegah pembuatan ulang filteredFields pada setiap render
  const filteredFields = useMemo(() => {
    return fields.filter((field) => field.branchId === selectedBranch);
  }, [fields, selectedBranch]);

  const [consecutiveBooking, setConsecutiveBooking] = useState<{[key: number]: {[key: string]: boolean}}>({});

  // Mendeteksi jika jam sebelumnya tersedia atau tidak untuk setiap lapangan
  useEffect(() => {
    // Buat objek untuk melacak status konsekutif
    const newConsecutiveStatus: {[key: number]: {[key: string]: boolean}} = {};
    
    filteredFields.forEach(field => {
      newConsecutiveStatus[field.id] = {};
      
      // Untuk setiap waktu, tentukan jika tersedia secara konsekutif
      times.forEach((time, index) => {
        // Jam pertama selalu dapat dipilih jika tersedia
        if (index === 0) {
          newConsecutiveStatus[field.id][time] = true;
          return;
        }
        
        const prevTime = times[index - 1];
        const isPrevTimeBooked = bookedTimeSlots[field.id]?.includes(prevTime);
        
        // Jam ini hanya dapat dipilih jika jam sebelumnya tersedia dan tidak terpesan
        newConsecutiveStatus[field.id][time] = !isPrevTimeBooked;
      });
    });
    
    // Bandingkan dengan state sebelumnya untuk menghindari update yang tidak perlu
    setConsecutiveBooking(prev => {
      // Jika secara struktural sama, jangan update state
      if (JSON.stringify(prev) === JSON.stringify(newConsecutiveStatus)) {
        return prev;
      }
      return newConsecutiveStatus;
    });
  }, [filteredFields, bookedTimeSlots, times]);

  // Gunakan fungsi untuk menentukan kelas CSS untuk slot waktu
  const getTimeSlotClass = (field: Field, time: string) => {
    const isTimeBooked = bookedTimeSlots[field.id]?.includes(time);
    const isConsecutive = consecutiveBooking[field.id]?.[time];
    
    if (isTimeBooked || field.status === "booked") 
      return "bg-red-300 text-white cursor-not-allowed";
    if (field.status === "maintenance") 
      return "bg-yellow-100 cursor-not-allowed";
    if (field.status === "closed") 
      return "bg-red-300 text-white cursor-not-allowed";
    if (!isConsecutive) 
      return "bg-gray-200 text-gray-500 cursor-not-allowed";
    return "bg-green-100 hover:bg-green-200 cursor-pointer";
  };

  const getTimeSlotStatus = (field: Field, time: string) => {
    const isTimeBooked = bookedTimeSlots[field.id]?.includes(time);
    const isConsecutive = consecutiveBooking[field.id]?.[time];
    
    if (isTimeBooked) return "Terpesan";
    if (field.status !== "available") return field.status;
    if (!isConsecutive) return "Jam tidak berurutan";
    return "Tersedia";
  };

  const isTimeSlotDisabled = (field: Field, time: string) => {
    const isTimeBooked = bookedTimeSlots[field.id]?.includes(time);
    const isConsecutive = consecutiveBooking[field.id]?.[time];
    
    return field.status !== "available" || isTimeBooked || !isConsecutive;
  };

  return (
    <div className="flex flex-wrap gap-1 border border-gray-300 p-1">
      {filteredFields.length > 0 ? (
        filteredFields.map((field) => (
          <div key={field.id} className="w-full sm:w-[48%] md:w-[20%] border border-gray-500 overflow-hidden shadow">
            <div className="bg-gray-200 text-center py-2 font-semibold">{field.name}</div>
            <table className="table-fixed border-collapse w-full text-sm">
              <tbody>
                {times.map((time, index) => {
                  const isDisabled = isTimeSlotDisabled(field, time);
                  
                  return (
                    <tr key={index}>
                      <td className="w-[30%] text-center border border-gray-300 px-2 py-1">{time}</td>
                      <td className="w-[70%] border border-gray-300 p-0">
                        <div className="relative">
                          <input
                            type="radio"
                            name="bookingTime"
                            value={`${time}|${field.id}|${field.name}`}
                            onChange={selectTimeHandle}
                            id={`booking-${field.id}-${time}`}
                            className="peer hidden"
                            disabled={isDisabled}
                          />
                          <label
                            htmlFor={`booking-${field.id}-${time}`}
                            className={`flex items-center gap-2 px-2 py-1 transition-colors
                              ${getTimeSlotClass(field, time)}
                              peer-checked:bg-green-500 peer-checked:hover:bg-green-500`}
                          >
                            <span className="capitalize">
                              {getTimeSlotStatus(field, time)}
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div className="w-full text-center text-red-500 font-semibold">
          Cabang Belum Memiliki Lapangan
        </div>
      )}
    </div>
  );
} 