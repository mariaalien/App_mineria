// 📁 services/excelReportService.js - VERSIÓN CORREGIDA
const ExcelJS = require('exceljs');
const moment = require('moment');

class ExcelReportService {
  constructor() {
    this.workbook = null;
    console.log('✅ ExcelReportService inicializado correctamente');
  }

  // ============================================================================
  // 📊 GENERACIÓN DE REPORTES EXCEL
  // ============================================================================

  async generateProduccionReport(filters = {}) {
    try {
      console.log('📊 Iniciando generación de reporte de producción...');
      this.workbook = new ExcelJS.Workbook();
      this.workbook.creator = 'Sistema ANM FRI';
      this.workbook.created = new Date();

      const worksheet = this.workbook.addWorksheet('Producción', {
        properties: { tabColor: { argb: 'FF0066CC' } }
      });

      // Configurar columnas
      worksheet.columns = [
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Título Minero', key: 'tituloMinero', width: 20 },
        { header: 'Mineral', key: 'mineral', width: 15 },
        { header: 'Cantidad (Ton)', key: 'cantidadProduccion', width: 15 },
        { header: 'Municipio', key: 'municipio', width: 20 },
        { header: 'Coordenadas', key: 'coordenadas', width: 25 }
      ];

      // Estilo del header
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0066CC' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Obtener datos
      const data = await this.getProduccionData(filters);
      console.log(`📊 Procesando ${data.length} registros de producción`);
      
      // Agregar datos
      data.forEach(item => {
        worksheet.addRow(item);
      });

      // Agregar totales
      if (data.length > 0) {
        const totalRow = worksheet.addRow([
          'TOTAL',
          '',
          '',
          { formula: `SUM(D2:D${data.length + 1})` },
          '',
          ''
        ]);

        totalRow.eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' }
          };
        });
      }

      console.log('✅ Reporte de producción generado exitosamente');
      return this.workbook;
    } catch (error) {
      console.error('❌ Error generando reporte Excel de producción:', error);
      throw new Error(`Error en reporte de producción: ${error.message}`);
    }
  }

  async generateConsolidatedReport(filters = {}) {
    try {
      console.log('📊 Iniciando generación de reporte consolidado...');
      this.workbook = new ExcelJS.Workbook();
      this.workbook.creator = 'Sistema ANM FRI';
      this.workbook.created = new Date();
      
      // Crear múltiples hojas
      const sheets = [
        { name: 'Resumen Ejecutivo', data: await this.getResumenData(filters) },
        { name: 'Producción', data: await this.getProduccionData(filters) },
        { name: 'Inventarios', data: await this.getInventariosData(filters) },
        { name: 'Regalías', data: await this.getRegaliasData(filters) }
      ];

      console.log(`📊 Creando ${sheets.length} hojas de reporte`);

      sheets.forEach(({ name, data }, index) => {
        const worksheet = this.workbook.addWorksheet(name, {
          properties: { tabColor: { argb: 'FF0066CC' } }
        });
        
        if (data && data.length > 0) {
          // Auto-configurar columnas basado en los datos
          const keys = Object.keys(data[0]);
          worksheet.columns = keys.map(key => ({
            header: this.formatHeader(key),
            key: key,
            width: this.getColumnWidth(key)
          }));

          // Agregar datos
          data.forEach(item => worksheet.addRow(item));
          
          // Aplicar formato al header
          worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF0066CC' }
            };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });

          console.log(`✅ Hoja '${name}' creada con ${data.length} registros`);
        } else {
          // Hoja vacía con mensaje
          worksheet.addRow(['No hay datos disponibles para este período']);
          console.log(`⚠️ Hoja '${name}' sin datos`);
        }
      });

      console.log('✅ Reporte consolidado generado exitosamente');
      return this.workbook;
    } catch (error) {
      console.error('❌ Error generando reporte consolidado:', error);
      throw new Error(`Error en reporte consolidado: ${error.message}`);
    }
  }

  async generateReportBuffer(workbook) {
    try {
      console.log('📦 Convirtiendo workbook a buffer...');
      const buffer = await workbook.xlsx.writeBuffer();
      console.log(`✅ Buffer generado: ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      console.error('❌ Error generando buffer:', error);
      throw error;
    }
  }

  getReportFilename(type, extension) {
    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const filename = `Reporte_${type}_${timestamp}.${extension}`;
    console.log(`📄 Nombre de archivo generado: ${filename}`);
    return filename;
  }

  // ============================================================================
  // 🛠️ MÉTODOS AUXILIARES
  // ============================================================================

  formatHeader(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Id/g, 'ID');
  }

  getColumnWidth(key) {
    const widths = {
      fecha: 15,
      tituloMinero: 20,
      mineral: 15,
      cantidadProduccion: 18,
      municipio: 20,
      coordenadas: 25,
      stockInicial: 15,
      stockFinal: 15,
      baseGravable: 20,
      valorRegalia: 20
    };
    return widths[key] || 15;
  }

  // ============================================================================
  // 📊 MÉTODOS DE DATOS (Con datos de ejemplo)
  // ============================================================================

  async getProduccionData(filters = {}) {
    try {
      console.log('📊 Obteniendo datos de producción...');
      // Simulación de datos - reemplazar con query real a la BD
      const baseData = [
        {
          fecha: '2024-07-01',
          tituloMinero: 'TM001',
          mineral: 'Oro',
          cantidadProduccion: 150.5,
          municipio: 'Bogotá',
          coordenadas: '4.6097°N, 74.0817°W'
        },
        {
          fecha: '2024-07-02',
          tituloMinero: 'TM002',
          mineral: 'Plata',
          cantidadProduccion: 200.0,
          municipio: 'Medellín',
          coordenadas: '6.2442°N, 75.5812°W'
        },
        {
          fecha: '2024-07-03',
          tituloMinero: 'TM003',
          mineral: 'Carbón',
          cantidadProduccion: 500.0,
          municipio: 'Cali',
          coordenadas: '3.4516°N, 76.5320°W'
        },
        {
          fecha: '2024-07-04',
          tituloMinero: 'TM001',
          mineral: 'Oro',
          cantidadProduccion: 175.25,
          municipio: 'Bogotá',
          coordenadas: '4.6097°N, 74.0817°W'
        }
      ];

      // Aplicar filtros si existen
      let filteredData = baseData;
      
      if (filters.mineral) {
        filteredData = filteredData.filter(item => 
          item.mineral.toLowerCase().includes(filters.mineral.toLowerCase())
        );
      }
      
      if (filters.municipio) {
        filteredData = filteredData.filter(item => 
          item.municipio.toLowerCase().includes(filters.municipio.toLowerCase())
        );
      }

      console.log(`✅ ${filteredData.length} registros de producción obtenidos`);
      return filteredData;
    } catch (error) {
      console.error('❌ Error obteniendo datos de producción:', error);
      return [];
    }
  }

  async getInventariosData(filters = {}) {
    try {
      console.log('📦 Obteniendo datos de inventarios...');
      const data = [
        {
          fecha: '2024-07-01',
          mineral: 'Oro',
          stockInicial: 500.0,
          entradas: 150.5,
          salidas: 100.0,
          stockFinal: 550.5
        },
        {
          fecha: '2024-07-01',
          mineral: 'Plata',
          stockInicial: 800.0,
          entradas: 200.0,
          salidas: 150.0,
          stockFinal: 850.0
        },
        {
          fecha: '2024-07-01',
          mineral: 'Carbón',
          stockInicial: 2000.0,
          entradas: 500.0,
          salidas: 400.0,
          stockFinal: 2100.0
        }
      ];

      console.log(`✅ ${data.length} registros de inventarios obtenidos`);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo datos de inventarios:', error);
      return [];
    }
  }

  async getRegaliasData(filters = {}) {
    try {
      console.log('💰 Obteniendo datos de regalías...');
      const data = [
        {
          periodo: '2024-07',
          mineral: 'Oro',
          baseGravable: 1500000,
          tarifaRegalia: 4.0,
          valorRegalia: 60000
        },
        {
          periodo: '2024-07',
          mineral: 'Plata',
          baseGravable: 1000000,
          tarifaRegalia: 4.0,
          valorRegalia: 40000
        },
        {
          periodo: '2024-07',
          mineral: 'Carbón',
          baseGravable: 2500000,
          tarifaRegalia: 10.0,
          valorRegalia: 250000
        }
      ];

      console.log(`✅ ${data.length} registros de regalías obtenidos`);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo datos de regalías:', error);
      return [];
    }
  }

  async getResumenData(filters = {}) {
    try {
      console.log('📈 Generando resumen ejecutivo...');
      const produccionData = await this.getProduccionData(filters);
      const regaliasData = await this.getRegaliasData(filters);
      
      const totalProduccion = produccionData.reduce((sum, item) => 
        sum + (parseFloat(item.cantidadProduccion) || 0), 0
      );
      
      const totalRegalias = regaliasData.reduce((sum, item) => 
        sum + (parseFloat(item.valorRegalia) || 0), 0
      );

      const data = [
        {
          concepto: 'Total Producción (Ton)',
          valor: totalProduccion.toFixed(2),
          periodo: 'Julio 2024'
        },
        {
          concepto: 'Total Regalías (COP)',
          valor: totalRegalias.toLocaleString('es-CO'),
          periodo: 'Julio 2024'
        },
        {
          concepto: 'Minerales Activos',
          valor: [...new Set(produccionData.map(item => item.mineral))].length,
          periodo: 'Julio 2024'
        },
        {
          concepto: 'Títulos Activos',
          valor: [...new Set(produccionData.map(item => item.tituloMinero))].length,
          periodo: 'Julio 2024'
        }
      ];

      console.log(`✅ Resumen ejecutivo generado con ${data.length} métricas`);
      return data;
    } catch (error) {
      console.error('❌ Error generando resumen:', error);
      return [];
    }
  }

  async getDashboardStats(filters = {}) {
    try {
      console.log('📊 Calculando estadísticas del dashboard...');
      const produccionData = await this.getProduccionData(filters);
      const regaliasData = await this.getRegaliasData(filters);

      const stats = {
        totalProduccion: produccionData.reduce((sum, item) => 
          sum + (parseFloat(item.cantidadProduccion) || 0), 0
        ),
        totalRegalias: regaliasData.reduce((sum, item) => 
          sum + (parseFloat(item.valorRegalia) || 0), 0
        ),
        mineralesActivos: [...new Set(produccionData.map(item => item.mineral))].length,
        titulosActivos: [...new Set(produccionData.map(item => item.tituloMinero))].length,
        municipiosActivos: [...new Set(produccionData.map(item => item.municipio))].length
      };

      console.log('✅ Estadísticas del dashboard calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
      return {
        totalProduccion: 0,
        totalRegalias: 0,
        mineralesActivos: 0,
        titulosActivos: 0,
        municipiosActivos: 0
      };
    }
  }
}

// ⚠️ IMPORTANTE: Exportar la clase, NO una instancia
module.exports = ExcelReportService;