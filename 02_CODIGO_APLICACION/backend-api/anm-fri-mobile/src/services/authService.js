// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/services/authService.js
// Servicio de Autenticación para React Native
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuración de la API
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'ios' 
    ? 'http://localhost:3000' 
    : 'http://10.0.2.2:3000'  // Para Android Emulator
  : 'https://tu-api-produccion.com'; // URL de producción

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.init();
  }

  // =============================================================================
  // 🔧 INICIALIZACIÓN Y CONFIGURACIÓN
  // =============================================================================

  async init() {
    try {
      const token = await AsyncStorage.getItem('AUTH_TOKEN');
      const user = await AsyncStorage.getItem('USER_DATA');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        console.log('✅ AuthService: Sesión restaurada para', this.user.email);
      }
    } catch (error) {
      console.error('❌ AuthService: Error al inicializar', error);
    }
  }

  // =============================================================================
  // 🌐 MÉTODOS DE COMUNICACIÓN CON API
  // =============================================================================

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token de autorización si existe
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`🚀 API Request: ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      console.log(`✅ API Response: ${response.status}`);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${error.message}`);
      throw error;
    }
  }

  // =============================================================================
  // 🔐 MÉTODOS DE AUTENTICACIÓN
  // =============================================================================

  async login(email, password) {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        // Guardar datos de autenticación
        this.token = response.data.token;
        this.user = response.data.user;

        await AsyncStorage.setItem('AUTH_TOKEN', this.token);
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(this.user));

        console.log('✅ Login exitoso:', this.user.email);
        
        return {
          success: true,
          user: this.user,
          token: this.token,
          message: `¡Bienvenido ${this.user.nombre}!`
        };
      } else {
        return {
          success: false,
          message: response.message || 'Error de autenticación'
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: 'Error de conexión. Verifica tu internet.'
      };
    }
  }

  async logout() {
    try {
      // Notificar al servidor (opcional)
      if (this.token) {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
        }).catch(() => {
          // Ignorar errores del servidor al hacer logout
          console.warn('⚠️ Error al notificar logout al servidor');
        });
      }
    } catch (error) {
      console.warn('⚠️ Error en logout:', error);
    } finally {
      // Limpiar datos locales
      this.token = null;
      this.user = null;
      
      await AsyncStorage.multiRemove([
        'AUTH_TOKEN',
        'USER_DATA',
        'VERIFICATION_DATA'
      ]);
      
      console.log('🚪 Logout completado');
    }
  }

  // =============================================================================
  // 🛡️ MÉTODOS DE VERIFICACIÓN DE IDENTIDAD
  // =============================================================================

  async generateVerificationCode() {
    try {
      const response = await this.makeRequest('/verification/generate-code', {
        method: 'POST',
      });

      if (response.success) {
        console.log('📱 Código de verificación generado');
        return {
          success: true,
          message: 'Código enviado exitosamente'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Error al generar código'
        };
      }
    } catch (error) {
      console.error('❌ Error generando código:', error);
      return {
        success: false,
        message: 'Error de conexión al generar código'
      };
    }
  }

  async verifyIdentity(verificationData) {
    try {
      const response = await this.makeRequest('/verification/verify-identity', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });

      if (response.success) {
        // Guardar datos de verificación
        await AsyncStorage.setItem('VERIFICATION_DATA', JSON.stringify({
          verified: true,
          timestamp: new Date().toISOString(),
          level: response.data?.verificacion?.nivelVerificacion || 'BASIC'
        }));

        console.log('✅ Verificación de identidad exitosa');
        
        return {
          success: true,
          message: 'Identidad verificada exitosamente',
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.message || 'Error en la verificación'
        };
      }
    } catch (error) {
      console.error('❌ Error verificando identidad:', error);
      return {
        success: false,
        message: 'Error de conexión durante la verificación'
      };
    }
  }

  // =============================================================================
  // 👤 MÉTODOS DE PERFIL
  // =============================================================================

  async getProfile() {
    try {
      const response = await this.makeRequest('/auth/profile');
      
      if (response.success && response.data) {
        this.user = response.data;
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(this.user));
        return this.user;
      } else {
        throw new Error('No se pudo obtener el perfil');
      }
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const response = await this.makeRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (response.success && response.data) {
        this.user = response.data;
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(this.user));
        return this.user;
      } else {
        throw new Error(response.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }

  // =============================================================================
  // 🔍 MÉTODOS DE VERIFICACIÓN DE ESTADO
  // =============================================================================

  isAuthenticated() {
    return !!(this.token && this.user);
  }

  getCurrentUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async isVerified() {
    try {
      const verificationData = await AsyncStorage.getItem('VERIFICATION_DATA');
      if (verificationData) {
        const parsed = JSON.parse(verificationData);
        return parsed.verified === true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
      return false;
    }
  }

  // =============================================================================
  // 📊 MÉTODOS DE DATOS
  // =============================================================================

  async getForms() {
    try {
      const response = await this.makeRequest('/formularios');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo formularios:', error);
      throw error;
    }
  }

  async submitForm(formData) {
    try {
      const response = await this.makeRequest('/formularios', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      return response;
    } catch (error) {
      console.error('❌ Error enviando formulario:', error);
      throw error;
    }
  }

  async getDashboardData() {
    try {
      const response = await this.makeRequest('/dashboard/stats');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo datos del dashboard:', error);
      throw error;
    }
  }

  // =============================================================================
  // 💾 MÉTODOS DE ALMACENAMIENTO LOCAL
  // =============================================================================

  async saveOfflineData(key, data) {
    try {
      await AsyncStorage.setItem(`OFFLINE_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      console.log(`💾 Datos guardados offline: ${key}`);
    } catch (error) {
      console.error('❌ Error guardando datos offline:', error);
    }
  }

  async getOfflineData(key) {
    try {
      const stored = await AsyncStorage.getItem(`OFFLINE_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`📱 Datos offline recuperados: ${key}`);
        return parsed.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Error recuperando datos offline:', error);
      return null;
    }
  }

  async clearOfflineData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('OFFLINE_'));
      await AsyncStorage.multiRemove(offlineKeys);
      console.log('🗑️ Datos offline limpiados');
    } catch (error) {
      console.error('❌ Error limpiando datos offline:', error);
    }
  }

  // =============================================================================
  // 🔧 MÉTODOS DE UTILIDAD
  // =============================================================================

  async testConnection() {
    try {
      const response = await this.makeRequest('/health');
      return response.success;
    } catch (error) {
      console.error('❌ Error testando conexión:', error);
      return false;
    }
  }

  async getAppInfo() {
    try {
      const response = await this.makeRequest('/info');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo info de la app:', error);
      return null;
    }
  }
}

// Crear instancia única (Singleton)
const authService = new AuthService();

export { authService };
export default authService;