import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const LogoutButton = ({ 
  style, 
  textStyle, 
  iconOnly = false, 
  size = 'medium',
  variant = 'primary' 
}) => {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      '🚪 Cerrar Sesión',
      `¿Estás seguro que deseas cerrar la sesión de ${user?.nombre || 'tu cuenta'}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              console.log('🚪 Cerrando sesión...');
              await logout();
              console.log('✅ Sesión cerrada exitosamente');
            } catch (error) {
              console.error('❌ Error al cerrar sesión:', error);
              Alert.alert(
                'Error',
                'No se pudo cerrar la sesión. Intenta nuevamente.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  // Configuración de tamaños
  const sizes = {
    small: {
      iconSize: 18,
      fontSize: 12,
      padding: 8,
      paddingH: 12,
    },
    medium: {
      iconSize: 20,
      fontSize: 14,
      padding: 12,
      paddingH: 16,
    },
    large: {
      iconSize: 24,
      fontSize: 16,
      padding: 16,
      paddingH: 20,
    },
  };

  // Configuración de variantes
  const variants = {
    primary: {
      backgroundColor: '#EF4444',
      textColor: 'white',
      borderColor: '#EF4444',
    },
    secondary: {
      backgroundColor: 'transparent',
      textColor: '#EF4444',
      borderColor: '#EF4444',
    },
    subtle: {
      backgroundColor: '#FEF2F2',
      textColor: '#DC2626',
      borderColor: '#FECACA',
    },
    danger: {
      backgroundColor: '#7F1D1D',
      textColor: 'white',
      borderColor: '#7F1D1D',
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: currentVariant.backgroundColor,
      borderColor: currentVariant.borderColor,
      paddingVertical: currentSize.padding,
      paddingHorizontal: iconOnly ? currentSize.padding : currentSize.paddingH,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: currentVariant.textColor,
      fontSize: currentSize.fontSize,
    },
    textStyle,
  ];

  if (isLoggingOut) {
    return (
      <View style={[buttonStyles, styles.loadingButton]}>
        <ActivityIndicator 
          size="small" 
          color={currentVariant.textColor} 
        />
        {!iconOnly && (
          <Text style={[textStyles, { marginLeft: 8 }]}>
            Cerrando...
          </Text>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handleLogout}
      disabled={isLoggingOut}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="log-out-outline" 
        size={currentSize.iconSize} 
        color={currentVariant.textColor} 
      />
      {!iconOnly && (
        <Text style={[textStyles, { marginLeft: 8 }]}>
          Cerrar Sesión
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Componente de perfil con botón de logout integrado
export const UserProfileHeader = () => {
  const { user } = useAuth();

  return (
    <View style={styles.profileHeader}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color="#6B7280" />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.userRole}>{user?.rol?.toUpperCase() || 'USUARIO'}</Text>
          <Text style={styles.userCompany}>{user?.empresa || 'Sin empresa'}</Text>
        </View>
      </View>
      
      <LogoutButton 
        iconOnly={true} 
        size="medium" 
        variant="subtle"
        style={styles.headerLogoutButton}
      />
    </View>
  );
};

// Componente de configuraciones con logout
export const SettingsLogout = () => {
  const { user } = useAuth();

  return (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Cuenta</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="person-circle-outline" size={24} color="#6B7280" />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Usuario Actual</Text>
            <Text style={styles.settingValue}>{user?.nombre}</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="business-outline" size={24} color="#6B7280" />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Empresa</Text>
            <Text style={styles.settingValue}>{user?.empresa}</Text>
          </View>
        </View>
      </View>

      <View style={styles.logoutSection}>
        <LogoutButton 
          variant="primary" 
          size="large"
          style={styles.fullLogoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: '600',
  },
  loadingButton: {
    opacity: 0.7,
  },
  
  // Estilos para UserProfileHeader
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerLogoutButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  // Estilos para SettingsLogout
  settingsSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fullLogoutButton: {
    width: '100%',
  },
});

export default LogoutButton;