// ==========================================
// 02_CODIGO_APLICACION/backend-api/validators/productionValidators.js
// Validadores para Registro de Producción Minera
// ==========================================

/**
 * Valida los datos de entrada de producción
 * @param {Object} data - Datos a validar
 * @returns {Object} - Resultado de la validación
 */
const validateProductionEntry = (data) => {
  const errors = [];

  // Validar nombre del operador
  if (!data.nombre_operador || !data.nombre_operador.trim()) {
    errors.push('El nombre del operador es requerido');
  } else if (data.nombre_operador.trim().length < 2) {
    errors.push('El nombre del operador debe tener al menos 2 caracteres');
  } else if (data.nombre_operador.trim().length > 100) {
    errors.push('El nombre del operador no puede exceder 100 caracteres');
  }

  // Validar ubicación
  if (!data.ubicacion || !data.ubicacion.trim()) {
    errors.push('La ubicación es requerida');
  } else if (data.ubicacion.trim().length < 3) {
    errors.push('La ubicación debe tener al menos 3 caracteres');
  } else if (data.ubicacion.trim().length > 200) {
    errors.push('La ubicación no puede exceder 200 caracteres');
  }

  // Validar título minero
  if (!data.titulo_minero || !data.titulo_minero.trim()) {
    errors.push('El título minero es requerido');
  } else if (data.titulo_minero.trim().length < 3) {
    errors.push('El título minero debe tener al menos 3 caracteres');
  } else if (data.titulo_minero.trim().length > 50) {
    errors.push('El título minero no puede exceder 50 caracteres');
  }

  // Validar tipo de mineral
  if (!data.tipo_mineral || !data.tipo_mineral.trim()) {
    errors.push('El tipo de mineral es requerido');
  } else if (data.tipo_mineral.trim().length < 2) {
    errors.push('El tipo de mineral debe tener al menos 2 caracteres');
  } else if (data.tipo_mineral.trim().length > 50) {
    errors.push('El tipo de mineral no puede exceder 50 caracteres');
  }

  // Validar cantidad
  if (!data.cantidad) {
    errors.push('La cantidad es requerida');
  } else {
    const cantidad = parseFloat(data.cantidad);
    if (isNaN(cantidad)) {
      errors.push('La cantidad debe ser un número válido');
    } else if (cantidad <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    } else if (cantidad > 10000) {
      errors.push('La cantidad no puede exceder 10,000 toneladas');
    }
  }

  // Validar coordenadas
  if (!data.latitud || !data.longitud) {
    errors.push('Las coordenadas son requeridas');
  } else {
    const lat = parseFloat(data.latitud);
    const lng = parseFloat(data.longitud);
    
    if (isNaN(lat) || isNaN(lng)) {
      errors.push('Las coordenadas deben ser números válidos');
    } else {
      // Validar rango de latitud (Colombia está entre -4 y 15 grados)
      if (lat < -4.5 || lat > 15.5) {
        errors.push('La latitud debe estar en el rango de Colombia (-4.5 a 15.5)');
      }
      
      // Validar rango de longitud (Colombia está entre -82 y -66 grados)
      if (lng < -82 || lng > -66) {
        errors.push('La longitud debe estar en el rango de Colombia (-82 a -66)');
      }
    }
  }

  // Validar fecha y hora
  if (!data.fecha_hora) {
    errors.push('La fecha y hora son requeridas');
  } else {
    const fecha = new Date(data.fecha_hora);
    if (isNaN(fecha.getTime())) {
      errors.push('La fecha y hora deben ser válidas');
    } else {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      if (fecha < oneHourAgo) {
        errors.push('La fecha no puede ser más de 1 hora anterior');
      }
      
      if (fecha > oneWeekFromNow) {
        errors.push('La fecha no puede ser más de 1 semana en el futuro');
      }
    }
  }

  // Validar observaciones (opcional)
  if (data.observaciones && data.observaciones.length > 500) {
    errors.push('Las observaciones no pueden exceder 500 caracteres');
  }

  // Validar es_repeticion (opcional)
  if (data.es_repeticion !== undefined && typeof data.es_repeticion !== 'boolean') {
    errors.push('El campo es_repeticion debe ser un valor booleano');
  }

  // Validar entrada_anterior_id (opcional)
  if (data.entrada_anterior_id !== undefined && data.entrada_anterior_id !== null) {
    if (!Number.isInteger(parseInt(data.entrada_anterior_id))) {
      errors.push('El ID de entrada anterior debe ser un número entero válido');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida los filtros de consulta para el historial
 * @param {Object} filters - Filtros a validar
 * @returns {Object} - Resultado de la validación
 */
const validateHistoryFilters = (filters) => {
  const errors = [];

  // Validar página
  if (filters.page !== undefined) {
    const page = parseInt(filters.page);
    if (isNaN(page) || page < 1) {
      errors.push('La página debe ser un número entero mayor a 0');
    }
  }

  // Validar límite
  if (filters.limit !== undefined) {
    const limit = parseInt(filters.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('El límite debe ser un número entre 1 y 100');
    }
  }

  // Validar fechas
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('La fecha de inicio debe ser válida');
    }
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('La fecha de fin debe ser válida');
    }
  }

  // Validar que la fecha de inicio sea anterior a la fecha de fin
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    if (startDate >= endDate) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }

  // Validar tipo de mineral
  if (filters.tipoMineral && filters.tipoMineral.length > 50) {
    errors.push('El filtro de tipo de mineral no puede exceder 50 caracteres');
  }

  // Validar título minero
  if (filters.tituloMinero && filters.tituloMinero.length > 50) {
    errors.push('El filtro de título minero no puede exceder 50 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida los filtros de estadísticas
 * @param {Object} filters - Filtros a validar
 * @returns {Object} - Resultado de la validación
 */
const validateStatsFilters = (filters) => {
  const errors = [];

  // Validar fechas
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('La fecha de inicio debe ser válida');
    }
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('La fecha de fin debe ser válida');
    }
  }

  // Validar groupBy
  if (filters.groupBy && !['day', 'week', 'month', 'year'].includes(filters.groupBy)) {
    errors.push('El agrupamiento debe ser: day, week, month o year');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitiza los datos de entrada para prevenir inyección
 * @param {Object} data - Datos a sanitizar
 * @returns {Object} - Datos sanitizados
 */
const sanitizeProductionData = (data) => {
  const sanitized = {};

  // Sanitizar strings
  if (data.nombre_operador) {
    sanitized.nombre_operador = data.nombre_operador.trim().replace(/[<>]/g, '');
  }

  if (data.ubicacion) {
    sanitized.ubicacion = data.ubicacion.trim().replace(/[<>]/g, '');
  }

  if (data.titulo_minero) {
    sanitized.titulo_minero = data.titulo_minero.trim().replace(/[<>]/g, '');
  }

  if (data.tipo_mineral) {
    sanitized.tipo_mineral = data.tipo_mineral.trim().replace(/[<>]/g, '');
  }

  if (data.observaciones) {
    sanitized.observaciones = data.observaciones.trim().replace(/[<>]/g, '');
  }

  // Sanitizar números
  if (data.cantidad !== undefined) {
    sanitized.cantidad = parseFloat(data.cantidad);
  }

  if (data.latitud !== undefined) {
    sanitized.latitud = parseFloat(data.latitud);
  }

  if (data.longitud !== undefined) {
    sanitized.longitud = parseFloat(data.longitud);
  }

  // Sanitizar fechas
  if (data.fecha_hora) {
    sanitized.fecha_hora = new Date(data.fecha_hora);
  }

  // Sanitizar booleanos
  if (data.es_repeticion !== undefined) {
    sanitized.es_repeticion = Boolean(data.es_repeticion);
  }

  // Sanitizar IDs
  if (data.entrada_anterior_id !== undefined) {
    sanitized.entrada_anterior_id = parseInt(data.entrada_anterior_id);
  }

  return sanitized;
};

module.exports = {
  validateProductionEntry,
  validateHistoryFilters,
  validateStatsFilters,
  sanitizeProductionData
};
