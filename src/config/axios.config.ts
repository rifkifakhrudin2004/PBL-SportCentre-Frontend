'use client';

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Tipe untuk parameter cache pada URL
type CacheParams = {
  _t?: number;
  noCache?: string;
  [key: string]: string | number | boolean | undefined;
};

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    // Menambahkan token auth jika tersedia
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Menambahkan cache busting parameter untuk GET requests
    if (config.method?.toLowerCase() === 'get') {
      // Inisialisasi params jika belum ada
      config.params = config.params || {};
      
      // Tambahkan timestamp untuk cache busting
      if (typeof config.params === 'object') {
        const params = config.params as CacheParams;
        params._t = new Date().getTime();
        
        // Untuk endpoint branches dan fields, tambahkan noCache=true
        const url = config.url?.toLowerCase() || '';
        if (url.includes('branch') || url.includes('field')) {
          params.noCache = 'true';
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani response dan error
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Jika error 401 (Unauthorized) dan belum mencoba refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Coba refresh token
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        // Type assertion untuk aman mengakses token
        const responseData = refreshResponse.data as { token: string };
        
        if (refreshResponse.status === 200 && responseData.token) {
          // Jika berhasil refresh, simpan token baru
          const token = responseData.token;
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
          
          // Update header dan coba ulang request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Jika refresh gagal, hapus token dan redirect ke login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 