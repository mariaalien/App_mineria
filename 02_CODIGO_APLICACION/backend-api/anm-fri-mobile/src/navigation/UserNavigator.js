// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/navigation/UserNavigator.js
// Navegador de usuario con verificación
// ==========================================

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importar pantallas
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import UserVerificationScreen from '../screens/verification/UserVerificationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FormularioFRIScreen from '../screens/formularios/FormularioFRIScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de Verificación
const VerificationNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563EB',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="UserVerification" 
        component={UserVerificationScreen}
        options={{
          title: 'Verificación de Usuario',
          headerShown: false, // El componente tiene su propio header
        }}
      />
    </Stack.Navigator>
  );
};

// Navegador Principal con Tabs
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Formularios') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Verificación') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#2563EB',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Inicio',
          headerTitle: 'Sistema ANM FRI',
        }}
      />
      
      <Tab.Screen 
        name="Formularios" 
        component={FormularioFRIScreen}
        options={{
          title: 'FRI',
          headerTitle: 'Formularios FRI',
        }}
      />
      
      <Tab.Screen 
        name="Verificación" 
        component={VerificationNavigator}
        options={{
          title: 'Verificar',
          headerShown: false, // El VerificationNavigator maneja sus headers
        }}
      />
      
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;

// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/services/authService.js
// Servicio de autenticación para React Native
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://tu-api-produccion.com';

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.init();
  }

  async init() {
    try {
      this.token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      this.user = userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error inicializando AuthService:', error);
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        
        await AsyncStorage.setItem('token', this.token);
        await AsyncStorage.setItem('user', JSON.stringify(this.user));

        console.log('✅ Login exitoso:', this.user.email);
        return { success: true, user: this.user, token: this.token };
      } else {
        console.error('❌ Error en login:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('❌ Error de red en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.token = null;
      this.user = null;
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      console.log('🚪 Logout completado');
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.status === 401) {
        console.warn('⚠️ Token expirado');
        await this.logout();
        return { success: false, message: 'Sesión expirada' };
      }

      return data;
    } catch (error) {
      console.error(`❌ Error en API call ${endpoint}:`, error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Métodos específicos de verificación
  async verifyUserIdentity(verificationData) {
    return this.apiCall('/api/verification/verify-identity', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async generateVerificationCode() {
    return this.apiCall('/api/verification/generate-code', {
      method: 'POST',
    });
  }

  async getVerificationHistory() {
    return this.apiCall('/api/verification/history');
  }
}

const authService = new AuthService();
export default authService;

// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/contexts/AuthContext.js
// Contexto de autenticación para React Native
// ==========================================

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await authService.init();
      
      if (authService.isAuthenticated()) {
        dispatch({ type: 'SET_USER', payload: authService.getUser() });
        dispatch({ type: 'SET_TOKEN', payload: authService.getToken() });
      }
    } catch (error) {
      console.error('Error inicializando auth:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
        dispatch({ type: 'SET_TOKEN', payload: result.token });
      }
      
      return result;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/App.js
// Configuración principal de la app
// ==========================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import MainTabNavigator from './src/navigation/UserNavigator';
import LoginScreen from './src/screens/auth/LoginScreen';
import { useAuth } from './src/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});

// ==========================================
// COMANDOS PARA INSTALAR DEPENDENCIAS
// ==========================================

/*
cd 02_CODIGO_APLICACION/anm-fri-mobile/

# Instalar dependencias necesarias
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
npm install react-native-screens react-native-safe-area-context

# Para Expo (si usas Expo)
expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
expo install @react-native-async-storage/async-storage

# Para React Native CLI (si no usas Expo)
cd ios && pod install && cd .. # Solo en iOS
*/