import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Database,
  Mail,
  Server,
  Clock,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  HardDrive,
  Zap,
  Globe,
  Key,
  Bell,
  Calendar,
  Archive,
  Trash2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

// Importar tipos
import { Settings as SettingsType, BackupJob, MaintenanceTask, SystemService } from '../../types/admin';

interface PasswordVisibility {
  [key: string]: boolean;
}

const SystemConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isPasswordVisible, setIsPasswordVisible] = useState<PasswordVisibility>({});
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [settings, setSettings] = useState<SettingsType>({
    system: {
      siteName: 'Sistema ANM FRI',
      siteDescription: 'Plataforma Integral de Gestión de Formatos de Reportes de Información',
      timezone: 'America/Bogota',
      language: 'es-CO',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      maxFileSize: 50,
      sessionTimeout: 30
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      loginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false,
      ipWhitelist: '',
      sslEnabled: true,
      corsOrigins: 'https://anm.gov.co, https://admin.anm.gov.co'
    },
    database: {
      host: 'localhost',
      port: 5432,
      database: 'anm_fri_db',
      username: 'anm_user',
      backupFrequency: 'daily',
      backupRetention: 30,
      maintenanceWindow: '02:00'
    },
    email: {
      provider: 'smtp',
      host: 'smtp.anm.gov.co',
      port: 587,
      security: 'tls',
      username: 'sistema@anm.gov.co',
      password: '••••••••',
      fromName: 'Sistema ANM FRI',
      fromEmail: 'sistema@anm.gov.co'
    },
    notifications: {
      emailEnabled: true,
      systemAlerts: true,
      userNotifications: true,
      backupNotifications: true,
      errorNotifications: true,
      maintenanceNotifications: true
    }
  });

  const [backupSchedule, setBackupSchedule] = useState<BackupJob[]>([
    {
      id: 1,
      name: 'Backup Completo Diario',
      type: 'full',
      schedule: '02:00',
      frequency: 'daily',
      retention: 30,
      lastRun: '2024-08-07 02:00:00',
      status: 'completed',
      size: '2.4 GB'
    },
    {
      id: 2,
      name: 'Backup Incremental',
      type: 'incremental',
      schedule: '06:00,12:00,18:00',
      frequency: 'multiple',
      retention: 7,
      lastRun: '2024-08-07 12:00:00',
      status: 'completed',
      size: '124 MB'
    },
    {
      id: 3,
      name: 'Backup Semanal Completo',
      type: 'full',
      schedule: '01:00',
      frequency: 'weekly',
      retention: 52,
      lastRun: '2024-08-04 01:00:00',
      status: 'completed',
      size: '2.1 GB'
    }
  ]);

  const systemServices: SystemService[] = [
    { id: 'api', name: 'API REST', status: 'running', uptime: '15d 8h 24m', cpu: '12%', memory: '256MB' },
    { id: 'database', name: 'PostgreSQL', status: 'running', uptime: '15d 8h 24m', cpu: '8%', memory: '512MB' },
    { id: 'nginx', name: 'Web Server', status: 'running', uptime: '15d 8h 24m', cpu: '2%', memory: '64MB' },
    { id: 'backup', name: 'Backup Service', status: 'running', uptime: '15d 8h 24m', cpu: '1%', memory: '32MB' },
    { id: 'scheduler', name: 'Task Scheduler', status: 'running', uptime: '15d 8h 24m', cpu: '1%', memory: '28MB' }
  ];

  const maintenanceTasks: MaintenanceTask[] = [
    {
      id: 1,
      name: 'Optimización de Base de Datos',
      description: 'Reindexación y análisis de tablas',
      lastRun: '2024-08-05 02:30:00',
      nextRun: '2024-08-12 02:30:00',
      frequency: 'weekly',
      status: 'scheduled'
    },
    {
      id: 2,
      name: 'Limpieza de Logs',
      description: 'Eliminación de logs antiguos (>30 días)',
      lastRun: '2024-08-07 03:00:00',
      nextRun: '2024-08-14 03:00:00',
      frequency: 'weekly',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Actualización de Estadísticas',
      description: 'Recálculo de estadísticas del sistema',
      lastRun: '2024-08-07 01:00:00',
      nextRun: '2024-08-08 01:00:00',
      frequency: 'daily',
      status: 'scheduled'
    },
    {
      id: 4,
      name: 'Verificación de Integridad',
      description: 'Verificación de archivos y checksums',
      lastRun: '2024-08-01 01:30:00',
      nextRun: '2024-09-01 01:30:00',
      frequency: 'monthly',
      status: 'scheduled'
    }
  ];

  const togglePasswordVisibility = (field: string): void => {
    setIsPasswordVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveSettings = (section: string): void => {
    console.log(`Guardando configuración de ${section}...`);
    // Aquí iría la lógica para guardar las configuraciones
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      running: '#10b981',
      stopped: '#ef4444',
      completed: '#10b981',
      scheduled: '#3b82f6',
      error: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string): React.ElementType => {
    const icons: Record<string, React.ElementType> = {
      running: Play,
      stopped: Pause,
      completed: CheckCircle,
      scheduled: Clock,
      error: AlertTriangle
    };
    return icons[status] || Clock;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
              Configuración del Sistema
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Sistema ANM FRI - Configuraciones globales y mantenimiento
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            background: maintenanceMode ? '#fef2f2' : '#f0f9ff',
            border: `1px solid ${maintenanceMode ? '#ef4444' : '#3b82f6'}`,
            borderRadius: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: maintenanceMode ? '#ef4444' : '#10b981'
            }}></div>
            <span style={{ fontSize: '14px', fontWeight: '500', color: maintenanceMode ? '#dc2626' : '#1e40af' }}>
              {maintenanceMode ? 'Modo Mantenimiento Activo' : 'Sistema Operacional'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
          {[
            { id: 'general', name: 'General', icon: Settings },
            { id: 'security', name: 'Seguridad', icon: Shield },
            { id: 'database', name: 'Base de Datos', icon: Database },
            { id: 'email', name: 'Email', icon: Mail },
            { id: 'backup', name: 'Respaldos', icon: Archive },
            { id: 'maintenance', name: 'Mantenimiento', icon: RefreshCw },
            { id: 'services', name: 'Servicios', icon: Server }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                  color: isActive ? '#3b82f6' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: 'fit-content'
                }}
              >
                <Icon style={{ width: '18px', height: '18px' }} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
              Configuración General
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Nombre del Sistema
                </div>
                <input
                  type="text"
                  value={settings.system.siteName}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, siteName: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Zona Horaria
                </div>
                <select
                  value={settings.system.timezone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, timezone: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="America/Bogota">América/Bogotá (COT)</option>
                  <option value="America/Lima">América/Lima (PET)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Idioma
                </div>
                <select
                  value={settings.system.language}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, language: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="es-CO">Español (Colombia)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Timeout de Sesión (minutos)
                </div>
                <input
                  type="number"
                  value={settings.system.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, sessionTimeout: parseInt(e.target.value) }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Descripción del Sistema
              </div>
              <textarea
                value={settings.system.siteDescription}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, siteDescription: e.target.value }
                }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => handleSaveSettings('general')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
              Configuración de Seguridad
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Longitud mínima de contraseña
                </div>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Intentos de login máximos
                </div>
                <input
                  type="number"
                  value={settings.security.loginAttempts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, loginAttempts: parseInt(e.target.value) }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Duración de bloqueo (minutos)
                </div>
                <input
                  type="number"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, lockoutDuration: parseInt(e.target.value) }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactorAuth: e.target.checked }
                    }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Autenticación de dos factores
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Requiere código adicional para iniciar sesión
                </p>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                CORS Origins Permitidos
              </div>
              <textarea
                value={settings.security.corsOrigins}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, corsOrigins: e.target.value }
                }))}
                rows={3}
                placeholder="https://anm.gov.co, https://admin.anm.gov.co"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => handleSaveSettings('security')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Programación de Respaldos
              </h3>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <Play style={{ width: '16px', height: '16px' }} />
                Ejecutar Backup Ahora
              </button>
            </div>

            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto auto auto',
                gap: '16px',
                padding: '16px 20px',
                background: '#f3f4f6',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                <div>Nombre</div>
                <div>Tipo</div>
                <div>Programación</div>
                <div>Última Ejecución</div>
                <div>Estado</div>
                <div>Acciones</div>
              </div>

              {backupSchedule.map(backup => {
                const StatusIcon = getStatusIcon(backup.status);
                return (
                  <div
                    key={backup.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto auto auto',
                      gap: '16px',
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {backup.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        Retención: {backup.retention} días • {backup.size}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        background: backup.type === 'full' ? '#dbeafe' : '#f3e8ff',
                        color: backup.type === 'full' ? '#1e40af' : '#7c3aed',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {backup.type === 'full' ? 'Completo' : 'Incremental'}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {backup.schedule} ({backup.frequency})
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(backup.lastRun).toLocaleString('es-CO')}
                    </div>
                    
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        background: getStatusColor(backup.status) + '15',
                        color: getStatusColor(backup.status),
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        <StatusIcon style={{ width: '12px', height: '12px' }} />
                        {backup.status === 'completed' ? 'Completado' : 
                         backup.status === 'scheduled' ? 'Programado' : backup.status}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        padding: '6px',
                        background: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}>
                        <Play style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                      </button>
                      <button style={{
                        padding: '6px',
                        background: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}>
                        <Download style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Maintenance Mode Toggle */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                  Modo de Mantenimiento
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Activa el modo de mantenimiento para realizar tareas de sistema
                </p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: maintenanceMode ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {maintenanceMode ? <Pause style={{ width: '16px', height: '16px' }} /> : <Play style={{ width: '16px', height: '16px' }} />}
                {maintenanceMode ? 'Desactivar Mantenimiento' : 'Activar Mantenimiento'}
              </button>
            </div>
          </div>

          {/* Maintenance Tasks */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
              Tareas de Mantenimiento Programadas
            </h3>

            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: '16px',
                padding: '16px 20px',
                background: '#f3f4f6',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                <div>Tarea</div>
                <div>Frecuencia</div>
                <div>Estado</div>
                <div>Acciones</div>
              </div>

              {maintenanceTasks.map(task => {
                const StatusIcon = getStatusIcon(task.status);
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto',
                      gap: '16px',
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {task.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                        {task.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                        <span>Última: {new Date(task.lastRun).toLocaleString('es-CO')}</span>
                        <span>Próxima: {new Date(task.nextRun).toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                      {task.frequency === 'daily' ? 'Diaria' : 
                       task.frequency === 'weekly' ? 'Semanal' : 
                       task.frequency === 'monthly' ? 'Mensual' : task.frequency}
                    </div>
                    
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        background: getStatusColor(task.status) + '15',
                        color: getStatusColor(task.status),
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        <StatusIcon style={{ width: '12px', height: '12px' }} />
                        {task.status === 'completed' ? 'Completada' : 
                         task.status === 'scheduled' ? 'Programada' : task.status}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        padding: '6px',
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}>
                        <Play style={{ width: '14px', height: '14px', color: '#0ea5e9' }} />
                      </button>
                      <button style={{
                        padding: '6px',
                        background: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}>
                        <Settings style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
            Estado de Servicios del Sistema
          </h3>

          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto auto auto',
              gap: '16px',
              padding: '16px 20px',
              background: '#f3f4f6',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              <div>Servicio</div>
              <div>Estado</div>
              <div>Tiempo Activo</div>
              <div>CPU</div>
              <div>Memoria</div>
              <div>Acciones</div>
            </div>

            {systemServices.map(service => (
              <div
                key={service.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto auto auto',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {service.name}
                </div>
                
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    background: getStatusColor(service.status) + '15',
                    color: getStatusColor(service.status),
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: getStatusColor(service.status)
                    }}></div>
                    {service.status === 'running' ? 'Ejecutándose' : 'Detenido'}
                  </div>
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {service.uptime}
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {service.cpu}
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {service.memory}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '6px',
                    background: service.status === 'running' ? '#fef2f2' : '#f0f9ff',
                    border: `1px solid ${service.status === 'running' ? '#ef4444' : '#3b82f6'}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    {service.status === 'running' ? 
                      <Pause style={{ width: '14px', height: '14px', color: '#ef4444' }} /> :
                      <Play style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                    }
                  </button>
                  <button style={{
                    padding: '6px',
                    background: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    <RotateCcw style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfiguration;