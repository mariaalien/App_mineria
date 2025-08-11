// src/components/EvidenceCapture.tsx - VERSIÓN CORREGIDA SIN ERRORES DE SINTAXIS
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import PremiumButton from './PremiumButton';
import { ExportShareService } from '../services/exportShareService';

interface EvidenceItem {
  id: string;
  uri: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  timestamp: string;
  type: string;
}

interface EvidenceCaptureProps {
  onEvidenceAdd: (evidence: EvidenceItem[]) => void;
  maxPhotos?: number;
  evidenceTypes?: string[];
}

export default function EvidenceCapture({
  onEvidenceAdd,
  maxPhotos = 5,
  evidenceTypes = ['Sitio de Extracción', 'Maquinaria', 'Producto', 'Documentos', 'Otros']
}: EvidenceCaptureProps) {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    try {
      // Permisos de cámara
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus === 'granted');

      // Permisos de ubicación
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus === 'granted');

      if (cameraStatus !== 'granted') {
        Alert.alert(
          'Permisos Necesarios',
          'Necesitamos acceso a la cámara para capturar evidencia fotográfica.',
          [{ text: 'OK' }]
        );
      }

      if (locationStatus !== 'granted') {
        Alert.alert(
          'Permisos de Ubicación',
          'Los permisos de ubicación ayudan a georreferenciar las evidencias.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (!locationPermission) return;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });
      setCurrentLocation(location);

      // Obtener dirección legible
      const [addressInfo] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('📍 Ubicación actual capturada:', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        address: `${addressInfo.city}, ${addressInfo.region}`,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const capturePhoto = async (type: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        const newEvidence: EvidenceItem = {
          id: Date.now().toString(),
          uri: asset.uri,
          timestamp: new Date().toISOString(),
          type: type,
        };

        if (currentLocation) {
          const [addressInfo] = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });

          newEvidence.location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy || 0,
            address: `${addressInfo.city || 'Desconocida'}, ${addressInfo.region || 'Desconocida'}`,
          };
        }

        const updatedEvidence = [...evidence, newEvidence];
        setEvidence(updatedEvidence);
        onEvidenceAdd(updatedEvidence);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowModal(false);

        Alert.alert(
          '📸 Evidencia Capturada',
          `Foto de ${type} guardada con ${currentLocation ? 'GPS incluido' : 'sin GPS'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'No se pudo capturar la foto');
    }
  };

  const exportEvidence = async () => {
    if (evidence.length === 0) {
      Alert.alert('Sin Evidencias', 'No hay evidencias para exportar');
      return;
    }

    try {
      setIsExporting(true);

      // Preparar datos para exportación
      const evidenceData = evidence.map(item => ({
        id: item.id,
        tipo: item.type,
        fecha: new Date(item.timestamp).toLocaleString(),
        ubicacion: item.location ? {
          latitud: item.location.latitude,
          longitud: item.location.longitude,
          precision: item.location.accuracy,
          direccion: item.location.address
        } : 'Sin ubicación',
        archivo: item.uri
      }));

      // Usar el servicio de exportación
      await ExportShareService.exportAndShare(evidenceData, {
        fileName: `evidencias_fri_${new Date().getTime()}`,
        format: 'json',
        includePhotos: true
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Éxito', 'Evidencias exportadas correctamente');

    } catch (error) {
      console.error('❌ Error exportando evidencias:', error);
      Alert.alert('Error', 'No se pudieron exportar las evidencias');
    } finally {
      setIsExporting(false);
    }
  };

  const removeEvidence = (id: string) => {
    Alert.alert(
      'Eliminar Evidencia',
      '¿Estás seguro de que quieres eliminar esta evidencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedEvidence = evidence.filter(item => item.id !== id);
            setEvidence(updatedEvidence);
            onEvidenceAdd(updatedEvidence);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con botón de exportación */}
      <View style={styles.header}>
        <Text style={styles.title}>📸 Evidencia Fotográfica</Text>
        <View style={styles.headerButtons}>
          {/* Botón de exportar en header */}
          <TouchableOpacity 
            style={[
              styles.exportButton,
              evidence.length === 0 && styles.disabledButton
            ]} 
            onPress={exportEvidence}
            disabled={evidence.length === 0 || isExporting}
          >
            <Ionicons 
              name={isExporting ? "hourglass-outline" : "share-outline"} 
              size={20} 
              color={evidence.length > 0 && !isExporting ? "#007AFF" : "#999"} 
            />
          </TouchableOpacity>
          
          {/* Botón de cámara existente */}
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowModal(true)}
            disabled={evidence.length >= maxPhotos}
          >
            <Ionicons 
              name="camera" 
              size={20} 
              color={evidence.length < maxPhotos ? "#007AFF" : "#999"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status con indicador de exportación */}
      <View style={styles.statusContainer}>
        <Text style={styles.subtitle}>
          {evidence.length}/{maxPhotos} fotos capturadas
        </Text>
        {isExporting && (
          <Text style={styles.exportingText}>
            📤 Exportando evidencias...
          </Text>
        )}
      </View>

      {/* Galería con botón flotante */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
        {evidence.map((item) => (
          <View key={item.id} style={styles.evidenceCard}>
            <Image source={{ uri: item.uri }} style={styles.evidenceImage} />
            <View style={styles.evidenceInfo}>
              <Text style={styles.evidenceType}>{item.type}</Text>
              <Text style={styles.evidenceTime}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </Text>
              {item.location && (
                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={12} color="#00C851" />
                  <Text style={styles.locationText}>GPS</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeEvidence(item.id)}
            >
              <Ionicons name="close-circle" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}
        
        {/* Botón flotante en galería */}
        {evidence.length > 0 && (
          <View style={styles.floatingExportContainer}>
            <TouchableOpacity 
              style={styles.floatingExportButton}
              onPress={exportEvidence}
              disabled={isExporting}
            >
              <Ionicons 
                name={isExporting ? "hourglass-outline" : "cloud-upload-outline"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.floatingButtonText}>
                {isExporting ? 'Exportando...' : 'Exportar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sección de acciones principales */}
      {evidence.length > 0 && (
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[
              styles.primaryExportButton,
              isExporting && styles.exportingButton
            ]}
            onPress={exportEvidence}
            disabled={isExporting}
          >
            <View style={styles.exportButtonContent}>
              <Ionicons 
                name={isExporting ? "sync-outline" : "cloud-upload-outline"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.primaryButtonText}>
                {isExporting ? 'Exportando Evidencias...' : 'Exportar y Compartir'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.exportInfo}>
            <Text style={styles.infoText}>
              📋 {evidence.length} evidencia(s) • 
              📍 {evidence.filter(e => e.location).length} con GPS
            </Text>
          </View>
        </View>
      )}

      {/* Modal de tipos de evidencia */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Tipo de Evidencia</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.typesList}>
            {evidenceTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.typeButton}
                onPress={() => capturePhoto(type)}
              >
                <Ionicons name="camera-outline" size={24} color="#007AFF" />
                <Text style={styles.typeText}>{type}</Text>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6D6D80',
  },
  exportingText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  gallery: {
    maxHeight: 200,
  },
  evidenceCard: {
    width: 150,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evidenceImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  evidenceInfo: {
    padding: 8,
  },
  evidenceType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  evidenceTime: {
    fontSize: 10,
    color: '#6D6D80',
    marginTop: 2,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 10,
    color: '#00C851',
    marginLeft: 2,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  floatingExportContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minWidth: 120,
  },
  floatingExportButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 2,
  },
  floatingButtonText: {
    color: 'white', // ⬅️ CORREGIDO: agregado el valor del color
    fontSize: 11,
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  primaryExportButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportingButton: {
    backgroundColor: '#5AC8FA',
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exportInfo: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#6D6D80',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  typesList: {
    flex: 1,
    padding: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  typeText: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    marginLeft: 12,
  },
});