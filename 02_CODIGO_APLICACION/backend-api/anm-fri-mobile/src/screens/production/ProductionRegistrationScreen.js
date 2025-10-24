import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import productionService from '../../services/productionService';

const { width, height } = Dimensions.get('window');

const ProductionRegistrationScreen = ({ navigation }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombreOperador: '',
    ubicacion: '',
    tituloMinero: '',
    tipoMineral: '',
    cantidad: '',
    observaciones: '',
    coordenadas: null
  });

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [lastEntry, setLastEntry] = useState(null);

  const { user } = useAuth();
  const mapRef = useRef(null);

  useEffect(() => {
    // Pre-llenar datos del usuario
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombreOperador: user.nombre || '',
        ubicacion: user.ubicacion || ''
      }));
    }

    // Obtener ubicación actual
    getCurrentLocation();
  }, [user]);

  // =============================================================================
  // 📍 FUNCIONES DE UBICACIÓN
  // =============================================================================

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesita acceso a la ubicación para registrar la producción');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      setFormData(prev => ({
        ...prev,
        coordenadas: { latitude, longitude }
      }));

      // Obtener dirección
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const addr = address[0];
        const locationString = `${addr.city || ''} ${addr.region || ''} ${addr.country || ''}`.trim();
        setFormData(prev => ({
          ...prev,
          ubicacion: locationString
        }));
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setFormData(prev => ({
      ...prev,
      coordenadas: { latitude, longitude }
    }));
  };

  // =============================================================================
  // 📝 FUNCIONES DEL FORMULARIO
  // =============================================================================

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombreOperador.trim()) {
      newErrors.nombreOperador = 'El nombre del operador es requerido';
    }
    
    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }
    
    if (!formData.tituloMinero.trim()) {
      newErrors.tituloMinero = 'El título minero es requerido';
    }
    
    if (!formData.tipoMineral.trim()) {
      newErrors.tipoMineral = 'El tipo de mineral es requerido';
    }
    
    if (!formData.cantidad.trim()) {
      newErrors.cantidad = 'La cantidad es requerida';
    } else if (isNaN(parseFloat(formData.cantidad))) {
      newErrors.cantidad = 'La cantidad debe ser un número válido';
    }
    
    if (!formData.coordenadas) {
      newErrors.coordenadas = 'Debe seleccionar una ubicación en el mapa';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProductionEntry = async (isRepeat = false) => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const entryData = {
        ...formData,
        fechaHora: new Date().toISOString(),
        operadorId: user?.id,
        esRepeticion: isRepeat,
        entradaAnteriorId: isRepeat && lastEntry ? lastEntry.id : null
      };

      const response = await productionService.saveProductionEntry(entryData);
      
      if (response.success) {
        setLastEntry(response.data);
        
        Alert.alert(
          '✅ Registro Exitoso',
          isRepeat 
            ? 'Nueva entrada registrada con la misma información'
            : 'Información de producción registrada correctamente',
          [{ text: 'OK' }]
        );

        if (!isRepeat) {
          // Limpiar formulario después del primer guardado exitoso
          setFormData(prev => ({
            ...prev,
            cantidad: '',
            observaciones: ''
          }));
        }
      } else {
        Alert.alert('❌ Error', response.message);
      }
    } catch (error) {
      console.error('Error guardando entrada:', error);
      Alert.alert('❌ Error', 'No se pudo guardar la información');
    } finally {
      setSaving(false);
    }
  };

  const repeatEntry = () => {
    if (!lastEntry) {
      Alert.alert('❌ Error', 'No hay entrada anterior para repetir');
      return;
    }
    saveProductionEntry(true);
  };

  // =============================================================================
  // 🎨 COMPONENTES DE INTERFAZ
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <SafeAreaView>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="construct" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>Registro de Producción</Text>
            <Text style={styles.logoSubtext}>Sistema ANM FRI</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderMapModal = () => (
    <Modal
      visible={showMap}
      animationType="slide"
      onRequestClose={() => setShowMap(false)}
    >
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>Seleccionar Ubicación</Text>
          <TouchableOpacity
            style={styles.closeMapButton}
            onPress={() => setShowMap(false)}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.latitude || 4.6097,
            longitude: currentLocation?.longitude || -74.0817,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {formData.coordenadas && (
            <Marker
              coordinate={formData.coordenadas}
              title="Ubicación de Producción"
              description="Punto seleccionado para el registro"
            />
          )}
        </MapView>
        
        <View style={styles.mapFooter}>
          <TouchableOpacity
            style={styles.confirmLocationButton}
            onPress={() => setShowMap(false)}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.confirmLocationText}>Confirmar Ubicación</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderForm = () => (
    <ScrollView 
      style={styles.formContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Información del Operador */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>👤 Información del Operador</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nombre Completo</Text>
          <View style={[styles.inputWrapper, errors.nombreOperador && styles.inputError]}>
            <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Juan Carlos Pérez"
              placeholderTextColor="#9CA3AF"
              value={formData.nombreOperador}
              onChangeText={(value) => handleInputChange('nombreOperador', value)}
            />
          </View>
          {errors.nombreOperador && (
            <Text style={styles.errorText}>{errors.nombreOperador}</Text>
          )}
        </View>
      </View>

      {/* Ubicación y Mapa */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📍 Ubicación de Producción</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Ubicación</Text>
          <View style={[styles.inputWrapper, errors.ubicacion && styles.inputError]}>
            <Ionicons name="location" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Mina El Dorado, Antioquia"
              placeholderTextColor="#9CA3AF"
              value={formData.ubicacion}
              onChangeText={(value) => handleInputChange('ubicacion', value)}
            />
          </View>
          {errors.ubicacion && (
            <Text style={styles.errorText}>{errors.ubicacion}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setShowMap(true)}
        >
          <Ionicons name="map" size={20} color="#2E7D32" />
          <Text style={styles.mapButtonText}>
            {formData.coordenadas ? 'Cambiar Ubicación en Mapa' : 'Seleccionar Ubicación en Mapa'}
          </Text>
        </TouchableOpacity>

        {formData.coordenadas && (
          <View style={styles.coordinatesInfo}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.coordinatesText}>
              Lat: {formData.coordenadas.latitude.toFixed(6)}, 
              Lng: {formData.coordenadas.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* Información Minera */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>⛏️ Información Minera</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Título Minero</Text>
          <View style={[styles.inputWrapper, errors.tituloMinero && styles.inputError]}>
            <Ionicons name="document-text" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ej: TIT-12345-2024"
              placeholderTextColor="#9CA3AF"
              value={formData.tituloMinero}
              onChangeText={(value) => handleInputChange('tituloMinero', value)}
            />
          </View>
          {errors.tituloMinero && (
            <Text style={styles.errorText}>{errors.tituloMinero}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Tipo de Mineral</Text>
          <View style={[styles.inputWrapper, errors.tipoMineral && styles.inputError]}>
            <Ionicons name="diamond" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Oro, Carbón, Esmeraldas"
              placeholderTextColor="#9CA3AF"
              value={formData.tipoMineral}
              onChangeText={(value) => handleInputChange('tipoMineral', value)}
            />
          </View>
          {errors.tipoMineral && (
            <Text style={styles.errorText}>{errors.tipoMineral}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Cantidad (Toneladas)</Text>
          <View style={[styles.inputWrapper, errors.cantidad && styles.inputError]}>
            <Ionicons name="scale" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ej: 15.5"
              placeholderTextColor="#9CA3AF"
              value={formData.cantidad}
              onChangeText={(value) => handleInputChange('cantidad', value)}
              keyboardType="numeric"
            />
          </View>
          {errors.cantidad && (
            <Text style={styles.errorText}>{errors.cantidad}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Observaciones (Opcional)</Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Notas adicionales sobre la producción..."
              placeholderTextColor="#9CA3AF"
              value={formData.observaciones}
              onChangeText={(value) => handleInputChange('observaciones', value)}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </View>

      {/* Información de Tiempo */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🕐 Información de Tiempo</Text>
        <View style={styles.timeInfoCard}>
          <Ionicons name="time" size={24} color="#2E7D32" />
          <View style={styles.timeInfoText}>
            <Text style={styles.timeInfoTitle}>Hora de Registro</Text>
            <Text style={styles.timeInfoValue}>
              {new Date().toLocaleString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Botones de Acción */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.buttonDisabled]}
          onPress={() => saveProductionEntry(false)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Registrar Producción</Text>
            </>
          )}
        </TouchableOpacity>

        {lastEntry && (
          <TouchableOpacity
            style={[styles.repeatButton, saving && styles.buttonDisabled]}
            onPress={repeatEntry}
            disabled={saving}
          >
            <Ionicons name="refresh" size={20} color="#2E7D32" />
            <Text style={styles.repeatButtonText}>Repetir con Nueva Hora</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      {renderForm()}
      {renderMapModal()}
    </KeyboardAvoidingView>
  );
};

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    backgroundColor: '#2E7D32',
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: '#111827',
  },
  textAreaWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  textArea: {
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
    marginTop: 8,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timeInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  timeInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  timeInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timeInfoValue: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
  },
  buttonsContainer: {
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  repeatButton: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  repeatButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Estilos del mapa
  mapContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeMapButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  mapFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmLocationButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLocationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProductionRegistrationScreen;
