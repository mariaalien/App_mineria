// ================================
// 📁 services/excelReportService.js - VERSIÓN BÁSICA FUNCIONAL
// ================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ExcelReportService {
  constructor() {
    console.log('📊 ExcelReportService inicializado (versión básica)');
  }

  // Método básico para obtener datos de producción
  async getProduccionData(filters = {}) {
    try {
      const where = this.buildWhereClause(filters);
      
      return await prisma.fRIProduccion.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        },
        orderBy: { fechaCorteInformacion: 'desc' },
        take: 100 // Limitar para pruebas
      });
    } catch (error) {
      console.error('Error obteniendo datos de producción:', error);
      return [];
    }
  }

  // Método básico para obtener datos de inventarios
  async getInventariosData(filters = {}) {
    try {
      const where = this.buildWhereClause(filters);
      
      return await prisma.fRIInventarios.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        },
        orderBy: { fechaCorteInformacion: 'desc' },
        take: 100
      });
    } catch (error) {
      console.error('Error obteniendo datos de inventarios:', error);
      return [];
    }
  }

  // Método básico para estadísticas de dashboard
  async getDashboardStats(filters = {}) {
    try {
      const produccionData = await this.getProduccionData(filters);
      
      return {
        resumen: {
          total: produccionData.length,
          por_tipo: {
            produccion: produccionData.length,
            inventarios: 0,
            paradas: 0,
            ejecucion: 0,
            maquinaria_transporte: 0,
            regalias: 0,
            inventario_maquinaria: 0,
            capacidad_tecnologica: 0,
            proyecciones: 0
          }
        },
        tendencia_mensual: [],
        usuario: {
          nombre: 'Usuario Demo',
          rol: 'OPERADOR',
          empresa: 'Empresa Demo'
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        resumen: { total: 0, por_tipo: {} },
        tendencia_mensual: [],
        usuario: { nombre: 'Usuario Demo', rol: 'OPERADOR' }
      };
    }
  }

  // Método para generar buffer de reporte (placeholder)
  async generateReportBuffer(workbook) {
    // Por ahora retornar buffer básico
    return Buffer.from('Excel report placeholder');
  }

  // Método para generar nombre de archivo
  getReportFilename(reportType, extension = 'xlsx') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `ANM_FRI_${reportType}_${timestamp}.${extension}`;
  }

  // Construir filtros WHERE para Prisma
  buildWhereClause(filters) {
    const where = {};

    if (filters.userId && filters.userRole !== 'ADMIN') {
      where.usuarioId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.fechaCorteInformacion = {};
      if (filters.startDate) where.fechaCorteInformacion.gte = new Date(filters.startDate);
      if (filters.endDate) where.fechaCorteInformacion.lte = new Date(filters.endDate);
    }

    if (filters.mineral) {
      where.mineral = { contains: filters.mineral, mode: 'insensitive' };
    }

    if (filters.tituloMinero) {
      where.tituloMinero = { contains: filters.tituloMinero, mode: 'insensitive' };
    }

    return where;
  }

  // Método placeholder para generar reporte de producción
  async generateProduccionReport(filters = {}) {
    console.log('📊 Generando reporte de producción (versión básica)');
    
    // Por ahora retornar estructura básica
    return {
      write: () => Promise.resolve(),
      addWorksheet: () => ({
        addRow: () => {},
        getCell: () => ({ value: '', font: {}, fill: {} }),
        mergeCells: () => {}
      })
    };
  }

  // Método placeholder para reporte consolidado
  async generateConsolidatedReport(filters = {}) {
    console.log('📊 Generando reporte consolidado (versión básica)');
    return this.generateProduccionReport(filters);
  }
}

module.exports = ExcelReportService;