// ================================
// 📁 controllers/notificationController.js - SISTEMA DE NOTIFICACIONES
// ================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURACIÓN DEL SISTEMA DE NOTIFICACIONES
// =============================================================================

const NOTIFICATION_CONFIG = {
  types: {
    INFO: { priority: 1, icon: 'ℹ️', color: 'blue' },
    WARNING: { priority: 2, icon: '⚠️', color: 'yellow' },
    ERROR: { priority: 3, icon: '❌', color: 'red' },
    SUCCESS: { priority: 1, icon: '✅', color: 'green' },
    SYSTEM: { priority: 2, icon: '🔧', color: 'gray' },
    COMPLIANCE: { priority: 3, icon: '📋', color: 'purple' },
    BACKUP: { priority: 2, icon: '📦', color: 'orange' }
  },
  channels: ['in_app', 'email', 'system_log'],
  retention_days: 30,
  max_notifications_per_user: 100
};

// =============================================================================
// CONTROLADOR PRINCIPAL DE NOTIFICACIONES
// =============================================================================

class NotificationController {

  // 📨 CREAR NUEVA NOTIFICACIÓN
  static async createNotification(req, res) {
    try {
      const {
        title,
        message,
        type = 'INFO',
        target_users = [],
        target_roles = [],
        action_url,
        expires_at,
        send_email = false
      } = req.body;

      const createdBy = req.user.userId;
      const senderRole = req.user.rol;

      // Validaciones básicas
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Título y mensaje son requeridos',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      if (!NOTIFICATION_CONFIG.types[type]) {
        return res.status(400).json({
          success: false,
          message: `Tipo de notificación no válido: ${type}`,
          valid_types: Object.keys(NOTIFICATION_CONFIG.types)
        });
      }

      console.log(`📨 Creando notificación "${title}" por: ${req.user.email}`);

      // Determinar usuarios objetivo
      let targetUserIds = [];

      if (target_users.length > 0) {
        targetUserIds = target_users;
      } else if (target_roles.length > 0) {
        // Obtener usuarios por roles
        const users = await prisma.usuario.findMany({
          where: {
            rol: { in: target_roles },
            activo: true
          },
          select: { id: true }
        });
        targetUserIds = users.map(u => u.id);
      } else {
        // Si no se especifican usuarios, enviar a todos los activos
        const allUsers = await prisma.usuario.findMany({
          where: { activo: true },
          select: { id: true }
        });
        targetUserIds = allUsers.map(u => u.id);
      }

      const notificationData = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        message,
        type,
        created_by: createdBy,
        action_url,
        expires_at: expires_at ? new Date(expires_at) : null,
        created_at: new Date(),
        metadata: {
          sender_role: senderRole,
          target_count: targetUserIds.length,
          channels: send_email ? ['in_app', 'email'] : ['in_app']
        }
      };

      // Simular creación de notificaciones (en implementación real se guardarían en BD)
      const createdNotifications = [];

      for (const userId of targetUserIds) {
        const userNotification = {
          ...notificationData,
          user_id: userId,
          read: false,
          read_at: null
        };
        
        createdNotifications.push(userNotification);
        
        // En implementación real:
        // await prisma.notification.create({ data: userNotification });
      }

      // Envío por email (simulado)
      if (send_email) {
        await NotificationController.sendEmailNotifications(createdNotifications);
      }

      // Log del sistema
      console.log(`✅ Notificación creada y enviada a ${targetUserIds.length} usuarios`);

      res.status(201).json({
        success: true,
        message: '📨 Notificación creada y enviada exitosamente',
        data: {
          notification_id: notificationData.id,
          title: notificationData.title,
          type: notificationData.type,
          recipients: targetUserIds.length,
          channels: notificationData.metadata.channels,
          created_at: notificationData.created_at
        }
      });

    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando notificación',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📬 OBTENER NOTIFICACIONES DEL USUARIO
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const { 
        page = 1, 
        limit = 20, 
        unread_only = false, 
        type,
        start_date,
        end_date 
      } = req.query;

      console.log(`📬 Obteniendo notificaciones para usuario: ${req.user.email}`);

      // Simulación de datos de notificaciones (en implementación real vendría de BD)
      const mockNotifications = await NotificationController.getMockNotifications(
        userId, 
        { page, limit, unread_only, type, start_date, end_date }
      );

      const totalNotifications = mockNotifications.total;
      const notifications = mockNotifications.data;

