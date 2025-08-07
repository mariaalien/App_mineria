import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  Download,
  Zap,
  Shield,
  Globe,
  Cpu,
  DollarSign,
  Award,
  Target,
  Bell,
  Edit3,
  PieChart
} from 'lucide-react';

// ============================================================================
// DATOS MOCK
// ============================================================================

const mockStats = {
  friRegistrados: 2847,
  friCrecimiento: 18.5,
  usuariosActivos: 156,
  usuariosCrecimiento: 12.3,
  reportesGenerados: 1242,
  reportesCrecimiento: 25.7,
  eficienciaOperacional: 96.8,
  eficienciaCrecimiento: 4.2,
  valorProduccion: 45600000,
  valorCrecimiento: 8.9,
  certificaciones: 94,
  certificacionesCrecimiento: 15.2
};

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
// COMPONENTE PRINCIPAL CON CSS INLINE
// ============================================================================

const DashboardInline: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus style={{ width: '16px', height: '16px', color: '#059669' }} />;
      case 'update':
        return <Edit3 style={{ width: '16px', height: '16px', color: '#2563eb' }} />;
      case 'report':
        return <FileText style={{ width: '16px', height: '16px', color: '#7c3aed' }} />;
      case 'approval':
        return <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} />;
      case 'critical':
        return <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />;
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* HEADER */}
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
                Dashboard ANM FRI
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontWeight: '500'
              }}>
                Sistema de Gestión de Formatos de Reportes de Información
              </p>
            </div>
          </div>

          {/* Acciones del header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: window.innerWidth < 640 ? 'none' : 'flex',
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
            
            <button style={{
              position: 'relative',
              padding: '12px',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#6b7280';
            }}
            >
              <Bell style={{ width: '20px', height: '20px' }} />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '12px',
                height: '12px',
                background: '#ef4444',
                borderRadius: '50%'
              }}></div>
            </button>

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
              <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>
                Actualizar
              </span>
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
                             window.innerWidth < 768 ? 'repeat(2, 1fr)' : 
                             window.innerWidth < 1024 ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          
          {/* FRI Registrados - 2 columnas en desktop */}
          <div style={{
            gridColumn: window.innerWidth >= 1024 ? 'span 2' : 'span 1',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(59, 130, 246, 0.3)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px'
              }}>
                <FileText style={{ width: '28px', height: '28px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255, 255, 255, 0.8)' }}>
                <TrendingUp style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>+{mockStats.friCrecimiento}%</span>
              </div>
            </div>
            <h3 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              FRI REGISTRADOS
            </h3>
            <p style={{
              fontSize: '36px',
              fontWeight: 'bold',
              margin: '0 0 4px 0'
            }}>
              {mockStats.friRegistrados.toLocaleString()}
            </p>
            <p style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0
            }}>
              Total acumulado
            </p>
          </div>

          {/* Usuarios Activos */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #047857)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.3)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}>
                <Users style={{ width: '24px', height: '24px' }} />
              </div>
              <TrendingUp style={{ width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
            <h3 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              USUARIOS ACTIVOS
            </h3>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 4px 0'
            }}>
              {mockStats.usuariosActivos}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0
            }}>
              +{mockStats.usuariosCrecimiento}% este mes
            </p>
          </div>

          {/* Reportes */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.3)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}>
                <BarChart3 style={{ width: '24px', height: '24px' }} />
              </div>
              <TrendingUp style={{ width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
            <h3 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              REPORTES
            </h3>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 4px 0'
            }}>
              {mockStats.reportesGenerados.toLocaleString()}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0
            }}>
              +{mockStats.reportesCrecimiento}% trimestre
            </p>
          </div>

          {/* Eficiencia */}
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(245, 158, 11, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(245, 158, 11, 0.3)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}>
                <Target style={{ width: '24px', height: '24px' }} />
              </div>
              <TrendingUp style={{ width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
            <h3 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              EFICIENCIA
            </h3>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 4px 0'
            }}>
              {mockStats.eficienciaOperacional}%
            </p>
            <p style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0
            }}>
              +{mockStats.eficienciaCrecimiento}% mejora
            </p>
          </div>

          {/* Valor Producción */}
          <div style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(34, 197, 94, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(34, 197, 94, 0.3)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}>
                <DollarSign style={{ width: '24px', height: '24px' }} />
              </div>
              <TrendingUp style={{ width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
            <h3 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              VALOR PROD.
            </h3>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 4px 0'
            }}>
              ${(mockStats.valorProduccion / 1000000).toFixed(1)}M
            </p>
            <p style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0
            }}>
              +{mockStats.valorCrecimiento}% anual
            </p>
          </div>

          {/* Certificaciones */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #4338ca)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(99, 102, 241, 0.3)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}>
                <Award style={{ width: '24px', height: '24px' }} />
              </div>
              <TrendingUp style={{ width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
            <h3 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 4px 0',
              letterSpacing: '0.5px'
            }}>
              CERTIFICACIONES
            </h3>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 4px 0'
            }}>
              {mockStats.certificaciones}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0
            }}>
              +{mockStats.certificacionesCrecimiento}% nuevas
            </p>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '2fr 1fr',
          gap: '32px'
        }}>
          
          {/* ACTIVIDAD RECIENTE */}
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
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '12px'
                  }}>
                    <Activity style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
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
                      Últimas acciones del sistema
                    </p>
                  </div>
                </div>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#2563eb',
                  fontWeight: '500',
                  background: '#eff6ff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dbeafe';
                  e.currentTarget.style.color = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.color = '#2563eb';
                }}
                >
                  <span>Ver todo</span>
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
            
            <div style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '20px',
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
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {activity.avatar}
                      </div>
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
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
                        fontSize: '14px',
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
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        borderRadius: '20px',
                        flexShrink: 0
                      }}>
                        {activity.status === 'success' ? 'Completado' : 
                         activity.status === 'pending' ? 'Pendiente' : 
                         activity.status === 'critical' ? 'Crítico' : 'Advertencia'}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 8px 0',
                      lineHeight: '1.5'
                    }}>
                      {activity.action}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        margin: 0
                      }}>
                        {activity.time}
                      </p>
                      <button style={{
                        fontSize: '12px',
                        color: '#2563eb',
                        fontWeight: '500',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0.7,
                        transition: 'opacity 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                      }}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL LATERAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
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
                  { icon: Plus, label: 'Crear nuevo FRI', bgColor: '#eff6ff', textColor: '#1d4ed8', hoverBg: '#dbeafe' },
                  { icon: Download, label: 'Descargar reportes', bgColor: '#f0fdf4', textColor: '#166534', hoverBg: '#dcfce7' },
                  { icon: PieChart, label: 'Ver analytics', bgColor: '#faf5ff', textColor: '#7c2d12', hoverBg: '#f3e8ff' },
                  { icon: Users, label: 'Gestionar usuarios', bgColor: '#fff7ed', textColor: '#9a3412', hoverBg: '#fed7aa' }
                ].map((action, index) => (
                  <button
                    key={index}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <action.icon style={{ width: '20px', height: '20px', color: action.textColor }} />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: action.textColor
                      }}>
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight style={{
                      width: '16px',
                      height: '16px',
                      color: action.textColor,
                      opacity: 0.6
                    }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Estado del Sistema */}
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
                  background: 'linear-gradient(135deg, #22c55e, #15803d)',
                  borderRadius: '12px'
                }}>
                  <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    Estado del Sistema
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Monitoreo en tiempo real
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'API Backend', status: 'operational', icon: Cpu, value: '99.9%', color: '#22c55e' },
                  { name: 'Base de Datos', status: 'operational', icon: Globe, value: '100%', color: '#22c55e' },
                  { name: 'Respaldo Automático', status: 'scheduled', icon: Shield, value: 'Programado', color: '#f59e0b' },
                  { name: 'Sincronización', status: 'active', icon: RefreshCw, value: 'Activa', color: '#3b82f6' }
                ].map((service, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <service.icon style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {service.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: service.color,
                        animation: service.status === 'operational' || service.status === 'active' ? 'pulse 2s infinite' : 'none'
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: service.color
                      }}>
                        {service.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribución FRI */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 20px 0'
              }}>
                Distribución FRI
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'FRI Mensuales', value: '45%', color: '#3b82f6' },
                  { name: 'FRI Trimestrales', value: '30%', color: '#22c55e' },
                  { name: 'FRI Anuales', value: '15%', color: '#f59e0b' },
                  { name: 'Otros', value: '10%', color: '#ef4444' }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: item.color
                      }}></div>
                      <span style={{
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
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
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: window.innerWidth < 768 ? 'center' : 'left',
              gap: '16px'
            }}>
              <div style={{ marginBottom: window.innerWidth < 768 ? '16px' : 0 }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  <span style={{ fontWeight: 'bold', color: '#2563eb' }}>Sistema ANM FRI</span> - 
                  <span style={{ fontWeight: '500', color: '#374151' }}> Resolución 371/2024</span> | 
                  <span style={{ fontWeight: '500', color: '#16a34a' }}> v2.1.0</span>
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: window.innerWidth < 768 ? 'center' : 'flex-end',
                gap: '24px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#3b82f6',
                    borderRadius: '50%'
                  }}></div>
                  <span>Desarrollado por CTGlobal</span>
                </div>
                <span>•</span>
                <span>Universidad Distrital</span>
                <span>•</span>
                <span style={{ color: '#16a34a', fontWeight: '500' }}>Sistema Operativo</span>
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

export default DashboardInline;