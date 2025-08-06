// ================================
// 📁 controllers/reportsController.js - VERSIÓN BÁSICA FUNCIONAL
// ================================
const ExcelReportService = require('../services/excelReportService');
const PDFReportService = require('../services/pdfReportService');

class ReportsController {
  constructor() {
    this.excelService = new ExcelReportService();
    this.pdfService = new PDFReportService();
  }

  // ============================================================================
  // 📊 HEALTH CHECK Y INFORMACIÓN
  // ============================================================================
  
  getReportsHealth = async (req, res) => {
    try {
      res.json({
        success: true,
        message: '❤️ Sistema de reportes funcionando (versión básica)',
        data: {
          excel: {
            service: 'ExcelReportService',
            status: 'OK',
            features: ['Producción', 'Consolidado']
          },
          pdf: {
            service: 'PDFReportService',
            status: 'OK',
            features: ['Ejecutivo']
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en sistema de reportes',
        error: error.message
      });
    }
  };

  getAvailableReports = async (req, res) => {
    try {
      const userRole = req.user?.rol || req.user?.role || 'OPERADOR';
      
      const reports = {
        excel: [
          {
            id: 'produccion',
            name: 'Reporte de Producción',
            description: 'Detalle de registros de producción FRI',
            frequency: 'Mensual'
          },
          {
            id: 'consolidado',
            name: 'Reporte Consolidado',
            description: 'Todos los formatos FRI',
            frequency: 'Mensual'
          }
        ],
        pdf: [
          {
            id: 'ejecutivo',
            name: 'Reporte Ejecutivo',
            description: 'Resumen ejecutivo con KPIs',
            frequency: 'Mensual'
          }
        ]
      };

      res.json({
        success: true,
        data: reports,
        userRole,
        message: 'Reportes disponibles obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo reportes disponibles',
        error: error.message
      });
    }
  };

  // ============================================================================
  // 🔍 PREVIEWS DE REPORTES
  // ============================================================================

  getReportPreview = async (req, res) => {
    try {
      const { type } = req.params;
      const filters = this.buildFilters(req);

      let previewData = {};

      switch (type) {
        case 'produccion':
          previewData = await this.getProduccionPreview(filters);
          break;
        case 'ejecutivo':
          previewData = await this.getExecutivePreview(filters);
          break;
        case 'inventarios':
          previewData = await this.getInventariosPreview(filters);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tipo de preview no disponible'
          });
      }

      res.json({
        success: true,
        data: previewData,
        message: `Preview del reporte ${type} generado exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generando preview del reporte',
        error: error.message
      });
    }
  };

  async getProduccionPreview(filters) {
    const data = await this.excelService.getProduccionData(filters);
    
    return {
      totalRegistros: data.length,
      sample: data.slice(0, 5),
      resumen: {
        produccionTotal: data.reduce((sum, item) => sum + (parseFloat(item.cantidadProduccion) || 0), 0),
        horasOperativas: data.reduce((sum, item) => sum + (parseFloat(item.horasOperativas) || 0), 0),
        mineralesDiferentes: [...new Set(data.map(item => item.mineral))].length
      }
    };
  }

  async getExecutivePreview(filters) {
    const data = await this.excelService.getProduccionData(filters);
    
    return {
      kpis: {
        totalRegistros: data.length,
        totalProduccion: data.reduce((sum, item) => sum + (parseFloat(item.cantidadProduccion) || 0), 0),
        mineralesUnicos: [...new Set(data.map(item => item.mineral))].length
      },
      summary: [`Se encontraron ${data.length} registros de producción`]
    };
  }

  async getInventariosPreview(filters) {
    const data = await this.excelService.getInventariosData(filters);
    
    return {
      totalRegistros: data.length,
      sample: data.slice(0, 5),
      resumen: {
        mineralesDiferentes: [...new Set(data.map(item => item.mineral))].length
      }
    };
  }

  // ============================================================================
  // 📊 GENERACIÓN DE REPORTES EXCEL
  // ============================================================================

  generateProduccionExcel = async (req, res) => {
    try {
      const filters = this.buildFilters(req);
      const workbook = await this.excelService.generateProduccionReport(filters);
      const buffer = await this.excelService.generateReportBuffer(workbook);
      
      const filename = this.excelService.getReportFilename('Produccion', 'xlsx');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generando reporte Excel',
        error: error.message
      });
    }
  };

  generateConsolidatedExcel = async (req, res) => {
    try {
      const filters = this.buildFilters(req);
      const workbook = await this.excelService.generateConsolidatedReport(filters);
      const buffer = await this.excelService.generateReportBuffer(workbook);
      
      const filename = this.excelService.getReportFilename('Consolidado', 'xlsx');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generando reporte Excel consolidado',
        error: error.message
      });
    }
  };

  // ============================================================================
  // 📄 GENERACIÓN DE REPORTES PDF
  // ============================================================================

  generateExecutivePDF = async (req, res) => {
    try {
      const filters = this.buildFilters(req);
      const pdfBuffer = await this.pdfService.generateExecutiveReport(filters);
      
      const filename = this.pdfService.getReportFilename('Ejecutivo', 'pdf');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generando reporte PDF ejecutivo',
        error: error.message
      });
    }
  };

  // ============================================================================
  // 🎯 ENDPOINT UNIFICADO
  // ============================================================================

  generateReport = async (req, res) => {
    try {
      const { type, format } = req.params;
      const validTypes = ['produccion', 'consolidado', 'ejecutivo'];
      const validFormats = ['excel', 'pdf'];

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de reporte inválido',
          validTypes
        });
      }

      if (!validFormats.includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de reporte inválido',
          validFormats
        });
      }

      // Enrutar según tipo y formato
      if (format === 'excel') {
        if (type === 'consolidado') {
          return this.generateConsolidatedExcel(req, res);
        } else {
          return this.generateProduccionExcel(req, res);
        }
      } else if (format === 'pdf') {
        return this.generateExecutivePDF(req, res);
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generando reporte',
        error: error.message
      });
    }
  };

  // ============================================================================
  // 📚 DOCUMENTACIÓN
  // ============================================================================

  getDocs = (req, res) => {
    const documentation = {
      title: 'Sistema de Reportes ANM FRI',
      version: '1.0.0',
      description: 'API para generación de reportes Excel y PDF',
      endpoints: {
        info: {
          'GET /api/reports/health': 'Estado del sistema de reportes',
          'GET /api/reports/available': 'Lista de reportes disponibles'
        },
        preview: {
          'GET /api/reports/preview/:type': 'Vista previa de datos'
        },
        excel: {
          'GET /api/reports/excel/produccion': 'Reporte Excel de producción',
          'GET /api/reports/excel/consolidado': 'Reporte Excel consolidado'
        },
        pdf: {
          'GET /api/reports/pdf/ejecutivo': 'Reporte PDF ejecutivo'
        },
        unified: {
          'GET /api/reports/:type/:format': 'Endpoint unificado'
        }
      },
      parameters: {
        type: ['produccion', 'ejecutivo', 'consolidado'],
        format: ['excel', 'pdf'],
        filters: ['startDate', 'endDate', 'mineral', 'tituloMinero']
      }
    };

    res.json({
      success: true,
      data: documentation,
      message: '📚 Documentación del sistema de reportes'
    });
  };

  // ============================================================================
  // 🔧 UTILIDADES
  // ============================================================================

  buildFilters(req) {
    const filters = {
      userId: req.user?.userId,
      userRole: req.user?.rol || req.user?.role
    };

    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;
    if (req.query.mineral) filters.mineral = req.query.mineral;
    if (req.query.tituloMinero) filters.tituloMinero = req.query.tituloMinero;

    return filters;
  }
}

// Exportar instancia única
module.exports = new ReportsController();