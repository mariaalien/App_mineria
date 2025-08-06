// ================================
// 📁 config/roles.js - Definición de Roles y Permisos ANM FRI
// ================================

// Roles del sistema ANM FRI
const ROLES = {
  OPERADOR: {
    codigo: 'OPERADOR',
    nombre: 'Operador',
    descripcion: 'Usuario básico que puede crear y editar FRI asignados',
    nivel: 1
  },
  SUPERVISOR: {
    codigo: 'SUPERVISOR',
    nombre: 'Supervisor',
    descripcion: 'Supervisor que puede revisar y aprobar FRI',
    nivel: 2
  },
  ADMIN: {
    codigo: 'ADMIN',
    nombre: 'Administrador',
    descripcion: 'Administrador del sistema con acceso completo',
    nivel: 3
  }
};

// Permisos granulares del sistema
const PERMISOS = {
  // Permisos de FRI
  FRI_CREATE: {
    codigo: 'FRI_CREATE',
    nombre: 'Crear FRI',
    descripcion: 'Crear nuevos formularios FRI',
    modulo: 'FRI'
  },
  FRI_READ: {
    codigo: 'FRI_READ',
    nombre: 'Leer FRI',
    descripcion: 'Ver formularios FRI',
    modulo: 'FRI'
  },
  FRI_UPDATE: {
    codigo: 'FRI_UPDATE',
    nombre: 'Actualizar FRI',
    descripcion: 'Editar formularios FRI',
    modulo: 'FRI'
  },
  FRI_DELETE: {
    codigo: 'FRI_DELETE',
    nombre: 'Eliminar FRI',
    descripcion: 'Eliminar formularios FRI',
    modulo: 'FRI'
  },
  FRI_APPROVE: {
    codigo: 'FRI_APPROVE',
    nombre: 'Aprobar FRI',
    descripcion: 'Aprobar y rechazar formularios FRI',
    modulo: 'FRI'
  },
  FRI_SUBMIT: {
    codigo: 'FRI_SUBMIT',
    nombre: 'Enviar FRI',
    descripcion: 'Enviar formularios FRI a la ANM',
    modulo: 'FRI'
  },

  // Permisos de Reportes
  REPORTS_VIEW: {
    codigo: 'REPORTS_VIEW',
    nombre: 'Ver Reportes',
    descripcion: 'Ver reportes y estadísticas',
    modulo: 'REPORTES'
  },
  REPORTS_EXPORT: {
    codigo: 'REPORTS_EXPORT',
    nombre: 'Exportar Reportes',
    descripcion: 'Exportar reportes a Excel/PDF',
    modulo: 'REPORTES'
  },
  REPORTS_ADVANCED: {
    codigo: 'REPORTS_ADVANCED',
    nombre: 'Reportes Avanzados',
    descripcion: 'Acceso a reportes avanzados y analytics',
    modulo: 'REPORTES'
  },

  // Permisos de Administración
  ADMIN_USERS: {
    codigo: 'ADMIN_USERS',
    nombre: 'Administrar Usuarios',
    descripcion: 'Gestionar usuarios del sistema',
    modulo: 'ADMIN'
  },
  ADMIN_COMPANY: {
    codigo: 'ADMIN_COMPANY',
    nombre: 'Administrar Empresa',
    descripcion: 'Gestionar datos de la empresa',
    modulo: 'ADMIN'
  },
  ADMIN_SYSTEM: {
    codigo: 'ADMIN_SYSTEM',
    nombre: 'Administrar Sistema',
    descripcion: 'Configuraciones del sistema',
    modulo: 'ADMIN'
  },
  ADMIN_AUDIT: {
    codigo: 'ADMIN_AUDIT',
    nombre: 'Ver Auditoría',
    descripcion: 'Ver logs y auditoría del sistema',
    modulo: 'ADMIN'
  }
};

// Matriz de permisos por rol
const PERMISOS_POR_ROL = {
  OPERADOR: [
    'FRI_CREATE',
    'FRI_READ',
    'FRI_UPDATE',
    'REPORTS_VIEW',
    'REPORTS_EXPORT'
  ],
  SUPERVISOR: [
    'FRI_CREATE',
    'FRI_READ',
    'FRI_UPDATE',
    'FRI_APPROVE',
    'FRI_SUBMIT',
    'REPORTS_VIEW',
    'REPORTS_EXPORT',
    'REPORTS_ADVANCED'
  ],
  ADMIN: Object.keys(PERMISOS) // Todos los permisos
};

// Función para verificar si un rol tiene un permiso específico
const tienePermiso = (rol, permiso) => {
  return PERMISOS_POR_ROL[rol]?.includes(permiso) || false;
};

// Función para obtener todos los permisos de un rol
const getPermisosPorRol = (rol) => {
  return PERMISOS_POR_ROL[rol] || [];
};

module.exports = {
  ROLES,
  PERMISOS,
  PERMISOS_POR_ROL,
  tienePermiso,
  getPermisosPorRol
};