import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  RefreshCw,
  Calendar,
  Eye,
  Target,
  Zap,
  PieChart,
  LineChart,
  Award,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// ============================================================================
// DATOS MOCK PARA ANALYTICS
// ============================================================================

const analyticsData = {
  totalProduccion: 50745,
  eficienciaPromedio: 77.3,
  maxProduccion: 5755,
  tendenciaCrecimiento: 1676,
  distribucionPorTipo: [
    { name: 'Producción Mensual', value: 45, color: '#3b82f6', amount: 22875 },
    { name: 'Distribución de Minerales', value: 30, color: '#10b981', amount: 15225 },
    { name: 'Performance por Municipio', value: 15, color: '#f59e0b', amount: 7612 },
    { name: 'Tendencias Trimestrales', value: 10, color: '#ef4444', amount: 5075 }
  ],
  rendimientoPorMes: [
    { mes: 'Ene', produccion: 4200, eficiencia: 72, reportes: 12 },
    { mes: 'Feb', produccion: 4350, eficiencia: 75, reportes: 15 },
    { mes: 'Mar', produccion: 4180, eficiencia: 71, reportes: 18 },
    { mes: 'Abr', produccion: 4520, eficiencia: 78, reportes: 14 },
    { mes: 'May', produccion: 4890, eficiencia: 82, reportes: 22 },
    { mes: 'Jun', produccion: 5100, eficiencia: 85, reportes: 19 }
  ],
  alertasOperacionales: [
    {
      id: 1,
      tipo: 'critica',
      titulo: 'Producción bajo el umbral esperado',
      descripcion: 'La mina La Esperanza reportó 15% menos producción',
      tiempo: 'Hace 2 horas',
      impacto: 'Alto'
    },
    {
      id: 2,
      tipo: 'advertencia',
      titulo: 'Retraso en reportes FRI trimestrales',
      descripcion: '3 municipios pendientes de envío',
      tiempo: 'Hace 5 horas',
      impacto: 'Medio'
    },
    {
      id: 3,
      tipo: 'info',
      titulo: 'Nueva certificación ambiental',
      descripcion: 'Mina El Dorado obtuvo certificación ISO 14001',
      tiempo: 'Hace 1 día',
      impacto: 'Positivo'
    }
  ],
  topMunicipios: [
    { nombre: 'Segovia', produccion: 8450, porcentaje: 16.7, tendencia: 'up' },
    { nombre: 'Remedios', produccion: 7320, porcentaje: 14.4, tendencia: 'up' },
    { nombre: 'El Bagre', produccion: 6890, porcentaje: 13.6, tendencia: 'down' },
    { nombre: 'Nechí', produccion: 5670, porcentaje: 11.2, tendencia: 'up' },
    { nombre: 'Zaragoza', produccion: 4920, porcentaje: 9.7, tendencia: 'stable' }
  ]
};

// ============================================================================
// COMPONENTE PRINCIPAL DE ANALYTICS
// ============================================================================

