// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/navigation/AppNavigator.js
// Navegador principal de la aplicación móvil
// ==========================================

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';

// Importar pantallas principales
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import FormularioFRIScreen from '../screens/formularios/FormularioFRIScreen';
import UserVerificationScreen from '../screens/verification/UserVerificationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Importar pantallas de autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import LoadingScreen from '../screens/auth/LoadingScreen';

// Importar hook de autenticación
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// =============================================================================
// CONFIGURACIÓN DE COLORES Y ESTILOS
// =============================================================================

const Colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#10B981',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  inactive: '#9CA3AF'
};

const TabBarOptions = {
  activeTintColor: Colors.primary,
  inactiveTintColor: Colors.inactive,
  style: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 85 : 65,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  labelStyle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  iconStyle: {
    marginBottom: 2,
  },
};

const HeaderOptions = {
  headerStyle: {
    backgroundColor: Colors.primary,
    elevation: 4,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  headerBackTitleVisible: false,
};

// =============================================================================
// NAVEGADOR DE PESTAÑAS PRINCIPAL
// =============================================================================

const MainTabNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = size;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Formularios':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Verificación':
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
              iconSize = focused ? size + 2 : size; // Hacer el icono un poco más grande cuando está activo
              break;
            case 'Reportes':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return (
            <Ionicons 
              name={iconName} 
              size={iconSize} 
              color={color}
              style={focused ? styles.activeIcon : {}}
            />
          );
        },
        ...TabBarOptions,
        headerShown: false, // Los Stack navigators manejarán sus propios headers
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStackNavigator}
        options={{
          title: 'Inicio',
          tabBarBadge: user?.hasNotifications ? '!' : undefined,
        }}
      />
      
      <Tab.Screen 
        name="Formularios" 
        component={FormulariosStackNavigator}
        options={{
          title: 'FRI',
        }}
      />
      
      <Tab.Screen 
        name="Verificación" 
        component={VerificationStackNavigator}
        options={{
          title: 'Verificar',
          tabBarBadge: !user?.verificado ? '!' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.warning,
            color: '#FFFFFF',
            fontSize: 10,
            minWidth: 16,
            height: 16,
          },
        }}
      />
      
      {/* Mostrar Reportes solo si el usuario tiene permisos */}
      {(user?.rol === 'ADMIN' || user?.rol === 'SUPERVISOR') && (
        <Tab.Screen 
          name="Reportes" 
          component={ReportsStackNavigator}
          options={{
            title: 'Reportes',
          }}
        />
      )}
      
      <Tab.Screen 
        name="Perfil" 
        component={ProfileStackNavigator}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

// =============================================================================
// NAVEGADORES DE STACK PARA CADA SECCIÓN
// =============================================================================

const DashboardStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{
        title: 'Sistema ANM FRI',
        headerRight: () => (
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color="#FFFFFF" 
            style={{ marginRight: 16 }}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

const FormulariosStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="FormulariosMain" 
      component={FormularioFRIScreen}
      options={{
        title: 'Formularios FRI',
        headerRight: () => (
          <Ionicons 
            name="add-circle-outline" 
            size={24} 
            color="#FFFFFF" 
            style={{ marginRight: 16 }}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

const VerificationStackNavigator = () => {
  const { user } = useAuth();
  
  return (
    <Stack.Navigator screenOptions={HeaderOptions}>
      <Stack.Screen 
        name="VerificationMain" 
        component={UserVerificationScreen}
        options={{
          title: 'Verificación de Usuario',
          headerStyle: {
            ...HeaderOptions.headerStyle,
            backgroundColor: user?.verificado ? Colors.success : Colors.warning,
          },
          headerRight: () => (
            <Ionicons 
              name={user?.verificado ? "checkmark-circle" : "warning"} 
              size={24} 
              color="#FFFFFF" 
              style={{ marginRight: 16 }}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const ReportsStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="ReportsMain" 
      component={ReportsScreen}
      options={{
        title: 'Reportes y Analytics',
        headerRight: () => (
          <Ionicons 
            name="download-outline" 
            size={24} 
            color="#FFFFFF" 
            style={{ marginRight: 16 }}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{
        title: 'Mi Perfil',
        headerRight: () => (
          <Ionicons 
            name="settings-outline" 
            size={24} 
            color="#FFFFFF" 
            style={{ marginRight: 16 }}
          />
        ),
      }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{
        title: 'Configuración',
      }}
    />
  </Stack.Navigator>
);

// =============================================================================
// NAVEGADOR PRINCIPAL DE LA APLICACIÓN
// =============================================================================

const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, mostrar pantalla de login
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  // Si está autenticado, mostrar navegación principal
  return <MainTabNavigator />;
};

// =============================================================================
// NAVEGADOR CON DRAWER (OPCIONAL - PARA FUNCIONES AVANZADAS)
// =============================================================================

export const DrawerNavigator = () => {
  const { user, logout } = useAuth();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: Colors.surface,
          width: 280,
        },
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -20,
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{
          title: 'Sistema ANM FRI',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      {user?.rol === 'ADMIN' && (
        <Drawer.Screen 
          name="Admin" 
          component={SettingsScreen}
          options={{
            title: 'Administración',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      
      <Drawer.Screen 
        name="Help" 
        component={SettingsScreen}
        options={{
          title: 'Ayuda y Soporte',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// =============================================================================
// ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  activeIcon: {
    transform: [{ scale: 1.1 }],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default AppNavigator;

// =============================================================================
// COMANDOS DE INSTALACIÓN DE DEPENDENCIAS
// =============================================================================

/*
Para usar este navegador, instala las dependencias necesarias:

cd 02_CODIGO_APLICACION/anm-fri-mobile/

# Dependencias principales
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/drawer

# Dependencias de React Native
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Para Expo
expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# AsyncStorage para persistencia
npm install @react-native-async-storage/async-storage

# Vector Icons (si no está instalado)
expo install @expo/vector-icons

# Si usas React Native CLI (no Expo), también necesitas:
cd ios && pod install && cd .. # Solo en iOS
*/

// =============================================================================
// CONFIGURACIÓN EN App.js
// =============================================================================

/*
En tu archivo principal App.js, usa así:

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
*/