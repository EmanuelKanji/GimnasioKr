import type { Alumno } from '../../shared/types';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:4000';

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  // Login unificado (recomendado)
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Login Admin (mantener compatibilidad)
  async loginAdmin(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login/admin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Login Alumno (mantener compatibilidad)
  async loginAlumno(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login/alumno', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Login Profesor (mantener compatibilidad)
  async loginProfesor(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login/profesor', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Verificar token (para rutas protegidas)
  async verifyToken(token: string): Promise<{ valid: boolean; user?: Alumno }> {
    try {
  const response = await this.request<{ valid: boolean; user?: Alumno }>('/api/verify', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch {
      return { valid: false };
    }
  }
}

export const apiService = new ApiService();
