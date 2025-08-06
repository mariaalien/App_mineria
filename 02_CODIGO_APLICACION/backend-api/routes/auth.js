// ================================
// 📁 routes/auth.js - RUTAS SÚPER SIMPLIFICADAS
// ================================
const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');

// Importar solo lo que sabemos que funciona
const { 
  authenticateToken,
  authLimiter,
  requireRole
} = require('../middleware/security');

const router = express.Router();

// =============================================================================
// 🔐 RUTAS BÁSICAS DE AUTENTICACIÓN (Solo métodos que existen)
// =============================================================================

// LOGIN
router.post('/login',
  authLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email debe ser válido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password debe tener al menos 6 caracteres')
  ],
  AuthController.login
);

// PROFILE
router.get('/profile',
  authenticateToken,
  AuthController.getProfile
);

// LOGOUT
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

// =============================================================================
// 🧪 ENDPOINTS DE TESTING SIMPLES
// =============================================================================

if (process.env.NODE_ENV === 'development') {
  
  // Test OPERADOR
  router.get('/test/operador',
    authenticateToken,
    requireRole(['OPERADOR', 'SUPERVISOR', 'ADMIN']),
    (req, res) => {
      res.json({ 
        success: true,
        message: '✅ Acceso OPERADOR exitoso', 
        user: {
          id: req.user.userId,
          nombre: req.user.username,
          rol: req.user.role
        }
      });
    }
  );

  // Test ADMIN
  router.get('/test/admin',
    authenticateToken,
    requireRole('ADMIN'),
    (req, res) => {
      res.json({ 
        success: true,
        message: '✅ Acceso ADMIN exitoso', 
        user: {
          id: req.user.userId,
          nombre: req.user.username,
          rol: req.user.role
        }
      });
    }
  );

  // Test INFO
  router.get('/test/info',
    (req, res) => {
      res.json({
        success: true,
        message: '🧪 Sistema de autenticación funcionando',
        endpoints: [
          'POST /api/auth/login',
          'GET /api/auth/profile',
          'POST /api/auth/logout'
        ]
      });
    }
  );

}

// =============================================================================
// HEALTH CHECK
// =============================================================================

router.get('/health',
  (req, res) => {
    res.json({
      success: true,
      message: '❤️ Autenticación funcionando',
      jwt_configured: !!process.env.JWT_SECRET
    });
  }
);

module.exports = router;