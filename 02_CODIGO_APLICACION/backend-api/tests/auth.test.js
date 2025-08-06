const { PrismaClient } = require('@prisma/client');
const { PERMISOS, PERMISOS_POR_ROL } = require('../config/roles');

const prisma = new PrismaClient();

class PermissionUtils {
  // 🔧 Sincronizar permisos en la base de datos
  static async syncPermissions() {
    try {
      console.log('🔄 Sincronizando permisos en la base de datos...');

      for (const [codigo, permisoData] of Object.entries(PERMISOS)) {
        await prisma.permiso.upsert({
          where: { codigo },
          update: {
            nombre: permisoData.nombre,
            descripcion: permisoData.descripcion,
            modulo: permisoData.modulo
          },
          create: {
            codigo,
            nombre: permisoData.nombre,
            descripcion: permisoData.descripcion,
            modulo: permisoData.modulo,
            activo: true
          }
        });
      }

      console.log('✅ Permisos sincronizados exitosamente');
    } catch (error) {
      console.error('❌ Error sincronizando permisos:', error);
      throw error;
    }
  }

  // 👥 Asignar permisos por defecto a usuario según su rol
  static async assignDefaultPermissions(userId, rol) {
    try {
      const permisosRol = PERMISOS_POR_ROL[rol] || [];
      
      // Eliminar permisos existentes del usuario
      await prisma.usuarioPermiso.deleteMany({
        where: { usuarioId: userId }
      });

      // Asignar nuevos permisos
      for (const codigoPermiso of permisosRol) {
        const permiso = await prisma.permiso.findUnique({
          where: { codigo: codigoPermiso }
        });

        if (permiso) {
          await prisma.usuarioPermiso.create({
            data: {
              usuarioId,
              permisoId: permiso.id,
              asignadoPor: 'SYSTEM',
              fechaAsignacion: new Date()
            }
          });
        }
      }

      console.log(`✅ Permisos asignados a usuario ${userId} con rol ${rol}`);
    } catch (error) {
      console.error('❌ Error asignando permisos:', error);
      throw error;
    }
  }

  // 🔍 Verificar si usuario tiene permiso específico
  static async userHasPermission(userId, codigoPermiso) {
    try {
      const userPermission = await prisma.usuarioPermiso.findFirst({
        where: {
          usuarioId,
          permiso: {
            codigo: codigoPermiso,
            activo: true
          }
        },
        include: {
          permiso: true
        }
      });

      return !!userPermission;
    } catch (error) {
      console.error('❌ Error verificando permiso:', error);
      return false;
    }
  }

  // 📊 Obtener permisos de usuario
  static async getUserPermissions(userId) {
    try {
      const userPermissions = await prisma.usuarioPermiso.findMany({
        where: { usuarioId },
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
      });

      return userPermissions.map(up => up.permiso);
    } catch (error) {
      console.error('❌ Error obteniendo permisos:', error);
      return [];
    }
  }

  // 🏢 Verificar permisos a nivel de empresa
  static async userCanAccessCompanyData(userId, empresaId) {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          empresaId: true,
          rol: true
        }
      });

      // ADMIN puede acceder a cualquier empresa
      if (user?.rol === 'ADMIN') {
        return true;
      }

      // Otros roles solo pueden acceder a su propia empresa
      return user?.empresaId === empresaId;
    } catch (error) {
      console.error('❌ Error verificando acceso a empresa:', error);
      return false;
    }
  }
}

module.exports = PermissionUtils;