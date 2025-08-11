// ==========================================
// routes/userVerification.js
// Rutas de verificación de usuarios
// ==========================================

const express = require('express');
const { body } = require('express-validator');
const UserVerificationController = require('../controllers/userVerificationController');
const { authenticateToken, requireRole } = require('../middleware/security');

const router = express.Router();

// =============================================================================
// VALIDADORES DE ENTRADA
// =============================================================================

const validateVerification = [
  body('cedula')
    .optional()
    .isLength({ min: 8, max: 15 })
    .withMessage('Cédula debe tener entre 8 y 15 caracteres')
    .matches(/^[0-9]+$/)
    .withMessage('Cédula debe contener solo números'),
  
  body('telefono')
    .optional()
    .matches(/^\+?57\s?[0-9]{10}$|^[0-9]{10}$/)
    .withMessage('Número de teléfono debe ser válido para Colombia'),
  
  body('tituloMinero')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('Título minero debe tener entre 5 y 20 caracteres')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Título minero debe contener solo letras mayúsculas, números y guiones'),
  
  body('codigoVerificacion')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Código de verificación debe ser de 6 dígitos numéricos')
];

const validateAdminVerification = [
  body('usuarioId')
    .isUUID()
    .withMessage('ID de usuario inválido'),
  
  body('verificado')
    .isBoolean()
    .withMessage('Estado de verificación debe ser verdadero o falso'),
  
  body('notas')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
    .trim()
];

// =============================================================================
// RUTAS PÚBLICAS (CON AUTENTICACIÓN BÁSICA)
// =============================================================================

// Health check del sistema de verificación
router.get('/health', (req, res) => {
  res.json({
    service: 'User Verification System',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      user_verification: 'POST /verify-identity',
      generate_code: 'POST /generate-code',
      verification_history: 'GET /history',
      admin_verification: 'POST /admin/verify-user'
    }
  });
});

// Verificar identidad del usuario actual
router.post('/verify-identity', 
  authenticateToken, 
  validateVerification, 
  UserVerificationController.verifyUserIdentity
);

// Generar código de verificación temporal
router.post('/generate-code', 
  authenticateToken, 
  UserVerificationController.generateVerificationCode
);

// Obtener historial de verificaciones del usuario actual
router.get('/history', 
  authenticateToken, 
  UserVerificationController.getVerificationHistory
);

// Obtener estado de verificación del usuario actual
router.get('/status', 
  authenticateToken, 
  async (req, res) => {
    try {
      // Simular búsqueda de estado (en tu caso usarías Prisma)
      const mockStatus = {
        userId: req.user.userId,
        email: req.user.email,
        verificado: Math.random() > 0.5, // Simulado
        fechaVerificacion: new Date('2024-08-10T10:30:00'),
        puntuacionConfianza: Math.floor(Math.random() * 100),
        totalIntentos: Math.floor(Math.random() * 5) + 1,
        ultimoIntento: new Date()
      };

      res.json({
        success: true,
        message: 'Estado de verificación obtenido',
        data: mockStatus
      });

    } catch (error) {
      console.error('❌ Error obteniendo estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// =============================================================================
// RUTAS ADMINISTRATIVAS (SOLO SUPERVISORES Y ADMIN)
// =============================================================================

// Verificar usuario manualmente (solo administradores)
router.post('/admin/verify-user', 
  authenticateToken, 
  requireRole(['ADMIN']),
  validateAdminVerification,
  UserVerificationController.verifyUserByAdmin
);

// Obtener estadísticas de verificación (supervisores y admin)
router.get('/admin/stats', 
  authenticateToken, 
  requireRole(['ADMIN', 'SUPERVISOR']),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Estadísticas simuladas (en tu caso usarías Prisma)
      const mockStats = {
        periodo: {
          inicio: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          fin: endDate || new Date()
        },
        resumen: {
          totalVerificaciones: 156,
          verificacionesExitosas: 132,
          tasaExito: 85,
          usuariosVerificados: 76,
          usuariosTotales: 89,
          tasaVerificacionUsuarios: 85
        },
        porTipo: {
          automaticas: 120,
          manuales: 36,
          fallidas: 24
        },
        porRol: {
          OPERADOR: 89,
          SUPERVISOR: 45,
          ADMIN: 22
        },
        actividad: {
          hoy: 23,
          ayer: 18,
          ultimaSemana: 89,
          ultimoMes: 156
        }
      };

      res.json({
        success: true,
        message: 'Estadísticas de verificación obtenidas',
        data: mockStats
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

// Obtener lista de usuarios con estado de verificación (solo admin)
router.get('/admin/users', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        role = '', 
        verified = '' 
      } = req.query;

      // Datos simulados (en tu caso usarías Prisma con filtros reales)
      const mockUsers = [
        {
          id: '1',
          nombre: 'Juan Carlos Supervisor',
          email: 'supervisor@minera.com',
          rol: 'SUPERVISOR',
          activo: true,
          empresa: 'Minera Demo S.A.S.',
          verificado: true,
          fechaVerificacion: new Date('2024-08-10T10:30:00'),
          verificadoPor: 'admin@anm.gov.co',
          totalVerificaciones: 3,
          ultimaVerificacion: new Date('2024-08-10T10:30:00'),
          puntuacionPromedio: 85
        },
        {
          id: '2',
          nombre: 'María Fernanda Operador',
          email: 'operador@minera.com',
          rol: 'OPERADOR',
          activo: true,
          empresa: 'Extractora Test Ltda.',
          verificado: false,
          fechaVerificacion: null,
          verificadoPor: null,
          totalVerificaciones: 1,
          ultimaVerificacion: new Date('2024-08-11T08:45:00'),
          puntuacionPromedio: 45
        }
      ];

      // Aplicar filtros simulados
      let filteredUsers = mockUsers;
      
      if (search) {
        filteredUsers = filteredUsers.filter(user => 
          user.nombre.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (role) {
        filteredUsers = filteredUsers.filter(user => user.rol === role);
      }
      
      if (verified !== '') {
        const isVerified = verified === 'true';
        filteredUsers = filteredUsers.filter(user => user.verificado === isVerified);
      }

      // Paginación simulada
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      res.json({
        success: true,
        message: 'Lista de usuarios obtenida',
        data: {
          users: paginatedUsers,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(filteredUsers.length / limit),
            count: filteredUsers.length,
            hasNext: endIndex < filteredUsers.length,
            hasPrev: page > 1
          },
          filters: {
            search,
            role,
            verified
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

// Invalidar verificaciones de un usuario (solo admin)
router.post('/admin/invalidate-verification', 
  authenticateToken, 
  requireRole(['ADMIN']),
  [
    body('usuarioId').isUUID().withMessage('ID de usuario inválido'),
    body('razon').isLength({ min: 10, max: 200 }).withMessage('La razón debe tener entre 10 y 200 caracteres')
  ],
  async (req, res) => {
    try {
      const { usuarioId, razon } = req.body;

      // Aquí invalidarías la verificación en la base de datos
      console.log(`🚫 Invalidando verificación para usuario ${usuarioId} por: ${razon}`);

      res.json({
        success: true,
        message: 'Verificación invalidada exitosamente',
        data: {
          usuarioId,
          invalidadoPor: req.user.userId,
          razon,
          fecha: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error invalidando verificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

// =============================================================================
// MIDDLEWARE DE ERROR PARA ESTA RUTA
// =============================================================================

router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de verificación:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error en el sistema de verificación',
    code: 'VERIFICATION_SYSTEM_ERROR',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;