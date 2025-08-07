// 📁 tests/comprehensive.test.js - SUITE DE TESTING COMPLETA
const request = require('supertest');
const app = require('../server');

describe('🎯 SISTEMA ANM FRI - TESTING EXHAUSTIVO DÍA 6', () => {
  let adminToken, operatorToken, supervisorToken;
  let testFriId, testBackupId;

  // =============================================================================
  // 🔧 CONFIGURACIÓN INICIAL
  // =============================================================================
  
  beforeAll(async () => {
    console.log('🚀 Iniciando suite de testing exhaustiva...');
    
    // Obtener tokens para diferentes roles
    adminToken = await getAuthToken('admin@anm.gov.co', 'admin123');
    operatorToken = await getAuthToken('operador@anm.gov.co', 'operador123');
    supervisorToken = await getAuthToken('supervisor@anm.gov.co', 'supervisor123');
    
    expect(adminToken).toBeTruthy();
    console.log('✅ Tokens de autenticación obtenidos');
  });

  afterAll(async () => {
    console.log('🏁 Suite de testing completada');
  });

  // =============================================================================
  // 🔐 TESTING DE AUTENTICACIÓN Y SEGURIDAD
  // =============================================================================
  
  describe('🔐 AUTENTICACIÓN Y SEGURIDAD', () => {
    test('✅ Login exitoso con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@anm.gov.co',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeTruthy();
      expect(response.body.data.user.rol).toBe('ADMIN');
    });

    test('❌ Login fallido con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('🔒 Acceso denegado a rutas protegidas sin token', async () => {
      const response = await request(app)
        .get('/api/fri-complete/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('👤 Acceso exitoso con token válido', async () => {
      const response = await request(app)
        .get('/api/fri-complete/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('⚠️ Rate limiting funcional', async () => {
      const requests = [];
      // Intentar 20 requests rápidos para triggear rate limit
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: 'test' })
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  // =============================================================================
  // 🏥 HEALTH CHECKS Y SISTEMA
  // =============================================================================
  
  describe('🏥 HEALTH CHECKS Y SISTEMA', () => {
    test('💚 Health check general', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toContain('operativo');
      expect(response.body.base_datos.status).toContain('✅');
    });

    test('📊 Health check de reportes', async () => {
      const response = await request(app).get('/api/reports/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe('Sistema de Reportes ANM FRI');
      expect(response.body.controller_status).toBe('Cargado ✅');
    });

    test('📋 Información del sistema', async () => {
      const response = await request(app).get('/api/info');
      
      expect(response.status).toBe(200);
      expect(response.body.endpoints_implementados.total).toBeGreaterThanOrEqual(90);
      expect(response.body.cumplimiento_resolucion_371.formatos_implementados).toBe('9/9 (100%)');
    });

    test('📈 Estadísticas del sistema', async () => {
      const response = await request(app).get('/api/system/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.data.desarrollo.dia_actual).toBeGreaterThanOrEqual(4);
      expect(response.body.data.sistema.memoria_mb).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // 📋 TESTING CRUD DE FORMATOS FRI
  // =============================================================================
  
  describe('📋 CRUD DE FORMATOS FRI', () => {
    const testProduccionData = {
      fecha: '2024-07-27',
      tituloMinero: 'TM-TEST-001',
      municipio: 'Bogotá D.C.',
      departamento: 'Cundinamarca',
      mineral: 'Oro',
      cantidadProduccion: 125.5,
      unidadMedida: 'Toneladas',
      coordenadas: '4.6097°N, 74.0817°W',
      observaciones: 'Datos de prueba para testing automatizado'
    };

    test('✅ CREATE - Crear nuevo registro de producción', async () => {
      const response = await request(app)
        .post('/api/fri-complete/produccion')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(testProduccionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.mineral).toBe('Oro');
      
      testFriId = response.body.data.id;
    });

    test('❌ CREATE - Fallar con datos inválidos', async () => {
      const invalidData = { ...testProduccionData };
      delete invalidData.fecha; // Campo requerido
      invalidData.cantidadProduccion = 'invalid_number';

      const response = await request(app)
        .post('/api/fri-complete/produccion')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('📖 READ - Obtener lista de producción', async () => {
      const response = await request(app)
        .get('/api/fri-complete/produccion')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('🔍 READ - Filtros y paginación', async () => {
      const response = await request(app)
        .get('/api/fri-complete/produccion?mineral=Oro&limit=5&page=1')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(5);
    });

    test('✏️ UPDATE - Actualizar registro existente', async () => {
      if (!testFriId) {
        console.warn('⚠️ Skipping UPDATE test - no testFriId available');
        return;
      }

      const updateData = {
        cantidadProduccion: 150.0,
        observaciones: 'Actualizado en testing automatizado'
      };

      const response = await request(app)
        .put(`/api/fri-complete/produccion/${testFriId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('📖 READ - Obtener registro específico', async () => {
      if (!testFriId) {
        console.warn('⚠️ Skipping READ specific test - no testFriId available');
        return;
      }

      const response = await request(app)
        .get(`/api/fri-complete/produccion/${testFriId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testFriId);
    });
  });

  // =============================================================================
  // 📊 TESTING SISTEMA DE REPORTES
  // =============================================================================
  
  describe('📊 SISTEMA DE REPORTES', () => {
    test('📋 Obtener reportes disponibles', async () => {
      const response = await request(app)
        .get('/api/reports/available')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.excel).toBeDefined();
      expect(response.body.data.pdf).toBeDefined();
    });

    test('📊 Generar reporte Excel de producción', async () => {
      const response = await request(app)
        .get('/api/reports/excel/produccion')
        .set('Authorization', `Bearer ${adminToken}`)
        .responseType('buffer');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('spreadsheetml');
      expect(response.body.length).toBeGreaterThan(1000); // Excel file size
    });

    test('📄 Generar reporte PDF ejecutivo', async () => {
      const response = await request(app)
        .get('/api/reports/pdf/ejecutivo')
        .set('Authorization', `Bearer ${adminToken}`)
        .responseType('buffer');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('pdf');
      expect(response.body.length).toBeGreaterThan(1000); // PDF file size
    });

    test('🔍 Vista previa de datos', async () => {
      const response = await request(app)
        .get('/api/reports/preview/produccion')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRegistros).toBeDefined();
      expect(Array.isArray(response.body.data.sample)).toBe(true);
    });

    test('📈 Estadísticas de producción', async () => {
      const response = await request(app)
        .get('/api/reports/stats/production')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalProduccion).toBeDefined();
      expect(Array.isArray(response.body.data.produccionPorMineral)).toBe(true);
    });
  });

  // =============================================================================
  // 🏢 TESTING FUNCIONALIDADES EMPRESARIALES
  // =============================================================================
  
  describe('🏢 FUNCIONALIDADES EMPRESARIALES', () => {
    test('📦 Crear backup completo del sistema', async () => {
      const response = await request(app)
        .post('/api/backup/create/full')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ compression: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.backup_id).toBeTruthy();
      
      testBackupId = response.body.data.backup_id;
    });

    test('📋 Listar backups disponibles', async () => {
      const response = await request(app)
        .get('/api/backup/list')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('🔔 Obtener notificaciones', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('🚨 Verificar alertas del sistema', async () => {
      const response = await request(app)
        .get('/api/notifications/alerts/system')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('📊 Dashboard estadísticas avanzadas', async () => {
      const response = await request(app)
        .get('/api/fri-complete/stats/advanced')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totales).toBeDefined();
    });

    test('🔍 Búsqueda global', async () => {
      const response = await request(app)
        .get('/api/fri-complete/search/global?q=oro')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // =============================================================================
  // 🧪 TESTING DE CASOS EDGE Y ERRORES
  // =============================================================================
  
  describe('🧪 CASOS EDGE Y MANEJO DE ERRORES', () => {
    test('❌ 404 para endpoint inexistente', async () => {
      const response = await request(app).get('/api/endpoint/inexistente');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint no encontrado');
    });

    test('❌ 401 para token inválido', async () => {
      const response = await request(app)
        .get('/api/fri-complete/dashboard')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });

    test('❌ 403 para permisos insuficientes', async () => {
      const response = await request(app)
        .delete('/api/backup/delete/test_backup')
        .set('Authorization', `Bearer ${operatorToken}`); // OPERADOR no puede eliminar backups

      expect(response.status).toBe(403);
    });

    test('❌ 400 para datos inválidos en JSON', async () => {
      const response = await request(app)
        .post('/api/fri-complete/produccion')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });

  // =============================================================================
  // 🛠️ FUNCIONES AUXILIARES
  // =============================================================================
  
  async function getAuthToken(email, password) {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    
    return response.body?.data?.token || null;
  }
});

// =============================================================================
// 🎯 CONFIGURACIÓN DE JEST
// =============================================================================

module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/tests/**/*.test.js']
};