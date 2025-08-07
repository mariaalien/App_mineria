// ==========================================
// TIPOS TYPESCRIPT PARA ADMINISTRACIÓN - DÍA 13
// ==========================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  phone: string;
  location: string;
  lastLogin: string;
  createdAt: string;
  avatar: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface BackupJob {
  id: number;
  name: string;
  type: 'full' | 'incremental';
  schedule: string;
  frequency: string;
  retention: number;
  lastRun: string;
  status: 'completed' | 'scheduled' | 'running' | 'error';
  size: string;
}

export interface MaintenanceTask {
  id: number;
  name: string;
  description: string;
  lastRun: string;
  nextRun: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  status: 'completed' | 'scheduled' | 'running' | 'error';
}

export interface SystemService {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  uptime: string;
  cpu: string;
  memory: string;
}

export interface SystemLog {
  id: number;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  service: string;
  message: string;
  ip: string;
}

export interface Alert {
  id: number;
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface Settings {
  system: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
    maxFileSize: number;
    sessionTimeout: number;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    loginAttempts: number;
    lockoutDuration: number;
    twoFactorAuth: boolean;
    ipWhitelist: string;
    sslEnabled: boolean;
    corsOrigins: string;
  };
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    backupFrequency: string;
    backupRetention: number;
    maintenanceWindow: string;
  };
  email: {
    provider: string;
    host: string;
    port: number;
    security: string;
    username: string;
    password: string;
    fromName: string;
    fromEmail: string;
  };
  notifications: {
    emailEnabled: boolean;
    systemAlerts: boolean;
    userNotifications: boolean;
    backupNotifications: boolean;
    errorNotifications: boolean;
    maintenanceNotifications: boolean;
  };
}