// src/components/FormularioFRI.tsx - Formulario principal integrado
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Importar nuestros componentes creados
import PremiumButton from './PremiumButton';
import EvidenceCapture from './EvidenceCapture';
import LocationInfo from './LocationInfo';

// Interfaces y tipos
interface FormularioFRIData {
  // Información básica
  tituloMinero: string;
  numeroRadicacion: string;
  tipoFRI: 'mensual' | 'trimestral' | 'anual';
  municipio: string;
  departamento: string;
  
  // Datos de producción
  mineralPrincipal: string;
  cantidadExtraida: string;
  unidadMedida: string;
  valorProduccion: string;
  
  // Ubicación y evidencia
  coordenadas?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  evidencias: any[];
  
  // Metadatos
  fechaCreacion: string;
  estado: 'borrador' | 'completado' | 'enviado';
  observaciones: string;
}

interface FormularioFRIProps {
  onGuardar: (data: FormularioFRIData) => void;
  onEnviar: (data: FormularioFRIData) => void;
  datosIniciales?: Partial<FormularioFRIData>;
  modoLectura?: boolean;
}

const TIPOS_MINERAL = [
  'Oro', 'Plata', 'Platino', 'Carbón', 'Esmeraldas', 
  'Arcilla', 'Arena', 'Grava', 'Caliza', 'Otro'
];

const UNIDADES_MEDIDA = [
  'Gramos', 'Kilogramos', 'Toneladas', 
  'Metros cúbicos', 'Quilates', 'Onzas'
];

