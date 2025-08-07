import React, { useState, useCallback } from 'react';
import {
  Edit3,
  Check,
  X,
  Save,
  Trash2,
  Copy,
  Archive,
  Send,
  RefreshCw,
  History,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  MoreHorizontal,
  Calendar,
  Tag,
  Download,
  Upload,
  Settings
} from 'lucide-react';

// ============================================================================
// INTERFACES
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
  version: number;
  historial: HistorialCambio[];
}

interface HistorialCambio {
  id: string;
  fecha: Date;
  usuario: string;
  accion: 'crear' | 'editar' | 'cambiar_estado' | 'comentar';
  campo?: string;
  valorAnterior?: any;
  valorNuevo?: any;
  comentario?: string;
}

interface BulkOperation {
  tipo: 'cambiar_estado' | 'asignar_tags' | 'cambiar_usuario' | 'exportar' | 'eliminar' | 'duplicar';
  datos?: any;
}

// ============================================================================
// DATOS MOCK CON HISTORIAL
// ============================================================================

const mockHistorial: HistorialCambio[] = [
  {
    id: 'h1',
    fecha: new Date('2024-10-16T10:30:00'),
    usuario: 'María González',
    accion: 'editar',
    campo: 'valorProduccion',
    valorAnterior: 5000000,
    valorNuevo: 5500000,
    comentario: 'Actualización de valor según nueva evaluación'
  },
  {
    id: 'h2',
    fecha: new Date('2024-10-15T14:15:00'),
    usuario: 'Carlos Supervisor',
    accion: 'cambiar_estado',
    valorAnterior: 'enviado',
    valorNuevo: 'aprobado',
    comentario: 'Revisión completada, todo correcto'
  },
  {
    id: 'h3',
    fecha: new Date('2024-10-15T09:00:00'),
    usuario: 'María González',
    accion: 'crear',
    comentario: 'Creación inicial del formulario'
  }
];

const mockRegistros: FRIRecord[] = [
  {
    id: 'FRI-2025-001',
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
    tags: ['oro', 'mensual', 'prioritario'],
    version: 3,
    historial: mockHistorial
  },
  {
    id: 'FRI-2025-002',
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
    tags: ['inventario', 'mensual'],
    version: 1,
    historial: []
  }
];

