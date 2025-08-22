// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/navigation/AppNavigator.js
// Navegador Principal Completo con Verificación
// ==========================================

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View, Text } from 'react-native';

// Importar pantallas de autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import LoadingScreen from '../screens/auth/LoadingScreen';

// Importar pantallas principales
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import FormularioFRIScreen from '../screens/formularios/FormularioFRIScreen';
import UserVerificationScreen from '../screens/verification/UserVerificationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Importar hook de autenticación
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// =============================================================================
// PANTALLAS PLACEHOLDER PARA DESARROLLO
// =============================================================================

const PlaceholderScreen = ({ title, icon }) => (
  <View style={styles.placeholderContainer}>
    <Ionicons name={icon} size={64} color={Colors.primary} style={styles.placeholderIcon} />
    <Text style={styles.placeholderTitle}>{title}</Text>
    <Text style={styles.placeholderSubtitle}>Esta pantalla está en desarrollo</Text>
  </View>
);

// Pantallas temporales mientras las desarrollas
const DashboardScreenPlaceholder = () => (
  <PlaceholderScreen title="Dashboard" icon="analytics" />
);

const FormularioFRIScreenPlaceholder = () => (
  <PlaceholderScreen title="Formularios FRI" icon="document-text" />
);

const ReportsScreenPlaceholder = () => (
  <PlaceholderScreen title="Reportes" icon="bar-chart" />
);

const ProfileScreenPlaceholder = () => (
  <PlaceholderScreen title="Mi Perfil" icon="person" />
);

const SettingsScreenPlaceholder = () => (
  <PlaceholderScreen title="Configuración" icon="settings" />
);

// =============================================================================
// CONFIGURACIÓN DE HEADERS
// =============================================================================

const HeaderOptions = {
  headerStyle: {
    backgroundColor: Colors.primary,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitleAlign: 'center',
};

// =============================================================================
// NAVEGADORES STACK PARA CADA TAB
// =============================================================================

const DashboardStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreenPlaceholder}
      options={{
        title: 'Dashboard ANM FRI',
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
    <Stack.Screen 
      name="Verification" 
      component={UserVerificationScreen}
      options={{
        title: 'Verificación',
        headerShown: false, // La pantalla maneja su propio header
      }}
    />
  </Stack.Navigator>
);

const FormulariosStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="FormulariosMain" 
      component={FormularioFRIScreenPlaceholder}
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

const ReportsStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="ReportsMain" 
      component={ReportsScreenPlaceholder}
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
      component={ProfileScreenPlaceholder}
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
      component={SettingsScreenPlaceholder}
      options={{
        title: 'Configuración',
      }}
    />
  </Stack.Navigator>
);

// =============================================================================
// NAVEGADOR DE TABS PRINCIPAL
// =============================================================================

const MainTabNavigator = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Formularios') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Reportes') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={focused ? styles.activeIcon : null}>
              <Ionicons name={iconName} size={size} color={color} />
              {/* Indicador de verificación */}
              {route.name === 'Perfil' && user && !user.verificado && (
                <View style={styles.warningBadge}>
                  <Ionicons name="warning" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inactive,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Formularios" 
        component={FormulariosStackNavigator}
        options={{
          tabBarLabel: 'FRI',
        }}
      />
      <Tab.Screen 
        name="Reportes" 
        component={ReportsStackNavigator}
        options={{
          tabBarLabel: 'Reportes',
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Perfil',
          tabBarBadge: user && !user.verificado ? '!' : null,
        }}
      />
    </Tab.Navigator>
  );
};

// =============================================================================
// NAVEGADOR PRINCIPAL DE LA APLICACIÓN
// =============================================================================

const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('🔍 AppNavigator - Estado:', {
    isAuthenticated,
    loading,
    userExists: !!user
  });

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

  // Si está autenticado, mostrar la aplicación principal
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      
      {/* Pantallas modales que se pueden abrir desde cualquier tab */}
      <Stack.Screen 
        name="VerificationModal" 
        component={UserVerificationScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
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
  warningBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.warning,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 32,
  },
  placeholderIcon: {
    marginBottom: 24,
    opacity: 0.7,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AppNavigator;