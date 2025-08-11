// src/components/NotificationManager.tsx - Gestor de Notificaciones UI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { notificationService, NotificationType } from '../services/notificationService';
import PremiumButton from './PremiumButton';

interface NotificationManagerProps {
  onNotificationUpdate?: (stats: any) => void;
}

export default function NotificationManager({ onNotificationUpdate }: NotificationManagerProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeNotifications();
    loadNotificationStats();
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
      setIsEnabled(true);
      console.log('✅ Notificaciones inicializadas en UI');
    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
      setIsEnabled(false);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const notificationStats = await notificationService.getNotificationStats();
      setStats(notificationStats);
      onNotificationUpdate?.(notificationStats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (value) {
      await initializeNotifications();
      Alert.alert(
        '🔔 Notificaciones Activadas',
        'Recibirás recordatorios y actualizaciones importantes del sistema FRI'
      );
    } else {
      await notificationService.clearAllNotifications();
      Alert.alert(
        '🔕 Notificaciones Desactivadas',
        'No recibirás notificaciones automáticas'
      );
    }
    
    setIsEnabled(value);
    await loadNotificationStats();
  };

  const sendTestNotification = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await notificationService.sendTestNotification();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Enviado', 'Notificación de prueba enviada');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('❌ Error', 'No se pudo enviar la notificación');
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Simular sincronización manual
      await notificationService.sendLocalNotification({
        id: 'manual_sync_' + Date.now(),
        type: NotificationType.SYNC_COMPLETE,
        title: '🔄 Sincronización Manual',
        body: 'Iniciando sincronización de datos...',
      });
      
      // Simular proceso de sincronización
      setTimeout(async () => {
        await notificationService.sendLocalNotification({
          id: 'sync_complete_' + Date.now(),
          type: NotificationType.SYNC_COMPLETE,
          title: '✅ Sincronización Completa',
          body: 'Todos los datos han sido sincronizados exitosamente',
        });
      }, 3000);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadNotificationStats();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('❌ Error', 'No se pudo iniciar la sincronización');
    } finally {
      setLoading(false);
    }
  };

  const scheduleDeadlineReminder = async () => {
    try {
      // Crear deadline de ejemplo (3 días en el futuro)
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 6); // 6 días para que el recordatorio sea en 3
      
      await notificationService.scheduleDeadlineReminder(
        deadline,
        'FRI Producción Mensual - Febrero 2025'
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '⏰ Recordatorio Programado',
        'Se ha programado un recordatorio de deadline para tu próximo FRI'
      );
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo programar el recordatorio');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons 
            name={isEnabled ? "notifications" : "notifications-off"} 
            size={20} 
            color={isEnabled ? "#27ae60" : "#666"} 
          />
          <Text style={styles.title}>Notificaciones Push</Text>
        </View>
        
        <Switch
          value={isEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#ccc', true: '#2E7D32' }}
          thumbColor={isEnabled ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      {/* Estadísticas */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Programadas</Text>
            <Text style={styles.statValue}>{stats.scheduled}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Estado</Text>
            <Text style={[styles.statValue, { color: stats.permissionsGranted ? '#27ae60' : '#e74c3c' }]}>
              {stats.permissionsGranted ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Última Sync</Text>
            <Text style={styles.statValue}>
              {new Date(stats.lastSync).toLocaleTimeString('es-CO', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Acciones */}
      {isEnabled && (
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>🚀 Acciones Rápidas</Text>
          
          <View style={styles.actionRow}>
            <PremiumButton
            title="🎭 Demo Completo"
            onPress={async () => {
              setLoading(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              
              try {
                await notificationService.demoAllNotificationTypes();
                Alert.alert('🎉 Demo Iniciado', 'Se enviará una notificación cada 2 segundos mostrando todos los tipos disponibles');
              } catch (error) {
                Alert.alert('❌ Error', 'No se pudo iniciar el demo');
              } finally {
                setLoading(false);
              }
            }}
            variant="primary"
            size="medium"
            loading={loading}
            icon={<Ionicons name="play" size={16} color="white" />}
          />
          
          <PremiumButton
              title="🧪 Prueba"
              onPress={sendTestNotification}
              variant="secondary"
              size="small"
              loading={loading}
              icon={<Ionicons name="flask" size={14} color="#2E7D32" />}
            />
            
            <PremiumButton
              title="🔄 Sync"
              onPress={triggerSync}
              variant="secondary"
              size="small"
              loading={loading}
              icon={<Ionicons name="sync" size={14} color="#2E7D32" />}
            />
          </View>
          
          <PremiumButton
            title="⏰ Programar Recordatorio"
            onPress={scheduleDeadlineReminder}
            variant="secondary"
            size="medium"
            icon={<Ionicons name="alarm" size={16} color="#2E7D32" />}
          />
        </View>
      )}

      {/* Información */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle" size={16} color="#666" />
        <Text style={styles.infoText}>
          {isEnabled 
            ? 'Recibirás notificaciones sobre recordatorios FRI, sincronización y deadlines importantes.'
            : 'Activa las notificaciones para recibir recordatorios automáticos.'
          }
        </Text>
      </View>

      {/* Push Token (solo para desarrollo) */}
      {__DEV__ && stats?.pushToken && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>🔧 Debug Info</Text>
          <Text style={styles.debugText}>
            Token: {stats.pushToken.substring(0, 20)}...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 16,
  },
  debugContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
});