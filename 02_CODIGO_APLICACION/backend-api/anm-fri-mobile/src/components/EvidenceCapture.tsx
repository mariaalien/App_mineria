// src/components/EvidenceCapture.tsx - Captura de fotos con GPS
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
        quality: 0.8, // Optimizar tamaño para móvil
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Crear evidencia con metadatos
        const newEvidence: EvidenceItem = {
          id: Date.now().toString(),
          uri: asset.uri,
          timestamp: new Date().toISOString(),
          type: type,
        };

        // Agregar ubicación si está disponible
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
          `Foto de ${type} guardada con ${currentLocation ? 'ubicación GPS' : 'información básica'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'No se pudo capturar la foto');
    }
  };

  const selectFromGallery = async (type: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
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

        // Agregar ubicación actual (no de la foto)
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

        setShowModal(false);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
    }
  };

  const removeEvidence = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Eliminar Evidencia',
      '¿Estás seguro de que quieres eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedEvidence = evidence.filter(item => item.id !== id);
            setEvidence(updatedEvidence);
            onEvidenceAdd(updatedEvidence);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evidencia Fotográfica</Text>
        <Text style={styles.subtitle}>
          {evidence.length}/{maxPhotos} fotos • {currentLocation ? '📍 GPS Activo' : '📍 GPS Inactivo'}
        </Text>
      </View>

      {/* Galería de evidencias */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
        {evidence.map((item) => (
          <View key={item.id} style={styles.evidenceItem}>
            <Image source={{ uri: item.uri }} style={styles.evidenceImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeEvidence(item.id)}
            >
              <Ionicons name="close-circle" size={24} color="#e74c3c" />
            </TouchableOpacity>
            <View style={styles.evidenceInfo}>
              <Text style={styles.evidenceType}>{item.type}</Text>
              <Text style={styles.evidenceTime}>{formatDate(item.timestamp)}</Text>
              {item.location && (
                <Text style={styles.evidenceLocation}>
                  📍 {item.location.address}
                </Text>
              )}
            </View>
          </View>
        ))}

        {/* Botón para agregar nueva evidencia */}
        {evidence.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="camera" size={32} color="#2E7D32" />
            <Text style={styles.addButtonText}>Agregar Foto</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal de selección de tipo */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tipo de Evidencia</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {evidenceTypes.map((type) => (
              <View key={type} style={styles.typeSection}>
                <Text style={styles.typeTitle}>{type}</Text>
                <View style={styles.captureOptions}>
                  <PremiumButton
                    title="📸 Tomar Foto"
                    onPress={() => capturePhoto(type)}
                    variant="primary"
                    size="medium"
                    icon={<Ionicons name="camera" size={16} color="white" />}
                  />
                  <PremiumButton
                    title="🖼️ Galería"
                    onPress={() => selectFromGallery(type)}
                    variant="secondary"
                    size="medium"
                    icon={<Ionicons name="images" size={16} color="#2E7D32" />}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  gallery: {
    flexDirection: 'row',
  },
  evidenceItem: {
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 180,
  },
  evidenceImage: {
    width: 164,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  evidenceInfo: {
    marginTop: 8,
  },
  evidenceType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  evidenceTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  evidenceLocation: {
    fontSize: 11,
    color: '#2E7D32',
    marginTop: 2,
  },
  addButton: {
    width: 180,
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  addButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  typeSection: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  captureOptions: {
    flexDirection: 'row',
    gap: 12,
  },
});