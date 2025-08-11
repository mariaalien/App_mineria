// src/components/LocationInfo.tsx - Arreglado para Expo SDK 49+
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  address?: string;
  timestamp: string;
}

interface LocationInfoProps {
  onLocationUpdate: (location: LocationData) => void;
  autoUpdate?: boolean;
}

export default function LocationInfo({
  onLocationUpdate,
  autoUpdate = true
}: LocationInfoProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (hasPermission && autoUpdate) {
      getCurrentLocation();
    }
  }, [hasPermission, autoUpdate]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        setError('Permisos de ubicación requeridos');
        Alert.alert(
          'Permisos Necesarios',
          'Esta aplicación necesita acceso a la ubicación para georreferenciar los datos del FRI.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurar', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
      }
    } catch (error) {
      setError('Error solicitando permisos');
      console.error('Error requesting location permission:', error);
    }
  };

  // Función para obtener dirección aproximada sin reverseGeocode
  const getApproximateAddress = (lat: number, lng: number): string => {
    // Coordenadas aproximadas de Colombia
    let region = 'Colombia';
    
    // Bogotá aproximada: 4.7110, -74.0721
    if (lat > 4.4 && lat < 5.0 && lng > -74.5 && lng < -73.8) {
      region = 'Bogotá D.C., Colombia';
    }
    // Medellín aproximada: 6.2442, -75.5812
    else if (lat > 6.0 && lat < 6.5 && lng > -76.0 && lng < -75.3) {
      region = 'Medellín, Antioquia';
    }
    // Cali aproximada: 3.4516, -76.5320
    else if (lat > 3.2 && lat < 3.7 && lng > -77.0 && lng < -76.2) {
      region = 'Cali, Valle del Cauca';
    }
    // Cartagena aproximada: 10.3910, -75.4794
    else if (lat > 10.1 && lat < 10.7 && lng > -75.8 && lng < -75.2) {
      region = 'Cartagena, Bolívar';
    }
    // Zona norte (Caribe)
    else if (lat > 8.0) {
      region = 'Región Caribe, Colombia';
    }
    // Zona sur
    else if (lat < 2.0) {
      region = 'Región Amazónica, Colombia';
    }
    // Zona central
    else {
      region = 'Región Central, Colombia';
    }
    
    return region;
  };

  const getCurrentLocation = async () => {
    if (!hasPermission) {
      await requestLocationPermission();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Haptic feedback al iniciar captura
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 5 segundos máximo de espera
      });

      // Obtener dirección aproximada (sin reverseGeocode que fue removido)
      const approximateAddress = getApproximateAddress(
        locationResult.coords.latitude,
        locationResult.coords.longitude
      );

      const locationData: LocationData = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy || 0,
        altitude: locationResult.coords.altitude || undefined,
        address: approximateAddress,
        timestamp: new Date().toISOString(),
      };

      setLocation(locationData);
      onLocationUpdate(locationData);

      // Haptic feedback de éxito
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      console.log('📍 Ubicación capturada:', locationData);
    } catch (error) {
      setError('Error obteniendo ubicación');
      console.error('Error getting location:', error);
      
      // Haptic feedback de error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Error de GPS',
        'No se pudo obtener la ubicación. Verifica que el GPS esté activado.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reintentar', onPress: getCurrentLocation }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCoordinate = (value: number, type: 'lat' | 'lng') => {
    const direction = type === 'lat' 
      ? (value >= 0 ? 'N' : 'S') 
      : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 5) return '#27ae60'; // Excelente
    if (accuracy <= 10) return '#f39c12'; // Buena
    return '#e74c3c'; // Regular
  };

  const getAccuracyText = (accuracy: number) => {
    if (accuracy <= 5) return 'Excelente';
    if (accuracy <= 10) return 'Buena';
    return 'Regular';
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={24} color="#e74c3c" />
          <Text style={styles.errorText}>Permisos de ubicación requeridos</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestLocationPermission}>
            <Text style={styles.retryButtonText}>Solicitar Permisos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons 
            name={location ? "location" : "location-outline"} 
            size={20} 
            color={location ? "#27ae60" : "#666"} 
          />
          <Text style={styles.title}>Información GPS</Text>
          {isLoading && <ActivityIndicator size="small" color="#2E7D32" />}
        </View>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={getCurrentLocation}
          disabled={isLoading}
        >
          <Ionicons 
            name="refresh" 
            size={18} 
            color={isLoading ? "#ccc" : "#2E7D32"} 
          />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {location ? (
        <View style={styles.locationContainer}>
          <View style={styles.coordinatesRow}>
            <View style={styles.coordinate}>
              <Text style={styles.coordinateLabel}>Latitud</Text>
              <Text style={styles.coordinateValue}>
                {formatCoordinate(location.latitude, 'lat')}
              </Text>
            </View>
            <View style={styles.coordinate}>
              <Text style={styles.coordinateLabel}>Longitud</Text>
              <Text style={styles.coordinateValue}>
                {formatCoordinate(location.longitude, 'lng')}
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Precisión</Text>
              <Text style={[
                styles.detailValue,
                { color: getAccuracyColor(location.accuracy) }
              ]}>
                ±{location.accuracy.toFixed(1)}m ({getAccuracyText(location.accuracy)})
              </Text>
            </View>
            
            {location.altitude && (
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Altitud</Text>
                <Text style={styles.detailValue}>
                  {location.altitude.toFixed(0)}m
                </Text>
              </View>
            )}
          </View>

          {location.address && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Ubicación Aproximada</Text>
              <Text style={styles.addressValue}>{location.address}</Text>
              <Text style={styles.addressNote}>
                📍 Nota: Ubicación estimada basada en coordenadas GPS
              </Text>
            </View>
          )}

          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>
              Actualizado: {new Date(location.timestamp).toLocaleTimeString('es-CO')}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="location-outline" size={48} color="#ccc" />
          <Text style={styles.placeholderText}>
            {isLoading ? 'Obteniendo ubicación...' : 'Toca actualizar para obtener ubicación'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  locationContainer: {
    gap: 12,
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordinate: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  addressContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  addressNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  timestampContainer: {
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2E7D32',
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});