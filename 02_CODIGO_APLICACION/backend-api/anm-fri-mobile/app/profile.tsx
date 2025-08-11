// app/profile.tsx - Pantalla de Perfil de Usuario
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import PremiumButton from '../src/components/PremiumButton';

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/login');
          }
        }
      ]
    );
  };

  const userData = {
    nombre: 'Juan Carlos Pérez',
    email: 'juan.perez@anm.gov.co',
    rol: 'Operador Minero',
    empresa: 'Minera El Dorado S.A.S',
    titulos: ['TM-001-2024', 'TM-002-2024'],
    ubicacion: 'Antioquia, Colombia'
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header del perfil */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color="#2E7D32" />
          </View>
          <Text style={styles.userName}>{userData.nombre}</Text>
          <Text style={styles.userRole}>{userData.rol}</Text>
        </View>

        {/* Información personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Información Personal</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Empresa</Text>
                <Text style={styles.infoValue}>{userData.empresa}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>{userData.ubicacion}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Títulos mineros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏔️ Títulos Mineros</Text>
          
          <View style={styles.titulosContainer}>
            {userData.titulos.map((titulo, index) => (
              <View key={index} style={styles.tituloItem}>
                <Ionicons name="diamond" size={16} color="#2E7D32" />
                <Text style={styles.tituloText}>{titulo}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>ACTIVO</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>FRI Enviados</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Borradores</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Cumplimiento</Text>
            </View>
          </View>
        </View>

        {/* Configuración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configuración</Text>
          
          <View style={styles.configContainer}>
            <PremiumButton
              title="📱 Notificaciones"
              onPress={() => Alert.alert('Próximamente', 'Configuración de notificaciones')}
              variant="secondary"
              size="medium"
              icon={<Ionicons name="notifications" size={16} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="🔐 Seguridad"
              onPress={() => Alert.alert('Próximamente', 'Configuración de seguridad')}
              variant="secondary"
              size="medium"
              icon={<Ionicons name="shield-checkmark" size={16} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="📋 Preferencias"
              onPress={() => Alert.alert('Próximamente', 'Configuración de preferencias')}
              variant="secondary"
              size="medium"
              icon={<Ionicons name="options" size={16} color="#2E7D32" />}
            />
          </View>
        </View>

        {/* Acciones de cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Cuenta</Text>
          
          <View style={styles.accountActions}>
            <PremiumButton
              title="📝 Editar Perfil"
              onPress={() => Alert.alert('Próximamente', 'Edición de perfil')}
              variant="secondary"
              size="large"
              icon={<Ionicons name="create" size={18} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="🚪 Cerrar Sesión"
              onPress={handleLogout}
              variant="danger"
              size="large"
              icon={<Ionicons name="log-out" size={18} color="white" />}
            />
          </View>
        </View>

        {/* Información de la app */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Sistema FRI ANM v1.0.0</Text>
          <Text style={styles.appDescription}>
            Desarrollado según Resolución 371/2024
          </Text>
          <Text style={styles.development}>
            📅 Día 15/20 - Desarrollo en progreso
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            👤 Perfil de Usuario • Sistema FRI ANM
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
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#e8f5e8',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
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
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  titulosContainer: {
    gap: 12,
  },
  tituloItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  tituloText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  configContainer: {
    gap: 12,
  },
  accountActions: {
    gap: 12,
  },
  appInfo: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  development: {
    fontSize: 12,
    color: '#2E7D32',
    fontStyle: 'italic',
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
