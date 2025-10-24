// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/services/productionService.js
// Servicio para Registro de Producción Minera
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base de la API (ajustar según tu configuración)
const API_BASE_URL = 'http://localhost:3001/api'; // Cambiar por tu URL del backend

class ProductionService {
  
  // =============================================================================
  // 🔐 FUNCIONES DE AUTENTICACIÓN
  // =============================================================================

  async getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  // =============================================================================
  // 💾 FUNCIONES DE BASE DE DATOS
  // =============================================================================

  /**
   * Guarda una entrada de producción en la base de datos
   * @param {Object} entryData - Datos de la entrada de producción
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async saveProductionEntry(entryData) {
    try {
      console.log('💾 Guardando entrada de producción:', entryData);
      
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/production/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...entryData,
          // Asegurar que las coordenadas estén en el formato correcto
          latitud: entryData.coordenadas?.latitude,
          longitud: entryData.coordenadas?.longitude,
          // Remover coordenadas del objeto principal
          coordenadas: undefined
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error guardando entrada de producción');
      }

      console.log('✅ Entrada guardada exitosamente:', result);
      return {
        success: true,
        data: result.data,
        message: 'Entrada de producción registrada correctamente'
      };

    } catch (error) {
      console.error('❌ Error guardando entrada:', error);
      
      // Si no hay conexión, guardar localmente para sincronizar después
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        return await this.saveOfflineEntry(entryData);
      }
      
      return {
        success: false,
        message: error.message || 'Error de conexión con el servidor'
      };
    }
  }

  /**
   * Guarda entrada offline cuando no hay conexión
   * @param {Object} entryData - Datos de la entrada
   * @returns {Promise<Object>} - Respuesta local
   */
  async saveOfflineEntry(entryData) {
    try {
      const offlineEntries = await AsyncStorage.getItem('offline_production_entries') || '[]';
      const entries = JSON.parse(offlineEntries);
      
      const offlineEntry = {
        ...entryData,
        id: `offline_${Date.now()}`,
        savedOffline: true,
        timestamp: new Date().toISOString()
      };
      
      entries.push(offlineEntry);
      await AsyncStorage.setItem('offline_production_entries', JSON.stringify(entries));
      
      console.log('📱 Entrada guardada offline:', offlineEntry);
      
      return {
        success: true,
        data: offlineEntry,
        message: 'Entrada guardada localmente. Se sincronizará cuando haya conexión.'
      };
    } catch (error) {
      console.error('❌ Error guardando offline:', error);
      return {
        success: false,
        message: 'Error guardando entrada localmente'
      };
    }
  }

  /**
   * Sincroniza entradas offline con el servidor
   * @returns {Promise<Object>} - Resultado de la sincronización
   */
  async syncOfflineEntries() {
    try {
      const offlineEntries = await AsyncStorage.getItem('offline_production_entries') || '[]';
      const entries = JSON.parse(offlineEntries);
      
      if (entries.length === 0) {
        return { success: true, message: 'No hay entradas offline para sincronizar' };
      }

      console.log(`🔄 Sincronizando ${entries.length} entradas offline...`);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/production/sync-offline`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entries }),
      });

      const result = await response.json();

      if (response.ok) {
        // Limpiar entradas offline después de sincronización exitosa
        await AsyncStorage.removeItem('offline_production_entries');
        console.log('✅ Entradas offline sincronizadas exitosamente');
        
        return {
          success: true,
          message: `${entries.length} entradas sincronizadas correctamente`,
          syncedCount: entries.length
        };
      } else {
        throw new Error(result.message || 'Error sincronizando entradas');
      }

    } catch (error) {
      console.error('❌ Error sincronizando entradas offline:', error);
      return {
        success: false,
        message: error.message || 'Error sincronizando entradas offline'
      };
    }
  }

  /**
   * Obtiene el historial de producción del usuario
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Object>} - Lista de entradas
   */
  async getProductionHistory(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 20,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/production/history?${queryParams}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error obteniendo historial');
      }

      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };

    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return {
        success: false,
        message: error.message || 'Error obteniendo historial de producción'
      };
    }
  }

  /**
   * Obtiene estadísticas de producción
   * @param {Object} filters - Filtros para las estadísticas
   * @returns {Promise<Object>} - Estadísticas de producción
   */
  async getProductionStats(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/production/stats?${queryParams}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error obteniendo estadísticas');
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        success: false,
        message: error.message || 'Error obteniendo estadísticas'
      };
    }
  }

  /**
   * Actualiza una entrada de producción existente
   * @param {string} entryId - ID de la entrada
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async updateProductionEntry(entryId, updateData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/production/${entryId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error actualizando entrada');
      }

      return {
        success: true,
        data: result.data,
        message: 'Entrada actualizada correctamente'
      };

    } catch (error) {
      console.error('❌ Error actualizando entrada:', error);
      return {
        success: false,
        message: error.message || 'Error actualizando entrada'
      };
    }
  }

  /**
   * Elimina una entrada de producción
   * @param {string} entryId - ID de la entrada
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async deleteProductionEntry(entryId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/production/${entryId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error eliminando entrada');
      }

      return {
        success: true,
        message: 'Entrada eliminada correctamente'
      };

    } catch (error) {
      console.error('❌ Error eliminando entrada:', error);
      return {
        success: false,
        message: error.message || 'Error eliminando entrada'
      };
    }
  }

  // =============================================================================
  // 🔧 FUNCIONES DE UTILIDAD
  // =============================================================================

  /**
   * Valida los datos de entrada antes de enviar
   * @param {Object} entryData - Datos a validar
   * @returns {Object} - Resultado de la validación
   */
  validateEntryData(entryData) {
    const errors = [];

    if (!entryData.nombreOperador?.trim()) {
      errors.push('El nombre del operador es requerido');
    }

    if (!entryData.ubicacion?.trim()) {
      errors.push('La ubicación es requerida');
    }

    if (!entryData.tituloMinero?.trim()) {
      errors.push('El título minero es requerido');
    }

    if (!entryData.tipoMineral?.trim()) {
      errors.push('El tipo de mineral es requerido');
    }

    if (!entryData.cantidad || isNaN(parseFloat(entryData.cantidad))) {
      errors.push('La cantidad debe ser un número válido');
    }

    if (!entryData.coordenadas?.latitude || !entryData.coordenadas?.longitude) {
      errors.push('Las coordenadas son requeridas');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatea los datos para envío al servidor
   * @param {Object} entryData - Datos originales
   * @returns {Object} - Datos formateados
   */
  formatEntryForServer(entryData) {
    return {
      nombre_operador: entryData.nombreOperador,
      ubicacion: entryData.ubicacion,
      titulo_minero: entryData.tituloMinero,
      tipo_mineral: entryData.tipoMineral,
      cantidad: parseFloat(entryData.cantidad),
      observaciones: entryData.observaciones || '',
      latitud: entryData.coordenadas?.latitude,
      longitud: entryData.coordenadas?.longitude,
      fecha_hora: entryData.fechaHora,
      operador_id: entryData.operadorId,
      es_repeticion: entryData.esRepeticion || false,
      entrada_anterior_id: entryData.entradaAnteriorId || null
    };
  }
}

// Crear instancia singleton
const productionService = new ProductionService();

export default productionService;
