// ==========================================
// 02_CODIGO_APLICACION/anm-fri-mobile/src/screens/verification/UserVerificationScreen.js
// Pantalla de verificación de usuarios para React Native
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserVerificationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    telefono: '',
    tituloMinero: '',
    codigoVerificacion: ''
  });
  
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error cargando datos de usuario:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCode = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/verification/generate-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCodeGenerated(true);
        Alert.alert(
          'Código Enviado',
          `Código de verificación: ${data.data.codigo || '123456'}\n(Solo visible en desarrollo)`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', data.message || 'Error generando código');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/verification/verify-identity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data.verificacion);
        
        if (data.data.verificacion.puntuacionConfianza >= 70) {
          Alert.alert(
            '✅ Verificación Exitosa',
            `Tu identidad ha sido verificada con una puntuación de ${data.data.verificacion.puntuacionConfianza}%`,
            [{ text: 'Excelente!' }]
          );
        } else {
          Alert.alert(
            '⚠️ Verificación Incompleta',
            `Puntuación: ${data.data.verificacion.puntuacionConfianza}%. Por favor, verifica tu información.`,
            [{ text: 'Entendido' }]
          );
        }
      } else {
        Alert.alert('Error', data.message || 'Error en verificación');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Verificación de Usuario</Text>
          <Text style={styles.headerSubtitle}>
            Sistema de verificación de identidad ANM FRI
          </Text>
          
          {user && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: user.verificado ? '#D1FAE5' : '#FEF3C7' }
            ]}>
              <Ionicons 
                name={user.verificado ? "checkmark-circle" : "warning"} 
                size={16} 
                color={user.verificado ? '#065F46' : '#92400E'} 
              />
              <Text style={[
                styles.statusText,
                { color: user.verificado ? '#065F46' : '#92400E' }
              ]}>
                {user.verificado ? 'Verificado' : 'No Verificado'}
              </Text>
            </View>
          )}
        </View>

        {/* Información del Usuario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Información del Usuario</Text>
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.userDetail}>
                <Text style={styles.label}>Nombre:</Text> {user.nombre}
              </Text>
              <Text style={styles.userDetail}>
                <Text style={styles.label}>Email:</Text> {user.email}
              </Text>
              <Text style={styles.userDetail}>
                <Text style={styles.label}>Rol:</Text> {user.rol}
              </Text>
            </View>
          )}
        </View>

        {/* Formulario de Verificación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Datos de Verificación</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📱 Número de Teléfono</Text>
            <TextInput
              style={styles.input}
              value={formData.telefono}
              onChangeText={(value) => handleInputChange('telefono', value)}
              placeholder="+57 300 123 4567"
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📄 Título Minero</Text>
            <TextInput
              style={styles.input}
              value={formData.tituloMinero}
              onChangeText={(value) => handleInputChange('tituloMinero', value)}
              placeholder="TM-12345-2024"
              autoCapitalize="characters"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={generateCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons 
                  name={codeGenerated ? "refresh" : "mail"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.buttonText}>
                  {codeGenerated ? 'Reenviar Código' : 'Generar Código'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {codeGenerated && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🔑 Código de Verificación</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={formData.codigoVerificacion}
                onChangeText={(value) => handleInputChange('codigoVerificacion', value)}
                placeholder="123456"
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.helpText}>
                Código enviado por SMS/Email. Válido por 10 minutos.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button, 
              styles.successButton,
              (!codeGenerated || !formData.codigoVerificacion || loading) && styles.disabledButton
            ]}
            onPress={submitVerification}
            disabled={!codeGenerated || !formData.codigoVerificacion || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Verificar Identidad</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Resultado de Verificación</Text>
            
            <View style={[
              styles.resultContainer,
              { backgroundColor: result.puntuacionConfianza >= 70 ? '#D1FAE5' : '#FEF3C7' }
            ]}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={result.puntuacionConfianza >= 70 ? "checkmark-circle" : "warning"} 
                  size={24} 
                  color={result.puntuacionConfianza >= 70 ? '#065F46' : '#92400E'} 
                />
                <Text style={[
                  styles.resultTitle,
                  { color: result.puntuacionConfianza >= 70 ? '#065F46' : '#92400E' }
                ]}>
                  {result.puntuacionConfianza >= 70 ? 'Verificación Exitosa' : 'Verificación Incompleta'}
                </Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Puntuación de Confianza:</Text>
                <Text style={[
                  styles.scoreValue,
                  { color: getScoreColor(result.puntuacionConfianza) }
                ]}>
                  {result.puntuacionConfianza}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  { 
                    width: `${result.puntuacionConfianza}%`,
                    backgroundColor: getScoreColor(result.puntuacionConfianza)
                  }
                ]} />
              </View>

              <Text style={styles.levelBadge}>
                Nivel: {result.nivelVerificacion}
              </Text>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Detalles de Verificación:</Text>
                {result.verificaciones && result.verificaciones.map((v, index) => (
                  <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailLabel}>
                      {v.campo.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </Text>
                    <Ionicons 
                      name={v.verificado ? "checkmark-circle" : "close-circle"} 
                      size={20} 
                      color={v.verificado ? "#10B981" : "#EF4444"} 
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 24,
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
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
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  userInfo: {
    gap: 12,
  },
  userDetail: {
    fontSize: 14,
    color: '#374151',
  },
  label: {
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelBadge: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
});

export default UserVerificationScreen;