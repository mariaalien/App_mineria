import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Database,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Importar tipos
import { SystemLog, Alert } from '../../types/admin';

interface PerformanceData {
  time: string;
  cpu: number;
  memory: number;
  requests: number;
}

interface ApiStat {
  endpoint: string;
  requests: number;
  avgTime: number;
  errors: number;
}

interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
  };
  network: {
    upload: number;
    download: number;
    status: string;
  };
}

interface DatabaseStats {
  totalRecords: number;
  friRecords: number;
  userRecords: number;
  size: number;
  connections: number;
  queries: number;
}

const SystemMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Datos mock del sistema
  const systemStats: SystemStats = {
    cpu: { usage: 45.2, cores: 8, temperature: 62 },
    memory: { used: 12.4, total: 32, usage: 38.8 },
    disk: { used: 245, total: 500, usage: 49.0 },
    network: { upload: 1.2, download: 8.4, status: 'stable' }
  };

  const performanceData: PerformanceData[] = [
    { time: '00:00', cpu: 35, memory: 42, requests: 150 },
    { time: '04:00', cpu: 28, memory: 38, requests: 89 },
    { time: '08:00', cpu: 52, memory: 45, requests: 340 },
    { time: '12:00', cpu: 65, memory: 52, requests: 520 },
    { time: '16:00', cpu: 58, memory: 48, requests: 420 },
    { time: '20:00', cpu: 41, memory: 44, requests: 280 },
    { time: '23:59', cpu: 38, memory: 41, requests: 190 }
  ];

  const apiStats: ApiStat[] = [
    { endpoint: '/api/fri/create', requests: 1250, avgTime: 145, errors: 3 },
    { endpoint: '/api/fri/read', requests: 3480, avgTime: 89, errors: 1 },
    { endpoint: '/api/auth/login', requests: 892, avgTime: 234, errors: 12 },
    { endpoint: '/api/reports/generate', requests: 567, avgTime: 1200, errors: 0 },
    { endpoint: '/api/users/list', requests: 234, avgTime: 78, errors: 0 }
  ];

  const systemLogs: SystemLog[] = [
    {
      id: 1,
      timestamp: '2024-08-07 14:32:15',
      level: 'INFO',
      service: 'API',
      message: 'Usuario admin@anm.gov.co inició sesión exitosamente',
      ip: '192.168.1.105'
    },
    {
      id: 2,
      timestamp: '2024-08-07 14:31:42',
      level: 'SUCCESS',
      service: 'DATABASE',
      message: 'Backup automático completado exitosamente (234MB)',
      ip: 'localhost'
    },
    {
      id: 3,
      timestamp: '2024-08-07 14:30:18',
      level: 'WARNING',
      service: 'SYSTEM',
      message: 'Uso de memoria por encima del 80% (84.2%)',
      ip: 'localhost'
    },
    {
      id: 4,
      timestamp: '2024-08-07 14:28:55',
      level: 'ERROR',
      service: 'API',
      message: 'Falló conexión con servidor de correo para notificaciones',
      ip: 'smtp.anm.gov.co'
    },
    {
      id: 5,
      timestamp: '2024-08-07 14:27:31',
      level: 'INFO',
      service: 'FRI',
      message: 'FRI de producción creado por operador@anm.gov.co',
      ip: '192.168.1.142'
    },
    {
      id: 6,
      timestamp: '2024-08-07 14:25:12',
      level: 'SUCCESS',
      service: 'REPORTS',
      message: 'Reporte mensual generado para supervisor@anm.gov.co',
      ip: '192.168.1.108'
    }
  ];

  const alertsData: Alert[] = [
    {
      id: 1,
      type: 'warning',
      title: 'Uso alto de memoria',
      description: 'El servidor está usando 84.2% de la memoria RAM disponible',
      timestamp: '2024-08-07 14:30:00',
      resolved: false
    },
    {
      id: 2,
      type: 'error',
      title: 'Fallo en servidor de correo',
      description: 'No se pueden enviar notificaciones por email',
      timestamp: '2024-08-07 14:28:00',
      resolved: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Backup completado',
      description: 'Respaldo automático realizado exitosamente',
      timestamp: '2024-08-07 14:31:00',
      resolved: true
    }
  ];

  const databaseStats: DatabaseStats = {
    totalRecords: 45678,
    friRecords: 12345,
    userRecords: 89,
    size: 2.4,
    connections: 12,
    queries: 1567
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getLogLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      INFO: '#3b82f6',
      SUCCESS: '#10b981',
      WARNING: '#f59e0b',
      ERROR: '#ef4444'
    };
    return colors[level] || '#6b7280';
  };

  const getAlertTypeIcon = (type: string): React.ElementType => {
    const icons: Record<string, React.ElementType> = {
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle
    };
    return icons[type] || AlertTriangle;
  };

  const formatBytes = (bytes: number): string => {
    return `${bytes} GB`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const dashboardCards = [
    {
      title: 'CPU',
      value: `${systemStats.cpu.usage}%`,
      icon: Cpu,
      color: '#3b82f6',
      trend: -2.3,
      subtitle: `${systemStats.cpu.cores} cores • ${systemStats.cpu.temperature}°C`
    },
    {
      title: 'Memoria',
      value: `${systemStats.memory.usage}%`,
      icon: MemoryStick,
      color: '#10b981',
      trend: 1.8,
      subtitle: `${systemStats.memory.used}GB de ${systemStats.memory.total}GB`
    },
    {
      title: 'Disco',
      value: `${systemStats.disk.usage}%`,
      icon: HardDrive,
      color: '#f59e0b',
      trend: 0.5,
      subtitle: `${systemStats.disk.used}GB de ${systemStats.disk.total}GB`
    },
    {
      title: 'Red',
      value: '1.2MB/s',
      icon: Wifi,
      color: '#8b5cf6',
      trend: 12.4,
      subtitle: `↑${systemStats.network.upload}MB/s ↓${systemStats.network.download}MB/s`
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
              Monitor del Sistema
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Sistema ANM FRI - Estado en tiempo real • Última actualización: {formatTime(lastUpdate)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="1h">Última hora</option>
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
            <button
              onClick={() => setIsLoading(!isLoading)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { id: 'dashboard', name: 'Dashboard', icon: Activity },
            { id: 'performance', name: 'Rendimiento', icon: TrendingUp },
            { id: 'logs', name: 'Logs', icon: FileText },
            { id: 'alerts', name: 'Alertas', icon: AlertTriangle },
            { id: 'database', name: 'Base de Datos', icon: Database }
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
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon style={{ width: '18px', height: '18px' }} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* System Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {dashboardCards.map((card, index) => {
              const Icon = card.icon;
              const TrendIcon = card.trend >= 0 ? TrendingUp : TrendingDown;
              return (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: card.color + '15',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ width: '24px', height: '24px', color: card.color }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                      <TrendIcon style={{ 
                        width: '16px', 
                        height: '16px', 
                        color: card.trend >= 0 ? '#10b981' : '#ef4444' 
                      }} />
                      <span style={{ color: card.trend >= 0 ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                        {Math.abs(card.trend)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {card.value}
                    </h3>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 4px 0' }}>
                      {card.title}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
                API Endpoints más utilizados
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {apiStats.slice(0, 5).map((api, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: '0 0 4px 0' }}>
                        {api.endpoint}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        {api.requests} requests • {api.avgTime}ms promedio
                      </p>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: api.errors === 0 ? '#dcfce7' : '#fef2f2',
                      color: api.errors === 0 ? '#166534' : '#dc2626',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {api.errors} errores
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
                Estado de Servicios
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'API REST', status: 'online', uptime: '99.9%' },
                  { name: 'Base de Datos', status: 'online', uptime: '99.7%' },
                  { name: 'Sistema de Archivos', status: 'online', uptime: '100%' },
                  { name: 'Servidor de Correo', status: 'warning', uptime: '95.2%' },
                  { name: 'Sistema de Backup', status: 'online', uptime: '99.5%' }
                ].map((service, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: service.status === 'online' ? '#10b981' : '#f59e0b'
                      }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        {service.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {service.uptime} uptime
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Performance Charts */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
              Rendimiento del Sistema (Últimas 24 horas)
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} name="Memoria %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
              Requests por Hora
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.2}
                    name="Requests"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div>
          {/* Log Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '24px',
            alignItems: 'center'
          }}>
            <select style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <option value="all">Todos los niveles</option>
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
            <select style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <option value="all">Todos los servicios</option>
              <option value="API">API</option>
              <option value="DATABASE">DATABASE</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="FRI">FRI</option>
              <option value="REPORTS">REPORTS</option>
            </select>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#f9fafb',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              <Download style={{ width: '16px', height: '16px' }} />
              Exportar Logs
            </button>
          </div>

          {/* Logs Table */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto auto 1fr auto',
              gap: '16px',
              padding: '16px 24px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              <div>Timestamp</div>
              <div>Nivel</div>
              <div>Servicio</div>
              <div>Mensaje</div>
              <div>IP</div>
            </div>

            {systemLogs.map(log => (
              <div
                key={log.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto auto auto 1fr auto',
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {log.timestamp}
                </div>
                <div>
                  <span style={{
                    padding: '4px 8px',
                    background: getLogLevelColor(log.level) + '15',
                    color: getLogLevelColor(log.level),
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: 'monospace'
                  }}>
                    {log.level}
                  </span>
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  fontFamily: 'monospace'
                }}>
                  {log.service}
                </div>
                <div style={{ fontSize: '14px', color: '#1f2937' }}>
                  {log.message}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontFamily: 'monospace'
                }}>
                  {log.ip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {alertsData.map(alert => {
              const Icon = getAlertTypeIcon(alert.type);
              const colors: Record<string, { bg: string; border: string; text: string }> = {
                success: { bg: '#dcfce7', border: '#10b981', text: '#166534' },
                warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
                error: { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' }
              };
              const color = colors[alert.type as keyof typeof colors];

              return (
                <div
                  key={alert.id}
                  style={{
                    background: 'white',
                    border: `1px solid ${color.border}`,
                    borderLeft: `4px solid ${color.border}`,
                    borderRadius: '8px',
                    padding: '20px',
                    opacity: alert.resolved ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: color.bg,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon style={{ width: '20px', height: '20px', color: color.border }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {alert.title}
                          </h4>
                          {alert.resolved && (
                            <span style={{
                              padding: '2px 8px',
                              background: '#dcfce7',
                              color: '#166534',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              Resuelto
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 8px 0'
                        }}>
                          {alert.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {new Date(alert.timestamp).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        padding: '8px',
                        background: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}>
                        <Eye style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      </button>
                      {!alert.resolved && (
                        <button style={{
                          padding: '8px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}>
                          <CheckCircle style={{ width: '16px', height: '16px' }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Database Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Total Registros', value: databaseStats.totalRecords.toLocaleString(), icon: Database, color: '#3b82f6' },
              { title: 'Registros FRI', value: databaseStats.friRecords.toLocaleString(), icon: FileText, color: '#10b981' },
              { title: 'Usuarios', value: databaseStats.userRecords, icon: Users, color: '#f59e0b' },
              { title: 'Tamaño BD', value: `${databaseStats.size} GB`, icon: HardDrive, color: '#ef4444' },
              { title: 'Conexiones', value: databaseStats.connections, icon: Zap, color: '#8b5cf6' },
              { title: 'Queries/min', value: databaseStats.queries, icon: Activity, color: '#06b6d4' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: stat.color + '15',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto'
                  }}>
                    <Icon style={{ width: '24px', height: '24px', color: stat.color }} />
                  </div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {stat.value}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {stat.title}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Database Performance */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
              Estado de la Base de Datos
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                  Conexiones Activas
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { type: 'API Connections', count: 8, max: 50 },
                    { type: 'Admin Connections', count: 2, max: 10 },
                    { type: 'Background Tasks', count: 2, max: 5 }
                  ].map((conn, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#374151' }}>{conn.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '100px',
                          height: '6px',
                          background: '#f3f4f6',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(conn.count / conn.max) * 100}%`,
                            height: '100%',
                            background: '#3b82f6',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {conn.count}/{conn.max}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                  Últimas Operaciones
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { operation: 'INSERT FRI_PRODUCCION', time: '23ms', status: 'success' },
                    { operation: 'SELECT USER_PERMISSIONS', time: '15ms', status: 'success' },
                    { operation: 'UPDATE FRI_STATUS', time: '31ms', status: 'success' },
                    { operation: 'BACKUP OPERATION', time: '2.3s', status: 'success' }
                  ].map((op, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      background: '#f9fafb',
                      borderRadius: '6px'
                    }}>
                      <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>
                        {op.operation}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{op.time}</span>
                        <CheckCircle style={{ width: '12px', height: '12px', color: '#10b981' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitor;