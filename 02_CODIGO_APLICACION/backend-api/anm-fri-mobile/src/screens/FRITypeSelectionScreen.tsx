// src/screens/FRITypeSelectionScreen.tsx - Pantalla de selección de tipo de FRI
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { 
  FRIType, 
  getFRITypeLabel, 
  getFRITypeDescription 
} from '../types/friTypes';
import DynamicFRIForm from '../components/DynamicFRIForm';

interface FRITypeOption {
  type: FRIType;
  title: string;
  description: string;
  icon: string;
  color: string;
  frequency: string;
  estimatedTime: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
}

const FRI_TYPE_OPTIONS: FRITypeOption[] = [
  {
    type: 'mensual',
    title: 'FRI Mensual',
    description: 'Reporte mensual de producción y actividades mineras',
    icon: 'calendar-outline',
    color: '#007AFF',
    frequency: 'Cada mes',
    estimatedTime: '15-20 min',
    difficulty: 'Básico'
  },
  {
    type: 'trimestral',
    title: 'FRI Trimestral',
    description: 'Informe trimestral con análisis y proyecciones',
    icon: 'bar-chart-outline',
    color: '#FF9500',
    frequency: 'Cada 3 meses',
    estimatedTime: '25-35 min',
    difficulty: 'Intermedio'
  },
  {
    type: 'anual',
    title: 'FRI Anual',
    description: 'Reporte anual completo con impacto social y ambiental',
    icon: 'document-text-outline',
    color: '#34C759',
    frequency: 'Cada año',
    estimatedTime: '45-60 min',
    difficulty: 'Avanzado'
  }
];

interface FRITypeSelectionScreenProps {
  navigation: any;
}

