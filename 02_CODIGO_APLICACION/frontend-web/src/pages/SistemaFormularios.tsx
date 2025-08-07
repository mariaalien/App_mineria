import React, { useState, useCallback } from 'react';
import {
  FileText,
  Calendar,
  Factory,
  Truck,
  DollarSign,
  Settings,
  BarChart3,
  Target,
  TrendingUp,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';

// ============================================================================
// TIPOS DE FORMULARIOS FRI SEGÚN RESOLUCIÓN 371/2024
// ============================================================================

const tiposFRI = [
  {
    id: 'produccion',
    titulo: 'FRI Producción Mensual',
    descripcion: 'Registro mensual de producción minera',
    icono: Factory,
    color: '#3b82f6',
    periodicidad: 'MENSUAL',
    categoria: 'Producción',
    campos: 12,
    implementado: true
  },
  {
    id: 'inventarios',
    titulo: 'FRI Inventarios',
    descripcion: 'Control de inventarios de mineral',
    icono: BarChart3,
    color: '#10b981',
    periodicidad: 'MENSUAL',
    categoria: 'Inventarios',
    campos: 10,
    implementado: true
  },
  {
    id: 'paradas',
    titulo: 'FRI Paradas de Planta',
    descripcion: 'Registro de paradas operacionales',
    icono: AlertCircle,
    color: '#f59e0b',
    periodicidad: 'MENSUAL',
    categoria: 'Operaciones',
    campos: 8,
    implementado: true
  },
  {
    id: 'ejecucion',
    titulo: 'FRI Ejecución de Obra',
    descripcion: 'Seguimiento de ejecución de obras',
    icono: Settings,
    color: '#8b5cf6',
    periodicidad: 'TRIMESTRAL',
    categoria: 'Proyectos',
    campos: 15,
    implementado: true
  },
  {
    id: 'maquinaria_transporte',
    titulo: 'FRI Maquinaria y Transporte',
    descripcion: 'Registro de maquinaria utilizada',
    icono: Truck,
    color: '#ef4444',
    periodicidad: 'TRIMESTRAL',
    categoria: 'Equipos',
    campos: 11,
    implementado: true
  },
  {
    id: 'regalias',
    titulo: 'FRI Regalías',
    descripcion: 'Declaración trimestral de regalías',
    icono: DollarSign,
    color: '#06b6d4',
    periodicidad: 'TRIMESTRAL',
    categoria: 'Financiero',
    campos: 13,
    implementado: true
  },
  {
    id: 'inventario_maquinaria',
    titulo: 'FRI Inventario Maquinaria',
    descripcion: 'Inventario anual de maquinaria',
    icono: Factory,
    color: '#84cc16',
    periodicidad: 'ANUAL',
    categoria: 'Inventarios',
    campos: 9,
    implementado: true
  },
  {
    id: 'capacidad_tecnologica',
    titulo: 'FRI Capacidad Tecnológica',
    descripcion: 'Evaluación de capacidad tecnológica',
    icono: Target,
    color: '#f97316',
    periodicidad: 'ANUAL',
    categoria: 'Tecnología',
    campos: 14,
    implementado: true
  },
  {
    id: 'proyecciones',
    titulo: 'FRI Proyecciones',
    descripcion: 'Proyecciones anuales de producción',
    icono: TrendingUp,
    color: '#ec4899',
    periodicidad: 'ANUAL',
    categoria: 'Planificación',
    campos: 12,
    implementado: true
  }
];

// ============================================================================
// ESTADÍSTICAS DE FORMULARIOS
// ============================================================================

const estadisticasFormularios = {
  total: 2847,
  pendientes: 156,
  borradores: 43,
  completados: 2648,
  porPeriodicidad: {
    MENSUAL: { total: 1890, pendientes: 98 },
    TRIMESTRAL: { total: 645, pendientes: 32 },
    ANUAL: { total: 312, pendientes: 26 }
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SistemaFormulariosFRI: React.FC = () => {
  const [filtroPeriodicidad, setFiltroPeriodicidad] = useState<string>('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<string | null>(null);

  // ============================================================================
  // FILTROS - SOLUCIONADO EL ERROR TYPESCRIPT
  // ============================================================================

  // ANTES (con error): const categorias = [...new Set(tiposFRI.map(f => f.categoria))];
  // AHORA (sin error):
  const categoriasSet = new Set(tiposFRI.map(f => f.categoria));
  const categorias = Array.from(categoriasSet);
  
  const periodicidadesSet = new Set(tiposFRI.map(f => f.periodicidad));
  const periodicidades = Array.from(periodicidadesSet);

  const formulariosFiltrados = tiposFRI.filter(formulario => {
    const cumpleBusqueda = formulario.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          formulario.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    const cumplePeriodicidad = filtroPeriodicidad === 'TODOS' || 
                              formulario.periodicidad === filtroPeriodicidad;
    
    const cumpleCategoria = filtroCategoria === 'TODOS' || 
                           formulario.categoria === filtroCategoria;

    return cumpleBusqueda && cumplePeriodicidad && cumpleCategoria;
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCrearFormulario = useCallback((tipoFRI: string) => {
    setFormularioSeleccionado(tipoFRI);
    // Aquí se navegaría al formulario específico
    console.log(`Creando formulario: ${tipoFRI}`);
    
    // Si es producción, navegar a la página específica
    if (tipoFRI === 'produccion') {
      window.location.href = '/formularios/produccion';
    }
  }, []);

  const getIconoEstado = (implementado: boolean) => {
    return implementado ? 
      <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} /> :
      <Clock style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
  };

  const getEstadoTexto = (implementado: boolean) => {
    return implementado ? 'Disponible' : 'En desarrollo';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      
      {/* HEADER */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
            }}>
              <FileText style={{ width: '28px', height: '28px', color: 'white' }} />
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
                Sistema de Formularios FRI
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontWeight: '500' }}>
                Formatos de Registro de Información - Resolución ANM 371/2024
              </p>
            </div>
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Nuevo FRI
          </button>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {estadisticasFormularios.total.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total FRI</div>
          </div>
          
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {estadisticasFormularios.pendientes}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Pendientes</div>
          </div>
          
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {estadisticasFormularios.borradores}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Borradores</div>
          </div>
          
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {estadisticasFormularios.completados.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Completados</div>
          </div>
        </div>

        {/* FILTROS Y BÚSQUEDA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Búsqueda */}
          <div style={{
            position: 'relative',
            flex: '1',
            minWidth: '250px'
          }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Buscar formularios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          {/* Filtro Periodicidad */}
          <div style={{ position: 'relative' }}>
            <Filter style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#9ca3af'
            }} />
            <select
              value={filtroPeriodicidad}
              onChange={(e) => setFiltroPeriodicidad(e.target.value)}
              style={{
                padding: '12px 16px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                minWidth: '150px'
              }}
            >
              <option value="TODOS">Todas las periodicidades</option>
              {periodicidades.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Filtro Categoría */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="TODOS">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID DE FORMULARIOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '24px'
      }}>
        {formulariosFiltrados.map((formulario) => {
          const Icono = formulario.icono;
          
          return (
            <div
              key={formulario.id}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
              }}
              onClick={() => handleCrearFormulario(formulario.id)}
            >
              {/* HEADER DEL CARD */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px',
                  background: `${formulario.color}20`,
                  borderRadius: '16px',
                  border: `2px solid ${formulario.color}40`
                }}>
                  <Icono style={{ 
                    width: '24px', 
                    height: '24px', 
                    color: formulario.color 
                  }} />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {getIconoEstado(formulario.implementado)}
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: formulario.implementado ? '#16a34a' : '#f59e0b'
                  }}>
                    {getEstadoTexto(formulario.implementado)}
                  </span>
                </div>
              </div>

              {/* CONTENIDO */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 8px 0'
                }}>
                  {formulario.titulo}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 16px 0',
                  lineHeight: '1.5'
                }}>
                  {formulario.descripcion}
                </p>

                {/* METADATOS */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '2px'
                    }}>
                      Periodicidad
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {formulario.periodicidad}
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '2px'
                    }}>
                      Campos
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {formulario.campos}
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '2px'
                    }}>
                      Categoría
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {formulario.categoria}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCIÓN */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0 0 0',
                borderTop: '1px solid #f3f4f6'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: formulario.color
                  }}></div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    {formulario.categoria}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: formulario.color,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <span>Crear formulario</span>
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MENSAJE SI NO HAY RESULTADOS */}
      {formulariosFiltrados.length === 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '50%',
            display: 'inline-block',
            marginBottom: '20px'
          }}>
            <Search style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            No se encontraron formularios
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Prueba ajustando los filtros o la búsqueda
          </p>
        </div>
      )}

      {/* ESTADÍSTICAS POR PERIODICIDAD */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '32px',
        marginTop: '32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '24px'
        }}>
          Estadísticas por Periodicidad
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(estadisticasFormularios.porPeriodicidad).map(([periodo, stats]) => (
            <div key={periodo} style={{
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {periodo}
                </h3>
                <Calendar style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Total:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {stats.total.toLocaleString()}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Pendientes:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>
                  {stats.pendientes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SistemaFormulariosFRI;