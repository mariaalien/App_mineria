// app/export.tsx - Pantalla de Exportación y Backup
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ExportManager from '../src/components/ExportManager';
import { friAPI } from '../src/services/api';

export default function ExportScreen() {
  const [friData, setFriData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFRIData();
  }, []);

  const loadFRIData = async () => {
    try {
      console.log('📊 Cargando datos FRI para exportación...');
      const response = await friAPI.getProduccion();
      setFriData(response.data || []);
      console.log('✅ Datos FRI cargados:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Error cargando datos FRI:', error);
      Alert.alert(
        '⚠️ Advertencia',
        'No se pudieron cargar los datos FRI. Se usarán datos de ejemplo para la exportación.'
      );
      
      // Datos de ejemplo para demo
      setFriData([
        {
          id: '1',
          titulo: 'FRI Producción Enero 2025',
          tipo: 'mensual',
          estado: 'completado',
          mineralPrincipal: 'Oro',
          cantidadExtraida: '125.5',
          unidadMedida: 'Kilogramos',
          valorProduccion: '15250000',
          municipio: 'Medellín',
          departamento: 'Antioquia',
          fechaCreacion: new Date().toISOString(),
          evidencias: ['evidence1.jpg', 'evidence2.jpg'],
        },
        {
          id: '2',
          titulo: 'FRI Producción Febrero 2025',
          tipo: 'mensual',
          estado: 'enviado',
          mineralPrincipal: 'Plata',
          cantidadExtraida: '890.2',
          unidadMedida: 'Kilogramos',
          valorProduccion: '8900000',
          municipio: 'Bucaramanga',
          departamento: 'Santander',
          fechaCreacion: new Date().toISOString(),
          evidencias: ['evidence3.jpg'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportComplete = (filePath: string) => {
    console.log('✅ Exportación completada:', filePath);
    
    Alert.alert(
      '🎉 Exportación Exitosa',
      'Los datos han sido exportados y están listos para compartir.',
      [
        { text: 'OK' },
        { 
          text: 'Volver al Dashboard',
          onPress: () => router.push('/(tabs)/dashboard')
        }
      ]
    );
  };

  const handleBackupComplete = (filePath: string) => {
    console.log('✅ Backup completado:', filePath);
    
    Alert.alert(
      '💾 Backup Creado',
      'El backup ha sido creado exitosamente y guardado de forma local.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="download" size={48} color="#2E7D32" />
        <Text style={styles.loadingText}>Cargando datos para exportación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>📤 Exportar & Backup</Text>
          <Text style={styles.subtitle}>
            {friData.length} registros FRI disponibles
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <Text style={styles.dataCount}>{friData.length}</Text>
          <Text style={styles.dataLabel}>FRI</Text>
        </View>
      </View>

      {/* Export Manager */}
      <ExportManager
        data={friData}
        onExportComplete={handleExportComplete}
        onBackupComplete={handleBackupComplete}
      />

      {/* Información adicional */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoPanelTitle}>📋 Información de Exportación</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="document-text" size={16} color="#3498db" />
            <Text style={styles.infoText}>Formatos: JSON, CSV, PDF, TXT</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="share" size={16} color="#27ae60" />
            <Text style={styles.infoText}>Compartir por WhatsApp, email, etc.</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="archive" size={16} color="#e67e22" />
            <Text style={styles.infoText}>Backups automáticos locales</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={16} color="#9b59b6" />
            <Text style={styles.infoText}>Datos seguros y encriptados</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📤 Sistema de Exportación FRI • Día 17 Hora 3 Completado
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  headerActions: {
    alignItems: 'center',
  },
  dataCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoPanel: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});