import axiosInstance from '../config/axios.config';
import { LoginRequest, RegisterRequest, UserWithToken, User } from '../types';
import { hasAuthCookie } from '@/utils/cookie';

class AuthApi {
  /**
   * Login user dengan email dan password
   * @param data - Data login berupa email dan password
   * @returns Promise dengan data user dan token
   */
  async login(data: LoginRequest): Promise<UserWithToken> {
    const response = await axiosInstance.post<UserWithToken>('/auth/login', data);
    // Token dan user disimpan dalam cookie di server
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
    // Cookie akan dihapus oleh server
    return response.data;
  }

  /**
   * Cek status autentikasi user
   * @returns Promise dengan data user jika terautentikasi, null jika tidak
   */
  async getAuthStatus(): Promise<UserWithToken | null> {
    try {
      if (!hasAuthCookie()) {
        return null; 
      }

      // Cookie auth_token (httpOnly) akan dikirim otomatis oleh browser
      const response = await axiosInstance.get<UserWithToken>('/auth/status');
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting auth status:', error);
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
      // Token akan disimpan sebagai cookie oleh server
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