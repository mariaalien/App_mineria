 // app/fri/produccion.tsx - Pantalla de Producción FRI
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumButton from '../../src/components/PremiumButton';

export default function FRIProduccionScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>FRI Producción</Text>
            <Text style={styles.subtitle}>Reportes de Producción Minera</Text>
          </View>
          
          <View style={styles.iconContainer}>
            <Ionicons name="hammer" size={32} color="#2E7D32" />
          </View>
        </View>

        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⛏️ Producción Minera</Text>
          <Text style={styles.description}>
            Los reportes de producción FRI documentan toda la actividad extractiva, 
            cumpliendo con los requisitos de la Resolución 371/2024 de la ANM.
          </Text>
        </View>

        {/* Tipos de reportes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Tipos de Reportes</Text>
          
          <View style={styles.reportContainer}>
            <View style={styles.reportType}>
              <Ionicons name="calendar" size={24} color="#3498db" />
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>Reportes Mensuales</Text>
                <Text style={styles.reportDescription}>Producción mensual detallada</Text>
              </View>
            </View>
            
            <View style={styles.reportType}>
              <Ionicons name="stats-chart" size={24} color="#e67e22" />
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>Reportes Trimestrales</Text>
                <Text style={styles.reportDescription}>Consolidados por trimestre</Text>
              </View>
            </View>
            
            <View style={styles.reportType}>
              <Ionicons name="trophy" size={24} color="#f39c12" />
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>Reportes Anuales</Text>
                <Text style={styles.reportDescription}>Balance anual de producción</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Características */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Características Avanzadas</Text>
          
          <View style={styles.featureContainer}>
            <View style={styles.feature}>
              <Ionicons name="location" size={20} color="#27ae60" />
              <Text style={styles.featureText}>Georreferenciación automática</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="camera" size={20} color="#27ae60" />
              <Text style={styles.featureText}>Evidencia fotográfica integrada</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="cloud-upload" size={20} color="#27ae60" />
              <Text style={styles.featureText}>Sincronización automática</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={20} color="#27ae60" />
              <Text style={styles.featureText}>Validación normativa ANM</Text>
            </View>
          </View>
        </View>

        {/* Acciones disponibles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Generar Reportes</Text>
          
          <View style={styles.actionsContainer}>
            <PremiumButton
              title="📊 Reporte Mensual"
              onPress={() => console.log('Reporte mensual')}
              variant="primary"
              size="large"
              icon={<Ionicons name="calendar" size={18} color="white" />}
            />
            
            <PremiumButton
              title="📈 Reporte Trimestral"
              onPress={() => console.log('Reporte trimestral')}
              variant="secondary"
              size="large"
              icon={<Ionicons name="stats-chart" size={18} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="🏆 Reporte Anual"
              onPress={() => console.log('Reporte anual')}
              variant="secondary"
              size="large"
              icon={<Ionicons name="trophy" size={18} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="📋 Historial"
              onPress={() => console.log('Ver historial')}
              variant="secondary"
              size="medium"
              icon={<Ionicons name="time" size={16} color="#2E7D32" />}
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
            ⛏️ Producción FRI • Resolución ANM 371/2024
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
  reportContainer: {
    gap: 16,
  },
  reportType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
