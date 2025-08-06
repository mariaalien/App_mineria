// ================================
// 📁 controllers/authController.js - SINTAXIS CORREGIDA
// ================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

class AuthController {
  // 🔐 LOGIN
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      console.log(`🔍 Intento de login para: ${email}`);

      const user = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          empresa: {
            select: {
              id: true,
              nombre: true,
              nit: true
            }
          },
          permisos: {
            include: {
              permiso: {
                select: {
                  codigo: true,
                  nombre: true,
                  modulo: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        console.log(`❌ Usuario no encontrado: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      if (!user.activo) {
        console.log(`❌ Usuario inactivo: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo',
          code: 'USER_INACTIVE'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        console.log(`❌ Contraseña incorrecta para: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        empresaId: user.empresaId,
        permisos: user.permisos.map(up => up.permiso.codigo)
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'anm_fri_secret_2025',
        { 
          expiresIn: '24h',
          issuer: 'ANM-FRI-System',
          audience: 'anm-fri-users'
        }
      );

      await prisma.usuario.update({
        where: { id: user.id },
        data: { ultimoLogin: new Date() }
      });

      console.log(`✅ Login exitoso para: ${email} (${user.rol})`);

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
            permisos: user.permisos.map(up => ({
              codigo: up.permiso.codigo,
              nombre: up.permiso.nombre,
              modulo: up.permiso.modulo
            }))
          },
          token,
          expiresIn: '24h'
        }
      });

    } catch (error) {
      console.error('💥 Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // 👤 PROFILE
  static async getProfile(req, res) {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          tituloMinero: true,
          municipio: true,
          telefono: true,
          ultimoLogin: true,
          createdAt: true,
          empresa: {
            select: {
              nombre: true,
              nit: true
            }
          },
          permisos: {
            include: {
              permiso: {
                select: {
                  codigo: true,
                  nombre: true,
                  descripcion: true,
                  modulo: true
                }
              }
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

      const permisosPorModulo = user.permisos.reduce((acc, up) => {
        const modulo = up.permiso.modulo;
        if (!acc[modulo]) {
          acc[modulo] = [];
        }
        acc[modulo].push({
          codigo: up.permiso.codigo,
          nombre: up.permiso.nombre,
          descripcion: up.permiso.descripcion
        });
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          ...user,
          permisos: user.permisos.map(up => up.permiso.codigo),
          permisosPorModulo
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // 🚪 LOGOUT - SINTAXIS CORREGIDA
  static async logout(req, res) {
    try {
      console.log(`🚪 Logout para usuario: ${req.user.email}`);
      
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

  // 🔄 REFRESH TOKEN - SINTAXIS CORREGIDA
  static async refreshToken(req, res) {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: req.user.userId },
        include: {
          empresa: { select: { id: true, nombre: true, nit: true } },
          permisos: { include: { permiso: { select: { codigo: true } } } }
        }
      });

      if (!user || !user.activo) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no válido para renovar token'
        });
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        empresaId: user.empresaId,
        permisos: user.permisos.map(up => up.permiso.codigo)
      };

      const newToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'anm_fri_secret_2025',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          token: newToken,
          expiresIn: '24h'
        }
      });

    } catch (error) {
      console.error('❌ Error renovando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error renovando token'
      });
    }
  }

  // 📊 CHECK PERMISSIONS - SINTAXIS CORREGIDA
  static async checkPermissions(req, res) {
    try {
      const { permisos } = req.body;

      if (!Array.isArray(permisos)) {
        return res.status(400).json({
          success: false,
          message: 'Debe enviar un array de permisos'
        });
      }

      const userPermissions = await prisma.usuarioPermiso.findMany({
        where: {
          usuarioId: req.user.userId,
          permiso: {
            codigo: { in: permisos },
            activo: true
          }
        },
        include: {
          permiso: { select: { codigo: true } }
        }
      });

      const permisosUsuario = userPermissions.map(up => up.permiso.codigo);
      const resultado = permisos.reduce((acc, permiso) => {
        acc[permiso] = permisosUsuario.includes(permiso) || req.user.rol === 'ADMIN';
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          permisos: resultado,
          usuario: {
            id: req.user.userId,
            rol: req.user.rol
          }
        }
      });

    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando permisos'
      });
    }
  }
}

module.exports = AuthController;