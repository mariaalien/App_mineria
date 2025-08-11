# ==========================================
# COMANDOS DE MIGRACIÓN PARA SISTEMA DE VERIFICACIÓN
# ==========================================

# 1. Primero, asegúrate de que Prisma esté funcionando
echo "🔍 Verificando estado de Prisma..."
npx prisma migrate status

# 2. Generar migración para las nuevas tablas de verificación
echo "📊 Creando migración para sistema de verificación..."
npx prisma migrate dev --name add_user_verification_system

# 3. Si hay problemas con la migración, usar reset (CUIDADO: borra datos)
echo "⚠️  Si necesitas resetear la base de datos (SOLO EN DESARROLLO):"
echo "npx prisma migrate reset --force"

# 4. Generar cliente de Prisma actualizado
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# 5. Poblar base de datos con datos de prueba
echo "🌱 Poblando base de datos con datos de prueba..."
npx prisma db seed

# ==========================================
# SCRIPT DE SEEDING PARA DATOS DE PRUEBA
# Crear archivo: prisma/seed.js
# ==========================================

cat > prisma/seed.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...');

  // Crear empresas de prueba
  const empresaDemo = await prisma.empresa.upsert({
    where: { nit: '900123456-7' },
    update: {},
    create: {
      nombre: 'Minera Demo S.A.S.',
      nit: '900123456-7',
      activa: true
    }
  });

  const empresaTest = await prisma.empresa.upsert({
    where: { nit: '800987654-3' },
    update: {},
    create: {
      nombre: 'Extractora Test Ltda.',
      nit: '800987654-3',
      activa: true
    }
  });

  // Crear permisos del sistema
  const permisos = [
    { codigo: 'FRI_CREATE', nombre: 'Crear FRI', descripcion: 'Crear formularios FRI', modulo: 'FRI' },
    { codigo: 'FRI_READ', nombre: 'Leer FRI', descripcion: 'Consultar formularios FRI', modulo: 'FRI' },
    { codigo: 'FRI_UPDATE', nombre: 'Actualizar FRI', descripcion: 'Modificar formularios FRI', modulo: 'FRI' },
    { codigo: 'FRI_DELETE', nombre: 'Eliminar FRI', descripcion: 'Eliminar formularios FRI', modulo: 'FRI' },
    { codigo: 'REPORTS_VIEW', nombre: 'Ver Reportes', descripcion: 'Consultar reportes', modulo: 'REPORTES' },
    { codigo: 'REPORTS_EXPORT', nombre: 'Exportar Reportes', descripcion: 'Exportar reportes', modulo: 'REPORTES' },
    { codigo: 'ADMIN_USERS', nombre: 'Gestionar Usuarios', descripcion: 'Administrar usuarios', modulo: 'ADMIN' },
    { codigo: 'ADMIN_SYSTEM', nombre: 'Administrar Sistema', descripcion: 'Configuración del sistema', modulo: 'ADMIN' }
  ];

  for (const permiso of permisos) {
    await prisma.permiso.upsert({
      where: { codigo: permiso.codigo },
      update: {},
      create: permiso
    });
  }

  // Crear usuarios de prueba
  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@anm.gov.co' },
    update: {},
    create: {
      nombre: 'Administrador Sistema',
      email: 'admin@anm.gov.co',
      passwordHash,
      rol: 'ADMIN',
      telefono: '+57 300 123 4567',
      tituloMinero: 'ADMIN-001',
      municipio: 'Bogotá',
      empresaId: empresaDemo.id,
      activo: true
    }
  });

  const supervisorUser = await prisma.usuario.upsert({
    where: { email: 'supervisor@minera.com' },
    update: {},
    create: {
      nombre: 'Juan Carlos Supervisor',
      email: 'supervisor@minera.com',
      passwordHash: await bcrypt.hash('supervisor123', 10),
      rol: 'SUPERVISOR',
      telefono: '+57 310 456 7890',
      tituloMinero: 'TM-12345-2024',
      municipio: 'Medellín',
      empresaId: empresaDemo.id,
      activo: true
    }
  });

  const operadorUser = await prisma.usuario.upsert({
    where: { email: 'operador@minera.com' },
    update: {},
    create: {
      nombre: 'María Fernanda Operador',
      email: 'operador@minera.com',
      passwordHash: await bcrypt.hash('operador123', 10),
      rol: 'OPERADOR',
      telefono: '+57 320 789 0123',
      tituloMinero: 'TM-67890-2024',
      municipio: 'Cali',
      empresaId: empresaTest.id,
      activo: true
    }
  });

  // Asignar permisos a usuarios
  const todosLosPermisos = await prisma.permiso.findMany();
  
  // Admin: todos los permisos
  for (const permiso of todosLosPermisos) {
    await prisma.usuarioPermiso.upsert({
      where: {
        usuarioId_permisoId: {
          usuarioId: adminUser.id,
          permisoId: permiso.id
        }
      },
      update: {},
      create: {
        usuarioId: adminUser.id,
        permisoId: permiso.id,
        asignadoPor: adminUser.id,
        fechaAsignacion: new Date()
      }
    });
  }

  // Supervisor: permisos FRI y reportes
  const permisosSupervisor = todosLosPermisos.filter(p => 
    p.modulo === 'FRI' || p.modulo === 'REPORTES'
  );
  
  for (const permiso of permisosSupervisor) {
    await prisma.usuarioPermiso.upsert({
      where: {
        usuarioId_permisoId: {
          usuarioId: supervisorUser.id,
          permisoId: permiso.id
        }
      },
      update: {},
      create: {
        usuarioId: supervisorUser.id,
        permisoId: permiso.id,
        asignadoPor: adminUser.id,
        fechaAsignacion: new Date()
      }
    });
  }

  // Operador: solo permisos básicos de FRI
  const permisosOperador = todosLosPermisos.filter(p => 
    ['FRI_CREATE', 'FRI_READ', 'FRI_UPDATE', 'REPORTS_VIEW'].includes(p.codigo)
  );
  
  for (const permiso of permisosOperador) {
    await prisma.usuarioPermiso.upsert({
      where: {
        usuarioId_permisoId: {
          usuarioId: operadorUser.id,
          permisoId: permiso.id
        }
      },
      update: {},
      create: {
        usuarioId: operadorUser.id,
        permisoId: permiso.id,
        asignadoPor: adminUser.id,
        fechaAsignacion: new Date()
      }
    });
  }

  console.log('✅ Seeding completado exitosamente!');
  console.log('👤 Usuarios creados:');
  console.log('   📧 admin@anm.gov.co (admin123)');
  console.log('   📧 supervisor@minera.com (supervisor123)');
  console.log('   📧 operador@minera.com (operador123)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# ==========================================
# ACTUALIZAR PACKAGE.JSON CON SCRIPT DE SEED
# ==========================================

echo "📝 Agregando script de seed al package.json..."
cat >> package.json << 'EOF'
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
EOF

# ==========================================
# COMANDOS DE VERIFICACIÓN
# ==========================================

echo "🔍 Verificando la migración..."
npx prisma migrate status

echo "📊 Verificando conexión a la base de datos..."
npx prisma db pull

echo "🎯 Generando cliente actualizado..."
npx prisma generate

echo "✅ Migración completada. Ahora puedes:"
echo "   1. Ejecutar 'npm run dev' para iniciar el servidor"
echo "   2. Probar los endpoints de verificación"
echo "   3. Usar los usuarios de prueba creados"

# ==========================================
# COMANDOS DE TROUBLESHOOTING
# ==========================================

echo ""
echo "🔧 TROUBLESHOOTING:"
echo ""
echo "Si tienes errores comunes:"
echo ""
echo "1. Error de conexión a PostgreSQL:"
echo "   - Verifica que PostgreSQL esté corriendo: sudo service postgresql start"
echo "   - Verifica las credenciales en .env"
echo "   - Prueba conexión: psql -h localhost -U tu_usuario -d tu_database"
echo ""
echo "2. Error 'relation does not exist':"
echo "   - Ejecuta: npx prisma migrate reset --force"
echo "   - Luego: npx prisma migrate dev"
echo ""
echo "3. Error de permisos:"
echo "   - sudo chown -R $USER:$USER ."
echo "   - chmod 755 prisma/"
echo ""
echo "4. Error 'prisma not found':"
echo "   - npm install @prisma/client prisma"
echo "   - npx prisma generate"
echo ""
echo "5. Verificar que todas las dependencias estén instaladas:"
echo "   - npm install bcryptjs jsonwebtoken geoip-lite"
echo ""
echo "📋 CHECKLIST DE VERIFICACIÓN:"
echo "□ PostgreSQL está corriendo"
echo "□ Variables de entorno configuradas (.env)"
echo "□ Dependencias instaladas (npm install)"
echo "□ Cliente de Prisma generado (npx prisma generate)"
echo "□ Migraciones aplicadas (npx prisma migrate dev)"
echo "□ Base de datos poblada (npx prisma db seed)"

# ==========================================
# SCRIPT PARA VERIFICAR INSTALACIÓN
# ==========================================

echo ""
echo "🔍 Creando script de verificación de instalación..."

cat > verify-installation.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyInstallation() {
  console.log('🔍 Verificando instalación del sistema de verificación...\n');
  
  try {
    // 1. Verificar conexión a base de datos
    console.log('1. Verificando conexión a base de datos...');
    await prisma.$connect();
    console.log('   ✅ Conexión exitosa a PostgreSQL');
    
    // 2. Verificar tablas principales
    console.log('\n2. Verificando estructura de tablas...');
    
    const usuarios = await prisma.usuario.count();
    console.log(`   ✅ Tabla usuarios: ${usuarios} registros`);
    
    const empresas = await prisma.empresa.count();
    console.log(`   ✅ Tabla empresas: ${empresas} registros`);
    
    const permisos = await prisma.permiso.count();
    console.log(`   ✅ Tabla permisos: ${permisos} registros`);
    
    // 3. Verificar nuevas tablas de verificación
    try {
      const verificaciones = await prisma.verificacionUsuario.count();
      console.log(`   ✅ Tabla verificaciones_usuario: ${verificaciones} registros`);
    } catch (error) {
      console.log('   ❌ Tabla verificaciones_usuario no existe - ejecutar migración');
    }
    
    try {
      const codigos = await prisma.codigoVerificacion.count();
      console.log(`   ✅ Tabla codigos_verificacion: ${codigos} registros`);
    } catch (error) {
      console.log('   ❌ Tabla codigos_verificacion no existe - ejecutar migración');
    }
    
    try {
      const actividades = await prisma.actividadUsuario.count();
      console.log(`   ✅ Tabla actividad_usuario: ${actividades} registros`);
    } catch (error) {
      console.log('   ❌ Tabla actividad_usuario no existe - ejecutar migración');
    }
    
    // 4. Verificar usuarios de prueba
    console.log('\n3. Verificando usuarios de prueba...');
    
    const adminUser = await prisma.usuario.findUnique({
      where: { email: 'admin@anm.gov.co' },
      include: { empresa: true }
    });
    
    if (adminUser) {
      console.log(`   ✅ Usuario admin: ${adminUser.nombre} (${adminUser.email})`);
      console.log(`      Empresa: ${adminUser.empresa?.nombre}`);
      console.log(`      Rol: ${adminUser.rol}`);
    } else {
      console.log('   ❌ Usuario admin no encontrado - ejecutar seed');
    }
    
    // 5. Verificar permisos
    console.log('\n4. Verificando sistema de permisos...');
    
    const usuarioConPermisos = await prisma.usuario.findFirst({
      include: {
        usuarioPermisos: {
          include: {
            permiso: true
          }
        }
      }
    });
    
    if (usuarioConPermisos && usuarioConPermisos.usuarioPermisos.length > 0) {
      console.log(`   ✅ Sistema de permisos funcionando`);
      console.log(`      Usuario ${usuarioConPermisos.email} tiene ${usuarioConPermisos.usuarioPermisos.length} permisos`);
    } else {
      console.log('   ❌ Sistema de permisos no configurado - ejecutar seed');
    }
    
    // 6. Verificar configuración de entorno
    console.log('\n5. Verificando variables de entorno...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NODE_ENV'
    ];
    
    let missingVars = [];
    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`   ✅ ${varName}: configurada`);
      } else {
        console.log(`   ❌ ${varName}: FALTANTE`);
        missingVars.push(varName);
      }
    });
    
    // 7. Resultado final
    console.log('\n📊 RESULTADO DE VERIFICACIÓN:');
    if (missingVars.length === 0 && usuarios > 0 && permisos > 0) {
      console.log('✅ Sistema configurado correctamente');
      console.log('\n🚀 PRÓXIMOS PASOS:');
      console.log('1. Ejecutar: npm run dev');
      console.log('2. Probar login con:');
      console.log('   - admin@anm.gov.co / admin123');
      console.log('   - supervisor@minera.com / supervisor123');
      console.log('   - operador@minera.com / operador123');
      console.log('3. Probar endpoints de verificación');
    } else {
      console.log('❌ Sistema requiere configuración adicional');
      console.log('\n🔧 ACCIONES REQUERIDAS:');
      if (missingVars.length > 0) {
        console.log(`- Configurar variables de entorno: ${missingVars.join(', ')}`);
      }
      if (usuarios === 0) {
        console.log('- Ejecutar: npx prisma db seed');
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error.message);
    console.log('\n🔧 SOLUCIONES POSIBLES:');
    console.log('1. Verificar que PostgreSQL esté corriendo');
    console.log('2. Verificar configuración en .env');
    console.log('3. Ejecutar: npx prisma migrate dev');
    console.log('4. Ejecutar: npx prisma generate');
  } finally {
    await prisma.$disconnect();
  }
}

