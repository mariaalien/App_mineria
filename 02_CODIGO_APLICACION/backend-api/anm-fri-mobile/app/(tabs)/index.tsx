// app/fri/index.tsx - Pantalla principal de FRI
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import PremiumButton from '../../src/components/PremiumButton';


export default function FRIIndexScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
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

        {/* Menú principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Acciones Principales</Text>
          
          <View style={styles.menuContainer}>
            <PremiumButton
              title="📝 Nuevo Formulario"
              onPress={() => router.push('/fri/form')}
              variant="primary"
              size="large"
              icon={<Ionicons name="add-circle" size={18} color="white" />}
            />
            
            <PremiumButton
              title="⛏️ Producción"
              onPress={() => router.push('/fri/produccion')}
              variant="secondary"
              size="large"
              icon={<Ionicons name="hammer" size={18} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="📦 Inventarios"
              onPress={() => router.push('/fri/inventarios')}
              variant="secondary"
              size="large"
              icon={<Ionicons name="cube" size={18} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="📊 Reportes"
              onPress={() => console.log('Ver reportes')}
              variant="secondary"
              size="large"
              icon={<Ionicons name="bar-chart" size={18} color="#2E7D32" />}
            />
          </View>
        </View>

        {/* Estadísticas rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Resumen</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="document" size={24} color="#3498db" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>FRI Enviados</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="create" size={24} color="#e67e22" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Borradores</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Cumplimiento</Text>
            </View>
          </View>
        </View>

        {/* Estado del desarrollo */}
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={20} color="#2E7D32" />
          <Text style={styles.noteText}>
            📅 <Text style={styles.noteHighlight}>Estado del Proyecto:</Text> Día 15/20 - 
            Desarrollando formularios móviles optimizados con cámara y GPS integrado.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📋 Sistema FRI ANM • Resolución 371/2024
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  menuContainer: {
    gap: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  noteContainer: {
    backgroundColor: '#e8f5e8',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  noteHighlight: {
    fontWeight: '600',
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