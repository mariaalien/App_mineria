// 📁 controllers/reportsController.js - VERSIÓN CORREGIDA
const ExcelReportService = require('../services/excelReportService');
const PDFReportService = require('../services/pdfReportService');

class ReportsController {
  constructor() {
    // Crear instancias de los servicios
    this.excelService = new ExcelReportService();
    this.pdfService = new PDFReportService();
    console.log('✅ ReportsController inicializado con servicios');
  }

  // ============================================================================
  // 🏥 HEALTH CHECK Y DOCUMENTACIÓN
  // ============================================================================

  healthCheck = async (req, res) => {
    try {
      console.log('🏥 Health check del sistema de reportes');
      res.json({
        success: true,
        service: 'Sistema de Reportes ANM FRI',
        status: 'operational',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        features: {
          excel_reports: 'Disponible ✅',
          pdf_reports: 'Disponible ✅',
          advanced_analytics: 'Disponible ✅',
          custom_filters: 'Disponible ✅',
          preview_mode: 'Disponible ✅'
        },
        endpoints: {
          health: 'GET /api/reports/health',
          available: 'GET /api/reports/available',
          excel_produccion: 'GET /api/reports/excel/produccion',
          excel_consolidado: 'GET /api/reports/excel/consolidado',
          pdf_ejecutivo: 'GET /api/reports/pdf/ejecutivo',
          preview: 'GET /api/reports/preview/:type'
        }
      });
    } catch (error) {
      console.error('❌ Error en health check:', error);
      res.status(500).json({
        success: false,
        message: 'Error en health check del sistema de reportes',
        error: error.message
      });
    }
  };

