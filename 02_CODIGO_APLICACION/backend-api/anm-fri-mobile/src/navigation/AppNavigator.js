// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/navigation/AppNavigator.js
// Navegador Principal Mejorado - Sistema ANM FRI
// ==========================================

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

// Importar pantallas de autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import LoadingScreen from '../screens/auth/LoadingScreen';
import UserVerificationScreen from '../screens/verification/UserVerificationScreen';

// Importar pantallas de producción
import ProductionRegistrationScreen from '../screens/production/ProductionRegistrationScreen';

// Importar hook de autenticación
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// =============================================================================
// CONFIGURACIÓN DE COLORES Y ESTILOS
// =============================================================================

const Colors = {
  primary: '#2E7D32',        // Verde minería
  primaryDark: '#1B5E20',
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

const PlaceholderScreen = ({ title, icon, description }) => (
  <View style={styles.placeholderContainer}>
    <Ionicons name={icon} size={64} color={Colors.primary} style={styles.placeholderIcon} />
    <Text style={styles.placeholderTitle}>{title}</Text>
    <Text style={styles.placeholderSubtitle}>
      {description || 'Esta pantalla está en desarrollo'}
    </Text>
  </View>
);

// Pantallas temporales
const DashboardScreenPlaceholder = () => (
  <PlaceholderScreen 
    title="Inicio" 
    icon="home" 
    description="Panel principal del Sistema FRI"
  />
);

const FormularioFRIScreenPlaceholder = ({ navigation }) => (
  <View style={styles.placeholderContainer}>
    <Ionicons name="document-text" size={64} color={Colors.primary} style={styles.placeholderIcon} />
    <Text style={styles.placeholderTitle}>Formularios FRI</Text>
    <Text style={styles.placeholderSubtitle}>
      Crear y gestionar reportes FRI
    </Text>
    
    {/* Botón para ir al registro de producción */}
    <TouchableOpacity 
      style={styles.actionButton}
      onPress={() => navigation.navigate('ProductionRegistration')}
    >
      <Ionicons name="construct" size={20} color="#FFFFFF" />
      <Text style={styles.actionButtonText}>Registro de Producción</Text>
    </TouchableOpacity>
  </View>
);

const ExplorarScreenPlaceholder = () => (
  <PlaceholderScreen 
    title="Explorar" 
    icon="search" 
    description="Buscar y consultar información"
  />
);

const ReportsScreenPlaceholder = () => (
  <PlaceholderScreen 
    title="Dashboard" 
    icon="stats-chart" 
    description="Análisis y reportes estadísticos"
  />
);

const ProfileScreenPlaceholder = () => (
  <PlaceholderScreen 
    title="Mi Perfil" 
    icon="person" 
    description="Información del operador"
  />
);

const SettingsScreenPlaceholder = () => (
  <PlaceholderScreen 
    title="Configuración" 
    icon="settings" 
    description="Ajustes de la aplicación"
  />
);

// =============================================================================
// CONFIGURACIÓN DE HEADERS
// =============================================================================

const HeaderOptions = {
  headerStyle: {
    backgroundColor: Colors.primary,
    elevation: 4,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
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

// 🏠 Stack de Inicio/Dashboard
const InicioStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="InicioMain" 
      component={DashboardScreenPlaceholder}
      options={{
        title: 'Sistema FRI - ANM',
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
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

// 📄 Stack de Formularios FRI
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
    <Stack.Screen 
      name="ProductionRegistration" 
      component={ProductionRegistrationScreen}
      options={{
        title: 'Registro de Producción',
        headerRight: () => (
          <Ionicons 
            name="construct" 
            size={24} 
            color="#FFFFFF" 
            style={{ marginRight: 16 }}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

// 🔍 Stack de Explorar/Búsqueda
const ExplorarStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="ExplorarMain" 
      component={ExplorarScreenPlaceholder}
      options={{
        title: 'Explorar',
        headerRight: () => (
          <Ionicons 
            name="filter-outline" 
            size={24} 
            color="#FFFFFF" 
            style={{ marginRight: 16 }}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

// 📊 Stack de Dashboard/Reportes
const DashboardStackNavigator = () => (
  <Stack.Navigator screenOptions={HeaderOptions}>
    <Stack.Screen 
      name="DashboardMain" 
      component={ReportsScreenPlaceholder}
      options={{
        title: 'Dashboard',
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

// 👤 Stack de Perfil
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
// NAVEGADOR DE TABS PRINCIPAL (BARRA INFERIOR)
// =============================================================================

const MainTabNavigator = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // 🎯 DEFINICIÓN DE ICONOS MEJORADA
          switch (route.name) {
            case 'Inicio':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'FRI':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Explorar':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Dashboard':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return (
            <View style={focused ? styles.activeIcon : styles.inactiveIcon}>
              <Ionicons name={iconName} size={size} color={color} />
              
              {/* Indicador de verificación pendiente en Perfil */}
              {route.name === 'Perfil' && user && !user.verificado && (
                <View style={styles.warningBadge}>
                  <Ionicons name="warning" size={10} color="#FFFFFF" />
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
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { height: -2, width: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      {/* 🏠 Tab 1: Inicio */}
      <Tab.Screen 
        name="Inicio" 
        component={InicioStackNavigator}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      
      {/* 📄 Tab 2: Formularios FRI */}
      <Tab.Screen 
        name="FRI" 
        component={FormulariosStackNavigator}
        options={{
          tabBarLabel: 'FRI',
        }}
      />
      
      {/* 🔍 Tab 3: Explorar */}
      <Tab.Screen 
        name="Explorar" 
        component={ExplorarStackNavigator}
        options={{
          tabBarLabel: 'Explorar',
        }}
      />
      
      {/* 📊 Tab 4: Dashboard */}
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      
      {/* 👤 Tab 5: Perfil */}
      <Tab.Screen 
        name="Perfil" 
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Perfil',
          // Badge de exclamación si no está verificado
          tabBarBadge: user && !user.verificado ? '!' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.warning,
            color: '#FFFFFF',
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
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
    userExists: !!user,
    verificado: user?.verificado
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
          gestureEnabled: false, // No permitir cerrar deslizando si es obligatoria
        }}
      />
    </Stack.Navigator>
  );
};

// =============================================================================
// ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  // Icono activo (seleccionado)
  activeIcon: {
    transform: [{ scale: 1.1 }],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Icono inactivo
  inactiveIcon: {
    opacity: 0.7,
  },
  
  // Badge de advertencia (verificación pendiente)
  warningBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.warning,
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  
  // Contenedor de pantallas placeholder
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
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  
  placeholderSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 32,
  },
  
  // Botón de acción
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AppNavigator;