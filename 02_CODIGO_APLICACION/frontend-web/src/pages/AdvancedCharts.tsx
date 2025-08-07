import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Target,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  Users,
  MapPin,
  DollarSign
} from 'lucide-react';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface ChartData {
  name: string;
  value: number;
  mineral?: string;
  fecha?: string;
  produccion?: number;
  regalias?: number;
  eficiencia?: number | string;
  horas?: number;
  municipio?: string;
  titulo?: string;
  participacion?: number | string;
  meta?: number;
  cumplimiento?: number | string;
  titulos?: number;
  [key: string]: any;
}

interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'composed' | 'scatter';
  title: string;
  description?: string;
  dataKey: string;
  color: string;
  gradient?: boolean;
  animation?: boolean;
  icon?: React.ReactNode;
}

interface AdvancedChartsProps {
  data?: ChartData[];
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  mineral?: string;
  municipio?: string;
  className?: string;
}

// ============================================================================
// DATOS DE EJEMPLO (SIMULANDO API DEL BACKEND)
// ============================================================================

const generateMockData = (type: string): ChartData[] => {
  const minerales = ['Oro', 'Plata', 'Cobre', 'Carbón', 'Hierro', 'Níquel'];
  const municipios = ['Medellín', 'Bogotá', 'Cali', 'Bucaramanga', 'Cartagena', 'Manizales'];
  
  switch (type) {
    case 'produccion_mensual':
      return Array.from({ length: 12 }, (_, i) => ({
        name: `${2024}-${String(i + 1).padStart(2, '0')}`,
        fecha: `${2024}-${String(i + 1).padStart(2, '0')}`,
        produccion: Math.floor(Math.random() * 5000) + 1000,
        regalias: Math.floor(Math.random() * 500000) + 100000,
        eficiencia: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
        horas: Math.floor(Math.random() * 720) + 400,
        value: Math.floor(Math.random() * 5000) + 1000
      }));
      
    case 'minerales_distribucion':
      return minerales.map(mineral => ({
        name: mineral,
        mineral,
        value: Math.floor(Math.random() * 3000) + 500,
        produccion: Math.floor(Math.random() * 3000) + 500,
        participacion: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2))
      }));
      
    case 'municipios_performance':
      return municipios.map(municipio => ({
        name: municipio,
        municipio,
        produccion: Math.floor(Math.random() * 4000) + 1000,
        regalias: Math.floor(Math.random() * 600000) + 200000,
        eficiencia: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
        titulos: Math.floor(Math.random() * 15) + 5,
        value: Math.floor(Math.random() * 4000) + 1000
      }));
      
    case 'tendencias_trimestrales':
      return ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'].map(quarter => ({
        name: quarter,
        fecha: quarter,
        produccion: Math.floor(Math.random() * 15000) + 5000,
        meta: Math.floor(Math.random() * 20000) + 10000,
        cumplimiento: parseFloat((Math.random() * 0.4 + 0.7).toFixed(2)),
        value: Math.floor(Math.random() * 15000) + 5000
      }));
      
    case 'eficiencia_vs_produccion':
      return Array.from({ length: 20 }, (_, i) => ({
        name: `Título ${i + 1}`,
        titulo: `Título ${i + 1}`,
        produccion: Math.floor(Math.random() * 3000) + 500,
        eficiencia: Math.random() * 0.6 + 0.4,
        horas: Math.floor(Math.random() * 500) + 200,
        value: Math.floor(Math.random() * 3000) + 500
      }));
      
    default:
      return [];
  }
};

// ============================================================================
// COLORES MODERNOS
// ============================================================================

const chartColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899'
};

