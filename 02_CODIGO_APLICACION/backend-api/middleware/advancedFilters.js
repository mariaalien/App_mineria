// ================================
// 📁 middleware/advancedFilters.js - FILTROS AVANZADOS Y BÚSQUEDA GLOBAL
// ================================
const { validationResult, query, param } = require('express-validator');

// =============================================================================
// MIDDLEWARE DE VALIDACIÓN DE PARÁMETROS DE CONSULTA
// =============================================================================

const validateQueryParams = [
  // Paginación
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('La página debe ser un número entre 1 y 1000')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100')
    .toInt(),
  
  // Ordenamiento
  query('orderBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'mineral', 'tituloMinero', 'fechaCorteInformacion'])
    .withMessage('Campo de ordenamiento no válido'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('El orden debe ser "asc" o "desc"'),
  
  // Filtros de fecha
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser una fecha válida (ISO 8601)')
    .toDate(),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser una fecha válida (ISO 8601)')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.query.startDate && new Date(req.query.startDate) > endDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  
  // Filtros específicos
  query('mineral')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El filtro de mineral debe tener entre 2 y 100 caracteres')
    .trim(),
  
  query('tituloMinero')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El filtro de título minero debe tener entre 2 y 50 caracteres')
    .trim(),
  
  query('municipio')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El filtro de municipio debe tener entre 2 y 100 caracteres')
    .trim(),
  
  // Búsqueda global
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
    .trim(),
  
  // Filtros booleanos
  query('sincronizado')
    .optional()
    .isBoolean()
    .withMessage('El filtro sincronizado debe ser true o false')
    .toBoolean(),
  
  // Filtros numéricos con rangos
  query('cantidadMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La cantidad mínima debe ser un número positivo')
    .toFloat(),
  
  query('cantidadMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La cantidad máxima debe ser un número positivo')
    .toFloat()
    .custom((cantidadMax, { req }) => {
      if (req.query.cantidadMin && parseFloat(req.query.cantidadMin) > cantidadMax) {
        throw new Error('La cantidad máxima debe ser mayor que la cantidad mínima');
      }
      return true;
    }),

  // Middleware para manejar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        })),
        code: 'INVALID_QUERY_PARAMS'
      });
    }
    next();
  }
];

// =============================================================================
// CONSTRUCTOR DE FILTROS DINÁMICOS PARA PRISMA
// =============================================================================

class FilterBuilder {
  
  static buildWhereClause(query, userId, userRole) {
    const where = {};
    
    // Control de acceso: si no es admin, solo ver sus registros
    if (userRole !== 'ADMIN' && userRole !== 'SUPERVISOR') {
      where.usuarioId = userId;
    }
    
    // Filtros de fecha
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        // Agregar 23:59:59 al final del día
        const endDate = new Date(query.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }
    
    // Filtro por mineral (case-insensitive)
    if (query.mineral) {
      where.mineral = {
        contains: query.mineral,
        mode: 'insensitive'
      };
    }
    
    // Filtro por título minero (case-insensitive)
    if (query.tituloMinero) {
      where.tituloMinero = {
        contains: query.tituloMinero,
        mode: 'insensitive'
      };
    }
    
    // Filtro por municipio (si existe en el modelo)
    if (query.municipio) {
      where.OR = [
        { municipio: { contains: query.municipio, mode: 'insensitive' } },
        { municipioExtraccion: { contains: query.municipio, mode: 'insensitive' } }
      ];
    }
    
    // Filtro por sincronización
    if (typeof query.sincronizado === 'boolean') {
      where.sincronizado = query.sincronizado;
    }
    
    // Filtros de cantidad (campos numéricos)
    if (query.cantidadMin || query.cantidadMax) {
      const cantidadFilter = {};
      if (query.cantidadMin) cantidadFilter.gte = query.cantidadMin;
      if (query.cantidadMax) cantidadFilter.lte = query.cantidadMax;
      
      // Aplicar a diferentes campos según el tipo de FRI
      where.OR = [
        { cantidadProduccion: cantidadFilter },
        { cantidadMineralExtraido: cantidadFilter },
        { inventarioInicialAcopio: cantidadFilter },
        { cantidadMaquinaria: cantidadFilter }
      ].filter(condition => {
        // Filtrar solo las condiciones que tienen sentido para el modelo actual
        return Object.keys(condition)[0] !== undefined;
      });
    }
    
    // Búsqueda global (múltiples campos)
    if (query.search) {
      const searchTerm = query.search;
      where.OR = [
        { mineral: { contains: searchTerm, mode: 'insensitive' } },
        { tituloMinero: { contains: searchTerm, mode: 'insensitive' } },
        { municipio: { contains: searchTerm, mode: 'insensitive' } },
        { municipioExtraccion: { contains: searchTerm, mode: 'insensitive' } },
        { denominacionFrente: { contains: searchTerm, mode: 'insensitive' } },
        { tipoVehiculo: { contains: searchTerm, mode: 'insensitive' } },
        { tipoMaquinaria: { contains: searchTerm, mode: 'insensitive' } },
        { metodoExplotacion: { contains: searchTerm, mode: 'insensitive' } }
      ].filter(condition => {
        // Solo incluir campos que existen en el modelo
        return Object.keys(condition)[0] !== undefined;
      });
    }
    
    return where;
  }
  
