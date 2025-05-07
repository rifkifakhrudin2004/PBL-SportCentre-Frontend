import axiosInstance from '../config/axios.config';
import { LoginRequest, RegisterRequest, UserWithToken, User } from '../types';

// Interface untuk error dengan response
interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
}

class AuthApi {
  /**
   * Login user dengan email dan password
   * @param data - Data login berupa email dan password
   * @returns Promise dengan data user dan token
   */
  async login(data: LoginRequest): Promise<UserWithToken> {
    const response = await axiosInstance.post<UserWithToken>('/auth/login', data);
    
    // Simpan token ke localStorage untuk digunakan di interceptor
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Register user baru
   * @param data - Data registrasi berupa nama, email, password, dll
   * @returns Promise dengan data user yang berhasil dibuat
   */
  async register(data: RegisterRequest): Promise<{ user: UserWithToken }> {
    const response = await axiosInstance.post<{ user: UserWithToken }>('/auth/register', data);
    return response.data;
  }

  /**
   * Logout user
   * @returns Promise dengan pesan sukses
   */
  async logout(): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/auth/logout');
    
    // Hapus token dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return response.data;
  }

  /**
   * Cek status autentikasi user
   * @returns Promise dengan data user jika terautentikasi, null jika tidak
   */
  async getAuthStatus(): Promise<UserWithToken | null> {
    try {
      // Coba endpoint status
      const response = await axiosInstance.get<UserWithToken>('/auth/status');
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting auth status:', error);
      
      // Type assertion untuk mengakses properti error
      const apiError = error as ApiError;
      
      // Jika endpoint tidak tersedia (404), coba cek token dari localStorage
      if (apiError.response?.status === 404) {
        console.info('Auth status endpoint not found, attempting fallback to localStorage');
        try {
          const token = localStorage.getItem('token');
          const user = localStorage.getItem('user');
          
          if (token && user) {
            return { user: JSON.parse(user), token };
          }
        } catch (localStorageError) {
          console.error('Error accessing localStorage:', localStorageError);
        }
      }
      
      return null;
    }
  }

  /**
   * Refresh token
   * @returns Promise dengan token baru
   */
  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await axiosInstance.post<{ token: string }>('/auth/refresh-token');
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
  
  /**
   * Update profil pengguna
   * @param data - Data profil yang akan diupdate
   * @returns Promise dengan data user yang diupdate
   */
  async updateProfile(userId: number, data: { name: string; phone?: string }): Promise<User> {
    const response = await axiosInstance.put<{ user: User }>(`/users/${userId}`, data);
    return response.data.user;
  }
}

export const authApi = new AuthApi(); 