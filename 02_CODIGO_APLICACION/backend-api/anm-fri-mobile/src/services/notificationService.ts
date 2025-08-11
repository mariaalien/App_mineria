// src/services/notificationService.ts - Sistema de Notificaciones Simplificado
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Tipos de notificaciones
export enum NotificationType {
  FRI_REMINDER = 'fri_reminder',
  SYNC_COMPLETE = 'sync_complete',
  DEADLINE_WARNING = 'deadline_warning',
  APPROVAL_STATUS = 'approval_status',
  SYSTEM_UPDATE = 'system_update'
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  scheduledTime?: Date;
}

// Simulador de notificaciones locales
class SimpleNotificationService {
  private static instance: SimpleNotificationService;
  private isInitialized = false;
  private notificationQueue: NotificationData[] = [];
  private subscribers: ((notification: NotificationData) => void)[] = [];

  public static getInstance(): SimpleNotificationService {
    if (!SimpleNotificationService.instance) {
      SimpleNotificationService.instance = new SimpleNotificationService();
    }
    return SimpleNotificationService.instance;
  }

  // Inicializar servicio
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔔 Inicializando sistema de notificaciones simplificado...');
      
      // Simular inicialización
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isInitialized = true;
      console.log('✅ Sistema de notificaciones inicializado');

