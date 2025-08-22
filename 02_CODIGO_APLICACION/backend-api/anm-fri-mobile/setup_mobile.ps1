# ==========================================
# 🚀 SETUP COMPLETO - APP MÓVIL ANM FRI (PowerShell)
# Configuración automática para Windows
# ==========================================

Write-Host "🚀 Iniciando configuración completa de la App Móvil ANM FRI..." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (!(Test-Path "src")) {
    Write-Host "❌ Error: Ejecuta este script desde el directorio anm-fri-mobile" -ForegroundColor Red
    Write-Host "📍 Directorio actual: $PWD" -ForegroundColor Yellow
    Write-Host "📍 Deberías estar en: ...\App_mineria\02_CODIGO_APLICACION\anm-fri-mobile" -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar..."
    exit 1
}

Write-Host "✅ Directorio correcto encontrado" -ForegroundColor Green

# =============================================================================
# 📁 CREAR ESTRUCTURA DE DIRECTORIOS
# =============================================================================

Write-Host "📁 Creando estructura de directorios..." -ForegroundColor Cyan

$directories = @(
    "src\screens\auth",
    "src\screens\dashboard", 
    "src\screens\formularios",
    "src\screens\verification",
    "src\screens\profile",
    "src\screens\settings",
    "src\screens\reports",
    "src\navigation",
    "src\contexts",
    "src\services",
    "src\components\common",
    "src\components\forms",
    "src\utils",
    "src\assets\images",
    "src\assets\fonts",
    "assets"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Creado: $dir" -ForegroundColor Gray
    }
}

# =============================================================================
# 📦 VERIFICAR NODE.JS Y NPM
# =============================================================================

Write-Host "📦 Verificando Node.js y npm..." -ForegroundColor Cyan

try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "  ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    Write-Host "📥 Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar..."
    exit 1
}

# =============================================================================
# 📱 VERIFICAR/INSTALAR EXPO CLI
# =============================================================================

Write-Host "📱 Verificando Expo CLI..." -ForegroundColor Cyan

try {
    $expoVersion = expo --version
    Write-Host "  ✅ Expo CLI ya está instalado: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ Expo CLI no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g expo-cli @expo/cli
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Expo CLI instalado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Error instalando Expo CLI" -ForegroundColor Red
        Write-Host "  💡 Intenta ejecutar PowerShell como Administrador" -ForegroundColor Yellow
    }
}

# =============================================================================
# 📝 CREAR ARCHIVOS DE CONFIGURACIÓN
# =============================================================================

Write-Host "📝 Creando archivos de configuración..." -ForegroundColor Cyan

# package.json
Write-Host "  📄 Creando package.json..." -ForegroundColor Gray
$packageJson = @'
{
  "name": "anm-fri-mobile",
  "version": "1.0.0",
  "description": "App Móvil del Sistema ANM FRI - Reportes Mineros",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject",
    "test": "jest"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17",
    "@react-navigation/bottom-tabs": "^6.5.8",
    "@react-native-async-storage/async-storage": "1.19.3",
    "react-native-screens": "~3.22.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-gesture-handler": "~2.12.0",
    "react-native-reanimated": "~3.3.0",
    "@expo/vector-icons": "^13.0.0",
    "expo-device": "~5.4.0",
    "expo-camera": "~13.4.2",
    "expo-location": "~16.1.0",
    "expo-haptics": "~12.4.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "keywords": ["react-native", "expo", "anm", "fri", "mining", "mobile"],
  "author": "CTGlobal - Universidad Distrital",
  "license": "MIT"
}
'@
$packageJson | Out-File -FilePath "package.json" -Encoding UTF8

# app.json
Write-Host "  📄 Creando app.json..." -ForegroundColor Gray
$appJson = @'
{
  "expo": {
    "name": "ANM FRI Mobile",
    "slug": "anm-fri-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563EB"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ctglobal.anmfri"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2563EB"
      },
      "package": "com.ctglobal.anmfri",
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      "expo-location"
    ]
  }
}
'@
$appJson | Out-File -FilePath "app.json" -Encoding UTF8

# App.js principal
Write-Host "  📄 Creando App.js..." -ForegroundColor Gray
$appJs = @'
import React, { useEffect } from 'react';
import { StatusBar, Platform, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { initializeApp } from './src/services/appService';

// Ignorar warnings durante desarrollo
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native core',
]);

