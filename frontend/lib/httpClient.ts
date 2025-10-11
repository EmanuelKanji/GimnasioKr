// Cliente HTTP con manejo mejorado de errores
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + '/api' : 'https://localhost:4000/api');

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class HttpClient {
  private static getToken(): string | null {
    return localStorage.getItem('token');
  }

  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      };
    }

    const data = await response.json();
    return {
      data,
      status: response.status
    };
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const token = this.getToken();
    
    if (!token) {
      return {
        error: 'No hay token de autenticación',
        status: 401
      };
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Error de conexión',
        status: 0
      };
    }
  }

  static async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const token = this.getToken();
    
    if (!token) {
      return {
        error: 'No hay token de autenticación',
        status: 401
      };
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Error de conexión',
        status: 0
      };
    }
  }
}






