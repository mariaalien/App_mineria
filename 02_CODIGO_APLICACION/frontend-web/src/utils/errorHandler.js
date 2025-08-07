// ==========================================
// src/utils/errorHandler.js - Manejo de errores
// ==========================================

import { Alert } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

export class ErrorHandler {
  static logError(error, context = 'Unknown') {
    console.error(`[${context}]`, error);
    
    // Log a Crashlytics si está disponible
    if (crashlytics) {
      crashlytics().recordError(error);
    }
  }

  static showError(error, title = 'Error') {
    const message = error?.message || 'Ha ocurrido un error inesperado';
    
    Alert.alert(title, message, [
      { text: 'OK', style: 'default' }
    ]);
  }

  static showNetworkError() {
    Alert.alert(
      'Error de Conexión',
      'No se pudo conectar con el servidor. Verifica tu conexión a internet y vuelve a intentar.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  }

  static showValidationError(errors) {
    const message = Array.isArray(errors) 
      ? errors.join('\n') 
      : errors;
    
    Alert.alert('Error de Validación', message, [
      { text: 'OK', style: 'default' }
    ]);
  }
}
