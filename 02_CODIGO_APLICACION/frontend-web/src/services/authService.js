// ==========================================
// 02_CODIGO_APLICACION/frontend-web/src/services/authService.js
// Servicio de autenticación que falta
// ==========================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // =============================================================================
  // 🔐 MÉTODOS DE AUTENTICACIÓN
  // =============================================================================

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar token y usuario
        this.token = data.data.token;
        this.user = data.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        console.log('✅ Login exitoso:', this.user.email);
        return { success: true, user: this.user, token: this.token };
      } else {
        console.error('❌ Error en login:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('❌ Error de red en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🚪 Logout completado');
    }
  }

  // =============================================================================
  // 🛡️ MÉTODOS DE VERIFICACIÓN
  // =============================================================================

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // =============================================================================
  // 🔄 MÉTODOS DE API CON AUTENTICACIÓN
  // =============================================================================

  async apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.status === 401) {
        console.warn('⚠️ Token expirado, redirigiendo a login...');
        this.logout();
        window.location.href = '/login';
        return { success: false, message: 'Sesión expirada' };
      }

      return data;
    } catch (error) {
      console.error(`❌ Error en API call ${endpoint}:`, error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Métodos específicos para endpoints comunes
  async getFRIStats() {
    return this.apiCall('/api/fri/stats');
  }

  async getFRIProduccion() {
    return this.apiCall('/api/fri/produccion');
  }

  async getDashboard() {
    return this.apiCall('/api/fri/dashboard');
  }

  async getProfile() {
    return this.apiCall('/api/auth/profile');
  }

  // =============================================================================
  // 🔍 MÉTODOS DE VERIFICACIÓN DE USUARIO
  // =============================================================================

  async verifyUserIdentity(verificationData) {
    return this.apiCall('/api/verification/verify-identity', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async generateVerificationCode() {
    return this.apiCall('/api/verification/generate-code', {
      method: 'POST',
    });
  }

  async getVerificationHistory() {
    return this.apiCall('/api/verification/history');
  }

  async getVerificationStats() {
    return this.apiCall('/api/verification/admin/stats');
  }
}

// Crear instancia global
const authService = new AuthService();

export default authService;

// ==========================================
// 02_CODIGO_APLICACION/frontend-web/src/services/apiService.js
// Servicio genérico para llamadas API
// ==========================================

import authService from './authService';

export const apiService = {
  async get(endpoint) {
    return authService.apiCall(endpoint, { method: 'GET' });
  },

  async post(endpoint, data) {
    return authService.apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint, data) {
    return authService.apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint) {
    return authService.apiCall(endpoint, { method: 'DELETE' });
  },
};

// ==========================================
// 02_CODIGO_APLICACION/frontend-web/src/hooks/useAuth.js
// Hook personalizado para autenticación
// ==========================================

import { useState, useEffect, createContext, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};