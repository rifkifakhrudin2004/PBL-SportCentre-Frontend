'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { authApi } from '@/api/auth.api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, role?: Role) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updatedUser: User) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUserProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const authData = await authApi.getAuthStatus();
        if (authData && authData.user && authData.token) {
          setUser(authData.user);
          setToken(authData.token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // clear local storage if there was an error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await authApi.login({ email, password });
      setUser(authData.user);
      setToken(authData.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, role?: Role) => {
    setIsLoading(true);
    try {
      const userData = { name, email, password, phone, role };
      const response = await authApi.register(userData);
      if (response && response.user) {
        // Register berhasil tapi tidak langsung login
        // Login dilakukan di halaman login
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
    
    // Update localStorage
    if (updatedUser) {
      const currentUserString = localStorage.getItem('user');
      if (currentUserString) {
        const updatedUserString = JSON.stringify(updatedUser);
        localStorage.setItem('user', updatedUserString);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};