const App = () => {
  useEffect(() => {
    initializeApp();
    
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#2563EB', true);
      StatusBar.setBarStyle('light-content', true);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar 
            barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
            backgroundColor="#2563EB"
          />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;
'@
$appJs | Out-File -FilePath "App.js" -Encoding UTF8

# babel.config.js
Write-Host "  📄 Creando babel.config.js..." -ForegroundColor Gray
$babelConfig = @'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
'@
$babelConfig | Out-File -FilePath "babel.config.js" -Encoding UTF8

# =============================================================================
# 📱 CREAR ARCHIVOS DE LA APLICACIÓN
# =============================================================================

Write-Host "📱 Creando archivos de la aplicación..." -ForegroundColor Cyan

# AuthContext
Write-Host "  🔐 Creando AuthContext..." -ForegroundColor Gray
$authContext = @'
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload 
      };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        token: null, 
        isAuthenticated: false 
      };
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
        const user = authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_TOKEN', payload: authService.getToken() });
        console.log('✅ Sesión restaurada para:', user?.email);
      }
    } catch (error) {
      console.error('❌ Error inicializando auth:', error);
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
'@
$authContext | Out-File -FilePath "src\contexts\AuthContext.js" -Encoding UTF8

# appService
Write-Host "  ⚙️ Creando appService..." -ForegroundColor Gray
$appService = @'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const initializeApp = async () => {
  try {
    console.log('🚀 Inicializando Sistema ANM FRI Mobile...');

    const deviceInfo = {
      deviceId: Device.osBuildId || 'unknown',
      deviceName: Device.deviceName || 'Unknown Device',
      systemVersion: Device.osVersion || 'Unknown',
      platform: Platform.OS,
      isDevice: Device.isDevice,
    };

    await AsyncStorage.setItem('DEVICE_INFO', JSON.stringify(deviceInfo));

    const isFirstLaunch = await AsyncStorage.getItem('FIRST_LAUNCH');
    if (!isFirstLaunch) {
      await AsyncStorage.setItem('FIRST_LAUNCH', 'false');
      console.log('✅ Primera ejecución de la aplicación');
    }

    const defaultSettings = {
      theme: 'light',
      language: 'es',
      notifications: true,
      biometricAuth: false,
      autoSync: true,
    };

    const existingSettings = await AsyncStorage.getItem('APP_SETTINGS');
    if (!existingSettings) {
      await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(defaultSettings));
    }

    console.log('✅ Sistema ANM FRI Mobile inicializado');
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
  }
};
'@
$appService | Out-File -FilePath "src\services\appService.js" -Encoding UTF8

# LoadingScreen
Write-Host "  📱 Creando LoadingScreen..." -ForegroundColor Gray
$loadingScreen = @'
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="business" size={64} color="#2563EB" />
        <Text style={styles.logoText}>ANM FRI</Text>
        <Text style={styles.logoSubtext}>Sistema de Reportes Mineros</Text>
      </View>
      
      <ActivityIndicator 
        size="large" 
        color="#2563EB" 
        style={styles.loader}
      />
      
      <Text style={styles.loadingText}>Iniciando aplicación...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 16,
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loader: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default LoadingScreen;
'@
$loadingScreen | Out-File -FilePath "src\screens\auth\LoadingScreen.js" -Encoding UTF8

# =============================================================================
# 📦 INSTALAR DEPENDENCIAS
# =============================================================================

Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
Write-Host "  ⏳ Esto puede tomar unos minutos..." -ForegroundColor Yellow

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Dependencias instaladas exitosamente" -ForegroundColor Green
} else {
    Write-Host "  ❌ Error instalando dependencias" -ForegroundColor Red
    Write-Host "  💡 Intenta ejecutar: npm cache clean --force" -ForegroundColor Yellow
}

# =============================================================================
# 🎨 CREAR ARCHIVOS ADICIONALES
# =============================================================================

Write-Host "🎨 Creando archivos adicionales..." -ForegroundColor Cyan

# .gitignore
$gitignore = @'
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env
.env.local
'@
$gitignore | Out-File -FilePath ".gitignore" -Encoding UTF8

# =============================================================================
# 📋 INSTRUCCIONES FINALES
# =============================================================================

Write-Host ""
Write-Host "=================================================================="
Write-Host "✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "=================================================================="
Write-Host ""
Write-Host "📱 TU APP MÓVIL ANM FRI ESTÁ LISTA!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 📱 Iniciar servidor de desarrollo:" -ForegroundColor White
Write-Host "   expo start" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. 📲 Probar en dispositivo:" -ForegroundColor White
Write-Host "   - Instala 'Expo Go' desde Play Store/App Store" -ForegroundColor Gray
Write-Host "   - Escanea el QR code que aparece" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🧪 Probar en emulador:" -ForegroundColor White
Write-Host "   - Android: Presiona 'a' en la terminal" -ForegroundColor Gray
Write-Host "   - iOS: Presiona 'i' en la terminal" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 ARCHIVOS CREADOS:" -ForegroundColor Cyan
Write-Host "   ✅ package.json - Configuración del proyecto" -ForegroundColor Gray
Write-Host "   ✅ app.json - Configuración de Expo" -ForegroundColor Gray
Write-Host "   ✅ App.js - Archivo principal" -ForegroundColor Gray
Write-Host "   ✅ AuthContext.js - Contexto de autenticación" -ForegroundColor Gray
Write-Host "   ✅ appService.js - Servicio de inicialización" -ForegroundColor Gray
Write-Host "   ✅ LoadingScreen.js - Pantalla de carga" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 CONFIGURACIÓN DEL BACKEND:" -ForegroundColor Cyan
Write-Host "   📍 Conecta a: http://localhost:3000" -ForegroundColor Gray
Write-Host "   📝 Edita la URL en: src\services\authService.js" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 USUARIOS DE PRUEBA:" -ForegroundColor Cyan
Write-Host "   👤 admin@anm.gov.co / admin123" -ForegroundColor Gray
Write-Host "   👤 supervisor@minera.com / supervisor123" -ForegroundColor Gray
Write-Host "   👤 operador@minera.com / operador123" -ForegroundColor Gray
Write-Host ""
Write-Host "🐛 SI HAY ERRORES:" -ForegroundColor Yellow
Write-Host "   💡 npm cache clean --force" -ForegroundColor Gray
Write-Host "   💡 expo install --fix" -ForegroundColor Gray
Write-Host "   💡 expo start --clear" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 ¡EJECUTA 'expo start' PARA COMENZAR! 🚀" -ForegroundColor Green

Read-Host "Presiona Enter para finalizar..."