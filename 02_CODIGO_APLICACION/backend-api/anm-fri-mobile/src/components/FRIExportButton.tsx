// src/components/FRIExportButton.tsx - Componente con exportación usando el hook
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFRIExport } from '../../hooks/useFRIExport'; // ⬅️ IMPORTAR EL HOOK

interface FRIExportButtonProps {
  friData: any;
  buttonText?: string;
  style?: any;
}

export default function FRIExportButton({ 
  friData, 
  buttonText = "Exportar FRI",
  style 
}: FRIExportButtonProps) {
  
  // ⬅️ USAR EL HOOK
  const { 
    exportAndShareFRI,
    exportMultipleFRIs,
    isExporting,
    exportProgress,
    getExportHistory,
    cleanupExportHistory
  } = useFRIExport();

  const [showOptions, setShowOptions] = useState(false);

  // ⬅️ FUNCIÓN PARA EXPORTAR CON OPCIONES
  const handleExportWithOptions = () => {
    Alert.alert(
      'Exportar FRI',
      'Selecciona el formato y opciones:',
      [
        {
          text: 'JSON con Fotos',
          onPress: () => exportFRI('json', true)
        },
        {
          text: 'JSON sin Fotos',
          onPress: () => exportFRI('json', false)
        },
        {
          text: 'CSV para Excel',
          onPress: () => exportFRI('csv', false)
        },
        {
          text: 'Texto Legible',
          onPress: () => exportFRI('txt', false)
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  // ⬅️ FUNCIÓN PRINCIPAL DE EXPORTACIÓN
  const exportFRI = async (format: 'json' | 'csv' | 'txt', includePhotos: boolean) => {
    try {
      console.log('🚀 Iniciando exportación:', { format, includePhotos });

      const success = await exportAndShareFRI(friData, {
        format: format,
        includePhotos: includePhotos,
        autoSave: true // Guardar en historial automáticamente
      });

      if (success) {
        console.log('✅ Exportación exitosa');
      } else {
        console.log('❌ Exportación falló');
      }

    } catch (error) {
      console.error('❌ Error en exportación:', error);
      Alert.alert('Error', 'No se pudo exportar el FRI');
    }
  };

  // ⬅️ FUNCIÓN PARA VER HISTORIAL DE EXPORTACIONES
  const showExportHistory = async () => {
    try {
      const history = await getExportHistory();
      
      if (history.length === 0) {
        Alert.alert('Historial', 'No hay exportaciones previas');
        return;
      }

      const historyText = history
        .slice(0, 5) // Mostrar últimas 5
        .map((item, index) => 
          `${index + 1}. ${item.friType} - ${new Date(item.exportDate).toLocaleDateString()}`
        )
        .join('\n');

      Alert.alert(
        'Últimas Exportaciones',
        historyText,
        [
          {
            text: 'Limpiar Historial',
            style: 'destructive',
            onPress: () => cleanupExportHistory(7) // Limpiar exports de más de 7 días
          },
          { text: 'Cerrar' }
        ]
      );

    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      Alert.alert('Error', 'No se pudo obtener el historial');
    }
  };

  // ⬅️ VALIDAR SI HAY DATOS PARA EXPORTAR
  const canExport = friData && (
    friData.evidencias?.length > 0 || 
    friData.ubicacion || 
    Object.keys(friData.datos || {}).length > 0
  );

  return (
    <View style={[styles.container, style]}>
      {/* Botón principal de exportación */}
      <TouchableOpacity
        style={[
          styles.exportButton,
          !canExport && styles.disabledButton,
          isExporting && styles.loadingButton
        ]}
        onPress={handleExportWithOptions}
        disabled={!canExport || isExporting}
      >
        {isExporting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.buttonText}>
              Exportando {exportProgress}%
            </Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="download-outline" size={20} color="white" />
            <Text style={styles.buttonText}>{buttonText}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Botón de historial */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={showExportHistory}
        disabled={isExporting}
      >
        <Ionicons 
          name="time-outline" 
          size={18} 
          color={isExporting ? "#999" : "#007AFF"} 
        />
      </TouchableOpacity>

      {/* Información de estado */}
      {!canExport && (
        <Text style={styles.warningText}>
          ⚠️ Agrega evidencias o datos GPS para exportar
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  loadingButton: {
    backgroundColor: '#5AC8FA',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
  },
  warningText: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 4,
    textAlign: 'center',
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
  },
});

// ⬅️ EJEMPLO DE USO EN UNA PANTALLA:
/*
import FRIExportButton from '../components/FRIExportButton';

const MyScreen = () => {
  const [friData, setFriData] = useState({
    id: '123',
    tipo: 'mensual',
    fecha: new Date().toISOString(),
    evidencias: [],
    ubicacion: null,
    datos: {}
  });

  return (
    <View style={{ padding: 16 }}>
      <FRIExportButton 
        friData={friData}
        buttonText="Compartir FRI"
        style={{ marginTop: 20 }}
      />
    </View>
  );
};
*/