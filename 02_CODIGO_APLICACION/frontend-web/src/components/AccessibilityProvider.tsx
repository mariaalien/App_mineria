// =============================================================================
// ✨ ACCESSIBILITY PROVIDER - COMPONENTE SEPARADO
// Sistema de accesibilidad y PWA para el proyecto ANM FRI
// Archivo: frontend-web/src/components/AccessibilityProvider.tsx
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Smartphone, 
  Download,
  CheckCircle,
  AlertTriangle,
  X,
  Settings,
  Accessibility,
  Contrast,
  Type,
  MousePointer,
  Keyboard,
  Headphones
} from 'lucide-react';

// =============================================================================
// TIPOS Y INTERFACES
// =============================================================================

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  soundEnabled: boolean;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  installPrompt: any;
  lastSync: Date | null;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  pwaState: PWAState;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  installPWA: () => void;
  checkForUpdates: () => void;
  announceToScreenReader: (message: string) => void;
}

// =============================================================================
// CONTEXTO DE ACCESIBILIDAD Y PWA
// =============================================================================

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe usarse dentro de AccessibilityProvider');
  }
  return context;
};

const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados de accesibilidad
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindMode: 'none',
    fontSize: 'medium',
    soundEnabled: true
  });

  // Estados PWA
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    installPrompt: null,
    lastSync: null
  });

  // =========================================================================
  // EFECTOS DE INICIALIZACIÓN
  // =========================================================================

  useEffect(() => {
    initializeAccessibility();
    initializePWA();
    setupEventListeners();
  }, []);

  // Aplicar configuraciones de accesibilidad al DOM
  useEffect(() => {
    applyAccessibilitySettings();
  }, [settings]);

  // =========================================================================
  // FUNCIONES DE ACCESIBILIDAD
  // =========================================================================

  const initializeAccessibility = () => {
    // Cargar configuraciones guardadas
    const savedSettings = localStorage.getItem('anm-accessibility-settings');
    if (savedSettings) {
      try {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.warn('Error cargando configuraciones de accesibilidad:', error);
      }
    }

    // Detectar preferencias del sistema
    detectSystemPreferences();
  };

  const detectSystemPreferences = () => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(min-resolution: 2dppx)')
    };

    setSettings(prev => ({
      ...prev,
      reducedMotion: mediaQueries.reducedMotion.matches,
      highContrast: mediaQueries.highContrast.matches
    }));

    // Escuchar cambios en preferencias del sistema
    Object.entries(mediaQueries).forEach(([key, mediaQuery]) => {
      const handler = () => {
        setSettings(prev => ({
          ...prev,
          [key]: mediaQuery.matches
        }));
      };
      
      mediaQuery.addListener(handler);
      
      // Cleanup function
      return () => mediaQuery.removeListener(handler);
    });
  };

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;

    // High Contrast Mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large Text Mode
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Focus Indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Color Blind Mode
    root.className = root.className.replace(/colorblind-\w+/g, '');
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${settings.colorBlindMode}`);
    }

    // Font Size
    root.style.setProperty('--base-font-size', getFontSizeValue(settings.fontSize));

    // Guardar configuraciones
    localStorage.setItem('anm-accessibility-settings', JSON.stringify(settings));
  };

  const getFontSizeValue = (size: string) => {
    const sizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'x-large': '22px'
    };
    return sizes[size as keyof typeof sizes] || '16px';
  };

  // =========================================================================
  // FUNCIONES PWA
  // =========================================================================

  const initializePWA = () => {
    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaState(prev => ({ ...prev, isInstalled: true }));
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Detectar evento de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e
      }));
    });
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Verificar actualizaciones
      registration.addEventListener('updatefound', () => {
        setPwaState(prev => ({ ...prev, updateAvailable: true }));
      });

      console.log('✅ Service Worker registrado correctamente');
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  };

  const setupEventListeners = () => {
    // Eventos de conectividad
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
      syncOfflineData();
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Eventos de teclado para navegación
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  };

  const handleKeyboardNavigation = (e: KeyboardEvent) => {
    if (!settings.keyboardNavigation) return;

    // Skip to main content (Alt + 1)
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      const main = document.querySelector('#main-content') || document.querySelector('main');
      if (main) {
        (main as HTMLElement).focus();
        announceToScreenReader('Saltando al contenido principal');
      }
    }

    // Skip to navigation (Alt + 2)
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      const nav = document.querySelector('#main-navigation') || document.querySelector('nav');
      if (nav) {
        (nav as HTMLElement).focus();
        announceToScreenReader('Saltando al menú de navegación');
      }
    }

    // Escape key closes modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
      if (modal) {
        const closeButton = modal.querySelector('[aria-label*="Cerrar"]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  };

  // =========================================================================
  // FUNCIONES PÚBLICAS
  // =========================================================================

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Anuncio para lectores de pantalla
    const announcements = {
      highContrast: value ? 'Modo alto contraste activado' : 'Modo alto contraste desactivado',
      largeText: value ? 'Texto grande activado' : 'Texto grande desactivado',
      reducedMotion: value ? 'Animaciones reducidas activadas' : 'Animaciones reducidas desactivadas',
      screenReader: value ? 'Soporte para lector de pantalla activado' : 'Soporte para lector de pantalla desactivado',
      soundEnabled: value ? 'Sonidos activados' : 'Sonidos desactivados'
    };

    if (announcements[key as keyof typeof announcements]) {
      announceToScreenReader(announcements[key as keyof typeof announcements]);
    }
  };

  const installPWA = async () => {
    if (!pwaState.installPrompt) return;

    try {
      const result = await pwaState.installPrompt.prompt();
      
      if (result.outcome === 'accepted') {
        setPwaState(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          installPrompt: null
        }));
        announceToScreenReader('Aplicación instalada correctamente');
      }
    } catch (error) {
      console.error('Error instalando PWA:', error);
    }
  };

  const checkForUpdates = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
    }
  };

  const announceToScreenReader = (message: string) => {
    if (!settings.screenReader) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const syncOfflineData = async () => {
    try {
      // Sincronizar datos offline cuando se recupere la conexión
      setPwaState(prev => ({ ...prev, lastSync: new Date() }));
      announceToScreenReader('Datos sincronizados correctamente');
    } catch (error) {
      console.error('Error sincronizando datos offline:', error);
    }
  };

  // =========================================================================
  // PROVIDER VALUE
  // =========================================================================

  const contextValue: AccessibilityContextType = {
    settings,
    pwaState,
    updateSetting,
    installPWA,
    checkForUpdates,
    announceToScreenReader
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      <AccessibilityStyles />
      <PWANotifications />
      <OfflineIndicator />
    </AccessibilityContext.Provider>
  );
};

// =============================================================================
// COMPONENTE DE ESTILOS DE ACCESIBILIDAD
// =============================================================================

const AccessibilityStyles: React.FC = () => (
  <style>
    {`
      /* Screen Reader Only */
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }

      /* High Contrast Mode */
      .high-contrast {
        filter: contrast(150%) !important;
      }

      .high-contrast * {
        border-color: #000 !important;
        color: #000 !important;
        background: #fff !important;
      }

      .high-contrast button,
      .high-contrast .btn {
        background: #000 !important;
        color: #fff !important;
        border: 2px solid #000 !important;
      }

      /* Large Text Mode */
      .large-text {
        font-size: 120% !important;
      }

      .large-text * {
        line-height: 1.6 !important;
      }

      /* Reduced Motion */
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

      /* Enhanced Focus Indicators */
      .enhanced-focus *:focus {
        outline: 3px solid #2563eb !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 2px #fff, 0 0 0 5px #2563eb !important;
      }

      .enhanced-focus button:focus,
      .enhanced-focus a:focus,
      .enhanced-focus input:focus,
      .enhanced-focus textarea:focus,
      .enhanced-focus select:focus {
        position: relative;
        z-index: 100;
      }

      /* Responsive font sizes */
      :root {
        --base-font-size: 16px;
      }

      html {
        font-size: var(--base-font-size);
      }

      /* PWA Install Banner */
      .pwa-install-banner {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(37, 99, 235, 0.3);
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
      }

      /* Offline Indicator */
      .offline-indicator {
        position: fixed;
        top: 80px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        z-index: 1000;
        animation: slideInDown 0.3s ease-out;
      }

      .online-indicator {
        background: #10b981;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }

      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .enhanced-focus *:focus {
          outline-width: 4px !important;
        }
        
        button, 
        .btn,
        input,
        select,
        textarea {
          min-height: 44px !important;
          min-width: 44px !important;
        }
      }
    `}
  </style>
);

// =============================================================================
// COMPONENTE INDICADOR OFFLINE
// =============================================================================

const OfflineIndicator: React.FC = () => {
  const { pwaState } = useAccessibility();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!pwaState.isOnline) {
      setShowIndicator(true);
    } else {
      if (showIndicator) {
        setTimeout(() => {
          setShowIndicator(false);
        }, 3000);
      }
    }
  }, [pwaState.isOnline, showIndicator]);

  if (!showIndicator) return null;

  return (
    <div 
      className={`offline-indicator ${pwaState.isOnline ? 'online-indicator' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {pwaState.isOnline ? (
          <>
            <Wifi size={16} />
            <span>Conexión restaurada</span>
            <CheckCircle size={16} />
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>Sin conexión - Modo offline</span>
            <AlertTriangle size={16} />
          </>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE NOTIFICACIONES PWA
// =============================================================================

const PWANotifications: React.FC = () => {
  const { pwaState, installPWA } = useAccessibility();

  if (!pwaState.isInstallable) return null;

  return (
    <div 
      className="pwa-install-banner"
      role="banner"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Smartphone size={20} />
        <div>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>
            Instalar App ANM FRI
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
            Acceso rápido y funcionalidad offline
          </p>
        </div>
        <button
          onClick={installPWA}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          aria-label="Instalar aplicación"
        >
          <Download size={14} />
        </button>
      </div>
    </div>
  );
};

export default AccessibilityProvider;