import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Home,
  PieChart,
  Menu,
  X,
  ChevronDown,
  LogOut,
  FileText,
  Table,
  Edit3,
  Bookmark,
  User,
  TrendingUp,
  Shield,
  UserCheck 
} from 'lucide-react';

interface NavbarProps {
  activeRoute?: string;
  onRouteChange?: (route: string) => void;
}

const PremiumNavbar: React.FC<NavbarProps> = ({ 
  activeRoute,
  onRouteChange = () => {}
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Determinar la ruta activa basada en la URL actual
  const getCurrentRoute = () => {
    const path = location.pathname;
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/formularios')) return 'formularios';
    if (path.includes('/datos')) return 'datos';
    if (path.includes('/edicion')) return 'edicion';
    if (path.includes('/tags-vistas')) return 'tags-vistas';
    if (path.includes('/reportes')) return 'reportes';
    return 'dashboard';
  };

  const currentActiveRoute = activeRoute || getCurrentRoute();

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      route: '/dashboard',
      description: 'Vista general del sistema'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: PieChart,
      route: '/analytics',
      description: 'Análisis avanzados y reportes'
    },
    {
      id: 'formularios',
      name: 'Formularios',
      icon: FileText,
      route: '/formularios',
      description: 'Gestión de formularios FRI'
    },
    {
      id: 'datos',
      name: 'Datos',
      icon: Table,
      route: '/datos',
      description: 'Gestión avanzada de datos'
    },
    {
      id: 'edicion',
      name: 'Edición',
      icon: Edit3,
      route: '/edicion',
      description: 'Edición inline y operaciones masivas'
    },
    {
      id: 'tags-vistas',
      name: 'Tags & Vistas',
      icon: Bookmark,
      route: '/tags-vistas',
      description: 'Sistema de tags y vistas personalizadas'
    },
    {
      id: 'reportes',
      name: 'Reportes',
      icon: TrendingUp,
      route: '/reportes',
      description: 'Sistema de reportes y analytics avanzados'
    }
  ];

  const handleNavigation = (item: any) => {
    onRouteChange(item.id);
    setIsMobileMenuOpen(false);
    navigate(item.route);
  };

  const currentUser = {
    name: 'María González',
    role: 'Supervisor ANM',
    email: 'supervisor@anm.gov.co',
    avatar: 'MG'
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');

  const navigationItems = [
  // ... items existentes ...
  {
    id: 'verification',
    name: 'Verificación',
    icon: Shield, // Importar: import { Shield } from 'lucide-react';
    route: '/verification',
    description: 'Verificación de usuarios'
  },
  // Si es admin, mostrar también:
  {
    id: 'admin-verification',
    name: 'Admin Verificación',
    icon: UserCheck,
    route: '/admin/verification',
    description: 'Panel administrativo de verificación'
  }
];


  };

  return (
    <>
      {/* NAVBAR PRINCIPAL */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px'
          }}>
            
            {/* LOGO Y MARCA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/dashboard')}
              >
                <div style={{
                  padding: '8px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)'
                }}>
                  <BarChart3 style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h1 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0,
                    lineHeight: '1.2'
                  }}>
                    Sistema ANM FRI
                  </h1>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    Agencia Nacional de Minería
                  </p>
                </div>
              </div>
            </div>

            {/* NAVEGACIÓN DESKTOP */}
            <div style={{
              display: window.innerWidth < 1024 ? 'none' : 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              padding: '6px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0'
            }}>
              {navigationItems.map((item) => {
                const isActive = currentActiveRoute === item.id;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isActive ? 'white' : 'transparent',
                      color: isActive ? '#1f2937' : '#6b7280',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }
                    }}
                  >
                    <Icon style={{ 
                      width: '18px', 
                      height: '18px',
                      color: isActive ? '#2563eb' : 'currentColor'
                    }} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* ACCIONES DERECHA - Solo usuario y menú móvil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              
              {/* Usuario */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>
                    {currentUser.avatar}
                  </div>
                  <div style={{
                    display: window.innerWidth < 640 ? 'none' : 'block',
                    textAlign: 'left'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 2px 0'
                    }}>
                      {currentUser.name}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown style={{
                    width: '16px',
                    height: '16px',
                    color: '#9ca3af',
                    transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>

                {/* Dropdown Usuario */}
                {isUserMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '240px',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    padding: '8px',
                    zIndex: 1000
                  }}>
                    <div style={{
                      padding: '16px',
                      borderBottom: '1px solid #f3f4f6',
                      marginBottom: '8px'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {currentUser.name}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0'
                      }}>
                        {currentUser.email}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#3b82f6',
                        fontWeight: '500',
                        margin: 0
                      }}>
                        {currentUser.role}
                      </p>
                    </div>
                    
                    <button style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    >
                      <User style={{ width: '16px', height: '16px' }} />
                      <span>Mi Perfil</span>
                    </button>
                    
                    <div style={{
                      height: '1px',
                      background: '#f3f4f6',
                      margin: '8px 0'
                    }}></div>
                    
                    <button 
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#dc2626',
                        textAlign: 'left',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <LogOut style={{ width: '16px', height: '16px' }} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Botón móvil */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  display: window.innerWidth >= 1024 ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                {isMobileMenuOpen ? (
                  <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                ) : (
                  <Menu style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MENÚ MÓVIL - Sin búsqueda */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          display: window.innerWidth >= 1024 ? 'none' : 'block'
        }}
        onClick={() => setIsMobileMenuOpen(false)}
        >
          <div style={{
            background: 'white',
            margin: '16px',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Navegación móvil */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navigationItems.map((item) => {
                const isActive = currentActiveRoute === item.id;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isActive ? '#eff6ff' : 'transparent',
                      color: isActive ? '#1d4ed8' : '#374151',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon style={{ 
                      width: '20px', 
                      height: '20px',
                      color: isActive ? '#2563eb' : '#6b7280'
                    }} />
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontWeight: 'inherit' }}>
                        {item.name}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        margin: 0
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isUserMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 30
          }}
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
};

export default PremiumNavbar;