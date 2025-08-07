// ==========================================
// src/services/friAPI.js - Servicios FRI
// ==========================================

import apiClient from './api';

export const friAPI = {
  // Obtener lista de FRI
  async getList(page = 1, limit = 10, filters = {}) {
    try {
      const params = {
        page,
        limit,
        ...filters
      };

      const response = await apiClient.get('/fri', { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        total: response.data.total
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener lista de FRI'
      );
    }
  },

  // Obtener FRI por ID
  async getById(id) {
    try {
      const response = await apiClient.get(`/fri/${id}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener FRI'
      );
    }
  },

  // Crear nuevo FRI
  async create(friData) {
    try {
      const response = await apiClient.post('/fri', friData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al crear FRI'
      );
    }
  },

  // Actualizar FRI
  async update(id, friData) {
    try {
      const response = await apiClient.put(`/fri/${id}`, friData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar FRI'
      );
    }
  },

  // Eliminar FRI
  async delete(id) {
    try {
      const response = await apiClient.delete(`/fri/${id}`);
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al eliminar FRI'
      );
    }
  },

  // Aprobar FRI
  async approve(id, approvalData) {
    try {
      const response = await apiClient.post(`/fri/${id}/approve`, approvalData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al aprobar FRI'
      );
    }
  },

  // Rechazar FRI
  async reject(id, rejectionData) {
    try {
      const response = await apiClient.post(`/fri/${id}/reject`, rejectionData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al rechazar FRI'
      );
    }
  },

  // Obtener estadísticas
  async getStats(filters = {}) {
    try {
      const response = await apiClient.get('/fri/stats', { params: filters });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener estadísticas'
      );
    }
  }
};