export default function FormularioFRI({
  onGuardar,
  onEnviar,
  datosIniciales = {},
  modoLectura = false
}: FormularioFRIProps) {
  // Estados del formulario
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
    ...datosIniciales
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardadoAutomatico, setGuardadoAutomatico] = useState(true);
  const [cargando, setCargando] = useState(false);

  // Auto-guardado cada 30 segundos
  useEffect(() => {
    if (!guardadoAutomatico || modoLectura) return;

    const intervalo = setInterval(() => {
      guardarBorrador();
    }, 30000);

    return () => clearInterval(intervalo);
  }, [formData, guardadoAutomatico]);

  // Validaciones del formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.tituloMinero.trim()) {
      nuevosErrores.tituloMinero = 'El título minero es obligatorio';
    }

    if (!formData.numeroRadicacion.trim()) {
      nuevosErrores.numeroRadicacion = 'El número de radicación es obligatorio';
    }

    if (!formData.municipio.trim()) {
      nuevosErrores.municipio = 'El municipio es obligatorio';
    }

    if (!formData.departamento.trim()) {
      nuevosErrores.departamento = 'El departamento es obligatorio';
    }

    if (!formData.mineralPrincipal) {
      nuevosErrores.mineralPrincipal = 'Debe seleccionar un mineral';
    }

    if (!formData.cantidadExtraida.trim()) {
      nuevosErrores.cantidadExtraida = 'La cantidad extraída es obligatoria';
    } else if (isNaN(Number(formData.cantidadExtraida))) {
      nuevosErrores.cantidadExtraida = 'Debe ser un número válido';
    }

    if (!formData.valorProduccion.trim()) {
      nuevosErrores.valorProduccion = 'El valor de producción es obligatorio';
    } else if (isNaN(Number(formData.valorProduccion))) {
      nuevosErrores.valorProduccion = 'Debe ser un número válido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Actualizar campo del formulario
  const actualizarCampo = (campo: keyof FormularioFRIData, valor: any) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo si existe
    if (errores[campo]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  };

  // Manejar actualización de ubicación
  const handleLocationUpdate = (locationData: any) => {
    actualizarCampo('coordenadas', {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      address: locationData.address
    });
    
    console.log('📍 Ubicación actualizada en formulario:', locationData);
  };

  // Manejar evidencias capturadas
  const handleEvidenceAdd = (evidencias: any[]) => {
    actualizarCampo('evidencias', evidencias);
    console.log('📸 Evidencias actualizadas:', evidencias.length);
  };

  // Guardar como borrador
  const guardarBorrador = async () => {
    try {
      const datosParaGuardar = {
        ...formData,
        estado: 'borrador' as const,
        fechaActualizacion: new Date().toISOString()
      };
      
      await onGuardar(datosParaGuardar);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error en auto-guardado:', error);
    }
  };

  // Enviar formulario
  const enviarFormulario = async () => {
    if (!validarFormulario()) {
      Alert.alert(
        'Formulario Incompleto',
        'Por favor complete todos los campos obligatorios'
      );
      return;
    }

    if (!formData.coordenadas) {
      Alert.alert(
        'Ubicación Requerida',
        'Se necesita la ubicación GPS para enviar el formulario',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Enviar sin GPS', onPress: confirmarEnvio }
        ]
      );
      return;
    }

    confirmarEnvio();
  };

  const confirmarEnvio = async () => {
    Alert.alert(
      'Confirmar Envío',
      '¿Está seguro de que desea enviar este formulario FRI? No podrá modificarlo después.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            setCargando(true);
            try {
              const datosParaEnviar = {
                ...formData,
                estado: 'enviado' as const,
                fechaEnvio: new Date().toISOString()
              };
              
              await onEnviar(datosParaEnviar);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              Alert.alert(
                '✅ Formulario Enviado',
                'El formulario FRI ha sido enviado exitosamente'
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo enviar el formulario');
            } finally {
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  // Renderizar campo de texto con validación
  const renderInput = (
    key: keyof FormularioFRIData,
    label: string,
    placeholder: string,
    options: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric' | 'email-address';
      required?: boolean;
    } = {}
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {options.required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          options.multiline && styles.inputMultiline,
          errores[key] && styles.inputError,
          modoLectura && styles.inputReadonly
        ]}
        value={String(formData[key] || '')}
        onChangeText={(valor) => actualizarCampo(key, valor)}
        placeholder={placeholder}
        multiline={options.multiline}
        keyboardType={options.keyboardType || 'default'}
        editable={!modoLectura}
      />
      {errores[key] && (
        <Text style={styles.errorText}>{errores[key]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header del formulario */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Formulario FRI</Text>
            <Text style={styles.subtitle}>
              {formData.tipoFRI.charAt(0).toUpperCase() + formData.tipoFRI.slice(1)}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              formData.estado === 'enviado' && styles.statusEnviado,
              formData.estado === 'completado' && styles.statusCompletado
            ]}>
              <Text style={styles.statusText}>
                {formData.estado.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Auto-guardado toggle */}
        {!modoLectura && (
          <View style={styles.autoSaveContainer}>
            <Text style={styles.autoSaveText}>Guardado automático</Text>
            <Switch
              value={guardadoAutomatico}
              onValueChange={setGuardadoAutomatico}
              trackColor={{ false: '#ccc', true: '#2E7D32' }}
            />
          </View>
        )}

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Información Básica</Text>
          
          {renderInput('tituloMinero', 'Título Minero', 'Ej: Mina El Dorado', { required: true })}
          {renderInput('numeroRadicacion', 'Número de Radicación', 'Ej: 12345-2024', { required: true })}
          {renderInput('municipio', 'Municipio', 'Municipio de operación', { required: true })}
          {renderInput('departamento', 'Departamento', 'Departamento', { required: true })}
        </View>

        {/* Datos de producción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⛏️ Datos de Producción</Text>
          
          {/* Selector de mineral */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Mineral Principal <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {TIPOS_MINERAL.map((mineral) => (
                  <PremiumButton
                    key={mineral}
                    title={mineral}
                    onPress={() => actualizarCampo('mineralPrincipal', mineral)}
                    variant={formData.mineralPrincipal === mineral ? 'primary' : 'secondary'}
                    size="small"
                    disabled={modoLectura}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {renderInput('cantidadExtraida', 'Cantidad Extraída', '0.00', { 
            required: true, 
            keyboardType: 'numeric' 
          })}

          {/* Selector de unidad */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Unidad de Medida</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {UNIDADES_MEDIDA.map((unidad) => (
                  <PremiumButton
                    key={unidad}
                    title={unidad}
                    onPress={() => actualizarCampo('unidadMedida', unidad)}
                    variant={formData.unidadMedida === unidad ? 'primary' : 'secondary'}
                    size="small"
                    disabled={modoLectura}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {renderInput('valorProduccion', 'Valor de Producción (COP)', '0.00', { 
            required: true, 
            keyboardType: 'numeric' 
          })}
        </View>

        {/* Información GPS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Ubicación GPS</Text>
          <LocationInfo
            onLocationUpdate={handleLocationUpdate}
            autoUpdate={!modoLectura}
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

        {/* Observaciones */}
        <View style={styles.section}>
          {renderInput('observaciones', 'Observaciones', 'Comentarios adicionales...', { 
            multiline: true 
          })}
        </View>

        {/* Botones de acción */}
        {!modoLectura && (
          <View style={styles.actionsContainer}>
            <PremiumButton
              title="💾 Guardar Borrador"
              onPress={guardarBorrador}
              variant="secondary"
              size="large"
              loading={cargando}
              icon={<Ionicons name="save-outline" size={18} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="📤 Enviar Formulario"
              onPress={enviarFormulario}
              variant="primary"
              size="large"
              loading={cargando}
              icon={<Ionicons name="send" size={18} color="white" />}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📋 Formulario FRI - {formData.evidencias.length} evidencias • {formData.coordenadas ? '📍 GPS Activo' : '📍 Sin GPS'}
          </Text>
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
  scrollView: {
    flex: 1,
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
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusEnviado: {
    backgroundColor: '#27ae60',
  },
  statusCompletado: {
    backgroundColor: '#3498db',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  autoSaveContainer: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  autoSaveText: {
    fontSize: 16,
    color: '#333',
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputReadonly: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
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