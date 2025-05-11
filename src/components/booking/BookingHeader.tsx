"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Branch } from "@/types";

type BookingHeaderProps = {
  selectedDate: string;
  selectedBranch: number;
  branches: Branch[];
  dateValueHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  branchChanged: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  showPicker: () => void;
};

export default function BookingHeader({
  selectedDate,
  selectedBranch,
  branches,
  dateValueHandler,
  branchChanged,
  showPicker,
}: BookingHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-0 bg-black text-white py-2.5 px-8">
      <button className="flex items-center" onClick={showPicker}>
        {selectedDate
          ? format(new Date(selectedDate), "dd MMMM yyyy", { locale: id })
          : "Pilih Tanggal"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="ml-1"
        >
          <path
            fill="currentColor"
            d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062"
          />
        </svg>
      </button>
      <input
        id="hiddenDateInput"
        type="date"
        value={selectedDate}
        onChange={dateValueHandler}
        onKeyDown={(e) => e.preventDefault()}
        className="absolute opacity-0 w-0 h-0"
      />
      <select
        name="branch"
        id="branch"
        onChange={branchChanged}
        value={selectedBranch}
        className="bg-black border border-white rounded px-3 py-1"
      >
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id} className="text-black">
            {branch.name}
          </option>
        ))}
      </select>
    </div>
  );
} 