// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Alert,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Storage,
  Warning,
  CheckCircle,
  Schedule,
  BarChart,
  PieChart
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const mockActivity: RecentActivity[] = [
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
  ];

  // ============================================================================
  // 🔄 EFECTOS Y CARGA DE DATOS
  // ============================================================================

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // En producción, aquí harías las llamadas reales a la API
        setStats({
          totalFRI: 156,
          completedThisMonth: 23,
          pendingReports: 7,
          systemHealth: 98
        });
        
        setRecentActivity(mockActivity);
        setError(null);
        
      } catch (err) {
        setError('Error cargando datos del dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // ============================================================================
  // 🎨 FUNCIONES DE RENDERIZADO
  // ============================================================================

  const renderStatCard = (stat: StatCard, index: number) => (
    <Grid item xs={12} sm={6} md={3} key={index}>
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
    </Grid>
  );

  const renderLoadingSkeleton = () => (
    <Grid item xs={12} sm={6} md={3}>
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
    </Grid>
  );

  // ============================================================================
  // 🖼️ RENDERIZADO PRINCIPAL
  // ============================================================================

  if (error) {
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
      {/* 👤 Saludo al usuario */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ¡Bienvenido, {user?.nombre || 'Usuario'}! 👋
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Panel de control - Sistema ANM FRI
        </Typography>
      </Box>

      {/* 📊 Tarjetas de estadísticas */}
      <Grid container spacing={3}>
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
      </Grid>

      {/* 📈 Sección de gráficos */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
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
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <BarChart sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2">
                    Generar Reporte
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
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
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 📋 Tabla de estado del sistema */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
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
                      ✅ Todos los servicios están operativos. Última actualización: {new Date().toLocaleString()}
                    </Typography>
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;