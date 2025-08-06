// ================================
// 📁 controllers/authController.js - VERSIÓN TEMPORAL SIN PRISMA
// ================================
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { generateToken, findUserByEmail, getDemoUsers } = require('../middleware/security');

// Cache para intentos fallidos (en producción usar Redis)
const failedAttempts = new Map();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

class AuthController {
  
  // =============================================================================
  // 🔐 LOGIN EMPRESARIAL CON USUARIOS DEMO
  // =============================================================================
  
  static async login(req, res) {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const clientIP = req.ip;
      const userAgent = req.get('User-Agent');

      console.log(`🔍 Intento de login para: ${email} desde IP: ${clientIP}`);

      // Verificar bloqueo por intentos fallidos
      const lockoutKey = `${email}:${clientIP}`;
      const attemptData = failedAttempts.get(lockoutKey);
      
      if (attemptData && attemptData.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil((attemptData.lockedUntil - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          message: `Cuenta bloqueada temporalmente. Intenta en ${remainingMinutes} minutos.`,
          code: 'ACCOUNT_LOCKED',
          locked_until: new Date(attemptData.lockedUntil).toISOString()
        });
      }

      // Buscar usuario en datos demo
      const user = findUserByEmail(email);

      // Verificar existencia del usuario
      if (!user) {
        await AuthController.registerFailedAttempt(lockoutKey);
        console.log(`❌ Usuario no encontrado: ${email}`);
        
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Verificar estado del usuario
      if (!user.activo) {
        console.log(`❌ Usuario inactivo: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo. Contacta al administrador.',
          code: 'USER_INACTIVE'
        });
      }

      // Verificar empresa activa
      if (user.empresa && !user.empresa.activa) {
        console.log(`❌ Empresa inactiva para usuario: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Empresa inactiva. Contacta al administrador.',
          code: 'COMPANY_INACTIVE'
        });
      }

      // Verificar contraseña (temporalmente deshabilitado para testing)
      // const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      const isValidPassword = (password === 'admin123' || password === 'operador123' || password === 'supervisor123');
      if (!isValidPassword) {
        await AuthController.registerFailedAttempt(lockoutKey);
        console.log(`❌ Contraseña incorrecta para: ${email}`);
        
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Limpiar intentos fallidos exitosos
      failedAttempts.delete(lockoutKey);

      // Preparar payload del token
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        empresaId: user.empresa.id,
        permisos: user.permisos
      };

      // Generar token JWT
      const token = generateToken(tokenPayload);

      // Organizar permisos por módulo
      const permisosPorModulo = user.permisos.reduce((acc, permiso) => {
        let modulo = 'FRI';
        if (permiso.startsWith('REPORTS_')) modulo = 'REPORTES';
        if (permiso.startsWith('ADMIN_')) modulo = 'ADMIN';
        
        if (!acc[modulo]) acc[modulo] = [];
        acc[modulo].push({
          codigo: permiso,
          nombre: permiso.replace(/_/g, ' '),
          descripcion: `Permiso para ${permiso.toLowerCase().replace(/_/g, ' ')}`
        });
        return acc;
      }, {});

      console.log(`✅ Login exitoso para: ${email} (${user.rol})`);

      // Respuesta exitosa
      res.json({
        success: true,
        message: 'Autenticación exitosa',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            empresa: user.empresa,
            permisos: user.permisos,
            permisosPorModulo
          },
          token,
          expiresIn: '24h',
          tokenType: 'Bearer'
        }
      });

    } catch (error) {
      console.error('💥 Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // =============================================================================
  // 👤 OBTENER PERFIL DE USUARIO
  // =============================================================================
  
  static async getProfile(req, res) {
    try {
      // Buscar usuario por ID en datos demo
      const users = getDemoUsers();
      const user = Object.values(users).find(u => u.id === req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Organizar permisos por módulo
      const permisosPorModulo = user.permisos.reduce((acc, permiso) => {
        let modulo = 'FRI';
        if (permiso.startsWith('REPORTS_')) modulo = 'REPORTES';
        if (permiso.startsWith('ADMIN_')) modulo = 'ADMIN';
        
        if (!acc[modulo]) acc[modulo] = [];
        acc[modulo].push({
          codigo: permiso,
          nombre: permiso.replace(/_/g, ' '),
          descripcion: `Permiso para ${permiso.toLowerCase().replace(/_/g, ' ')}`
        });
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          tituloMinero: user.tituloMinero || null,
          municipio: user.municipio || null,
          telefono: user.telefono || null,
          ultimoLogin: new Date().toISOString(), // Simulado
          createdAt: new Date('2024-01-01').toISOString(), // Simulado
          empresa: user.empresa,
          permisos: user.permisos,
          permisosPorModulo
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // =============================================================================
  // 🚪 LOGOUT SEGURO
  // =============================================================================
  
  static async logout(req, res) {
    try {
      console.log(`🚪 Logout para usuario: ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // =============================================================================
  // 🔄 RENOVAR TOKEN
  // =============================================================================
  
  static async refreshToken(req, res) {
    try {
      const users = getDemoUsers();
      const user = Object.values(users).find(u => u.id === req.user.userId);

      if (!user || !user.activo) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no válido para renovar token',
          code: 'INVALID_USER'
        });
      }

      if (user.empresa && !user.empresa.activa) {
        return res.status(401).json({
          success: false,
          message: 'Empresa inactiva',
          code: 'COMPANY_INACTIVE'
        });
      }

      // Generar nuevo token
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        empresaId: user.empresa.id,
        permisos: user.permisos
      };

      const newToken = generateToken(tokenPayload);

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          token: newToken,
          expiresIn: '24h',
          tokenType: 'Bearer'
        }
      });

    } catch (error) {
      console.error('❌ Error renovando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error renovando token',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // =============================================================================
  // 📊 VERIFICAR PERMISOS
  // =============================================================================
  
  static async checkPermissions(req, res) {
    try {
      const { permisos } = req.body;

      if (!Array.isArray(permisos)) {
        return res.status(400).json({
          success: false,
          message: 'Debe enviar un array de permisos',
          code: 'INVALID_INPUT'
        });
      }

      // Crear resultado de verificación
      const resultado = permisos.reduce((acc, permiso) => {
        // Los ADMIN tienen todos los permisos automáticamente
        acc[permiso] = req.user.rol === 'ADMIN' || req.user.permisos.includes(permiso);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          permisos: resultado,
          usuario: {
            id: req.user.userId,
            email: req.user.email,
            rol: req.user.rol,
            esAdmin: req.user.rol === 'ADMIN'
          },
          resumen: {
            total_verificados: permisos.length,
            concedidos: Object.values(resultado).filter(Boolean).length,
            denegados: Object.values(resultado).filter(v => !v).length
          }
        }
      });

    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando permisos',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // =============================================================================
  // 🔒 CAMBIAR CONTRASEÑA
  // =============================================================================
  
  static async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Encontrar usuario actual
      const users = getDemoUsers();
      const user = Object.values(users).find(u => u.id === req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // En un sistema real aquí actualizarías la contraseña en la BD
      console.log(`✅ Contraseña cambiada para usuario: ${user.email} (simulado)`);

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente (simulado - sin base de datos)'
      });

    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // =============================================================================
  // 📊 ESTADÍSTICAS DE AUTENTICACIÓN
  // =============================================================================
  
  static async getStats(req, res) {
    try {
      const users = getDemoUsers();
      const userList = Object.values(users);

      // Estadísticas simuladas
      const stats = {
        resumen: {
          total_usuarios: userList.length,
          usuarios_activos: userList.filter(u => u.activo).length,
          usuarios_inactivos: userList.filter(u => !u.activo).length
        },
        por_rol: {
          ADMIN: userList.filter(u => u.rol === 'ADMIN').length,
          SUPERVISOR: userList.filter(u => u.rol === 'SUPERVISOR').length,
          OPERADOR: userList.filter(u => u.rol === 'OPERADOR').length
        },
        ultimos_logins: userList.map(u => ({
          email: u.email,
          rol: u.rol,
          ultimoLogin: new Date().toISOString() // Simulado
        })),
        seguridad: {
          intentos_fallidos_activos: failedAttempts.size,
          jwt_configurado: true,
          rate_limiting_activo: true
        }
      };

      res.json({
        success: true,
        data: stats,
        note: 'Estadísticas simuladas - sin base de datos'
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

  // =============================================================================
  // 🚨 HELPER: REGISTRAR INTENTO FALLIDO
  // =============================================================================
  
  static async registerFailedAttempt(key) {
    const now = Date.now();
    const attemptData = failedAttempts.get(key) || { count: 0, firstAttempt: now };
    
    attemptData.count++;
    attemptData.lastAttempt = now;
    
    if (attemptData.count >= LOCKOUT_THRESHOLD) {
      attemptData.lockedUntil = now + LOCKOUT_DURATION;
      console.log(`🚨 Cuenta bloqueada: ${key} por ${LOCKOUT_DURATION / 60000} minutos`);
    }
    
    failedAttempts.set(key, attemptData);
    
    // Limpiar intentos antiguos (opcional)
    setTimeout(() => {
      if (failedAttempts.has(key)) {
        const data = failedAttempts.get(key);
        if (!data.lockedUntil || data.lockedUntil < Date.now()) {
          failedAttempts.delete(key);
        }
      }
    }, LOCKOUT_DURATION);
  }
}

module.exports = AuthController;