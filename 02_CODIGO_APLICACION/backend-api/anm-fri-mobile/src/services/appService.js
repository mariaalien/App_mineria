// src/services/appService.js - Servicio de inicialización
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const initializeApp = async () => {
  try {
    console.log('🚀 Inicializando Sistema ANM FRI Mobile...');

    // Obtener información del dispositivo
    const deviceInfo = {
      deviceId: Device.osBuildId || 'unknown',
      deviceName: Device.deviceName || 'Unknown Device',
      systemVersion: Device.osVersion || 'Unknown',
      platform: Platform.OS,
      isDevice: Device.isDevice,
      modelName: Device.modelName || 'Unknown Model',
    };

    // Guardar información del dispositivo
    await AsyncStorage.setItem('DEVICE_INFO', JSON.stringify(deviceInfo));

    // Verificar si es la primera vez que se ejecuta la app
    const isFirstLaunch = await AsyncStorage.getItem('FIRST_LAUNCH');
    if (!isFirstLaunch) {
      await AsyncStorage.setItem('FIRST_LAUNCH', 'false');
      console.log('✅ Primera ejecución de la aplicación');
      
      // Configuraciones iniciales para primera vez
      await setDefaultSettings();
      await clearOldData();
    }

    // Configurar configuraciones por defecto
    await ensureDefaultSettings();

    console.log('✅ Sistema ANM FRI Mobile inicializado correctamente');
    console.log('📱 Dispositivo:', deviceInfo.deviceName);
    console.log('🏗️ Modelo:', deviceInfo.modelName);
    console.log('⚡ Plataforma:', deviceInfo.platform);

  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
  }
};

const setDefaultSettings = async () => {
  const defaultSettings = {
    theme: 'light',
    language: 'es',
    notifications: true,
    biometricAuth: false,
    autoSync: true,
    syncInterval: 30, // minutos
    cacheExpiry: 24, // horas
    offlineMode: true,
    showTutorial: true,
    dataUsage: 'wifi-only', // 'always', 'wifi-only', 'never'
  };

  await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(defaultSettings));
  console.log('⚙️ Configuraciones por defecto establecidas');
};

const ensureDefaultSettings = async () => {
  try {
    const existingSettings = await AsyncStorage.getItem('APP_SETTINGS');
    if (!existingSettings) {
      await setDefaultSettings();
    } else {
      // Verificar que todas las configuraciones requeridas existan
      const settings = JSON.parse(existingSettings);
      const requiredKeys = [
        'theme', 'language', 'notifications', 'biometricAuth', 
        'autoSync', 'syncInterval', 'cacheExpiry', 'offlineMode'
      ];

      let needsUpdate = false;
      requiredKeys.forEach(key => {
        if (settings[key] === undefined) {
          // Agregar configuraciones faltantes
          switch (key) {
            case 'theme': settings.theme = 'light'; break;
            case 'language': settings.language = 'es'; break;
            case 'notifications': settings.notifications = true; break;
            case 'biometricAuth': settings.biometricAuth = false; break;
            case 'autoSync': settings.autoSync = true; break;
            case 'syncInterval': settings.syncInterval = 30; break;
            case 'cacheExpiry': settings.cacheExpiry = 24; break;
            case 'offlineMode': settings.offlineMode = true; break;
          }
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(settings));
        console.log('⚙️ Configuraciones actualizadas');
      }
    }
  } catch (error) {
    console.error('❌ Error verificando configuraciones:', error);
    await setDefaultSettings(); // Fallback
  }
};

const clearOldData = async () => {
  try {
    // Limpiar datos antiguos o corruptos
    const keysToCheck = ['OLD_USER_DATA', 'TEMP_CACHE', 'EXPIRED_TOKENS'];
    
    for (const key of keysToCheck) {
      await AsyncStorage.removeItem(key);
    }

    console.log('🧹 Datos antiguos limpiados');
  } catch (error) {
    console.error('❌ Error limpiando datos antiguos:', error);
  }
};

// Función para obtener información del dispositivo
export const getDeviceInfo = async () => {
  try {
    const stored = await AsyncStorage.getItem('DEVICE_INFO');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('❌ Error obteniendo información del dispositivo:', error);
    return null;
  }
};

// Función para obtener configuraciones
export const getAppSettings = async () => {
  try {
    const stored = await AsyncStorage.getItem('APP_SETTINGS');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('❌ Error obteniendo configuraciones:', error);
    return null;
  }
};

// Función para actualizar configuraciones
export const updateAppSettings = async (newSettings) => {
  try {
    const current = await getAppSettings();
    const updated = { ...current, ...newSettings };
    await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(updated));
    console.log('⚙️ Configuraciones actualizadas:', Object.keys(newSettings));
    return updated;
  } catch (error) {
    console.error('❌ Error actualizando configuraciones:', error);
    throw error;
  }
};

export default {
  initializeApp,
  getDeviceInfo,
  getAppSettings,
  updateAppSettings,
};