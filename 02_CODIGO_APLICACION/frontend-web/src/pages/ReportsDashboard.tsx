import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer as RechartsContainer, LineChart, Line, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  FadeIn, 
  AnimatedButton, 
  AnimatedCard, 
  StaggeredList, 
  PremiumSpinner,
  PageTransition,
  AnimationStyles,
  useAnimations
} from '../hooks/useAnimations';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Truck,
  Download,
  RefreshCw,
  FileText,
  Activity,
  Calendar,
  Filter,
  Eye,
  Clock,
  Bell,
  ArrowRight,
  Plus,
  Users,
  PieChart as PieChartIcon,
  Target,
  Zap,
  Shield,
  Globe,
  Cpu,
  Award
} from 'lucide-react';

// ============================================================================
// HOOK SIMPLE PARA TEMA (TEMPORAL)
// ============================================================================

const useSimpleTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return { theme, toggleTheme };
};

const useSimpleResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width < 1024 && windowSize.width >= 768,
    isDesktop: windowSize.width >= 1024,
  };
};

// ============================================================================
// DATOS MOCK ACTUALIZADOS CON FORMATO DASHBOARD ANM
// ============================================================================

interface ReportData {
  mes: string;
  produccion: number;
  ingresos: number;
  exportaciones: number;
  inventario: number;
  periodo: string;
}

const mockReportData: ReportData[] = [
  { mes: 'Ene', produccion: 2847, ingresos: 45600000, exportaciones: 1825, inventario: 8954, periodo: '2024-01' },
  { mes: 'Feb', produccion: 3156, ingresos: 52300000, exportaciones: 2145, inventario: 9234, periodo: '2024-02' },
  { mes: 'Mar', produccion: 2934, ingresos: 48900000, exportaciones: 1967, inventario: 8876, periodo: '2024-03' },
  { mes: 'Abr', produccion: 3421, ingresos: 56800000, exportaciones: 2298, inventario: 9567, periodo: '2024-04' },
  { mes: 'May', produccion: 3689, ingresos: 61200000, exportaciones: 2456, inventario: 9888, periodo: '2024-05' },
  { mes: 'Jun', produccion: 3234, ingresos: 53700000, exportaciones: 2123, inventario: 9345, periodo: '2024-06' }
];

const kpiMetrics = [
  {
    id: 'produccion',
    titulo: 'Producción Total',
    valor: '19,281 Ton',
    valorNumerico: 19281,
    cambio: 15.7,
    icono: BarChart3,
    gradiente: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    periodo: 'Semestre I 2024'
  },
  {
    id: 'ingresos',
    titulo: 'Ingresos Totales',
    valor: '$318.5M COP',
    valorNumerico: 318500000,
    cambio: 22.4,
    icono: DollarSign,
    gradiente: 'linear-gradient(135deg, #10b981, #047857)',
    periodo: 'Semestre I 2024'
  },
  {
    id: 'exportaciones',
    titulo: 'Exportaciones',
    valor: '12,814 Ton',
    valorNumerico: 12814,
    cambio: 8.9,
    icono: Truck,
    gradiente: 'linear-gradient(135deg, #f59e0b, #d97706)',
    periodo: 'Semestre I 2024'
  },
  {
    id: 'inventario',
    titulo: 'Inventario Actual',
    valor: '55,864 Ton',
    valorNumerico: 55864,
    cambio: -3.2,
    icono: Package,
    gradiente: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    periodo: 'Al 30/Jun/2024'
  },
  {
    id: 'reportes',
    titulo: 'Reportes FRI',
    valor: '1,242',
    valorNumerico: 1242,
    cambio: 25.7,
    icono: FileText,
    gradiente: 'linear-gradient(135deg, #22c55e, #16a34a)',
    periodo: 'Generados este mes'
  },
  {
    id: 'eficiencia',
    titulo: 'Eficiencia Op.',
    valor: '96.8%',
    valorNumerico: 96.8,
    cambio: 4.2,
    icono: Target,
    gradiente: 'linear-gradient(135deg, #6366f1, #4338ca)',
    periodo: 'Promedio mensual'
  }
];