      // Estadísticas de notificaciones
      const stats = {
        total: totalNotifications,
        unread: notifications.filter(n => !n.read).length,
        by_type: notifications.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        }, {}),
        today: notifications.filter(n => {
          const today = new Date().toDateString();
          return new Date(n.created_at).toDateString() === today;
        }).length
      };

      res.json({
        success: true,
        message: '📬 Notificaciones del usuario obtenidas',
        data: {
          notifications,
          stats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalNotifications,
            total_pages: Math.ceil(totalNotifications / limit),
            has_next: page * limit < totalNotifications
          },
          user: {
            id: userId,
            email: req.user.email
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo notificaciones del usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ✅ MARCAR NOTIFICACIÓN COMO LEÍDA
  static async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      console.log(`✅ Marcando notificación ${notificationId} como leída para: ${req.user.email}`);

      // En implementación real:
      // const notification = await prisma.notification.findFirst({
      //   where: { id: notificationId, user_id: userId }
      // });

      // Simulación
      const mockUpdate = {
        id: notificationId,
        user_id: userId,
        read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      res.json({
        success: true,
        message: '✅ Notificación marcada como leída',
        data: mockUpdate
      });

    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando notificación',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📭 MARCAR TODAS COMO LEÍDAS
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;

      console.log(`📭 Marcando todas las notificaciones como leídas para: ${req.user.email}`);

      // En implementación real:
      // const result = await prisma.notification.updateMany({
      //   where: { user_id: userId, read: false },
      //   data: { read: true, read_at: new Date() }
      // });

      const mockResult = {
        updated_count: Math.floor(Math.random() * 10) + 1, // Simulación
        updated_at: new Date().toISOString()
      };

      res.json({
        success: true,
        message: '📭 Todas las notificaciones marcadas como leídas',
        data: {
          user_id: userId,
          notifications_updated: mockResult.updated_count,
          updated_at: mockResult.updated_at
        }
      });

    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando notificaciones',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 🔔 SISTEMA DE ALERTAS AUTOMÁTICAS
  static async checkSystemAlerts(req, res) {
    try {
      const userRole = req.user.rol;

      // Solo ADMIN puede ejecutar check de alertas
      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden verificar alertas del sistema',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      console.log(`🔔 Verificando alertas del sistema por: ${req.user.email}`);

      const alerts = [];
      const systemStatus = await NotificationController.checkSystemStatus();

      // Alertas de rendimiento
      if (systemStatus.memory_usage > 80) {
        alerts.push({
          type: 'WARNING',
          title: 'Alto uso de memoria',
          message: `El sistema está usando ${systemStatus.memory_usage}% de la memoria disponible`,
          priority: 2,
          auto_resolve: false
        });
      }

      // Alertas de base de datos
      if (!systemStatus.database_connected) {
        alerts.push({
          type: 'ERROR',
          title: 'Error de conexión a base de datos',
          message: 'No se pudo conectar a la base de datos PostgreSQL',
          priority: 3,
          auto_resolve: false
        });
      }

      // Alertas de cumplimiento
      const complianceCheck = await NotificationController.checkCompliance();
      if (complianceCheck.missing_reports > 0) {
        alerts.push({
          type: 'COMPLIANCE',
          title: 'Reportes FRI faltantes',
          message: `Hay ${complianceCheck.missing_reports} reportes FRI pendientes de este mes`,
          priority: 2,
          auto_resolve: true
        });
      }

      // Alertas de backup
      const lastBackup = await NotificationController.getLastBackupInfo();
      const daysSinceBackup = Math.floor((new Date() - new Date(lastBackup.date)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceBackup > 7) {
        alerts.push({
          type: 'BACKUP',
          title: 'Backup requerido',
          message: `El último backup fue hace ${daysSinceBackup} días. Se recomienda crear un backup`,
          priority: 2,
          auto_resolve: true
        });
      }

      // Crear notificaciones automáticas para alertas críticas
      const criticalAlerts = alerts.filter(alert => alert.priority >= 3);
      for (const alert of criticalAlerts) {
        await NotificationController.createSystemAlert(alert);
      }

      res.json({
        success: true,
        message: `🔔 Verificación de alertas completada - ${alerts.length} alertas encontradas`,
        data: {
          total_alerts: alerts.length,
          critical_alerts: criticalAlerts.length,
          alerts: alerts.map(alert => ({
            ...alert,
            created_at: new Date().toISOString(),
            alert_id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
          })),
          system_status: systemStatus,
          next_check: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
        }
      });

    } catch (error) {
      console.error('❌ Error verificando alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando alertas del sistema',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📊 ESTADÍSTICAS DE NOTIFICACIONES
  static async getNotificationStats(req, res) {
    try {
      const userRole = req.user.rol;
      const { period = '7d' } = req.query;

      console.log(`📊 Obteniendo estadísticas de notificaciones para: ${req.user.email}`);

      // Simulación de estadísticas
      const stats = {
        period,
        generated_at: new Date().toISOString(),
        total_notifications: 247,
        by_type: {
          INFO: 89,
          WARNING: 45,
          ERROR: 12,
          SUCCESS: 67,
          SYSTEM: 23,
          COMPLIANCE: 8,
          BACKUP: 3
        },
        by_status: {
          read: 189,
          unread: 58
        },
        engagement: {
          read_rate: 76.5,
          avg_time_to_read: '2.3 hours',
          action_click_rate: 34.2
        },
        trends: {
          daily_average: 35.3,
          peak_hour: '09:00',
          most_active_day: 'Tuesday'
        }
      };

      // Solo ADMIN puede ver estadísticas globales
      if (userRole !== 'ADMIN') {
        stats.note = 'Estadísticas limitadas para usuarios no administradores';
        stats.total_notifications = Math.floor(stats.total_notifications * 0.1);
      }

      res.json({
        success: true,
        message: '📊 Estadísticas de notificaciones obtenidas',
        data: stats
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de notificaciones',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // =============================================================================
  // MÉTODOS AUXILIARES
  // =============================================================================

  static async getMockNotifications(userId, filters) {
    // Simulación de notificaciones para demo
    const mockNotifications = [
      {
        id: 'notif_001',
        title: '✅ Backup completado exitosamente',
        message: 'El backup automático del sistema se completó exitosamente con 1,247 registros.',
        type: 'SUCCESS',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        read: false,
        action_url: '/api/backup/list'
      },
      {
        id: 'notif_002', 
        title: '⚠️ Recordatorio: Reporte mensual pendiente',
        message: 'Tienes reportes FRI pendientes de enviar para este mes. Fecha límite: 30 de julio.',
        type: 'WARNING',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
        read: false,
        action_url: '/api/fri-complete/dashboard'
      },
      {
        id: 'notif_003',
        title: 'ℹ️ Nueva funcionalidad disponible',
        message: 'El sistema de exportación avanzada ya está disponible. Exporta tus datos en múltiples formatos.',
        type: 'INFO',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
        read: true,
        action_url: '/api/fri-complete/reports/export/json'
      },
      {
        id: 'notif_004',
        title: '📋 Actualización de cumplimiento',
        message: 'Tu nivel de cumplimiento de la Resolución 371/2024 es del 95%. ¡Excelente trabajo!',
        type: 'COMPLIANCE',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
        read: true
      },
      {
        id: 'notif_005',
        title: '🔧 Mantenimiento programado',
        message: 'Mantenimiento del sistema programado para el domingo 28 de julio a las 2:00 AM.',
        type: 'SYSTEM',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
        read: true
      }
    ];

    // Aplicar filtros básicos
    let filtered = mockNotifications;

    if (filters.unread_only === 'true') {
      filtered = filtered.filter(n => !n.read);
    }

    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const start = (page - 1) * limit;

    return {
      total: filtered.length,
      data: filtered.slice(start, start + limit)
    };
  }

  static async checkSystemStatus() {
    const memoryUsage = process.memoryUsage();
    const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const percentage = Math.round((usedMB / totalMB) * 100);

    return {
      uptime: Math.floor(process.uptime()),
      memory_usage: percentage,
      memory_mb: `${usedMB}/${totalMB} MB`,
      database_connected: true, // Simulación
      api_response_time: '85ms',
      active_users: 12, // Simulación
      error_rate: 0.2
    };
  }

  static async checkCompliance() {
    return {
      missing_reports: Math.floor(Math.random() * 5), // Simulación
      overdue_submissions: 2,
      compliance_score: 95.5,
      next_deadline: '2025-07-30'
    };
  }

  static async getLastBackupInfo() {
    return {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
      size: '45.2 MB',
      records: 1247,
      status: 'completed'
    };
  }

  static async createSystemAlert(alert) {
    console.log(`🚨 Alerta automática creada: ${alert.title}`);
    // En implementación real se crearía la notificación en BD
    return {
      alert_id: `alert_${Date.now()}`,
      created: true,
      sent_to_admins: true
    };
  }

  static async sendEmailNotifications(notifications) {
    console.log(`📧 Simulando envío de ${notifications.length} emails`);
    // En implementación real se integraría con servicio de email (SendGrid, etc.)
    return {
      sent: notifications.length,
      failed: 0,
      service: 'simulated'
    };
  }
}

module.exports = NotificationController;