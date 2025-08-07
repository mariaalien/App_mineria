// src/pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Alert,
  Skeleton,
  Chip,
  Button
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Storage,
  CheckCircle,
  Schedule,
  BarChart,
  PieChart,
  Refresh,
  CloudOff,
  Cloud
} from '@mui/icons-material';
// import { useAuth } from '../hooks/useAuth'; // Descomentar cuando esté listo
import apiService from '../services/api.service';

// ============================================================================
// 🔧 HOOK DE AUTENTICACIÓN TEMPORAL (hasta implementar AuthProvider)
// ============================================================================

const useAuthTemp = () => {
  const [user] = useState({
    id: '1',
    nombre: 'Usuario Demo',
    email: 'demo@anm.gov.co',
    rol: 'SUPERVISOR' as const,
    empresa: { id: '1', nombre: 'Demo Company', activa: true },
    permisos: ['FRI_READ', 'FRI_WRITE']
  });

  return {
    user,
    isAuthenticated: !!user,
    loading: false,
    isOnline: navigator.onLine,
    apiConnected: false
  };
};

// ============================================================================
// 🎯 INTERFACES TYPESCRIPT
// ============================================================================

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface DashboardStats {
  totalFRI: number;
  completedThisMonth: number;
  pendingReports: number;
  systemHealth: number;
  recentActivity?: RecentActivity[];
}

interface RecentActivity {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  type: 'success' | 'warning' | 'info';
}

// ============================================================================
// 🏠 COMPONENTE DASHBOARD PRINCIPAL
// ============================================================================

