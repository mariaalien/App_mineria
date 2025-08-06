// ================================
// 📁 middleware/security.js - VERSIÓN TEMPORAL SIN PRISMA
// ================================
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Usuarios demo en memoria (temporal)
const DEMO_USERS = {
  'admin@anm.gov.co': {
    id: 'user-admin-001',
    email: 'admin@anm.gov.co',
    passwordHash: '$2b$12$rQv3c1yqBwEHFl4HuvH07.HcHmNSQm9GjHPJP3VPBvqDDLqYQ/9qO', // admin123
    nombre: 'Administrador ANM',
    rol: 'ADMIN',
    activo: true,
    empresa: {
      id: 'emp-001',
      nombre: 'Agencia Nacional de Minería',
      nit: '900123456',
      activa: true
    },
    permisos: [
      'FRI_CREATE', 'FRI_READ', 'FRI_UPDATE', 'FRI_DELETE', 'FRI_APPROVE', 'FRI_SUBMIT',
      'REPORTS_VIEW', 'REPORTS_EXPORT', 'REPORTS_ADVANCED',
      'ADMIN_USERS', 'ADMIN_COMPANY', 'ADMIN_SYSTEM', 'ADMIN_AUDIT'
    ]
  },
  'operador@empresa.com': {
    id: 'user-op-001',
    email: 'operador@empresa.com',
    passwordHash: '$2b$12$8k8/uOj0/jIYgjQNKL8wHO5YJGv.FJcKANzVeJYVz8RpxQHqQ5Xji', // operador123
    nombre: 'Operador FRI',
    rol: 'OPERADOR',
    activo: true,
    empresa: {
      id: 'emp-002',
      nombre: 'Empresa Minera Demo',
      nit: '800987654',
      activa: true
    },
    permisos: [
      'FRI_CREATE', 'FRI_READ', 'FRI_UPDATE',
      'REPORTS_VIEW', 'REPORTS_EXPORT'
    ]
  },
  'supervisor@empresa.com': {
    id: 'user-sup-001',
    email: 'supervisor@empresa.com',
    passwordHash: '$2b$12$9j9/vPk1/kJZhkROML9xIP6ZKHw.GKdLBOaWfJYWa9SqyRIrR6Yok', // supervisor123
    nombre: 'Supervisor FRI',
    rol: 'SUPERVISOR',
    activo: true,
    empresa: {
      id: 'emp-002',
      nombre: 'Empresa Minera Demo',
      nit: '800987654',
      activa: true
    },
    permisos: [
      'FRI_CREATE', 'FRI_READ', 'FRI_UPDATE', 'FRI_APPROVE', 'FRI_SUBMIT',
      'REPORTS_VIEW', 'REPORTS_EXPORT', 'REPORTS_ADVANCED'
    ]
  }
};

// =============================================================================
// 🔐 CONFIGURACIÓN JWT SEGURA
// =============================================================================

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'anm_fri_2025_jwt_secret_key_super_secure',
  expiresIn: '24h',
  issuer: 'ANM-FRI-System',
  audience: 'anm-fri-users'
};

// Generar token JWT
const generateToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );
};

// Verificar token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
};

// =============================================================================
// 🔒 MIDDLEWARE DE AUTENTICACIÓN (SIN PRISMA)
// =============================================================================

const authenticateToken = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar y decodificar token
    const decoded = verifyToken(token);

    // Buscar usuario en datos demo
    const user = Object.values(DEMO_USERS).find(u => u.id === decoded.userId);

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

    // Agregar información del usuario al request
    req.user = {
      userId: user.id,
      email: user.email,
      username: user.nombre,
      role: user.rol,
      rol: user.rol,
      empresaId: user.empresa.id,
      empresa: user.empresa,
      permisos: user.permisos
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
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: roles,
        user_role: req.user.rol
      });
    }

    console.log(`✅ Acceso autorizado: ${req.user.email} (${req.user.rol})`);
    next();
  };
};

// =============================================================================
// 🔑 MIDDLEWARE DE PERMISOS GRANULARES
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
      console.log(`✅ Acceso ADMIN autorizado: ${req.user.email}`);
      return next();
    }

    // Verificar permisos específicos
    const tienePermiso = permisos.some(permiso => req.user.permisos.includes(permiso));
    
    if (!tienePermiso) {
      console.log(`❌ Permisos insuficientes: ${req.user.email} necesita: ${permisos.join(', ')}`);
      
      return res.status(403).json({
        success: false,
        message: 'No tienes los permisos necesarios para esta acción',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_permissions: permisos,
        user_permissions: req.user.permisos
      });
    }

    console.log(`✅ Permisos verificados: ${req.user.email}`);
    next();
  };
};

// =============================================================================
// 🛡️ RATE LIMITERS AVANZADOS
// =============================================================================

// Rate limiter para autenticación (prevenir ataques de fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.',
    code: 'LOGIN_RATE_LIMIT',
    retry_after: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    // Combinar IP + email si está disponible para mayor seguridad
    return req.ip + ':' + (req.body.email || 'unknown');
  }
});

// Rate limiter para API general
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
    code: 'RATE_LIMIT_EXCEEDED',
    retry_after: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip para usuarios ADMIN autenticados
    return req.user?.rol === 'ADMIN';
  }
});

// Rate limiter para operaciones críticas
const criticalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 operaciones críticas
  message: {
    success: false,
    message: 'Límite de operaciones críticas excedido.',
    code: 'CRITICAL_RATE_LIMIT',
    retry_after: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.user?.rol === 'ADMIN';
  }
});

// =============================================================================
// 🔍 MIDDLEWARE DE LOGGING DE SEGURIDAD
// =============================================================================

const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log de la petición
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log de usuario si está autenticado
  if (req.user) {
    console.log(`👤 Usuario: ${req.user.email} (${req.user.rol}) - Empresa: ${req.user.empresa?.nombre || 'N/A'}`);
  }

  // Log de respuesta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusColor} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

// =============================================================================
// 🚨 MIDDLEWARE DE DETECCIÓN DE ATAQUES
// =============================================================================

const attackDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /union.*select/i,     // SQL Injection
    /<script/i,           // XSS
    /javascript:/i,       // XSS
    /\.\./,              // Path Traversal
    /etc\/passwd/i,      // File Access
    /cmd\.exe/i,         // Command Injection
    /eval\(/i,           // Code Injection
    /base64_decode/i     // Suspicious encoding
  ];

  const requestData = JSON.stringify(req.body) + req.originalUrl + JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      console.error(`🚨 ATAQUE DETECTADO: ${pattern} - IP: ${req.ip} - URL: ${req.originalUrl}`);
      
      return res.status(403).json({
        success: false,
        message: 'Solicitud bloqueada por razones de seguridad',
        code: 'SECURITY_BLOCK'
      });
    }
  }

  next();
};

// =============================================================================
// 🔍 FUNCIÓN PARA OBTENER USUARIOS DEMO
// =============================================================================

const getDemoUsers = () => DEMO_USERS;

const findUserByEmail = (email) => DEMO_USERS[email.toLowerCase()] || null;

// =============================================================================
// EXPORTACIONES
// =============================================================================

module.exports = {
  // JWT functions
  generateToken,
  verifyToken,
  JWT_CONFIG,
  
  // Authentication & Authorization
  authenticateToken,
  requireRole,
  requirePermission,
  
  // Rate Limiting
  authLimiter,
  apiLimiter,
  criticalLimiter,
  
  // Security & Logging
  securityLogger,
  attackDetector,
  
  // Demo data functions
  getDemoUsers,
  findUserByEmail
};