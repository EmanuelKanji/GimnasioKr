'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, LoginRequest, LoginResponse } from '@/lib/api';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  // Cargar datos de autenticación al inicializar
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthData();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Usar endpoint unificado que detecta automáticamente el rol
      const response = await apiService.login(credentials);

      // Guardar datos en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Actualizar estado
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      });

      // Redirigir según el rol
      switch (response.user.role) {
        case 'admin':
          router.push('/dashboard-admin');
          break;
        case 'alumno':
          router.push('/dashboard-alumno');
          break;
        case 'profesor':
          router.push('/dashboard-profesor');
          break;
      }

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/');
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
    clearAuth,
  };
};
