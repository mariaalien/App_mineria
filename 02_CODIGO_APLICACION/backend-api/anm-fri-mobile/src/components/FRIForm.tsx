// src/components/FRIForm.tsx - Versión FUNCIONAL corregida
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import PremiumButton from './PremiumButton';
import EvidenceCapture from './EvidenceCapture';
import LocationInfo from './LocationInfo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface FRIFormProps {
  tipo: 'produccion' | 'inventarios' | 'paradas';
  onSuccess?: () => void;
  initialData?: any;
}

export default function FRIForm({ tipo, onSuccess, initialData }: FRIFormProps) {
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    tituloMinero: initialData?.tituloMinero || '',
    mineral: initialData?.mineral || '',
    municipio: initialData?.municipio || '',
    produccionBruta: initialData?.produccionBruta || '',
    unidadMedida: initialData?.unidadMedida || 'TONELADAS',
    fechaCorte: initialData?.fechaCorte || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para funcionalidades avanzadas
  const [evidencePhotos, setEvidencePhotos] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any>(null);

  // Función para actualizar campos
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Función de validación
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.tituloMinero.trim()) {
      newErrors.tituloMinero = 'Título minero es requerido';
    }
    if (!formData.mineral.trim()) {
      newErrors.mineral = 'Mineral es requerido';
    }
    if (!formData.municipio.trim()) {
      newErrors.municipio = 'Municipio es requerido';
    }
    if (!formData.produccionBruta || parseFloat(formData.produccionBruta) <= 0) {
      newErrors.produccionBruta = 'Producción bruta debe ser mayor a 0';
    }
    if (!formData.fechaCorte) {
      newErrors.fechaCorte = 'Fecha de corte es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para limpiar formulario
  const resetForm = () => {
    setFormData({
      tituloMinero: '',
      mineral: '',
      municipio: '',
      produccionBruta: '',
      unidadMedida: 'TONELADAS',
      fechaCorte: new Date().toISOString().split('T')[0],
    });
    setErrors({});
  };

  // Función de envío (SIMULADA)
  const onSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Simulando envío de FRI:', {
        tipo: tipo,
        tituloMinero: formData.tituloMinero,
        mineral: formData.mineral,
        municipio: formData.municipio,
        produccionBruta: parseFloat(formData.produccionBruta),
        unidadMedida: formData.unidadMedida,
        fechaCorte: formData.fechaCorte,
        timestamp: new Date().toISOString()
      });

      // Simular delay de red (1.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular éxito
      Alert.alert(
        '🎉 Éxito',
        `FRI ${tipo.toUpperCase()} creado correctamente\n\n` +
        `Título: ${formData.tituloMinero}\n` +
        `Mineral: ${formData.mineral}\n` +
        `Producción: ${formData.produccionBruta} ${formData.unidadMedida}`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              onSuccess?.();
            },
          },
        ]
      );

    } catch (error: any) {
      Alert.alert('Error', 'Error simulado en el procesamiento');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para renderizar campos de input PREMIUM
  const renderAnimatedInput = (
    field: string,
    label: string,
    placeholder: string,
    keyboardType: any = 'default',
    icon?: keyof typeof Ionicons.glyphMap
  ) => (
    <AnimatedInput
      label={label}
      value={formData[field]}
      onChangeText={(value) => updateField(field, value)}
      placeholder={placeholder}
      keyboardType={keyboardType}
      error={errors[field]}
      success={formData[field] && !errors[field]}
      required={true}
      icon={icon}
    />
  );

  const mineralOptions = [
    'ORO', 'PLATA', 'CARBON', 'COBRE', 'HIERRO', 
    'CALIZA', 'ARENA', 'GRAVA', 'ARCILLA', 'OTRO'
  ];

  const unidadMedidaOptions = [
    'TONELADAS', 'KILOGRAMOS', 'GRAMOS', 'METROS_CUBICOS', 'ONZAS'
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Nuevo FRI {tipo.toUpperCase()}</Text>
          <Text style={styles.subtitle}>Complete todos los campos requeridos</Text>
        </View>

        <View style={styles.form}>
          {/* Inputs mejorados con haptics */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Título Minero *</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="document-text" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIconPadding, errors.tituloMinero && styles.inputError]}
                placeholder="Ej: TM-001"
                value={formData.tituloMinero}
                onChangeText={(value) => updateField('tituloMinero', value)}
                onFocus={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {}
                }}
                placeholderTextColor="#999"
              />
            </View>
            {errors.tituloMinero && (
              <Text style={styles.errorText}>{errors.tituloMinero}</Text>
            )}
          </View>
          
          {/* Selector de Mineral MEJORADO */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mineral *</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mineralOptions.map((mineral) => (
                  <TouchableOpacity
                    key={mineral}
                    style={[
                      styles.pickerItem,
                      formData.mineral === mineral && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (e) {}
                      updateField('mineral', mineral);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        formData.mineral === mineral && styles.pickerItemTextSelected,
                      ]}
                    >
                      {mineral}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {errors.mineral && (
              <Text style={styles.errorText}>{errors.mineral}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Municipio *</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIconPadding, errors.municipio && styles.inputError]}
                placeholder="Ej: Bogotá"
                value={formData.municipio}
                onChangeText={(value) => updateField('municipio', value)}
                onFocus={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {}
                }}
                placeholderTextColor="#999"
              />
            </View>
            {errors.municipio && (
              <Text style={styles.errorText}>{errors.municipio}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Producción Bruta *</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="analytics" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIconPadding, errors.produccionBruta && styles.inputError]}
                placeholder="0.00"
                value={formData.produccionBruta}
                onChangeText={(value) => updateField('produccionBruta', value)}
                keyboardType="numeric"
                onFocus={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {}
                }}
                placeholderTextColor="#999"
              />
            </View>
            {errors.produccionBruta && (
              <Text style={styles.errorText}>{errors.produccionBruta}</Text>
            )}
          </View>
          
          {/* Selector de Unidad de Medida MEJORADO */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Unidad de Medida *</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {unidadMedidaOptions.map((unidad) => (
                  <TouchableOpacity
                    key={unidad}
                    style={[
                      styles.pickerItem,
                      formData.unidadMedida === unidad && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (e) {}
                      updateField('unidadMedida', unidad);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        formData.unidadMedida === unidad && styles.pickerItemTextSelected,
                      ]}
                    >
                      {unidad.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de Corte *</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIconPadding, errors.fechaCorte && styles.inputError]}
                placeholder="YYYY-MM-DD"
                value={formData.fechaCorte}
                onChangeText={(value) => updateField('fechaCorte', value)}
                onFocus={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {}
                }}
                placeholderTextColor="#999"
              />
            </View>
            {errors.fechaCorte && (
              <Text style={styles.errorText}>{errors.fechaCorte}</Text>
            )}
          </View>
        </View>

        {/* Nuevas funcionalidades móviles */}
        <LocationInfo 
          onLocationUpdate={setLocationData}
          autoUpdate={true}
        />

        <EvidenceCapture 
          onEvidenceAdd={setEvidencePhotos}
          maxPhotos={5}
          evidenceTypes={[
            'Sitio de Extracción',
            'Maquinaria Utilizada', 
            'Producto Minero',
            'Documentos',
            'Infraestructura'
          ]}
        />

        <View style={styles.buttonContainer}>
          <PremiumButton
            title="Limpiar"
            onPress={resetForm}
            variant="secondary"
            icon={<Ionicons name="refresh" size={16} color="#2E7D32" />}
            size="medium"
          />
          
          <PremiumButton
            title={isLoading ? 'Guardando...' : 'Guardar FRI'}
            onPress={onSubmit}
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
            icon={!isLoading ? <Ionicons name="save" size={16} color="white" /> : undefined}
            size="medium"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 8,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  pickerItemSelected: {
    backgroundColor: '#2E7D32',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#333',
  },
  pickerItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Nuevos estilos para inputs con iconos
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIconPadding: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0, // Remover border del input individual
  },
});