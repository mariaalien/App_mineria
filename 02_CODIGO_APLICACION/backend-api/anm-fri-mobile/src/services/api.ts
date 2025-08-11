// src/services/api.ts - API con datos mock para desarrollo
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Mock data para desarrollo
const MOCK_DATA = {
  produccion: [
    {
      id: '1',
      titulo: 'FRI Producción Mensual - Enero 2025',
      tipo: 'mensual',
      estado: 'completado',
      fechaCreacion: '2025-01-15T10:30:00Z',
      mineral: 'Oro',
      cantidad: '125.5',
      unidad: 'Kilogramos',
      valor: '15250000',
      ubicacion: {
        municipio: 'Medellín',
        departamento: 'Antioquia',
        coordenadas: { lat: 6.2442, lng: -75.5812 }
      }
    },
    {
      id: '2',
      titulo: 'FRI Producción Mensual - Diciembre 2024',
      tipo: 'mensual',
      estado: 'enviado',
      fechaCreacion: '2024-12-31T16:45:00Z',
      mineral: 'Plata',
      cantidad: '890.2',
      unidad: 'Kilogramos',
      valor: '8900000',
      ubicacion: {
        municipio: 'Bucaramanga',
        departamento: 'Santander',
        coordenadas: { lat: 7.1193, lng: -73.1227 }
      }
    },
    {
      id: '3',
      titulo: 'FRI Producción Trimestral - Q4 2024',
      tipo: 'trimestral',
      estado: 'borrador',
      fechaCreacion: '2024-12-20T14:20:00Z',
      mineral: 'Carbón',
      cantidad: '25000',
      unidad: 'Toneladas',
      valor: '125000000',
      ubicacion: {
        municipio: 'La Guajira',
        departamento: 'La Guajira',
        coordenadas: { lat: 11.5444, lng: -72.9072 }
      }
    }
  ],
  inventarios: [
    {
      id: 'inv-1',
      producto: 'Oro refinado',
      existencia: '45.2',
      unidad: 'Kilogramos',
      ubicacion: 'Bodega Principal',
      ultimaActualizacion: '2025-01-15T09:15:00Z'
    },
    {
      id: 'inv-2', 
      producto: 'Plata en bruto',
      existencia: '320.8',
      unidad: 'Kilogramos',
      ubicacion: 'Bodega Secundaria',
      ultimaActualizacion: '2025-01-14T15:30:00Z'
    }
  ],
  stats: {
    totalFRI: 12,
    borradores: 3,
    completados: 8,
    enviados: 7,
    cumplimiento: 98.5
  }
};

// Configuración de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    
    // Agregar token si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, '-', error.config?.url);
    
    if (error.response?.status === 401) {
      console.log('Token expirado, limpiando storage');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// SERVICIOS API CON FALLBACK A MOCK DATA
// ============================================================================

export const friAPI = {
  // Obtener datos de producción
  getProduccion: async () => {
    try {
      const response = await api.get('/fri/produccion');
      return response.data;
    } catch (error) {
      console.log('📦 Usando datos mock para producción');
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: MOCK_DATA.produccion,
        total: MOCK_DATA.produccion.length
      };
    }
  },

  // Obtener inventarios
  getInventarios: async () => {
    try {
      const response = await api.get('/fri/inventarios');
      return response.data;
    } catch (error) {
      console.log('📦 Usando datos mock para inventarios');
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        data: MOCK_DATA.inventarios,
        total: MOCK_DATA.inventarios.length
      };
    }
  },

  // Obtener estadísticas
  getStats: async () => {
    try {
      const response = await api.get('/fri/stats');
      return response.data;
    } catch (error) {
      console.log('📦 Usando datos mock para estadísticas');
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        success: true,
        data: MOCK_DATA.stats
      };
    }
  },

  // Crear nuevo FRI
  createFRI: async (data: any) => {
    try {
      const response = await api.post('/fri/create', data);
      return response.data;
    } catch (error) {
      console.log('📦 Simulando creación de FRI');
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        message: 'FRI creado exitosamente (modo mock)',
        data: {
          id: `fri-${Date.now()}`,
          ...data,
          estado: 'borrador',
          fechaCreacion: new Date().toISOString()
        }
      };
    }
  },

  // Enviar FRI
  submitFRI: async (id: string) => {
    try {
      const response = await api.post(`/fri/${id}/submit`);
      return response.data;
    } catch (error) {
      console.log('📦 Simulando envío de FRI');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'FRI enviado exitosamente (modo mock)',
        data: { id, estado: 'enviado', fechaEnvio: new Date().toISOString() }
      };
    }
  }
};

// Servicio de autenticación
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.log('📦 Simulando login');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular login exitoso
      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockUser = {
        id: '1',
        nombre: 'Juan Carlos Pérez',
        email: email,
        rol: 'operador',
        empresa: 'Minera El Dorado S.A.S'
      };
      
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));
      
      return {
        success: true,
        message: 'Login exitoso (modo mock)',
        data: {
          token: mockToken,
          user: mockUser
        }
      };
    }
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    return { success: true, message: 'Logout exitoso' };
  }
};

export default api;