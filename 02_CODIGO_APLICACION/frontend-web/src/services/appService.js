// ==========================================
// src/services/appService.js - Servicio de inicialización
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export const initializeApp = async () => {
  try {
    console.log('🚀 Inicializando Sistema ANM FRI Mobile...');

    // Obtener información del dispositivo
    const deviceInfo = {
      deviceId: await DeviceInfo.getUniqueId(),
      deviceName: await DeviceInfo.getDeviceName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      platform: Platform.OS,
      isEmulator: await DeviceInfo.isEmulator(),
    };

    // Guardar información del dispositivo
    await AsyncStorage.setItem('DEVICE_INFO', JSON.stringify(deviceInfo));

    // Verificar si es la primera vez que se ejecuta la app
    const isFirstLaunch = await AsyncStorage.getItem('FIRST_LAUNCH');
    if (!isFirstLaunch) {
      await AsyncStorage.setItem('FIRST_LAUNCH', 'false');
      console.log('✅ Primera ejecución de la aplicación');
    }

    // Configurar configuraciones por defecto
    const defaultSettings = {
      theme: 'light',
      language: 'es',
      notifications: true,
      biometricAuth: false,
      autoSync: true,
      syncInterval: 30, // minutos
      cacheExpiry: 24, // horas
    };

    const existingSettings = await AsyncStorage.getItem('APP_SETTINGS');
    if (!existingSettings) {
      await AsyncStorage.setItem('APP_SETTINGS', JSON.stringify(defaultSettings));
    }

    console.log('✅ Sistema ANM FRI Mobile inicializado correctamente');
    console.log('📱 Dispositivo:', deviceInfo.deviceName);
    console.log('🏗️ Versión:', deviceInfo.appVersion);
    console.log('⚡ Plataforma:', deviceInfo.platform);

  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
  }
};