const Analytics: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  // Actualizar hora cada minuto
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

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critica':
        return <AlertTriangle style={{ width: '16px', height: '16px', color: '#dc2626' }} />;
      case 'advertencia':
        return <Clock style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
      case 'info':
        return <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} />;
      default:
        return <Activity style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  const getAlertStyle = (tipo: string) => {
    switch (tipo) {
      case 'critica':
        return { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' };
      case 'advertencia':
        return { background: '#fffbeb', border: '1px solid #fed7aa', color: '#92400e' };
      case 'info':
        return { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' };
      default:
        return { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' };
    }
  };

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp style={{ width: '16px', height: '16px', color: '#16a34a' }} />;
      case 'down':
        return <TrendingDown style={{ width: '16px', height: '16px', color: '#dc2626' }} />;
      default:
        return <Activity style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* HEADER DE ANALYTICS */}
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
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          
          {/* Título y descripción */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
            }}>
              <BarChart3 style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 4px 0'
              }}>
                Analytics Avanzados ANM FRI
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontWeight: '500'
              }}>
                Visualización interactiva de datos mineros con análisis en tiempo real
              </p>
            </div>
          </div>

          {/* Controles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f9fafb',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb'
            }}>
              <Calendar style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '500'
                }}
              >
                <option value="1m">Último mes</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último año</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              <RefreshCw style={{
                width: '16px',
                height: '16px',
                animation: isLoading ? 'spin 1s linear infinite' : 'none'
              }} />
              <span>Actualizar</span>
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
        
        {/* MÉTRICAS PRINCIPALES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 
                             window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          
          {/* Total Producción */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '12px'
              }}>
                <TrendingUp style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <Zap style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            </div>
            <h3 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              Total Producción
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>
              {analyticsData.totalProduccion.toLocaleString()}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#16a34a',
              margin: 0,
              fontWeight: '500'
            }}>
              Toneladas
            </p>
          </div>

          {/* Eficiencia Promedio */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px'
              }}>
                <Target style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <Eye style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
            </div>
            <h3 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              Eficiencia Promedio
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>
              {analyticsData.eficienciaPromedio}%
            </p>
            <p style={{
              fontSize: '12px',
              color: '#10b981',
              margin: 0,
              fontWeight: '500'
            }}>
              Operacional
            </p>
          </div>

          {/* Máx. Producción */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '12px'
              }}>
                <Award style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <Zap style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            </div>
            <h3 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              Máx. Producción
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>
              {analyticsData.maxProduccion.toLocaleString()}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#f59e0b',
              margin: 0,
              fontWeight: '500'
            }}>
              Toneladas
            </p>
          </div>

          {/* Tendencia */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '12px'
              }}>
                <TrendingUp style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
            <h3 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              Tendencia
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>
              +{analyticsData.tendenciaCrecimiento.toLocaleString()}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#16a34a',
              margin: 0,
              fontWeight: '500'
            }}>
              Crecimiento
            </p>
          </div>
        </div>

        {/* TIPOS DE GRÁFICO */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{
              padding: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px'
            }}>
              <Eye style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Tipos de Gráfico
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            
            {/* Producción Mensual */}
            <div style={{
              padding: '24px',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <LineChart style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Producción Mensual
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Evolución de la producción por mes
              </p>
              <div style={{
                height: '120px',
                background: '#f8fafc',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'end',
                  gap: '8px',
                  height: '80px'
                }}>
                  {analyticsData.rendimientoPorMes.map((mes) => (
                    <div
                      key={mes.mes}
                      style={{
                        width: '32px',
                        height: `${(mes.produccion / 5100) * 80}px`,
                        background: `linear-gradient(to top, #3b82f6, #60a5fa)`,
                        borderRadius: '4px 4px 0 0',
                        position: 'relative'
                      }}
                      title={`${mes.mes}: ${mes.produccion.toLocaleString()} tons`}
                    >
                      <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '10px',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {mes.mes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Distribución de Minerales */}
            <div style={{
              padding: '24px',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.background = '#f0fdf4';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <PieChart style={{ width: '24px', height: '24px', color: '#10b981' }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Distribución de Minerales
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Participación por tipo de mineral
              </p>
              <div style={{
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                justifyContent: 'center'
              }}>
                {analyticsData.distribucionPorTipo.slice(0, 4).map((item) => (
                  <div key={item.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: item.color
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance por Municipio */}
            <div style={{
              padding: '24px',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.background = '#fffbeb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <BarChart3 style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Performance por Municipio
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Comparativo entre municipios
              </p>
              <div style={{
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                justifyContent: 'center'
              }}>
                {analyticsData.topMunicipios.slice(0, 4).map((municipio) => (
                  <div key={municipio.nombre} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#374151',
                        fontWeight: '500',
                        minWidth: '60px'
                      }}>
                        {municipio.nombre}
                      </span>
                      {getTrendIcon(municipio.tendencia)}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {municipio.porcentaje}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tendencias Trimestrales */}
            <div style={{
              padding: '24px',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.background = '#faf5ff';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <TrendingUp style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Tendencias Trimestrales
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Evolución trimestral con metas
              </p>
              <div style={{
                height: '120px',
                background: '#f8fafc',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Q1
                    </div>
                    <span style={{ fontSize: '10px', color: '#6b7280' }}>85%</span>
                  </div>
                  <div style={{
                    width: '2px',
                    height: '20px',
                    background: '#e5e7eb'
                  }}></div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Q2
                    </div>
                    <span style={{ fontSize: '10px', color: '#6b7280' }}>92%</span>
                  </div>
                  <div style={{
                    width: '2px',
                    height: '20px',
                    background: '#e5e7eb'
                  }}></div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Q3
                    </div>
                    <span style={{ fontSize: '10px', color: '#6b7280' }}>78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ANALYTICS */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: window.innerWidth < 768 ? 'center' : 'left',
            gap: '16px'
          }}>
            <div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Analytics ANM FRI</span> - 
                <span style={{ fontWeight: '500', color: '#374151' }}> Datos actualizados en tiempo real</span>
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
              <span>Resolución 371/2024</span>
              <span>•</span>
              <span style={{ color: '#8b5cf6', fontWeight: '500' }}>Analytics v1.0</span>
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

export default Analytics;