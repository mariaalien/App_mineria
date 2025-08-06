// ================================
// 📁 routes/reports.js - RUTAS DE REPORTES ANM FRI
// ================================
const express = require('express');
const { body, query, param } = require('express-validator');
const reportsController = require('../controllers/reportsController');
const advancedReportsController = require('../controllers/advancedReportsController');
const { authenticateToken, requirePermission } = require('../middleware/security');
const { handleValidationErrors } = require('../validators/friValidators');

const router = express.Router();

// ============================================================================
// 🔒 MIDDLEWARE DE AUTENTICACIÓN PARA TODAS LAS RUTAS
// ============================================================================
router.use(authenticateToken);

// ============================================================================
// 📋 RUTAS DE INFORMACIÓN GENERAL
// ============================================================================

// Obtener reportes disponibles
router.get('/available',
  requirePermission(['REPORTS_VIEW', 'FRI_READ']),
  reportsController.getAvailableReports
);

// Health check del sistema de reportes
router.get('/health',
  reportsController.getReportsHealth
);

// ============================================================================
// 🔍 RUTAS DE PREVIEW
// ============================================================================

// Preview de reportes (datos en JSON)
router.get('/preview/:type',
  [
    param('type')
      .isIn(['produccion', 'inventarios', 'regalias', 'ejecutivo', 'consolidado'])
      .withMessage('Tipo de reporte inválido'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe ser válida (ISO 8601)'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe ser válida (ISO 8601)'),
    query('mineral')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Mineral debe tener entre 2 y 100 caracteres'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_VIEW', 'FRI_READ']),
  reportsController.getReportPreview
);

// ============================================================================
// 🚀 REPORTES AVANZADOS Y ESPECIALIZADOS
// ============================================================================

// Reporte comparativo avanzado
router.post('/advanced/comparative',
  [
    body('type')
      .isIn(['produccion', 'inventarios', 'regalias'])
      .withMessage('Tipo de reporte inválido'),
    body('periods')
      .isArray({ min: 2 })
      .withMessage('Se requieren al menos 2 períodos'),
    body('periods.*.name')
      .notEmpty()
      .withMessage('Nombre del período es requerido'),
    body('periods.*.startDate')
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),
    body('periods.*.endDate')
      .isISO8601()
      .withMessage('Fecha de fin inválida'),
    body('compareBy')
      .optional()
      .isIn(['month', 'quarter', 'year'])
      .withMessage('Comparación por período inválida'),
    body('format')
      .optional()
      .isIn(['excel', 'pdf'])
      .withMessage('Formato debe ser excel o pdf'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_ADVANCED']),
  advancedReportsController.generateComparativeReport
);

// Reporte de predicciones y forecasting
router.get('/advanced/forecast',
  [
    query('forecastMonths')
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage('Meses de predicción debe estar entre 1 y 24'),
    query('method')
      .optional()
      .isIn(['linear', 'exponential', 'seasonal'])
      .withMessage('Método de predicción inválido'),
    query('includeSeasonality')
      .optional()
      .isBoolean()
      .withMessage('includeSeasonality debe ser booleano'),
    query('format')
      .optional()
      .isIn(['excel', 'pdf'])
      .withMessage('Formato debe ser excel o pdf'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_ADVANCED', 'REPORTS_EXPORT']),
  advancedReportsController.generateForecastReport
);

// Reporte de KPIs avanzados y benchmarking
router.get('/advanced/kpis',
  [
    query('period')
      .optional()
      .isIn(['week', 'month', 'quarter', 'year'])
      .withMessage('Período inválido'),
    query('benchmark')
      .optional()
      .isBoolean()
      .withMessage('benchmark debe ser booleano'),
    query('includeMetrics')
      .optional()
      .isIn(['basic', 'advanced', 'all'])
      .withMessage('includeMetrics inválido'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_ADVANCED']),
  advancedReportsController.generateKPIReport
);

// ============================================================================
// 📊 RUTAS DE GENERACIÓN DE REPORTES EXCEL
// ============================================================================

// Reporte específico de producción Excel
router.get('/excel/produccion',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe ser válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe ser válida'),
    query('mineral')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Mineral debe tener entre 2 y 100 caracteres'),
    query('tituloMinero')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Título minero debe tener entre 2 y 50 caracteres'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_VIEW', 'FRI_READ']),
  reportsController.generateProduccionExcel
);

// Reporte consolidado Excel
router.get('/excel/consolidado',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe ser válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe ser válida'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_VIEW', 'REPORTS_ADVANCED']),
  reportsController.generateConsolidatedExcel
);

// ============================================================================
// 📄 RUTAS DE GENERACIÓN DE REPORTES PDF
// ============================================================================

// Reporte ejecutivo PDF
router.get('/pdf/ejecutivo',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe ser válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe ser válida'),
    query('mineral')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Mineral debe tener entre 2 y 100 caracteres'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_VIEW', 'REPORTS_ADVANCED']),
  reportsController.generateExecutivePDF
);

// ============================================================================
// 🎯 ENDPOINT UNIFICADO DE REPORTES
// ============================================================================

// Endpoint genérico para cualquier tipo y formato de reporte
router.get('/:type/:format',
  [
    param('type')
      .isIn(['produccion', 'inventarios', 'regalias', 'ejecutivo', 'consolidado', 'paradas', 'ejecucion'])
      .withMessage('Tipo de reporte inválido'),
    param('format')
      .isIn(['excel', 'pdf'])
      .withMessage('Formato debe ser excel o pdf'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe ser válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe ser válida'),
    query('mineral')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Mineral debe tener entre 2 y 100 caracteres'),
    query('tituloMinero')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Título minero inválido'),
    query('municipio')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Municipio inválido'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_VIEW']),
  reportsController.generateReport
);

