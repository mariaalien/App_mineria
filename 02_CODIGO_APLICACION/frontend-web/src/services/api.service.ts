// src/services/api.service.ts
import axios, { AxiosInstance } from 'axios';

// Tipos específicos para este archivo
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      nombre: string;
      rol: 'ADMIN' | 'SUPERVISOR' | 'OPERADOR';
      permisos: string[];
    };
  };
  message: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3001';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.api.get<ApiResponse>('/health');
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse> {
    const response = await this.api.get<ApiResponse>('/api/fri-complete/dashboard');
    return response.data;
  }

  // Producción
  async getProduccion(params?: any): Promise<ApiResponse> {
    const response = await this.api.get<ApiResponse>('/api/fri-complete/produccion', { params });
    return response.data;
  }

  // Reportes
  async getReportsHealth(): Promise<ApiResponse> {
    const response = await this.api.get<ApiResponse>('/api/reports/health');
    return response.data;
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new ApiService();