const estadosDisponibles = ['borrador', 'enviado', 'revision', 'aprobado', 'rechazado'];
const usuariosDisponibles = ['María González', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Pérez', 'Carmen López'];
const tagsDisponibles = ['oro', 'plata', 'carbon', 'mensual', 'trimestral', 'anual', 'prioritario', 'importante', 'revision'];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const EdicionInlineBulkOps: React.FC = () => {
  const [registros, setRegistros] = useState<FRIRecord[]>(mockRegistros);
  const [registrosSeleccionados, setRegistrosSeleccionados] = useState<Set<string>>(new Set());
  const [registroEditando, setRegistroEditando] = useState<string | null>(null);
  const [valoresEdicion, setValoresEdicion] = useState<Partial<FRIRecord>>({});
  const [mostrarHistorial, setMostrarHistorial] = useState<string | null>(null);
  const [mostrarBulkPanel, setMostrarBulkPanel] = useState(false);
  const [operacionBulk, setOperacionBulk] = useState<BulkOperation | null>(null);

  // ============================================================================
  // EDICIÓN INLINE
  // ============================================================================

  const iniciarEdicion = useCallback((registro: FRIRecord) => {
    setRegistroEditando(registro.id);
    setValoresEdicion({
      titulo: registro.titulo,
      observaciones: registro.observaciones,
      valorProduccion: registro.valorProduccion,
      cantidadExtraida: registro.cantidadExtraida,
      estado: registro.estado
    });
  }, []);

  const cancelarEdicion = useCallback(() => {
    setRegistroEditando(null);
    setValoresEdicion({});
  }, []);

  const guardarEdicion = useCallback(() => {
    if (!registroEditando) return;

    const registroOriginal = registros.find(r => r.id === registroEditando);
    if (!registroOriginal) return;

    // Crear entrada de historial para cada campo modificado
    const nuevasEntradas: HistorialCambio[] = [];
    const fechaActual = new Date();

    Object.entries(valoresEdicion).forEach(([campo, valorNuevo]) => {
      const valorAnterior = registroOriginal[campo as keyof FRIRecord];
      if (valorAnterior !== valorNuevo) {
        nuevasEntradas.push({
          id: `h_${Date.now()}_${campo}`,
          fecha: fechaActual,
          usuario: 'Usuario Actual',
          accion: 'editar',
          campo,
          valorAnterior,
          valorNuevo,
          comentario: `Campo ${campo} actualizado`
        });
      }
    });

    // Actualizar registro
    setRegistros(prev => prev.map(r => 
      r.id === registroEditando ? {
        ...r,
        ...valoresEdicion,
        fechaModificacion: fechaActual,
        version: r.version + 1,
        historial: [...nuevasEntradas, ...r.historial]
      } : r
    ));

    setRegistroEditando(null);
    setValoresEdicion({});
  }, [registroEditando, valoresEdicion, registros]);

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const ejecutarOperacionBulk = useCallback((operacion: BulkOperation) => {
    const idsSeleccionados = Array.from(registrosSeleccionados);
    const fechaActual = new Date();

    switch (operacion.tipo) {
      case 'cambiar_estado':
        setRegistros(prev => prev.map(r => {
          if (idsSeleccionados.includes(r.id)) {
            const nuevaEntrada: HistorialCambio = {
              id: `h_${Date.now()}_${r.id}`,
              fecha: fechaActual,
              usuario: 'Usuario Actual',
              accion: 'cambiar_estado',
              valorAnterior: r.estado,
              valorNuevo: operacion.datos.nuevoEstado,
              comentario: `Estado cambiado en operación masiva`
            };

            return {
              ...r,
              estado: operacion.datos.nuevoEstado,
              fechaModificacion: fechaActual,
              version: r.version + 1,
              historial: [nuevaEntrada, ...r.historial]
            };
          }
          return r;
        }));
        break;

      case 'asignar_tags':
        setRegistros(prev => prev.map(r => {
          if (idsSeleccionados.includes(r.id)) {
            const tagsUnicos = new Set([...r.tags, ...operacion.datos.tags]);
            const nuevosTags = Array.from(tagsUnicos);
            const nuevaEntrada: HistorialCambio = {
              id: `h_${Date.now()}_${r.id}`,
              fecha: fechaActual,
              usuario: 'Usuario Actual',
              accion: 'editar',
              campo: 'tags',
              valorAnterior: r.tags,
              valorNuevo: nuevosTags,
              comentario: `Tags agregados en operación masiva`
            };

            return {
              ...r,
              tags: nuevosTags,
              fechaModificacion: fechaActual,
              version: r.version + 1,
              historial: [nuevaEntrada, ...r.historial]
            };
          }
          return r;
        }));
        break;

      case 'duplicar':
        const registrosDuplicados = registros
          .filter(r => idsSeleccionados.includes(r.id))
          .map(r => ({
            ...r,
            id: `${r.id}-COPY-${Date.now()}`,
            titulo: `${r.titulo} (Copia)`,
            estado: 'borrador' as const,
            fechaCreacion: fechaActual,
            fechaModificacion: fechaActual,
            version: 1,
            historial: [{
              id: `h_${Date.now()}`,
              fecha: fechaActual,
              usuario: 'Usuario Actual',
              accion: 'crear' as const,
              comentario: `Duplicado desde ${r.id}`
            }]
          }));
        
        setRegistros(prev => [...prev, ...registrosDuplicados]);
        break;

      case 'eliminar':
        setRegistros(prev => prev.filter(r => !idsSeleccionados.includes(r.id)));
        break;

      case 'exportar':
        // Simular exportación
        const datosExport = registros.filter(r => idsSeleccionados.includes(r.id));
        console.log('Exportando:', datosExport);
        alert(`Exportando ${datosExport.length} registros`);
        break;
    }

    setRegistrosSeleccionados(new Set());
    setMostrarBulkPanel(false);
    setOperacionBulk(null);
  }, [registrosSeleccionados, registros]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCeldaEditable = (registro: FRIRecord, campo: keyof FRIRecord, tipo: 'text' | 'number' | 'select' = 'text', opciones?: string[]) => {
    const estaEditando = registroEditando === registro.id;
    const valor = estaEditando ? 
      (valoresEdicion[campo] ?? registro[campo]) : 
      registro[campo];

    if (!estaEditando) {
      return (
        <div style={{
          padding: '8px',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        onClick={() => iniciarEdicion(registro)}
        >
          {typeof valor === 'number' ? valor?.toLocaleString() : String(valor || '')}
        </div>
      );
    }

    if (tipo === 'select' && opciones) {
      return (
        <select
          value={String(valor || '')}
          onChange={(e) => setValoresEdicion(prev => ({ ...prev, [campo]: e.target.value }))}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }}
        >
          {opciones.map(opcion => (
            <option key={opcion} value={opcion}>
              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={tipo}
        value={String(valor || '')}
        onChange={(e) => {
          const nuevoValor = tipo === 'number' ? 
            parseFloat(e.target.value) || 0 : 
            e.target.value;
          setValoresEdicion(prev => ({ ...prev, [campo]: nuevoValor }));
        }}
        style={{
          width: '100%',
          padding: '6px 8px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none'
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') guardarEdicion();
          if (e.key === 'Escape') cancelarEdicion();
        }}
      />
    );
  };

  const renderHistorial = (historial: HistorialCambio[]) => (
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
            <History style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            Historial de Cambios
          </h3>
          <button
            onClick={() => setMostrarHistorial(null)}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {historial.map((entrada) => (
            <div
              key={entrada.id}
              style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {entrada.accion === 'crear' && <FileText style={{ width: '16px', height: '16px', color: '#10b981' }} />}
                  {entrada.accion === 'editar' && <Edit3 style={{ width: '16px', height: '16px', color: '#2563eb' }} />}
                  {entrada.accion === 'cambiar_estado' && <RefreshCw style={{ width: '16px', height: '16px', color: '#f59e0b' }} />}
                  
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {entrada.accion === 'crear' && 'Registro creado'}
                    {entrada.accion === 'editar' && `Campo ${entrada.campo} editado`}
                    {entrada.accion === 'cambiar_estado' && 'Estado cambiado'}
                  </span>
                </div>
                
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {entrada.fecha.toLocaleString()}
                </span>
              </div>

              {entrada.valorAnterior !== undefined && entrada.valorNuevo !== undefined && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                  fontSize: '13px'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '6px'
                  }}>
                    {String(entrada.valorAnterior)}
                  </span>
                  <span style={{ color: '#6b7280' }}>→</span>
                  <span style={{
                    padding: '4px 8px',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '6px'
                  }}>
                    {String(entrada.valorNuevo)}
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <User style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    {entrada.usuario}
                  </span>
                </div>
                
                {entrada.comentario && (
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    {entrada.comentario}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBulkPanel = () => (
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
        maxWidth: '500px',
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
            margin: 0
          }}>
            Operaciones Masivas
          </h3>
          <button
            onClick={() => setMostrarBulkPanel(false)}
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

        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          {registrosSeleccionados.size} registros seleccionados
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { tipo: 'cambiar_estado', icono: RefreshCw, label: 'Cambiar Estado', color: '#3b82f6' },
            { tipo: 'asignar_tags', icono: Tag, label: 'Asignar Tags', color: '#10b981' },
            { tipo: 'duplicar', icono: Copy, label: 'Duplicar Registros', color: '#f59e0b' },
            { tipo: 'exportar', icono: Download, label: 'Exportar Datos', color: '#8b5cf6' },
            { tipo: 'eliminar', icono: Trash2, label: 'Eliminar Registros', color: '#dc2626' }
          ].map((op) => {
            const Icono = op.icono;
            
            return (
              <button
                key={op.tipo}
                onClick={() => setOperacionBulk({ tipo: op.tipo as any })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${op.color}10`;
                  e.currentTarget.style.borderColor = `${op.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <Icono style={{ width: '18px', height: '18px', color: op.color }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {op.label}
                </span>
              </button>
            );
          })}
        </div>

        {operacionBulk && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '12px'
          }}>
            {operacionBulk.tipo === 'cambiar_estado' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nuevo Estado:
                </label>
                <select
                  onChange={(e) => setOperacionBulk(prev => ({
                    ...prev!,
                    datos: { nuevoEstado: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Seleccionar estado</option>
                  {estadosDisponibles.map(estado => (
                    <option key={estado} value={estado}>
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {operacionBulk.tipo === 'asignar_tags' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Tags a agregar:
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {tagsDisponibles.map(tag => (
                    <label
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const tagsSeleccionados = operacionBulk.datos?.tags || [];
                          const nuevosTags = e.target.checked ?
                            [...tagsSeleccionados, tag] :
                            tagsSeleccionados.filter((t: string) => t !== tag);
                          
                          setOperacionBulk(prev => ({
                            ...prev!,
                            datos: { tags: nuevosTags }
                          }));
                        }}
                        style={{ width: '14px', height: '14px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#374151' }}>
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}>
              <button
                onClick={() => ejecutarOperacionBulk(operacionBulk)}
                disabled={
                  (operacionBulk.tipo === 'cambiar_estado' && !operacionBulk.datos?.nuevoEstado) ||
                  (operacionBulk.tipo === 'asignar_tags' && (!operacionBulk.datos?.tags || operacionBulk.datos.tags.length === 0))
                }
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Ejecutar
              </button>
              <button
                onClick={() => setOperacionBulk(null)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              Edición Inline + Bulk Operations
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontWeight: '500' }}>
              Edita directamente en la tabla • Operaciones masivas • Historial de cambios
            </p>
          </div>

          {registrosSeleccionados.size > 0 && (
            <button
              onClick={() => setMostrarBulkPanel(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
              Operaciones Masivas ({registrosSeleccionados.size})
            </button>
          )}
        </div>
      </div>

      {/* TABLA EDITABLE */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        overflow: 'hidden'
      }}>
        
        {/* INFO HEADER */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                Tabla con Edición Inline
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Haz clic en cualquier celda para editarla • Selecciona múltiples registros para operaciones masivas
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
                <Edit3 style={{ width: '14px', height: '14px' }} />
                <span>Clic para editar</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <History style={{ width: '14px', height: '14px' }} />
                <span>Ver historial</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRegistrosSeleccionados(new Set(registros.map(r => r.id)));
                      } else {
                        setRegistrosSeleccionados(new Set());
                      }
                    }}
                    style={{ width: '16px', height: '16px' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  ID / VERSIÓN
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  TÍTULO
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  ESTADO
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  VALOR PRODUCCIÓN
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  OBSERVACIONES
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr
                  key={registro.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: registroEditando === registro.id ? '#fffbeb' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={registrosSeleccionados.has(registro.id)}
                      onChange={(e) => {
                        const nuevaSeleccion = new Set(registrosSeleccionados);
                        if (e.target.checked) {
                          nuevaSeleccion.add(registro.id);
                        } else {
                          nuevaSeleccion.delete(registro.id);
                        }
                        setRegistrosSeleccionados(nuevaSeleccion);
                      }}
                      style={{ width: '16px', height: '16px' }}
                    />
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2563eb' }}>
                        {registro.id}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        v{registro.version}
                      </div>
                    </div>
                  </td>
                  
                  <td style={{ padding: '12px 16px', minWidth: '200px' }}>
                    {renderCeldaEditable(registro, 'titulo')}
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    {renderCeldaEditable(registro, 'estado', 'select', estadosDisponibles)}
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    {renderCeldaEditable(registro, 'valorProduccion', 'number')}
                  </td>
                  
                  <td style={{ padding: '12px 16px', minWidth: '200px' }}>
                    {renderCeldaEditable(registro, 'observaciones')}
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {registroEditando === registro.id ? (
                        <>
                          <button
                            onClick={guardarEdicion}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Check style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <X style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setMostrarHistorial(registro.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <History style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                          </button>
                          <button
                            onClick={() => iniciarEdicion(registro)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Edit3 style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      {mostrarHistorial && renderHistorial(
        registros.find(r => r.id === mostrarHistorial)?.historial || []
      )}
      
      {mostrarBulkPanel && renderBulkPanel()}
    </div>
  );
};

export default EdicionInlineBulkOps;