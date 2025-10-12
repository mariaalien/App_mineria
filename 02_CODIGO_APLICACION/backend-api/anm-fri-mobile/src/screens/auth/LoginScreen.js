import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import TuMinaLogo from '../../components/TuMinaLogo';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const { login } = useAuth();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Referencias para animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Animaciones de palas mineras
  const shovel1 = useRef(new Animated.Value(0)).current;
  const shovel2 = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Configurar barra de estado
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#2E7D32', true);
      StatusBar.setBarStyle('light-content', true);
    }

    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Animaciones de minerales en loop
    const mineralAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(shovel1, {
          toValue: 1,
          duration: 3500, // Más lento para efecto suave
          useNativeDriver: true,
        }),
        Animated.timing(shovel1, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    );

    const mineralAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(shovel2, {
          toValue: 1,
          duration: 4200, // Diferente velocidad
          useNativeDriver: true,
        }),
        Animated.timing(shovel2, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de rotación del logo
    const logoAnimation = Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    // Iniciar animaciones de minerales con delays diferentes
    setTimeout(() => mineralAnimation1.start(), 800);
    setTimeout(() => mineralAnimation2.start(), 1500);
    logoAnimation.start();

    return () => {
      mineralAnimation1.stop();
      mineralAnimation2.stop();
      logoAnimation.stop();
    };
  }, []);

  // Validar campos
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email no válido';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 3) {
      newErrors.password = 'La contraseña debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await login(email.trim(), password);
      // El AuthContext se encarga de la navegación
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert(
        'Error de Autenticación',
        error.message || 'Credenciales incorrectas. Verifica tu email y contraseña.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Credenciales de prueba
  const fillDemoCredentials = () => {
    setEmail('operador@minera.com');
    setPassword('123456');
    setErrors({});
  };

  const logoSpin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#2E7D32', '#4CAF50', '#66BB6A']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Formas de minerales y piedras flotantes */}
      <Animated.View
        style={[
          styles.floatingMineral,
          styles.mineral1,
          {
            opacity: shovel1,
            transform: [
              {
                translateY: shovel1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -25],
                }),
              },
              {
                rotate: shovel1.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '15deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Diamante dorado */}
        <View style={styles.diamond}>
          <View style={[styles.diamondTop, { backgroundColor: '#FFD700' }]} />
          <View style={[styles.diamondBottom, { backgroundColor: '#FFA500' }]} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingMineral,
          styles.mineral2,
          {
            opacity: shovel2,
            transform: [
              {
                translateY: shovel2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
              {
                rotate: shovel2.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-12deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Cristal plateado */}
        <View style={styles.crystal}>
          <View style={[styles.crystalFacet1, { backgroundColor: '#C0C0C0' }]} />
          <View style={[styles.crystalFacet2, { backgroundColor: '#E8E8E8' }]} />
          <View style={[styles.crystalFacet3, { backgroundColor: '#B8B8B8' }]} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingMineral,
          styles.mineral3,
          {
            opacity: shovel1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.8, 0],
            }),
            transform: [
              {
                translateX: shovel1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 18],
                }),
              },
              {
                rotate: shovel1.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '25deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Piedra irregular marrón */}
        <View style={styles.stone}>
          <View style={[styles.stoneShape1, { backgroundColor: '#8B4513' }]} />
          <View style={[styles.stoneShape2, { backgroundColor: '#A0522D' }]} />
          <View style={[styles.stoneShape3, { backgroundColor: '#CD853F' }]} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingMineral,
          styles.mineral4,
          {
            opacity: shovel2.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 0.6, 0.8, 0],
            }),
            transform: [
              {
                translateY: shovel2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
              {
                translateX: shovel2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          },
        ]}
      >
        {/* Esmeralda hexagonal */}
        <View style={styles.emerald}>
          <View style={[styles.emeraldFace1, { backgroundColor: '#50C878' }]} />
          <View style={[styles.emeraldFace2, { backgroundColor: '#2E8B57' }]} />
          <View style={[styles.emeraldFace3, { backgroundColor: '#3CB371' }]} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingMineral,
          styles.mineral5,
          {
            opacity: shovel1.interpolate({
              inputRange: [0, 0.4, 0.8, 1],
              outputRange: [0, 0.7, 0.5, 0],
            }),
            transform: [
              {
                translateY: shovel1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12],
                }),
              },
              {
                scale: shovel1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.1, 1],
                }),
              },
            ],
          },
        ]}
      >
        {/* Pepita de oro */}
        <View style={styles.goldNugget}>
          <View style={[styles.nuggetPiece1, { backgroundColor: '#FFD700' }]} />
          <View style={[styles.nuggetPiece2, { backgroundColor: '#DAA520' }]} />
          <View style={[styles.nuggetPiece3, { backgroundColor: '#B8860B' }]} />
          <View style={[styles.nuggetPiece4, { backgroundColor: '#FFED4E' }]} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingMineral,
          styles.mineral6,
          {
            opacity: shovel2.interpolate({
              inputRange: [0, 0.2, 0.6, 1],
              outputRange: [0, 0.4, 0.7, 0],
            }),
            transform: [
              {
                translateY: shovel2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -18],
                }),
              },
              {
                rotate: shovel2.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '30deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Cuarzo cristalino */}
        <View style={styles.quartz}>
          <View style={[styles.quartzPoint, { backgroundColor: '#F8F8FF' }]} />
          <View style={[styles.quartzBase, { backgroundColor: '#E6E6FA' }]} />
          <View style={[styles.quartzSide, { backgroundColor: '#D8BFD8' }]} />
        </View>
      </Animated.View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header con Logo de la empresa */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ rotate: logoSpin }],
                },
              ]}
            >
              {/* Logo de TuMina */}
              <TuMinaLogo size={100} showText={false} />
            </Animated.View>
            
            <Text style={styles.companyName}>TuMina</Text>
            <Text style={styles.title}>ANM FRI Mobile</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
          </Animated.View>

          {/* Formulario de Login */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Campo Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  placeholder="operador@minera.com"
                  placeholderTextColor="#81C784"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  placeholder="Tu contraseña"
                  placeholderTextColor="#81C784"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#2E7D32"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Botón de Demo */}
            <TouchableOpacity
              style={styles.demoButton}
              onPress={fillDemoCredentials}
              disabled={loading}
            >
              <MaterialIcons name="flash-on" size={16} color="#2E7D32" />
              <Text style={styles.demoButtonText}>Usar credenciales de prueba</Text>
            </TouchableOpacity>

            {/* Botón de Login */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={styles.loadingSpinner}>
                    <View style={styles.loadingDiamond}>
                      <View style={[styles.diamondTop, { backgroundColor: '#FFD700', width: 12, height: 8 }]} />
                      <View style={[styles.diamondBottom, { backgroundColor: '#FFA500', width: 8, height: 8 }]} />
                    </View>
                  </Animated.View>
                  <Text style={styles.loginButtonText}>Iniciando sesión...</Text>
                </View>
              ) : (
                <>
                  <MaterialIcons name="login" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Enlaces adicionales */}
            <View style={styles.linksContainer}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Alert.alert('Función en desarrollo', 'Esta funcionalidad estará disponible pronto.')}
              >
                <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.footerText}>
              Al iniciar sesión, aceptas los términos y condiciones
            </Text>
            <Text style={styles.footerCopyright}>
              © 2025 CTGLOBAL
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Herramientas flotantes → Minerales flotantes
  floatingMineral: {
    position: 'absolute',
    zIndex: 1,
  },
  mineral1: {
    top: height * 0.12,
    left: width * 0.08,
  },
  mineral2: {
    top: height * 0.22,
    right: width * 0.1,
  },
  mineral3: {
    top: height * 0.35,
    left: width * 0.15,
  },
  mineral4: {
    top: height * 0.18,
    right: width * 0.25,
  },
  mineral6: {
    bottom: height * 0.25,
    right: width * 0.08,
  },
  
  // Estilos para formas de minerales
  // Diamante
  diamond: {
    width: 30,
    height: 30,
    position: 'relative',
    alignItems: 'center',
  },
  diamondTop: {
    width: 20,
    height: 15,
    transform: [{ rotate: '45deg' }],
    marginBottom: -7,
  },
  diamondBottom: {
    width: 15,
    height: 15,
    transform: [{ rotate: '45deg' }],
  },
  
  // Cristal
  crystal: {
    width: 28,
    height: 32,
    position: 'relative',
    alignItems: 'center',
  },
  crystalFacet1: {
    width: 16,
    height: 20,
    transform: [{ skewX: '15deg' }],
    marginBottom: -8,
  },
  crystalFacet2: {
    width: 12,
    height: 16,
    transform: [{ skewX: '-10deg' }],
    marginBottom: -6,
  },
  crystalFacet3: {
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
  },
  
  // Piedra irregular
  stone: {
    width: 26,
    height: 24,
    position: 'relative',
  },
  stoneShape1: {
    width: 18,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  stoneShape2: {
    width: 14,
    height: 12,
    borderRadius: 7,
    position: 'absolute',
    top: 6,
    left: 8,
  },
  stoneShape3: {
    width: 10,
    height: 8,
    borderRadius: 5,
    position: 'absolute',
    top: 2,
    left: 12,
  },
  
  // Esmeralda
  emerald: {
    width: 24,
    height: 28,
    position: 'relative',
    alignItems: 'center',
  },
  emeraldFace1: {
    width: 20,
    height: 16,
    transform: [{ skewY: '10deg' }],
    marginBottom: -4,
  },
  emeraldFace2: {
    width: 16,
    height: 12,
    transform: [{ skewY: '-5deg' }],
    marginBottom: -3,
  },
  emeraldFace3: {
    width: 12,
    height: 8,
    borderRadius: 2,
  },
  
  // Pepita de oro
  goldNugget: {
    width: 32,
    height: 20,
    position: 'relative',
  },
  nuggetPiece1: {
    width: 16,
    height: 12,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  nuggetPiece2: {
    width: 12,
    height: 10,
    borderRadius: 6,
    position: 'absolute',
    top: 4,
    left: 10,
  },
  nuggetPiece3: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
    left: 16,
  },
  nuggetPiece4: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 2,
    left: 18,
  },
  
  // Cuarzo
  quartz: {
    width: 22,
    height: 30,
    position: 'relative',
    alignItems: 'center',
  },
  quartzPoint: {
    width: 12,
    height: 18,
    backgroundColor: '#F8F8FF',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
    marginBottom: -8,
  },
  quartzBase: {
    width: 18,
    height: 14,
    borderRadius: 3,
    marginBottom: -4,
  },
  quartzSide: {
    width: 14,
    height: 8,
    borderRadius: 2,
  },
  
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  // Logo de la empresa
  logoContainer: {
    marginBottom: 16,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoImageSmall: {
    width: 80,
    height: 80,
  },
  combinedLogo: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mineralOverlay: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  smallDiamond: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Pin estilizado (como tu logo)
  pinIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#A5D6A7',
    shadowColor: '#1B5E20',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  pinInner: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  
  // Textos del header
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(27, 94, 32, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(27, 94, 32, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  
  // Formulario
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#1B5E20',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1B5E20',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  
  // Botones
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  demoButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 6,
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#81C784',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDiamond: {
    width: 20,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Enlaces y footer
  linksContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default LoginScreen;