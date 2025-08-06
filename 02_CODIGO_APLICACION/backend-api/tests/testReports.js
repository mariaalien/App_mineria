// ================================
// 📁 tests/testReports.js - SCRIPT DE PRUEBAS PARA REPORTES
// ================================
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const TEST_TOKEN = 'your_jwt_token_here'; // Reemplazar con token real

class ReportsTestSuite {
  constructor() {
    this.results = [];
    this.outputDir = path.join(__dirname, '../test-outputs');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando suite de pruebas para reportes ANM FRI...\n');

    await this.testHealthCheck();
    await this.testAvailableReports();
    await this.testReportPreviews();
    await this.testExcelReports();
    await this.testPDFReports();
    await this.testUnifiedEndpoint();
    await this.testAdvancedReports(); // ← NUEVO
    await this.testAnalytics();

    this.printResults();
  }

  async testHealthCheck() {
    console.log('🔍 Testing: Health Check del Sistema de Reportes');
    
    try {
      const response = await this.makeRequest('GET', '/api/reports/health');
      
      this.addResult('Health Check', true, {
        status: response.status,
        data: response.data
      });

      console.log('✅ Health Check: OK\n');

    } catch (error) {
      this.addResult('Health Check', false, error.message);
      console.log('❌ Health Check: FAILED\n');
    }
  }

  async testAvailableReports() {
    console.log('📋 Testing: Reportes Disponibles');
    
    try {
      const response = await this.makeRequest('GET', '/api/reports/available');
      
      this.addResult('Available Reports', true, {
        excelReports: response.data.data.excel?.length || 0,
        pdfReports: response.data.data.pdf?.length || 0,
        userRole: response.data.userRole
      });

      console.log(`✅ Reportes Disponibles: ${response.data.data.excel?.length || 0} Excel, ${response.data.data.pdf?.length || 0} PDF\n`);

    } catch (error) {
      this.addResult('Available Reports', false, error.message);
      console.log('❌ Reportes Disponibles: FAILED\n');
    }
  }

  async testReportPreviews() {
    console.log('👀 Testing: Previews de Reportes');
    
    const previewTypes = ['produccion', 'ejecutivo', 'inventarios'];
    
    for (const type of previewTypes) {
      try {
        const response = await this.makeRequest('GET', `/api/reports/preview/${type}`);
        
        this.addResult(`Preview ${type}`, true, {
          totalRegistros: response.data.data.totalRegistros,
          hasData: !!response.data.data.sample
        });

        console.log(`✅ Preview ${type}: ${response.data.data.totalRegistros || 0} registros`);

      } catch (error) {
        this.addResult(`Preview ${type}`, false, error.message);
        console.log(`❌ Preview ${type}: FAILED`);
      }
    }
    console.log();
  }

  async testExcelReports() {
    console.log('📊 Testing: Reportes Excel');
    
    const excelTests = [
      { endpoint: '/api/reports/excel/produccion', name: 'Producción Excel' },
      { endpoint: '/api/reports/excel/consolidado', name: 'Consolidado Excel' }
    ];

    for (const test of excelTests) {
      try {
        const response = await this.makeRequest('GET', test.endpoint, {
          responseType: 'arraybuffer'
        });

        // Guardar archivo de prueba
        const filename = `test_${test.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.xlsx`;
        const filepath = path.join(this.outputDir, filename);
        fs.writeFileSync(filepath, response.data);

        this.addResult(test.name, true, {
          fileSize: response.data.length,
          savedTo: filepath,
          contentType: response.headers['content-type']
        });

        console.log(`✅ ${test.name}: ${(response.data.length / 1024).toFixed(2)} KB generado`);

      } catch (error) {
        this.addResult(test.name, false, error.message);
        console.log(`❌ ${test.name}: FAILED`);
      }
    }
    console.log();
  }

