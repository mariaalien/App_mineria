// src/components/PremiumButton.tsx - Botón con haptics y animaciones
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export default function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  size = 'medium'
}: PremiumButtonProps) {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    // Haptic feedback al presionar
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animación de escala hacia abajo
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 50,
    }).start();
  };

  const handlePressOut = () => {
    // Animación de regreso a escala normal
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 50,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      // Haptic feedback al completar la acción
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPress();
    }
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return disabled 
          ? ['#cccccc', '#999999']
          : ['#2E7D32', '#1B5E20'];
      case 'secondary':
        return ['#ffffff', '#f5f5f5'];
      case 'danger':
        return disabled 
          ? ['#cccccc', '#999999']
          : ['#d32f2f', '#b71c1c'];
      default:
        return ['#2E7D32', '#1B5E20'];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return disabled ? '#999999' : '#2E7D32';
      default:
        return disabled ? '#666666' : 'white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingVertical: 18,
          paddingHorizontal: 32,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: 14,
          paddingHorizontal: 24,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: scaleValue }] },
        styles.container
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          styles.button,
          variant === 'secondary' && styles.secondaryButton,
          disabled && styles.disabledButton,
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={[
            styles.gradient,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingDot} />
                <View style={[styles.loadingDot, styles.loadingDot2]} />
                <View style={[styles.loadingDot, styles.loadingDot3]} />
              </View>
            ) : (
              <Text 
                style={[
                  styles.text,
                  { 
                    color: getTextColor(),
                    fontSize: sizeStyles.fontSize,
                  }
                ]}
              >
                {title}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 2,
    opacity: 0.4,
  },
  loadingDot2: {
    opacity: 0.7,
  },
  loadingDot3: {
    opacity: 1,
  },
});