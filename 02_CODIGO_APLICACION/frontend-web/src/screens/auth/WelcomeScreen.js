// src/screens/auth/WelcomeScreen.js - Pantalla de bienvenida
// ==========================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#2563eb', '#1d4ed8', '#1e40af']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Header con logo */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.logoBackground}
          >
            <Icon name="bar-chart" size={48} color="#ffffff" />
          </LinearGradient>
        </View>
        
        <Text style={styles.title}>Sistema ANM FRI</Text>
        <Text style={styles.subtitle}>
          Agencia Nacional de Minería
        </Text>
      </Animated.View>

      {/* Características principales */}
      <Animated.View 
        style={[
          styles.featuresContainer,
          { opacity: fadeAnim }
        ]}
      >
        {[
          {
            icon: 'document-text',
            title: 'Formularios FRI',
            description: 'Gestiona todos los formatos de reportes de información'
          },
          {
            icon: 'sync',
            title: 'Sincronización',
            description: 'Trabaja offline y sincroniza cuando tengas conexión'
          },
          {
            icon: 'shield-checkmark',
            title: 'Seguridad',
            description: 'Autenticación biométrica y encriptación de datos'
          },
          {
            icon: 'analytics',
            title: 'Reportes',
            description: 'Genera reportes y estadísticas en tiempo real'
          }
        ].map((feature, index) => (
          <Animated.View
            key={index}
            style={[
              styles.featureItem,
              {
                opacity: fadeAnim,
                transform: [{
                  translateX: Animated.multiply(slideAnim, index % 2 === 0 ? -1 : 1)
                }]
              }
            ]}
          >
            <View style={styles.featureIcon}>
              <Icon name={feature.icon} size={24} color="#2563eb" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Botones de acción */}
      <Animated.View 
        style={[
          styles.bottomContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleGetStarted}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.buttonGradient}
          >
            <Text style={styles.primaryButtonText}>Comenzar</Text>
            <Icon name="arrow-forward" size={20} color="#2563eb" />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Versión 1.0.0 • ANM Colombia</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    marginBottom: 24,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginRight: 8,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default WelcomeScreen;