  async testPDFReports() {
    console.log('📄 Testing: Reportes PDF');
    
    try {
      const response = await this.makeRequest('GET', '/api/reports/pdf/ejecutivo', {
        responseType: 'arraybuffer'
      });

      // Guardar archivo de prueba
      const filename = `test_ejecutivo_${Date.now()}.pdf`;
      const filepath = path.join(this.outputDir, filename);
      fs.writeFileSync(filepath, response.data);

      this.addResult('PDF Ejecutivo', true, {
        fileSize: response.data.length,
        savedTo: filepath,
        contentType: response.headers['content-type']
      });

      console.log(`✅ PDF Ejecutivo: ${(response.data.length / 1024).toFixed(2)} KB generado\n`);

    } catch (error) {
      this.addResult('PDF Ejecutivo', false, error.message);
      console.log('❌ PDF Ejecutivo: FAILED\n');
    }
  }

  async testUnifiedEndpoint() {
    console.log('🎯 Testing: Endpoint Unificado');
    
    const unifiedTests = [
      { type: 'produccion', format: 'excel' },
      { type: 'ejecutivo', format: 'pdf' }
    ];

    for (const test of unifiedTests) {
      try {
        const response = await this.makeRequest('GET', 
          `/api/reports/${test.type}/${test.format}`, {
          responseType: 'arraybuffer'
        });

        // Guardar archivo de prueba
        const filename = `test_unified_${test.type}_${test.format}_${Date.now()}.${test.format === 'excel' ? 'xlsx' : 'pdf'}`;
        const filepath = path.join(this.outputDir, filename);
        fs.writeFileSync(filepath, response.data);

        this.addResult(`Unified ${test.type} ${test.format}`, true, {
          fileSize: response.data.length,
          savedTo: filepath
        });

        console.log(`✅ Unified ${test.type} ${test.format}: ${(response.data.length / 1024).toFixed(2)} KB`);

      } catch (error) {
        this.addResult(`Unified ${test.type} ${test.format}`, false, error.message);
        console.log(`❌ Unified ${test.type} ${test.format}: FAILED`);
      }
    }
    console.log();
  }

  async testAdvancedReports() {
    console.log('🚀 Testing: Reportes Avanzados');
    
    // Test reporte comparativo
    try {
      const comparativePayload = {
        type: 'produccion',
        periods: [
          {
            name: 'Enero 2024',
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          },
          {
            name: 'Febrero 2024',
            startDate: '2024-02-01',
            endDate: '2024-02-29'
          }
        ],
        compareBy: 'month',
        format: 'excel'
      };

      const response = await this.makeRequest('POST', '/api/reports/advanced/comparative', {
        data: comparativePayload,
        responseType: 'arraybuffer'
      });

      const filename = `test_comparative_${Date.now()}.xlsx`;
      const filepath = path.join(this.outputDir, filename);
      fs.writeFileSync(filepath, response.data);

      this.addResult('Reporte Comparativo', true, {
        fileSize: response.data.length,
        savedTo: filepath,
        periods: comparativePayload.periods.length
      });

      console.log(`✅ Reporte Comparativo: ${(response.data.length / 1024).toFixed(2)} KB generado`);

    } catch (error) {
      this.addResult('Reporte Comparativo', false, error.message);
      console.log('❌ Reporte Comparativo: FAILED');
    }

    // Test reporte de predicciones
    try {
      const response = await this.makeRequest('GET', '/api/reports/advanced/forecast?forecastMonths=6&method=linear&format=excel', {
        responseType: 'arraybuffer'
      });

      const filename = `test_forecast_${Date.now()}.xlsx`;
      const filepath = path.join(this.outputDir, filename);
      fs.writeFileSync(filepath, response.data);

      this.addResult('Reporte Forecast', true, {
        fileSize: response.data.length,
        savedTo: filepath,
        method: 'linear',
        months: 6
      });

      console.log(`✅ Reporte Forecast: ${(response.data.length / 1024).toFixed(2)} KB generado`);

    } catch (error) {
      this.addResult('Reporte Forecast', false, error.message);
      console.log('❌ Reporte Forecast: FAILED');
    }

    // Test reporte de KPIs avanzados
    try {
      const response = await this.makeRequest('GET', '/api/reports/advanced/kpis?period=month&benchmark=true', {
        responseType: 'arraybuffer'
      });

      const filename = `test_kpis_advanced_${Date.now()}.xlsx`;
      const filepath = path.join(this.outputDir, filename);
      fs.writeFileSync(filepath, response.data);

      this.addResult('KPIs Avanzados', true, {
        fileSize: response.data.length,
        savedTo: filepath,
        benchmark: true
      });

      console.log(`✅ KPIs Avanzados: ${(response.data.length / 1024).toFixed(2)} KB generado`);

    } catch (error) {
      this.addResult('KPIs Avanzados', false, error.message);
      console.log('❌ KPIs Avanzados: FAILED');
    }

    console.log();
  }