const Dashboard: React.FC = () => {
  // ✅ TODOS LOS HOOKS AL INICIO - NUNCA CONDICIONALES
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ Hook de autenticación SIEMPRE llamado
  const authData = useAuthTemp(); // Cambiar por useAuth() cuando esté listo

  // ✅ Valores por defecto si no hay datos de auth
  const user = authData?.user || {
    id: '1',
    nombre: 'Usuario Demo',
    email: 'demo@anm.gov.co',
    rol: 'SUPERVISOR' as const,
    empresa: { id: '1', nombre: 'Demo Company', activa: true },
    permisos: ['FRI_READ', 'FRI_WRITE']
  };

  const isOnline = authData?.isOnline ?? true;
  const apiConnected = authData?.apiConnected ?? false;

  // ============================================================================
  // 📊 DATOS MOCK PARA DESARROLLO
  // ============================================================================

  const statCards: StatCard[] = [
    {
      title: 'FRI Registrados',
      value: stats?.totalFRI || 156,
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Completados Este Mes',
      value: stats?.completedThisMonth || 23,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Reportes Pendientes',
      value: stats?.pendingReports || 7,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      change: '-3%',
      trend: 'down'
    },
    {
      title: 'Sistema Operativo',
      value: `${stats?.systemHealth || 98}%`,
      icon: <Storage sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      change: 'Estable',
      trend: 'neutral'
    }
  ];

  // ============================================================================
  // 🔄 CARGA DE DATOS (useCallback para evitar warning)
  // ============================================================================

  const loadDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // Intentar cargar datos reales del backend
      const dashboardStats = await apiService.getDashboardStats();
      
      setStats({
        totalFRI: dashboardStats.totalFRI,
        completedThisMonth: dashboardStats.completedThisMonth,
        pendingReports: dashboardStats.pendingReports,
        systemHealth: dashboardStats.systemHealth
      });
      
      setRecentActivity(dashboardStats.recentActivity || []);
      
    } catch (err: any) {
      console.warn('⚠️ Error cargando datos del backend, usando datos mock:', err.message);
      
      // Usar datos mock como fallback
      setStats({
        totalFRI: 156,
        completedThisMonth: 23,
        pendingReports: 7,
        systemHealth: 98
      });
      
      setRecentActivity([
        {
          id: '1',
          action: 'FRI-001 Producción completado',
          timestamp: '2025-08-06 10:30',
          user: user?.nombre || 'Usuario',
          type: 'success'
        },
        {
          id: '2',
          action: 'Reporte mensual generado',
          timestamp: '2025-08-06 09:15',
          user: user?.nombre || 'Usuario',
          type: 'info'
        },
        {
          id: '3',
          action: 'Alerta: Vencimiento próximo FRI-045',
          timestamp: '2025-08-06 08:45',
          user: 'Sistema',
          type: 'warning'
        }
      ]);
      
      if (!apiConnected) {
        setError('Modo offline: Mostrando datos de ejemplo');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [apiConnected, user?.nombre]); // Dependencias explícitas

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  useEffect(() => {
    loadDashboardData();
    
    // Actualizar cada 30 segundos si está conectado a la API
    const interval = setInterval(() => {
      if (apiConnected) {
        loadDashboardData(false); // Sin loading spinner
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboardData, apiConnected]); // Dependencias completas

  // ============================================================================
  // 🎨 FUNCIONES DE RENDERIZADO
  // ============================================================================

  const renderStatCard = (stat: StatCard, index: number) => (
    <Box key={index} sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
      <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: stat.color, 
                width: 56, 
                height: 56,
                mr: 2 
              }}
            >
              {stat.icon}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
            </Box>
          </Box>
          
          {stat.change && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp 
                sx={{ 
                  fontSize: 16, 
                  mr: 0.5,
                  color: stat.trend === 'up' ? 'success.main' : 
                         stat.trend === 'down' ? 'warning.main' : 'info.main'
                }} 
              />
              <Typography 
                variant="caption" 
                color={stat.trend === 'up' ? 'success.main' : 
                       stat.trend === 'down' ? 'warning.main' : 'info.main'}
              >
                {stat.change}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderLoadingSkeleton = () => (
    <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          </Box>
          <Skeleton variant="text" width="40%" height={16} />
        </CardContent>
      </Card>
    </Box>
  );

  // ============================================================================
  // 🖼️ RENDERIZADO PRINCIPAL
  // ============================================================================

  if (error && error.includes('cargando datos del dashboard')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 👤 Header con info de usuario y estado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ¡Bienvenido, {user?.nombre || 'Usuario'}! 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Panel de control - Sistema ANM FRI
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={isOnline ? <Cloud /> : <CloudOff />}
            label={isOnline ? "En línea" : "Sin conexión"}
            color={isOnline ? "success" : "error"}
            size="small"
          />
          <Chip
            label={apiConnected ? "API conectada" : "Modo offline"}
            color={apiConnected ? "success" : "warning"}
            size="small"
          />
          <Button
            startIcon={<Refresh />}
            onClick={() => loadDashboardData()}
            disabled={loading}
            size="small"
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* ⚠️ Alertas de estado */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!apiConnected && (
        <Alert severity="info" sx={{ mb: 3 }}>
          🔌 No hay conexión con el backend. Los datos mostrados son de ejemplo.
        </Alert>
      )}

      {/* 📊 Tarjetas de estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {loading ? (
          // Mostrar skeletons mientras carga
          Array.from({ length: 4 }).map((_, index) => (
            <React.Fragment key={index}>
              {renderLoadingSkeleton()}
            </React.Fragment>
          ))
        ) : (
          // Mostrar datos reales
          statCards.map((stat, index) => renderStatCard(stat, index))
        )}
      </Box>

      {/* 📈 Sección de gráficos */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ flex: 2 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              
              {loading ? (
                <Box>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Skeleton variant="text" width="100%" height={24} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  {recentActivity.map((activity) => (
                    <Box key={activity.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                      <Typography variant="body1">
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.timestamp} - {activity.user}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <BarChart sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2">
                    Generar Reporte
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Assessment sx={{ mr: 2, color: 'success.main' }} />
                  <Typography variant="body2">
                    Nuevo FRI
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <PieChart sx={{ mr: 2, color: 'warning.main' }} />
                  <Typography variant="body2">
                    Ver Estadísticas
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 📋 Tabla de estado del sistema */}
      <Box sx={{ mb: 3 }}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estado del Sistema
            </Typography>
            
            {loading ? (
              <Box>
                <Skeleton variant="text" width="100%" height={32} />
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Rendimiento del Sistema: {stats?.systemHealth || 98}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats?.systemHealth || 98} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    ✅ Todos los servicios están operativos. 
                    <br />
                    📊 Última actualización: {new Date().toLocaleString()}
                    <br />
                    🔗 Estado API: {apiConnected ? 'Conectada' : 'Desconectada'}
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;