// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/screens/auth/LoginScreen.js
// Pantalla de Login Móvil con Verificación de Usuarios
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
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    codigoVerificacion: ''
  });
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('login'); // 'login' | 'verification'
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  // =============================================================================
  // 🔐 FUNCIONES DE AUTENTICACIÓN
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Login exitoso, verificar si requiere verificación adicional
        setUserInfo(result.user);
        setStep('verification');
        
        Alert.alert(
          '✅ Login Exitoso',
          `Bienvenido ${result.user.nombre}! Para mayor seguridad, verifica tu identidad.`,
          [{ text: 'Continuar' }]
        );
      } else {
        Alert.alert('❌ Error de Login', result.message);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // 📱 FUNCIONES DE VERIFICACIÓN
  // =============================================================================

  const generateVerificationCode = async () => {
    setLoading(true);
    try {
      const response = await authService.generateVerificationCode();
      
      if (response.success) {
        setCodeGenerated(true);
        Alert.alert(
          '📨 Código Enviado',
          'Se ha enviado un código de verificación a tu teléfono/email registrado.',
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
        codigoVerificacion: formData.codigoVerificacion,
        ...formData
      });

      if (response.success) {
        Alert.alert(
          '✅ Verificación Completada',
          'Tu identidad ha sido verificada exitosamente. ¡Bienvenido al sistema!',
          [{ text: 'Continuar', onPress: () => navigation.replace('MainTabs') }]
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
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="business" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.logoText}>ANM FRI</Text>
        <Text style={styles.logoSubtext}>Sistema de Reportes Mineros</Text>
      </View>
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.welcomeText}>¡Bienvenido de vuelta!</Text>
      <Text style={styles.subtitleText}>Ingresa tus credenciales para continuar</Text>

      {/* Campo Email */}
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="mail" size={20} color="#6B7280" />
        </View>
        <TextInput
          style={[styles.textInput, errors.email && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Campo Contraseña */}
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="lock-closed" size={20} color="#6B7280" />
        </View>
        <TextInput
          style={[styles.textInput, errors.password && styles.inputError]}
          placeholder="Contraseña"
          placeholderTextColor="#9CA3AF"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={20} 
            color="#6B7280" 
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Botón de Login */}
      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderVerificationForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.verificationHeader}>
        <Ionicons name="shield-checkmark" size={60} color="#10B981" />
        <Text style={styles.verificationTitle}>Verificación de Seguridad</Text>
        <Text style={styles.verificationSubtitle}>
          Para proteger tu cuenta, verifica tu identidad
        </Text>
      </View>

      {userInfo && (
        <View style={styles.userInfoCard}>
          <Text style={styles.userInfoTitle}>Usuario autenticado:</Text>
          <Text style={styles.userInfoName}>{userInfo.nombre}</Text>
          <Text style={styles.userInfoEmail}>{userInfo.email}</Text>
          <Text style={styles.userInfoRole}>Rol: {userInfo.rol}</Text>
        </View>
      )}

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
          <Text style={styles.codeLabel}>🔑 Código de Verificación</Text>
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
            Código enviado por SMS/Email. Válido por 10 minutos.
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
              <Text style={styles.verifyButtonText}>Verificar</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Botón Volver */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('login')}
      >
        <Ionicons name="arrow-back" size={20} color="#6B7280" />
        <Text style={styles.backButtonText}>Volver al Login</Text>
      </TouchableOpacity>
    </View>
  );

  // =============================================================================
  // 🎨 RENDERIZADO PRINCIPAL
  // =============================================================================

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        
        <View style={styles.contentContainer}>
          {step === 'login' ? renderLoginForm() : renderVerificationForm()}
        </View>
      </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#2563EB',
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: '#111827',
  },
  passwordToggle: {
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  
  // Estilos de Verificación
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  userInfoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  userInfoTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userInfoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userInfoEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userInfoRole: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
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
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 24,
    fontFamily: 'monospace',
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default LoginScreen;