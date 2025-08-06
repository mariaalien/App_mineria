// ================================
// 📁 controllers/authController.js - SIMPLE y FUNCIONAL
// ================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

class AuthController {
  // 🔐 LOGIN - Autenticación simple
  static async login(req, res) {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuario
      const user = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          empresa: true
        }
      });

      // Validar usuario
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo',
          code: 'USER_INACTIVE'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generar token JWT simple
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          rol: user.rol
        },
        process.env.JWT_SECRET || 'anm_fri_secret_2025',
        { expiresIn: '24h' }
      );

      // Actualizar último login
      await prisma.usuario.update({
        where: { id: user.id },
        data: { ultimoLogin: new Date() }
      });

      res.json({
        success: true,
        message: 'Autenticación exitosa',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol
          },
          token
        }
      });

    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // 👤 PROFILE - Obtener perfil
  static async getProfile(req, res) {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          ultimoLogin: true,
          empresa: {
            select: {
              nombre: true,
              nit: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // 🚪 LOGOUT - Cerrar sesión
  static async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = AuthController;