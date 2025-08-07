// src/hooks/useAuth.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService, { User, LoginCredentials } from '../services/api.service';

// ============================================================================
// 🎯 INTERFACES Y TIPOS
// ============================================================================

interface AuthContextType {
  // Estados
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Métodos de autenticación
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Estados de conexión
  isOnline: boolean;
  apiConnected: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// 🔄 CONTEXTO DE AUTENTICACIÓN
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// 🏭 PROVEEDOR DE AUTENTICACIÓN
// ============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiConnected, setApiConnected] = useState(false);

  // ============================================================================
  // 🔄 EFECTOS DE INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const savedUser = apiService.getCurrentUser();
        const hasToken = apiService.isAuthenticated();
        
        if (savedUser && hasToken) {
          try {
            const currentUser = await apiService.getProfile();
            setUser(currentUser);
            console.log('✅ Usuario autenticado desde localStorage:', currentUser.email);
          } catch (error) {
            console.warn('⚠️ Token inválido, limpiando sesión');
            await handleLogout();
          }
        }
      } catch (error) {
        console.error('❌ Error inicializando autenticación:', error);
        await handleLogout();
      } finally {
        setLoading(false);
      }
    };

    const setupListeners = () => {
      const updateOnlineStatus = () => {
        const online = navigator.onLine;
        setIsOnline(online);
        if (online) {
          testApiConnection();
        } else {
          setApiConnected(false);
        }
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    };

    initAuth();
    const cleanup = setupListeners();
    testApiConnection();

    return cleanup;
  }, []); // Dependencias vacías - solo se ejecuta una vez

  // ============================================================================
  // 🚀 INICIALIZACIÓN DE AUTENTICACIÓN
  // ============================================================================


  // ============================================================================
  // 🔐 MÉTODOS DE AUTENTICACIÓN
  // ============================================================================

  const handleLogin = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        console.log('✅ Login exitoso:', response.data.user.email);
        
        return {
          success: true,
          message: `¡Bienvenido ${response.data.user.nombre}!`
        };
      } else {
        return {
          success: false,
          message: response.message || 'Error de autenticación'
        };
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión con el servidor'
      };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiService.logout();
      
      setUser(null);
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      if (!apiService.isAuthenticated()) {
        throw new Error('No hay sesión activa');
      }
      
      const currentUser = await apiService.getProfile();
      setUser(currentUser);
      
      console.log('✅ Perfil actualizado:', currentUser.email);
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      await handleLogout();
    }
  };

  // ============================================================================
  // 🌐 MONITOREO DE CONEXIÓN
  // ============================================================================


  const testApiConnection = async () => {
    try {
      const connected = await apiService.testConnection();
      setApiConnected(connected);
      
      if (connected) {
        console.log('✅ API conectada:', apiService.getBaseURL());
      } else {
        console.warn('⚠️ API no disponible');
      }
    } catch (error) {
      console.error('❌ Error testando conexión API:', error);
      setApiConnected(false);
    }
  };

  // ============================================================================
  // 🔄 REFRESH AUTOMÁTICO DE TOKEN
  // ============================================================================

  useEffect(() => {
    if (!user) return;

    // Configurar refresh automático cada 50 minutos
    const refreshInterval = setInterval(async () => {
      try {
        await apiService.refreshToken();
        console.log('🔄 Token renovado automáticamente');
      } catch (error) {
        console.warn('⚠️ Error renovando token:', error);
        await handleLogout();
      }
    }, 50 * 60 * 1000); // 50 minutos

    return () => clearInterval(refreshInterval);
  }, [user]);

  // ============================================================================
  // 📤 VALOR DEL CONTEXTO
  // ============================================================================

  const contextValue: AuthContextType = {
    // Estados
    user,
    loading,
    isAuthenticated: !!user && apiService.isAuthenticated(),
    
    // Métodos
    login: handleLogin,
    logout: handleLogout,
    refreshProfile,
    
    // Estados de conexión
    isOnline,
    apiConnected
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// 🪝 HOOK PERSONALIZADO
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// ============================================================================
// 🛡️ HOC PARA RUTAS PROTEGIDAS
// ============================================================================

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
  fallback?: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  roles = [], 
  fallback = <div>No autorizado</div> 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !user) {
    // Redirigir al login
    window.location.href = '/login';
    return null;
  }

  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ============================================================================
  // 🎯 HOOK PARA PERMISOS
// ============================================================================

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permisos.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.rol === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.rol);
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    userRole: user?.rol,
    userPermissions: user?.permisos || []
  };
};