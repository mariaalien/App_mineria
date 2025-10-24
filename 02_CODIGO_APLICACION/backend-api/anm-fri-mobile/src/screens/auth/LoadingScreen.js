import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo o icono de la aplicación */}
        <Ionicons 
          name="construct" 
          size={80} 
          color="#2E7D32" 
          style={styles.logo}
        />
        
        {/* Título */}
        <Text style={styles.title}>Sistema FRI - ANM</Text>
        <Text style={styles.subtitle}>Cargando aplicación...</Text>
        
        {/* Indicador de carga */}
        <ActivityIndicator 
          size="large" 
          color="#2E7D32" 
          style={styles.loader}
        />
        
        {/* Texto de estado */}
        <Text style={styles.statusText}>
          Verificando credenciales...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    marginBottom: 24,
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default LoadingScreen;
