import React, { useState, useCallback, useMemo } from 'react';
import {
  Star,
  StarOff,
  Tag,
  Plus,
  X,
  Filter,
  Save,
  Eye,
  EyeOff,
  Settings,
  Search,
  Hash,
  Bookmark,
  Layout,
  Grid,
  List,
  Calendar,
  MapPin,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit3,
  Trash2,
  Copy,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Palette,
  Zap
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

interface TagDefinition {
  nombre: string;
  color: string;
  descripcion: string;
  count: number;
  categoria: 'estado' | 'tipo' | 'prioridad' | 'ubicacion' | 'custom';
}

interface VistaPersonalizada {
  id: string;
  nombre: string;
  descripcion: string;
  filtros: {
    tags: string[];
    estados: string[];
    favoritos: boolean;
    fechaInicio?: string;
    fechaFin?: string;
    busqueda?: string;
  };
  ordenamiento: {
    campo: string;
    direccion: 'asc' | 'desc';
  };
  columnas: string[];
  color: string;
  icono: string;
  publica: boolean;
  fechaCreacion: Date;
  usuarioCreador: string;
}

// ============================================================================
// DATOS MOCK
// ============================================================================

const mockRegistros: FRIRecord[] = [
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
    tags: ['oro', 'mensual', 'prioritario', 'segovia']
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
    tags: ['inventario', 'mensual', 'remedios']
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
    tags: ['paradas', 'mantenimiento', 'el-bagre', 'urgente']
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
    tags: ['regalias', 'trimestral', 'importante', 'nechi']
  }
];

const tagsDefinitions: TagDefinition[] = [
  { nombre: 'oro', color: '#f59e0b', descripcion: 'Relacionado con extracción de oro', count: 5, categoria: 'tipo' },
  { nombre: 'plata', color: '#6b7280', descripcion: 'Relacionado con extracción de plata', count: 2, categoria: 'tipo' },
  { nombre: 'carbon', color: '#1f2937', descripcion: 'Relacionado con extracción de carbón', count: 3, categoria: 'tipo' },
  { nombre: 'mensual', color: '#3b82f6', descripcion: 'Reportes mensuales', count: 8, categoria: 'estado' },
  { nombre: 'trimestral', color: '#8b5cf6', descripcion: 'Reportes trimestrales', count: 4, categoria: 'estado' },
  { nombre: 'anual', color: '#10b981', descripcion: 'Reportes anuales', count: 2, categoria: 'estado' },
  { nombre: 'prioritario', color: '#dc2626', descripcion: 'Alta prioridad', count: 3, categoria: 'prioridad' },
  { nombre: 'importante', color: '#f59e0b', descripcion: 'Importancia media', count: 5, categoria: 'prioridad' },
  { nombre: 'urgente', color: '#ef4444', descripcion: 'Requiere atención inmediata', count: 2, categoria: 'prioridad' },
  { nombre: 'segovia', color: '#14b8a6', descripcion: 'Municipio de Segovia', count: 4, categoria: 'ubicacion' },
  { nombre: 'remedios', color: '#06b6d4', descripcion: 'Municipio de Remedios', count: 3, categoria: 'ubicacion' },
  { nombre: 'el-bagre', color: '#0ea5e9', descripcion: 'Municipio de El Bagre', count: 2, categoria: 'ubicacion' }
];

