// src/services/exportShareService.ts - Sistema de Exportación y Compartir
import { Alert, Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';


// Tipos de exportación
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
  TXT = 'txt'
}

export enum BackupType {
  FULL = 'full',
  FRI_ONLY = 'fri_only',
  SETTINGS = 'settings',
  EVIDENCE = 'evidence'
}

export interface ExportOptions {
  format: ExportFormat;
  includeEvidence: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  compress?: boolean;
}

export interface BackupOptions {
  type: BackupType;
  includeImages: boolean;
  destination: 'local' | 'share' | 'download';
}

class ExportShareService {
  private static instance: ExportShareService;
  private backupDirectory: string;

  constructor() {
    this.backupDirectory = `${FileSystem.documentDirectory}backups/`;
    this.initializeDirectories();
  }

  public static getInstance(): ExportShareService {
    if (!ExportShareService.instance) {
      ExportShareService.instance = new ExportShareService();
    }
    return ExportShareService.instance;
  }

  // Inicializar directorios necesarios
  private async initializeDirectories(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.backupDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.backupDirectory, { intermediates: true });
        console.log('📁 Directorio de backups creado');
      }
    } catch (error) {
      console.error('❌ Error creando directorios:', error);
    }
  }

  // Exportar datos FRI
  async exportFRIData(data: any[], options: ExportOptions): Promise<string> {
    try {
      console.log('📤 Iniciando exportación:', options.format);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let exportedData: string;
      let filename: string;
      let mimeType: string;

      const timestamp = new Date().toISOString().split('T')[0];

      switch (options.format) {
        case ExportFormat.JSON:
          exportedData = this.exportToJSON(data, options);
          filename = `FRI_Export_${timestamp}.json`;
          mimeType = 'application/json';
          break;

        case ExportFormat.CSV:
          exportedData = this.exportToCSV(data, options);
          filename = `FRI_Export_${timestamp}.csv`;
          mimeType = 'text/csv';
          break;

        case ExportFormat.PDF:
          exportedData = this.exportToPDF(data, options);
          filename = `FRI_Export_${timestamp}.pdf`;
          mimeType = 'application/pdf';
          break;

        case ExportFormat.TXT:
          exportedData = this.exportToTXT(data, options);
          filename = `FRI_Export_${timestamp}.txt`;
          mimeType = 'text/plain';
          break;

        default:
          throw new Error('Formato de exportación no soportado');
      }

      // Guardar archivo
      const filePath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(filePath, exportedData);

      console.log('✅ Archivo exportado:', filename);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return filePath;
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  }

  // Exportar a JSON
  private exportToJSON(data: any[], options: ExportOptions): string {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        format: 'JSON',
        version: '1.0',
        totalRecords: data.length,
        includeEvidence: options.includeEvidence,
        dateRange: options.dateRange,
      },
      friData: data.map(item => ({
        ...item,
        // Filtrar evidencias si no se incluyen
        evidencias: options.includeEvidence ? item.evidencias : undefined,
      })),
      statistics: this.generateStatistics(data),
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Exportar a CSV
  private exportToCSV(data: any[], options: ExportOptions): string {
    if (data.length === 0) return 'No hay datos para exportar';

    // Headers
    const headers = [
      'ID',
      'Título',
      'Tipo',
      'Estado',
      'Mineral Principal',
      'Cantidad Extraída',
      'Unidad',
      'Valor Producción',
      'Municipio',
      'Departamento',
      'Fecha Creación',
      'Coordenadas Lat',
      'Coordenadas Lng',
      'Evidencias Count'
    ];

    // Datos
    const rows = data.map(item => [
      item.id || '',
      item.titulo || '',
      item.tipo || '',
      item.estado || '',
      item.mineralPrincipal || '',
      item.cantidadExtraida || '',
      item.unidadMedida || '',
      item.valorProduccion || '',
      item.municipio || '',
      item.departamento || '',
      item.fechaCreacion || '',
      item.coordenadas?.latitude || '',
      item.coordenadas?.longitude || '',
      item.evidencias?.length || 0
    ]);

    // Combinar headers y rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Exportar a PDF (simulado como texto estructurado)
  private exportToPDF(data: any[], options: ExportOptions): string {
    const timestamp = new Date().toLocaleString('es-CO');
    
    let pdfContent = `
REPORTE FRI - AGENCIA NACIONAL DE MINERÍA
=========================================

Fecha de Generación: ${timestamp}
Total de Registros: ${data.length}
Formato: PDF Report

----------------------------------------

`;

    data.forEach((item, index) => {
      pdfContent += `
FRI #${index + 1}
--------------
ID: ${item.id || 'N/A'}
Título: ${item.titulo || 'N/A'}
Tipo: ${item.tipo || 'N/A'}
Estado: ${item.estado || 'N/A'}
Mineral Principal: ${item.mineralPrincipal || 'N/A'}
Cantidad Extraída: ${item.cantidadExtraida || 'N/A'} ${item.unidadMedida || ''}
Valor Producción: $${item.valorProduccion || 'N/A'}
Ubicación: ${item.municipio || 'N/A'}, ${item.departamento || 'N/A'}
Fecha Creación: ${item.fechaCreacion || 'N/A'}
Coordenadas: ${item.coordenadas?.latitude || 'N/A'}, ${item.coordenadas?.longitude || 'N/A'}
Evidencias: ${item.evidencias?.length || 0} archivos

`;
    });

    pdfContent += `
----------------------------------------
Estadísticas del Reporte:
${JSON.stringify(this.generateStatistics(data), null, 2)}

Generado por: Sistema FRI ANM v1.0
Resolución 371/2024
`;

    return pdfContent;
  }

  // Exportar a TXT
  private exportToTXT(data: any[], options: ExportOptions): string {
    const timestamp = new Date().toLocaleString('es-CO');
    
    let txtContent = `REPORTE FRI - ${timestamp}\n`;
    txtContent += `Total de registros: ${data.length}\n\n`;

    data.forEach((item, index) => {
      txtContent += `${index + 1}. ${item.titulo || 'Sin título'}\n`;
      txtContent += `   Estado: ${item.estado || 'N/A'}\n`;
      txtContent += `   Mineral: ${item.mineralPrincipal || 'N/A'}\n`;
      txtContent += `   Cantidad: ${item.cantidadExtraida || 'N/A'} ${item.unidadMedida || ''}\n`;
      txtContent += `   Ubicación: ${item.municipio || 'N/A'}, ${item.departamento || 'N/A'}\n\n`;
    });

    return txtContent;
  }

  // Generar estadísticas
  private generateStatistics(data: any[]): any {
    const stats = {
      totalRegistros: data.length,
      porEstado: {} as any,
      porTipo: {} as any,
      porMineral: {} as any,
      totalEvidencias: 0,
      valorTotalProduccion: 0,
    };

    data.forEach(item => {
      // Por estado
      stats.porEstado[item.estado] = (stats.porEstado[item.estado] || 0) + 1;
      
      // Por tipo
      stats.porTipo[item.tipo] = (stats.porTipo[item.tipo] || 0) + 1;
      
      // Por mineral
      stats.porMineral[item.mineralPrincipal] = (stats.porMineral[item.mineralPrincipal] || 0) + 1;
      
      // Evidencias
      stats.totalEvidencias += item.evidencias?.length || 0;
      
      // Valor total
      const valor = parseFloat(item.valorProduccion) || 0;
      stats.valorTotalProduccion += valor;
    });

    return stats;
  }

  // Compartir archivo
  async shareFile(filePath: string, title: string = 'Exportación FRI'): Promise<void> {
    try {
      console.log('📤 Compartiendo archivo:', filePath);

      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: this.getMimeType(filePath),
          dialogTitle: title,
        });
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('✅ Archivo compartido exitosamente');
      } else {
        // Fallback para plataformas que no soportan Sharing
        await Share.share({
          url: filePath,
          title: title,
        });
      }
    } catch (error) {
      console.error('❌ Error compartiendo archivo:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  }

  // Crear backup completo
  async createBackup(options: BackupOptions): Promise<string> {
    try {
      console.log('💾 Creando backup:', options.type);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupData = await this.gatherBackupData(options);
      
      const filename = `backup_${options.type}_${timestamp}.json`;
      const filePath = `${this.backupDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));

      console.log('✅ Backup creado:', filename);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return filePath;
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  }

  // Recopilar datos para backup
  private async gatherBackupData(options: BackupOptions): Promise<any> {
    const backupData: any = {
      metadata: {
        backupDate: new Date().toISOString(),
        type: options.type,
        version: '1.0',
        includeImages: options.includeImages,
      },
    };

    switch (options.type) {
      case BackupType.FULL:
        backupData.friData = await this.getMockFRIData();
        backupData.settings = await this.getUserSettings();
        backupData.notifications = await this.getNotificationSettings();
        if (options.includeImages) {
          backupData.evidence = await this.getEvidenceData();
        }
        break;

      case BackupType.FRI_ONLY:
        backupData.friData = await this.getMockFRIData();
        if (options.includeImages) {
          backupData.evidence = await this.getEvidenceData();
        }
        break;

      case BackupType.SETTINGS:
        backupData.settings = await this.getUserSettings();
        backupData.notifications = await this.getNotificationSettings();
        break;

      case BackupType.EVIDENCE:
        backupData.evidence = await this.getEvidenceData();
        break;
    }

    return backupData;
  }

  // Restaurar backup
  async restoreBackup(filePath: string): Promise<void> {
    try {
      console.log('♻️ Restaurando backup:', filePath);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const backupContent = await FileSystem.readAsStringAsync(filePath);
      const backupData = JSON.parse(backupContent);

      // Validar backup
      if (!backupData.metadata || !backupData.metadata.backupDate) {
        throw new Error('Archivo de backup inválido');
      }

      // Restaurar datos según el tipo
      if (backupData.friData) {
        await this.restoreFRIData(backupData.friData);
      }

      if (backupData.settings) {
        await this.restoreSettings(backupData.settings);
      }

      if (backupData.evidence) {
        await this.restoreEvidence(backupData.evidence);
      }

      console.log('✅ Backup restaurado exitosamente');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('❌ Error restaurando backup:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  }

  // Obtener lista de backups
  async getBackupList(): Promise<any[]> {
    try {
      const dirInfo = await FileSystem.readDirectoryAsync(this.backupDirectory);
      const backups = [];

      for (const filename of dirInfo) {
        if (filename.endsWith('.json')) {
          const filePath = `${this.backupDirectory}${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          
          // Leer metadata del backup
          try {
            const content = await FileSystem.readAsStringAsync(filePath);
            const data = JSON.parse(content);
            
            backups.push({
              filename,
              filePath,
              size: fileInfo.size || 0,
              modificationTime: fileInfo.modificationTime || 0,
              type: data.metadata?.type || 'unknown',
              backupDate: data.metadata?.backupDate || '',
            });
          } catch (error) {
            console.warn('⚠️ Error leyendo backup:', filename);
          }
        }
      }

      return backups.sort((a, b) => b.modificationTime - a.modificationTime);
    } catch (error) {
      console.error('❌ Error obteniendo lista de backups:', error);
      return [];
    }
  }

  // Eliminar backup
  async deleteBackup(filePath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(filePath);
      console.log('🗑️ Backup eliminado:', filePath);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('❌ Error eliminando backup:', error);
      throw error;
    }
  }

  // Obtener información de almacenamiento
  async getStorageInfo(): Promise<any> {
    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const totalSpace = await FileSystem.getTotalDiskCapacityAsync();
      const backups = await this.getBackupList();
      
      const backupSize = backups.reduce((total, backup) => total + backup.size, 0);

      return {
        freeSpace,
        totalSpace,
        usedSpace: totalSpace - freeSpace,
        backupCount: backups.length,
        backupSize,
        backupDirectory: this.backupDirectory,
      };
    } catch (error) {
      console.error('❌ Error obteniendo info de almacenamiento:', error);
      return null;
    }
  }

  // Métodos auxiliares mock
  private async getMockFRIData(): Promise<any[]> {
    // Simular datos FRI
    return [
      {
        id: '1',
        titulo: 'FRI Producción Enero 2025',
        tipo: 'mensual',
        estado: 'completado',
        mineralPrincipal: 'Oro',
        cantidadExtraida: '125.5',
        unidadMedida: 'Kilogramos',
        valorProduccion: '15250000',
        municipio: 'Medellín',
        departamento: 'Antioquia',
        fechaCreacion: new Date().toISOString(),
        evidencias: ['evidence1.jpg', 'evidence2.jpg'],
      },
      // Más datos mock...
    ];
  }

  private async getUserSettings(): Promise<any> {
    return {
      theme: 'light',
      notifications: true,
      language: 'es',
      autoSync: true,
      lastLogin: new Date().toISOString(),
    };
  }

  private async getNotificationSettings(): Promise<any> {
    return {
      pushEnabled: true,
      friReminders: true,
      deadlineAlerts: true,
      syncNotifications: true,
    };
  }

  private async getEvidenceData(): Promise<any[]> {
    return [
      {
        id: 'evidence1',
        filename: 'sitio_extraccion_001.jpg',
        type: 'Sitio de Extracción',
        size: 2048000,
        date: new Date().toISOString(),
      },
      // Más evidencias mock...
    ];
  }

  private async restoreFRIData(data: any[]): Promise<void> {
    console.log('♻️ Restaurando datos FRI:', data.length);
    // Aquí iría la lógica real de restauración
  }

  private async restoreSettings(settings: any): Promise<void> {
    console.log('♻️ Restaurando configuraciones:', settings);
    // Aquí iría la lógica real de restauración
  }

  private async restoreEvidence(evidence: any[]): Promise<void> {
    console.log('♻️ Restaurando evidencias:', evidence.length);
    // Aquí iría la lógica real de restauración
  }

  private getMimeType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'json': 'application/json',
      'csv': 'text/csv',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}

// Exportar instancia singleton
export const exportShareService = ExportShareService.getInstance();