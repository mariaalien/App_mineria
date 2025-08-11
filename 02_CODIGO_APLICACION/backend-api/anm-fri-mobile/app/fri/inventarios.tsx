 // app/fri/inventarios.tsx - Pantalla de Inventarios FRI
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumButton from '../../src/components/PremiumButton';

export default function FRIInventariosScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>FRI Inventarios</Text>
            <Text style={styles.subtitle}>Gestión de Inventarios Mineros</Text>
          </View>
          
          <View style={styles.iconContainer}>
            <Ionicons name="cube" size={32} color="#2E7D32" />
          </View>
        </View>

        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Inventarios de Producción</Text>
          <Text style={styles.description}>
            Los inventarios FRI permiten registrar y controlar las existencias de minerales extraídos, 
            facilitando el cumplimiento de la normativa ANM.
          </Text>
        </View>

        {/* Características */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Características</Text>
          
          <View style={styles.featureContainer}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
              <Text style={styles.featureText}>Control de existencias en tiempo real</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
              <Text style={styles.featureText}>Registros por tipo de mineral</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
              <Text style={styles.featureText}>Movimientos de entrada y salida</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
              <Text style={styles.featureText}>Reportes automáticos para ANM</Text>
            </View>
          </View>
        </View>

        {/* Acciones disponibles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Acciones Disponibles</Text>
          
          <View style={styles.actionsContainer}>
            <PremiumButton
              title="📋 Nuevo Inventario"
              onPress={() => console.log('Crear inventario')}
              variant="primary"
              size="large"
              icon={<Ionicons name="add-circle" size={18} color="white" />}
            />
            
            <PremiumButton
              title="📊 Ver Inventarios"
              onPress={() => console.log('Ver inventarios')}
              variant="secondary"
              size="large"
              icon={<Ionicons name="list" size={18} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="📈 Reportes"
              onPress={() => console.log('Generar reportes')}
              variant="secondary"
              size="large"
              icon={<Ionicons name="bar-chart" size={18} color="#2E7D32" />}
            />
          </View>
        </View>

        {/* Estado del desarrollo */}
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={20} color="#2E7D32" />
          <Text style={styles.noteText}>
            📅 <Text style={styles.noteHighlight}>Estado:</Text> Pantalla en desarrollo - Día 15/20 del proyecto ANM FRI
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📦 Inventarios FRI • Resolución ANM 371/2024
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
  featureContainer: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
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
