// app/(tabs)/index.tsx - Pantalla principal de FRI con Logout
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import LogoutButton from '../../src/components/LogoutButton';

export default function FRIIndexScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header personalizado con usuario y logout */}
      <View style={styles.customHeader}>
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color="#2E7D32" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>¡Hola!</Text>
            <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
            <Text style={styles.userRole}>{user?.rol?.toUpperCase() || 'USUARIO'}</Text>
          </View>
        </View>
        
        {/* Botón de logout en el header */}
        <LogoutButton 
          iconOnly={true} 
          size="medium" 
          variant="subtle"
          style={styles.headerLogoutButton}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header principal del sistema */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Sistema FRI</Text>
            <Text style={styles.subtitle}>Formatos de Reporte de Información</Text>
          </View>
          
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={32} color="#2E7D32" />
          </View>
        </View>

        {/* Información principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Gestión FRI ANM</Text>
          <Text style={styles.description}>
            Sistema integral para la gestión de Formatos de Reporte de Información 
            según la Resolución 371/2024 de la Agencia Nacional de Minería.
          </Text>
        </View>

        {/* Sección de acceso rápido */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>⚡ Acceso Rápido</Text>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="document-text" size={28} color="#007AFF" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Nuevo FRI</Text>
              <Text style={styles.quickActionSubtitle}>
                Crear un nuevo reporte de información
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="folder-open" size={28} color="#FF9500" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Borradores</Text>
              <Text style={styles.quickActionSubtitle}>
                Continuar FRIs guardados
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="checkmark-done" size={28} color="#34C759" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Completados</Text>
              <Text style={styles.quickActionSubtitle}>
                Ver FRIs completados y enviados
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>12</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Información de la empresa/usuario */}
        <View style={styles.companySection}>
          <Text style={styles.sectionTitle}>🏢 Información de la Empresa</Text>
          <View style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <Ionicons name="business" size={24} color="#2E7D32" />
              <Text style={styles.companyName}>{user?.empresa || 'TU EMPRESA MINERA'}</Text>
            </View>
            <View style={styles.companyDetails}>
              <View style={styles.companyRow}>
                <Ionicons name="person-circle" size={16} color="#666" />
                <Text style={styles.companyText}>Operador: {user?.nombre}</Text>
              </View>
              <View style={styles.companyRow}>
                <Ionicons name="shield-checkmark" size={16} color="#666" />
                <Text style={styles.companyText}>Rol: {user?.rol?.toUpperCase()}</Text>
              </View>
              <View style={styles.companyRow}>
                <Ionicons name="call" size={16} color="#666" />
                <Text style={styles.companyText}>Tel: {user?.telefono || 'No disponible'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Estadísticas rápidas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Estadísticas del Mes</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>FRIs Enviados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>En Proceso</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Cumplimiento</Text>
            </View>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>ℹ️ Información Importante</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              • Los FRIs deben enviarse antes del día 15 de cada mes
            </Text>
            <Text style={styles.infoText}>
              • Recuerda adjuntar toda la documentación requerida
            </Text>
            <Text style={styles.infoText}>
              • En caso de dudas, contacta al supervisor asignado
            </Text>
          </View>
        </View>

        {/* Botón de logout alternativo en el contenido */}
        <View style={styles.logoutSection}>
          <LogoutButton 
            variant="secondary" 
            size="large"
            style={styles.fullLogoutButton}
          />
        </View>

        {/* Espaciado final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Estilos del header personalizado
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  headerLogoutButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Estilos del contenido original
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  iconContainer: {
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
  },
  
  // Secciones
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companySection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutSection: {
    margin: 16,
    padding: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  
  // Tarjetas de acceso rápido
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Información de empresa
  companyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
  },
  companyDetails: {
    gap: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  
  // Estadísticas
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Información adicional
  infoCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  // Botón de logout
  fullLogoutButton: {
    width: '100%',
  },
  
  bottomSpacing: {
    height: 20,
  },
});