const vistasPersonalizadas: VistaPersonalizada[] = [
  {
    id: 'vista-1',
    nombre: 'Mis Favoritos',
    descripcion: 'Todos mis registros marcados como favoritos',
    filtros: {
      tags: [],
      estados: [],
      favoritos: true
    },
    ordenamiento: {
      campo: 'fechaModificacion',
      direccion: 'desc'
    },
    columnas: ['id', 'titulo', 'estado', 'fechaModificacion', 'tags'],
    color: '#f59e0b',
    icono: 'star',
    publica: false,
    fechaCreacion: new Date('2024-10-01'),
    usuarioCreador: 'María González'
  },
  {
    id: 'vista-2',
    nombre: 'Pendientes de Revisión',
    descripcion: 'Registros que requieren revisión o aprobación',
    filtros: {
      tags: [],
      estados: ['enviado', 'revision'],
      favoritos: false
    },
    ordenamiento: {
      campo: 'fechaCreacion',
      direccion: 'asc'
    },
    columnas: ['id', 'titulo', 'estado', 'usuario', 'fechaCreacion'],
    color: '#f59e0b',
    icono: 'clock',
    publica: true,
    fechaCreacion: new Date('2024-10-02'),
    usuarioCreador: 'Carlos Supervisor'
  },
  {
    id: 'vista-3',
    nombre: 'Producción de Oro',
    descripcion: 'Todos los registros relacionados con oro',
    filtros: {
      tags: ['oro'],
      estados: [],
      favoritos: false
    },
    ordenamiento: {
      campo: 'valorProduccion',
      direccion: 'desc'
    },
    columnas: ['id', 'titulo', 'valorProduccion', 'cantidadExtraida', 'municipio'],
    color: '#f59e0b',
    icono: 'zap',
    publica: true,
    fechaCreacion: new Date('2024-10-03'),
    usuarioCreador: 'Ana Martínez'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SistemaTagsVistasPersonalizadas: React.FC = () => {
  const [registros, setRegistros] = useState<FRIRecord[]>(mockRegistros);
  const [tags, setTags] = useState<TagDefinition[]>(tagsDefinitions);
  const [vistas, setVistas] = useState<VistaPersonalizada[]>(vistasPersonalizadas);
  const [vistaActiva, setVistaActiva] = useState<string | null>(null);
  const [mostrarPanelTags, setMostrarPanelTags] = useState(false);
  const [mostrarCrearVista, setMostrarCrearVista] = useState(false);
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const [mostrarSoloFavoritos, setMostrarSoloFavoritos] = useState(false);
  const [nuevoTag, setNuevoTag] = useState({ nombre: '', color: '#3b82f6', categoria: 'custom' as const });
  const [nuevaVista, setNuevaVista] = useState<Partial<VistaPersonalizada>>({
    nombre: '',
    descripcion: '',
    filtros: { tags: [], estados: [], favoritos: false },
    ordenamiento: { campo: 'fechaModificacion', direccion: 'desc' },
    columnas: ['id', 'titulo', 'estado', 'fechaModificacion'],
    color: '#3b82f6',
    icono: 'bookmark',
    publica: false
  });

  // ============================================================================
  // FILTRADO INTELIGENTE
  // ============================================================================

  const registrosFiltrados = useMemo(() => {
    let resultado = [...registros];

    // Aplicar vista activa
    if (vistaActiva) {
      const vista = vistas.find(v => v.id === vistaActiva);
      if (vista) {
        // Filtros de la vista
        if (vista.filtros.favoritos) {
          resultado = resultado.filter(r => r.favorito);
        }
        if (vista.filtros.tags.length > 0) {
          resultado = resultado.filter(r => 
            vista.filtros.tags.some(tag => r.tags.includes(tag))
          );
        }
        if (vista.filtros.estados.length > 0) {
          resultado = resultado.filter(r => 
            vista.filtros.estados.includes(r.estado)
          );
        }
        if (vista.filtros.busqueda) {
          const busqueda = vista.filtros.busqueda.toLowerCase();
          resultado = resultado.filter(r =>
            r.titulo.toLowerCase().includes(busqueda) ||
            r.municipio.toLowerCase().includes(busqueda) ||
            r.usuario.toLowerCase().includes(busqueda)
          );
        }
      }
    } else {
      // Filtros manuales
      if (mostrarSoloFavoritos) {
        resultado = resultado.filter(r => r.favorito);
      }
      if (filtroTags.length > 0) {
        resultado = resultado.filter(r => 
          filtroTags.some(tag => r.tags.includes(tag))
        );
      }
    }

    return resultado;
  }, [registros, vistaActiva, vistas, mostrarSoloFavoritos, filtroTags]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleFavorito = useCallback((id: string) => {
    setRegistros(prev => prev.map(r => 
      r.id === id ? { ...r, favorito: !r.favorito } : r
    ));
  }, []);

  const agregarTag = useCallback((registroId: string, nuevoTagNombre: string) => {
    setRegistros(prev => prev.map(r => 
      r.id === registroId ? {
        ...r,
        tags: Array.from(new Set([...r.tags, nuevoTagNombre]))
      } : r
    ));

    // Actualizar contador del tag
    setTags(prev => prev.map(t => 
      t.nombre === nuevoTagNombre ? { ...t, count: t.count + 1 } : t
    ));
  }, []);

  const removerTag = useCallback((registroId: string, tagARemover: string) => {
    setRegistros(prev => prev.map(r => 
      r.id === registroId ? {
        ...r,
        tags: r.tags.filter(tag => tag !== tagARemover)
      } : r
    ));

    // Actualizar contador del tag
    setTags(prev => prev.map(t => 
      t.nombre === tagARemover ? { ...t, count: Math.max(0, t.count - 1) } : t
    ));
  }, []);

  const crearNuevoTag = useCallback(() => {
    if (!nuevoTag.nombre.trim()) return;

    const tagExiste = tags.find(t => t.nombre.toLowerCase() === nuevoTag.nombre.toLowerCase());
    if (tagExiste) {
      alert('Este tag ya existe');
      return;
    }

    const nuevoTagDefinition: TagDefinition = {
      nombre: nuevoTag.nombre.toLowerCase().replace(/\s+/g, '-'),
      color: nuevoTag.color,
      descripcion: `Tag personalizado: ${nuevoTag.nombre}`,
      count: 0,
      categoria: nuevoTag.categoria
    };

    setTags(prev => [...prev, nuevoTagDefinition]);
    setNuevoTag({ nombre: '', color: '#3b82f6', categoria: 'custom' });
  }, [nuevoTag, tags]);

  const crearVistaPersonalizada = useCallback(() => {
    if (!nuevaVista.nombre?.trim()) return;

    const vista: VistaPersonalizada = {
      id: `vista-${Date.now()}`,
      nombre: nuevaVista.nombre!,
      descripcion: nuevaVista.descripcion || '',
      filtros: nuevaVista.filtros!,
      ordenamiento: nuevaVista.ordenamiento!,
      columnas: nuevaVista.columnas!,
      color: nuevaVista.color!,
      icono: nuevaVista.icono!,
      publica: nuevaVista.publica!,
      fechaCreacion: new Date(),
      usuarioCreador: 'Usuario Actual'
    };

    setVistas(prev => [...prev, vista]);
    setMostrarCrearVista(false);
    setNuevaVista({
      nombre: '',
      descripcion: '',
      filtros: { tags: [], estados: [], favoritos: false },
      ordenamiento: { campo: 'fechaModificacion', direccion: 'desc' },
      columnas: ['id', 'titulo', 'estado', 'fechaModificacion'],
      color: '#3b82f6',
      icono: 'bookmark',
      publica: false
    });
  }, [nuevaVista]);

  const aplicarVista = useCallback((vistaId: string) => {
    setVistaActiva(vistaId);
    // Limpiar filtros manuales
    setFiltroTags([]);
    setMostrarSoloFavoritos(false);
  }, []);

  const limpiarVistas = useCallback(() => {
    setVistaActiva(null);
    setFiltroTags([]);
    setMostrarSoloFavoritos(false);
  }, []);

  const getTagInfo = (tagNombre: string) => {
    return tags.find(t => t.nombre === tagNombre) || {
      nombre: tagNombre,
      color: '#6b7280',
      descripcion: 'Tag sin definir',
      count: 0,
      categoria: 'custom' as const
    };
  };

  const categoriasTags = useMemo(() => {
    const categoriasMap = new Map();
    tags.forEach(tag => {
      if (!categoriasMap.has(tag.categoria)) {
        categoriasMap.set(tag.categoria, []);
      }
      categoriasMap.get(tag.categoria).push(tag);
    });
    return categoriasMap;
  }, [tags]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderTag = (tagNombre: string, onRemove?: () => void) => {
    const tagInfo = getTagInfo(tagNombre);
    
    return (
      <span
        key={tagNombre}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: `${tagInfo.color}20`,
          color: tagInfo.color,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          border: `1px solid ${tagInfo.color}40`
        }}
      >
        <Hash style={{ width: '10px', height: '10px' }} />
        {tagNombre}
        {onRemove && (
          <button
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '10px', height: '10px' }} />
          </button>
        )}
      </span>
    );
  };

  const renderPanelTags = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Tag style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            Gestión de Tags
          </h3>
          <button
            onClick={() => setMostrarPanelTags(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Crear nuevo tag */}
        <div style={{
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Crear Nuevo Tag
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto',
            gap: '12px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Nombre
              </label>
              <input
                type="text"
                value={nuevoTag.nombre}
                onChange={(e) => setNuevoTag(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre del tag"
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
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Color
              </label>
              <input
                type="color"
                value={nuevoTag.color}
                onChange={(e) => setNuevoTag(prev => ({ ...prev, color: e.target.value }))}
                style={{
                  width: '40px',
                  height: '36px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Categoría
              </label>
              <select
                value={nuevoTag.categoria}
                onChange={(e) => setNuevoTag(prev => ({ ...prev, categoria: e.target.value as any }))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="custom">Personalizado</option>
                <option value="tipo">Tipo</option>
                <option value="estado">Estado</option>
                <option value="prioridad">Prioridad</option>
                <option value="ubicacion">Ubicación</option>
              </select>
            </div>
            
            <button
              onClick={crearNuevoTag}
              disabled={!nuevoTag.nombre.trim()}
              style={{
                padding: '8px 16px',
                background: nuevoTag.nombre.trim() ? '#3b82f6' : '#e5e7eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: nuevoTag.nombre.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Crear
            </button>
          </div>
        </div>

        {/* Lista de tags por categoría */}
        <div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Tags Existentes
          </h4>
          
          {Array.from(categoriasTags.entries()).map(([categoria, tagsList]) => (
            <div key={categoria} style={{ marginBottom: '20px' }}>
              <h5 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '12px',
                textTransform: 'capitalize'
              }}>
                {categoria}
              </h5>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {tagsList.map((tag: TagDefinition) => (
                  <div
                    key={tag.nombre}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: `${tag.color}10`,
                      border: `1px solid ${tag.color}40`,
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        background: tag.color,
                        borderRadius: '50%'
                      }}></div>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#1f2937'
                      }}>
                        {tag.nombre}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        background: 'white',
                        padding: '2px 6px',
                        borderRadius: '8px'
                      }}>
                        {tag.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCrearVista = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Bookmark style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            Crear Vista Personalizada
          </h3>
          <button
            onClick={() => setMostrarCrearVista(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Información básica */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Nombre de la Vista *
            </label>
            <input
              type="text"
              value={nuevaVista.nombre || ''}
              onChange={(e) => setNuevaVista(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Mis reportes prioritarios"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Descripción
            </label>
            <textarea
              value={nuevaVista.descripcion || ''}
              onChange={(e) => setNuevaVista(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe qué muestra esta vista..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Filtros */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Filtros
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {/* Tags */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Tags
                </label>
                <div style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px',
                  minHeight: '40px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}>
                  {nuevaVista.filtros?.tags?.map(tag => renderTag(tag, () => {
                    setNuevaVista(prev => ({
                      ...prev,
                      filtros: {
                        ...prev.filtros!,
                        tags: prev.filtros!.tags.filter(t => t !== tag)
                      }
                    }));
                  }))}
                </div>
              </div>

              {/* Estados */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Estados
                </label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {['borrador', 'enviado', 'revision', 'aprobado', 'rechazado'].map(estado => (
                    <label key={estado} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={nuevaVista.filtros?.estados?.includes(estado) || false}
                        onChange={(e) => {
                          const estadosActuales = nuevaVista.filtros?.estados || [];
                          const nuevosEstados = e.target.checked ?
                            [...estadosActuales, estado] :
                            estadosActuales.filter(e => e !== estado);
                          
                          setNuevaVista(prev => ({
                            ...prev,
                            filtros: {
                              ...prev.filtros!,
                              estados: nuevosEstados
                            }
                          }));
                        }}
                        style={{ width: '14px', height: '14px' }}
                      />
                      <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                        {estado}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Solo favoritos */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginTop: '12px'
            }}>
              <input
                type="checkbox"
                checked={nuevaVista.filtros?.favoritos || false}
                onChange={(e) => setNuevaVista(prev => ({
                  ...prev,
                  filtros: {
                    ...prev.filtros!,
                    favoritos: e.target.checked
                  }
                }))}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Solo mostrar favoritos
              </span>
            </label>
          </div>

          {/* Configuración visual */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Color
              </label>
              <input
                type="color"
                value={nuevaVista.color || '#3b82f6'}
                onChange={(e) => setNuevaVista(prev => ({ ...prev, color: e.target.value }))}
                style={{
                  width: '100%',
                  height: '40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={nuevaVista.publica || false}
                  onChange={(e) => setNuevaVista(prev => ({ ...prev, publica: e.target.checked }))}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Vista pública
                </span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '8px'
          }}>
            <button
              onClick={crearVistaPersonalizada}
              disabled={!nuevaVista.nombre?.trim()}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: nuevaVista.nombre?.trim() ? '#3b82f6' : '#e5e7eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: nuevaVista.nombre?.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Crear Vista
            </button>
            <button
              onClick={() => setMostrarCrearVista(false)}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'white',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER PRINCIPAL
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
              Sistema de Tags y Vistas Personalizadas
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontWeight: '500' }}>
              Organiza con tags • Crea vistas personalizadas • Gestiona favoritos
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMostrarPanelTags(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'white',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <Tag style={{ width: '16px', height: '16px' }} />
              Gestionar Tags
            </button>
            
            <button
              onClick={() => setMostrarCrearVista(true)}
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
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Nueva Vista
            </button>
          </div>
        </div>

        {/* FILTROS RÁPIDOS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Solo favoritos */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '8px 12px',
            background: mostrarSoloFavoritos ? '#fef3c7' : '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <input
              type="checkbox"
              checked={mostrarSoloFavoritos}
              onChange={(e) => setMostrarSoloFavoritos(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <Star style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Solo favoritos ({registros.filter(r => r.favorito).length})
            </span>
          </label>

          {/* Tags más usados */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Tags populares:
            </span>
            {tags
              .filter(t => t.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(tag => (
                <button
                  key={tag.nombre}
                  onClick={() => {
                    if (filtroTags.includes(tag.nombre)) {
                      setFiltroTags(prev => prev.filter(t => t !== tag.nombre));
                    } else {
                      setFiltroTags(prev => [...prev, tag.nombre]);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    background: filtroTags.includes(tag.nombre) ? `${tag.color}20` : 'white',
                    color: filtroTags.includes(tag.nombre) ? tag.color : '#6b7280',
                    border: `1px solid ${filtroTags.includes(tag.nombre) ? tag.color : '#d1d5db'}`,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Hash style={{ width: '12px', height: '12px' }} />
                  {tag.nombre} ({tag.count})
                </button>
              ))}
          </div>

          {/* Limpiar filtros */}
          {(filtroTags.length > 0 || mostrarSoloFavoritos || vistaActiva) && (
            <button
              onClick={limpiarVistas}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '12px', height: '12px' }} />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* VISTAS PERSONALIZADAS */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Bookmark style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
            Vistas Personalizadas
          </h3>
          
          {vistaActiva && (
            <span style={{
              padding: '4px 12px',
              background: '#eff6ff',
              color: '#1d4ed8',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Vista activa: {vistas.find(v => v.id === vistaActiva)?.nombre}
            </span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {vistas.map(vista => (
            <div
              key={vista.id}
              style={{
                padding: '20px',
                background: vistaActiva === vista.id ? `${vista.color}10` : 'white',
                border: `2px solid ${vistaActiva === vista.id ? vista.color : '#e5e7eb'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => aplicarVista(vista.id)}
              onMouseEnter={(e) => {
                if (vistaActiva !== vista.id) {
                  e.currentTarget.style.borderColor = vista.color;
                  e.currentTarget.style.background = `${vista.color}05`;
                }
              }}
              onMouseLeave={(e) => {
                if (vistaActiva !== vista.id) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: vista.color,
                    borderRadius: '50%'
                  }}></div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {vista.nombre}
                  </h4>
                </div>
                
                {vista.publica && (
                  <Eye style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                )}
              </div>

              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: '0 0 16px 0',
                lineHeight: '1.4'
              }}>
                {vista.descripcion}
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '12px'
              }}>
                {vista.filtros.tags.slice(0, 3).map(tag => renderTag(tag))}
                {vista.filtros.tags.length > 3 && (
                  <span style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    borderRadius: '12px'
                  }}>
                    +{vista.filtros.tags.length - 3} más
                  </span>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#9ca3af'
              }}>
                <span>
                  Por {vista.usuarioCreador}
                </span>
                <span>
                  {vista.fechaCreacion.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        overflow: 'hidden'
      }}>
        
        {/* HEADER DE TABLA */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                Registros FRI con Tags y Favoritos
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                {registrosFiltrados.length} de {registros.length} registros mostrados
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star style={{ width: '14px', height: '14px' }} />
                <span>Favoritos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag style={{ width: '14px', height: '14px' }} />
                <span>Tags</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  ID
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  TÍTULO
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  ESTADO
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  TAGS
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  MUNICIPIO
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  FAVORITO
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map((registro) => (
                <tr
                  key={registro.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#2563eb' }}>
                    {registro.id}
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {registro.titulo}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {registro.periodo}
                      </div>
                    </div>
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      background: registro.estado === 'aprobado' ? '#dcfce7' : 
                                 registro.estado === 'rechazado' ? '#fee2e2' :
                                 registro.estado === 'revision' ? '#fef3c7' :
                                 registro.estado === 'enviado' ? '#dbeafe' : '#f3f4f6',
                      color: registro.estado === 'aprobado' ? '#166534' : 
                             registro.estado === 'rechazado' ? '#991b1b' :
                             registro.estado === 'revision' ? '#92400e' :
                             registro.estado === 'enviado' ? '#1e40af' : '#374151',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {registro.estado === 'borrador' && <Clock style={{ width: '12px', height: '12px' }} />}
                      {registro.estado === 'aprobado' && <CheckCircle style={{ width: '12px', height: '12px' }} />}
                      {registro.estado === 'rechazado' && <AlertTriangle style={{ width: '12px', height: '12px' }} />}
                      {registro.estado.charAt(0).toUpperCase() + registro.estado.slice(1)}
                    </span>
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      maxWidth: '200px'
                    }}>
                      {registro.tags.slice(0, 3).map(tag => renderTag(tag))}
                      {registro.tags.length > 3 && (
                        <span style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          padding: '4px 8px',
                          background: '#f3f4f6',
                          borderRadius: '12px'
                        }}>
                          +{registro.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {registro.municipio}
                      </span>
                    </div>
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => toggleFavorito(registro.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                      }}
                    >
                      {registro.favorito ? (
                        <Star style={{ width: '20px', height: '20px', color: '#f59e0b', fill: '#f59e0b' }} />
                      ) : (
                        <StarOff style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                      )}
                    </button>
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}>
                        <Eye style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      </button>
                      
                      <button style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}>
                        <Edit3 style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      </button>
                      
                      <button style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}>
                        <MoreHorizontal style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          🏷️ Sistema de Tags y Vistas • ⭐ Gestión de Favoritos • 📋 Filtros Inteligentes
        </div>
      </div>

      {/* MODALES */}
      {mostrarPanelTags && renderPanelTags()}
      {mostrarCrearVista && renderCrearVista()}
    </div>
  );
};

export default SistemaTagsVistasPersonalizadas;