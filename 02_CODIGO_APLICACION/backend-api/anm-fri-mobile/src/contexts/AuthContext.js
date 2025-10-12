import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crear contexto
const AuthContext = createContext();

// Estados iniciales
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Empezamos en loading
  error: null,
};

// Reducer para manejar los estados
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case 'NO_SESSION':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Simulación de API (datos mock) - USUARIOS EXPANDIDOS
const mockUsers = [
  // OPERADORES - Personal de campo
  {
    id: '1',
    email: 'operador@minera.com',
    password: '123456',
    nombre: 'Juan Carlos Pérez',
    rol: 'operador',
    empresa: 'Minera El Dorado S.A.S',
    telefono: '+57 300 123 4567',
    cedula: '12345678',
    cargo: 'Operador de Campo',
    ubicacion: 'Medellín, Antioquia',
    avatar: null,
    verificado: true,
  },
  {
    id: '2',
    email: 'ana.martinez@minera.com',
    password: '123456',
    nombre: 'Ana María Martínez',
    rol: 'operador',
    empresa: 'Minera El Dorado S.A.S',
    telefono: '+57 300 234 5678',
    cedula: '23456789',
    cargo: 'Técnico en Mineralogía',
    ubicacion: 'Bucaramanga, Santander',
    avatar: null,
    verificado: true,
  },
  {
    id: '3',
    email: 'carlos.minero@coalmine.com',
    password: '123456',
    nombre: 'Carlos Eduardo Minero',
    rol: 'operador',
    empresa: 'Carbones del Norte Ltda',
    telefono: '+57 300 345 6789',
    cedula: '34567890',
    cargo: 'Especialista en Carbón',
    ubicacion: 'La Jagua, Cesar',
    avatar: null,
    verificado: true,
  },

  // SUPERVISORES - Personal intermedio
  {
    id: '4',
    email: 'supervisor@minera.com',
    password: '123456',
    nombre: 'María González Rodríguez',
    rol: 'supervisor',
    empresa: 'Minera El Dorado S.A.S',
    telefono: '+57 300 987 6543',
    cedula: '45678901',
    cargo: 'Supervisor de Producción',
    ubicacion: 'Medellín, Antioquia',
    avatar: null,
    verificado: true,
  },
  {
    id: '5',
    email: 'lucia.supervisor@goldmining.com',
    password: '123456',
    nombre: 'Lucía Patricia Ramírez',
    rol: 'supervisor',
    empresa: 'Gold Mining Colombia S.A.',
    telefono: '+57 301 876 5432',
    cedula: '56789012',
    cargo: 'Supervisora de Calidad',
    ubicacion: 'Segovia, Antioquia',
    avatar: null,
    verificado: true,
  },
  {
    id: '6',
    email: 'roberto.control@platamining.com',
    password: '123456',
    nombre: 'Roberto José Control',
    rol: 'supervisor',
    empresa: 'Plata Mining S.A.S',
    telefono: '+57 302 765 4321',
    cedula: '67890123',
    cargo: 'Supervisor de Control',
    ubicacion: 'Barbacoas, Nariño',
    avatar: null,
    verificado: true,
  },

  // ADMINISTRADORES - Personal ANM y gerencial
  {
    id: '7',
    email: 'admin@anm.gov.co',
    password: '123456',
    nombre: 'Carlos Administrador Pérez',
    rol: 'admin',
    empresa: 'Agencia Nacional de Minería',
    telefono: '+57 300 555 0123',
    cedula: '78901234',
    cargo: 'Coordinador Regional',
    ubicacion: 'Bogotá D.C.',
    avatar: null,
    verificado: true,
  },
  {
    id: '8',
    email: 'direccion@anm.gov.co',
    password: 'admin2024',
    nombre: 'Diana Marcela Directora',
    rol: 'admin',
    empresa: 'Agencia Nacional de Minería',
    telefono: '+57 301 555 0124',
    cedula: '89012345',
    cargo: 'Directora Técnica',
    ubicacion: 'Bogotá D.C.',
    avatar: null,
    verificado: true,
  },
  {
    id: '9',
    email: 'gerente@minera.com',
    password: 'gerente123',
    nombre: 'Andrés Felipe Gerente',
    rol: 'admin',
    empresa: 'Minera El Dorado S.A.S',
    telefono: '+57 302 555 0125',
    cedula: '90123456',
    cargo: 'Gerente General',
    ubicacion: 'Medellín, Antioquia',
    avatar: null,
    verificado: true,
  },

  // USUARIOS DE DIFERENTES EMPRESAS
  {
    id: '10',
    email: 'emerald.operator@esmeraldas.com',
    password: '123456',
    nombre: 'Elena Esmeralda Verde',
    rol: 'operador',
    empresa: 'Esmeraldas de Colombia Ltda',
    telefono: '+57 303 456 7890',
    cedula: '01234567',
    cargo: 'Especialista en Esmeraldas',
    ubicacion: 'Muzo, Boyacá',
    avatar: null,
    verificado: true,
  },
  {
    id: '11',
    email: 'salt.manager@sal.com',
    password: '123456',
    nombre: 'Sebastián Sal Marín',
    rol: 'supervisor',
    empresa: 'Sal Marina de Colombia S.A.',
    telefono: '+57 304 567 8901',
    cedula: '12345670',
    cargo: 'Supervisor de Extracción',
    ubicacion: 'Galerazamba, Bolívar',
    avatar: null,
    verificado: true,
  },
  {
    id: '12',
    email: 'iron.chief@hierro.com',
    password: '123456',
    nombre: 'Fernando Hierro Fuerte',
    rol: 'admin',
    empresa: 'Hierros del Magdalena S.A.S',
    telefono: '+57 305 678 9012',
    cedula: '23456701',
    cargo: 'Jefe de Operaciones',
    ubicacion: 'Huila',
    avatar: null,
    verificado: true,
  },

  // USUARIOS PARA TESTING
  {
    id: '13',
    email: 'test@test.com',
    password: '123',
    nombre: 'Usuario de Prueba',
    rol: 'operador',
    empresa: 'Empresa de Pruebas',
    telefono: '+57 300 000 0000',
    cedula: '00000000',
    cargo: 'Tester',
    ubicacion: 'Bogotá D.C.',
    avatar: null,
    verificado: false,
  },
  {
    id: '14',
    email: 'demo@demo.com',
    password: 'demo',
    nombre: 'Demo Usuario',
    rol: 'supervisor',
    empresa: 'Empresa Demo',
    telefono: '+57 300 111 1111',
    cedula: '11111111',
    cargo: 'Usuario Demo',
    ubicacion: 'Colombia',
    avatar: null,
    verificado: true,
  }
];

