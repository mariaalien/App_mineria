// src/components/AnimatedInput.tsx - Input con animaciones y feedback visual
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  error?: string;
  success?: boolean;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function AnimatedInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  success = false,
  required = false,
  icon,
  onFocus,
  onBlur,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de focus/blur
    Animated.timing(focusAnimation, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  useEffect(() => {
    // Animación de shake para errores
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animación de scale al enfocar
    Animated.spring(scaleAnimation, {
      toValue: 1.02,
      useNativeDriver: true,
      tension: 300,
      friction: 50,
    }).start();

    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Animación de scale al desenfocar
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 50,
    }).start();

    onBlur?.();
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    
    // Haptic feedback sutil al escribir
    if (text.length > value.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getBorderColor = () => {
    if (error) return '#e74c3c';
    if (success) return '#27ae60';
    if (isFocused) return '#2E7D32';
    return '#ddd';
  };

  const labelTop = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -8],
  });

  const labelFontSize = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const labelColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#999', isFocused ? '#2E7D32' : '#666'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnimation }, { scale: scaleAnimation }] }
      ]}
    >
      <View style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
        {/* Gradiente de fondo sutil */}
        <LinearGradient
          colors={isFocused ? ['#f8f9ff', '#ffffff'] : ['#ffffff', '#f8f9fa']}
          style={styles.backgroundGradient}
        />

        {/* Icono */}
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons 
              name={icon} 
              size={20} 
              color={isFocused ? '#2E7D32' : '#999'} 
            />
          </View>
        )}

        {/* Label animado */}
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
              left: icon ? 45 : 12,
            },
          ]}
        >
          {label}{required && ' *'}
        </Animated.Text>

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            { paddingLeft: icon ? 45 : 12 }
          ]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
        />

        {/* Indicador de estado */}
        {(success || error) && (
          <View style={styles.statusIndicator}>
            <Ionicons
              name={success ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={success ? '#27ae60' : '#e74c3c'}
            />
          </View>
        )}
      </View>

      {/* Mensaje de error */}
      {error && (
        <Animated.View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      {/* Indicador de progreso para campos requeridos */}
      {required && (
        <View style={styles.progressContainer}>
          <View style={[
            styles.progressBar,
            { 
              backgroundColor: value ? '#27ae60' : '#ddd',
              width: value ? '100%' : '0%'
            }
          ]} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    position: 'relative',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'white',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  iconContainer: {
    position: 'absolute',
    left: 12,
    top: 18,
    zIndex: 2,
  },
  label: {
    position: 'absolute',
    fontWeight: '500',
    backgroundColor: 'white',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    height: 56,
    fontSize: 16,
    paddingRight: 45,
    paddingTop: 12,
    color: '#333',
  },
  statusIndicator: {
    position: 'absolute',
    right: 12,
    top: 18,
  },
  errorContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 4,
    height: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
    transition: 'width 0.3s ease',
  },
});