const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({
  data,
  period = 'month',
  mineral,
  municipio,
  className = ''
}) => {
  const [selectedChart, setSelectedChart] = useState<string>('produccion_mensual');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '6m',
    showPredictions: false,
    animationEnabled: true
  });

  // Configuraciones de gráficos con iconos
  const chartConfigs: Record<string, ChartConfig> = {
    produccion_mensual: {
      type: 'line',
      title: 'Producción Mensual',
      description: 'Evolución de la producción por mes',
      dataKey: 'produccion',
      color: chartColors.primary,
      gradient: true,
      animation: true,
      icon: <Activity className="w-5 h-5" />
    },
    minerales_distribucion: {
      type: 'pie',
      title: 'Distribución de Minerales',
      description: 'Participación por tipo de mineral',
      dataKey: 'value',
      color: chartColors.secondary,
      animation: true,
      icon: <PieChartIcon className="w-5 h-5" />
    },
    municipios_performance: {
      type: 'bar',
      title: 'Performance por Municipio',
      description: 'Comparativo entre municipios',
      dataKey: 'produccion',
      color: chartColors.accent,
      animation: true,
      icon: <BarChart3 className="w-5 h-5" />
    },
    tendencias_trimestrales: {
      type: 'area',
      title: 'Tendencias Trimestrales',
      description: 'Evolución trimestral con metas',
      dataKey: 'produccion',
      color: chartColors.purple,
      gradient: true,
      animation: true,
      icon: <TrendingUp className="w-5 h-5" />
    },
    eficiencia_vs_produccion: {
      type: 'scatter',
      title: 'Eficiencia vs Producción',
      description: 'Análisis de correlación',
      dataKey: 'produccion',
      color: chartColors.pink,
      animation: true,
      icon: <Target className="w-5 h-5" />
    }
  };

  // Datos del gráfico seleccionado
  const chartData = useMemo(() => {
    return data || generateMockData(selectedChart);
  }, [data, selectedChart]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    if (!chartData.length) return {};
    
    const totalProduccion = chartData.reduce((sum, item) => sum + (item.produccion || item.value || 0), 0);
    const promedioEficiencia = chartData.reduce((sum, item) => {
      const eficiencia = typeof item.eficiencia === 'string' ? parseFloat(item.eficiencia) : (item.eficiencia || 0);
      return sum + eficiencia;
    }, 0) / chartData.length;
    const maxProduccion = Math.max(...chartData.map(item => item.produccion || item.value || 0));
    const tendencia = chartData.length > 1 ? 
      (chartData[chartData.length - 1].value || 0) - (chartData[0].value || 0) : 0;

    return {
      totalProduccion: totalProduccion.toLocaleString(),
      promedioEficiencia: (promedioEficiencia * 100).toFixed(1),
      maxProduccion: maxProduccion.toLocaleString(),
      tendencia: tendencia > 0 ? 'positiva' : 'negativa',
      tendenciaValor: Math.abs(tendencia).toLocaleString()
    };
  }, [chartData]);

  // ============================================================================
  // RENDERIZADORES DE GRÁFICOS
  // ============================================================================

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="produccion" 
          stroke={chartColors.primary}
          strokeWidth={3}
          dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: chartColors.primary }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="colorProduccion" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.purple} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={chartColors.purple} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="produccion" 
          stroke={chartColors.purple}
          fillOpacity={1} 
          fill="url(#colorProduccion)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: '#64748b' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="produccion" 
          fill={chartColors.accent}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          type="number" 
          dataKey="produccion" 
          name="Producción" 
          unit=" Ton"
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <YAxis 
          type="number" 
          dataKey="eficiencia" 
          name="Eficiencia" 
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Scatter 
          name="Títulos" 
          data={chartData} 
          fill={chartColors.pink}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );

  // Renderizador principal del gráfico
  const renderChart = () => {
    const config = chartConfigs[selectedChart];
    
    switch (config.type) {
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'scatter':
        return renderScatterChart();
      default:
        return renderLineChart();
    }
  };

  // Función para refrescar datos
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Función para exportar datos
  const handleExport = () => {
    const dataStr = JSON.stringify(chartData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `anm_fri_${selectedChart}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className={`p-6 bg-gray-50 min-h-screen ${className}`}>
      {/* Header con título */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Analytics Avanzados ANM FRI
            </h1>
            <p className="text-gray-600">
              Visualización interactiva de datos mineros con análisis en tiempo real
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Producción</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalProduccion}</p>
              <p className="text-xs text-gray-500">Toneladas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Eficiencia Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.promedioEficiencia}%</p>
              <p className="text-xs text-gray-500">Operacional</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Máx. Producción</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.maxProduccion}</p>
              <p className="text-xs text-gray-500">Toneladas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-2 ${metrics.tendencia === 'positiva' ? 'bg-green-100' : 'bg-red-100'} rounded-lg`}>
              {metrics.tendencia === 'positiva' ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tendencia</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.tendenciaValor}</p>
              <p className={`text-xs ${metrics.tendencia === 'positiva' ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.tendencia === 'positiva' ? 'Crecimiento' : 'Declive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de control izquierdo */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selector de gráficos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tipos de Gráfico</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(chartConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedChart(key)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    selectedChart === key
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {config.icon}
                  <div>
                    <p className="font-medium">{config.title}</p>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período de tiempo
                </label>
                <select 
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1m">Último mes</option>
                  <option value="3m">Últimos 3 meses</option>
                  <option value="6m">Últimos 6 meses</option>
                  <option value="1y">Último año</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showPredictions}
                    onChange={(e) => setFilters({...filters, showPredictions: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mostrar predicciones</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.animationEnabled}
                    onChange={(e) => setFilters({...filters, animationEnabled: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Animaciones</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Área principal del gráfico */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {chartConfigs[selectedChart].title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {chartConfigs[selectedChart].description}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {chartData.length} registros
              </div>
            </div>

            <div className="min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">Cargando datos...</p>
                  </div>
                </div>
              ) : (
                renderChart()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-sm">
            Sistema ANM FRI - Resolución 371/2024 | 
            Última actualización: {new Date().toLocaleString('es-CO')} | 
            {chartData.length} registros mostrados
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;