// ==========================================
// src/screens/dashboard/DashboardScreen.js - Dashboard principal
// ==========================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const dashboardStats = {
    friPendientes: 12,
    friAprobados: 45,
    reportesGenerados: 8,
    ultimaSincronizacion: '2024-08-07T14:30:00Z'
  };

  const quickActions = [
    {
      id: 'nuevo-fri',
      title: 'Nuevo FRI',
      subtitle: 'Crear formulario',
      icon: 'add-circle',
      color: '#10b981',
      route: 'FormularioNuevo'
    },
    {
      id: 'revisar-fri',
      title: 'Revisar FRI',
      subtitle: `${dashboardStats.friPendientes} pendientes`,
      icon: 'document-text',
      color: '#f59e0b',
      route: 'FormulariosPendientes'
    },
    {
      id: 'reportes',
      title: 'Reportes',
      subtitle: 'Ver estadísticas',
      icon: 'bar-chart',
      color: '#3b82f6',
      route: 'Reportes'
    },
    {
      id: 'sincronizar',
      title: 'Sincronizar',
      subtitle: 'Actualizar datos',
      icon: 'sync',
      color: '#8b5cf6',
      onPress: () => handleSync()
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'fri_created',
      title: 'FRI Producción creado',
      subtitle: 'Formato mensual completado',
      timestamp: '2024-08-07T12:00:00Z',
      icon: 'document',
      color: '#10b981'
    },
    {
      id: 2,
      type: 'fri_approved',
      title: 'FRI Inventarios aprobado',
      subtitle: 'Revisado por supervisor',
      timestamp: '2024-08-07T10:30:00Z',
      icon: 'checkmark-circle',
      color: '#3b82f6'
    },
    {
      id: 3,
      type: 'report_generated',
      title: 'Reporte mensual generado',
      subtitle: 'Estadísticas de julio',
      timestamp: '2024-08-07T09:15:00Z',
      icon: 'analytics',
      color: '#f59e0b'
    }
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carga de datos
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleSync = () => {
    // Implementar sincronización
    console.log('Sincronizando datos...');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getUserInitials(user?.name || 'Usuario')}
              </Text>
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
              <Text style={styles.userRole}>{user?.role || 'OPERADOR'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications-outline" size={24} color="#ffffff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
        >
          {[
            { label: 'FRI Pendientes', value: dashboardStats.friPendientes, color: '#f59e0b' },
            { label: 'FRI Aprobados', value: dashboardStats.friAprobados, color: '#10b981' },
            { label: 'Reportes', value: dashboardStats.reportesGenerados, color: '#3b82f6' }
          ].map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={[styles.statIndicator, { backgroundColor: stat.color }]} />
            </View>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Contenido principal */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => {
                  if (action.onPress) {
                    action.onPress();
                  } else if (action.route) {
                    navigation.navigate(action.route);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <Icon name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actividad Reciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityItem}
                activeOpacity={0.7}
              >
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
                  <Icon name={activity.icon} size={20} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                </View>
                <Text style={styles.activityTime}>
                  {formatTime(activity.timestamp)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer de sincronización */}
        <View style={styles.syncSection}>
          <Icon name="cloud-done" size={16} color="#10b981" />
          <Text style={styles.syncText}>
            Última sincronización: {formatTime(dashboardStats.ultimaSincronizacion)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 44,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 2,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsContainer: {
    paddingHorizontal: 24,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    minWidth: 100,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionSubtitle: {
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  activitySubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },
  activityTime: {
    fontSize: '12px',
    color: '#6b7280'
  },
  syncSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    paddingVertical: 16,
    marginTop: 32
  },
  syncText: {
    fontSize: '12px',
    color: '#10b981'
  }
});

export default DashboardScreen;