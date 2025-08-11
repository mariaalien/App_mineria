// src/screens/FRIFormScreen.tsx - Pantalla principal del formulario FRI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EvidenceCapture from '../components/EvidenceCapture';
import LocationInfo from '../components/LocationInfo';
import { ExportShareService } from '../services/exportShareService'; // ⬅️ IMPORTAR AQUÍ

interface FRIData {
  id: string;
  tipo: string;
  fecha: string;
  ubicacion: any;
  evidencias: any[];
  datos: {
    tipoMineral: string;
    cantidadExtraccion: number;
    metodologia: string;
    observaciones: string;
  };
}

interface FRIFormScreenProps {
  route: any;
  navigation: any;
}

export default function FRIFormScreen({ route, navigation }: FRIFormScreenProps) {
  const { friType = 'mensual' } = route.params || {};
  
  const [friData, setFriData] = useState<FRIData>({
    id: Date.now().toString(),
    tipo: friType,
    fecha: new Date().toISOString(),
    ubicacion: null,
    evidencias: [],
    datos: {
      tipoMineral: '',
      cantidadExtraccion: 0,
      metodologia: '',
      observaciones: '',
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Función para actualizar ubicación
  const handleLocationUpdate = (location: any) => {
    setFriData(prev => ({
      ...prev,
      ubicacion: {
        latitud: location.latitude,
        longitud: location.longitude,
        precision: location.accuracy,
        direccion: location.address,
        timestamp: location.timestamp
      }
    }));
  };

  // Función para actualizar evidencias
  const handleEvidenceAdd = (evidences: any[]) => {
    setFriData(prev => ({
      ...prev,
      evidencias: evidences
    }));
  };

  // ⬅️ FUNCIÓN PARA EXPORTAR TODO EL FRI
  const exportCompleteeFRI = async () => {
    try {
      setIsLoading(true);

      // Preparar datos completos del FRI
      const completeFRIData = {
        informacion_general: {
          id: friData.id,
          tipo_fri: friData.tipo,
          fecha_creacion: new Date(friData.fecha).toLocaleString(),
          estado: 'Borrador'
        },
        ubicacion_gps: friData.ubicacion || 'No disponible',
        datos_mineria: friData.datos,
        evidencias_fotograficas: friData.evidencias.map(ev => ({
          id: ev.id,
          tipo: ev.type,
          fecha_captura: new Date(ev.timestamp).toLocaleString(),
          ubicacion_gps: ev.location || 'Sin GPS',
          archivo: ev.uri
        })),
        resumen: {
          total_evidencias: friData.evidencias.length,
          con_gps: friData.evidencias.filter(ev => ev.location).length,
          sin_gps: friData.evidencias.filter(ev => !ev.location).length,
          fecha_exportacion: new Date().toLocaleString()
        }
      };

      // Llamar al servicio de exportación
      await ExportShareService.exportAndShare(completeFRIData, {
        fileName: `FRI_${friData.tipo}_${new Date().getTime()}`,
        format: 'json',
        includePhotos: true
      });

    } catch (error) {
      console.error('❌ Error exportando FRI completo:', error);
      Alert.alert('Error', 'No se pudo exportar el FRI completo');
    } finally {
      setIsLoading(false);
    }
  };

  // ⬅️ FUNCIÓN PARA GUARDAR BORRADOR Y EXPORTAR
  const saveDraftAndExport = async () => {
    Alert.alert(
      'Guardar y Exportar',
      '¿Qué deseas hacer?',
      [
        {
          text: 'Solo Guardar Borrador',
          onPress: () => saveDraftLocally(),
        },
        {
          text: 'Exportar FRI Completo',
          onPress: () => exportCompleteeFRI(),
        },
        {
          text: 'Guardar y Compartir',
          onPress: () => saveDraftAndShare(),
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const saveDraftLocally = async () => {
    try {
      // Aquí guardarías en AsyncStorage o base de datos local
      console.log('💾 Guardando borrador localmente...');
      Alert.alert('Éxito', 'Borrador guardado localmente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el borrador');
    }
  };

  const saveDraftAndShare = async () => {
    try {
      await saveDraftLocally();
      await exportCompleteeFRI();
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la operación');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botones de acción */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>FRI {friType.toUpperCase()}</Text>
        
        <View style={styles.headerActions}>
          {/* ⬅️ BOTÓN DE EXPORTAR EN HEADER */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={exportCompleteeFRI}
            disabled={isLoading}
          >
            <Ionicons 
              name="download-outline" 
              size={20} 
              color={isLoading ? "#999" : "#007AFF"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={saveDraftAndExport}
            disabled={isLoading}
          >
            <Ionicons 
              name="save-outline" 
              size={20} 
              color={isLoading ? "#999" : "#007AFF"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Información de ubicación GPS */}
        <LocationInfo 
          onLocationUpdate={handleLocationUpdate}
          autoUpdate={true}
        />

        {/* Captura de evidencias */}
        <EvidenceCapture 
          onEvidenceAdd={handleEvidenceAdd}
          maxPhotos={10}
        />

        {/* Aquí irían otros componentes del formulario */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>📋 Datos del FRI</Text>
          <View style={styles.dataCard}>
            <Text style={styles.dataItem}>Tipo: {friData.tipo}</Text>
            <Text style={styles.dataItem}>
              Fecha: {new Date(friData.fecha).toLocaleDateString()}
            </Text>
            <Text style={styles.dataItem}>
              Evidencias: {friData.evidencias.length}
            </Text>
            <Text style={styles.dataItem}>
              GPS: {friData.ubicacion ? '✅ Disponible' : '❌ No disponible'}
            </Text>
          </View>
        </View>

        {/* Botones de acción principales */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.primaryButton, styles.exportButton]}
            onPress={exportCompleteeFRI}
            disabled={isLoading}
          >
            <Ionicons name="share-outline" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isLoading ? 'Exportando...' : 'Exportar FRI'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, styles.saveButton]}
            onPress={saveDraftAndExport}
            disabled={isLoading}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Guardar y Compartir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
  },
  content: {
    flex: 1,
  },
  formSection: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  dataCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  dataItem: {
    fontSize: 14,
    color: '#6D6D80',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});