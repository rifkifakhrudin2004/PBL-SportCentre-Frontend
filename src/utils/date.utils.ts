/**
 * Utility functions for date handling
 */

/**
 * Konversi waktu UTC dari server ke waktu lokal
 * @param utcDateString - String ISO format dari backend
 * @returns Date dalam timezone lokal
 */
export const utcToLocal = (utcDateString: string): Date => {
  const date = new Date(utcDateString);
  return date;
};

/**
 * Format tanggal ke format lokal yang mudah dibaca
 * @param date - Objek Date
 * @returns String tanggal format "DD/MM/YYYY HH:MM"
 */
export const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Ekstrak jam dari objek Date
 * @param date - Objek Date
 * @returns String jam format "HH:00"
 */
export const extractHour = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:00`;
};

/**
 * Konversi waktu lokal ke UTC untuk dikirim ke server
 * @param localDate - Date dalam timezone lokal
 * @returns String dalam format ISO UTC
 */
export const localToUTC = (localDate: Date): string => {
  return localDate.toISOString();
};

/**
 * Parse string waktu HH:MM dan gabungkan dengan tanggal
 * @param dateStr - String tanggal format YYYY-MM-DD
 * @param timeStr - String waktu format HH:MM
 * @returns Date object yang menggabungkan tanggal dan waktu
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}; 