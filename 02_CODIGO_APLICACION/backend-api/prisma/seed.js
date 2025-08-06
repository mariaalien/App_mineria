// prisma/seed.js - Datos iniciales para probar el sistema
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando datos semilla...');

  // Usuario administrador de prueba
  const adminUser = await prisma.usuario.create({
    data: {
      nombre: 'Administrador Demo ANM',
      email: 'admin@anm.gov.co',
      passwordHash: await bcrypt.hash('admin123', 12),
      rol: 'ADMINISTRADOR',
      tituloMinero: '816-17',
      municipio: 'VITERBO'
    }
  });

  console.log('✅ Usuario administrador creado:', adminUser.email);

  // Usuario operador de prueba
  const operadorUser = await prisma.usuario.create({
    data: {
      nombre: 'Operador Demo',
      email: 'operador@empresa.com',
      passwordHash: await bcrypt.hash('operador123', 12),
      rol: 'OPERADOR',
      tituloMinero: '816-17',
      municipio: 'VITERBO'
    }
  });

  console.log('✅ Usuario operador creado:', operadorUser.email);

  // Título minero de ejemplo
  const titulo = await prisma.tituloMinero.create({
    data: {
      numeroTitulo: '816-17',
      mineral: 'ARENAS (DE RIO)',
      municipio: 'VITERBO',
      clasificacion: 'PEQUEÑA'
    }
  });

  console.log('✅ Título minero creado:', titulo.numeroTitulo);
}

main()
  .catch((e) => {
    console.error('❌ Error creando datos semilla:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });