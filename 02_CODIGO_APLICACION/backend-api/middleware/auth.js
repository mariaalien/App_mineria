const { verifyToken } = require('../config/jwt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7);
    
    // Verificar token
    const decoded = verifyToken(token);
    
    // Buscar usuario en la base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      include: {
        empresa: true,
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido o inactivo',
        code: 'INVALID_USER'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      empresaId: user.empresaId,
      empresa: user.empresa,
      permisos: user.permisos.map(up => up.permiso.codigo)
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      code: 'INVALID_TOKEN',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = authMiddleware;