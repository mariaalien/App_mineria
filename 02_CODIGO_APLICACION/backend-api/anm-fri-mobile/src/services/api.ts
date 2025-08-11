// src/services/api.ts - Cliente API para conectar con backend ANM FRI
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error obteniendo token:', error);
    }
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} - ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.response?.status} - ${error.config?.url}`);
    
    // Si el token está expirado (401), limpiar storage
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        console.log('Token expirado, limpiando storage');
      } catch (storageError) {
        console.error('Error limpiando storage:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Servicios específicos para ANM FRI
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  profile: () =>
    apiClient.get('/auth/profile'),
  
  register: (userData: any) =>
    apiClient.post('/auth/register', userData),
};

export const friAPI = {
  // Obtener FRI por tipo
  getByType: (tipo: string) =>
    apiClient.get(`/fri-complete/${tipo}`),
  
  // Crear nuevo FRI
  create: (tipo: string, data: any) =>
    apiClient.post(`/fri-complete/${tipo}`, data),
  
  // Actualizar FRI
  update: (tipo: string, id: string, data: any) =>
    apiClient.put(`/fri-complete/${tipo}/${id}`, data),
  
  // Eliminar FRI
  delete: (tipo: string, id: string) =>
    apiClient.delete(`/fri-complete/${tipo}/${id}`),
  
  // Buscar FRI
  search: (query: string) =>
    apiClient.get(`/fri-complete/search?q=${encodeURIComponent(query)}`),
};

export const systemAPI = {
  // Estadísticas del sistema
  stats: () =>
    apiClient.get('/system/stats'),
  
  // Health check
  health: () =>
    apiClient.get('/health'),
  
  // Info del sistema
  info: () =>
    apiClient.get('/info'),
};

export const reportsAPI = {
  // Obtener reportes disponibles
  available: () =>
    apiClient.get('/reports/available'),
  
  // Generar reporte
  generate: (tipo: string, params: any) =>
    apiClient.get(`/reports/excel/${tipo}`, { params }),
  
  // Estadísticas de producción
  productionStats: (params: any) =>
    apiClient.get('/reports/stats/production', { params }),
};

// Función para testear conectividad con backend
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/reports/health'); // Cambiar esta línea
    return response.data.success || false;
  } catch (error) {
    console.error('Error testing connection:', error);
    return false;
  }
};


export default apiClient;