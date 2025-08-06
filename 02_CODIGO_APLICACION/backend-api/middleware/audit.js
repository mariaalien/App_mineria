// ================================
// 📁 middleware/audit.js - SISTEMA DE AUDITORÍA COMPLETO
// ================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// =============================================================================
// MIDDLEWARE DE AUDITORÍA - REGISTRA TODAS LAS OPERACIONES CRÍTICAS
// =============================================================================

const auditLogger = (operacion = 'UNKNOWN') => {
  return async (req, res, next) => {
    // Guardar la función original de res.json
    const originalJson = res.json;
    const startTime = Date.now();

    // Datos de la auditoría
    const auditData = {
      operacion,
      metodo: req.method,
      ruta: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      usuarioId: req.user?.userId || null,
      usuarioEmail: req.user?.email || null,
      datosEntrada: null,
      datosRespuesta: null,
      duracionMs: 0,
      exitoso: false
    };

    // Capturar datos de entrada (solo para operaciones de escritura)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      auditData.datosEntrada = {
        body: req.body ? JSON.parse(JSON.stringify(req.body)) : null,
        params: req.params,
        query: req.query
      };

      // Ocultar datos sensibles
      if (auditData.datosEntrada.body) {
        ['password', 'passwordHash', 'token'].forEach(field => {
          if (auditData.datosEntrada.body[field]) {
            auditData.datosEntrada.body[field] = '[OCULTO]';
          }
        });
      }
    }

    // Interceptar la respuesta
    res.json = function(data) {
      auditData.duracionMs = Date.now() - startTime;
      auditData.exitoso = res.statusCode < 400;
      
      // Capturar datos de respuesta (solo metadatos básicos)
      if (data) {
        auditData.datosRespuesta = {
          success: data.success,
          message: data.message,
          recordsCount: data.data?.records?.length || (data.data ? 1 : 0),
          statusCode: res.statusCode
        };
      }

      // Llamar la función original
      originalJson.call(this, data);

      // Guardar auditoría de forma asíncrona (no bloquear respuesta)
      setImmediate(() => {
        saveAuditLog(auditData).catch(error => {
          console.error('❌ Error guardando log de auditoría:', error);
        });
      });
    };

    next();
  };
};

// =============================================================================
// FUNCIÓN PARA GUARDAR LOG DE AUDITORÍA
// =============================================================================

const saveAuditLog = async (auditData) => {
  try {
    // Determinar qué tabla fue afectada basado en la ruta
    const tabla = extractTableFromRoute(auditData.ruta);
    
    await prisma.auditoriaFRI.create({
      data: {
        tabla,
        registroId: auditData.datosEntrada?.params?.id || 'N/A',
        operacion: auditData.operacion,
        datosAnteriores: null, // Se llenará en operaciones UPDATE
        datosNuevos: auditData.datosEntrada,
        usuarioId: auditData.usuarioId || 'ANONIMO',
        ipAddress: auditData.ip,
        userAgent: auditData.userAgent,
        timestamp: auditData.timestamp
      }
    });

    console.log(`📝 Auditoría guardada: ${auditData.operacion} en ${tabla} por ${auditData.usuarioEmail || 'ANÓNIMO'}`);
  } catch (error) {
    console.error('❌ Error al guardar auditoría:', error);
    // No relanzar el error para no afectar la operación principal
  }
};

// =============================================================================
// FUNCIÓN AUXILIAR PARA EXTRAER TABLA DE LA RUTA
// =============================================================================

const extractTableFromRoute = (ruta) => {
  const routeTableMap = {
    '/api/fri/produccion': 'fri_produccion',
    '/api/fri/inventarios': 'fri_inventarios',
    '/api/fri/paradas': 'fri_paradas_produccion',
    '/api/fri/ejecucion': 'fri_ejecucion',
    '/api/fri/maquinaria': 'fri_maquinaria_transporte',
    '/api/fri/regalias': 'fri_regalias',
    '/api/fri/inventario-maquinaria': 'fri_inventario_maquinaria',
    '/api/fri/capacidad': 'fri_capacidad_tecnologica',
    '/api/fri/proyecciones': 'fri_proyecciones',
    '/api/auth': 'usuarios'
  };

  for (const [route, table] of Object.entries(routeTableMap)) {
    if (ruta.includes(route)) {
      return table;
    }
  }

  return 'unknown';
};

// =============================================================================
// MIDDLEWARE DE LOGGING AVANZADO
// =============================================================================

const advancedLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log de entrada
  console.log(`📨 [${timestamp}] ${req.method} ${req.originalUrl}`);
  
  if (req.user) {
    console.log(`👤 Usuario: ${req.user.email} (${req.user.rol})`);
  }

  if (req.body && Object.keys(req.body).length > 0) {
    const bodyLog = { ...req.body };
    // Ocultar datos sensibles
    ['password', 'passwordHash', 'token'].forEach(field => {
      if (bodyLog[field]) bodyLog[field] = '[OCULTO]';
    });
    console.log(`📦 Body:`, JSON.stringify(bodyLog, null, 2));
  }

  // Interceptar respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status < 400 ? '✅' : '❌';
    
    console.log(`${statusEmoji} [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${status} - ${duration}ms`);
    
    if (status >= 400) {
      console.log(`🔍 Error details:`, data);
    }

    originalSend.call(this, data);
  };

  next();
};

// =============================================================================
// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// =============================================================================

const globalErrorHandler = (error, req, res, next) => {
  console.error('💥 Error no manejado capturado por middleware global:', error);

  // Determinar tipo de error y código de respuesta
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let code = 'INTERNAL_ERROR';

  // Errores de Prisma
  if (error.code?.startsWith('P')) {
    statusCode = 400;
    switch (error.code) {
      case 'P2002':
        message = 'Ya existe un registro con estos datos únicos';
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        message = 'Registro no encontrado';
        code = 'NOT_FOUND';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Error de relación de datos';
        code = 'FOREIGN_KEY_ERROR';
        break;
      default:
        message = 'Error de base de datos';
        code = 'DATABASE_ERROR';
    }
  }

  // Errores de validación
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación de datos';
    code = 'VALIDATION_ERROR';
  }

  // Errores de autenticación JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token de autenticación inválido';
    code = 'INVALID_TOKEN';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token de autenticación expirado';
    code = 'TOKEN_EXPIRED';
  }

  // Errores de sintaxis JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'JSON malformado en la petición';
    code = 'INVALID_JSON';
  }

  // Log del error para debugging
  console.error(`❌ Error ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', error.stack);
  }

  // Guardar error crítico en auditoría
  if (statusCode >= 500) {
    setImmediate(() => {
      saveErrorAudit(error, req).catch(console.error);
    });
  }

  // Respuesta al cliente
  const response = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString()
  };

  // Incluir detalles adicionales solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.error = error.message;
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// =============================================================================
// FUNCIÓN PARA GUARDAR ERRORES CRÍTICOS
// =============================================================================

const saveErrorAudit = async (error, req) => {
  try {
    await prisma.auditoriaFRI.create({
      data: {
        tabla: 'system_errors',
        registroId: 'ERROR',
        operacion: 'ERROR',
        datosNuevos: {
          error: error.message,
          stack: error.stack,
          code: error.code,
          route: req.originalUrl,
          method: req.method,
          body: req.body,
          query: req.query,
          params: req.params
        },
        usuarioId: req.user?.userId || 'ANONIMO',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        timestamp: new Date()
      }
    });
  } catch (auditError) {
    console.error('❌ Error guardando error en auditoría:', auditError);
  }
};

// =============================================================================
// MIDDLEWARE DE RATE LIMITING POR USUARIO
// =============================================================================

const userRateLimiter = new Map();

const createUserRateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const userId = req.user?.userId || req.ip;
    const now = Date.now();
    
    if (!userRateLimiter.has(userId)) {
      userRateLimiter.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userLimit = userRateLimiter.get(userId);
    
    if (now > userLimit.resetTime) {
      // Reset window
      userRateLimiter.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      console.log(`⚠️ Rate limit excedido para usuario: ${req.user?.email || req.ip}`);
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        resetTime: userLimit.resetTime
      });
    }

    userLimit.count++;
    next();
  };
};

// =============================================================================
// MIDDLEWARE DE VALIDACIÓN DE HEADERS REQUERIDOS
// =============================================================================

const validateHeaders = (req, res, next) => {
  const requiredHeaders = ['content-type'];
  const missing = [];

  if (req.method === 'POST' || req.method === 'PUT') {
    requiredHeaders.forEach(header => {
      if (!req.get(header)) {
        missing.push(header);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Headers faltantes: ${missing.join(', ')}`,
        code: 'MISSING_HEADERS'
      });
    }
  }

  next();
};

// =============================================================================
// EXPORTACIONES
// =============================================================================

module.exports = {
  // Middleware principal de auditoría
  auditLogger,
  
  // Logging avanzado
  advancedLogger,
  
  // Manejo de errores
  globalErrorHandler,
  
  // Rate limiting por usuario
  createUserRateLimit,
  
  // Validación de headers
  validateHeaders,
  
  // Utilidades
  saveAuditLog,
  saveErrorAudit
};