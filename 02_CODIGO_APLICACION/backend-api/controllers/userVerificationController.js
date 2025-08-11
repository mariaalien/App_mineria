// ==========================================
// controllers/userVerificationController.js
// Sistema de verificación de usuarios
// ==========================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const prisma = new PrismaClient();

class UserVerificationController {

  // =============================================================================
  // 🔍 VERIFICAR IDENTIDAD DE USUARIO
  // =============================================================================
  
  static async verifyUserIdentity(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de verificación inválidos',
          errors: errors.array()
        });
      }

      const { 
        cedula, 
        telefono, 
        tituloMinero, 
        codigoVerificacion 
      } = req.body;

      // Buscar usuario actual
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.userId },
        include: { empresa: true }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verificar datos de identidad
      const verificaciones = [];
      let puntuacionConfianza = 0;

      // Verificar teléfono
      if (telefono && usuario.telefono) {
        if (usuario.telefono === telefono) {
          verificaciones.push({ campo: 'telefono', verificado: true });
          puntuacionConfianza += 25;
        } else {
          verificaciones.push({ campo: 'telefono', verificado: false });
        }
      }

      // Verificar título minero
      if (tituloMinero && usuario.tituloMinero) {
        if (usuario.tituloMinero === tituloMinero) {
          verificaciones.push({ campo: 'tituloMinero', verificado: true });
          puntuacionConfianza += 30;
        } else {
          verificaciones.push({ campo: 'tituloMinero', verificado: false });
        }
      }

      // Verificar código de verificación (si se proporcionó)
      if (codigoVerificacion) {
        const codigoValido = await this.verificarCodigoTemporal(usuario.id, codigoVerificacion);
        if (codigoValido) {
          verificaciones.push({ campo: 'codigoVerificacion', verificado: true });
          puntuacionConfianza += 45;
        } else {
          verificaciones.push({ campo: 'codigoVerificacion', verificado: false });
        }
      }

      // Determinar nivel de verificación
      let nivelVerificacion = 'BAJO';
      if (puntuacionConfianza >= 70) {
        nivelVerificacion = 'ALTO';
      } else if (puntuacionConfianza >= 40) {
        nivelVerificacion = 'MEDIO';
      }

      // Registrar intento de verificación
      await this.registrarIntentoVerificacion(usuario.id, {
        verificaciones,
        puntuacionConfianza,
        nivelVerificacion,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Respuesta
      res.json({
        success: true,
        message: 'Verificación de identidad completada',
        data: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            verificado: puntuacionConfianza >= 70
          },
          verificacion: {
            puntuacionConfianza,
            nivelVerificacion,
            verificaciones,
            requiereVerificacionAdicional: puntuacionConfianza < 70
          }
        }
      });

    } catch (error) {
      console.error('❌ Error verificando identidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // =============================================================================
  // 📱 GENERAR CÓDIGO DE VERIFICACIÓN
  // =============================================================================
  
  static async generateVerificationCode(req, res) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.userId }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Generar código de 6 dígitos
      const codigo = crypto.randomInt(100000, 999999).toString();
      const expiracion = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Guardar código en la base de datos (tabla temporal)
      await prisma.codigoVerificacion.create({
        data: {
          usuarioId: usuario.id,
          codigo: codigo,
          tipo: 'IDENTITY_VERIFICATION',
          expiraEn: expiracion,
          usado: false
        }
      });

      // En producción, aquí enviarías el código por SMS/Email
      console.log(`📱 Código de verificación para ${usuario.email}: ${codigo}`);

      res.json({
        success: true,
        message: 'Código de verificación generado',
        data: {
          codigoEnviado: true,
          metodoEnvio: usuario.telefono ? 'SMS' : 'EMAIL',
          expiraEn: expiracion,
          // Solo para desarrollo - REMOVER EN PRODUCCIÓN
          codigo: process.env.NODE_ENV === 'development' ? codigo : undefined
        }
      });

    } catch (error) {
      console.error('❌ Error generando código:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // =============================================================================
  // 📊 OBTENER HISTORIAL DE VERIFICACIONES
  // =============================================================================
  
  static async getVerificationHistory(req, res) {
    try {
      const historial = await prisma.verificacionUsuario.findMany({
        where: { usuarioId: req.user.userId },
        orderBy: { fechaVerificacion: 'desc' },
        take: 10
      });

      res.json({
        success: true,
        message: 'Historial de verificaciones obtenido',
        data: {
          verificaciones: historial.map(v => ({
            id: v.id,
            fecha: v.fechaVerificacion,
            puntuacion: v.puntuacionConfianza,
            nivel: v.nivelVerificacion,
            exitosa: v.puntuacionConfianza >= 70
          }))
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // =============================================================================
  // 🔒 FUNCIONES AUXILIARES PRIVADAS
  // =============================================================================

  static async verificarCodigoTemporal(usuarioId, codigo) {
    try {
      const codigoRegistro = await prisma.codigoVerificacion.findFirst({
        where: {
          usuarioId,
          codigo,
          usado: false,
          expiraEn: {
            gt: new Date()
          }
        }
      });

      if (codigoRegistro) {
        // Marcar código como usado
        await prisma.codigoVerificacion.update({
          where: { id: codigoRegistro.id },
          data: { usado: true }
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verificando código temporal:', error);
      return false;
    }
  }

  static async registrarIntentoVerificacion(usuarioId, datosVerificacion) {
    try {
      await prisma.verificacionUsuario.create({
        data: {
          usuarioId,
          puntuacionConfianza: datosVerificacion.puntuacionConfianza,
          nivelVerificacion: datosVerificacion.nivelVerificacion,
          detallesVerificacion: JSON.stringify(datosVerificacion.verificaciones),
          metadatos: JSON.stringify({
            ip: datosVerificacion.ip,
            userAgent: datosVerificacion.userAgent,
            timestamp: new Date().toISOString()
          }),
          fechaVerificacion: new Date()
        }
      });
    } catch (error) {
      console.error('Error registrando verificación:', error);
    }
  }

  // =============================================================================
  // 👥 VERIFICACIÓN ADMINISTRATIVA (Solo ADMIN)
  // =============================================================================
  
  static async verifyUserByAdmin(req, res) {
    try {
      const { usuarioId, verificado, notas } = req.body;

      // Solo administradores pueden hacer esto
      if (req.user.rol !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden verificar usuarios',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const usuario = await prisma.usuario.update({
        where: { id: usuarioId },
        data: { 
          verificadoPor: req.user.userId,
          fechaVerificacion: verificado ? new Date() : null,
          notasVerificacion: notas
        }
      });

      // Registrar acción administrativa
      await prisma.auditoriaFRI.create({
        data: {
          tabla: 'usuarios',
          registroId: usuarioId,
          operacion: verificado ? 'VERIFICAR_USUARIO' : 'DESVERIFICAR_USUARIO',
          datosAnteriores: JSON.stringify({ verificado: !verificado }),
          datosNuevos: JSON.stringify({ verificado, notas }),
          usuarioId: req.user.userId,
          timestamp: new Date()
        }
      });

      res.json({
        success: true,
        message: `Usuario ${verificado ? 'verificado' : 'desverificado'} exitosamente`,
        data: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            verificado: verificado,
            verificadoPor: req.user.userId,
            fechaVerificacion: usuario.fechaVerificacion
          }
        }
      });

    } catch (error) {
      console.error('❌ Error en verificación administrativa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = UserVerificationController;

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
// VALIDADORES
// =============================================================================

const validateVerification = [
  body('cedula')
    .optional()
    .isLength({ min: 8, max: 15 })
    .withMessage('Cédula debe tener entre 8 y 15 caracteres'),
  
  body('telefono')
    .optional()
    .isMobilePhone('es-CO')
    .withMessage('Número de teléfono inválido'),
  
  body('tituloMinero')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('Título minero debe tener entre 5 y 20 caracteres'),
  
  body('codigoVerificacion')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Código de verificación debe ser de 6 dígitos')
];

// =============================================================================
// RUTAS PÚBLICAS (CON AUTENTICACIÓN)
// =============================================================================

// Verificar identidad del usuario actual
router.post('/verify-identity', 
  authenticateToken, 
  validateVerification, 
  UserVerificationController.verifyUserIdentity
);

// Generar código de verificación
router.post('/generate-code', 
  authenticateToken, 
  UserVerificationController.generateVerificationCode
);

// Obtener historial de verificaciones
router.get('/history', 
  authenticateToken, 
  UserVerificationController.getVerificationHistory
);

// =============================================================================
// RUTAS ADMINISTRATIVAS
// =============================================================================

// Verificar usuario (solo administradores)
router.post('/admin/verify-user', 
  authenticateToken, 
  requireRole(['ADMIN']),
  [
    body('usuarioId').isUUID().withMessage('ID de usuario inválido'),
    body('verificado').isBoolean().withMessage('Estado de verificación inválido'),
    body('notas').optional().isLength({ max: 500 }).withMessage('Notas muy largas')
  ],
  UserVerificationController.verifyUserByAdmin
);

module.exports = router;