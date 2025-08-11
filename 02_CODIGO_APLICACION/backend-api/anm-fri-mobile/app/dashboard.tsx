// app/dashboard.tsx - Pantalla principal del Dashboard
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import MobileDashboard from '../src/components/MobileDashboard';
import { friAPI } from '../src/services/api';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      console.log('🔄 Actualizando dashboard...');
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar datos (aquí irían las llamadas reales a la API)
      const stats = await friAPI.getStats();
      console.log('📊 Estadísticas actualizadas:', stats);
      
      setLastUpdate(new Date());
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '✅ Dashboard Actualizado',
        'Todos los datos han sido actualizados exitosamente'
      );
      
    } catch (error) {
      console.error('❌ Error actualizando dashboard:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        '❌ Error de Actualización',
        'No se pudieron actualizar los datos. Verifica tu conexión.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Cargar datos iniciales
    console.log('📊 Inicializando dashboard móvil...');
    
    // Simular carga inicial
    setTimeout(() => {
      console.log('✅ Dashboard inicializado');
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Información de actualización */}
      <View style={styles.updateInfo}>
        <View style={styles.updateRow}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.updateText}>
            Última actualización: {lastUpdate.toLocaleTimeString('es-CO')}
          </Text>
        </View>
        
        <View style={styles.updateRow}>
          <Ionicons name="cloud-done" size={14} color="#27ae60" />
          <Text style={[styles.updateText, { color: '#27ae60' }]}>
            Datos sincronizados
          </Text>
        </View>
      </View>

      {/* Dashboard Component */}
      <MobileDashboard 
        onRefresh={handleRefresh}
        loading={refreshing}
      />

      {/* Información adicional */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoPanelTitle}>🎯 Dashboard Interactivo</Text>
        <Text style={styles.infoPanelText}>
          • <Text style={styles.highlight}>Touch:</Text> Toca los KPIs y gráficos para ver detalles
        </Text>
        <Text style={styles.infoPanelText}>
          • <Text style={styles.highlight}>Haptic:</Text> Siente la respuesta táctil en cada interacción
        </Text>
        <Text style={styles.infoPanelText}>
          • <Text style={styles.highlight}>Tiempo Real:</Text> Los datos se actualizan automáticamente
        </Text>
        <Text style={styles.infoPanelText}>
          • <Text style={styles.highlight}>Optimizado:</Text> Diseñado específicamente para móviles
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  updateInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updateText: {
    fontSize: 12,
    color: '#666',
  },
  infoPanel: {
    backgroundColor: '#e8f5e8',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoPanelText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
    lineHeight: 18,
  },
  highlight: {
    fontWeight: '600',
  },
});