      // Programar notificaciones de ejemplo
      this.scheduleDefaultNotifications();

    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
    }
  }

  // Enviar notificación (simulada con Alert + Haptics)
  async sendLocalNotification(notificationData: NotificationData): Promise<string> {
    try {
      console.log('📤 Enviando notificación:', notificationData.title);

      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // En desarrollo, mostrar como Alert
      if (__DEV__) {
        Alert.alert(
          `🔔 ${notificationData.title}`,
          notificationData.body,
          [
            { 
              text: 'Cerrar', 
              style: 'cancel' 
            },
            { 
              text: 'Ver', 
              onPress: () => this.handleNotificationTapped(notificationData)
            }
          ]
        );
      }

      // Notificar a suscriptores
      this.notifySubscribers(notificationData);

      // Agregar a cola
      this.notificationQueue.push(notificationData);

      const notificationId = 'notification_' + Date.now();
      console.log('📝 Notificación agregada a cola:', notificationId);
      
      return notificationId;
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
      throw error;
    }
  }

  // Programar notificación (simulada)
  async scheduleNotification(notificationData: NotificationData, delay: number = 0): Promise<string> {
    console.log(`⏰ Programando notificación en ${delay}ms:`, notificationData.title);
    
    setTimeout(() => {
      this.sendLocalNotification(notificationData);
    }, delay);

    return 'scheduled_' + Date.now();
  }

  // Suscribirse a notificaciones
  subscribe(callback: (notification: NotificationData) => void): () => void {
    this.subscribers.push(callback);
    
    // Retornar función para desuscribirse
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Notificar a suscriptores
  private notifySubscribers(notification: NotificationData): void {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error notificando suscriptor:', error);
      }
    });
  }

  // Manejar tap en notificación
  private handleNotificationTapped(notification: NotificationData): void {
    console.log('👆 Notificación tocada:', notification.title);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Aquí puedes agregar lógica de navegación
    switch (notification.type) {
      case NotificationType.FRI_REMINDER:
        console.log('🚀 Navegando a FRI...');
        break;
      case NotificationType.SYNC_COMPLETE:
        console.log('🔄 Mostrando estado de sincronización...');
        break;
      default:
        console.log('📱 Manejando notificación genérica');
    }
  }

  // Programar notificaciones por defecto
  private scheduleDefaultNotifications(): void {
    // Notificación de bienvenida (5 segundos)
    this.scheduleNotification({
      id: 'welcome',
      type: NotificationType.SYSTEM_UPDATE,
      title: '🎉 ¡Bienvenido al Sistema FRI!',
      body: 'Tu aplicación está lista para usar. Todas las funciones están disponibles.',
    }, 5000);

    // Recordatorio FRI (10 segundos)
    this.scheduleNotification({
      id: 'fri_reminder',
      type: NotificationType.FRI_REMINDER,
      title: '📋 Recordatorio FRI',
      body: 'No olvides completar tus reportes FRI pendientes',
    }, 10000);

    // Simulación de sincronización (15 segundos)
    this.scheduleNotification({
      id: 'sync_demo',
      type: NotificationType.SYNC_COMPLETE,
      title: '🔄 Demostración de Sync',
      body: 'Esta es una demo de sincronización en segundo plano',
    }, 15000);
  }

  // Simular sincronización en segundo plano
  async triggerBackgroundSync(): Promise<void> {
    console.log('🔄 Iniciando sincronización en segundo plano...');
    
    try {
      // Notificar inicio
      await this.sendLocalNotification({
        id: 'sync_start_' + Date.now(),
        type: NotificationType.SYSTEM_UPDATE,
        title: '🔄 Sincronización Iniciada',
        body: 'Sincronizando datos en segundo plano...',
      });

      // Simular proceso de sincronización
      await this.simulateSyncProcess();

      // Notificar éxito
      await this.sendLocalNotification({
        id: 'sync_success_' + Date.now(),
        type: NotificationType.SYNC_COMPLETE,
        title: '✅ Sincronización Completa',
        body: 'Todos tus datos están actualizados',
      });

      console.log('✅ Sincronización completada exitosamente');
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      
      // Notificar error
      await this.sendLocalNotification({
        id: 'sync_error_' + Date.now(),
        type: NotificationType.SYSTEM_UPDATE,
        title: '⚠️ Error de Sincronización',
        body: 'No se pudieron sincronizar algunos datos. Revisa tu conexión.',
      });
    }
  }

  // Simular proceso de sincronización
  private async simulateSyncProcess(): Promise<void> {
    console.log('📋 Sincronizando datos FRI...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('👤 Sincronizando preferencias...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('📤 Sincronizando uploads...');
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Obtener estadísticas
  async getNotificationStats(): Promise<any> {
    return {
      scheduled: this.notificationQueue.length,
      pushToken: 'mock_token_' + Date.now(),
      permissionsGranted: this.isInitialized,
      lastSync: new Date().toISOString(),
      queueLength: this.notificationQueue.length,
      subscribers: this.subscribers.length,
    };
  }

  // Limpiar notificaciones
  async clearAllNotifications(): Promise<void> {
    this.notificationQueue = [];
    console.log('🧹 Cola de notificaciones limpiada');
  }

  // Enviar notificación de prueba
  async sendTestNotification(): Promise<void> {
    await this.sendLocalNotification({
      id: 'test_' + Date.now(),
      type: NotificationType.SYSTEM_UPDATE,
      title: '🧪 Notificación de Prueba',
      body: 'Esta es una notificación de prueba del sistema FRI ANM simplificado',
      data: { test: true, timestamp: Date.now() }
    });
  }

  // Programar recordatorio de deadline
  async scheduleDeadlineReminder(deadline: Date, friTitle: string): Promise<void> {
    const now = new Date();
    const timeUntilDeadline = deadline.getTime() - now.getTime();
    const daysUntilDeadline = Math.ceil(timeUntilDeadline / (1000 * 60 * 60 * 24));

    // Para demo, programar en 3 segundos
    await this.scheduleNotification({
      id: 'deadline_reminder_' + Date.now(),
      type: NotificationType.DEADLINE_WARNING,
      title: '⏰ Deadline Próximo',
      body: `El FRI "${friTitle}" vence en ${daysUntilDeadline} días`,
      data: { friTitle, deadline: deadline.toISOString() }
    }, 3000);

    console.log(`⏰ Recordatorio programado para FRI: ${friTitle}`);
  }

  // Obtener historial de notificaciones
  getNotificationHistory(): NotificationData[] {
    return [...this.notificationQueue];
  }

  // Simular diferentes tipos de notificaciones para demo
  async demoAllNotificationTypes(): Promise<void> {
    const notifications = [
      {
        id: 'demo_fri',
        type: NotificationType.FRI_REMINDER,
        title: '📋 Demo: Recordatorio FRI',
        body: 'Tienes 2 FRI pendientes de completar',
      },
      {
        id: 'demo_deadline',
        type: NotificationType.DEADLINE_WARNING,
        title: '⏰ Demo: Deadline Próximo',
        body: 'Tu FRI vence en 3 días',
      },
      {
        id: 'demo_approval',
        type: NotificationType.APPROVAL_STATUS,
        title: '✅ Demo: FRI Aprobado',
        body: 'Tu FRI de enero ha sido aprobado por la ANM',
      },
      {
        id: 'demo_sync',
        type: NotificationType.SYNC_COMPLETE,
        title: '🔄 Demo: Sincronización',
        body: 'Datos sincronizados exitosamente',
      },
    ] as NotificationData[];

    // Enviar cada notificación con delay
    for (let i = 0; i < notifications.length; i++) {
      setTimeout(() => {
        this.sendLocalNotification(notifications[i]);
      }, (i + 1) * 2000);
    }
  }
}

// Exportar instancia singleton
export const notificationService = SimpleNotificationService.getInstance();