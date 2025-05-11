"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { bookingApi } from "@/api/booking.api";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { BookingWithPayment, Field, Branch, Booking } from "@/types";
import { branchApi, fieldApi } from "@/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";

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
  const router = useRouter();
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

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        const bookings = await bookingApi.getUserBookings();
        console.log("data booking", fields);
        setBookings(Array.isArray(bookings) ? bookings : []);
      } catch (error) {
        console.error("Error fetching user bookings:", error);
        setError("Gagal memuat daftar booking. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await branchApi.getBranches();
        const branches = response.data || [];
        console.log(branches);
        if (Array.isArray(branches)) {
          setSelectedBranch(branches[0].id);
          setSelectedBranchName(branches[0].name);
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

    fetchAvailability();
    fetchBranches();
    fetchFields();
  }, []);

  const onSubmit = async (formData: BookingFormValues) => {
    setLoading(true);
    setError(null);

    const dataToSend: BookingRequest = {
      userId: userId,
      fieldId: selectedField,
      bookingDate: selectedDate,
      startTime: selectedStartTime,
      endTime: formData.endTime,
    };

    try {
      await bookingApi.createBooking(dataToSend);
      console.log("Booking Berhasil");
      console.log("User after booking", localStorage.getItem("user"));
      router.push("/bookings");
    } catch (error) {
      console.error("Booking error:", error);
      setError("Data booking salah. Silakan coba lagi." + error);
    } finally {
      setLoading(false);
    }
  };

  const filterdFields = fields.filter(
    (field) => field.branchId === selectedBranch
  );

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

  if (loading) {
    return (
      <div className="container justify-center items-center text-center mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Memuat Halaman</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Booking</h1>
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 ">
      <h1 className="text-3xl text-center mt-5 font-bold mb-6">
        Jadwal Booking
      </h1>
      <section className="flex flex-col mt-5">
        <div className="flex justify-between items-center mb-0 bg-black text-white py-2.5 px-8">
          <div>
            <button className="flex flex-row " onClick={showPicker}>
              {selectedDate
                ? format(new Date(selectedDate), "dd MMMM yyyy", { locale: id })
                : "Pilih Tanggal"}
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062"
                  />
                </svg>
              </span>
            </button>
            <input
              id="hiddenDateInput"
              type="date"
              value={selectedDate}
              onChange={dateValueHandler}
              onKeyDown={(e) => e.preventDefault()}
              className="absolute opacity-0 w-0 h-0"
            />
          </div>
          <div>
            <select
              name="branch"
              id="branch"
              onChange={branchChanged}
              value={selectedBranch}
            >
              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                  className="text-black"
                >
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 border border-gray-300 p-1">
          {filterdFields.length > 0 ? (
            filterdFields.map((field) => (
              <div
                key={field.id}
                className="w-full sm:w-[48%] md:w-[20%] border border-gray-500 overflow-hidden shadow"
              >
                <div className="bg-gray-200 text-center py-2 font-semibold">
                  {field.name}
                </div>
                <table className="table-fixed border-collapse w-full text-sm">
                  <tbody>
                    {times.map((time, index) => (
                      <tr key={index}>
                        <td className="w-[30%] text-center border border-gray-300 px-2 py-1">
                          {time}
                        </td>
                        <td className="w-[70%] border border-gray-300 p-0">
                          <div className="relative">
                            <input
                              type="radio"
                              name="bookingTime"
                              value={`${time}|${field.id}|${field.name}`}
                              onChange={selectTimeHandle}
                              id={`booking-${field.id}-${time}`}
                              className="peer hidden"
                              disabled={field.status !== "available"}
                            />
                            <label
                              htmlFor={`booking-${field.id}-${time}`}
                              className={`
                                            flex items-center gap-2 px-2 py-1 transition-colors
                                            ${
                                              field.status === "available"
                                                ? "bg-green-100 hover:bg-green-200 cursor-pointer"
                                                : ""
                                            }
                                            ${
                                              field.status === "booked"
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : ""
                                            }
                                            ${
                                              field.status === "maintenance"
                                                ? "bg-yellow-100 cursor-not-allowed"
                                                : ""
                                            }
                                            ${
                                              field.status === "closed"
                                                ? "bg-red-300 text-white cursor-not-allowed"
                                                : ""
                                            }
                                            peer-checked:bg-green-500 peer-checked:hover:bg-green-500
                                        `}
                            >
                              <span className="capitalize">{field.status}</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
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
      </section>

      <section className="mt-8">
        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-center mb-2">
            Pesanan Anda
          </h2>
          <div className="mb-6 text-center">
            <h4 className="text-lg font-medium text-black">
              Lapangan{" "}
              {selectedFieldName === "Lapangan"
                ? "Belum Dipilih"
                : selectedFieldName}
            </h4>
            <p className="text-black">
              Cabang{" "}
              {selectedBranchName === "Cabang"
                ? "Pilih Cabang"
                : selectedBranchName}
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            method="POST"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jam Selesai:
                </label>
                <select
                  id="endTime"
                  {...form.register("endTime")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {times.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
              >
                Booking
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
