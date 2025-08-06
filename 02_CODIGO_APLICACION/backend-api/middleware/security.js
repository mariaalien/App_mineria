// ================================
// 📁 middleware/security.js - SIMPLIFICADO SIN WARNINGS
// ================================
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// =============================================================================
// 🔒 MIDDLEWARE DE AUTENTICACIÓN
// =============================================================================

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'anm_fri_secret_2025'
    );

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      include: {
        empresa: {
          select: {
            id: true,
            nombre: true,
            nit: true,
            activa: true
          }
        },
        permisos: {
          include: {
            permiso: {
              select: {
                codigo: true,
                nombre: true,
                modulo: true,
                activo: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo',
        code: 'USER_INACTIVE'
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      username: user.nombre,
      role: user.rol,
      rol: user.rol,
      empresaId: user.empresaId,
      empresa: user.empresa,
      permisos: user.permisos
        .filter(up => up.permiso.activo)
        .map(up => up.permiso.codigo)
    };

    console.log(`✅ Usuario autenticado: ${user.email} (${user.rol})`);
    next();

  } catch (error) {
    let message = 'Token inválido';
    let code = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token malformado';
      code = 'MALFORMED_TOKEN';
    }

    console.error(`❌ Error de autenticación: ${message}`);
    
    return res.status(401).json({
      success: false,
      message,
      code
    });
  }
};

// =============================================================================
// 👥 MIDDLEWARE DE ROLES
// =============================================================================

const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.rol)) {
      console.log(`❌ Acceso denegado: ${req.user.email} (${req.user.rol}) necesita: ${roles.join(', ')}`);
      
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    console.log(`✅ Acceso autorizado: ${req.user.email} (${req.user.rol})`);
    next();
  };
};

// =============================================================================
// 🛡️ RATE LIMITERS SIMPLIFICADOS
// =============================================================================

// Rate limiter para login (prevenir ataques de fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.',
    code: 'LOGIN_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Rate limiter para API general
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// =============================================================================
// 🔑 MIDDLEWARE DE PERMISOS
// =============================================================================

const requirePermission = (permisosRequeridos) => {
  return (req, res, next) => {
    const permisos = Array.isArray(permisosRequeridos) ? permisosRequeridos : [permisosRequeridos];
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Los ADMIN tienen todos los permisos automáticamente
    if (req.user.rol === 'ADMIN') {
      return next();
    }

    // Verificar permisos
    const tienePermiso = permisos.some(permiso => req.user.permisos.includes(permiso));
    
    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes los permisos necesarios para esta acción',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// =============================================================================
// EXPORTACIONES
// =============================================================================

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  authLimiter,
  apiLimiter
};