// ==========================================
// middleware/activityTracker.js
// Middleware para rastrear actividad de usuarios
// ==========================================

const { PrismaClient } = require('@prisma/client');
const geoip = require('geoip-lite');

const prisma = new PrismaClient();

// =============================================================================
// MIDDLEWARE PRINCIPAL DE RASTREO DE ACTIVIDAD
// =============================================================================

const trackUserActivity = (options = {}) => {
  const {
    includeBody = false,
    sensitiveFields = ['password', 'passwordHash', 'token'],
    trackAnonymous = false
  } = options;

  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Solo rastrear si hay usuario autenticado (a menos que trackAnonymous sea true)
    if (!req.user && !trackAnonymous) {
      return next();
    }

    // Capturar información de la solicitud
    const requestInfo = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      sessionId: req.sessionID || generateSessionId(req)
    };

    // Información geográfica basada en IP
    const geoInfo = geoip.lookup(requestInfo.ip);
    if (geoInfo) {
      requestInfo.location = {
        country: geoInfo.country,
        region: geoInfo.region,
        city: geoInfo.city,
        timezone: geoInfo.timezone
      };
    }

    // Capturar body si está habilitado (removiendo campos sensibles)
    if (includeBody && req.body && Object.keys(req.body).length > 0) {
      requestInfo.requestBody = sanitizeObject(req.body, sensitiveFields);
    }

    // Interceptar la respuesta para capturar información de salida
    const originalSend = res.send;
    res.send = function(data) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Información de la respuesta
      const responseInfo = {
        statusCode: res.statusCode,
        responseTime,
        success: res.statusCode < 400
      };

      // Guardar actividad de forma asíncrona para no bloquear la respuesta
      setImmediate(() => {
        saveUserActivity({
          ...requestInfo,
          ...responseInfo,
          userId: req.user?.userId || null,
          userEmail: req.user?.email || null,
          userRole: req.user?.rol || null
        }).catch(error => {
          console.error('❌ Error guardando actividad de usuario:', error);
        });
      });

      // Enviar respuesta original
      originalSend.call(this, data);
    };

    next();
  };
};

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Generar ID de sesión único basado en IP y User-Agent
 */
