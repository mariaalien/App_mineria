// =============================================================================
// ✨ FLOATING ACTION BUTTON - ACCESIBILIDAD Y PWA
// Botón flotante para acceder rápidamente a configuraciones
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  Settings,
  Download,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Contrast,
  Type,
  MousePointer,
  Keyboard,
  Smartphone,
  Monitor,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown,
  Headphones
} from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

// =============================================================================
// COMPONENTE PANEL DE CONFIGURACIÓN DE ACCESIBILIDAD
// =============================================================================

const AccessibilityPanel: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
}> = ({ isOpen, onClose }) => {
  const { settings, updateSetting, announceToScreenReader } = useAccessibility();

  if (!isOpen) return null;

  const settingsGroups = [
    {
      title: 'Visual',
      icon: Eye,
      settings: [
        {
          key: 'highContrast' as keyof typeof settings,
          label: 'Alto contraste',
          description: 'Mejora la visibilidad del contenido',
          type: 'toggle'
        },
        {
          key: 'largeText' as keyof typeof settings,
          label: 'Texto grande',
          description: 'Aumenta el tamaño del texto',
          type: 'toggle'
        },
        {
          key: 'fontSize' as keyof typeof settings,
          label: 'Tamaño de fuente',
          description: 'Ajustar tamaño base del texto',
          type: 'select',
          options: [
            { value: 'small', label: 'Pequeño' },
            { value: 'medium', label: 'Mediano' },
            { value: 'large', label: 'Grande' },
            { value: 'x-large', label: 'Extra grande' }
          ]
        },
        {
          key: 'colorBlindMode' as keyof typeof settings,
          label: 'Modo daltonismo',
          description: 'Filtros para daltónicos',
          type: 'select',
          options: [
            { value: 'none', label: 'Ninguno' },
            { value: 'protanopia', label: 'Protanopia' },
            { value: 'deuteranopia', label: 'Deuteranopia' },
            { value: 'tritanopia', label: 'Tritanopia' }
          ]
        }
      ]
    },
    {
      title: 'Motor',
      icon: MousePointer,
      settings: [
        {
          key: 'reducedMotion' as keyof typeof settings,
          label: 'Animaciones reducidas',
          description: 'Reduce o elimina animaciones',
          type: 'toggle'
        },
        {
          key: 'keyboardNavigation' as keyof typeof settings,
          label: 'Navegación por teclado',
          description: 'Habilita atajos de teclado',
          type: 'toggle'
        },
        {
          key: 'focusIndicators' as keyof typeof settings,
          label: 'Indicadores de foco',
          description: 'Resalta elementos enfocados',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Auditivo',
      icon: Headphones,
      settings: [
        {
          key: 'soundEnabled' as keyof typeof settings,
          label: 'Sonidos del sistema',
          description: 'Feedback auditivo para acciones',
          type: 'toggle'
        },
        {
          key: 'screenReader' as keyof typeof settings,
          label: 'Lector de pantalla',
          description: 'Anuncios para lectores de pantalla',
          type: 'toggle'
        }
      ]
    }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      role="dialog"
      aria-labelledby="accessibility-panel-title"
      aria-modal="true"
    >
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              borderRadius: '12px'
            }}>
              <Accessibility style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <h2 
              id="accessibility-panel-title"
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}
            >
              Configuración de Accesibilidad
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#6b7280',
              transition: 'all 0.2s'
            }}
            aria-label="Cerrar panel de accesibilidad"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {settingsGroups.map((group) => {
            const IconComponent = group.icon;
            return (
              <div key={group.title}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '16px' 
                }}>
                  <IconComponent size={18} style={{ color: '#6b7280' }} />
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {group.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {group.settings.map((setting) => (
                    <div key={setting.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #f3f4f6'
                    }}>
                      <div style={{ flex: 1 }}>
                        <label 
                          style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#1f2937',
                            display: 'block',
                            marginBottom: '4px'
                          }}
                        >
                          {setting.label}
                        </label>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {setting.description}
                        </p>
                      </div>

                      <div style={{ marginLeft: '16px' }}>
                        {setting.type === 'toggle' ? (
                          <button
                            onClick={() => {
                              updateSetting(setting.key, !settings[setting.key]);
                            }}
                            style={{
                              position: 'relative',
                              width: '48px',
                              height: '24px',
                              background: settings[setting.key] ? '#10b981' : '#d1d5db',
                              borderRadius: '12px',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            aria-label={`${setting.label}: ${settings[setting.key] ? 'activado' : 'desactivado'}`}
                            role="switch"
                            aria-checked={!!settings[setting.key]}
                          >
                            <div style={{
                              position: 'absolute',
                              top: '2px',
                              left: settings[setting.key] ? '26px' : '2px',
                              width: '20px',
                              height: '20px',
                              background: 'white',
                              borderRadius: '50%',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }} />
                          </button>
                        ) : setting.type === 'select' ? (
                          <select
                            value={settings[setting.key] as string}
                            onChange={(e) => updateSetting(setting.key, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              background: 'white',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                            aria-label={setting.label}
                          >
                            {setting.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 12px 0'
          }}>
            Estas configuraciones se guardan localmente en tu navegador
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                const defaults = {
                  highContrast: false,
                  largeText: false,
                  reducedMotion: false,
                  screenReader: false,
                  keyboardNavigation: true,
                  focusIndicators: true,
                  colorBlindMode: 'none',
                  fontSize: 'medium',
                  soundEnabled: true
                };
                Object.entries(defaults).forEach(([key, value]) => {
                  updateSetting(key as keyof typeof settings, value);
                });
                announceToScreenReader('Configuración restaurada a valores por defecto');
              }}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              Restablecer por defecto
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                color: 'white',
                fontWeight: '500'
              }}
            >
              Guardar y cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE FAB PRINCIPAL
// =============================================================================

const AccessibilityFAB: React.FC = () => {
  const { settings, pwaState, updateSetting, installPWA, announceToScreenReader } = useAccessibility();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  // =========================================================================
  // EFECTOS
  // =========================================================================

  useEffect(() => {
    // Cargar posición guardada
    const savedPosition = localStorage.getItem('anm-fab-position');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (error) {
        console.warn('Error cargando posición del FAB:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Guardar posición
    localStorage.setItem('anm-fab-position', JSON.stringify(position));
  }, [position]);

  // =========================================================================
  // FUNCIONES DE DRAG
  // =========================================================================

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(10, Math.min(window.innerWidth - 70, e.clientX - offsetX));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, e.clientY - offsetY));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // =========================================================================
  // ACCIONES RÁPIDAS
  // =========================================================================

  const quickActions = [
    {
      id: 'high-contrast',
      icon: Contrast,
      label: 'Alto Contraste',
      active: settings.highContrast,
      action: () => {
        updateSetting('highContrast', !settings.highContrast);
        announceToScreenReader(`Alto contraste ${!settings.highContrast ? 'activado' : 'desactivado'}`);
      }
    },
    {
      id: 'large-text',
      icon: Type,
      label: 'Texto Grande',
      active: settings.largeText,
      action: () => {
        updateSetting('largeText', !settings.largeText);
        announceToScreenReader(`Texto grande ${!settings.largeText ? 'activado' : 'desactivado'}`);
      }
    },
    {
      id: 'reduced-motion',
      icon: MousePointer,
      label: 'Reducir Animaciones',
      active: settings.reducedMotion,
      action: () => {
        updateSetting('reducedMotion', !settings.reducedMotion);
        announceToScreenReader(`Animaciones reducidas ${!settings.reducedMotion ? 'activadas' : 'desactivadas'}`);
      }
    },
    {
      id: 'sound-toggle',
      icon: settings.soundEnabled ? Volume2 : VolumeX,
      label: settings.soundEnabled ? 'Silenciar' : 'Activar Sonido',
      active: settings.soundEnabled,
      action: () => {
        updateSetting('soundEnabled', !settings.soundEnabled);
        announceToScreenReader(`Sonidos ${!settings.soundEnabled ? 'activados' : 'desactivados'}`);
      }
    },
    {
      id: 'screen-reader',
      icon: settings.screenReader ? Eye : EyeOff,
      label: 'Lector de Pantalla',
      active: settings.screenReader,
      action: () => {
        updateSetting('screenReader', !settings.screenReader);
        announceToScreenReader(`Lector de pantalla ${!settings.screenReader ? 'activado' : 'desactivado'}`);
      }
    }
  ];

  // =========================================================================
  // RENDERIZADO
  // =========================================================================

  return (
    <>
      {/* Botón Principal FAB */}
      <div
        style={{
          position: 'fixed',
          right: `${position.x}px`,
          bottom: `${position.y}px`,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        {/* Acciones Rápidas */}
        {isExpanded && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '8px',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: 'none',
                    background: action.active 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    color: action.active ? 'white' : '#6b7280',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)',
                    animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label={action.label}
                  title={action.label}
                >
                  <IconComponent size={20} />
                </button>
              );
            })}

            {/* Separador */}
            <div style={{
              width: '48px',
              height: '1px',
              background: 'rgba(0, 0, 0, 0.1)',
              margin: '4px 0'
            }} />

            {/* Botón PWA Install */}
            {pwaState.isInstallable && (
              <button
                onClick={installPWA}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  animation: 'slideInRight 0.3s ease-out 0.6s both'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Instalar aplicación"
                title="Instalar aplicación"
              >
                <Download size={20} />
              </button>
            )}

            {/* Botón Configuración Completa */}
            <button
              onClick={() => {
                setShowPanel(true);
                setIsExpanded(false);
                announceToScreenReader('Panel de configuración de accesibilidad abierto');
              }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                animation: `slideInRight 0.3s ease-out ${pwaState.isInstallable ? '0.7s' : '0.6s'} both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Configuración completa de accesibilidad"
              title="Configuración completa"
            >
              <Settings size={20} />
            </button>
          </div>
        )}

        {/* Botón Principal */}
        <button
          onMouseDown={handleMouseDown}
          onClick={() => {
            if (!isDragging) {
              setIsExpanded(!isExpanded);
              announceToScreenReader(`Panel de accesibilidad ${!isExpanded ? 'expandido' : 'colapsado'}`);
            }
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.4)';
            }
          }}
          aria-label={`Menú de accesibilidad ${isExpanded ? 'expandido' : 'colapsado'}`}
          aria-expanded={isExpanded}
          aria-haspopup="menu"
        >
          {/* Icono principal */}
          <div style={{
            position: 'absolute',
            transition: 'all 0.3s ease',
            transform: isExpanded ? 'rotate(180deg) scale(0)' : 'rotate(0deg) scale(1)'
          }}>
            <Accessibility size={28} />
          </div>
          
          {/* Icono cuando está expandido */}
          <div style={{
            position: 'absolute',
            transition: 'all 0.3s ease',
            transform: isExpanded ? 'rotate(0deg) scale(1)' : 'rotate(-180deg) scale(0)'
          }}>
            <X size={28} />
          </div>

          {/* Indicador de estado online/offline */}
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: pwaState.isOnline ? '#10b981' : '#ef4444',
            border: '2px solid white',
            animation: pwaState.isOnline ? 'none' : 'pulse 2s infinite'
          }} />
        </button>

        {/* Indicador de arrastre */}
        {isDragging && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            Arrastra para mover
          </div>
        )}
      </div>

      {/* Panel de Configuración */}
      <AccessibilityPanel 
        isOpen={showPanel} 
        onClose={() => setShowPanel(false)} 
      />

      {/* Estilos CSS para animaciones */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(60px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
    </>
  );
};

// =============================================================================
// COMPONENTE DE INDICADORES DE ESTADO
// =============================================================================

export const StatusIndicators: React.FC = () => {
  const { pwaState, settings } = useAccessibility();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const indicators = [
    {
      id: 'connection',
      icon: pwaState.isOnline ? Wifi : WifiOff,
      color: pwaState.isOnline ? '#10b981' : '#ef4444',
      label: pwaState.isOnline ? 'En línea' : 'Sin conexión',
      active: true
    },
    {
      id: 'pwa',
      icon: pwaState.isInstalled ? Smartphone : Monitor,
      color: pwaState.isInstalled ? '#2563eb' : '#6b7280',
      label: pwaState.isInstalled ? 'PWA instalada' : 'Navegador web',
      active: pwaState.isInstalled
    },
    {
      id: 'accessibility',
      icon: Accessibility,
      color: settings.highContrast || settings.largeText || settings.screenReader ? '#8b5cf6' : '#6b7280',
      label: 'Accesibilidad activada',
      active: settings.highContrast || settings.largeText || settings.screenReader
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      display: 'flex',
      gap: '8px',
      zIndex: 1000
    }}>
      {indicators.map((indicator) => {
        const IconComponent = indicator.icon;
        
        return (
          <div
            key={indicator.id}
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              border: `2px solid ${indicator.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              cursor: 'help',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setShowTooltip(indicator.id)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <IconComponent 
              size={16} 
              style={{ color: indicator.color }}
            />
            
            {/* Tooltip */}
            {showTooltip === indicator.id && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                zIndex: 1001,
                animation: 'fadeIn 0.2s ease'
              }}>
                {indicator.label}
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: '4px solid rgba(0, 0, 0, 0.8)'
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AccessibilityFAB;