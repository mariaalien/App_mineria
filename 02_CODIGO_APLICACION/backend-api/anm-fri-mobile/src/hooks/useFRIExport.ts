// src/hooks/useFRIExport.ts - Hook personalizado para exportación de datos FRI
import { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExportShareService } from '../services/exportShareService';

interface FRIExportOptions {
  includePhotos?: boolean;
  format?: 'json' | 'csv' | 'txt';
  autoSave?: boolean;
}

interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export const useFRIExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Función principal de exportación
  const exportFRIData = async (
    friData: any, 
    options: FRIExportOptions = {}
  ): Promise<ExportResult> => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      const { 
        includePhotos = true, 
        format = 'json', 
        autoSave = false 
      } = options;

      // Validar datos
      if (!friData || Object.keys(friData).length === 0) {
        throw new Error('No hay datos FRI para exportar');
      }

      setExportProgress(25);

      // Preparar datos para exportación
      const exportData = await prepareFRIForExport(friData, includePhotos);
      
      setExportProgress(50);

      // Generar nombre de archivo único
      const fileName = generateFileName(friData, format);
      
      setExportProgress(75);

      // Exportar usando el servicio
      const filePath = await ExportShareService.exportData({
        data: exportData,
        format: format,
        fileName: fileName,
        includePhotos: includePhotos
      });

      if (!filePath) {
        throw new Error('No se pudo crear el archivo');
      }

      setExportProgress(100);

      // Auto-guardar en historial si está habilitado
      if (autoSave) {
        await saveToExportHistory(friData, filePath, format);
      }

      return { success: true, filePath };

    } catch (error) {
      console.error('❌ Error en exportación:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Función para exportar y compartir directamente
  const exportAndShareFRI = async (
    friData: any, 
    options: FRIExportOptions = {}
  ): Promise<boolean> => {
    try {
      const result = await exportFRIData(friData, options);
      
      if (result.success && result.filePath) {
        const shared = await ExportShareService.shareFile(
          result.filePath, 
          `FRI ${friData.tipo || 'Export'}`
        );
        
        if (shared) {
          Alert.alert('Éxito', 'FRI exportado y compartido correctamente');
          return true;
        }
      }
      
      Alert.alert('Error', result.error || 'No se pudo exportar el FRI');
      return false;

    } catch (error) {
      console.error('❌ Error en exportación y compartir:', error);
      Alert.alert('Error', 'No se pudo completar la operación');
      return false;
    }
  };

  // Función para exportar múltiples FRIs
  const exportMultipleFRIs = async (
    friList: any[], 
    options: FRIExportOptions = {}
  ): Promise<ExportResult> => {
    try {
      setIsExporting(true);
      
      if (!friList || friList.length === 0) {
        throw new Error('No hay FRIs para exportar');
      }

      // Preparar datos consolidados
      const consolidatedData = {
        resumen: {
          total_fris: friList.length,
          fecha_exportacion: new Date().toISOString(),
          tipos: friList.reduce((acc, fri) => {
            acc[fri.tipo] = (acc[fri.tipo] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        fris: friList.map(fri => prepareFRIForExport(fri, options.includePhotos))
      };

      const fileName = `FRIs_consolidado_${new Date().getTime()}`;
      
      const filePath = await ExportShareService.exportData({
        data: consolidatedData,
        format: options.format || 'json',
        fileName: fileName,
        includePhotos: options.includePhotos || false
      });

      return { success: true, filePath: filePath || undefined };

    } catch (error) {
      console.error('❌ Error exportando múltiples FRIs:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    } finally {
      setIsExporting(false);
    }
  };

  // Función para obtener historial de exportaciones
  const getExportHistory = async (): Promise<any[]> => {
    try {
      const historyJson = await AsyncStorage.getItem('fri_export_history');
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return [];
    }
  };

  // Función para limpiar historial antiguo
  const cleanupExportHistory = async (daysOld: number = 30): Promise<void> => {
    try {
      const history = await getExportHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const recentHistory = history.filter(item => 
        new Date(item.exportDate) > cutoffDate
      );

      await AsyncStorage.setItem('fri_export_history', JSON.stringify(recentHistory));
      
      // Limpiar archivos físicos también
      await ExportShareService.cleanupOldExports(daysOld);

    } catch (error) {
      console.error('❌ Error limpiando historial:', error);
    }
  };

  // Funciones auxiliares privadas
  const prepareFRIForExport = async (friData: any, includePhotos: boolean) => {
    const baseData = {
      id: friData.id,
      tipo: friData.tipo,
      fecha_creacion: friData.fecha,
      ubicacion: friData.ubicacion,
      datos: friData.datos || {},
      metadata: {
        version: '1.0',
        app: 'ANM-FRI-Mobile',
        exportado_en: new Date().toISOString()
      }
    };

    if (includePhotos && friData.evidencias) {
      baseData.evidencias = friData.evidencias;
    }

    return baseData;
  };

  const generateFileName = (friData: any, format: string): string => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
    
    return `FRI_${friData.tipo || 'unknown'}_${dateStr}_${timeStr}`;
  };

  const saveToExportHistory = async (friData: any, filePath: string, format: string) => {
    try {
      const history = await getExportHistory();
      const newEntry = {
        id: Date.now().toString(),
        friId: friData.id,
        friType: friData.tipo,
        filePath: filePath,
        format: format,
        exportDate: new Date().toISOString(),
        fileSize: 0 // Se podría calcular si es necesario
      };

      const updatedHistory = [newEntry, ...history].slice(0, 50); // Mantener solo últimos 50
      await AsyncStorage.setItem('fri_export_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('❌ Error guardando en historial:', error);
    }
  };

  return {
    // Estados
    isExporting,
    exportProgress,
    
    // Funciones principales
    exportFRIData,
    exportAndShareFRI,
    exportMultipleFRIs,
    
    // Gestión de historial
    getExportHistory,
    cleanupExportHistory,
  };
};