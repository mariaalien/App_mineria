// ================================
// 📁 controllers/advancedReportsController.js - REPORTES PROFESIONALES ANM FRI
// ================================
const ExcelReportService = require('../services/excelReportService');
const PDFReportService = require('../services/pdfReportService');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

class AdvancedReportsController {
  constructor() {
    this.excelService = new ExcelReportService();
    this.pdfService = new PDFReportService();
    this.reportsDir = path.join(__dirname, '../reports');
    this.cacheDir = path.join(__dirname, '../cache');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creando directorios:', error);
    }
  }

  // ============================================================================
  // 📊 REPORTES COMPARATIVOS AVANZADOS
  // ============================================================================

  generateComparativeReport = async (req, res) => {
    try {
      console.log('🔄 Generando reporte comparativo avanzado...');

      const {
        type = 'produccion',
        periods = [],
        compareBy = 'month',
        format = 'excel'
      } = req.body;

      // Validar períodos
      if (!periods || periods.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren al menos 2 períodos para comparar'
        });
      }

      const comparativeData = await this.buildComparativeData(type, periods, compareBy);
      
      let reportBuffer;
      let filename;
      let contentType;

      if (format === 'excel') {
        const workbook = await this.generateComparativeExcel(comparativeData, type, periods);
        reportBuffer = await this.excelService.generateReportBuffer(workbook);
        filename = `ANM_FRI_Comparativo_${type}_${Date.now()}.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (format === 'pdf') {
        reportBuffer = await this.generateComparativePDF(comparativeData, type, periods);
        filename = `ANM_FRI_Comparativo_${type}_${Date.now()}.pdf`;
        contentType = 'application/pdf';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', reportBuffer.length);

      console.log(`✅ Reporte comparativo ${format} generado: ${filename}`);
      res.send(reportBuffer);

    } catch (error) {
      console.error('❌ Error generando reporte comparativo:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte comparativo',
        error: error.message
      });
    }
  };

  async buildComparativeData(type, periods, compareBy) {
    const data = {};
    
    for (const period of periods) {
      const filters = {
        startDate: period.startDate,
        endDate: period.endDate
      };

      let periodData;
      switch (type) {
        case 'produccion':
          periodData = await this.excelService.getProduccionData(filters);
          break;
        case 'inventarios':
          periodData = await this.excelService.getInventariosData(filters);
          break;
        default:
          periodData = await this.excelService.getProduccionData(filters);
      }

      data[period.name] = this.aggregateDataByPeriod(periodData, compareBy);
    }

    return {
      type,
      compareBy,
      periods: periods.map(p => p.name),
      data,
      analysis: this.generateComparativeAnalysis(data, periods)
    };
  }

  aggregateDataByPeriod(data, compareBy) {
    const aggregated = {
      totalRecords: data.length,
      totalProduction: data.reduce((sum, item) => sum + (parseFloat(item.cantidadProduccion) || 0), 0),
      totalHours: data.reduce((sum, item) => sum + (parseFloat(item.horasOperativas) || 0), 0),
      uniqueMinerals: [...new Set(data.map(item => item.mineral))].length,
      averageProduction: 0,
      efficiency: 0,
      mineralBreakdown: {}
    };

    // Calcular promedios
    if (aggregated.totalRecords > 0) {
      aggregated.averageProduction = aggregated.totalProduction / aggregated.totalRecords;
    }
    
    if (aggregated.totalHours > 0) {
      aggregated.efficiency = aggregated.totalProduction / aggregated.totalHours;
    }

    // Desglose por mineral
    data.forEach(item => {
      const mineral = item.mineral;
      if (!aggregated.mineralBreakdown[mineral]) {
        aggregated.mineralBreakdown[mineral] = {
          production: 0,
          hours: 0,
          records: 0
        };
      }
      aggregated.mineralBreakdown[mineral].production += parseFloat(item.cantidadProduccion) || 0;
      aggregated.mineralBreakdown[mineral].hours += parseFloat(item.horasOperativas) || 0;
      aggregated.mineralBreakdown[mineral].records += 1;
    });

    return aggregated;
  }

  generateComparativeAnalysis(data, periods) {
    const analysis = {
      growthRates: {},
      bestPeriod: null,
      worstPeriod: null,
      recommendations: []
    };

    const periodNames = Object.keys(data);
    if (periodNames.length < 2) return analysis;

    // Calcular tasas de crecimiento
    for (let i = 1; i < periodNames.length; i++) {
      const currentPeriod = periodNames[i];
      const previousPeriod = periodNames[i - 1];
      
      const currentProduction = data[currentPeriod].totalProduction;
      const previousProduction = data[previousPeriod].totalProduction;
      
      if (previousProduction > 0) {
        analysis.growthRates[`${previousPeriod}_to_${currentPeriod}`] = 
          ((currentProduction - previousProduction) / previousProduction) * 100;
      }
    }

    // Encontrar mejor y peor período
    let maxProduction = 0;
    let minProduction = Infinity;
    
    Object.entries(data).forEach(([period, periodData]) => {
      if (periodData.totalProduction > maxProduction) {
        maxProduction = periodData.totalProduction;
        analysis.bestPeriod = period;
      }
      if (periodData.totalProduction < minProduction) {
        minProduction = periodData.totalProduction;
        analysis.worstPeriod = period;
      }
    });

    // Generar recomendaciones
    const avgGrowth = Object.values(analysis.growthRates).reduce((sum, rate) => sum + rate, 0) / 
                     Object.values(analysis.growthRates).length;

    if (avgGrowth > 5) {
      analysis.recommendations.push('Tendencia de crecimiento positiva. Mantener estrategias actuales.');
    } else if (avgGrowth < -5) {
      analysis.recommendations.push('Declive en producción. Revisar procesos operativos.');
    } else {
      analysis.recommendations.push('Producción estable. Evaluar oportunidades de optimización.');
    }

    return analysis;
  }

  // ============================================================================
  // 📈 REPORTES DE PREDICCIÓN Y FORECASTING
  // ============================================================================

  generateForecastReport = async (req, res) => {
    try {
      console.log('🔮 Generando reporte de predicciones...');

      const {
        forecastMonths = 6,
        method = 'linear',
        includeSeasonality = true,
        format = 'excel'
      } = req.query;

      const filters = this.buildFilters(req);
      const historicalData = await this.getHistoricalDataForForecast(filters);
      const forecast = this.calculateForecast(historicalData, parseInt(forecastMonths), method, includeSeasonality);

      let reportBuffer;
      let filename;
      let contentType;

      if (format === 'excel') {
        const workbook = await this.generateForecastExcel(historicalData, forecast);
        reportBuffer = await this.excelService.generateReportBuffer(workbook);
        filename = `ANM_FRI_Forecast_${forecastMonths}m_${Date.now()}.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        reportBuffer = await this.generateForecastPDF(historicalData, forecast);
        filename = `ANM_FRI_Forecast_${forecastMonths}m_${Date.now()}.pdf`;
        contentType = 'application/pdf';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', reportBuffer.length);

      console.log(`✅ Reporte de predicción generado: ${filename}`);
      res.send(reportBuffer);

    } catch (error) {
      console.error('❌ Error generando reporte de predicción:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte de predicción',
        error: error.message
      });
    }
  };

  async getHistoricalDataForForecast(filters, months = 24) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const data = await prisma.fRIProduccion.findMany({
      where: {
        ...this.buildWhereClause({...filters, startDate, endDate}),
        cantidadProduccion: { not: null }
      },
      select: {
        fechaCorteInformacion: true,
        cantidadProduccion: true,
        horasOperativas: true,
        mineral: true
      },
      orderBy: { fechaCorteInformacion: 'asc' }
    });

    // Agrupar por mes
    const monthlyData = {};
    data.forEach(item => {
      const date = new Date(item.fechaCorteInformacion);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          production: 0,
          hours: 0,
          records: 0
        };
      }
      
      monthlyData[monthKey].production += parseFloat(item.cantidadProduccion) || 0;
      monthlyData[monthKey].hours += parseFloat(item.horasOperativas) || 0;
      monthlyData[monthKey].records += 1;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  calculateForecast(historicalData, months, method, includeSeasonality) {
    if (!historicalData || historicalData.length < 3) {
      return {
        method: 'insufficient_data',
        forecast: [],
        confidence: 'low',
        error: 'Insufficient historical data for forecast'
      };
    }

    const productions = historicalData.map(d => d.production);
    const forecast = {
      method,
      historical: historicalData,
      forecast: [],
      confidence: 'medium',
      metrics: {}
    };

    switch (method) {
      case 'linear':
        forecast.forecast = this.linearForecast(productions, months);
        break;
      case 'exponential':
        forecast.forecast = this.exponentialSmoothing(productions, months);
        break;
      case 'seasonal':
        forecast.forecast = this.seasonalForecast(productions, months, includeSeasonality);
        break;
      default:
        forecast.forecast = this.linearForecast(productions, months);
    }

    // Calcular métricas de confianza
    forecast.metrics = this.calculateForecastMetrics(historicalData, forecast.forecast);
    
    // Ajustar nivel de confianza basado en métricas
    const variance = this.calculateVariance(productions);
    if (variance < 0.1) forecast.confidence = 'high';
    else if (variance > 0.3) forecast.confidence = 'low';

    return forecast;
  }

  linearForecast(data, periods) {
    const n = data.length;
    const x = Array.from({length: n}, (_, i) => i + 1);
    const y = data;

    // Calcular regresión lineal
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast = [];
    for (let i = 1; i <= periods; i++) {
      const futureMonth = new Date();
      futureMonth.setMonth(futureMonth.getMonth() + i);
      
      forecast.push({
        month: `${futureMonth.getFullYear()}-${String(futureMonth.getMonth() + 1).padStart(2, '0')}`,
        predicted: Math.max(0, slope * (n + i) + intercept),
        confidence: 'medium',
        method: 'linear_regression'
      });
    }

    return forecast;
  }

  exponentialSmoothing(data, periods, alpha = 0.3) {
    const forecast = [];
    let lastValue = data[data.length - 1];

    for (let i = 1; i <= periods; i++) {
      const futureMonth = new Date();
      futureMonth.setMonth(futureMonth.getMonth() + i);
      
      // Simple exponential smoothing
      const predicted = lastValue * alpha + (1 - alpha) * (data[data.length - 2] || lastValue);
      
      forecast.push({
        month: `${futureMonth.getFullYear()}-${String(futureMonth.getMonth() + 1).padStart(2, '0')}`,
        predicted: Math.max(0, predicted),
        confidence: 'medium',
        method: 'exponential_smoothing'
      });
      
      lastValue = predicted;
    }

    return forecast;
  }

  seasonalForecast(data, periods, includeSeasonality) {
    // Detectar estacionalidad (asumiendo ciclo de 12 meses)
    const seasonalPeriod = Math.min(12, data.length);
    const seasonal = [];
    
    for (let i = 0; i < seasonalPeriod; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = i; j < data.length; j += seasonalPeriod) {
        sum += data[j];
        count++;
      }
      
      seasonal[i] = count > 0 ? sum / count : data[i] || 0;
    }

    const forecast = [];
    const trend = this.calculateTrend(data);

    for (let i = 1; i <= periods; i++) {
      const futureMonth = new Date();
      futureMonth.setMonth(futureMonth.getMonth() + i);
      
      const seasonalIndex = (i - 1) % seasonalPeriod;
      const seasonalFactor = includeSeasonality ? seasonal[seasonalIndex] : 1;
      const trendComponent = data[data.length - 1] + (trend * i);
      
      forecast.push({
        month: `${futureMonth.getFullYear()}-${String(futureMonth.getMonth() + 1).padStart(2, '0')}`,
        predicted: Math.max(0, trendComponent * (seasonalFactor / (data.reduce((a, b) => a + b, 0) / data.length))),
        confidence: includeSeasonality ? 'high' : 'medium',
        method: 'seasonal_decomposition',
        seasonalFactor: seasonalFactor
      });
    }

    return forecast;
  }

  calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const midpoint = Math.floor(n / 2);
    const firstHalf = data.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
    const secondHalf = data.slice(midpoint).reduce((a, b) => a + b, 0) / (n - midpoint);
    
    return (secondHalf - firstHalf) / midpoint;
  }

  calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  }

  calculateForecastMetrics(historical, forecast) {
    return {
      historicalMean: historical.reduce((sum, d) => sum + d.production, 0) / historical.length,
      forecastMean: forecast.reduce((sum, f) => sum + f.predicted, 0) / forecast.length,
      historicalVariance: this.calculateVariance(historical.map(d => d.production)),
      trendDirection: forecast.length > 1 ? 
        (forecast[forecast.length - 1].predicted > forecast[0].predicted ? 'increasing' : 'decreasing') : 'stable'
    };
  }

  // ============================================================================
  // 📊 GENERACIÓN DE REPORTES ESPECIALIZADOS
  // ============================================================================

  async generateComparativeExcel(data, type, periods) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    workbook.creator = 'Sistema ANM FRI - Reportes Avanzados';
    workbook.created = new Date();
    workbook.subject = `Reporte Comparativo ${type} - ${periods.map(p => p.name).join(' vs ')}`;

    // Hoja de resumen comparativo
    const summarySheet = workbook.addWorksheet('Resumen Comparativo');
    await this.createComparativeSummarySheet(summarySheet, data);

    // Hoja de análisis detallado
    const analysisSheet = workbook.addWorksheet('Análisis Detallado');
    await this.createComparativeAnalysisSheet(analysisSheet, data);

    // Hoja de gráficos (datos para gráficos)
    const chartsSheet = workbook.addWorksheet('Datos para Gráficos');
    await this.createComparativeChartsSheet(chartsSheet, data);

    return workbook;
  }

  async createComparativeSummarySheet(worksheet, data) {
    // Título principal
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `📊 ANÁLISIS COMPARATIVO - ${data.type.toUpperCase()}`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E7D32' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Headers de comparación
    const headers = ['Métrica', ...data.periods];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(3, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1976D2' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Datos comparativos
    const metrics = [
      'Total Registros',
      'Producción Total (Ton)',
      'Promedio Producción',
      'Total Horas Operativas',
      'Eficiencia (Ton/Hora)',
      'Minerales Únicos'
    ];

    metrics.forEach((metric, rowIndex) => {
      const row = rowIndex + 4;
      worksheet.getCell(row, 1).value = metric;
      worksheet.getCell(row, 1).font = { bold: true };

      data.periods.forEach((period, colIndex) => {
        const periodData = data.data[period];
        let value;

        switch (metric) {
          case 'Total Registros':
            value = periodData.totalRecords;
            break;
          case 'Producción Total (Ton)':
            value = periodData.totalProduction.toFixed(2);
            break;
          case 'Promedio Producción':
            value = periodData.averageProduction.toFixed(2);
            break;
          case 'Total Horas Operativas':
            value = periodData.totalHours.toFixed(2);
            break;
          case 'Eficiencia (Ton/Hora)':
            value = periodData.efficiency.toFixed(4);
            break;
          case 'Minerales Únicos':
            value = periodData.uniqueMinerals;
            break;
          default:
            value = 'N/A';
        }

        const cell = worksheet.getCell(row, colIndex + 2);
        cell.value = value;
        cell.alignment = { horizontal: 'right' };

        // Formato condicional para números
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          cell.numFmt = '#,##0.00';
        }
      });
    });

    // Configurar anchos de columna
    worksheet.columns = [
      { width: 25 },
      ...data.periods.map(() => ({ width: 15 }))
    ];
  }

  async generateForecastExcel(historical, forecast) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    workbook.creator = 'Sistema ANM FRI - Predicciones';
    workbook.created = new Date();
    workbook.subject = `Reporte de Predicción - ${forecast.method}`;

    // Hoja de predicciones
    const forecastSheet = workbook.addWorksheet('Predicciones');
    await this.createForecastSheet(forecastSheet, historical, forecast);

    // Hoja de datos históricos
    const historicalSheet = workbook.addWorksheet('Datos Históricos');
    await this.createHistoricalDataSheet(historicalSheet, historical);

    // Hoja de métricas
    const metricsSheet = workbook.addWorksheet('Métricas de Confianza');
    await this.createMetricsSheet(metricsSheet, forecast);

    return workbook;
  }

  async createForecastSheet(worksheet, historical, forecast) {
    // Título
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `🔮 PREDICCIONES - MÉTODO: ${forecast.method.toUpperCase()}`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9800' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Headers
    const headers = ['Mes', 'Producción Predicha', 'Confianza', 'Método', 'Factor Estacional'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(3, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F57C00' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Datos de predicción
    forecast.forecast.forEach((prediction, index) => {
      const row = index + 4;
      worksheet.getCell(row, 1).value = prediction.month;
      worksheet.getCell(row, 2).value = prediction.predicted.toFixed(2);
      worksheet.getCell(row, 2).numFmt = '#,##0.00';
      worksheet.getCell(row, 3).value = prediction.confidence;
      worksheet.getCell(row, 4).value = prediction.method;
      worksheet.getCell(row, 5).value = prediction.seasonalFactor?.toFixed(4) || 'N/A';
    });

    // Configurar anchos
    worksheet.columns = [
      { width: 12 }, { width: 18 }, { width: 12 }, { width: 20 }, { width: 18 }
    ];
  }

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

  // ============================================================================
  // 📊 REPORTES DE KPIs Y BENCHMARKING
  // ============================================================================

  generateKPIReport = async (req, res) => {
    try {
      console.log('📊 Generando reporte de KPIs avanzados...');

      const filters = this.buildFilters(req);
      const { period = 'month', benchmark = false } = req.query;

      const kpiData = await this.calculateAdvancedKPIs(filters, period);
      let benchmarkData = null;

      if (benchmark === 'true') {
        benchmarkData = await this.calculateBenchmarkData(filters);
      }

      const workbook = await this.generateKPIExcel(kpiData, benchmarkData, period);
      const buffer = await this.excelService.generateReportBuffer(workbook);
      
      const filename = `ANM_FRI_KPIs_${period}_${Date.now()}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      console.log(`✅ Reporte de KPIs generado: ${filename}`);
      res.send(buffer);

    } catch (error) {
      console.error('❌ Error generando reporte de KPIs:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte de KPIs',
        error: error.message
      });
    }
  };

  async calculateAdvancedKPIs(filters, period) {
    const data = await this.excelService.getProduccionData(filters);
    
    return {
      period,
      totalRecords: data.length,
      productionKPIs: this.calculateProductionKPIs(data),
      efficiencyKPIs: this.calculateEfficiencyKPIs(data),
      qualityKPIs: this.calculateQualityKPIs(data),
      complianceKPIs: this.calculateComplianceKPIs(data)
    };
  }

  calculateProductionKPIs(data) {
    const productions = data.map(d => parseFloat(d.cantidadProduccion) || 0);
    const total = productions.reduce((sum, p) => sum + p, 0);
    const avg = total / productions.length;
    const max = Math.max(...productions);
    const min = Math.min(...productions);

    return {
      total: total.toFixed(2),
      average: avg.toFixed(2),
      maximum: max.toFixed(2),
      minimum: min.toFixed(2),
      standardDeviation: this.calculateStandardDeviation(productions).toFixed(2),
      coefficient_of_variation: avg > 0 ? ((this.calculateStandardDeviation(productions) / avg) * 100).toFixed(2) : '0.00'
    };
  }

  calculateEfficiencyKPIs(data) {
    const efficiencies = data
      .filter(d => parseFloat(d.horasOperativas) > 0)
      .map(d => (parseFloat(d.cantidadProduccion) || 0) / parseFloat(d.horasOperativas));
    
    if (efficiencies.length === 0) {
      return { average: '0.00', maximum: '0.00', minimum: '0.00' };
    }

    return {
      average: (efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length).toFixed(4),
      maximum: Math.max(...efficiencies).toFixed(4),
      minimum: Math.min(...efficiencies).toFixed(4)
    };
  }

  calculateQualityKPIs(data) {
    const completenessScore = (data.filter(d => 
      d.cantidadProduccion && d.horasOperativas && d.mineral && d.tituloMinero
    ).length / data.length) * 100;

    return {
      completenessScore: completenessScore.toFixed(2),
      dataQualityGrade: completenessScore > 95 ? 'A' : completenessScore > 85 ? 'B' : completenessScore > 75 ? 'C' : 'D'
    };
  }

  calculateComplianceKPIs(data) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthData = data.filter(d => {
      const date = new Date(d.fechaCorteInformacion);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    return {
      currentMonthSubmissions: currentMonthData.length,
      onTimeSubmissionRate: '95.0', // Placeholder - would need actual deadline data
      complianceScore: 'Alto'
    };
  }

  calculateStandardDeviation(values) {
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  async generateKPIExcel(kpiData, benchmarkData, period) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    workbook.creator = 'Sistema ANM FRI - KPIs Avanzados';
    workbook.created = new Date();
    workbook.subject = `Reporte KPIs - Período: ${period}`;

    // Hoja principal de KPIs
    const kpiSheet = workbook.addWorkbook.addWorksheet('KPIs Principales');
    await this.createKPIMainSheet(kpiSheet, kpiData);

    if (benchmarkData) {
      const benchmarkSheet = workbook.addWorksheet('Benchmark');
      await this.createBenchmarkSheet(benchmarkSheet, kpiData, benchmarkData);
    }

    return workbook;
  }
}

module.exports = new AdvancedReportsController();