  async testAnalytics() {
    console.log('📈 Testing: Analytics y Estadísticas');
    
    try {
      // Test estadísticas de producción
      const statsResponse = await this.makeRequest('GET', '/api/reports/stats/production');
      
      this.addResult('Production Stats', true, {
        hasData: !!statsResponse.data.data,
        totalRegistros: statsResponse.data.data?.resumen?.total || 0
      });

      console.log(`✅ Production Stats: ${statsResponse.data.data?.resumen?.total || 0} registros`);

      // Test análisis de tendencias
      const trendsResponse = await this.makeRequest('GET', '/api/reports/analytics/trends?timeframe=6m');
      
      this.addResult('Trends Analysis', true, {
        periodsAnalyzed: trendsResponse.data.data?.trends?.length || 0,
        timeframe: trendsResponse.data.data?.timeframe
      });

      console.log(`✅ Trends Analysis: ${trendsResponse.data.data?.trends?.length || 0} períodos analizados\n`);

    } catch (error) {
      this.addResult('Analytics', false, error.message);
      console.log('❌ Analytics: FAILED\n');
    }
  }

  async makeRequest(method, url, options = {}) {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000, // 30 segundos
      ...options
    };

    return await axios(config);
  }

  addResult(test, success, details = null) {
    this.results.push({
      test,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS - SISTEMA DE REPORTES ANM FRI');
    console.log('='.repeat(60));

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    console.log(`✅ Pruebas exitosas: ${successful}`);
    console.log(`❌ Pruebas fallidas: ${failed}`);
    console.log(`📊 Total: ${this.results.length}`);
    console.log(`🎯 Tasa de éxito: ${((successful / this.results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ PRUEBAS FALLIDAS:');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   • ${result.test}: ${result.details}`);
        });
    }

    console.log('\n✅ ARCHIVOS GENERADOS:');
    console.log(`   📁 Directorio: ${this.outputDir}`);
    
    const files = fs.readdirSync(this.outputDir).filter(f => f.startsWith('test_'));
    files.forEach(file => {
      const stats = fs.statSync(path.join(this.outputDir, file));
      console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

    console.log('\n🎉 Suite de pruebas completada!');
    console.log('='.repeat(60) + '\n');

    // Guardar resultados en archivo JSON
    const resultsFile = path.join(this.outputDir, `test_results_${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify({
      summary: {
        total: this.results.length,
        successful,
        failed,
        successRate: (successful / this.results.length) * 100
      },
      results: this.results,
      generatedFiles: files,
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`💾 Resultados guardados en: ${resultsFile}`);
  }
}

// ============================================================================
// 🚀 EJECUCIÓN DEL SCRIPT
// ============================================================================

async function main() {
  if (process.argv.length < 3) {
    console.log('❌ Uso: node testReports.js <JWT_TOKEN>');
    console.log('   Ejemplo: node testReports.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    process.exit(1);
  }

  const token = process.argv[2];
  const testSuite = new ReportsTestSuite();
  testSuite.constructor.prototype.constructor.TEST_TOKEN = token;

  try {
    await testSuite.runAllTests();
  } catch (error) {
    console.error('💥 Error ejecutando suite de pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

module.exports = ReportsTestSuite;