const recentActivity = [
  {
    id: '1',
    type: 'critical',
    user: 'Sistema ANM',
    action: 'Alerta: Reporte FRI Q3 requiere revisión urgente',
    time: 'Hace 5 minutos',
    status: 'critical'
  },
  {
    id: '2',
    type: 'create',
    user: 'María González',
    action: 'Creó nuevo FRI de Producción Mensual - Mina El Dorado',
    time: 'Hace 15 minutos',
    status: 'success',
    avatar: 'MG'
  },
  {
    id: '3',
    type: 'approval',
    user: 'Carlos Rodríguez',
    action: 'Aprobó FRI Trimestral Q3 - Zona Norte',
    time: 'Hace 45 minutos',
    status: 'success',
    avatar: 'CR'
  },
  {
    id: '4',
    type: 'report',
    user: 'Ana Martínez',
    action: 'Generó reporte consolidado de exportaciones',
    time: 'Hace 1 hora',
    status: 'success',
    avatar: 'AM'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL CON ESTILO ANM DASHBOARD
// ============================================================================

const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme } = useSimpleTheme();
  const { isMobile, isTablet } = useSimpleResponsive();

  // =========================================================================
  // EFECTOS Y FUNCIONES
  // =========================================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus style={{ width: '16px', height: '16px', color: '#059669' }} />;
      case 'update':
        return <Eye style={{ width: '16px', height: '16px', color: '#2563eb' }} />;
      case 'report':
        return <FileText style={{ width: '16px', height: '16px', color: '#7c3aed' }} />;
      case 'approval':
        return <Award style={{ width: '16px', height: '16px', color: '#16a34a' }} />;
      case 'critical':
        return <Bell style={{ width: '16px', height: '16px', color: '#dc2626' }} />;
      default:
        return <Activity style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'success':
        return { background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
      case 'warning':
        return { background: '#fed7aa', color: '#9a3412', border: '1px solid #fdba74' };
      case 'critical':
        return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
      default:
        return { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' };
    }
  };

  // =========================================================================
  // RENDERIZADO PRINCIPAL CON ESTILO ANM
  // =========================================================================

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <AnimationStyles />
      
      {/* HEADER PRINCIPAL CON ESTILO ANM */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          
          {/* Logo y título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                background: '#22c55e',
                borderRadius: '50%',
                border: '2px solid white',
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 4px 0'
              }}>
                Dashboard de Reportes FRI
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontWeight: '500'
              }}>
                Análisis y reportes del Sistema ANM - Resolución 371/2024
              </p>
            </div>
          </div>

          {/* Acciones del header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#6b7280',
              background: '#f9fafb',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <Clock style={{ width: '16px', height: '16px' }} />
              <span style={{ fontWeight: '500' }}>
                {currentTime.toLocaleDateString('es-CO', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span style={{ fontSize: '12px', opacity: 0.75 }}>
                {currentTime.toLocaleTimeString('es-CO', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(37, 99, 235, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(37, 99, 235, 0.3)';
                }
              }}
            >
              <RefreshCw style={{
                width: '16px',
                height: '16px',
                animation: isLoading ? 'spin 1s linear infinite' : 'none'
              }} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>
                {isLoading ? 'Actualizando...' : 'Actualizar'}
              </span>
            </button>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.3)';
            }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Excel</span>
            </button>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.3)';
            }}
            >
              <FileText style={{ width: '16px', height: '16px' }} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 20px'
      }}>
        
        {/* MÉTRICAS PRINCIPALES CON ESTILO ANM */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 
                             isTablet ? 'repeat(2, 1fr)' : 
                             'repeat(6, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          
          {/* KPIs con diseño premium */}
          {kpiMetrics.map((metric, index) => {
            const IconComponent = metric.icono;
            const isWide = index === 0; // Primera métrica ocupa más espacio
            
            return (
              <div 
                key={metric.id}
                style={{
                  gridColumn: (isWide && !isMobile && !isTablet) ? 'span 2' : 'span 1',
                  background: metric.gradiente,
                  borderRadius: '20px',
                  padding: '24px',
                  color: 'white',
                  boxShadow: `0 10px 40px ${metric.gradiente.includes('#3b82f6') ? 'rgba(59, 130, 246, 0.3)' : 
                                            metric.gradiente.includes('#10b981') ? 'rgba(16, 185, 129, 0.3)' :
                                            metric.gradiente.includes('#f59e0b') ? 'rgba(245, 158, 11, 0.3)' :
                                            metric.gradiente.includes('#8b5cf6') ? 'rgba(139, 92, 246, 0.3)' :
                                            metric.gradiente.includes('#22c55e') ? 'rgba(34, 197, 94, 0.3)' :
                                            'rgba(99, 102, 241, 0.3)'}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = e.currentTarget.style.boxShadow.replace('0.3)', '0.4)');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = e.currentTarget.style.boxShadow.replace('0.4)', '0.3)');
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: isWide ? '16px' : '12px' 
                }}>
                  <div style={{
                    padding: isWide ? '12px' : '8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: isWide ? '12px' : '8px'
                  }}>
                    <IconComponent style={{ 
                      width: isWide ? '28px' : '20px', 
                      height: isWide ? '28px' : '20px' 
                    }} />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    color: 'rgba(255, 255, 255, 0.8)' 
                  }}>
                    {metric.cambio >= 0 ? (
                      <TrendingUp style={{ width: '16px', height: '16px' }} />
                    ) : (
                      <TrendingDown style={{ width: '16px', height: '16px' }} />
                    )}
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {metric.cambio >= 0 ? '+' : ''}{metric.cambio}%
                    </span>
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: isWide ? '12px' : '10px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0 0 4px 0',
                  letterSpacing: '0.5px'
                }}>
                  {metric.titulo.toUpperCase()}
                </h3>
                
                <p style={{
                  fontSize: isWide ? '36px' : '24px',
                  fontWeight: 'bold',
                  margin: '0 0 4px 0'
                }}>
                  {metric.valor}
                </p>
                
                <p style={{
                  fontSize: isWide ? '12px' : '10px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0
                }}>
                  {metric.periodo}
                </p>
              </div>
            );
          })}
        </div>

        {/* GRID PRINCIPAL CON DISEÑO ANM */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: '32px'
        }}>
          
          {/* GRÁFICOS PRINCIPALES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Gráfico de Producción */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '24px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '8px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '12px'
                  }}>
                    <BarChart3 style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      Producción Mensual
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Toneladas producidas por mes
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ height: '300px', width: '100%' }}>
                {isLoading ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #f3f4f6',
                      borderTop: '3px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando datos...</p>
                  </div>
                ) : (
                  <RechartsContainer width="100%" height="100%">
                    <BarChart data={mockReportData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#6b7280"
                        fontSize={12}
                        fontWeight={500}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        fontWeight={500}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="produccion" 
                        fill="#3b82f6" 
                        name="Producción (Ton)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </RechartsContainer>
                )}
              </div>
            </div>

            {/* Gráfico de Ingresos vs Exportaciones */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '24px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '8px',
                    background: 'linear-gradient(135deg, #10b981, #22c55e)',
                    borderRadius: '12px'
                  }}>
                    <Activity style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      Ingresos vs Exportaciones
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Comparación mensual
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ height: '300px', width: '100%' }}>
                {isLoading ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #f3f4f6',
                      borderTop: '3px solid #10b981',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando datos...</p>
                  </div>
                ) : (
                  <RechartsContainer width="100%" height="100%">
                    <LineChart data={mockReportData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#6b7280"
                        fontSize={12}
                        fontWeight={500}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        fontWeight={500}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ingresos" 
                        stroke="#10b981" 
                        name="Ingresos (COP)"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="exportaciones" 
                        stroke="#f59e0b" 
                        name="Exportaciones (Ton)"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </RechartsContainer>
                )}
              </div>
            </div>
          </div>

          {/* PANEL LATERAL CON ACTIVIDAD Y ACCIONES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Actividad Reciente */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '8px',
                      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                      borderRadius: '12px'
                    }}>
                      <Activity style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        Actividad Reciente
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        Últimas acciones
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '350px',
                overflowY: 'auto'
              }}>
                {recentActivity.map((activity) => (
                  <div key={activity.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    border: '1px solid #f3f4f6',
                    background: activity.status === 'critical' ? '#fef2f2' : '#f9fafb',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = activity.status === 'critical' ? '#fee2e2' : 'white';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = activity.status === 'critical' ? '#fef2f2' : '#f9fafb';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    
                    {/* Avatar o ícono */}
                    <div style={{ flexShrink: 0 }}>
                      {activity.avatar ? (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '12px'
                        }}>
                          {activity.avatar}
                        </div>
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: '#f3f4f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getActivityIcon(activity.type)}
                        </div>
                      )}
                    </div>
                    
                    {/* Contenido */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {activity.user}
                        </p>
                        <span style={{
                          ...getStatusStyle(activity.status),
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '500',
                          borderRadius: '12px',
                          flexShrink: 0
                        }}>
                          {activity.status === 'success' ? '✓' : 
                           activity.status === 'critical' ? '!' : '•'}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 6px 0',
                        lineHeight: '1.4'
                      }}>
                        {activity.action}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        margin: 0
                      }}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  padding: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  borderRadius: '12px'
                }}>
                  <Zap style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    Acciones Rápidas
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Operaciones frecuentes
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: Plus, label: 'Nuevo Reporte FRI', bgColor: '#eff6ff', textColor: '#1d4ed8', hoverBg: '#dbeafe' },
                  { icon: Download, label: 'Exportar Datos', bgColor: '#f0fdf4', textColor: '#166534', hoverBg: '#dcfce7' },
                  { icon: PieChartIcon, label: 'Ver Analytics', bgColor: '#faf5ff', textColor: '#7c2d12', hoverBg: '#f3e8ff' },
                  { icon: Users, label: 'Gestionar Accesos', bgColor: '#fff7ed', textColor: '#9a3412', hoverBg: '#fed7aa' }
                ].map((action, index) => (
                  <button
                    key={index}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: action.bgColor,
                      border: '1px solid transparent',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = action.hoverBg;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = action.bgColor;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <action.icon style={{ width: '18px', height: '18px', color: action.textColor }} />
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: action.textColor
                      }}>
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight style={{
                      width: '14px',
                      height: '14px',
                      color: action.textColor,
                      opacity: 0.6
                    }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER CON ESTILO ANM */}
        <div style={{ marginTop: '48px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: isMobile ? 'center' : 'left',
              gap: '16px'
            }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Dashboard Reportes ANM FRI</span> - 
                  <span style={{ fontWeight: '500', color: '#374151' }}> Resolución 371/2024</span>
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  margin: 0
                }}>
                  Última actualización: {currentTime.toLocaleDateString('es-CO')} a las {currentTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <span>Sistema en línea</span>
                </div>
                <span>•</span>
                <span>6 registros</span>
                <span>•</span>
                <span style={{ color: '#8b5cf6', fontWeight: '500' }}>Reportes v2.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS ANIMATIONS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default ReportsDashboard;