// ============================================================================
// 📈 RUTAS DE ESTADÍSTICAS Y ANALYTICS
// ============================================================================

// Estadísticas para gráficos y dashboards
router.get('/stats/production',
  [
    query('period')
      .optional()
      .isIn(['week', 'month', 'quarter', 'year'])
      .withMessage('Período debe ser week, month, quarter o year'),
    query('groupBy')
      .optional()
      .isIn(['mineral', 'titulo', 'municipio', 'fecha'])
      .withMessage('GroupBy inválido'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_VIEW']),
  async (req, res) => {
    try {
      const filters = reportsController.buildFilters(req);
      const stats = await reportsController.excelService.getDashboardStats(filters);

      res.json({
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }
);

// Análisis de tendencias
router.get('/analytics/trends',
  [
    query('metric')
      .optional()
      .isIn(['produccion', 'horas', 'regalias', 'eficiencia'])
      .withMessage('Métrica inválida'),
    query('timeframe')
      .optional()
      .isIn(['6m', '1y', '2y'])
      .withMessage('Timeframe debe ser 6m, 1y o 2y'),
    handleValidationErrors
  ],
  requirePermission(['REPORTS_ADVANCED']),
  async (req, res) => {
    try {
      const filters = reportsController.buildFilters(req);
      const { metric = 'produccion', timeframe = '6m' } = req.query;

      // Configurar filtros de tiempo basados en timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '6m':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case '2y':
          startDate.setFullYear(startDate.getFullYear() - 2);
          break;
      }

      filters.startDate = startDate.toISOString();
      filters.endDate = endDate.toISOString();

      const data = await reportsController.excelService.getProduccionData(filters);
      
      // Procesar tendencias por mes
      const monthlyTrends = {};
      data.forEach(item => {
        const date = new Date(item.fechaCorteInformacion);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyTrends[monthKey]) {
          monthlyTrends[monthKey] = {
            month: monthKey,
            produccion: 0,
            horas: 0,
            registros: 0
          };
        }
        
        monthlyTrends[monthKey].produccion += parseFloat(item.cantidadProduccion) || 0;
        monthlyTrends[monthKey].horas += parseFloat(item.horasOperativas) || 0;
        monthlyTrends[monthKey].registros += 1;
      });

      const trends = Object.values(monthlyTrends)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(trend => ({
          ...trend,
          eficiencia: trend.horas > 0 ? trend.produccion / trend.horas : 0
        }));

      res.json({
        success: true,
        data: {
          metric,
          timeframe,
          trends,
          summary: {
            totalPeriods: trends.length,
            avgProduction: trends.reduce((sum, t) => sum + t.produccion, 0) / trends.length,
            avgEfficiency: trends.reduce((sum, t) => sum + t.eficiencia, 0) / trends.length
          }
        },
        message: 'Análisis de tendencias generado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error generando análisis de tendencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando análisis de tendencias',
        error: error.message
      });
    }
  }
);

// ============================================================================
// 🧪 RUTAS DE TESTING Y DESARROLLO
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  // Test de generación rápida
  router.get('/test/quick',
    async (req, res) => {
      try {
        const testData = {
          excel: {
            available: true,
            service: 'ExcelReportService',
            methods: ['generateProduccionReport', 'generateConsolidatedReport']
          },
          pdf: {
            available: true,
            service: 'PDFReportService', 
            methods: ['generateExecutiveReport']
          },
          endpoints: {
            preview: '/api/reports/preview/:type',
            excel: '/api/reports/:type/excel',
            pdf: '/api/reports/:type/pdf',
            unified: '/api/reports/:type/:format'
          }
        };

        res.json({
          success: true,
          data: testData,
          message: '🧪 Sistema de reportes listo para pruebas'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error en test de reportes',
          error: error.message
        });
      }
    }
  );
}

// ============================================================================
// 📋 DOCUMENTACIÓN DE ENDPOINTS
// ============================================================================
router.get('/docs',
  (req, res) => {
    const documentation = {
      title: 'Sistema de Reportes ANM FRI',
      version: '1.0.0',
      description: 'API para generación de reportes Excel y PDF del sistema ANM FRI',
      endpoints: {
        info: {
          'GET /api/reports/available': 'Lista de reportes disponibles para el usuario',
          'GET /api/reports/health': 'Estado del sistema de reportes'
        },
        preview: {
          'GET /api/reports/preview/:type': 'Vista previa de datos del reporte (JSON)'
        },
        excel: {
          'GET /api/reports/excel/produccion': 'Reporte Excel de producción',
          'GET /api/reports/excel/consolidado': 'Reporte Excel consolidado'
        },
        pdf: {
          'GET /api/reports/pdf/ejecutivo': 'Reporte PDF ejecutivo'
        },
        unified: {
          'GET /api/reports/:type/:format': 'Endpoint unificado para cualquier reporte'
        },
        analytics: {
          'GET /api/reports/stats/production': 'Estadísticas de producción',
          'GET /api/reports/analytics/trends': 'Análisis de tendencias'
        }
      },
      parameters: {
        type: ['produccion', 'inventarios', 'regalias', 'ejecutivo', 'consolidado'],
        format: ['excel', 'pdf'],
        filters: ['startDate', 'endDate', 'mineral', 'tituloMinero', 'municipio']
      },
      permissions: {
        'REPORTS_VIEW': 'Acceso básico a reportes',
        'REPORTS_ADVANCED': 'Acceso a reportes avanzados y analytics',
        'REPORTS_EXPORT': 'Capacidad de exportar reportes',
        'FRI_READ': 'Lectura de datos FRI'
      }
    };

    res.json({
      success: true,
      data: documentation,
      message: '📚 Documentación del sistema de reportes'
    });
  }
);

module.exports = router;