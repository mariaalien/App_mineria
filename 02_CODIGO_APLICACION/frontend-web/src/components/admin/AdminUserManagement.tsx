import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  UserCheck,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Save,
  RefreshCw
} from 'lucide-react';

// Importar tipos
import { User, Role, Permission } from '../../types/admin';

const AdminUserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Datos mock para demostración
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'María González',
      email: 'maria.gonzalez@anm.gov.co',
      role: 'SUPERVISOR',
      status: 'ACTIVE',
      phone: '+57 320 1234567',
      location: 'Bogotá D.C.',
      lastLogin: '2024-08-07T09:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      avatar: 'MG',
      permissions: ['FRI_READ', 'FRI_WRITE', 'FRI_APPROVE', 'REPORTS_READ']
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@anm.gov.co',
      role: 'OPERADOR',
      status: 'ACTIVE',
      phone: '+57 315 7654321',
      location: 'Medellín, Antioquia',
      lastLogin: '2024-08-07T08:15:00Z',
      createdAt: '2024-02-20T14:30:00Z',
      avatar: 'CR',
      permissions: ['FRI_READ', 'FRI_WRITE']
    },
    {
      id: 3,
      name: 'Ana Patricia Herrera',
      email: 'ana.herrera@anm.gov.co',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+57 301 9876543',
      location: 'Cali, Valle del Cauca',
      lastLogin: '2024-08-07T07:45:00Z',
      createdAt: '2024-01-10T09:00:00Z',
      avatar: 'AH',
      permissions: ['FRI_READ', 'FRI_WRITE', 'FRI_APPROVE', 'REPORTS_READ', 'ADMIN_FULL', 'USERS_MANAGE']
    },
    {
      id: 4,
      name: 'Diego Mendoza',
      email: 'diego.mendoza@anm.gov.co',
      role: 'OPERADOR',
      status: 'INACTIVE',
      phone: '+57 318 5432109',
      location: 'Barranquilla, Atlántico',
      lastLogin: '2024-08-05T16:20:00Z',
      createdAt: '2024-03-05T11:15:00Z',
      avatar: 'DM',
      permissions: ['FRI_READ']
    }
  ];

  const roles: Role[] = [
    {
      id: 'OPERADOR',
      name: 'Operador',
      description: 'Creación y edición de FRI',
      color: '#10b981',
      permissions: ['FRI_READ', 'FRI_WRITE']
    },
    {
      id: 'SUPERVISOR',
      name: 'Supervisor',
      description: 'Revisión y aprobación de FRI',
      color: '#3b82f6',
      permissions: ['FRI_READ', 'FRI_WRITE', 'FRI_APPROVE', 'REPORTS_READ']
    },
    {
      id: 'ADMIN',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      color: '#ef4444',
      permissions: ['FRI_READ', 'FRI_WRITE', 'FRI_APPROVE', 'REPORTS_READ', 'ADMIN_FULL', 'USERS_MANAGE']
    }
  ];

  const permissions: Permission[] = [
    { id: 'FRI_READ', name: 'Leer FRI', description: 'Ver formularios FRI' },
    { id: 'FRI_WRITE', name: 'Escribir FRI', description: 'Crear y editar formularios FRI' },
    { id: 'FRI_APPROVE', name: 'Aprobar FRI', description: 'Aprobar formularios FRI' },
    { id: 'REPORTS_READ', name: 'Ver Reportes', description: 'Acceso a reportes y estadísticas' },
    { id: 'ADMIN_FULL', name: 'Administración', description: 'Acceso completo de administración' },
    { id: 'USERS_MANAGE', name: 'Gestionar Usuarios', description: 'Crear, editar y eliminar usuarios' }
  ];

  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    return status === 'ACTIVE' ? '#10b981' : '#ef4444';
  };

  const getRoleColor = (role: string): string => {
    const roleData = roles.find(r => r.id === role);
    return roleData ? roleData.color : '#6b7280';
  };

  const handleCreateUser = (): void => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const UserModal: React.FC = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            {selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Nombre Completo
              </div>
              <input
                type="text"
                defaultValue={selectedUser?.name || ''}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="Nombre completo del usuario"
              />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Correo Electrónico
              </div>
              <input
                type="email"
                defaultValue={selectedUser?.email || ''}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="usuario@anm.gov.co"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Teléfono
              </div>
              <input
                type="tel"
                defaultValue={selectedUser?.phone || ''}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="+57 300 1234567"
              />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Ubicación
              </div>
              <input
                type="text"
                defaultValue={selectedUser?.location || ''}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="Ciudad, Departamento"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Rol
              </div>
              <select
                defaultValue={selectedUser?.role || 'OPERADOR'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Estado
              </div>
              <select
                defaultValue={selectedUser?.status || 'ACTIVE'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: '12px 24px',
                background: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                console.log('Guardando usuario...');
                setIsModalOpen(false);
              }}
              style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {selectedUser ? 'Actualizar' : 'Crear'} Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
              Panel de Administración
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Sistema ANM FRI - Gestión de usuarios, roles y permisos
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsLoading(!isLoading)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Actualizar
            </button>
            <button
              onClick={handleCreateUser}
              style={{
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
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { id: 'users', name: 'Usuarios', icon: Users },
            { id: 'roles', name: 'Roles', icon: Shield },
            { id: 'permissions', name: 'Permisos', icon: Settings }
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

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="all">Todos los roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto auto auto auto',
              gap: '16px',
              padding: '16px 24px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              <div>Usuario</div>
              <div>Información</div>
              <div>Rol</div>
              <div>Estado</div>
              <div>Último acceso</div>
              <div>Acciones</div>
            </div>

            {filteredUsers.map(user => (
              <div
                key={user.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto auto auto',
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {user.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Phone style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{user.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{user.location}</span>
                  </div>
                </div>

                <div>
                  <span style={{
                    padding: '4px 12px',
                    background: getRoleColor(user.role) + '15',
                    color: getRoleColor(user.role),
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {user.role}
                  </span>
                </div>

                <div>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    background: getStatusColor(user.status) + '15',
                    color: getStatusColor(user.status),
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: getStatusColor(user.status),
                      borderRadius: '50%'
                    }}></div>
                    {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {formatDate(user.lastLogin)}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditUser(user)}
                    style={{
                      padding: '8px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                  </button>
                  <button
                    style={{
                      padding: '8px',
                      background: '#fef2f2',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {roles.map(role => (
            <div
              key={role.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: role.color + '15',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield style={{ width: '24px', height: '24px', color: role.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                    {role.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {role.description}
                  </p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                  Permisos asignados:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {role.permissions.map(permId => {
                    const perm = permissions.find(p => p.id === permId);
                    return (
                      <span
                        key={permId}
                        style={{
                          padding: '4px 8px',
                          background: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      >
                        {perm?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {permissions.map(permission => (
            <div
              key={permission.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid #f3f4f6'
              }}
            >
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                  {permission.name}
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  {permission.description}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {roles.map(role => (
                  role.permissions.includes(permission.id) && (
                    <span
                      key={role.id}
                      style={{
                        padding: '4px 8px',
                        background: role.color + '15',
                        color: role.color,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {role.name}
                    </span>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && <UserModal />}
    </div>
  );
};

export default AdminUserManagement;