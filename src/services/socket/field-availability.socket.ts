import { getSocket, joinRoom, leaveRoom } from '@/config/socket.config';

/**
 * Gabung ke room untuk pembaruan ketersediaan lapangan
 * @param branchId - ID cabang (opsional)
 * @param date - Tanggal dalam format YYYY-MM-DD (opsional)
 */
export const joinFieldAvailabilityRoom = (branchId?: number, date?: string) => {
  const roomId = date ? `field_availability_${date}` : 'field_availability';
  joinRoom(roomId, { branchId });
  
  // Minta update ketersediaan lapangan terbaru segera setelah join room
  requestAvailabilityUpdate(date, branchId);
};

/**
 * Minta update ketersediaan lapangan terbaru
 * @param date - Tanggal dalam format YYYY-MM-DD (opsional)
 * @param branchId - ID cabang (opsional)
 */
export const requestAvailabilityUpdate = (date?: string, branchId?: number) => {
  const socket = getSocket();
  if (!socket) return;
  
  socket.emit('request_availability_update', { date, branchId });
  console.log('Requested availability update for date:', date || 'all dates');
};

/**
 * Dapatkan pembaruan ketersediaan lapangan
 * @param callback - Fungsi yang akan dipanggil saat ada pembaruan
 * @returns Fungsi untuk berhenti berlangganan
 */
export const subscribeToFieldAvailability = (callback: (data: any) => void) => {
  const socket = getSocket();
  if (!socket) return () => {};

  const handleUpdate = (data: any) => {
    console.log('Received field availability update:', data);
    callback(data);
  };

  socket.on('fieldsAvailabilityUpdate', handleUpdate);

  // Return unsubscribe function
  return () => {
    socket.off('fieldsAvailabilityUpdate', handleUpdate);
  };
};

export default {
  joinFieldAvailabilityRoom,
  requestAvailabilityUpdate,
  subscribeToFieldAvailability,
}; 