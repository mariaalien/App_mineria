// =============================================================================
// 🎨 SISTEMA DE TEMAS SIMPLIFICADO - SOLO TEMA CLARO
// Context y hook para responsive + colores consistentes
// =============================================================================

// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  // Fondos
  primary: string;
  secondary: string;
  surface: string;
  card: string;
  overlay: string;
  
  // Textos
  text: {
    primary: string;
    secondary: string;
    accent: string;
    inverse: string;
  };
  
  // Gradientes
  gradient: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Bordes y separadores
  border: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Estados
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Efectos
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Solo tema claro - colores consistentes con tu login
const lightTheme: ThemeColors = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: '#f8fafc',
  surface: 'rgba(255, 255, 255, 0.95)',
  card: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#667eea',
    inverse: '#ffffff'
  },
  
  gradient: {
    primary: 'linear-gradient(135deg, #667eea, #764ba2)',
    secondary: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    accent: 'linear-gradient(135deg, #10b981, #059669)'
  },
  
  border: {
    primary: '#e5e7eb',
    secondary: '#e2e8f0',
    accent: '#667eea'
  },
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',
  
  shadow: {
    sm: '0 4px 16px rgba(0, 0, 0, 0.05)',
    md: '0 8px 32px rgba(0, 0, 0, 0.1)',
    lg: '0 25px 50px rgba(0, 0, 0, 0.25)',
    xl: '0 25px 50px rgba(102, 126, 234, 0.3)'
  }
};

interface ThemeContextType {
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colors = lightTheme; // Solo tema claro

  // Aplicar variables CSS globales
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar colores como variables CSS
    root.style.setProperty('--color-primary', colors.text.primary);
    root.style.setProperty('--color-secondary', colors.text.secondary);
    root.style.setProperty('--color-accent', colors.text.accent);
    root.style.setProperty('--bg-primary', colors.card);
    root.style.setProperty('--bg-secondary', colors.secondary);
    root.style.setProperty('--border-primary', colors.border.primary);
    
    // Aplicar tema claro al body
    document.body.className = 'light-theme';
  }, [colors]);

  const value: ThemeContextType = {
    colors
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// =============================================================================
// 🎯 HOOK PARA RESPONSIVE DESIGN
// =============================================================================

interface BreakpointValues {
  xs: boolean; // < 640px
  sm: boolean; // >= 640px
  md: boolean; // >= 768px
  lg: boolean; // >= 1024px
  xl: boolean; // >= 1280px
  '2xl': boolean; // >= 1536px
}

interface ResponsiveValues {
  width: number;
  height: number;
  breakpoints: BreakpointValues;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

export const useResponsive = (): ResponsiveValues => {
  const [dimensions, setDimensions] = useState<ResponsiveValues>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoints: { xs: false, sm: false, md: true, lg: true, xl: false, '2xl': false },
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      breakpoints: {
        xs: width < 640,
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536
      },
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      orientation: width > height ? 'landscape' : 'portrait'
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({
        width,
        height,
        breakpoints: {
          xs: width < 640,
          sm: width >= 640,
          md: width >= 768,
          lg: width >= 1024,
          xl: width >= 1280,
          '2xl': width >= 1536
        },
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    // Throttle resize events
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return dimensions;
};

// =============================================================================
// 🔧 UTILIDADES DE ESTILO RESPONSIVE
// =============================================================================

export const getResponsiveValue = <T,>(
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    '2xl'?: T;
  },
  breakpoints: BreakpointValues,
  fallback: T
): T => {
  if (breakpoints['2xl'] && values['2xl'] !== undefined) return values['2xl'];
  if (breakpoints.xl && values.xl !== undefined) return values.xl;
  if (breakpoints.lg && values.lg !== undefined) return values.lg;
  if (breakpoints.md && values.md !== undefined) return values.md;
  if (breakpoints.sm && values.sm !== undefined) return values.sm;
  if (breakpoints.xs && values.xs !== undefined) return values.xs;
  return fallback;
};

export const responsive = {
  // Padding responsive
  padding: (breakpoints: BreakpointValues) => 
    getResponsiveValue(
      { xs: '12px', sm: '16px', md: '24px', lg: '32px', xl: '40px' },
      breakpoints,
      '20px'
    ),
  
  // Font size responsive
  fontSize: (breakpoints: BreakpointValues, size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    const sizes = {
      xs: getResponsiveValue({ xs: '12px', md: '14px' }, breakpoints, '12px'),
      sm: getResponsiveValue({ xs: '14px', md: '16px' }, breakpoints, '14px'),
      md: getResponsiveValue({ xs: '16px', md: '18px', lg: '20px' }, breakpoints, '16px'),
      lg: getResponsiveValue({ xs: '20px', md: '24px', lg: '28px' }, breakpoints, '20px'),
      xl: getResponsiveValue({ xs: '24px', md: '32px', lg: '40px' }, breakpoints, '24px')
    };
    return sizes[size];
  },
  
  // Grid responsive
  gridColumns: (breakpoints: BreakpointValues) =>
    getResponsiveValue(
      { xs: '1fr', sm: '1fr', md: '1fr 1fr', lg: '1fr 2fr', xl: '300px 1fr 300px' },
      breakpoints,
      '1fr'
    ),
  
  // Gap responsive
  gap: (breakpoints: BreakpointValues) =>
    getResponsiveValue(
      { xs: '12px', sm: '16px', md: '24px', lg: '32px' },
      breakpoints,
      '16px'
    )
};

// =============================================================================
// 🎨 COMPONENTE RESPONSIVE CONTAINER
// =============================================================================

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  center?: boolean;
  style?: React.CSSProperties;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = true,
  center = true,
  style = {}
}) => {
  const { breakpoints } = useResponsive();

  const maxWidths = {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%'
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: maxWidths[maxWidth],
        margin: center ? '0 auto' : '0',
        padding: padding ? responsive.padding(breakpoints) : '0',
        position: 'relative',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ThemeProvider;