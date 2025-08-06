// ================================
// 📁 routes/auth.js - RUTAS COMPLETAS DE AUTENTICACIÓN ANM FRI
// ================================
const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');

const {
  authenticateToken,
  requireRole,
  requirePermission,
  authLimiter,
  apiLimiter,
  securityLogger,
  attackDetector
} = require('../middleware/security');

const router = express.Router();

// =============================================================================
// 🛡️ APLICAR MIDDLEWARE DE SEGURIDAD A TODAS LAS RUTAS
// =============================================================================

router.use(securityLogger);    // Log de seguridad
router.use(attackDetector);    // Detector de ataques
router.use(apiLimiter);        // Rate limiting general

// =============================================================================
// 🔐 RUTAS PÚBLICAS DE AUTENTICACIÓN
// =============================================================================

// LOGIN con validaciones robustas y rate limiting
router.post('/login',
  authLimiter, // Rate limiting específico para login
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email debe ser válido')
      .isLength({ min: 5, max: 100 })
      .withMessage('Email debe tener entre 5 y 100 caracteres'),
    
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password debe tener entre 6 y 128 caracteres')
  ],
  AuthController.login
);

// HEALTH CHECK de autenticación
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '❤️ Sistema de autenticación funcionando',
    timestamp: new Date().toISOString(),
    features: {
      jwt_enabled: true,
      rate_limiting: true,
      role_based_access: true,
      permission_system: true,
      security_logging: true
    },
    endpoints: [
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'POST /api/auth/logout',
      'POST /api/auth/refresh-token',
      'POST /api/auth/check-permissions',
      'PUT /api/auth/change-password'
    ]
  });
});

// =============================================================================
// 🔒 RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// =============================================================================

// PERFIL DE USUARIO
router.get('/profile',
  authenticateToken,
  AuthController.getProfile
);

// LOGOUT
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

// RENOVAR TOKEN
router.post('/refresh-token',
  authenticateToken,
  AuthController.refreshToken
);

// VERIFICAR PERMISOS
router.post('/check-permissions',
  authenticateToken,
  [
    body('permisos')
      .isArray({ min: 1 })
      .withMessage('Debe enviar un array de permisos')
      .custom((permisos) => {
        const validPermissions = [
          'FRI_CREATE', 'FRI_READ', 'FRI_UPDATE', 'FRI_DELETE', 'FRI_APPROVE', 'FRI_SUBMIT',
          'REPORTS_VIEW', 'REPORTS_EXPORT', 'REPORTS_ADVANCED',
          'ADMIN_USERS', 'ADMIN_COMPANY', 'ADMIN_SYSTEM', 'ADMIN_AUDIT'
        ];
        
        const invalidPerms = permisos.filter(p => !validPermissions.includes(p));
        if (invalidPerms.length > 0) {
          throw new Error(`Permisos inválidos: ${invalidPerms.join(', ')}`);
        }
        return true;
      })
  ],
  AuthController.checkPermissions
);

// CAMBIAR CONTRASEÑA
router.put('/change-password',
  authenticateToken,
  [
    body('currentPassword')
      .isLength({ min: 6 })
      .withMessage('Contraseña actual requerida'),
    
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('Nueva contraseña debe tener entre 8 y 128 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Nueva contraseña debe contener: 1 minúscula, 1 mayúscula, 1 número, 1 carácter especial'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      })
  ],
  AuthController.changePassword
);