export default function FRITypeSelectionScreen({ navigation }: FRITypeSelectionScreenProps) {
  const [selectedType, setSelectedType] = useState<FRIType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoType, setInfoType] = useState<FRIType | null>(null);

  const handleTypeSelect = (type: FRIType) => {
    setSelectedType(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Mostrar confirmación antes de abrir el formulario
    Alert.alert(
      getFRITypeLabel(type),
      `¿Deseas crear un nuevo ${getFRITypeLabel(type)}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Crear',
          onPress: () => {
            setShowForm(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  const handleShowInfo = (type: FRIType) => {
    setInfoType(type);
    setShowInfoModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFormSave = (formData: any) => {
    console.log('📄 FRI guardado:', formData);
    
    Alert.alert(
      'FRI Enviado',
      `Tu ${getFRITypeLabel(selectedType!)} ha sido enviado exitosamente.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowForm(false);
            setSelectedType(null);
            // Aquí podrías navegar a una pantalla de confirmación o lista de FRIs
          }
        }
      ]
    );
  };

  const handleFormCancel = () => {
    Alert.alert(
      'Cancelar Formulario',
      '¿Estás seguro de que quieres cancelar? Se perderán los datos no guardados.',
      [
        {
          text: 'Continuar Editando',
          style: 'cancel'
        },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: () => {
            setShowForm(false);
            setSelectedType(null);
          }
        }
      ]
    );
  };

  const renderFRITypeCard = (option: FRITypeOption) => (
    <TouchableOpacity
      key={option.type}
      style={[styles.typeCard, { borderColor: option.color }]}
      onPress={() => handleTypeSelect(option.type)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${option.color}15` }]}>
          <Ionicons name={option.icon as any} size={32} color={option.color} />
        </View>
        
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => handleShowInfo(option.type)}
        >
          <Ionicons name="information-circle-outline" size={20} color="#6D6D80" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{option.title}</Text>
        <Text style={styles.cardDescription}>{option.description}</Text>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#6D6D80" />
            <Text style={styles.detailText}>{option.frequency}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="clock-outline" size={16} color="#6D6D80" />
            <Text style={styles.detailText}>{option.estimatedTime}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(option.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>{option.difficulty}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.cardFooter, { backgroundColor: `${option.color}10` }]}>
        <Text style={[styles.createButtonText, { color: option.color }]}>
          Crear {option.title}
        </Text>
        <Ionicons name="arrow-forward" size={20} color={option.color} />
      </View>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico': return '#34C759';
      case 'Intermedio': return '#FF9500';
      case 'Avanzado': return '#FF3B30';
      default: return '#6D6D80';
    }
  };

  const renderInfoModal = () => {
    if (!infoType) return null;
    
    const option = FRI_TYPE_OPTIONS.find(opt => opt.type === infoType);
    if (!option) return null;

    return (
      <Modal
        visible={showInfoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Información del {option.title}</Text>
            <TouchableOpacity onPress={() => setShowInfoModal(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { backgroundColor: `${option.color}15` }]}>
              <Ionicons name={option.icon as any} size={48} color={option.color} />
            </View>

            <Text style={styles.modalDescription}>{option.description}</Text>

            <View style={styles.modalDetailsContainer}>
              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Frecuencia:</Text>
                <Text style={styles.modalDetailValue}>{option.frequency}</Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Tiempo estimado:</Text>
                <Text style={styles.modalDetailValue}>{option.estimatedTime}</Text>
              </View>

              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Dificultad:</Text>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(option.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>{option.difficulty}</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalSectionsContainer}>
              <Text style={styles.modalSectionsTitle}>Secciones incluidas:</Text>
              {getFormSections(infoType).map((section, index) => (
                <View key={section} style={styles.modalSectionItem}>
                  <Ionicons name="checkmark-circle" size={20} color={option.color} />
                  <Text style={styles.modalSectionText}>{section}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalCreateButton, { backgroundColor: option.color }]}
              onPress={() => {
                setShowInfoModal(false);
                handleTypeSelect(infoType);
              }}
            >
              <Text style={styles.modalCreateButtonText}>Crear {option.title}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const getFormSections = (type: FRIType): string[] => {
    switch (type) {
      case 'mensual':
        return [
          'Información General',
          'Datos de Producción',
          'Comercialización',
          'Aspectos Ambientales',
          'Evidencias Fotográficas'
        ];
      case 'trimestral':
        return [
          'Resumen Trimestral',
          'Análisis de Producción',
          'Gestión Ambiental',
          'Gestión Social',
          'Evidencias y Documentos'
        ];
      case 'anual':
        return [
          'Resumen Ejecutivo',
          'Estadísticas Operacionales',
          'Impacto Ambiental',
          'Responsabilidad Social',
          'Proyecciones',
          'Anexos y Evidencias'
        ];
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo FRI</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Selecciona el tipo de reporte</Text>
          <Text style={styles.introSubtitle}>
            Elige el formato de FRI que necesitas completar según tu cronograma de reportes.
          </Text>
        </View>

        <View style={styles.typesContainer}>
          {FRI_TYPE_OPTIONS.map(renderFRITypeCard)}
        </View>

        <View style={styles.helpSection}>
          <View style={styles.helpCard}>
            <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
              <Text style={styles.helpText}>
                Revisa la información de cada tipo de reporte para entender qué datos necesitas preparar.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Formulario Modal */}
      {showForm && selectedType && (
        <Modal
          visible={showForm}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <DynamicFRIForm
            friType={selectedType}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </Modal>
      )}

      {/* Info Modal */}
      {renderInfoModal()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  introSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#6D6D80',
    lineHeight: 22,
  },
  typesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  typeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButton: {
    padding: 4,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6D6D80',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6D6D80',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  helpCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#6D6D80',
    lineHeight: 20,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6D6D80',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  modalDetailsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  modalDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalDetailLabel: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  modalDetailValue: {
    fontSize: 16,
    color: '#6D6D80',
  },
  modalSectionsContainer: {
    marginBottom: 32,
  },
  modalSectionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  modalSectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  modalSectionText: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  modalCreateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCreateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});