  getAvailableReports = async (req, res) => {
    try {
      console.log('📋 Obteniendo reportes disponibles');
      const reports = {
        excel: {
          produccion: {
            endpoint: 'GET /api/reports/excel/produccion',
            description: 'Reporte detallado de producción minera con totales',
            filters: ['startDate', 'endDate', 'mineral', 'tituloMinero', 'municipio'],
            example: '/api/reports/excel/produccion?mineral=Oro&startDate=2024-07-01'
          },
          consolidado: {
            endpoint: 'GET /api/reports/excel/consolidado',
            description: 'Reporte consolidado multi-hoja (Resumen, Producción, Inventarios, Regalías)',
            filters: ['startDate', 'endDate'],
            example: '/api/reports/excel/consolidado?startDate=2024-07-01&endDate=2024-07-31'
          }
        },
        pdf: {
          ejecutivo: {
            endpoint: 'GET /api/reports/pdf/ejecutivo',
            description: 'Reporte ejecutivo con gráficos, estadísticas y análisis visual',
            filters: ['startDate', 'endDate', 'mineral'],
            example: '/api/reports/pdf/ejecutivo?startDate=2024-07-01&endDate=2024-07-31'
          }
        },
        preview: {
          produccion: {
            endpoint: 'GET /api/reports/preview/produccion',
            description: 'Vista previa de datos del reporte de producción (JSON)',
            example: '/api/reports/preview/produccion?mineral=Oro'
          }
        }
      };

      res.json({
        success: true,
        data: reports,
        message: 'Reportes disponibles en el sistema',
        filters_disponibles: {
          startDate: 'Fecha inicio (YYYY-MM-DD)',
          endDate: 'Fecha fin (YYYY-MM-DD)',
          mineral: 'Tipo de mineral (Oro, Plata, Carbón, etc.)',
          tituloMinero: 'Código del título minero',
          municipio: 'Nombre del municipio'
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo reportes disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo reportes disponibles',
        error: error.message
      });
    }
  };

  // ============================================================================
  // 🔍 PREVIEW DE DATOS
  // ============================================================================

  getReportPreview = async (req, res) => {
    try {
      const { type } = req.params;
      const filters = this.buildFilters(req);

      console.log(`🔍 Generando preview para reporte: ${type}`);
      console.log('📊 Filtros aplicados:', filters);

      let preview;
      switch (type.toLowerCase()) {
        case 'produccion':
          preview = await this.getProduccionPreview(filters);
          break;
        case 'inventarios':
          preview = await this.getInventariosPreview(filters);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: `Tipo de reporte '${type}' no soportado para preview`,
            supported_types: ['produccion', 'inventarios']
          });
      }

      res.json({
        success: true,
        data: preview,
        message: `Vista previa del reporte ${type} generada correctamente`,
        filters: filters,
        note: 'Esta es una vista previa con datos limitados. El reporte completo incluye todos los registros.'
      });
    } catch (error) {
      console.error('❌ Error en preview:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando vista previa',
        error: error.message,
        type: req.params.type
      });
    }
  };

  // ============================================================================
  // 📊 GENERADORES DE REPORTES EXCEL
  // ============================================================================

  generateProduccionExcel = async (req, res) => {
    try {
      console.log('📊 Iniciando generación de reporte Excel - Producción');
      const filters = this.buildFilters(req);
      console.log('📊 Filtros aplicados:', filters);
      
      const workbook = await this.excelService.generateProduccionReport(filters);
      const buffer = await this.excelService.generateReportBuffer(workbook);
      
      const filename = this.excelService.getReportFilename('Produccion', 'xlsx');

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-cache');

      console.log(`✅ Reporte Excel de producción generado: ${filename} (${buffer.length} bytes)`);
      res.send(buffer);
    } catch (error) {
      console.error('❌ Error generando Excel de producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte Excel de producción',
        error: error.message,
        suggestion: 'Verifica que los servicios estén correctamente configurados'
      });
    }
  };

  generateConsolidatedExcel = async (req, res) => {
    try {
      console.log('📊 Iniciando generación de reporte Excel - Consolidado');
      const filters = this.buildFilters(req);
      console.log('📊 Filtros aplicados:', filters);
      
      const workbook = await this.excelService.generateConsolidatedReport(filters);
      const buffer = await this.excelService.generateReportBuffer(workbook);
      
      const filename = this.excelService.getReportFilename('Consolidado', 'xlsx');

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-cache');

      console.log(`✅ Reporte Excel consolidado generado: ${filename} (${buffer.length} bytes)`);
      res.send(buffer);
    } catch (error) {
      console.error('❌ Error generando Excel consolidado:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte Excel consolidado',
        error: error.message,
        suggestion: 'Verifica que los servicios estén correctamente configurados'
      });
    }
  };

  // ============================================================================
  // 📄 GENERADORES DE REPORTES PDF
  // ============================================================================

  generateExecutivePDF = async (req, res) => {
    try {
      console.log('📄 Iniciando generación de reporte PDF - Ejecutivo');
      const filters = this.buildFilters(req);
      console.log('📊 Filtros aplicados:', filters);
      
      const pdfBuffer = await this.pdfService.generateExecutiveReport(filters);
      const filename = this.pdfService.getReportFilename('Ejecutivo', 'pdf');

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');

      console.log(`✅ Reporte PDF ejecutivo generado: ${filename} (${pdfBuffer.length} bytes)`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('❌ Error generando PDF ejecutivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte PDF ejecutivo',
        error: error.message,
        suggestion: 'Verifica que Puppeteer esté correctamente instalado'
      });
    }
  };

  // ============================================================================
  // 🎯 ENDPOINT UNIFICADO DE REPORTES
  // ============================================================================

  generateReport = async (req, res) => {
    try {
      const { type, format } = req.params;
      const filters = this.buildFilters(req);

      console.log(`🎯 Generando reporte unificado: ${type}.${format}`);
      console.log('📊 Filtros aplicados:', filters);

      let result;
      let contentType;
      
      if (format === 'excel') {
        result = await this.generateExcelReport(type, filters);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (format === 'pdf') {
        result = await this.generatePDFReport(type, filters);
        contentType = 'application/pdf';
      } else {
        return res.status(400).json({
          success: false,
          message: `Formato '${format}' no soportado`,
          supported_formats: ['excel', 'pdf']
        });
      }

      const filename = format === 'excel' 
        ? this.excelService.getReportFilename(type, 'xlsx')
        : this.pdfService.getReportFilename(type, 'pdf');

      // Configurar headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', result.length);
      res.setHeader('Cache-Control', 'no-cache');

      console.log(`✅ Reporte ${type}.${format} generado exitosamente: ${filename}`);
      res.send(result);
    } catch (error) {
      console.error('❌ Error en endpoint unificado:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte',
        error: error.message,
        type: req.params.type,
        format: req.params.format
      });
    }
  };

  // ============================================================================
  // 🛠️ MÉTODOS AUXILIARES
  // ============================================================================

  buildFilters(req) {
    const filters = {};
    
    try {
      // Filtros de fecha
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate);
        if (isNaN(filters.startDate)) {
          delete filters.startDate;
          console.warn('⚠️ startDate inválida:', req.query.startDate);
        }
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate);
        if (isNaN(filters.endDate)) {
          delete filters.endDate;
          console.warn('⚠️ endDate inválida:', req.query.endDate);
        }
      }
      
      // Filtros de contenido
      if (req.query.mineral) filters.mineral = req.query.mineral.trim();
      if (req.query.tituloMinero) filters.tituloMinero = req.query.tituloMinero.trim();
      if (req.query.municipio) filters.municipio = req.query.municipio.trim();
      
      console.log('🔍 Filtros construidos:', filters);
      return filters;
    } catch (error) {
      console.error('❌ Error construyendo filtros:', error);
      return {};
    }
  }

  async generateExcelReport(type, filters) {
    switch (type.toLowerCase()) {
      case 'produccion':
        const workbook1 = await this.excelService.generateProduccionReport(filters);
        return await this.excelService.generateReportBuffer(workbook1);
      case 'consolidado':
        const workbook2 = await this.excelService.generateConsolidatedReport(filters);
        return await this.excelService.generateReportBuffer(workbook2);
      default:
        throw new Error(`Tipo de reporte Excel '${type}' no soportado. Tipos disponibles: produccion, consolidado`);
    }
  }

  async generatePDFReport(type, filters) {
    switch (type.toLowerCase()) {
      case 'ejecutivo':
        return await this.pdfService.generateExecutiveReport(filters);
      default:
        throw new Error(`Tipo de reporte PDF '${type}' no soportado. Tipos disponibles: ejecutivo`);
    }
  }

  async getProduccionPreview(filters) {
    try {
      const data = await this.excelService.getProduccionData(filters);
      
      return {
        totalRegistros: data.length,
        sample: data.slice(0, 5), // Mostrar solo 5 registros como ejemplo
        resumen: {
          totalProduccion: data.reduce((sum, item) => sum + (parseFloat(item.cantidadProduccion) || 0), 0),
          mineralesUnicos: [...new Set(data.map(item => item.mineral))].length,
          titulosUnicos: [...new Set(data.map(item => item.tituloMinero))].length,
          municipiosUnicos: [...new Set(data.map(item => item.municipio))].length
        },
        filtros_aplicados: filters,
        summary: [`Se encontraron ${data.length} registros de producción con los filtros aplicados`]
      };
    } catch (error) {
      console.error('❌ Error en preview de producción:', error);
      return {
        totalRegistros: 0,
        sample: [],
        resumen: {},
        error: error.message
      };
    }
  }

  async getInventariosPreview(filters) {
    try {
      const data = await this.excelService.getInventariosData(filters);
      
      return {
        totalRegistros: data.length,
        sample: data.slice(0, 5),
        resumen: {
          mineralesDiferentes: [...new Set(data.map(item => item.mineral))].length,
          stockTotalInicial: data.reduce((sum, item) => sum + (parseFloat(item.stockInicial) || 0), 0),
          stockTotalFinal: data.reduce((sum, item) => sum + (parseFloat(item.stockFinal) || 0), 0)
        },
        filtros_aplicados: filters,
        summary: [`Se encontraron ${data.length} registros de inventarios`]
      };
    } catch (error) {
      console.error('❌ Error en preview de inventarios:', error);
      return {
        totalRegistros: 0,
        sample: [],
        resumen: {},
        error: error.message
      };
    }
  }

  // Método para cleanup al cerrar la aplicación
  async cleanup() {
    try {
      if (this.pdfService) {
        await this.pdfService.closeBrowser();
      }
      console.log('✅ ReportsController cleanup completado');
    } catch (error) {
      console.error('❌ Error en cleanup:', error);
    }
  }
}

// ⚠️ IMPORTANTE: Exportar instancia única (singleton)
module.exports = new ReportsController();