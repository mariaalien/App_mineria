// ==========================================
// src/utils/constants.js - Constantes de la app
// ==========================================

export const APP_CONFIG = {
  NAME: 'Sistema ANM FRI',
  VERSION: '1.0.0',
  BUNDLE_ID: 'co.gov.anm.fri',
  
  // URLs
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://api-anm-fri.gov.co/api',
  
  TERMS_URL: 'https://anm.gov.co/terminos',
  PRIVACY_URL: 'https://anm.gov.co/privacidad',
  SUPPORT_URL: 'https://anm.gov.co/soporte',
  
  // Límites
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PHOTOS_PER_FRI: 5,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  
  // Colores
  COLORS: {
    PRIMARY: '#2563eb',
    SECONDARY: '#10b981',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    
    BACKGROUND: '#f8fafc',
    SURFACE: '#ffffff',
    TEXT_PRIMARY: '#1f2937',
    TEXT_SECONDARY: '#6b7280',
    
    // Gradientes
    PRIMARY_GRADIENT: ['#2563eb', '#1d4ed8'],
    SUCCESS_GRADIENT: ['#10b981', '#059669'],
    WARNING_GRADIENT: ['#f59e0b', '#d97706'],
    ERROR_GRADIENT: ['#ef4444', '#dc2626'],
  },
  
  // Tipos de FRI
  FRI_TYPES: {
    PRODUCCION: { id: 1, name: 'Producción', frequency: 'MENSUAL' },
    INVENTARIOS: { id: 2, name: 'Inventarios', frequency: 'MENSUAL' },
    PARADAS: { id: 3, name: 'Paradas de Producción', frequency: 'MENSUAL' },
    EJECUCION: { id: 4, name: 'Ejecución', frequency: 'MENSUAL' },
    MAQUINARIA: { id: 5, name: 'Maquinaria de Transporte', frequency: 'MENSUAL' },
    REGALIAS: { id: 6, name: 'Regalías', frequency: 'TRIMESTRAL' },
    INVENTARIO_MAQUINARIA: { id: 7, name: 'Inventario de Maquinaria', frequency: 'ANUAL' },
    CAPACIDAD: { id: 8, name: 'Capacidad Tecnológica', frequency: 'ANUAL' },
    PROYECCIONES: { id: 9, name: 'Proyecciones', frequency: 'ANUAL' }
  },
  
  // Estados de FRI
  FRI_STATUS: {
    DRAFT: 'BORRADOR',
    PENDING: 'PENDIENTE',
    APPROVED: 'APROBADO',
    REJECTED: 'RECHAZADO',
    REVISION: 'EN_REVISION'
  },
  
  // Roles de usuario
  USER_ROLES: {
    OPERADOR: 'OPERADOR',
    SUPERVISOR: 'SUPERVISOR',
    ADMIN: 'ADMIN'
  }
};

export default APP_CONFIG;