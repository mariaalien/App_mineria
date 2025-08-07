/ ==========================================
// src/services/authAPI.js - Servicios de autenticación
// ==========================================

import apiClient from './api';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export const authAPI = {
  // Login
  async login(email, password) {
    try {
      const deviceInfo = {
        deviceId: await DeviceInfo.getUniqueId(),
        deviceName: await DeviceInfo.getDeviceName(),
        platform: Platform.OS,
        appVersion: DeviceInfo.getVersion(),
        systemVersion: DeviceInfo.getSystemVersion(),
      };

      const response = await apiClient.post('/auth/login', {
        email,
        password,
        deviceInfo
      });

      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        permissions: response.data.permissions
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    }
  },

  // Logout
  async logout() {
    try {
      await apiClient.post('/auth/logout');
      return { success: true };
    } catch (error) {
      // Logout local si falla el remoto
      console.warn('Remote logout failed, performing local logout');
      return { success: true };
    }
  },

  // Verificar token
  async verifyToken() {
    try {
      const response = await apiClient.get('/auth/verify');
      return {
        success: true,
        user: response.data.user,
        permissions: response.data.permissions
      };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  },

  // Recuperar contraseña
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email
      });

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al enviar email de recuperación'
      );
    }
  },

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al cambiar la contraseña'
      );
    }
  }
};
