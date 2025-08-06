const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const PermissionUtils = require('../utils/permissionUtils');
const { ROLES } = require('../config/roles');

const prisma = new PrismaClient();

async function setupAuthentication() {
  try {
    console.log('🚀 Configurando sistema de autenticación ANM FRI...');

    // 1. Sincronizar permisos
    await PermissionUtils.syncPermissions();

    // 2. Crear empresa por defecto si no existe
    const empresaDefault = await prisma.empresa.upsert({
      where: { nit: 'DEFAULT' },
      update: {},
      create: {
        nombre: 'Empresa por Defecto',
        nit: 'DEFAULT',
        activa: true
      }
    });

    // 3. Crear usuario ADMIN por defecto
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const adminUser = await prisma.usuario.upsert({
      where: { email: 'admin@anm-fri.com' },
      update: {},
      create: {
        email: 'admin@anm-fri.com',
        password: hashedPassword,
        nombre: 'Administrador Sistema',
        rol: 'ADMIN',
        activo: true,
        empresaId: empresaDefault.id
      }
    });

    // 4. Asignar permisos al admin
    await PermissionUtils.assignDefaultPermissions(adminUser.id, 'ADMIN');

    console.log('✅ Sistema de autenticación configurado exitosamente');
    console.log('📧 Usuario admin: admin@anm-fri.com');
    console.log('🔑 Password: admin123456');
    console.log('⚠️  IMPORTANTE: Cambiar la contraseña por defecto en producción');

  } catch (error) {
    console.error('❌ Error configurando autenticación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupAuthentication();
}

module.exports = setupAuthentication;