verifyInstallation();
EOF

echo "✅ Script de verificación creado: verify-installation.js"
echo ""
echo "📋 COMANDOS FINALES PARA CONFIGURAR EL SISTEMA:"
echo ""
echo "# 1. Instalar dependencias"
echo "npm install @prisma/client prisma bcryptjs jsonwebtoken geoip-lite express-validator"
echo ""
echo "# 2. Configurar variables de entorno (.env)"
echo 'DATABASE_URL="postgresql://usuario:password@localhost:5432/anm_fri_db"'
echo 'JWT_SECRET="tu_clave_secreta_super_segura_aqui"'
echo 'NODE_ENV="development"'
echo ""
echo "# 3. Aplicar migraciones"
echo "npx prisma migrate dev --name add_user_verification_system"
echo ""
echo "# 4. Generar cliente de Prisma"
echo "npx prisma generate"
echo ""
echo "# 5. Poblar base de datos"
echo "npx prisma db seed"
echo ""
echo "# 6. Verificar instalación"
echo "node verify-installation.js"
echo ""
echo "# 7. Iniciar servidor"
echo "npm run dev"
echo ""
echo "🎯 ENDPOINTS DE VERIFICACIÓN DISPONIBLES:"
echo "POST /api/auth/login"
echo "POST /api/verification/verify-identity"
echo "POST /api/verification/generate-code"
echo "GET  /api/verification/history"
echo "POST /api/verification/admin/verify-user (Solo ADMIN)"