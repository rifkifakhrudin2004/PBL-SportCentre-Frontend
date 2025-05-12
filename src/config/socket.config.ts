import { io, Socket } from 'socket.io-client';

// Base URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Socket.io singleton instance
let socket: Socket | null = null;

/**
 * Inisialisasi socket connection
 * @returns Instance Socket.IO
 */
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

    // Event listeners for connection status
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

/**
 * Dapatkan instance socket yang sudah diinisialisasi
 * @returns Socket instance atau null jika belum diinisialisasi
 */
export const getSocket = (): Socket | null => {
  if (!socket) {
    console.warn('Socket not initialized yet');
    return null;
  }
  return socket;
};

/**
 * Fungsi umum untuk bergabung ke room socket
 * @param roomId - ID room yang akan dimasuki
 * @param data - Data tambahan yang dikirim saat join room
 */
export const joinRoom = (roomId: string, data?: Record<string, unknown>) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('join_room', { room: roomId, ...data });
  console.log('Joined room:', roomId);
};

/**
 * Fungsi umum untuk meninggalkan room socket
 * @param roomId - ID room yang akan ditinggalkan
 */
export const leaveRoom = (roomId: string) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('leave_room', { room: roomId });
  console.log('Left room:', roomId);
};

/**
 * Tutup koneksi socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

const socketConfig = {
  initSocket,
  getSocket,
  joinRoom,
  leaveRoom,
  disconnectSocket,
}; 
export default socketConfig;