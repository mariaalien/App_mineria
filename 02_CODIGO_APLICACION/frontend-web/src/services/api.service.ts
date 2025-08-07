// src/services/api.service.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// ============================================================================
// 🎯 INTERFACES TYPESCRIPT
// ============================================================================

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
  empresa: {
    id: string;
    nombre: string;
    activa: boolean;
  };
  permisos: string[];
  permisosPorModulo?: Record<string, any[]>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    expiresIn: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  errors?: any[];
}

export interface DashboardStats {
  totalFRI: number;
  completedThisMonth: number;
  pendingReports: number;
  systemHealth: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user: string;
    type: 'success' | 'warning' | 'info';
  }>;
}

// ============================================================================
// 🔧 CONFIGURACIÓN DE AXIOS
// ============================================================================

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // URL base del backend - ajusta según tu configuración
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    
    // Crear instancia de Axios
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configurar interceptors
    this.setupInterceptors();
  }

  // ============================================================================
  // 🔄 INTERCEPTORS PARA MANEJO AUTOMÁTICO DE TOKENS
  // ============================================================================

  private setupInterceptors(): void {
    // Request interceptor - Agregar token automáticamente
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log de requests en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Manejo automático de errores
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log de responses en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data);
        
        // Manejar errores de autenticación
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // 🔐 GESTIÓN DE TOKENS
  // ============================================================================

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private removeToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  private handleUnauthorized(): void {
    this.removeToken();
    window.location.href = '/login';
  }

  // ============================================================================
  // 🔑 MÉTODOS DE AUTENTICACIÓN
  // ============================================================================

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        // Guardar token y usuario
        this.setToken(response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        console.log('✅ Login exitoso:', response.data.data.user.email);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw this.handleApiError(error as AxiosError);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.warn('⚠️ Logout error (continuando):', error);
    } finally {
      this.removeToken();
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await this.api.get<ApiResponse<User>>('/auth/profile');
      return response.data.data!;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw this.handleApiError(error as AxiosError);
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ token: string }>>('/auth/refresh');
      
      if (response.data.success && response.data.data) {
        this.setToken(response.data.data.token);
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      throw this.handleApiError(error as AxiosError);
    }
  }

  // ============================================================================
  // 📊 MÉTODOS DE DASHBOARD
  // ============================================================================

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      
      return response.data.data || {
        totalFRI: 0,
        completedThisMonth: 0,
        pendingReports: 0,
        systemHealth: 0,
        recentActivity: []
      };
    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
      // Devolver datos mock si falla la API
      return {
        totalFRI: 156,
        completedThisMonth: 23,
        pendingReports: 7,
        systemHealth: 98,
        recentActivity: [
          {
            id: '1',
            action: 'FRI-001 Producción completado',
            timestamp: new Date().toISOString(),
            user: 'Usuario Demo',
            type: 'success'
          }
        ]
      };
    }
  }

  // ============================================================================
  // 🧪 MÉTODOS DE TESTING
  // ============================================================================

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  async testAuth(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  // ============================================================================
  // 🛠️ MÉTODOS AUXILIARES
  // ============================================================================

  private handleApiError(error: AxiosError): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiResponse;
      return new Error(apiError.message || 'Error de API');
    }
    
    if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    }
    
    return new Error(error.message || 'Error desconocido');
  }

  // Obtener usuario del localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // Obtener la URL base de la API
  getBaseURL(): string {
    return this.baseURL;
  }
}

// ============================================================================
// 📤 EXPORTAR INSTANCIA SINGLETON
// ============================================================================

const apiService = new ApiService();
export default apiService;

// Exportar métodos individuales para conveniencia
export const {
  login,
  logout,
  getProfile,
  refreshToken,
  getDashboardStats,
  testConnection,
  testAuth,
  getCurrentUser,
  isAuthenticated,
  getBaseURL
} = apiService;