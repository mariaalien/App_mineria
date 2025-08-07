// ==========================================
// SERVICIOS API Y ESTADO GLOBAL - DÍA 14 HORA 3
// ==========================================

// src/services/api.js - Configuración API base
// ==========================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Configuración base de la API
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // Desarrollo
  : 'https://api-anm-fri.gov.co/api'; // Producción

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log para desarrollo
      if (__DEV__) {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          headers: config.headers
        });
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error para desarrollo
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: originalRequest?.url
      });
    }

    // Token expirado - logout automático
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await AsyncStorage.multiRemove(['authToken', 'userData']);
        
        // Aquí podrías dispatch una acción de logout
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          [{ text: 'OK' }]
        );
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }

    // Error de conexión
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        [{ text: 'OK' }]
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;