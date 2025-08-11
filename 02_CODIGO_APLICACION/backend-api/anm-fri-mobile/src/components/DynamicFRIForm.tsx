// src/components/DynamicFRIForm.tsx - Formulario dinámico para FRIs
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import { 
  FRIType, 
  FormSection, 
  FormField, 
  FRI_FORM_CONFIGS,
  getFRITypeLabel,
  createEmptyFRI 
} from '../types/friTypes';
import EvidenceCapture from './EvidenceCapture';
import LocationInfo from './LocationInfo';

interface DynamicFRIFormProps {
  friType: FRIType;
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

interface FormProgress {
  currentSection: number;
  totalSections: number;
  completedFields: number;
  totalFields: number;
  percentage: number;
}

export default function DynamicFRIForm({
  friType,
  initialData,
  onSave,
  onCancel
}: DynamicFRIFormProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<string>('');
  const [formProgress, setFormProgress] = useState<FormProgress>({
    currentSection: 1,
    totalSections: 0,
    completedFields: 0,
    totalFields: 0,
    percentage: 0
  });
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Obtener configuración del formulario
  const formSections = FRI_FORM_CONFIGS[friType];
  const currentSection = formSections[currentSectionIndex];

  // Crear esquema de validación dinámico
  const createValidationSchema = (section: FormSection) => {
    const schemaFields: any = {};
    
    section.fields.forEach(field => {
      let fieldSchema: any;
      
      switch (field.type) {
        case 'number':
          fieldSchema = yup.number();
          if (field.validation?.min !== undefined) {
            fieldSchema = fieldSchema.min(field.validation.min, field.validation.message);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = fieldSchema.max(field.validation.max, field.validation.message);
          }
          break;
        case 'text':
        case 'textarea':
          fieldSchema = yup.string();
          if (field.validation?.pattern) {
            fieldSchema = fieldSchema.matches(new RegExp(field.validation.pattern), field.validation.message);
          }
          break;
        default:
          fieldSchema = yup.mixed();
      }
      
      if (field.required) {
        fieldSchema = fieldSchema.required(`${field.label} es requerido`);
      }
      
      schemaFields[field.id] = fieldSchema;
    });
    
    return yup.object().shape(schemaFields);
  };

  // Configurar react-hook-form
  const { control, handleSubmit, watch, formState: { errors }, setValue, getValues } = useForm({
    resolver: yupResolver(createValidationSchema(currentSection)),
    defaultValues: initialData || {},
    mode: 'onChange'
  });

  // Calcular progreso del formulario
  useEffect(() => {
    const totalSections = formSections.length;
    const totalFields = formSections.reduce((total, section) => total + section.fields.length, 0);
    
    const currentValues = getValues();
    const completedFields = Object.keys(currentValues).filter(key => {
      const value = currentValues[key];
      return value !== undefined && value !== '' && value !== null;
    }).length;

    const percentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

    setFormProgress({
      currentSection: currentSectionIndex + 1,
      totalSections,
      completedFields,
      totalFields,
      percentage: Math.round(percentage)
    });
  }, [currentSectionIndex, watch()]);

  // Auto-guardado cada 30 segundos
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      autoSave();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, []);

