import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Plus
} from 'lucide-react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface DashboardStats {
  friRegistrados: number;
  friCrecimiento: number;
  usuariosActivos: number;
  usuariosCrecimiento: number;
  reportesGenerados: number;
  reportesCrecimiento: number;
  cumplimiento: number;
}

interface RecentActivity {
  id: string;
  type: 'create' | 'update' | 'report' | 'approval';
  user: string;
  action: string;
  time: string;
  status: 'success' | 'pending' | 'warning';
}

// ============================================================================
// DATOS DE EJEMPLO
// ============================================================================

const mockStats: DashboardStats = {
  friRegistrados: 1247,
  friCrecimiento: 12.5,
  usuariosActivos: 156,
  usuariosCrecimiento: 8.3,
  reportesGenerados: 89,
  reportesCrecimiento: 15.2,
  cumplimiento: 94.2
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'create',
    user: 'María González',
    action: 'Creó FRI de Producción - Julio 2024',
    time: 'Hace 5 minutos',
    status: 'success'
  },
  {
    id: '2',
    type: 'report',
    user: 'Carlos Ruiz',
    action: 'Generó reporte mensual de regalías',
    time: 'Hace 15 minutos',
    status: 'success'
  },
  {
    id: '3',
    type: 'approval',
    user: 'Ana Patricia',
    action: 'Aprobó FRI de Inventarios - Junio 2024',
    time: 'Hace 1 hora',
    status: 'success'
  },
  {
    id: '4',
    type: 'update',
    user: 'Jorge Mendoza',
    action: 'Actualizó datos de maquinaria',
    time: 'Hace 2 horas',
    status: 'pending'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ImprovedDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'update':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'warning':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header mejorado */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard ANM FRI</h1>
                <p className="text-gray-600 font-medium">Sistema de Gestión de Formatos de Reportes de Información</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Actualizado en tiempo real</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {currentTime.toLocaleDateString('es-CO', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-xs text-gray-500">
                {currentTime.toLocaleTimeString('es-CO')}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 transform hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principales mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* FRI Registrados */}
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">FRI Registrados</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{mockStats.friRegistrados.toLocaleString()}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      +{mockStats.friCrecimiento}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usuarios Activos */}
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Usuarios Activos</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{mockStats.usuariosActivos}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      +{mockStats.usuariosCrecimiento}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reportes Generados */}
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Reportes Generados</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{mockStats.reportesGenerados}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      +{mockStats.reportesCrecimiento}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cumplimiento */}
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Cumplimiento</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{mockStats.cumplimiento}%</p>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${mockStats.cumplimiento}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Resolución 371/2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección principal con dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actividad reciente */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>Ver todo</span>
              </button>
            </div>

            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.user}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status === 'success' ? 'Completado' : 
                         activity.status === 'pending' ? 'Pendiente' : 'Advertencia'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{activity.time}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de acciones rápidas */}
        <div className="space-y-6">
          {/* Acciones rápidas */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Acciones Rápidas</span>
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-left">
                <Plus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Crear nuevo FRI</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-left">
                <Download className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Generar reporte</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-left">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Ver analytics</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 text-left">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Gestionar usuarios</span>
              </button>
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <span>Estado del Sistema</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Backend</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de Datos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600">Conectada</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Respaldo</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs font-medium text-yellow-600">Programado</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sincronización</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600">Activa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer mejorado */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
            <div className="mb-2 md:mb-0">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Sistema ANM FRI</span> - 
                Resolución 371/2024 | 
                <span className="font-medium"> v2.0.1</span>
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end space-x-4 text-xs text-gray-500">
              <span>Desarrollado por CTGlobal</span>
              <span>•</span>
              <span>Universidad Distrital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedDashboard;