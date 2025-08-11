// app/(tabs)/fri.tsx - Nueva tab para gestión de FRIs
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import FRITypeSelectionScreen from '../../src/screens/FRITypeSelectionScreen';

export default function FRITab() {
  const [showNewFRIModal, setShowNewFRIModal] = useState(false);

  const handleCreateNewFRI = () => {
    setShowNewFRIModal(true);
  };

  const mockNavigation = {
    goBack: () => setShowNewFRIModal(false),
    navigate: (screen: string, params?: any) => {
      console.log('Navegando a:', screen, params);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FRI - Reportes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateNewFRI}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <ScrollView style={styles.content}>
        {/* Sección de acceso rápido */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleCreateNewFRI}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="document-text" size={32} color="#007AFF" />
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
              <Ionicons name="folder-open" size={32} color="#FF9500" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Borradores</Text>
              <Text style={styles.quickActionSubtitle}>
                Continuar FRIs guardados
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="checkmark-circle" size={32} color="#34C759" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Enviados</Text>
              <Text style={styles.quickActionSubtitle}>
                Ver reportes completados
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sección de estadísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Este Mes</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>FRIs Enviados</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>En Borrador</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Cumplimiento</Text>
            </View>
          </View>
        </View>

        {/* Sección de FRIs recientes */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          
          <View style={styles.recentItem}>
            <View style={styles.recentIcon}>
              <Ionicons name="document" size={20} color="#007AFF" />
            </View>
            <View style={styles.recentContent}>
              <Text style={styles.recentTitle}>FRI Mensual - Enero 2025</Text>
              <Text style={styles.recentSubtitle}>Enviado hace 2 días</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusSent]}>
              <Text style={styles.statusText}>Enviado</Text>
            </View>
          </View>

          <View style={styles.recentItem}>
            <View style={styles.recentIcon}>
              <Ionicons name="document-outline" size={20} color="#FF9500" />
            </View>
            <View style={styles.recentContent}>
              <Text style={styles.recentTitle}>FRI Trimestral Q4 2024</Text>
              <Text style={styles.recentSubtitle}>Borrador guardado</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusDraft]}>
              <Text style={styles.statusText}>Borrador</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal para crear nuevo FRI */}
      <Modal
        visible={showNewFRIModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <FRITypeSelectionScreen navigation={mockNavigation} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  quickAccessSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#6D6D80',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    padding: 16,
    paddingTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6D6D80',
    textAlign: 'center',
  },
  recentSection: {
    padding: 16,
    paddingTop: 0,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  recentSubtitle: {
    fontSize: 14,
    color: '#6D6D80',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusSent: {
    backgroundColor: '#E8F5E8',
  },
  statusDraft: {
    backgroundColor: '#FFF2E8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
});