// =============================================================================
// 🧪 ENDPOINTS DE TESTING POR ROLES (Solo en desarrollo)
// =============================================================================

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  
  // Test acceso OPERADOR
  router.get('/test/operador',
    authenticateToken,
    requireRole(['OPERADOR', 'SUPERVISOR', 'ADMIN']),
    (req, res) => {
      res.json({
        success: true,
        message: '✅ Acceso OPERADOR exitoso',
        user: {
          id: req.user.userId,
          email: req.user.email,
          nombre: req.user.username,
          rol: req.user.rol,
          empresa: req.user.empresa?.nombre || 'Sin empresa'
        },
        test_info: {
          required_roles: ['OPERADOR', 'SUPERVISOR', 'ADMIN'],
          user_role: req.user.rol,
          access_granted: true
        }
      });
    }
  );

  // Test acceso SUPERVISOR
  router.get('/test/supervisor',
    authenticateToken,
    requireRole(['SUPERVISOR', 'ADMIN']),
    (req, res) => {
      res.json({
        success: true,
        message: '✅ Acceso SUPERVISOR exitoso',
        user: {
          id: req.user.userId,
          email: req.user.email,
          nombre: req.user.username,
          rol: req.user.rol
        },
        test_info: {
          required_roles: ['SUPERVISOR', 'ADMIN'],
          user_role: req.user.rol,
          access_granted: true
        }
      });
    }
  );

  // Test acceso ADMIN
  router.get('/test/admin',
    authenticateToken,
    requireRole('ADMIN'),
    (req, res) => {
      res.json({
        success: true,
        message: '✅ Acceso ADMIN exitoso',
        user: {
          id: req.user.userId,
          email: req.user.email,
          nombre: req.user.username,
          rol: req.user.rol
        },
        test_info: {
          required_roles: ['ADMIN'],
          user_role: req.user.rol,
          access_granted: true,
          admin_privileges: true
        }
      });
    }
  );

  // Test permisos específicos
  router.get('/test/permisos/fri-create',
    authenticateToken,
    requirePermission('FRI_CREATE'),
    (req, res) => {
      res.json({
        success: true,
        message: '✅ Permiso FRI_CREATE verificado',
        user_permissions: req.user.permisos,
        required_permission: 'FRI_CREATE',
        permission_granted: true
      });
    }
  );

  // Test permisos administrativos
  router.get('/test/permisos/admin',
    authenticateToken,
    requirePermission(['ADMIN_USERS', 'ADMIN_SYSTEM']),
    (req, res) => {
      res.json({
        success: true,
        message: '✅ Permisos administrativos verificados',
        user_permissions: req.user.permisos,
        required_permissions: ['ADMIN_USERS', 'ADMIN_SYSTEM'],
        permission_granted: true
      });
    }
  );

  // Test información completa del sistema
  router.get('/test/info',
    (req, res) => {
      res.json({
        success: true,
        message: '🧪 Sistema de autenticación ANM FRI',
        environment: process.env.NODE_ENV,
        available_tests: {
          roles: [
            'GET /api/auth/test/operador',
            'GET /api/auth/test/supervisor', 
            'GET /api/auth/test/admin'
          ],
          permissions: [
            'GET /api/auth/test/permisos/fri-create',
            'GET /api/auth/test/permisos/admin'
          ]
        },
        authentication_flow: {
          '1': 'POST /api/auth/login - Obtener token',
          '2': 'Usar token en header: Authorization: Bearer <token>',
          '3': 'Acceder a endpoints protegidos'
        },
        sample_users: {
          admin: {
            email: 'admin@anm.gov.co',
            password: 'admin123',
            rol: 'ADMIN'
          },
          operador: {
            email: 'operador@empresa.com', 
            password: 'operador123',
            rol: 'OPERADOR'
          }
        }
      });
    }
  );

}

// =============================================================================
// 📊 ESTADÍSTICAS DE AUTENTICACIÓN (Solo para ADMIN)
// =============================================================================

router.get('/stats',
  authenticateToken,
  requireRole('ADMIN'),
  async (req, res) => {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Estadísticas básicas
      const totalUsers = await prisma.usuario.count();
      const activeUsers = await prisma.usuario.count({ where: { activo: true } });
      const usersByRole = await prisma.usuario.groupBy({
        by: ['rol'],
        _count: { rol: true }
      });

      // Últimos logins
      const recentLogins = await prisma.usuario.findMany({
        where: { 
          ultimoLogin: { not: null }
        },
        select: {
          email: true,
          ultimoLogin: true,
          rol: true
        },
        orderBy: { ultimoLogin: 'desc' },
        take: 10
      });

      res.json({
        success: true,
        data: {
          resumen: {
            total_usuarios: totalUsers,
            usuarios_activos: activeUsers,
            usuarios_inactivos: totalUsers - activeUsers
          },
          por_rol: usersByRole.reduce((acc, item) => {
            acc[item.rol] = item._count.rol;
            return acc;
          }, {}),
          ultimos_logins: recentLogins,
          seguridad: {
            intentos_fallidos_activos: failedAttempts?.size || 0,
            jwt_configurado: !!process.env.JWT_SECRET,
            rate_limiting_activo: true
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

module.exports = router;