// Simular llamada a API
const simulateAPICall = (delay = 1000) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar sesión guardada al iniciar la app
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 AuthContext: Verificando sesión guardada...');
      
      try {
        // Delay mínimo para la carga inicial
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const storedUser = await AsyncStorage.getItem('user_session');
        const storedToken = await AsyncStorage.getItem('auth_token');
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          
          console.log('✅ Sesión restaurada:', user.nombre);
          dispatch({
            type: 'RESTORE_SESSION',
            payload: { user },
          });
        } else {
          console.log('❌ No hay sesión guardada');
          dispatch({ type: 'NO_SESSION' });
        }
      } catch (error) {
        console.error('❌ Error verificando sesión:', error);
        dispatch({ type: 'NO_SESSION' });
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('🔐 Intentando login para:', email);

      // Simular delay de red más corto
      await simulateAPICall(1200);

      // Buscar usuario en los datos mock
      const user = mockUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Email o contraseña incorrectos');
      }

      // Generar token mock
      const token = `mock_token_${Date.now()}_${user.id}`;

      // Guardar sesión
      await AsyncStorage.setItem('user_session', JSON.stringify({
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        empresa: user.empresa,
        telefono: user.telefono,
        verificado: user.verificado,
      }));
      await AsyncStorage.setItem('auth_token', token);

      console.log('✅ Login exitoso:', user.nombre);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { 
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            empresa: user.empresa,
            telefono: user.telefono,
            verificado: user.verificado,
          }
        },
      });

    } catch (error) {
      console.error('❌ Error en login:', error.message);
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      console.log('🚪 Cerrando sesión...');
      
      // Simular delay de API corto
      await simulateAPICall(300);

      // Limpiar storage
      await AsyncStorage.removeItem('user_session');
      await AsyncStorage.removeItem('auth_token');

      console.log('✅ Logout exitoso');
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('❌ Error en logout:', error);
      dispatch({ type: 'LOGOUT' }); // Logout forzado
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = { ...state.user, ...userData };
      
      await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: updatedUser },
      });

      console.log('✅ Usuario actualizado');
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Funciones auxiliares
  const isAdmin = () => state.user?.rol === 'admin';
  const isSupervisor = () => state.user?.rol === 'supervisor';
  const isOperator = () => state.user?.rol === 'operador';
  
  const hasRole = (role) => state.user?.rol === role;
  const hasAnyRole = (roles) => roles.includes(state.user?.rol);

  // Valor del contexto
  const value = {
    // Estado
    ...state,
    
    // Acciones
    login,
    logout,
    updateUser,
    clearError,
    
    // Helpers
    isAdmin,
    isSupervisor,
    isOperator,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  
  return context;
};

export default AuthContext;