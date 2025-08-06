// ================================
// 📁 routes/auth.js - SOLO RUTAS (LIMPIO)
// ================================
const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');

// Importar SOLO los middlewares que existen en security.js
const { 
  authenticateToken,        // Tu middleware existente
  authLimiter,              // Tu rate limiter existente 
  requireRole               // Tu middleware de roles existente
} = require('../middleware/security');

const router = express.Router();

// =============================================================================
// 🔐 RUTAS DE AUTENTICACIÓN BÁSICAS
// =============================================================================

// LOGIN - Con tu rate limiter existente
router.post('/login',
  authLimiter, // ✅ Usando tu authLimiter que ya funciona
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email debe ser válido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password debe tener al menos 8 caracteres'),
    body('recordarme')
      .optional()
      .isBoolean()
      .withMessage('RecordarMe debe ser booleano')
  ],
  AuthController.login
);

// PROFILE - Obtener perfil del usuario
router.get('/profile',
  authenticateToken, // ✅ Usando tu middleware existente
  AuthController.getProfile
);

// LOGOUT - Cerrar sesión
router.post('/logout',
  authenticateToken, // ✅ Usando tu middleware existente
  AuthController.logout
);

// =============================================================================
// 🧪 ENDPOINTS DE TESTING (Solo desarrollo) - SIMPLIFICADOS
// =============================================================================

if (process.env.NODE_ENV === 'development') {
  
  // Test endpoint para OPERADOR
  router.get('/test/operador',
    authenticateToken,
    requireRole(['OPERADOR', 'SUPERVISOR', 'ADMIN']),
    (req, res) => {
      res.json({ 
        success: true,
        message: 'Acceso OPERADOR exitoso', 
        user: {
          id: req.user.userId,
          nombre: req.user.username,
          rol: req.user.role
        }
      });
    }
  );

  // Test endpoint para ADMIN
  router.get('/test/admin',
    authenticateToken,
    requireRole('ADMIN'),
    (req, res) => {
      res.json({ 
        success: true,
        message: 'Acceso ADMIN exitoso', 
        user: {
          id: req.user.userId,
          nombre: req.user.username,
          rol: req.user.role
        }
      });
    }
  );

}

module.exports = router;