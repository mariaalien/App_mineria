import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  
  // Función para manejar la navegación con haptic feedback
  const handleNavigation = (screenName, params = {}) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screenName, params);
  };

  // Datos de los botones de acceso rápido
  const quickAccessButtons = [
    {
      id: '1',
      title: 'Nuevo FRI',
      subtitle: 'Crear formulario',
      icon: 'document-text',
      color: '#2E7D32',
      screen: 'FRI',
      params: { screen: 'FormularioFRIMain' }
    },
    {
      id: '2',
      title: 'Registro Producción',
      subtitle: 'Capturar datos',
      icon: 'construct',
      color: '#1976D2',
      screen: 'FRI',
      params: { screen: 'ProductionRegistration' }
    },
    {
      id: '3',
      title: 'Ver Reportes',
      subtitle: 'Estadísticas',
      icon: 'stats-chart',
      color: '#F57C00',
      screen: 'Dashboard'
    },
    {
      id: '4',
      title: 'Buscar',
      subtitle: 'Consultar datos',
      icon: 'search',
      color: '#7B1FA2',
      screen: 'Explorar'
    },
  ];

  // Actividades recientes (ejemplo)
  const recentActivities = [
    {
      id: '1',
      title: 'FRI Mensual enviado',
      subtitle: 'Junio 2025',
      icon: 'checkmark-circle',
      color: '#27ae60',
      time: 'Hace 2 horas'
    },
    {
      id: '2',
      title: 'Producción registrada',
      subtitle: 'Oro: 15.5 kg',
      icon: 'construct',
      color: '#1976D2',
      time: 'Hace 5 horas'
    },
    {
      id: '3',
      title: 'Sincronización completada',
      subtitle: 'Todos los datos',
      icon: 'cloud-done',
      color: '#2E7D32',
      time: 'Hace 1 día'
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header de Bienvenida */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Bienvenido!</Text>
          <Text style={styles.username}>Sistema ANM FRI</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Aquí irían las notificaciones
          }}
        >
          <Ionicons name="notifications-outline" size={24} color="#2E7D32" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tarjeta de Estado */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#27ae60" />
          <Text style={styles.statusTitle}>Sistema Operativo</Text>
        </View>
        <Text style={styles.statusDescription}>
          Todos los servicios funcionando correctamente
        </Text>
        <View style={styles.statusFooter}>
          <View style={styles.statusItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.statusText}>Actualizado hace 5 min</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="cloud-done" size={16} color="#27ae60" />
            <Text style={styles.statusText}>Sincronizado</Text>
          </View>
        </View>
      </View>

      {/* Sección de Accesos Rápidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Accesos Rápidos</Text>
        
        <View style={styles.quickAccessGrid}>
          {quickAccessButtons.map((button) => (
            <TouchableOpacity
              key={button.id}
              style={styles.quickAccessCard}
              onPress={() => handleNavigation(button.screen, button.params)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: button.color + '20' }]}>
                <Ionicons name={button.icon} size={28} color={button.color} />
              </View>
              <Text style={styles.cardTitle}>{button.title}</Text>
              <Text style={styles.cardSubtitle}>{button.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sección de Actividad Reciente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Actividad Reciente</Text>
          <TouchableOpacity onPress={() => handleNavigation('Explorar')}>
            <Text style={styles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Ionicons name={activity.icon} size={20} color={activity.color} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Información Adicional */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#1976D2" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>💡 Consejo del día</Text>
          <Text style={styles.infoText}>
            Sincroniza tus datos regularmente para evitar pérdida de información
          </Text>
        </View>
      </View>

      {/* Espaciado inferior */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#e53935',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#e8f5e9',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginLeft: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 12,
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: (width - 48) / 2,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 32,
  },
});