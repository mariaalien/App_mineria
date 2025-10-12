// app/_layout.tsx - Layout sin splash screen personalizado
import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreenExpo from 'expo-splash-screen';

// Importar pantallas y contextos
import LoginScreen from '../src/screens/auth/LoginScreen';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// Prevenir que el splash screen nativo se oculte automáticamente al inicio
SplashScreenExpo.preventAutoHideAsync();

// Componente interno que usa el contexto de autenticación
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  console.log('🔍 AppContent - Estados:', {
    isAuthenticated,
    loading,
  });

  useEffect(() => {
    // Ocultar el splash screen nativo después de que cargue el contexto
    const hideSplash = async () => {
      if (!loading) {
        console.log('🎬 Ocultando splash screen nativo');
        await SplashScreenExpo.hideAsync();
      }
    };

    hideSplash();
  }, [loading]);

  // Si el AuthContext está cargando
  if (loading) {
    console.log('🔄 AuthContext cargando...');
    // Mantener el splash nativo mientras carga
    return null;
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    console.log('🔐 Usuario no autenticado, mostrando login');
    return <LoginScreen />;
  }

  // Si está autenticado, mostrar la aplicación principal (tabs)
  console.log('✅ Usuario autenticado, mostrando aplicación principal');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  useEffect(() => {
    console.log('🚀 Inicializando RootLayout sin splash personalizado');
    
    // Configurar barra de estado
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#2E7D32', true);
      StatusBar.setBarStyle('light-content', true);
    }
  }, []);

  return (
    <AuthProvider>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#2E7D32"
        translucent={false}
      />
      <AppContent />
    </AuthProvider>
  );
}