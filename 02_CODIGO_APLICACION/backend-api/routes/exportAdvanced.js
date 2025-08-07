// =============================================================================
// 📄 DÍA 11 - HORA 3: EXPORT EXCEL/PDF CON TEMPLATES PROFESIONALES - BACKEND
// Sistema completo de exportación con templates empresariales
// =============================================================================

// controllers/ExportController.js
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

class ProfessionalExportController {

  // 📊 Export Excel Avanzado con Templates
  static async exportExcelAdvanced(req, res) {
    try {
      const { 
        template = 'dashboard_ejecutivo',
        data_range = '6m',
        include_charts = true,
        format_style = 'corporate'
      } = req.query;

      console.log(`📊 Exportando Excel avanzado - Template: ${template}`);

      // Crear workbook con configuración profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistema ANM FRI';
      workbook.lastModifiedBy = 'ANM FRI Analytics Engine';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Configurar propiedades del documento
      workbook.properties = {
        title: 'Reporte ANM FRI - Dashboard Ejecutivo',
        subject: 'Análisis Minero Empresarial',
        keywords: 'minería, ANM, producción, analytics, FRI',
        category: 'Reportes Ejecutivos',
        description: 'Reporte completo generado por Sistema ANM FRI'
      };

      // HOJA 1: Dashboard Ejecutivo
      const dashboardSheet = workbook.addWorksheet('Dashboard Ejecutivo', {
        properties: {
          defaultColWidth: 15,
          defaultRowHeight: 20
        }
      });

      // Configurar estilos profesionales
      const headerStyle = {
        font: { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };

      const titleStyle = {
        font: { name: 'Calibri', size: 18, bold: true, color: { argb: '2F5597' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };

      const kpiStyle = {
        font: { name: 'Calibri', size: 12, bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        numFmt: '#,##0.00'
      };

      // TÍTULO PRINCIPAL
      dashboardSheet.mergeCells('A1:H2');
      dashboardSheet.getCell('A1').value = 'REPORTE EJECUTIVO ANM FRI - SISTEMA MINERO';
      dashboardSheet.getCell('A1').style = titleStyle;

      // INFORMACIÓN DE GENERACIÓN
      dashboardSheet.mergeCells('A3:D3');
      dashboardSheet.getCell('A3').value = `Generado: ${new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
      
      dashboardSheet.mergeCells('E3:H3');
      dashboardSheet.getCell('E3').value = `Período: ${data_range === '6m' ? 'Últimos 6 meses' : 'Último año'}`;

      // SECCIÓN KPIs PRINCIPALES
      dashboardSheet.getCell('A5').value = 'KPIs PRINCIPALES';
      dashboardSheet.getCell('A5').style = { font: { size: 14, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } } };
      dashboardSheet.mergeCells('A5:H5');

      // Headers KPIs
      const kpiHeaders = ['Métrica', 'Valor Actual', 'Objetivo', 'Variación', 'Tendencia', 'Estado', 'Benchmark', 'Acción'];
      kpiHeaders.forEach((header, index) => {
        const cell = dashboardSheet.getCell(6, index + 1);
        cell.value = header;
        cell.style = headerStyle;
      });

      // Datos KPIs simulados
      const kpiData = [
        ['Producción Total (ton)', 5420, 5000, '+8.4%', '↗', 'Excelente', 'Superior', 'Mantener'],
        ['Eficiencia Operacional (%)', 87.3, 85.0, '+2.7%', '↗', 'Bueno', 'Por encima', 'Optimizar'],
        ['Margen Bruto (%)', 42.8, 40.0, '+7.0%', '↗', 'Excelente', 'Superior', 'Mantener'],
        ['Cumplimiento ANM (%)', 96.5, 95.0, '+1.6%', '→', 'Excelente', 'Excelente', 'Mantener'],
        ['Costo por Tonelada', '$65.40', '$70.00', '-6.6%', '↘', 'Excelente', 'Líder', 'Monitorear'],
        ['Personal Activo', 156, 150, '+4.0%', '→', 'Bueno', 'Adecuado', 'Estable']
      ];

      kpiData.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const cell = dashboardSheet.getCell(7 + rowIndex, colIndex + 1);
          cell.value = value;
          
          // Aplicar estilos según la columna
          if (colIndex === 0) { // Métrica
            cell.style = { font: { bold: true } };
          } else if (colIndex === 1 || colIndex === 2) { // Valores numéricos
            cell.style = kpiStyle;
          } else if (colIndex === 3) { // Variación
            cell.style = { 
              font: { bold: true, color: { argb: value.includes('+') ? '008000' : value.includes('-') ? 'FF0000' : '000000' } },
              alignment: { horizontal: 'center' }
            };
          } else if (colIndex === 4) { // Tendencia
            cell.style = { 
              font: { size: 14, bold: true },
              alignment: { horizontal: 'center' }
            };
          } else if (colIndex === 5) { // Estado
            const color = value === 'Excelente' ? '008000' : value === 'Bueno' ? 'FFA500' : '000000';
            cell.style = { 
              font: { bold: true, color: { argb: color } },
              alignment: { horizontal: 'center' }
            };
          }
        });
      });

      // HOJA 2: Análisis de Tendencias
      const trendsSheet = workbook.addWorksheet('Análisis Tendencias');
      
      // Título de la hoja
      trendsSheet.mergeCells('A1:F1');
      trendsSheet.getCell('A1').value = 'ANÁLISIS DE TENDENCIAS - ÚLTIMOS 6 MESES';
      trendsSheet.getCell('A1').style = titleStyle;

      // Datos de tendencias simulados
      const trendsData = [
        ['Mes', 'Producción (ton)', 'Ingresos (COP)', 'Eficiencia (%)', 'Costos (COP)', 'Personal'],
        ['Enero', 820, 328000, 83.5, 195000, 148],
        ['Febrero', 865, 346000, 84.2, 198000, 152],
        ['Marzo', 890, 356000, 85.1, 201000, 154],
        ['Abril', 875, 350000, 86.0, 199000, 153],
        ['Mayo', 920, 368000, 86.8, 203000, 155],
        ['Junio', 945, 378000, 87.3, 205000, 156]
      ];

      trendsData.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const cell = trendsSheet.getCell(3 + rowIndex, colIndex + 1);
          cell.value = value;
          
          if (rowIndex === 0) { // Header
            cell.style = headerStyle;
          } else if (colIndex > 0) { // Datos numéricos
            cell.style = { 
              numFmt: colIndex === 2 || colIndex === 4 ? '"$"#,##0' : '#,##0',
              alignment: { horizontal: 'right' }
            };
          }
        });
      });

      // Ajustar ancho de columnas
      trendsSheet.columns.forEach(column => {
        column.width = 15;
      });

      // HOJA 3: Pronósticos
      const forecastSheet = workbook.addWorksheet('Pronósticos 6M');
      
      forecastSheet.mergeCells('A1:E1');
      forecastSheet.getCell('A1').value = 'PRONÓSTICOS - PRÓXIMOS 6 MESES';
      forecastSheet.getCell('A1').style = titleStyle;

      // Datos de pronósticos
      const forecastData = [
        ['Mes', 'Producción Estimada', 'Intervalo Confianza', 'Ingresos Proyectados', 'Escenario'],
        ['Julio 2025', 960, '920 - 1000', 384000, 'Optimista'],
        ['Agosto 2025', 945, '905 - 985', 378000, 'Base'],
        ['Septiembre 2025', 980, '940 - 1020', 392000, 'Optimista'],
        ['Octubre 2025', 935, '895 - 975', 374000, 'Base'],
        ['Noviembre 2025', 920, '880 - 960', 368000, 'Base'],
        ['Diciembre 2025', 955, '915 - 995', 382000, 'Optimista']
      ];

      forecastData.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const cell = forecastSheet.getCell(3 + rowIndex, colIndex + 1);
          cell.value = value;
          
          if (rowIndex === 0) {
            cell.style = headerStyle;
          } else if (colIndex === 1 || colIndex === 3) {
            cell.style = { numFmt: '#,##0', alignment: { horizontal: 'right' } };
          } else if (colIndex === 4) {
            const color = value === 'Optimista' ? '008000' : value === 'Pesimista' ? 'FF0000' : '0066CC';
            cell.style = { 
              font: { bold: true, color: { argb: color } },
              alignment: { horizontal: 'center' }
            };
          }
        });
      });

      // HOJA 4: Recomendaciones
      const recSheet = workbook.addWorksheet('Recomendaciones');
      
      recSheet.mergeCells('A1:D1');
      recSheet.getCell('A1').value = 'RECOMENDACIONES ESTRATÉGICAS';
      recSheet.getCell('A1').style = titleStyle;

      const recommendations = [
        ['Prioridad', 'Área', 'Recomendación', 'Impacto Estimado'],
        ['ALTA', 'Operaciones', 'Implementar mantenimiento predictivo en equipos críticos', '+12% eficiencia'],
        ['ALTA', 'Producción', 'Optimizar horarios de trabajo en temporada alta', '+8% producción'],
        ['MEDIA', 'Ambiental', 'Certificación ISO 14001 para mejores prácticas', '+15% compliance'],
        ['MEDIA', 'Financiero', 'Renegociar contratos proveedores principales', '-5% costos'],
        ['BAJA', 'Tecnología', 'Evaluar nuevas tecnologías de extracción', '+20% eficiencia L.P.']
      ];

      recommendations.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const cell = recSheet.getCell(3 + rowIndex, colIndex + 1);
          cell.value = value;
          
          if (rowIndex === 0) {
            cell.style = headerStyle;
          } else if (colIndex === 0) {
            const color = value === 'ALTA' ? 'FF0000' : value === 'MEDIA' ? 'FFA500' : '008000';
            cell.style = { 
              font: { bold: true, color: { argb: color } },
              alignment: { horizontal: 'center' }
            };
          }
        });
      });

      // Generar buffer del Excel
      const buffer = await workbook.xlsx.writeBuffer();

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="Reporte_ANM_FRI_${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);

      console.log('✅ Excel avanzado generado exitosamente');

    } catch (error) {
      console.error('❌ Error generando Excel:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte Excel'
      });
    }
  }

  // 📄 Export PDF Profesional
  static async exportPDFAdvanced(req, res) {
    try {
      const { 
        template = 'ejecutivo',
        include_charts = true,
        style = 'corporate'
      } = req.query;

      console.log(`📄 Generando PDF profesional - Template: ${template}`);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: 'Reporte ANM FRI - Sistema Minero',
          Author: 'Sistema ANM FRI',
          Subject: 'Reporte Ejecutivo Minero',
          Keywords: 'minería, ANM, producción, analytics'
        }
      });

      // Configurar headers para PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Reporte_ANM_FRI_${new Date().toISOString().split('T')[0]}.pdf"`);

      // Pipe del PDF a la respuesta
      doc.pipe(res);

      // PORTADA
      doc.fontSize(24)
         .fillColor('#2F5597')
         .text('SISTEMA ANM FRI', { align: 'center' });
      
      doc.fontSize(20)
         .text('Reporte Ejecutivo Minero', { align: 'center' });
      
      doc.moveDown(2);
      
      doc.fontSize(14)
         .fillColor('black')
         .text(`Período de Análisis: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
      
      doc.moveDown(1);
      doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'center' });

      // Línea decorativa
      doc.moveDown(2);
      doc.strokeColor('#2F5597')
         .lineWidth(2)
         .moveTo(100, doc.y)
         .lineTo(500, doc.y)
         .stroke();

      doc.moveDown(3);

      // RESUMEN EJECUTIVO
      doc.addPage();
      doc.fontSize(18)
         .fillColor('#2F5597')
         .text('RESUMEN EJECUTIVO', { underline: true });
      
      doc.moveDown(1);
      doc.fontSize(12)
         .fillColor('black')
         .text('El presente reporte proporciona un análisis integral de las operaciones mineras, incluyendo indicadores de producción, eficiencia operacional, cumplimiento normativo y proyecciones futuras.');

      doc.moveDown(1);
      doc.text('Aspectos Destacados del Período:');
      
      doc.moveDown(0.5);
      doc.list([
        'Producción total: 5,420 toneladas (+8.4% vs objetivo)',
        'Eficiencia operacional: 87.3% (superior al benchmark industria)',
        'Cumplimiento normativo ANM: 96.5%',
        'Margen bruto: 42.8% (+7.0% vs período anterior)',
        'Cero accidentes graves registrados'
      ]);

      // INDICADORES PRINCIPALES
      doc.moveDown(2);
      doc.fontSize(16)
         .fillColor('#2F5597')
         .text('INDICADORES PRINCIPALES');
      
      doc.moveDown(1);
      
      // Crear tabla de KPIs
      const kpiTableData = [
        ['PRODUCCIÓN', '5,420 ton', '+8.4%', 'Excelente'],
        ['EFICIENCIA', '87.3%', '+2.7%', 'Superior'],
        ['CUMPLIMIENTO ANM', '96.5%', '+1.6%', 'Óptimo'],
        ['MARGEN BRUTO', '42.8%', '+7.0%', 'Excelente'],
        ['SEGURIDAD', '127 días', '0 accidentes', 'Óptimo']
      ];

      let yPosition = doc.y;
      doc.fontSize(10);

      // Headers de tabla
      doc.fillColor('#2F5597')
         .text('MÉTRICA', 80, yPosition, { width: 120 })
         .text('VALOR', 200, yPosition, { width: 80 })
         .text('VARIACIÓN', 280, yPosition, { width: 80 })
         .text('ESTADO', 360, yPosition, { width: 80 });

      yPosition += 20;

      // Datos de tabla
      kpiTableData.forEach((row, index) => {
        doc.fillColor('black')
           .text(row[0], 80, yPosition, { width: 120 })
           .text(row[1], 200, yPosition, { width: 80 })
           .text(row[2], 280, yPosition, { width: 80 })
           .fillColor(row[3] === 'Excelente' || row[3] === 'Óptimo' ? 'green' : 'orange')
           .text(row[3], 360, yPosition, { width: 80 });
        
        yPosition += 15;
      });

      // ANÁLISIS DE TENDENCIAS
      doc.addPage();
      doc.fontSize(16)
         .fillColor('#2F5597')
         .text('ANÁLISIS DE TENDENCIAS');
      
      doc.moveDown(1);
      doc.fontSize(12)
         .fillColor('black')
         .text('Evolución de Indicadores Clave (Últimos 6 Meses):');
      
      doc.moveDown(1);
      doc.text('• Producción: Tendencia creciente sostenida (+15.2% acumulado)');
      doc.text('• Eficiencia: Mejora constante (+4.5% vs inicio período)');
      doc.text('• Costos: Optimización lograda (-3.8% costo por tonelada)');
      doc.text('• Personal: Estabilidad en dotación (+5.4% capacitación)');

      // PROYECCIONES
      doc.moveDown(2);
      doc.fontSize(16)
         .fillColor('#2F5597')
         .text('PROYECCIONES PRÓXIMOS 6 MESES');
      
      doc.moveDown(1);
      doc.fontSize(12)
         .fillColor('black')
         .text('Estimaciones basadas en modelos predictivos (Confianza: 85%):');
      
      doc.moveDown(1);
      doc.text('• Producción estimada: 5,760 toneladas (+6.3% vs período actual)');
      doc.text('• Eficiencia proyectada: 89.1% (mejora continua esperada)');
      doc.text('• Inversión recomendada: $150M para optimización equipos');
      doc.text('• ROI proyectado: 18.7% (superior a benchmark industria)');

      // RECOMENDACIONES
      doc.moveDown(2);
      doc.fontSize(16)
         .fillColor('#2F5597')
         .text('RECOMENDACIONES ESTRATÉGICAS');
      
      doc.moveDown(1);
      doc.fontSize(12)
         .fillColor('black');

      const recommendations = [
        {
          priority: 'ALTA',
          area: 'Operaciones',
          action: 'Implementar mantenimiento predictivo',
          impact: '+12% eficiencia'
        },
        {
          priority: 'ALTA', 
          area: 'Producción',
          action: 'Optimizar turnos de trabajo',
          impact: '+8% producción'
        },
        {
          priority: 'MEDIA',
          area: 'Ambiental',
          action: 'Certificación ISO 14001',
          impact: 'Cumplimiento +15%'
        }
      ];

      recommendations.forEach((rec, index) => {
        doc.fillColor('#2F5597')
           .text(`${index + 1}. ${rec.area} (Prioridad: ${rec.priority})`, { continued: false });
        doc.fillColor('black')
           .text(`   Acción: ${rec.action}`)
           .text(`   Impacto esperado: ${rec.impact}`);
        doc.moveDown(0.5);
      });

      // FOOTER
      doc.fontSize(8)
         .fillColor('gray')
         .text('Documento generado automáticamente por Sistema ANM FRI', 50, doc.page.height - 50, {
           align: 'center'
         });

      // Finalizar el PDF
      doc.end();

      console.log('✅ PDF profesional generado exitosamente');

    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte PDF'
      });
    }
  }

  // 📋 Export CSV personalizado
  static async exportCSVCustom(req, res) {
    try {
      const { fields, date_range = '6m', format = 'standard' } = req.query;

      console.log(`📋 Exportando CSV personalizado`);

      // Generar datos CSV
      const csvData = [
        'Fecha,Producción (ton),Eficiencia (%),Ingresos (COP),Costos (COP),Personal,Estado',
        '2025-01-01,820,83.5,328000,195000,148,Activo',
        '2025-02-01,865,84.2,346000,198000,152,Activo',
        '2025-03-01,890,85.1,356000,201000,154,Activo',
        '2025-04-01,875,86.0,350000,199000,153,Activo',
        '2025-05-01,920,86.8,368000,203000,155,Activo',
        '2025-06-01,945,87.3,378000,205000,156,Activo'
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="datos_anm_fri_${new Date().toISOString().split('T')[0]}.csv"`);
      
      // Agregar BOM para UTF-8
      res.write('\ufeff');
      res.end(csvData);

      console.log('✅ CSV personalizado generado');

    } catch (error) {
      console.error('❌ Error generando CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando CSV'
      });
    }
  }
}

// =============================================================================
// 🚀 RUTAS DE EXPORT AVANZADO
// =============================================================================

// GET /api/export/excel/advanced - Excel profesional
router.get('/excel/advanced', ProfessionalExportController.exportExcelAdvanced);

// GET /api/export/pdf/advanced - PDF profesional  
router.get('/pdf/advanced', ProfessionalExportController.exportPDFAdvanced);

// GET /api/export/csv/custom - CSV personalizado
router.get('/csv/custom', ProfessionalExportController.exportCSVCustom);

// GET /api/export/formats - Formatos disponibles
router.get('/formats', async (req, res) => {
  try {
    const formats = {
      excel: {
        name: 'Microsoft Excel',
        extensions: ['.xlsx', '.xls'],
        templates: ['dashboard_ejecutivo', 'operacional_detallado', 'financiero_minero'],
        features: ['Gráficos integrados', 'Múltiples hojas', 'Formato profesional', 'Fórmulas avanzadas']
      },
      pdf: {
        name: 'Adobe PDF',
        extensions: ['.pdf'],
        templates: ['ejecutivo', 'operacional', 'compliance', 'presentacion'],
        features: ['Diseño corporativo', 'Gráficos vectoriales', 'Firmas digitales', 'Protección']
      },
      csv: {
        name: 'Comma Separated Values',
        extensions: ['.csv'],
        templates: ['standard', 'detailed', 'summary'],
        features: ['Compatible Excel', 'UTF-8', 'Personalizable', 'Liviano']
      },
      json: {
        name: 'JavaScript Object Notation',
        extensions: ['.json'],
        templates: ['api', 'detailed', 'compressed'],
        features: ['Estructura completa', 'APIs', 'Intercambio datos', 'Metadatos']
      }
    };

    res.json({
      success: true,
      message: 'Formatos de exportación disponibles',
      data: formats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo formatos'
    });
  }
});

// POST /api/export/batch - Exportación por lotes
router.post('/batch', async (req, res) => {
  try {
    const { 
      formats = ['excel', 'pdf'], 
      template = 'dashboard_ejecutivo',
      data_range = '6m',
      compress = true 
    } = req.body;

    console.log(`📦 Iniciando exportación por lotes: ${formats.join(', ')}`);

    const batchId = `batch_${Date.now()}`;
    const results = [];

    for (const format of formats) {
      try {
        // Simular generación de archivos
        const filename = `reporte_${format}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        
        results.push({
          format,
          filename,
          size: Math.floor(Math.random() * 1000) + 500, // KB simulado
          status: 'completed',
          download_url: `/api/export/download/${batchId}/${filename}`
        });

        console.log(`✅ ${format.toUpperCase()} generado: ${filename}`);

      } catch (error) {
        results.push({
          format,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Exportación por lotes completada',
      data: {
        batch_id: batchId,
        total_files: results.length,
        successful: results.filter(r => r.status === 'completed').length,
        failed: results.filter(r => r.status === 'failed').length,
        files: results,
        download_all_url: compress ? `/api/export/download/${batchId}/all.zip` : null
      }
    });

  } catch (error) {
    console.error('❌ Error en exportación por lotes:', error);
    res.status(500).json({
      success: false,
      message: 'Error en exportación por lotes'
    });
  }
});

// GET /api/export/templates - Templates disponibles
router.get('/templates', async (req, res) => {
  try {
    const templates = {
      dashboard_ejecutivo: {
        name: 'Dashboard Ejecutivo',
        description: 'Resumen completo para directivos y stakeholders',
        sections: ['KPIs principales', 'Tendencias', 'Proyecciones', 'Recomendaciones'],
        target_audience: 'Ejecutivos, Directores, Inversionistas',
        recommended_frequency: 'Mensual',
        formats_supported: ['excel', 'pdf', 'powerpoint']
      },
      operacional_detallado: {
        name: 'Reporte Operacional Detallado', 
        description: 'Análisis profundo de operaciones diarias',
        sections: ['Producción diaria', 'Equipos', 'Personal', 'Incidentes', 'Mantenimiento'],
        target_audience: 'Gerentes operacionales, Supervisores',
        recommended_frequency: 'Semanal',
        formats_supported: ['excel', 'pdf', 'csv']
      },
      cumplimiento_ambiental: {
        name: 'Cumplimiento Ambiental',
        description: 'Reportes para autoridades y certificaciones',
        sections: ['Impacto hídrico', 'Emisiones', 'Rehabilitación', 'Monitoreos'],
        target_audience: 'Autoridades ambientales, Auditores',
        recommended_frequency: 'Trimestral',
        formats_supported: ['pdf', 'excel']
      },
      financiero_minero: {
        name: 'Análisis Financiero Minero',
        description: 'KPIs económicos y análisis financiero',
        sections: ['Ingresos', 'Costos', 'Márgenes', 'ROI', 'Proyecciones'],
        target_audience: 'CFO, Controllers, Analistas financieros',
        recommended_frequency: 'Mensual',
        formats_supported: ['excel', 'pdf', 'csv']
      },
      seguridad_industrial: {
        name: 'Seguridad Industrial',
        description: 'Indicadores de seguridad y prevención',
        sections: ['Incidentes', 'Capacitaciones', 'Auditorías', 'Mejoras'],
        target_audience: 'Gerente HSE, Comité de seguridad',
        recommended_frequency: 'Semanal',
        formats_supported: ['pdf', 'excel']
      }
    };

    res.json({
      success: true,
      message: 'Templates de reportes disponibles',
      data: {
        templates,
        total_templates: Object.keys(templates).length,
        categories: ['Ejecutivo', 'Operacional', 'Ambiental', 'Financiero', 'Seguridad']
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo templates'
    });
  }
});

// GET /api/export/schedule - Reportes programados
router.get('/schedule', async (req, res) => {
  try {
    const scheduledReports = [
      {
        id: 'sched_001',
        name: 'Dashboard Ejecutivo Mensual',
        template: 'dashboard_ejecutivo',
        frequency: 'monthly',
        next_execution: '2025-09-01T08:00:00Z',
        recipients: ['director@empresa.com', 'cfo@empresa.com'],
        formats: ['excel', 'pdf'],
        status: 'active'
      },
      {
        id: 'sched_002', 
        name: 'Reporte Operacional Semanal',
        template: 'operacional_detallado',
        frequency: 'weekly',
        next_execution: '2025-08-12T06:00:00Z',
        recipients: ['gerente.ops@empresa.com'],
        formats: ['excel'],
        status: 'active'
      },
      {
        id: 'sched_003',
        name: 'Cumplimiento Ambiental Trimestral',
        template: 'cumplimiento_ambiental', 
        frequency: 'quarterly',
        next_execution: '2025-10-01T09:00:00Z',
        recipients: ['ambiental@empresa.com', 'cumplimiento@empresa.com'],
        formats: ['pdf'],
        status: 'active'
      }
    ];

    res.json({
      success: true,
      message: 'Reportes programados',
      data: {
        scheduled_reports: scheduledReports,
        total_scheduled: scheduledReports.length,
        active_schedules: scheduledReports.filter(r => r.status === 'active').length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo reportes programados'
    });
  }
});

// POST /api/export/schedule - Programar nuevo reporte
router.post('/schedule', async (req, res) => {
  try {
    const {
      name,
      template,
      frequency, // daily, weekly, monthly, quarterly
      recipients,
      formats,
      time = '08:00',
      timezone = 'America/Bogota'
    } = req.body;

    const newSchedule = {
      id: `sched_${Date.now()}`,
      name,
      template,
      frequency,
      recipients: Array.isArray(recipients) ? recipients : [recipients],
      formats: Array.isArray(formats) ? formats : [formats],
      time,
      timezone,
      created_by: 'user@empresa.com', // En producción usar req.user
      created_at: new Date().toISOString(),
      next_execution: calculateNextExecution(frequency, time, timezone),
      status: 'active'
    };

    // En producción: guardar en base de datos
    console.log(`📅 Nuevo reporte programado: ${name}`);

    res.json({
      success: true,
      message: 'Reporte programado exitosamente',
      data: newSchedule
    });

  } catch (error) {
    console.error('❌ Error programando reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error programando reporte'
    });
  }
});

// Función auxiliar para calcular próxima ejecución
function calculateNextExecution(frequency, time, timezone) {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  let nextExecution = new Date();
  nextExecution.setHours(hours, minutes, 0, 0);
  
  // Si ya pasó la hora de hoy, programar para el próximo período
  if (nextExecution <= now) {
    switch (frequency) {
      case 'daily':
        nextExecution.setDate(nextExecution.getDate() + 1);
        break;
      case 'weekly':
        nextExecution.setDate(nextExecution.getDate() + 7);
        break;
      case 'monthly':
        nextExecution.setMonth(nextExecution.getMonth() + 1);
        break;
      case 'quarterly':
        nextExecution.setMonth(nextExecution.getMonth() + 3);
        break;
    }
  }
  
  return nextExecution.toISOString();
}

module.exports = router;