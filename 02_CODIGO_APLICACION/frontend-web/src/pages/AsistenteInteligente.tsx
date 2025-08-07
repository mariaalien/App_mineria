import React, { useState, useEffect } from 'react';
import {
  Bot,
  MessageCircle,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Calculator,
  FileText,
  Save,
  Clock,
  Zap,
  Target,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface Sugerencia {
  id: string;
  tipo: 'info' | 'warning' | 'success' | 'calculation';
  titulo: string;
  descripcion: string;
  accion?: string;
  valor?: string | number;
}

interface MensajeChat {
  id: string;
  tipo: 'usuario' | 'asistente';
  mensaje: string;
  timestamp: Date;
  sugerencias?: Sugerencia[];
}

// ============================================================================
// DATOS DEL ASISTENTE
// ============================================================================

const sugerenciasInteligentes: Sugerencia[] = [
  {
    id: '1',
    tipo: 'info',
    titulo: 'Período de producción',
    descripcion: 'Recuerda que el período debe corresponder al mes inmediatamente anterior',
    accion: 'Seleccionar mes anterior'
  },
  {
    id: '2',
    tipo: 'calculation',
    titulo: 'Cálculo automático detectado',
    descripcion: 'Basado en la cantidad extraída, el valor estimado sería:',
    valor: '5,750,000 COP'
  },
  {
    id: '3',
    tipo: 'warning',
    titulo: 'Inconsistencia detectada',
    descripcion: 'El valor de producción parece bajo para la cantidad reportada',
    accion: 'Revisar cálculo'
  },
  {
    id: '4',
    tipo: 'success',
    titulo: 'Campo completado correctamente',
    descripcion: 'Los datos de ubicación están validados con el código DANE',
  }
];

const preguntasFrecuentes = [
  {
    pregunta: '¿Qué unidad de medida debo usar para el oro?',
    respuesta: 'Para el oro, usa "GRAMOS" o "ONZAS" según tu proceso de medición habitual. El sistema convertirá automáticamente para los reportes oficiales.'
  },
  {
    pregunta: '¿Cómo calculo el valor de producción?',
    respuesta: 'Multiplica la cantidad extraída por el precio promedio del mineral en el período. Usa los precios de referencia de la UPME.'
  },
  {
    pregunta: '¿Puedo guardar el formulario sin completarlo?',
    respuesta: 'Sí, el sistema guarda automáticamente tus cambios. También puedes usar el botón "Guardar Borrador" para guardado manual.'
  },
  {
    pregunta: '¿Qué pasa si cometo un error después de enviar?',
    respuesta: 'Puedes editar el formulario hasta 48 horas después del envío. Después requiere aprobación del supervisor.'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const AsistenteInteligenteFRI: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'sugerencias' | 'chat' | 'ayuda'>('sugerencias');
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: '1',
      tipo: 'asistente',
      mensaje: '¡Hola! Soy tu asistente inteligente para formularios FRI. Estoy aquí para ayudarte a completar tu formulario de manera eficiente y sin errores.',
      timestamp: new Date(),
    }
  ]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSave, setLastSave] = useState<Date | null>(null);

  // ============================================================================
  // AUTO-SAVE SIMULATION
  // ============================================================================

  useEffect(() => {
    if (autoSaveEnabled) {
      const interval = setInterval(() => {
        setLastSave(new Date());
      }, 30000); // Auto-save cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoSaveEnabled]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSendMessage = () => {
    if (!nuevoMensaje.trim()) return;

    const mensajeUsuario: MensajeChat = {
      id: Date.now().toString(),
      tipo: 'usuario',
      mensaje: nuevoMensaje,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, mensajeUsuario]);

    // Simular respuesta del asistente
    setTimeout(() => {
      const respuestaAsistente: MensajeChat = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        mensaje: generarRespuestaAsistente(nuevoMensaje),
        timestamp: new Date(),
        sugerencias: generarSugerenciasContextuales(nuevoMensaje)
      };

      setMensajes(prev => [...prev, respuestaAsistente]);
    }, 1000);

    setNuevoMensaje('');
  };

  const generarRespuestaAsistente = (pregunta: string): string => {
    const preguntaLower = pregunta.toLowerCase();
    
    if (preguntaLower.includes('valor') || preguntaLower.includes('precio')) {
      return 'Para calcular el valor de producción, multiplica la cantidad extraída por el precio unitario del mineral. Te recomiendo usar los precios de referencia oficiales de la UPME para tu región.';
    }
    
    if (preguntaLower.includes('unidad') || preguntaLower.includes('medida')) {
      return 'Las unidades de medida más comunes son: Toneladas (para carbón, hierro), Gramos u Onzas (para metales preciosos), y Metros cúbicos (para materiales de construcción).';
    }
    
    if (preguntaLower.includes('municipio') || preguntaLower.includes('código')) {
      return 'El código DANE se completa automáticamente al seleccionar el municipio. Este código es fundamental para la correcta georreferenciación de tu actividad minera.';
    }
    
    return 'Entiendo tu consulta. ¿Podrías ser más específico sobre qué aspecto del formulario necesitas aclarar? Estoy aquí para ayudarte con cualquier campo o cálculo.';
  };

  const generarSugerenciasContextuales = (pregunta: string): Sugerencia[] => {
    const preguntaLower = pregunta.toLowerCase();
    
    if (preguntaLower.includes('valor')) {
      return [
        {
          id: 'calc-1',
          tipo: 'calculation',
          titulo: 'Calculadora de valor',
          descripcion: 'Usa nuestra calculadora integrada para obtener el valor exacto',
          accion: 'Abrir calculadora'
        }
      ];
    }
    
    return [];
  };

  const getIconoSugerencia = (tipo: string) => {
    switch (tipo) {
      case 'info':
        return <Info style={{ width: '16px', height: '16px', color: '#3b82f6' }} />;
      case 'warning':
        return <AlertCircle style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
      case 'success':
        return <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />;
      case 'calculation':
        return <Calculator style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />;
      default:
        return <Lightbulb style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  const getColorSugerencia = (tipo: string) => {
    switch (tipo) {
      case 'info':
        return { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af' };
      case 'warning':
        return { bg: '#fffbeb', border: '#fed7aa', text: '#92400e' };
      case 'success':
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' };
      case 'calculation':
        return { bg: '#faf5ff', border: '#e9d5ff', text: '#7c2d12' };
      default:
        return { bg: '#f9fafb', border: '#e5e7eb', text: '#374151' };
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* BOTÓN FLOTANTE */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            animation: 'bounce 2s infinite'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.4)';
          }}
        >
          <Bot style={{ width: '28px', height: '28px', color: 'white' }} />
        </button>
      )}

      {/* PANEL EXPANDIDO */}
      {isExpanded && (
        <div style={{
          width: '400px',
          height: '600px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* HEADER */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px'
                }}>
                  <Bot style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                    Asistente FRI
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                    Tu ayudante inteligente
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* TABS */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}>
              {[
                { id: 'sugerencias', label: 'Sugerencias', icon: Lightbulb },
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'ayuda', label: 'Ayuda', icon: HelpCircle }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <Icon style={{ width: '14px', height: '14px' }} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENIDO */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* TAB SUGERENCIAS */}
            {activeTab === 'sugerencias' && (
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 12px 0'
                  }}>
                    Sugerencias Inteligentes
                  </h4>
                  
                  {/* AUTO-SAVE STATUS */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: autoSaveEnabled ? '#f0fdf4' : '#fef3c7',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    {autoSaveEnabled ? (
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                    ) : (
                      <Clock style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: autoSaveEnabled ? '#166534' : '#92400e'
                      }}>
                        Auto-guardado {autoSaveEnabled ? 'activo' : 'pausado'}
                      </div>
                      {lastSave && (
                        <div style={{
                          fontSize: '11px',
                          color: '#6b7280'
                        }}>
                          Último guardado: {lastSave.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Save style={{ 
                        width: '14px', 
                        height: '14px', 
                        color: autoSaveEnabled ? '#16a34a' : '#6b7280' 
                      }} />
                    </button>
                  </div>
                </div>

                {/* LISTA DE SUGERENCIAS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sugerenciasInteligentes.map(sugerencia => {
                    const colors = getColorSugerencia(sugerencia.tipo);
                    
                    return (
                      <div
                        key={sugerencia.id}
                        style={{
                          padding: '16px',
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '12px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}>
                          <div style={{
                            padding: '6px',
                            background: 'white',
                            borderRadius: '8px',
                            flexShrink: 0
                          }}>
                            {getIconoSugerencia(sugerencia.tipo)}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <h5 style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: colors.text,
                              margin: '0 0 6px 0'
                            }}>
                              {sugerencia.titulo}
                            </h5>
                            <p style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              margin: '0 0 8px 0',
                              lineHeight: '1.4'
                            }}>
                              {sugerencia.descripcion}
                            </p>
                            
                            {sugerencia.valor && (
                              <div style={{
                                padding: '8px 12px',
                                background: 'white',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#1f2937',
                                marginBottom: '8px'
                              }}>
                                {sugerencia.valor}
                              </div>
                            )}
                            
                            {sugerencia.accion && (
                              <button style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: colors.text,
                                background: 'white',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer'
                              }}>
                                {sugerencia.accion}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CHAT */}
            {activeTab === 'chat' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* MENSAJES */}
                <div style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {mensajes.map(mensaje => (
                    <div
                      key={mensaje.id}
                      style={{
                        display: 'flex',
                        flexDirection: mensaje.tipo === 'usuario' ? 'row-reverse' : 'row',
                        gap: '12px',
                        alignItems: 'flex-start'
                      }}
                    >
                      {/* AVATAR */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: mensaje.tipo === 'usuario' 
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {mensaje.tipo === 'usuario' ? (
                          <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>
                            MG
                          </span>
                        ) : (
                          <Bot style={{ width: '16px', height: '16px', color: 'white' }} />
                        )}
                      </div>
                      
                      {/* MENSAJE */}
                      <div style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        background: mensaje.tipo === 'usuario' 
                          ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          : '#f9fafb',
                        color: mensaje.tipo === 'usuario' ? 'white' : '#1f2937',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {mensaje.mensaje}
                        
                        {/* SUGERENCIAS DEL MENSAJE */}
                        {mensaje.sugerencias && mensaje.sugerencias.length > 0 && (
                          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {mensaje.sugerencias.map(sug => (
                              <div
                                key={sug.id}
                                style={{
                                  padding: '8px 12px',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  borderRadius: '8px',
                                  fontSize: '12px'
                                }}
                              >
                                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                  {sug.titulo}
                                </div>
                                <div style={{ opacity: 0.9 }}>
                                  {sug.descripcion}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* INPUT DE MENSAJE */}
                <div style={{
                  padding: '16px 20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-end'
                  }}>
                    <input
                      type="text"
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Pregunta sobre el formulario..."
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!nuevoMensaje.trim()}
                      style={{
                        padding: '12px',
                        background: nuevoMensaje.trim() 
                          ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          : '#e5e7eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: nuevoMensaje.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <Send style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB AYUDA */}
            {activeTab === 'ayuda' && (
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 16px 0'
                }}>
                  Preguntas Frecuentes
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {preguntasFrecuentes.map((faq, index) => (
                    <details
                      key={index}
                      style={{
                        padding: '16px',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <summary style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1f2937',
                        cursor: 'pointer',
                        listStyle: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <HelpCircle style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                        {faq.pregunta}
                      </summary>
                      <div style={{
                        marginTop: '12px',
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        paddingLeft: '24px'
                      }}>
                        {faq.respuesta}
                      </div>
                    </details>
                  ))}
                </div>

                {/* CALCULADORAS Y HERRAMIENTAS */}
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 16px 0'
                  }}>
                    Herramientas Útiles
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { icon: Calculator, titulo: 'Calculadora de Valor', descripcion: 'Calcula automáticamente el valor de producción' },
                      { icon: Target, titulo: 'Validador DANE', descripcion: 'Verifica códigos de municipio' },
                      { icon: TrendingUp, titulo: 'Análisis de Tendencias', descripcion: 'Compara con períodos anteriores' },
                      { icon: FileText, titulo: 'Plantillas', descripcion: 'Descarga plantillas pre-llenadas' }
                    ].map((herramienta, index) => {
                      const Icon = herramienta.icon;
                      
                      return (
                        <button
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f9fafb';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }}
                        >
                          <div style={{
                            padding: '8px',
                            background: '#eff6ff',
                            borderRadius: '8px'
                          }}>
                            <Icon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                          </div>
                          <div>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {herramienta.titulo}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6b7280'
                            }}>
                              {herramienta.descripcion}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANIMACIONES CSS */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0,-8px,0);
            }
            70% {
              transform: translate3d(0,-4px,0);
            }
            90% {
              transform: translate3d(0,-2px,0);
            }
          }
          
          details[open] summary {
            margin-bottom: 8px;
          }
          
          details summary::-webkit-details-marker {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default AsistenteInteligenteFRI;