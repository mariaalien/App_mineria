// =============================================================================
// ✨ DÍA 12 - HORA 2: SISTEMA DE ANIMACIONES Y MICRO-INTERACCIONES
// Hook personalizado para animaciones fluidas y efectos premium
// =============================================================================

import React, { useEffect, useState, useRef, RefObject } from 'react';

// =============================================================================
// TIPOS Y INTERFACES
// =============================================================================

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface UseAnimationsReturn {
  // Animaciones de entrada
  fadeInUp: (config?: AnimationConfig) => React.CSSProperties;
  fadeInDown: (config?: AnimationConfig) => React.CSSProperties;
  fadeInLeft: (config?: AnimationConfig) => React.CSSProperties;
  fadeInRight: (config?: AnimationConfig) => React.CSSProperties;
  
  // Micro-interacciones
  hoverLift: React.CSSProperties;
  pressEffect: React.CSSProperties;
  buttonAnimation: (loading?: boolean) => React.CSSProperties;
  
  // Efectos especiales
  floatAnimation: React.CSSProperties;
  pulseAnimation: React.CSSProperties;
  shimmerEffect: (isActive?: boolean) => React.CSSProperties;
  
  // Estados
  isVisible: boolean;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

// =============================================================================
// COMPONENTE LOADING SPINNER PREMIUM
// =============================================================================

export const PremiumSpinner: React.FC<{
  size?: number;
  color?: string;
  text?: string;
}> = ({ 
  size = 40, 
  color = '#3b82f6', 
  text = 'Cargando...' 
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '24px'
  }}>
    <div style={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`
    }}>
      {/* Círculo principal */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: `3px solid ${color}20`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      
      {/* Círculo secundario */}
      <div style={{
        position: 'absolute',
        width: '70%',
        height: '70%',
        top: '15%',
        left: '15%',
        border: `2px solid ${color}40`,
        borderRight: `2px solid ${color}80`,
        borderRadius: '50%',
        animation: 'spin 1.5s linear infinite reverse'
      }} />
    </div>
    
    {text && (
      <div style={{
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'fadeInOut 2s ease-in-out infinite'
      }}>
        {text}
      </div>
    )}
  </div>
);

// =============================================================================
// ESTILOS CSS GLOBALES
// =============================================================================

export const AnimationStyles = () => (
  <style>
    {`
      /* Keyframes para animaciones */
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      
      @keyframes shimmer {
        0% { right: -100%; }
        100% { right: 100%; }
      }
      
      @keyframes fadeInOut {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      
      /* Reducir animaciones para usuarios que lo prefieran */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Mejoras de rendimiento */
      .animated-element {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `}
  </style>
);

// =============================================================================
// HOOK PRINCIPAL - useAnimations
// =============================================================================

export const useAnimations = (ref?: RefObject<HTMLElement | null>): UseAnimationsReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const internalRef = useRef<HTMLElement | null>(null);
  const targetRef = ref || internalRef;

  // =========================================================================
  // INTERSECTION OBSERVER - Para animaciones al entrar en viewport
  // =========================================================================
  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [targetRef]);

  // =========================================================================
  // ANIMACIONES DE ENTRADA - Fade In con direcciones
  // =========================================================================
  
  const fadeInUp = (config: AnimationConfig = {}): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all ${config.duration || 600}ms ${config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'} ${config.delay || 0}ms`,
    willChange: 'transform, opacity'
  });

  const fadeInDown = (config: AnimationConfig = {}): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
    transition: `all ${config.duration || 600}ms ${config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'} ${config.delay || 0}ms`,
    willChange: 'transform, opacity'
  });

  const fadeInLeft = (config: AnimationConfig = {}): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
    transition: `all ${config.duration || 600}ms ${config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'} ${config.delay || 0}ms`,
    willChange: 'transform, opacity'
  });

  const fadeInRight = (config: AnimationConfig = {}): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
    transition: `all ${config.duration || 600}ms ${config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'} ${config.delay || 0}ms`,
    willChange: 'transform, opacity'
  });

  // =========================================================================
  // MICRO-INTERACCIONES - Hover y Press Effects
  // =========================================================================
  
  const hoverLift: React.CSSProperties = {
    transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
    boxShadow: isHovered 
      ? '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: isHovered ? 'pointer' : 'default',
    willChange: 'transform, box-shadow'
  };

  const pressEffect: React.CSSProperties = {
    transform: 'scale(0.98)',
    transition: 'transform 100ms ease-out'
  };

  const buttonAnimation = (loading = false): React.CSSProperties => ({
    transform: isHovered && !loading ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: isHovered && !loading
      ? '0 4px 12px rgba(0, 0, 0, 0.15)'
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: loading ? 0.7 : 1,
    cursor: loading ? 'wait' : isHovered ? 'pointer' : 'default',
    willChange: 'transform, box-shadow, opacity'
  });

  // =========================================================================
  // EFECTOS ESPECIALES
  // =========================================================================
  
  const floatAnimation: React.CSSProperties = {
    animation: 'float 3s ease-in-out infinite',
    willChange: 'transform'
  };

  const pulseAnimation: React.CSSProperties = {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    willChange: 'opacity'
  };

  const shimmerEffect = (isActive = false): React.CSSProperties => ({
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: isActive ? '#f3f4f6' : 'transparent'
  });

  // =========================================================================
  // RETORNO DEL HOOK
  // =========================================================================
  
  return {
    // Animaciones de entrada
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    
    // Micro-interacciones
    hoverLift,
    pressEffect,
    buttonAnimation,
    
    // Efectos especiales
    floatAnimation,
    pulseAnimation,
    shimmerEffect,
    
    // Estados
    isVisible,
    isHovered,
    setIsHovered
  };
};