  // Construir opciones de ordenamiento
  static buildOrderBy(query) {
    const orderBy = query.orderBy || 'createdAt';
    const order = query.order || 'desc';
    
    // Validar que el campo de ordenamiento existe
    const allowedOrderFields = [
      'createdAt', 'updatedAt', 'mineral', 'tituloMinero', 
      'fechaCorteInformacion', 'fechaCorteDeclaracion'
    ];
    
    if (!allowedOrderFields.includes(orderBy)) {
      return { createdAt: 'desc' }; // Fallback por defecto
    }
    
    return { [orderBy]: order };
  }
  
  // Construir opciones de paginación
  static buildPagination(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    // Asegurar límites razonables
    const safeLimit = Math.min(limit, 100);
    const safePage = Math.max(page, 1);
    
    const skip = (safePage - 1) * safeLimit;
    
    return {
      skip,
      take: safeLimit,
      page: safePage,
      limit: safeLimit
    };
  }
  
  // Construir respuesta de paginación para el cliente
  static buildPaginationResponse(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      current_page: page,
      per_page: limit,
      total_records: total,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
      next_page: page < totalPages ? page + 1 : null,
      prev_page: page > 1 ? page - 1 : null
    };
  }
}

// =============================================================================
// MIDDLEWARE DE BÚSQUEDA AVANZADA
// =============================================================================

const advancedSearchMiddleware = (req, res, next) => {
  // Procesar y limpiar parámetros de búsqueda
  const processedQuery = {
    ...req.query,
    // Normalizar términos de búsqueda
    search: req.query.search?.trim().toLowerCase(),
    mineral: req.query.mineral?.trim().toUpperCase(),
    tituloMinero: req.query.tituloMinero?.trim(),
    municipio: req.query.municipio?.trim()
  };
  
  // Construir filtros usando FilterBuilder
  const where = FilterBuilder.buildWhereClause(
    processedQuery, 
    req.user?.userId, 
    req.user?.rol
  );
  
  const orderBy = FilterBuilder.buildOrderBy(processedQuery);
  const pagination = FilterBuilder.buildPagination(processedQuery);
  
  // Agregar a req para uso en controladores
  req.filters = {
    where,
    orderBy,
    pagination,
    originalQuery: processedQuery
  };
  
  console.log(`🔍 Filtros aplicados:`, {
    search: processedQuery.search,
    dateRange: processedQuery.startDate ? `${processedQuery.startDate} - ${processedQuery.endDate}` : null,
    page: pagination.page,
    limit: pagination.limit,
    orderBy: JSON.stringify(orderBy)
  });
  
  next();
};

// =============================================================================
// CONTROLADOR DE BÚSQUEDA GLOBAL
// =============================================================================

