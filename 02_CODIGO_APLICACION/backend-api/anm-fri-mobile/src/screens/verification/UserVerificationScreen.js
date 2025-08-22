// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/screens/verification/UserVerificationScreen.js
// Pantalla de Verificación de Usuario para App Móvil
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const { width, height } = Dimensions.get('window');

const UserVerificationScreen = ({ navigation, route }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    numeroDocumento: '',
    telefono: '',
    ubicacion: '',
    codigoVerificacion: ''
  });
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [step, setStep] = useState(1); // 1: datos básicos, 2: código verificación
  const [errors, setErrors] = useState({});
  const [userInfo, setUserInfo] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setUserInfo(user);
      // Pre-llenar algunos campos si están disponibles
      setFormData(prev => ({
        ...prev,
        // Si el usuario tiene datos, pre-llenarlos
      }));
    }
  }, [user]);

  // =============================================================================
  // 🔐 FUNCIONES DE VERIFICACIÓN
  // =============================================================================

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'El número de documento es requerido';
    } else if (formData.numeroDocumento.length < 6) {
      newErrors.numeroDocumento = 'Debe tener al menos 6 caracteres';
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (formData.telefono.length < 10) {
      newErrors.telefono = 'Debe tener al menos 10 dígitos';
    }
    
    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitStep1 = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      // Aquí puedes hacer validaciones adicionales con el backend
      setStep(2);
      Alert.alert(
        '✅ Datos Verificados',
        'Procederemos a generar un código de verificación.',
        [{ text: 'Continuar' }]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Error validando los datos');
    } finally {
      setLoading(false);
    }
  };

  const generateVerificationCode = async () => {
    setLoading(true);
    try {
      const response = await authService.generateVerificationCode();
      
      if (response.success) {
        setCodeGenerated(true);
        Alert.alert(
          '📨 Código Enviado',
          `Se ha enviado un código de verificación a tu ${formData.telefono ? 'teléfono' : 'email'} registrado.`,
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert('❌ Error', response.message);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo generar el código de verificación');
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
    if (!formData.codigoVerificacion || formData.codigoVerificacion.length !== 6) {
      Alert.alert('❌ Error', 'Ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyIdentity({
        ...formData,
        codigoVerificacion: formData.codigoVerificacion
      });

      if (response.success) {
        Alert.alert(
          '✅ Verificación Completada',
          'Tu identidad ha sido verificada exitosamente. ¡Bienvenido al sistema!',
          [
            { 
              text: 'Continuar', 
              onPress: () => navigation.navigate('Dashboard')
            }
          ]
        );
      } else {
        Alert.alert('❌ Verificación Fallida', response.message);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Error en la verificación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // 🎨 COMPONENTES DE INTERFAZ
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
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
              <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>Verificación</Text>
            <Text style={styles.logoSubtext}>Sistema de Seguridad ANM</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
          <Text style={[styles.progressStepText, step >= 1 && styles.progressStepTextActive]}>1</Text>
        </View>
        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
          <Text style={[styles.progressStepText, step >= 2 && styles.progressStepTextActive]}>2</Text>
        </View>
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>Datos</Text>
        <Text style={styles.progressLabel}>Verificación</Text>
      </View>
    </View>
  );

  const renderUserInfo = () => (
    userInfo && (
      <View style={styles.userInfoCard}>
        <Ionicons name="person-circle" size={48} color="#2563EB" />
        <View style={styles.userInfoText}>
          <Text style={styles.userInfoName}>{userInfo.nombre}</Text>
          <Text style={styles.userInfoEmail}>{userInfo.email}</Text>
          <Text style={styles.userInfoRole}>Rol: {userInfo.rol}</Text>
        </View>
      </View>
    )
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verificación de Identidad</Text>
      <Text style={styles.stepSubtitle}>Ingresa tus datos para verificar tu identidad</Text>

      {renderUserInfo()}

      {/* Número de Documento */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>📄 Número de Documento</Text>
        <View style={[styles.inputWrapper, errors.numeroDocumento && styles.inputError]}>
          <Ionicons name="card" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Ej: 1234567890"
            placeholderTextColor="#9CA3AF"
            value={formData.numeroDocumento}
            onChangeText={(value) => handleInputChange('numeroDocumento', value)}
            keyboardType="numeric"
          />
        </View>
        {errors.numeroDocumento && (
          <Text style={styles.errorText}>{errors.numeroDocumento}</Text>
        )}
      </View>

      {/* Teléfono */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>📱 Teléfono</Text>
        <View style={[styles.inputWrapper, errors.telefono && styles.inputError]}>
          <Ionicons name="call" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Ej: 3001234567"
            placeholderTextColor="#9CA3AF"
            value={formData.telefono}
            onChangeText={(value) => handleInputChange('telefono', value)}
            keyboardType="phone-pad"
          />
        </View>
        {errors.telefono && (
          <Text style={styles.errorText}>{errors.telefono}</Text>
        )}
      </View>

      {/* Ubicación */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>📍 Ubicación</Text>
        <View style={[styles.inputWrapper, errors.ubicacion && styles.inputError]}>
          <Ionicons name="location" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Medellín, Antioquia"
            placeholderTextColor="#9CA3AF"
            value={formData.ubicacion}
            onChangeText={(value) => handleInputChange('ubicacion', value)}
          />
        </View>
        {errors.ubicacion && (
          <Text style={styles.errorText}>{errors.ubicacion}</Text>
        )}
      </View>

      {/* Botón Continuar */}
      <TouchableOpacity 
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={submitStep1}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Código de Verificación</Text>
      <Text style={styles.stepSubtitle}>Te enviaremos un código de seguridad</Text>

      {renderUserInfo()}

      {/* Información de contacto */}
      <View style={styles.contactInfoCard}>
        <Ionicons name="information-circle" size={24} color="#2563EB" />
        <View style={styles.contactInfoText}>
          <Text style={styles.contactInfoTitle}>Enviaremos el código a:</Text>
          <Text style={styles.contactInfoValue}>📱 {formData.telefono}</Text>
          <Text style={styles.contactInfoValue}>📧 {userInfo?.email}</Text>
        </View>
      </View>

      {/* Botón Generar Código */}
      <TouchableOpacity
        style={[styles.generateButton, codeGenerated && styles.resentButton]}
        onPress={generateVerificationCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons 
              name={codeGenerated ? "refresh" : "send"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.generateButtonText}>
              {codeGenerated ? 'Reenviar Código' : 'Generar Código'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Campo Código de Verificación */}
      {codeGenerated && (
        <View style={styles.codeContainer}>
          <Text style={styles.inputLabel}>🔑 Código de Verificación</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="123456"
            placeholderTextColor="#9CA3AF"
            value={formData.codigoVerificacion}
            onChangeText={(value) => handleInputChange('codigoVerificacion', value)}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
          />
          <Text style={styles.codeHint}>
            Código válido por 10 minutos. Revisa tu teléfono y email.
          </Text>
        </View>
      )}

      {/* Botón Verificar */}
      {codeGenerated && (
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!formData.codigoVerificacion || loading) && styles.buttonDisabled
          ]}
          onPress={submitVerification}
          disabled={!formData.codigoVerificacion || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.verifyButtonText}>Verificar Identidad</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Botón Volver */}
      <TouchableOpacity
        style={styles.backStepButton}
        onPress={() => setStep(1)}
      >
        <Ionicons name="arrow-back" size={20} color="#6B7280" />
        <Text style={styles.backStepButtonText}>Volver a Datos</Text>
      </TouchableOpacity>
    </View>
  );

  // =============================================================================
  // 🎨 RENDERIZADO PRINCIPAL
  // =============================================================================

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProgressIndicator()}
        
        {step === 1 ? renderStep1() : renderStep2()}
      </ScrollView>
    </View>
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
    backgroundColor: '#2563EB',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: -10,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#2563EB',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  progressStepTextActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#2563EB',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  userInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  userInfoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userInfoEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userInfoRole: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  contactInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  contactInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  contactInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  contactInfoValue: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  generateButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resentButton: {
    backgroundColor: '#10B981',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  codeContainer: {
    marginBottom: 24,
  },
  codeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backStepButtonText: {
    color: '#6B7280',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default UserVerificationScreen;