// =============================================================================
// COMPONENTES HELPER
// =============================================================================

export const AnimatedContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight';
  delay?: number;
  duration?: number;
}> = ({ 
  children, 
  className = '', 
  animation = 'fadeUp', 
  delay = 0,
  duration = 600 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fadeInUp, fadeInDown, fadeInLeft, fadeInRight } = useAnimations(
    containerRef as RefObject<HTMLElement | null>
  );

  const getAnimation = () => {
    const config = { delay, duration };
    switch (animation) {
      case 'fadeDown': return fadeInDown(config);
      case 'fadeLeft': return fadeInLeft(config);
      case 'fadeRight': return fadeInRight(config);
      default: return fadeInUp(config);
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={getAnimation()}
    >
      {children}
    </div>
  );
};

export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ children, className = '', delay = 0, direction = 'up' }) => {
  return (
    <AnimatedContainer
      className={className}
      animation={`fade${direction.charAt(0).toUpperCase() + direction.slice(1)}` as any}
      delay={delay}
    >
      {children}
    </AnimatedContainer>
  );
};

export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}> = ({ children, className = '', delay = 0, hover = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { fadeInUp, hoverLift, isHovered, setIsHovered } = useAnimations(
    cardRef as RefObject<HTMLElement | null>
  );

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...fadeInUp({ delay }),
        ...(hover ? hoverLift : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export const AnimatedButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, className = '', onClick, loading = false, disabled = false, type = 'button' }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { buttonAnimation, isHovered, setIsHovered } = useAnimations(
    buttonRef as RefObject<HTMLElement | null>
  );

  return (
    <button
      ref={buttonRef}
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      style={buttonAnimation(loading)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Cargando...
        </div>
      ) : children}
    </button>
  );
};

export const StaggeredList: React.FC<{
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 100 }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <FadeIn className={className} delay={0}>
      {children}
    </FadeIn>
  );
};

// =============================================================================
// ALIASES PARA COMPATIBILIDAD
// =============================================================================

export const PremiumLoader = PremiumSpinner;
export const GlobalAnimationStyles = AnimationStyles;
export const useEntryAnimation = useAnimations;

export default useAnimations;