const globalSearchController = async (req, res) => {
  try {
    const { search, tipos, limit = 5 } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.rol;
    
    if (!search || search.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres',
        code: 'SEARCH_TOO_SHORT'
      });
    }
    
    console.log(`🔍 Búsqueda global: "${search}" por usuario: ${req.user.email}`);
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const FRI_MODELS = {
      'produccion': 'fRIProduccion',
      'inventarios': 'fRIInventarios', 
      'paradas': 'fRIParadasProduccion',
      'ejecucion': 'fRIEjecucion',
      'maquinaria': 'fRIMaquinariaTransporte',
      'regalias': 'fRIRegalias',
      'inventario-maquinaria': 'fRIInventarioMaquinaria',
      'capacidad': 'fRICapacidadTecnologica',
      'proyecciones': 'fRIProyecciones'
    };
    
    // Determinar en qué tipos buscar
    const searchTypes = tipos ? 
      (Array.isArray(tipos) ? tipos : [tipos]) : 
      Object.keys(FRI_MODELS);
    
    // Buscar en cada tipo de FRI
    const searchPromises = searchTypes.map(async (tipo) => {
      if (!FRI_MODELS[tipo]) return { tipo, results: [], error: 'Tipo no válido' };
      
      const modelName = FRI_MODELS[tipo];
      const where = FilterBuilder.buildWhereClause(
        { search }, 
        userId, 
        userRole
      );
      
      try {
        const results = await prisma[modelName].findMany({
          where,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            usuario: {
              select: { nombre: true, email: true }
            }
          }
        });
        
        return {
          tipo,
          cantidad: results.length,
          resultados: results.map(record => ({
            id: record.id,
            mineral: record.mineral,
            tituloMinero: record.tituloMinero,
            fechaCreacion: record.createdAt,
            usuario: record.usuario.nombre,
            relevancia: calculateRelevance(record, search)
          })).sort((a, b) => b.relevancia - a.relevancia)
        };
        
      } catch (error) {
        console.warn(`⚠️ Error buscando en ${tipo}:`, error.message);
        return {
          tipo,
          cantidad: 0,
          resultados: [],
          error: error.message
        };
      }
    });
    
    const searchResults = await Promise.all(searchPromises);
    
    // Consolidar resultados
    const totalResults = searchResults.reduce((sum, result) => sum + result.cantidad, 0);
    const topResults = searchResults
      .flatMap(result => result.resultados.map(r => ({ ...r, tipoFRI: result.tipo })))
      .sort((a, b) => b.relevancia - a.relevancia)
      .slice(0, 20); // Top 20 resultados globales
    
    console.log(`✅ Búsqueda completada: ${totalResults} resultados encontrados`);
    
    res.json({
      success: true,
      message: `🔍 Resultados de búsqueda para: "${search}"`,
      data: {
        termino_busqueda: search,
        total_resultados: totalResults,
        tipos_buscados: searchTypes,
        resultados_por_tipo: searchResults,
        top_resultados: topResults,
        usuario: {
          nombre: req.user.nombre || req.user.email,
          rol: req.user.rol
        },
        generado: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error en búsqueda global:', error);
    res.status(500).json({
      success: false,
      message: 'Error realizando búsqueda global',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =============================================================================
// FUNCIÓN AUXILIAR: CALCULAR RELEVANCIA DE RESULTADOS
// =============================================================================

function calculateRelevance(record, searchTerm) {
  let relevance = 0;
  const term = searchTerm.toLowerCase();
  
  // Coincidencia exacta en mineral (máxima relevancia)
  if (record.mineral && record.mineral.toLowerCase() === term) {
    relevance += 100;
  } else if (record.mineral && record.mineral.toLowerCase().includes(term)) {
    relevance += 50;
  }
  
  // Coincidencia en título minero
  if (record.tituloMinero && record.tituloMinero.toLowerCase().includes(term)) {
    relevance += 30;
  }
  
  // Coincidencia en municipio
  if (record.municipio && record.municipio.toLowerCase().includes(term)) {
    relevance += 20;
  }
  
  // Bonificación por registros recientes
  const daysSinceCreated = Math.floor((new Date() - new Date(record.createdAt)) / (1000 * 60 * 60 * 24));
  if (daysSinceCreated < 7) relevance += 10;
  else if (daysSinceCreated < 30) relevance += 5;
  
  return relevance;
}

// =============================================================================
// EXPORTACIONES
// =============================================================================

module.exports = {
  validateQueryParams,
  FilterBuilder,
  advancedSearchMiddleware,
  globalSearchController
};