  const autoSave = async () => {
    try {
      setIsAutoSaving(true);
      const currentData = getValues();
      // Aquí guardarías en AsyncStorage como borrador
      console.log('💾 Auto-guardado:', currentData);
      
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error en auto-guardado:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleNextSection = async () => {
    const isValid = await handleSubmit(() => {}, () => {})();
    
    if (Object.keys(errors).length === 0) {
      if (currentSectionIndex < formSections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        // Última sección - enviar formulario
        handleFormSubmit();
      }
    } else {
      Alert.alert(
        'Campos Requeridos',
        'Por favor completa todos los campos obligatorios antes de continuar.',
        [{ text: 'OK' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleFormSubmit = () => {
    const formData = getValues();
    
    Alert.alert(
      'Enviar FRI',
      '¿Estás seguro de que quieres enviar este formulario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            onSave({
              ...createEmptyFRI(friType),
              ...formData,
              estado: 'enviado',
              fechaEnvio: new Date().toISOString()
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  const renderField = (field: FormField) => {
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <Controller
              control={control}
              name={field.id}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.textInput, error && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder={field.placeholder}
                  placeholderTextColor="#999"
                />
              )}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        );

      case 'number':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <Controller
              control={control}
              name={field.id}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.textInput, error && styles.inputError]}
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
                  placeholder={field.placeholder}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              )}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        );

      case 'textarea':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <Controller
              control={control}
              name={field.id}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.textArea, error && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder={field.placeholder}
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        );

      case 'select':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <Controller
              control={control}
              name={field.id}
              render={({ field: { onChange, value } }) => (
                <View style={[styles.selectContainer, error && styles.inputError]}>
                  <RNPickerSelect
                    onValueChange={onChange}
                    value={value}
                    items={field.options?.map(option => ({
                      label: option,
                      value: option
                    })) || []}
                    placeholder={{ label: field.placeholder || `Seleccionar ${field.label}`, value: null }}
                    style={pickerSelectStyles}
                  />
                </View>
              )}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con progreso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{getFRITypeLabel(friType)}</Text>
          <Text style={styles.headerSubtitle}>
            Sección {formProgress.currentSection} de {formProgress.totalSections}
          </Text>
        </View>

        <View style={styles.autoSaveIndicator}>
          {isAutoSaving && (
            <View style={styles.autoSaveContainer}>
              <Ionicons name="sync" size={16} color="#007AFF" />
              <Text style={styles.autoSaveText}>Guardando...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${formProgress.percentage}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>
          {formProgress.percentage}% completado • {formProgress.completedFields}/{formProgress.totalFields} campos
        </Text>
      </View>

      {/* Contenido de la sección actual */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name={currentSection.icon as any} size={24} color="#007AFF" />
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>{currentSection.title}</Text>
            {currentSection.description && (
              <Text style={styles.sectionDescription}>{currentSection.description}</Text>
            )}
          </View>
        </View>

        {/* Campos del formulario */}
        <View style={styles.fieldsContainer}>
          {currentSection.fields.map(renderField)}
        </View>

        {/* Componentes especiales para ciertas secciones */}
        {currentSection.id === 'evidencias' && (
          <EvidenceCapture
            onEvidenceAdd={(evidences) => {
              setValue('evidencias', evidences);
            }}
            maxPhotos={10}
          />
        )}

        {currentSection.id === 'ubicacion' && (
          <LocationInfo
            onLocationUpdate={(location) => {
              setValue('ubicacion', location);
            }}
            autoUpdate={true}
          />
        )}
      </ScrollView>

      {/* Navegación */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          onPress={handlePreviousSection}
          style={[styles.navButton, styles.prevButton]}
          disabled={currentSectionIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentSectionIndex === 0 ? "#999" : "#007AFF"} 
          />
          <Text style={[
            styles.navButtonText, 
            currentSectionIndex === 0 && styles.navButtonTextDisabled
          ]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNextSection}
          style={[styles.navButton, styles.nextButton]}
        >
          <Text style={styles.navButtonTextPrimary}>
            {currentSectionIndex === formSections.length - 1 ? 'Enviar FRI' : 'Siguiente'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6D6D80',
    marginTop: 2,
  },
  autoSaveIndicator: {
    width: 80,
    alignItems: 'flex-end',
  },
  autoSaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  autoSaveText: {
    fontSize: 12,
    color: '#007AFF',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6D6D80',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6D6D80',
  },
  fieldsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#1D1D1F',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#1D1D1F',
    minHeight: 100,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  navigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  prevButton: {
    backgroundColor: '#F0F8FF',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#1D1D1F',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#1D1D1F',
  },
});