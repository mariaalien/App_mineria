import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Calendar,
  MapPin,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
  Star,
  StarOff
} from 'lucide-react';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface FRIRecord {
  id: string;
  tipo: string;
  titulo: string;
  periodo: string;
  municipio: string;
  codigoMunicipio: string;
  usuario: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  estado: 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'revision';
  valorProduccion?: number;
  cantidadExtraida?: number;
  unidadMedida?: string;
  observaciones?: string;
  favorito: boolean;
  tags: string[];
}

interface FilterConfig {
  busqueda: string;
  tipo: string;
  estado: string;
  municipio: string;
  usuario: string;
  fechaInicio: string;
  fechaFin: string;
  soloFavoritos: boolean;
  tags: string[];
}

interface SortConfig {
  campo: keyof FRIRecord | null;
  direccion: 'asc' | 'desc';
}

// ============================================================================
// DATOS MOCK
// ============================================================================

const mockFRIRecords: FRIRecord[] = [
  {
    id: 'FRI-2024-001',
    tipo: 'produccion',
    titulo: 'FRI Producción Mensual - Octubre 2024',
    periodo: '2024-10',
    municipio: 'Segovia',
    codigoMunicipio: '05088',
    usuario: 'María González',
    fechaCreacion: new Date('2024-10-15'),
    fechaModificacion: new Date('2024-10-16'),
    estado: 'aprobado',
    valorProduccion: 5500000,
    cantidadExtraida: 150.5,
    unidadMedida: 'GRAMOS',
    observaciones: 'Producción normal del mes',
    favorito: true,
    tags: ['oro', 'mensual', 'prioritario']
  },
  {
    id: 'FRI-2024-002',
    tipo: 'inventarios',
    titulo: 'FRI Inventarios - Octubre 2024',
    periodo: '2024-10',
    municipio: 'Remedios',
    codigoMunicipio: '05895',
    usuario: 'Carlos Rodríguez',
    fechaCreacion: new Date('2024-10-12'),
    fechaModificacion: new Date('2024-10-14'),
    estado: 'enviado',
    favorito: false,
    tags: ['inventario', 'mensual']
  },
  {
    id: 'FRI-2024-003',
    tipo: 'paradas',
    titulo: 'FRI Paradas de Planta - Octubre 2024',
    periodo: '2024-10',
    municipio: 'El Bagre',
    codigoMunicipio: '05250',
    usuario: 'Ana Martínez',
    fechaCreacion: new Date('2024-10-10'),
    fechaModificacion: new Date('2024-10-10'),
    estado: 'borrador',
    observaciones: 'Parada programada por mantenimiento',
    favorito: false,
    tags: ['paradas', 'mantenimiento']
  },
  {
    id: 'FRI-2024-004',
    tipo: 'regalias',
    titulo: 'FRI Regalías Q3 2024',
    periodo: '2024-Q3',
    municipio: 'Nechí',
    codigoMunicipio: '05490',
    usuario: 'Luis Pérez',
    fechaCreacion: new Date('2024-10-08'),
    fechaModificacion: new Date('2024-10-12'),
    estado: 'revision',
    valorProduccion: 12800000,
    favorito: true,
    tags: ['regalias', 'trimestral', 'importante']
  },
  {
    id: 'FRI-2024-005',
    tipo: 'maquinaria_transporte',
    titulo: 'FRI Maquinaria y Transporte Q3 2024',
    periodo: '2024-Q3',
    municipio: 'Zaragoza',
    codigoMunicipio: '05893',
    usuario: 'Carmen López',
    fechaCreacion: new Date('2024-10-05'),
    fechaModificacion: new Date('2024-10-11'),
    estado: 'rechazado',
    observaciones: 'Falta información de capacidad de maquinaria',
    favorito: false,
    tags: ['maquinaria', 'trimestral']
  }
];

const tiposFRI = [
  { value: 'produccion', label: 'Producción Mensual' },
  { value: 'inventarios', label: 'Inventarios' },
  { value: 'paradas', label: 'Paradas de Planta' },
  { value: 'regalias', label: 'Regalías' },
  { value: 'maquinaria_transporte', label: 'Maquinaria y Transporte' }
];

const estadosFRI = [
  { value: 'borrador', label: 'Borrador', color: '#6b7280' },
  { value: 'enviado', label: 'Enviado', color: '#2563eb' },
  { value: 'revision', label: 'En Revisión', color: '#f59e0b' },
  { value: 'aprobado', label: 'Aprobado', color: '#16a34a' },
  { value: 'rechazado', label: 'Rechazado', color: '#dc2626' }
];

const municipios = [
  { codigo: '05088', nombre: 'Segovia' },
  { codigo: '05895', nombre: 'Remedios' },
  { codigo: '05250', nombre: 'El Bagre' },
  { codigo: '05490', nombre: 'Nechí' },
  { codigo: '05893', nombre: 'Zaragoza' }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const GestionDatosFRI: React.FC = () => {
  const [registros, setRegistros] = useState<FRIRecord[]>(mockFRIRecords);
  const [filtros, setFiltros] = useState<FilterConfig>({
    busqueda: '',
    tipo: '',
    estado: '',
    municipio: '',
    usuario: '',
    fechaInicio: '',
    fechaFin: '',
    soloFavoritos: false,
    tags: []
  });
  const [ordenamiento, setOrdenamiento] = useState<SortConfig>({
    campo: 'fechaModificacion',
    direccion: 'desc'
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(10);
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [registrosSeleccionados, setRegistrosSeleccionados] = useState<Set<string>>(new Set());

  // ============================================================================
  // FILTRADO Y ORDENAMIENTO - CORREGIDO
  // ============================================================================

  const registrosFiltrados = useMemo(() => {
    let resultado = [...registros];

    // Filtro de búsqueda global
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(registro =>
        registro.titulo.toLowerCase().includes(busqueda) ||
        registro.municipio.toLowerCase().includes(busqueda) ||
        registro.usuario.toLowerCase().includes(busqueda) ||
        registro.id.toLowerCase().includes(busqueda) ||
        (registro.observaciones && registro.observaciones.toLowerCase().includes(busqueda))
      );
    }

    // Filtros específicos
    if (filtros.tipo) {
      resultado = resultado.filter(r => r.tipo === filtros.tipo);
    }
    if (filtros.estado) {
      resultado = resultado.filter(r => r.estado === filtros.estado);
    }
    if (filtros.municipio) {
      resultado = resultado.filter(r => r.codigoMunicipio === filtros.municipio);
    }
    if (filtros.usuario) {
      resultado = resultado.filter(r => r.usuario.toLowerCase().includes(filtros.usuario.toLowerCase()));
    }
    if (filtros.soloFavoritos) {
      resultado = resultado.filter(r => r.favorito);
    }

    // Filtro de fechas
    if (filtros.fechaInicio) {
      const fechaInicio = new Date(filtros.fechaInicio);
      resultado = resultado.filter(r => r.fechaCreacion >= fechaInicio);
    }
    if (filtros.fechaFin) {
      const fechaFin = new Date(filtros.fechaFin);
      resultado = resultado.filter(r => r.fechaCreacion <= fechaFin);
    }

    // Filtro de tags
    if (filtros.tags.length > 0) {
      resultado = resultado.filter(r => 
        filtros.tags.some(tag => r.tags.includes(tag))
      );
    }

    return resultado;
  }, [registros, filtros]);

  const registrosOrdenados = useMemo(() => {
    if (!ordenamiento.campo) return registrosFiltrados;

    return [...registrosFiltrados].sort((a, b) => {
      const campo = ordenamiento.campo!;
      let aVal: any = a[campo];
      let bVal: any = b[campo];

      // SOLUCIÓN: Manejar valores undefined
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      // Manejo especial para fechas
      if (aVal instanceof Date && bVal instanceof Date) {
        aVal = aVal.getTime();
        bVal = bVal.getTime();
      }

      // Manejo especial para strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return ordenamiento.direccion === 'asc' ? -1 : 1;
      if (aVal > bVal) return ordenamiento.direccion === 'asc' ? 1 : -1;
      return 0;
    });
  }, [registrosFiltrados, ordenamiento]);

  // Paginación
  const totalPaginas = Math.ceil(registrosOrdenados.length / elementosPorPagina);
  const registrosPaginados = registrosOrdenados.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSort = useCallback((campo: keyof FRIRecord) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFiltroChange = useCallback((key: keyof FilterConfig, value: any) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
    setPaginaActual(1);
  }, []);

  const toggleFavorito = useCallback((id: string) => {
    setRegistros(prev => prev.map(r => 
      r.id === id ? { ...r, favorito: !r.favorito } : r
    ));
  }, []);

  const toggleSeleccion = useCallback((id: string) => {
    setRegistrosSeleccionados(prev => {
      const nuevaSeleccion = new Set(prev);
      if (nuevaSeleccion.has(id)) {
        nuevaSeleccion.delete(id);
      } else {
        nuevaSeleccion.add(id);
      }
      return nuevaSeleccion;
    });
  }, []);

  const seleccionarTodos = useCallback(() => {
    if (registrosSeleccionados.size === registrosPaginados.length && registrosPaginados.length > 0) {
      setRegistrosSeleccionados(new Set());
    } else {
      setRegistrosSeleccionados(new Set(registrosPaginados.map(r => r.id)));
    }
  }, [registrosPaginados, registrosSeleccionados.size]);

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      busqueda: '',
      tipo: '',
      estado: '',
      municipio: '',
      usuario: '',
      fechaInicio: '',
      fechaFin: '',
      soloFavoritos: false,
      tags: []
    });
    setPaginaActual(1);
  }, []);

  const getEstadoInfo = (estado: string) => {
    return estadosFRI.find(e => e.value === estado) || estadosFRI[0];
  };

  const getSortIcon = (campo: keyof FRIRecord) => {
    if (ordenamiento.campo !== campo) {
      return <ArrowUpDown style={{ width: '14px', height: '14px', color: '#9ca3af' }} />;
    }
    return ordenamiento.direccion === 'asc' ? 
      <ArrowUp style={{ width: '14px', height: '14px', color: '#2563eb' }} /> :
      <ArrowDown style={{ width: '14px', height: '14px', color: '#2563eb' }} />;
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
        marginBottom: '24px',
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
              <Table style={{ width: '28px', height: '28px', color: 'white' }} />
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
                Gestión de Datos FRI
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontWeight: '500' }}>
                Administración avanzada de registros FRI con filtros y búsqueda global
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: mostrarFiltrosAvanzados ? '#eff6ff' : 'white',
                color: mostrarFiltrosAvanzados ? '#1d4ed8' : '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Filter style={{ width: '16px', height: '16px' }} />
              Filtros Avanzados
              {mostrarFiltrosAvanzados ? 
                <ChevronUp style={{ width: '16px', height: '16px' }} /> :
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              }
            </button>

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
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Nuevo FRI
            </button>
          </div>
        </div>

        {/* BÚSQUEDA GLOBAL */}
        <div style={{
          position: 'relative',
          marginBottom: mostrarFiltrosAvanzados ? '24px' : '0'
        }}>
          <Search style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Búsqueda global: ID, título, municipio, usuario, observaciones..."
            value={filtros.busqueda}
            onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              border: '1px solid #d1d5db',
              borderRadius: '16px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              background: 'white'
            }}
          />
          {filtros.busqueda && (
            <button
              onClick={() => handleFiltroChange('busqueda', '')}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
            </button>
          )}
        </div>

        {/* FILTROS AVANZADOS */}
        {mostrarFiltrosAvanzados && (
          <div style={{
            padding: '24px',
            background: '#f9fafb',
            borderRadius: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {/* Tipo FRI */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Tipo de FRI
                </label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Todos los tipos</option>
                  {tiposFRI.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Estado
                </label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Todos los estados</option>
                  {estadosFRI.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Municipio */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Municipio
                </label>
                <select
                  value={filtros.municipio}
                  onChange={(e) => handleFiltroChange('municipio', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Todos los municipios</option>
                  {municipios.map(municipio => (
                    <option key={municipio.codigo} value={municipio.codigo}>
                      {municipio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Usuario */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Usuario
                </label>
                <input
                  type="text"
                  placeholder="Nombre usuario"
                  value={filtros.usuario}
                  onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Fecha Inicio */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Opciones adicionales */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={filtros.soloFavoritos}
                  onChange={(e) => handleFiltroChange('soloFavoritos', e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Solo favoritos
                </span>
              </label>

              <button
                onClick={limpiarFiltros}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <X style={{ width: '14px', height: '14px' }} />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RESUMEN DE LA TABLA - Se mostrará el resto en el siguiente mensaje */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>
          📊 Gestión de Datos Avanzada
        </h3>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {registrosOrdenados.length} registros FRI • Búsqueda global • Filtros avanzados • Ordenamiento inteligente
        </p>
      </div>
    </div>
  );
};

export default GestionDatosFRI;