function generateSessionId(req) {
  const crypto = require('crypto');
  const data = `${req.ip}-${req.get('User-Agent')}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Sanitizar objeto removiendo campos sensibles
 */
function sanitizeObject(obj, sensitiveFields) {
  const sanitized = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[OCULTO]';
    }
  });
  
  return sanitized;
}

/**
 * Guardar actividad en la base de datos
 */
async function saveUserActivity(activityData) {
  try {
    // Determinar tipo de acción basado en la URL y método
    const actionType = determineActionType(activityData.method, activityData.url);
    
    // Crear registro de actividad
    await prisma.actividadUsuario.create({
      data: {
        usuarioId: activityData.userId,
        tipoAccion: actionType,
        descripcion: generateActivityDescription(activityData),
        detallesSolicitud: JSON.stringify({
          method: activityData.method,
          url: activityData.url,
          userAgent: activityData.userAgent,
          requestBody: activityData.requestBody
        }),
        metadatos: JSON.stringify({
          ip: activityData.ip,
          location: activityData.location,
          sessionId: activityData.sessionId,
          responseTime: activityData.responseTime,
          statusCode: activityData.statusCode
        }),
        exitosa: activityData.success,
        tiempoRespuesta: activityData.responseTime,
        fechaActividad: activityData.timestamp
      }
    });

    // Si es una actividad importante, también crear una entrada de auditoría
    if (isImportantActivity(actionType)) {
      await createAuditEntry(activityData, actionType);
    }

  } catch (error) {
    // No queremos que errores de logging afecten la aplicación principal
    console.error('Error guardando actividad:', error);
  }
}

/**
 * Determinar tipo de acción basado en la URL y método HTTP
 */
function determineActionType(method, url) {
  const urlLower = url.toLowerCase();
  
  // Autenticación
  if (urlLower.includes('/auth/login')) return 'LOGIN';
  if (urlLower.includes('/auth/logout')) return 'LOGOUT';
  if (urlLower.includes('/auth/refresh')) return 'TOKEN_REFRESH';
  
  // Verificación
  if (urlLower.includes('/verification')) return 'USER_VERIFICATION';
  
  // FRI (Formatos de Reporte de Información)
  if (urlLower.includes('/fri')) {
    if (method === 'POST') return 'CREATE_FRI';
    if (method === 'PUT' || method === 'PATCH') return 'UPDATE_FRI';
    if (method === 'DELETE') return 'DELETE_FRI';
    if (method === 'GET') return 'VIEW_FRI';
  }
  
  // Reportes
  if (urlLower.includes('/report')) return 'GENERATE_REPORT';
  
  // Administración
  if (urlLower.includes('/admin')) {
    if (urlLower.includes('/users')) return 'ADMIN_USER_MANAGEMENT';
    return 'ADMIN_ACTION';
  }
  
  // Dashboard
  if (urlLower.includes('/dashboard')) return 'VIEW_DASHBOARD';
  
  // Acciones genéricas basadas en método HTTP
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    case 'GET': return 'VIEW';
    default: return 'OTHER';
  }
}

/**
 * Generar descripción legible de la actividad
 */
function generateActivityDescription(activityData) {
  const { method, url, userEmail, userRole } = activityData;
  const action = determineActionType(method, url);
  
  const descriptions = {
    'LOGIN': `Usuario ${userEmail} inició sesión`,
    'LOGOUT': `Usuario ${userEmail} cerró sesión`,
    'TOKEN_REFRESH': `Usuario ${userEmail} renovó su token`,
    'USER_VERIFICATION': `Usuario ${userEmail} realizó verificación de identidad`,
    'CREATE_FRI': `Usuario ${userEmail} (${userRole}) creó un nuevo registro FRI`,
    'UPDATE_FRI': `Usuario ${userEmail} (${userRole}) actualizó un registro FRI`,
    'DELETE_FRI': `Usuario ${userEmail} (${userRole}) eliminó un registro FRI`,
    'VIEW_FRI': `Usuario ${userEmail} (${userRole}) consultó registros FRI`,
    'GENERATE_REPORT': `Usuario ${userEmail} (${userRole}) generó un reporte`,
    'ADMIN_USER_MANAGEMENT': `Administrador ${userEmail} gestionó usuarios`,
    'ADMIN_ACTION': `Administrador ${userEmail} realizó acción administrativa`,
    'VIEW_DASHBOARD': `Usuario ${userEmail} (${userRole}) accedió al dashboard`
  };
  
  return descriptions[action] || `Usuario ${userEmail} realizó ${method} en ${url}`;
}

/**
 * Determinar si una actividad es importante para auditoría
 */
function isImportantActivity(actionType) {
  const importantActions = [
    'LOGIN',
    'CREATE_FRI',
    'UPDATE_FRI',
    'DELETE_FRI',
    'USER_VERIFICATION',
    'ADMIN_USER_MANAGEMENT',
    'ADMIN_ACTION'
  ];
  
  return importantActions.includes(actionType);
}

/**
 * Crear entrada de auditoría para actividades importantes
 */
async function createAuditEntry(activityData, actionType) {
  try {
    await prisma.auditoriaFRI.create({
      data: {
        tabla: getTableFromAction(actionType),
        registroId: extractRecordId(activityData.url),
        operacion: actionType,
        datosAnteriores: null, // Se podría implementar para capturas más detalladas
        datosNuevos: JSON.stringify(activityData.requestBody || {}),
        usuarioId: activityData.userId,
        timestamp: activityData.timestamp,
        metadatos: JSON.stringify({
          ip: activityData.ip,
          userAgent: activityData.userAgent,
          sessionId: activityData.sessionId
        })
      }
    });
  } catch (error) {
    console.error('Error creando entrada de auditoría:', error);
  }
}

/**
 * Obtener nombre de tabla basado en el tipo de acción
 */
function getTableFromAction(actionType) {
  if (actionType.includes('FRI')) return 'fri_registros';
  if (actionType.includes('USER')) return 'usuarios';
  if (actionType.includes('LOGIN') || actionType.includes('LOGOUT')) return 'auth_sessions';
  return 'sistema';
}

/**
 * Extraer ID de registro de la URL
 */
function extractRecordId(url) {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = url.match(uuidRegex);
  return match ? match[0] : 'N/A';
}

// =============================================================================
// MIDDLEWARE ESPECÍFICO PARA DIFERENTES CONTEXTOS
// =============================================================================

/**
 * Middleware para endpoints sensibles (incluye body en el log)
 */
const trackSensitiveActivity = trackUserActivity({
  includeBody: true,
  sensitiveFields: ['password', 'passwordHash', 'token', 'oldPassword', 'newPassword']
});

/**
 * Middleware para endpoints públicos (rastrear actividad anónima)
 */
const trackPublicActivity = trackUserActivity({
  trackAnonymous: true,
  includeBody: false
});

/**
 * Middleware básico (solo actividad de usuarios autenticados)
 */
const trackBasicActivity = trackUserActivity();

// =============================================================================
// FUNCIONES DE CONSULTA DE ACTIVIDAD
// =============================================================================

/**
 * Obtener actividad reciente de un usuario
 */
async function getUserRecentActivity(userId, limit = 10) {
  return await prisma.actividadUsuario.findMany({
    where: { usuarioId: userId },
    orderBy: { fechaActividad: 'desc' },
    take: limit
  });
}

/**
 * Obtener estadísticas de actividad del sistema
 */
async function getSystemActivityStats(startDate, endDate) {
  const activities = await prisma.actividadUsuario.findMany({
    where: {
      fechaActividad: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      tipoAccion: true,
      exitosa: true,
      fechaActividad: true,
      usuarioId: true
    }
  });

  return {
    totalActivities: activities.length,
    successfulActivities: activities.filter(a => a.exitosa).length,
    failedActivities: activities.filter(a => !a.exitosa).length,
    uniqueUsers: new Set(activities.map(a => a.usuarioId)).size,
    actionBreakdown: activities.reduce((acc, activity) => {
      acc[activity.tipoAccion] = (acc[activity.tipoAccion] || 0) + 1;
      return acc;
    }, {})
  };
}

module.exports = {
  trackUserActivity,
  trackSensitiveActivity,
  trackPublicActivity,
  trackBasicActivity,
  getUserRecentActivity,
  getSystemActivityStats
};

// ==========================================
// ACTUALIZACIÓN SCHEMA PARA ACTIVIDAD
// Agregar al schema.prisma:
// ==========================================

/*
model ActividadUsuario {
  id                String   @id @default(uuid())
  usuarioId         String?  @map("usuario_id")
  tipoAccion        String   @map("tipo_accion")
  descripcion       String
  detallesSolicitud String   @map("detalles_solicitud") // JSON
  metadatos         String?  @map("metadatos")           // JSON
  exitosa           Boolean  @default(true)
  tiempoRespuesta   Int?     @map("tiempo_respuesta")    // milliseconds
  fechaActividad    DateTime @map("fecha_actividad")

  // Relaciones
  usuario Usuario? @relation(fields: [usuarioId], references: [id], onDelete: SetNull)

  @@index([usuarioId])
  @@index([tipoAccion])
  @@index([fechaActividad])
  @@index([exitosa])
  @@map("actividad_usuario")
}

// Agregar al modelo Usuario existente:
model Usuario {
  // ... campos existentes ...
  
  // Relación con actividades (AGREGAR ESTA LÍNEA)
  actividades ActividadUsuario[]
  
  // ... resto del modelo ...
}
*/