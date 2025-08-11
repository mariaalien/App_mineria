 // app/fri/form.tsx - Pantalla de Formulario FRI
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Importar nuestros componentes
import PremiumButton from '../../src/components/PremiumButton';
import EvidenceCapture from '../../src/components/EvidenceCapture';
import LocationInfo from '../../src/components/LocationInfo';

interface FormularioFRIData {
  tituloMinero: string;
  numeroRadicacion: string;
  tipoFRI: 'mensual' | 'trimestral' | 'anual';
  municipio: string;
  departamento: string;
  mineralPrincipal: string;
  cantidadExtraida: string;
  unidadMedida: string;
  valorProduccion: string;
  coordenadas?: any;
  evidencias: any[];
  fechaCreacion: string;
  estado: 'borrador' | 'completado' | 'enviado';
  observaciones: string;
}

export default function FRIFormScreen() {
  const [formData, setFormData] = useState<FormularioFRIData>({
    tituloMinero: '',
    numeroRadicacion: '',
    tipoFRI: 'mensual',
    municipio: '',
    departamento: '',
    mineralPrincipal: '',
    cantidadExtraida: '',
    unidadMedida: 'Kilogramos',
    valorProduccion: '',
    evidencias: [],
    fechaCreacion: new Date().toISOString(),
    estado: 'borrador',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);

  // Función para manejar guardado
  const handleGuardar = async (data: FormularioFRIData) => {
    try {
      console.log('💾 Guardando formulario FRI:', data);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Aquí iría la lógica para guardar en backend/storage local
      // await saveToAPI(data);
      
      Alert.alert('✅ Guardado', 'Formulario guardado como borrador');
    } catch (error) {
      console.error('Error guardando:', error);
      Alert.alert('❌ Error', 'No se pudo guardar el formulario');
    }
  };

  // Función para manejar envío
  const handleEnviar = async (data: FormularioFRIData) => {
    try {
      setLoading(true);
      console.log('📤 Enviando formulario FRI:', data);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '🎉 Formulario Enviado',
        'El formulario FRI ha sido enviado exitosamente',
        [
          {
            text: 'Ver Lista',
            onPress: () => router.push('/fri/')
          },
          {
            text: 'Nuevo FRI',
            onPress: () => {
              // Resetear formulario
              setFormData({
                tituloMinero: '',
                numeroRadicacion: '',
                tipoFRI: 'mensual',
                municipio: '',
                departamento: '',
                mineralPrincipal: '',
                cantidadExtraida: '',
                unidadMedida: 'Kilogramos',
                valorProduccion: '',
                evidencias: [],
                fechaCreacion: new Date().toISOString(),
                estado: 'borrador',
                observaciones: '',
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo enviar el formulario');
    } finally {
      setLoading(false);
    }
  };

  // Manejar actualización de ubicación
  const handleLocationUpdate = (locationData: any) => {
    setFormData(prev => ({
      ...prev,
      coordenadas: locationData
    }));
    console.log('📍 Ubicación actualizada:', locationData);
  };

  // Manejar evidencias
  const handleEvidenceAdd = (evidencias: any[]) => {
    setFormData(prev => ({
      ...prev,
      evidencias: evidencias
    }));
    console.log('📸 Evidencias actualizadas:', evidencias.length);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Nuevo Formulario FRI</Text>
          <Text style={styles.subtitle}>Reporte de Información Minera</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, styles.statusBorrador]}>
            <Text style={styles.statusText}>BORRADOR</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información GPS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Ubicación GPS</Text>
          <LocationInfo
            onLocationUpdate={handleLocationUpdate}
            autoUpdate={true}
          />
        </View>

        {/* Evidencia fotográfica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Evidencia Fotográfica</Text>
          <EvidenceCapture
            onEvidenceAdd={handleEvidenceAdd}
            maxPhotos={5}
            evidenceTypes={[
              'Sitio de Extracción',
              'Maquinaria Utilizada',
              'Producto Extraído',
              'Documentos Soporte',
              'Otros'
            ]}
          />
        </View>

        {/* Información del formulario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Información del Formulario</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={16} color="#666" />
              <Text style={styles.infoText}>
                Tipo: {formData.tipoFRI.charAt(0).toUpperCase() + formData.tipoFRI.slice(1)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.infoText}>
                Creado: {new Date(formData.fechaCreacion).toLocaleDateString('es-CO')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.infoText}>
                GPS: {formData.coordenadas ? '✅ Capturado' : '❌ Pendiente'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="camera" size={16} color="#666" />
              <Text style={styles.infoText}>
                Evidencias: {formData.evidencias.length}/5
              </Text>
            </View>
          </View>
        </View>

        {/* Nota importante */}
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={20} color="#2E7D32" />
          <Text style={styles.noteText}>
            📍 <Text style={styles.noteHighlight}>GPS requerido:</Text> La ubicación es obligatoria para validar el sitio de extracción.
          </Text>
        </View>

        <View style={styles.noteContainer}>
          <Ionicons name="camera" size={20} color="#2E7D32" />
          <Text style={styles.noteText}>
            📸 <Text style={styles.noteHighlight}>Evidencia mínima:</Text> Se requieren al menos 2 fotos para validar el reporte.
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <PremiumButton
            title="💾 Guardar Borrador"
            onPress={() => handleGuardar(formData)}
            variant="secondary"
            size="large"
            loading={loading}
            icon={<Ionicons name="save-outline" size={18} color="#2E7D32" />}
          />
          
          <PremiumButton
            title="📤 Enviar Formulario"
            onPress={() => handleEnviar(formData)}
            variant="primary"
            size="large"
            loading={loading}
            disabled={!formData.coordenadas || formData.evidencias.length < 2}
            icon={<Ionicons name="send" size={18} color="white" />}
          />
          
          <PremiumButton
            title="📝 Formulario Completo"
            onPress={() => {
              Alert.alert(
                'Próximamente',
                'El formulario completo estará disponible en la siguiente actualización'
              );
            }}
            variant="secondary"
            size="medium"
            icon={<Ionicons name="document-text" size={16} color="#2E7D32" />}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📋 FRI Demo • {formData.evidencias.length} evidencias • {formData.coordenadas ? '📍 GPS Activo' : '📍 GPS Inactivo'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBorrador: {
    backgroundColor: '#f39c12',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  noteContainer: {
    backgroundColor: '#e8f5e8',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  noteHighlight: {
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
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
