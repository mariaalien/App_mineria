import React, { useState, useEffect, useCallback } from 'react';

const AdminVerificationDashboard = () => {
  const [stats, setStats] = useState({
    verification: { total: 0, successful: 0, success_rate: 0 },
    users: { total: 0, verified: 0, verification_rate: 0 },
    activity: {},
    trends: { daily: 0, weekly: 0, monthly: 0 }
  });
  
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    verified: '',
    dateRange: '7d'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [pagination, setPagination] = useState({ 
    total: 0, 
    current: 1, 
    count: 0,
    pageSize: 10 
  });

  // Función para obtener estadísticas
  const fetchStats = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockStats = {
        verification: {
          total: 247,
          successful: 189,
          success_rate: 77,
          pending: 31,
          failed: 27
        },
        users: {
          total: 142,
          verified: 89,
          verification_rate: 63,
          active: 134,
          inactive: 8
        },
        activity: {
          'USER_VERIFICATION': 45,
          'LOGIN': 234,
          'CREATE_FRI': 67,
          'UPDATE_FRI': 89,
          'ADMIN_ACTION': 12,
          'FAILED_LOGIN': 8
        },
        trends: {
          daily: 12,
          weekly: 78,
          monthly: 247
        }
      };
      
      setStats(mockStats);
      setError(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error cargando estadísticas');
    }
  }, []);

  // Función para obtener usuarios
  const fetchUsers = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockUsers = [
        {
          id: '1',
          nombre: 'Administrador Sistema',
          email: 'admin@anm.gov.co',
          rol: 'ADMIN',
          activo: true,
          empresa: 'ANM',
          verificado: true,
          fechaVerificacion: new Date('2024-08-01T12:00:00'),
          verificadoPor: 'auto-verificado',
          totalVerificaciones: 1,
          totalActividades: 156,
          ultimoLogin: new Date('2024-08-11T07:30:00'),
          createdAt: new Date('2024-07-01T10:00:00'),
          puntuacionConfianza: 100,
          estadoVerificacion: 'COMPLETA',
          riesgo: 'BAJO'
        },
        {
          id: '2',
          nombre: 'Juan Carlos Supervisor',
          email: 'supervisor@minera.com',
          rol: 'SUPERVISOR',
          activo: true,
          empresa: 'Minera Demo S.A.S.',
          verificado: true,
          fechaVerificacion: new Date('2024-08-05T14:30:00'),
          verificadoPor: 'admin@anm.gov.co',
          totalVerificaciones: 3,
          totalActividades: 45,
          ultimoLogin: new Date('2024-08-11T09:15:00'),
          createdAt: new Date('2024-07-15T14:20:00'),
          puntuacionConfianza: 85,
          estadoVerificacion: 'COMPLETA',
          riesgo: 'BAJO'
        },
        {
          id: '3',
          nombre: 'María Fernanda Operador',
          email: 'operador@minera.com',
          rol: 'OPERADOR',
          activo: true,
          empresa: 'Extractora Test Ltda.',
          verificado: false,
          fechaVerificacion: null,
          verificadoPor: null,
          totalVerificaciones: 2,
          totalActividades: 23,
          ultimoLogin: new Date('2024-08-11T08:45:00'),
          createdAt: new Date('2024-07-20T16:30:00'),
          puntuacionConfianza: 45,
          estadoVerificacion: 'PENDIENTE',
          riesgo: 'MEDIO'
        },
        {
          id: '4',
          nombre: 'Carlos Alberto Operador',
          email: 'operador2@test.com',
          rol: 'OPERADOR',
          activo: true,
          empresa: 'Extractora Test Ltda.',
          verificado: true,
          fechaVerificacion: new Date('2024-08-08T16:45:00'),
          verificadoPor: 'supervisor@minera.com',
          totalVerificaciones: 2,
          totalActividades: 34,
          ultimoLogin: new Date('2024-08-10T14:20:00'),
          createdAt: new Date('2024-07-25T11:15:00'),
          puntuacionConfianza: 78,
          estadoVerificacion: 'COMPLETA',
          riesgo: 'BAJO'
        },
        {
          id: '5',
          nombre: 'Usuario Inactivo',
          email: 'inactivo@test.com',
          rol: 'OPERADOR',
          activo: false,
          empresa: 'Minera Inactiva S.A.',
          verificado: false,
          fechaVerificacion: null,
          verificadoPor: null,
          totalVerificaciones: 0,
          totalActividades: 5,
          ultimoLogin: new Date('2024-07-30T10:00:00'),
          createdAt: new Date('2024-07-28T09:00:00'),
          puntuacionConfianza: 15,
          estadoVerificacion: 'SUSPENDIDA',
          riesgo: 'ALTO'
        }
      ];
      
      // Aplicar filtros
      let filteredUsers = mockUsers;
      
      if (filters.search) {
        filteredUsers = filteredUsers.filter(user => 
          user.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.empresa.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.rol === filters.role);
      }
      
      if (filters.verified !== '') {
        const isVerified = filters.verified === 'true';
        filteredUsers = filteredUsers.filter(user => user.verificado === isVerified);
      }

      // Aplicar ordenamiento
      filteredUsers.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setUsers(filteredUsers);
      setPagination(prev => ({ 
        ...prev,
        total: Math.ceil(filteredUsers.length / prev.pageSize), 
        count: filteredUsers.length 
      }));
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error cargando usuarios');
    }
  }, [filters, sortBy, sortOrder]);

  // Función para obtener actividades
  const fetchActivities = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const mockActivities = [
        {
          id: '1',
          tipo: 'USER_VERIFICATION',
          descripcion: 'Usuario operador@minera.com realizó verificación de identidad',
          exitosa: false,
          fecha: new Date('2024-08-11T10:30:00'),
          usuario: {
            nombre: 'María Fernanda Operador',
            email: 'operador@minera.com',
            rol: 'OPERADOR'
          },
          tiempoRespuesta: 2340,
          detalles: { puntuacion: 45, razon: 'Datos incompletos' }
        },
        {
          id: '2',
          tipo: 'LOGIN',
          descripcion: 'Usuario supervisor@minera.com inició sesión',
          exitosa: true,
          fecha: new Date('2024-08-11T09:15:00'),
          usuario: {
            nombre: 'Juan Carlos Supervisor',
            email: 'supervisor@minera.com',
            rol: 'SUPERVISOR'
          },
          tiempoRespuesta: 450,
          detalles: { ip: '192.168.1.1', dispositivo: 'Mobile' }
        },
        {
          id: '3',
          tipo: 'ADMIN_VERIFICATION',
          descripcion: 'Administrador verificó manualmente al usuario operador2@test.com',
          exitosa: true,
          fecha: new Date('2024-08-11T08:45:00'),
          usuario: {
            nombre: 'Administrador Sistema',
            email: 'admin@anm.gov.co',
            rol: 'ADMIN'
          },
          tiempoRespuesta: 1200,
          detalles: { usuarioVerificado: 'operador2@test.com', notas: 'Documentos validados' }
        },
        {
          id: '4',
          tipo: 'FAILED_LOGIN',
          descripcion: 'Intento de login fallido para usuario@inexistente.com',
          exitosa: false,
          fecha: new Date('2024-08-11T07:30:00'),
          usuario: null,
          tiempoRespuesta: 890,
          detalles: { ip: '10.0.0.1', intentos: 3 }
        }
      ];
      
      setActivities(mockActivities);
      setError(null);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Error cargando actividades');
    }
  }, []);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchActivities()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchUsers, fetchActivities]);

  // Funciones de manejo de usuarios
  const handleUserAction = async (userId, action, options = {}) => {
    console.log(`Ejecutando acción ${action} para usuario ${userId}`, options);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (action) {
        case 'verify':
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === userId 
                ? { 
                    ...user, 
                    verificado: true, 
                    fechaVerificacion: new Date(),
                    verificadoPor: 'admin@anm.gov.co',
                    estadoVerificacion: 'COMPLETA'
                  }
                : user
            )
          );
          showNotification('Usuario verificado exitosamente', 'success');
          break;
          
        case 'deactivate':
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === userId ? { ...user, activo: false } : user
            )
          );
          showNotification('Usuario desactivado', 'warning');
          break;
          
        case 'activate':
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === userId ? { ...user, activo: true } : user
            )
          );
          showNotification('Usuario activado', 'success');
          break;
          
        case 'bulk':
          const updatedUsers = users.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, ...options.updates }
              : user
          );
          setUsers(updatedUsers);
          setSelectedUsers([]);
          setShowBulkActions(false);
          showNotification(`${selectedUsers.length} usuarios actualizados`, 'success');
          break;
          
        default:
          showNotification(`Acción ${action} ejecutada`, 'info');
      }
    } catch (error) {
      console.error('Error en acción de usuario:', error);
      showNotification('Error al ejecutar la acción', 'error');
    }
  };

  const handleBulkSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  // Función de exportación
  const exportData = () => {
    console.log('Exportando datos...');
    
    const dataToExport = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalUsers: users.length,
        selectedUsers: selectedUsers.length,
        filters: filters
      },
      estadisticas: stats,
      usuarios: users,
      actividades: activities
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `anm_fri_dashboard_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Datos exportados exitosamente', 'success');
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchActivities()]);
    setRefreshing(false);
    showNotification('Datos actualizados', 'success');
  };

  // Función de notificación
  const showNotification = (message, type = 'info') => {
    const emoji = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[type];
    
    console.log(`${emoji} ${message}`);
    alert(`${emoji} ${message}`);
  };

  // Funciones de utilidad
  const getRoleBadgeColor = (rol) => {
    const colors = {
      ADMIN: { backgroundColor: '#EDE9FE', color: '#7C3AED', border: '#C4B5FD' },
      SUPERVISOR: { backgroundColor: '#DBEAFE', color: '#2563EB', border: '#93C5FD' },
      OPERADOR: { backgroundColor: '#D1FAE5', color: '#059669', border: '#6EE7B7' }
    };
    return colors[rol] || { backgroundColor: '#F3F4F6', color: '#374151', border: '#D1D5DB' };
  };

  const getRiskBadgeColor = (riesgo) => {
    const colors = {
      ALTO: { backgroundColor: '#FEE2E2', color: '#DC2626' },
      MEDIO: { backgroundColor: '#FEF3C7', color: '#D97706' },
      BAJO: { backgroundColor: '#D1FAE5', color: '#059669' }
    };
    return colors[riesgo] || { backgroundColor: '#F3F4F6', color: '#374151' };
  };

  const getActivityIcon = (tipo) => {
    const iconMap = {
      'LOGIN': '🔐',
      'FAILED_LOGIN': '🚫',
      'USER_VERIFICATION': '🛡️',
      'ADMIN_VERIFICATION': '👨‍💼',
      'CREATE_FRI': '📝',
      'UPDATE_FRI': '✏️',
      'ADMIN_ACTION': '⚙️',
      'BULK_ACTION': '📦'
    };
    return iconMap[tipo] || '📊';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '0 0 8px 0' 
            }}>
              Cargando Dashboard
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6B7280', 
              margin: '0 0 16px 0',
              lineHeight: '1.5' 
            }}>
              Obteniendo datos del sistema de verificación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          padding: '32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                🛡️
              </div>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  margin: 0
                }}>
                  Panel de Administración - Verificación
                </h1>
                <p style={{
                  fontSize: '16px',
                  margin: '8px 0 0 0',
                  opacity: 0.9
                }}>
                  Gestión y monitoreo del sistema de verificación ANM FRI
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={exportData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <span>📥</span>
                <span>Exportar</span>
              </button>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  opacity: refreshing ? 0.7 : 1
                }}
              >
                <span>🔄</span>
                <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <p style={{ color: '#DC2626', fontWeight: '600', margin: 0 }}>
                Error en el sistema
              </p>
              <p style={{ color: '#7F1D1D', fontSize: '14px', margin: '4px 0 0 0' }}>
                {error}
              </p>
            </div>
            <button
              onClick={refreshData}
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                backgroundColor: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {[
            {
              title: 'Total Verificaciones',
              value: stats.verification.total,
              change: `+${stats.trends.daily} hoy`,
              icon: '📊',
              color: '#3B82F6'
            },
            {
              title: 'Usuarios Verificados',
              value: stats.users.verified,
              change: `${stats.users.verification_rate}% del total`,
              icon: '✅',
              color: '#10B981'
            },
            {
              title: 'Tasa de Éxito',
              value: `${stats.verification.success_rate}%`,
              change: '+2% vs mes anterior',
              icon: '🎯',
              color: '#8B5CF6'
            },
            {
              title: 'Actividad Semanal',
              value: stats.trends.weekly,
              change: `${stats.trends.daily} actividades hoy`,
              icon: '📈',
              color: '#F59E0B'
            }
          ].map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              padding: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6B7280', 
                    margin: '0 0 8px 0' 
                  }}>
                    {stat.title}
                  </p>
                  <p style={{ 
                    fontSize: '32px', 
                    fontWeight: '700', 
                    color: '#111827', 
                    margin: 0
                  }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  fontSize: '32px'
                }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '14px',
                color: stat.color,
                fontWeight: '500'
              }}>
                <span style={{ marginRight: '6px' }}>📈</span>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Bulk actions bar */}
        {selectedUsers.length > 0 && (
          <div style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📦</span>
              <span style={{ fontWeight: '600' }}>
                {selectedUsers.length} usuario{selectedUsers.length > 1 ? 's' : ''} seleccionado{selectedUsers.length > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => handleUserAction(null, 'bulk', { 
                  updates: { verificado: true, fechaVerificacion: new Date() } 
                })}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ✅ Verificar Todos
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ✖️ Cancelar
              </button>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Lista de usuarios */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>
                    Gestión de Usuarios
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    margin: '4px 0 0 0'
                  }}>
                    {pagination.count} usuarios encontrados
                  </p>
                </div>
                
                <button
                  onClick={handleSelectAll}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedUsers.length === users.length ? '#3B82F6' : 'white',
                    color: selectedUsers.length === users.length ? 'white' : '#3B82F6',
                    border: '1px solid #3B82F6',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {selectedUsers.length === users.length ? '✅ Todos' : '☐ Seleccionar'}
                </button>
              </div>
              
              {/* Filtros */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '16px'
                  }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">🎭 Todos los roles</option>
                  <option value="ADMIN">👑 Administrador</option>
                  <option value="SUPERVISOR">👔 Supervisor</option>
                  <option value="OPERADOR">👷 Operador</option>
                </select>
                
                <select
                  value={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">🔍 Estado verificación</option>
                  <option value="true">✅ Verificados</option>
                  <option value="false">⚠️ No verificados</option>
                </select>
              </div>
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {users.map((user) => (
                <div key={user.id} style={{
                  padding: '20px',
                  borderBottom: '1px solid #F3F4F6',
                  backgroundColor: selectedUsers.includes(user.id) ? '#EFF6FF' : 'transparent'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleBulkSelect(user.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          {user.nombre}
                        </h3>
                        
                        <span style={{
                          ...getRoleBadgeColor(user.rol),
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {user.rol}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {user.verificado ? (
                            <>
                              <span style={{ fontSize: '18px' }}>✅</span>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#10B981', 
                                fontWeight: '600' 
                              }}>
                                Verificado
                              </span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: '18px' }}>⚠️</span>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#F59E0B', 
                                fontWeight: '600' 
                              }}>
                                Pendiente
                              </span>
                            </>
                          )}
                        </div>
                        
                        {!user.activo && (
                          <span style={{
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            padding: '4px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            🚫 Inactivo
                          </span>
                        )}
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#6B7280',
                          margin: '4px 0'
                        }}>
                          📧 {user.email}
                        </p>
                        <p style={{
                          fontSize: '13px',
                          color: '#9CA3AF',
                          margin: '4px 0'
                        }}>
                          🏢 {user.empresa}
                        </p>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '12px',
                        fontSize: '12px',
                        color: '#6B7280'
                      }}>
                        <div>
                          <span>🎯 Confianza: {user.puntuacionConfianza}%</span>
                        </div>
                        <div>
                          <span>🔄 Verificaciones: {user.totalVerificaciones}</span>
                        </div>
                        <div>
                          <span>📊 Actividades: {user.totalActividades}</span>
                        </div>
                        <div>
                          <span>🕐 Último login: {formatDate(user.ultimoLogin)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleUserAction(user.id, 'view')}
                        style={{
                          padding: '10px',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      
                      {!user.verificado && user.activo && (
                        <button
                          onClick={() => handleUserAction(user.id, 'verify')}
                          style={{
                            padding: '10px',
                            backgroundColor: '#ECFDF5',
                            color: '#059669',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                          title="Verificar usuario"
                        >
                          ✅
                        </button>
                      )}
                      
                      {user.activo ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'deactivate')}
                          style={{
                            padding: '10px',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                          title="Desactivar usuario"
                        >
                          ❌
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          style={{
                            padding: '10px',
                            backgroundColor: '#ECFDF5',
                            color: '#059669',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                          title="Activar usuario"
                        >
                          🔄
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad en tiempo real */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                Actividad en Tiempo Real
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: 0
              }}>
                Últimas acciones en el sistema
              </p>
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {activities.map((activity) => (
                <div key={activity.id} style={{
                  padding: '20px',
                  borderBottom: '1px solid #F3F4F6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                      flexShrink: 0,
                      marginTop: '4px',
                      fontSize: '24px'
                    }}>
                      {getActivityIcon(activity.tipo)}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          {activity.tipo.replace(/_/g, ' ')}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {activity.exitosa ? '✅' : '❌'}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: '#9CA3AF',
                            backgroundColor: '#F3F4F6',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {activity.tiempoRespuesta}ms
                          </span>
                        </div>
                      </div>
                      
                      <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: '4px 0 12px 0',
                        lineHeight: '1.5'
                      }}>
                        {activity.descripcion}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#9CA3AF'
                      }}>
                        <div>
                          {activity.usuario ? (
                            <>
                              <span style={{
                                ...getRoleBadgeColor(activity.usuario.rol),
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '600',
                                marginRight: '8px'
                              }}>
                                {activity.usuario.rol}
                              </span>
                              <span>{activity.usuario.nombre}</span>
                            </>
                          ) : (
                            <span style={{ 
                              backgroundColor: '#FEE2E2', 
                              color: '#DC2626',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              ANÓNIMO
                            </span>
                          )}
                        </div>
                        
                        <span>🕐 {formatTime(activity.fecha)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS embebido */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminVerificationDashboard;