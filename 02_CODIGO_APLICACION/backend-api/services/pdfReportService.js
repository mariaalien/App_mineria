// 📁 services/pdfReportService.js - VERSIÓN CORREGIDA
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const moment = require('moment');

class PDFReportService {
  constructor() {
    this.browser = null;
    this.setupHandlebarsHelpers();
    console.log('✅ PDFReportService inicializado correctamente');
  }

  setupHandlebarsHelpers() {
    try {
      // Helper para formatear fechas
      handlebars.registerHelper('formatDate', function(date, format) {
        if (!date) return 'N/A';
        return moment(date).format(format || 'DD/MM/YYYY');
      });

      // Helper para formatear números
      handlebars.registerHelper('formatNumber', function(number, decimals = 2) {
        if (number === null || number === undefined) return '0';
        return Number(number).toLocaleString('es-CO', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      });

      // Helper para formatear moneda
      handlebars.registerHelper('formatCurrency', function(amount) {
        if (amount === null || amount === undefined) return '$0';
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP'
        }).format(amount);
      });

      // Helper para comparación
      handlebars.registerHelper('eq', function(a, b) {
        return a === b;
      });

      console.log('✅ Handlebars helpers registrados correctamente');
    } catch (error) {
      console.error('❌ Error configurando Handlebars helpers:', error);
    }
  }

  async generateExecutiveReport(filters = {}) {
    try {
      console.log('📄 Iniciando generación de reporte PDF ejecutivo...');
      
      // Obtener datos
      const data = await this.getExecutiveData(filters);
      console.log('📊 Datos ejecutivos obtenidos:', Object.keys(data));
      
      // Template HTML
      const template = this.getExecutiveTemplate();
      const compiledTemplate = handlebars.compile(template);
      const html = compiledTemplate(data);

      console.log('📄 Template HTML compilado correctamente');

      // Generar PDF
      const pdf = await this.generatePDF(html, {
        format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(),
        footerTemplate: this.getFooterTemplate(),
        margin: {
          top: '100px',
          right: '50px',
          bottom: '100px',
          left: '50px'
        }
      });

      console.log(`✅ Reporte PDF ejecutivo generado: ${pdf.length} bytes`);
      return pdf;
    } catch (error) {
      console.error('❌ Error generando reporte PDF ejecutivo:', error);
      throw new Error(`Error en reporte PDF: ${error.message}`);
    }
  }

  async generatePDF(html, options = {}) {
    try {
      console.log('🔄 Iniciando generación de PDF...');
      
      if (!this.browser) {
        console.log('🔄 Lanzando navegador Puppeteer...');
        this.browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
          ]
        });
        console.log('✅ Navegador Puppeteer iniciado');
      }

      const page = await this.browser.newPage();
      
      // Configurar página
      console.log('🔄 Configurando página...');
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Generar PDF
      console.log('🔄 Generando PDF...');
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        ...options
      });

      await page.close();
      console.log(`✅ PDF generado exitosamente: ${pdf.length} bytes`);
      return pdf;
    } catch (error) {
      console.error('❌ Error en generación PDF:', error);
      if (this.browser) {
        try {
          await this.browser.close();
          this.browser = null;
        } catch (closeError) {
          console.error('❌ Error cerrando navegador:', closeError);
        }
      }
      throw error;
    }
  }

  getExecutiveTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reporte Ejecutivo ANM FRI</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
                background: white;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #0066CC;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #0066CC;
                margin-bottom: 10px;
            }
            .title {
                font-size: 22px;
                margin: 10px 0;
                color: #333;
            }
            .subtitle {
                font-size: 14px;
                color: #666;
                margin-top: 10px;
            }
            .section {
                margin: 25px 0;
                page-break-inside: avoid;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #0066CC;
                border-bottom: 2px solid #ccc;
                padding-bottom: 8px;
                margin-bottom: 20px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 25px 0;
            }
            .stat-box {
                border: 2px solid #0066CC;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                background: linear-gradient(135deg, #f8f9ff 0%, #e6f0ff 100%);
            }
            .stat-number {
                font-size: 32px;
                font-weight: bold;
                color: #0066CC;
                margin-bottom: 8px;
            }
            .stat-label {
                font-size: 14px;
                color: #666;
                font-weight: 500;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 11px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 10px 8px;
                text-align: left;
            }
            th {
                background-color: #0066CC;
                color: white;
                font-weight: bold;
                font-size: 12px;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            tr:hover {
                background-color: #f0f0f0;
            }
            .number-cell {
                text-align: right;
            }
            .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #ccc;
                font-size: 11px;
                color: #666;
                text-align: center;
            }
            .page-break {
                page-break-before: always;
            }
            .highlight {
                background-color: #ffffcc;
                padding: 2px 4px;
                border-radius: 3px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🏭 SISTEMA ANM FRI</div>
            <div class="title">Reporte Ejecutivo de Minería</div>
            <div class="subtitle">
                <strong>Período:</strong> {{formatDate startDate 'DD/MM/YYYY'}} - {{formatDate endDate 'DD/MM/YYYY'}}<br>
                <strong>Generado:</strong> {{formatDate generatedAt 'DD/MM/YYYY HH:mm'}}
            </div>
        </div>

        <div class="section">
            <div class="section-title">📊 Resumen Ejecutivo</div>
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-number">{{formatNumber totalProduccion}}</div>
                    <div class="stat-label">Toneladas Producidas</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">{{formatCurrency totalRegalias}}</div>
                    <div class="stat-label">Regalías Generadas</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">{{titulosActivos}}</div>
                    <div class="stat-label">Títulos Mineros Activos</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">{{mineralesActivos}}</div>
                    <div class="stat-label">Tipos de Minerales</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🏭 Producción por Tipo de Mineral</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 25%;">Mineral</th>
                        <th style="width: 20%;">Cantidad (Ton)</th>
                        <th style="width: 15%;">Participación (%)</th>
                        <th style="width: 25%;">Regalías (COP)</th>
                        <th style="width: 15%;">Títulos</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each produccionPorMineral}}
                    <tr>
                        <td><strong>{{mineral}}</strong></td>
                        <td class="number-cell">{{formatNumber cantidad}}</td>
                        <td class="number-cell">{{formatNumber participacion 1}}%</td>
                        <td class="number-cell">{{formatCurrency regalias}}</td>
                        <td class="number-cell">{{titulos}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
        </div>

        <div class="section page-break">
            <div class="section-title">📍 Distribución Geográfica</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 30%;">Municipio</th>
                        <th style="width: 15%;">Títulos</th>
                        <th style="width: 20%;">Producción (Ton)</th>
                        <th style="width: 15%;">Participación (%)</th>
                        <th style="width: 20%;">Regalías (COP)</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each produccionPorMunicipio}}
                    <tr>
                        <td><strong>{{municipio}}</strong></td>
                        <td class="number-cell">{{titulos}}</td>
                        <td class="number-cell">{{formatNumber produccion}}</td>
                        <td class="number-cell">{{formatNumber participacion 1}}%</td>
                        <td class="number-cell">{{formatCurrency regalias}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">💎 Análisis de Rendimiento</div>
            <p>El presente reporte muestra el desempeño del sector minero durante el período analizado:</p>
            <ul style="margin: 15px 0; padding-left: 25px;">
                <li>La producción total alcanzó <span class="highlight">{{formatNumber totalProduccion}} toneladas</span></li>
                <li>Se generaron <span class="highlight">{{formatCurrency totalRegalias}}</span> en regalías para el Estado</li>
                <li>{{titulosActivos}} títulos mineros mantuvieron actividad productiva</li>
                <li>Se explotaron {{mineralesActivos}} tipos diferentes de minerales</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Reporte generado por Sistema ANM FRI</strong></p>
            <p>Resolución 371/2024 - Agencia Nacional de Minería</p>
            <p>{{formatDate generatedAt 'DD/MM/YYYY HH:mm:ss'}} | Página <span class="pageNumber"></span></p>
        </div>
    </body>
    </html>
    `;
  }

  getHeaderTemplate() {
    return `
    <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin: 0 50px;">
        <span>Sistema ANM FRI - Reporte Ejecutivo | {{formatDate generatedAt 'DD/MM/YYYY'}}</span>
    </div>
    `;
  }

  getFooterTemplate() {
    return `
    <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin: 0 50px;">
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>
    `;
  }

  async getExecutiveData(filters = {}) {
    try {
      console.log('📊 Generando datos ejecutivos...');
      
      // Datos de ejemplo mejorados - reemplazar con queries reales
      const baseData = {
        startDate: filters.startDate || moment().subtract(30, 'days').toDate(),
        endDate: filters.endDate || new Date(),
        generatedAt: new Date(),
        totalProduccion: 3750.50,
        totalRegalias: 375050000,
        titulosActivos: 18,
        mineralesActivos: 6,
        produccionPorMineral: [
          {
            mineral: 'Oro',
            cantidad: 1875.25,
            participacion: 50.0,
            regalias: 187525000,
            titulos: 8
          },
          {
            mineral: 'Plata',
            cantidad: 937.625,
            participacion: 25.0,
            regalias: 93762500,
            titulos: 4
          },
          {
            mineral: 'Carbón',
            cantidad: 750.10,
            participacion: 20.0,
            regalias: 75010000,
            titulos: 3
          },
          {
            mineral: 'Cobre',
            cantidad: 187.525,
            participacion: 5.0,
            regalias: 18752500,
            titulos: 2
          }
        ],
        produccionPorMunicipio: [
          {
            municipio: 'Bogotá D.C.',
            titulos: 6,
            produccion: 1500.20,
            participacion: 40.0,
            regalias: 150020000
          },
          {
            municipio: 'Medellín',
            titulos: 5,
            produccion: 1125.15,
            participacion: 30.0,
            regalias: 112515000
          },
          {
            municipio: 'Cali',
            titulos: 4,
            produccion: 750.10,
            participacion: 20.0,
            regalias: 75010000
          },
          {
            municipio: 'Barranquilla',
            titulos: 2,
            produccion: 225.03,
            participacion: 6.0,
            regalias: 22503000
          },
          {
            municipio: 'Cartagena',
            titulos: 1,
            produccion: 150.02,
            participacion: 4.0,
            regalias: 15002000
          }
        ]
      };

      console.log('✅ Datos ejecutivos generados correctamente');
      return baseData;
    } catch (error) {
      console.error('❌ Error generando datos ejecutivos:', error);
      // Retornar datos por defecto en caso de error
      return {
        startDate: new Date(),
        endDate: new Date(),
        generatedAt: new Date(),
        totalProduccion: 0,
        totalRegalias: 0,
        titulosActivos: 0,
        mineralesActivos: 0,
        produccionPorMineral: [],
        produccionPorMunicipio: []
      };
    }
  }

  getReportFilename(type, extension) {
    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const filename = `Reporte_${type}_${timestamp}.${extension}`;
    console.log(`📄 Nombre de archivo PDF: ${filename}`);
    return filename;
  }

  async closeBrowser() {
    if (this.browser) {
      try {
        console.log('🔄 Cerrando navegador Puppeteer...');
        await this.browser.close();
        this.browser = null;
        console.log('✅ Navegador cerrado correctamente');
      } catch (error) {
        console.error('❌ Error cerrando navegador:', error);
      }
    }
  }
}

// ⚠️ IMPORTANTE: Exportar la clase, NO una instancia
module.exports = PDFReportService;