import { io, Socket } from 'socket.io-client';

// Base URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Socket.io singleton instance
let socket: Socket | null = null;

// Inisialisasi socket connection
export const initSocket = (): Socket => {
  if (!socket) {
    console.log('Initializing socket connection to:', API_URL);
    socket = io(API_URL, {
      transports: ['websocket', 'polling'], // Support polling sebagai fallback
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Event listeners
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('reconnect', (attempt) => {
      console.log('Socket reconnected after', attempt, 'attempts');
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log('Socket reconnection attempt:', attempt);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });
  }

  return socket;
};

// Dapatkan instance socket
export const getSocket = (): Socket | null => {
  if (!socket) {
    console.warn('Socket not initialized yet');
    return null;
  }
  return socket;
};

// Gabung ke room untuk pembaruan ketersediaan lapangan
export const joinFieldAvailabilityRoom = (branchId?: number, date?: string) => {
  const socket = getSocket();
  if (!socket) return;

  const roomId = date ? `field_availability_${date}` : 'field_availability';
  socket.emit('join_room', { room: roomId, branchId });
  console.log('Joined room:', roomId);
  
  // Minta update ketersediaan lapangan terbaru segera setelah join room
  requestAvailabilityUpdate(date, branchId);
};

// Minta update ketersediaan lapangan terbaru
export const requestAvailabilityUpdate = (date?: string, branchId?: number) => {
  const socket = getSocket();
  if (!socket) return;
  
  socket.emit('request_availability_update', { date, branchId });
  console.log('Requested availability update for date:', date || 'all dates');
};

// Dapatkan pembaruan ketersediaan lapangan
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

// Tutup koneksi socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

export default {
  initSocket,
  getSocket,
  joinFieldAvailabilityRoom,
  requestAvailabilityUpdate,
  subscribeToFieldAvailability,
  disconnectSocket,
}; 