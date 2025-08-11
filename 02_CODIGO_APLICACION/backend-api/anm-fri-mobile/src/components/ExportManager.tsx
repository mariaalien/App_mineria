// src/components/ExportManager.tsx - Gestor de Exportaciones y Backups
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import PremiumButton from './PremiumButton';
import { 
  exportShareService, 
  ExportFormat, 
  BackupType, 
  ExportOptions, 
  BackupOptions 
} from '../services/exportShareService';

interface ExportManagerProps {
  data?: any[];
  onExportComplete?: (filePath: string) => void;
  onBackupComplete?: (filePath: string) => void;
}

export default function ExportManager({ 
  data = [], 
  onExportComplete, 
  onBackupComplete 
}: ExportManagerProps) {
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupList, setBackupList] = useState<any[]>([]);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  
  // Estados del formulario de exportación
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.JSON);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [compressData, setCompressData] = useState(false);
  
  // Estados del formulario de backup
  const [backupType, setBackupType] = useState<BackupType>(BackupType.FULL);
  const [includeImages, setIncludeImages] = useState(true);

  useEffect(() => {
    loadBackupList();
    loadStorageInfo();
  }, []);

  const loadBackupList = async () => {
    try {
      const backups = await exportShareService.getBackupList();
      setBackupList(backups);
    } catch (error) {
      console.error('Error cargando backups:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await exportShareService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error cargando info de almacenamiento:', error);
    }
  };

  // Exportar datos
  const handleExport = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const options: ExportOptions = {
        format: exportFormat,
        includeEvidence,
        compress: compressData,
      };

      const filePath = await exportShareService.exportFRIData(data, options);
      
      Alert.alert(
        '✅ Exportación Completa',
        `Datos exportados exitosamente en formato ${exportFormat.toUpperCase()}`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Compartir', 
            onPress: () => shareExportedFile(filePath) 
          }
        ]
      );

      onExportComplete?.(filePath);
      setShowExportModal(false);
    } catch (error) {
      Alert.alert('❌ Error de Exportación', 'No se pudieron exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Compartir archivo exportado
  const shareExportedFile = async (filePath: string) => {
    try {
      await exportShareService.shareFile(filePath, 'Exportación FRI ANM');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo compartir el archivo');
    }
  };

  // Crear backup
  const handleCreateBackup = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const options: BackupOptions = {
        type: backupType,
        includeImages,
        destination: 'local',
      };

      const filePath = await exportShareService.createBackup(options);
      
      Alert.alert(
        '💾 Backup Creado',
        `Backup ${backupType} creado exitosamente`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Compartir', 
            onPress: () => shareExportedFile(filePath) 
          }
        ]
      );

      onBackupComplete?.(filePath);
      setShowBackupModal(false);
      await loadBackupList();
      await loadStorageInfo();
    } catch (error) {
      Alert.alert('❌ Error de Backup', 'No se pudo crear el backup');
    } finally {
      setLoading(false);
    }
  };

  // Restaurar backup
  const handleRestoreBackup = (backup: any) => {
    Alert.alert(
      '♻️ Restaurar Backup',
      `¿Estás seguro de que quieres restaurar el backup del ${new Date(backup.backupDate).toLocaleDateString('es-CO')}? Esto sobrescribirá los datos actuales.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await exportShareService.restoreBackup(backup.filePath);
              Alert.alert('✅ Restauración Completa', 'Los datos han sido restaurados exitosamente');
              await loadBackupList();
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo restaurar el backup');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Eliminar backup
  const handleDeleteBackup = (backup: any) => {
    Alert.alert(
      '🗑️ Eliminar Backup',
      `¿Estás seguro de que quieres eliminar el backup del ${new Date(backup.backupDate).toLocaleDateString('es-CO')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await exportShareService.deleteBackup(backup.filePath);
              await loadBackupList();
              await loadStorageInfo();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo eliminar el backup');
            }
          }
        }
      ]
    );
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📤 Exportar & Backup</Text>
        <Text style={styles.subtitle}>Gestión de datos y respaldos</Text>
      </View>

      {/* Información de almacenamiento */}
      {storageInfo && (
        <View style={styles.storageInfo}>
          <Text style={styles.storageTitle}>💾 Información de Almacenamiento</Text>
          <View style={styles.storageGrid}>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Espacio Libre</Text>
              <Text style={styles.storageValue}>{formatFileSize(storageInfo.freeSpace)}</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Backups</Text>
              <Text style={styles.storageValue}>{storageInfo.backupCount}</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Tamaño Backups</Text>
              <Text style={styles.storageValue}>{formatFileSize(storageInfo.backupSize)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Acciones rápidas */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>🚀 Acciones Rápidas</Text>
        
        <View style={styles.actionGrid}>
          <PremiumButton
            title="📤 Exportar Datos"
            onPress={() => setShowExportModal(true)}
            variant="primary"
            size="medium"
            icon={<Ionicons name="download" size={16} color="white" />}
          />
          
          <PremiumButton
            title="💾 Crear Backup"
            onPress={() => setShowBackupModal(true)}
            variant="secondary"
            size="medium"
            icon={<Ionicons name="archive" size={16} color="#2E7D32" />}
          />
        </View>

        <PremiumButton
          title="📊 Exportar Dashboard"
          onPress={async () => {
            setLoading(true);
            try {
              const dashboardData = {
                timestamp: new Date().toISOString(),
                kpis: { produccion: 1250000, eficiencia: 94.8, cumplimiento: 98.5 },
                charts: { /* datos de gráficos */ }
              };
              
              const filePath = await exportShareService.exportFRIData([dashboardData], {
                format: ExportFormat.JSON,
                includeEvidence: false,
              });
              
              await exportShareService.shareFile(filePath, 'Dashboard FRI ANM');
              
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo exportar el dashboard');
            } finally {
              setLoading(false);
            }
          }}
          variant="secondary"
          size="medium"
          loading={loading}
          icon={<Ionicons name="analytics" size={16} color="#2E7D32" />}
        />
      </View>

      {/* Lista de backups */}
      <View style={styles.backupsList}>
        <Text style={styles.sectionTitle}>📁 Backups Disponibles</Text>
        
        {backupList.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No hay backups disponibles</Text>
            <Text style={styles.emptySubtext}>Crea tu primer backup para comenzar</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.backupGrid}>
              {backupList.map((backup, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.backupCard}
                  onPress={() => handleRestoreBackup(backup)}
                  onLongPress={() => handleDeleteBackup(backup)}
                  activeOpacity={0.8}
                >
                  <View style={styles.backupHeader}>
                    <Ionicons 
                      name={backup.type === 'full' ? 'archive' : 'document'} 
                      size={20} 
                      color="#2E7D32" 
                    />
                    <Text style={styles.backupType}>{backup.type.toUpperCase()}</Text>
                  </View>
                  
                  <Text style={styles.backupDate}>
                    {new Date(backup.backupDate).toLocaleDateString('es-CO')}
                  </Text>
                  
                  <Text style={styles.backupSize}>
                    {formatFileSize(backup.size)}
                  </Text>
                  
                  <View style={styles.backupActions}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleRestoreBackup(backup)}
                    >
                      <Ionicons name="refresh" size={16} color="#3498db" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => shareExportedFile(backup.filePath)}
                    >
                      <Ionicons name="share" size={16} color="#27ae60" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleDeleteBackup(backup)}
                    >
                      <Ionicons name="trash" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Modal de Exportación */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📤 Exportar Datos</Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Formato de exportación */}
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Formato de Archivo</Text>
              <View style={styles.formatGrid}>
                {Object.values(ExportFormat).map((format) => (
                  <PremiumButton
                    key={format}
                    title={format.toUpperCase()}
                    onPress={() => setExportFormat(format)}
                    variant={exportFormat === format ? 'primary' : 'secondary'}
                    size="small"
                  />
                ))}
              </View>
            </View>

            {/* Opciones */}
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Opciones</Text>
              
              <View style={styles.switchOption}>
                <Text style={styles.switchLabel}>Incluir Evidencias</Text>
                <Switch
                  value={includeEvidence}
                  onValueChange={setIncludeEvidence}
                  trackColor={{ false: '#ccc', true: '#2E7D32' }}
                />
              </View>
              
              <View style={styles.switchOption}>
                <Text style={styles.switchLabel}>Comprimir Datos</Text>
                <Switch
                  value={compressData}
                  onValueChange={setCompressData}
                  trackColor={{ false: '#ccc', true: '#2E7D32' }}
                />
              </View>
            </View>

            {/* Información */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📊 Se exportarán {data.length} registros FRI
              </Text>
              <Text style={styles.infoText}>
                📁 Formato: {exportFormat.toUpperCase()}
              </Text>
              <Text style={styles.infoText}>
                📸 Evidencias: {includeEvidence ? 'Incluidas' : 'No incluidas'}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <PremiumButton
              title="❌ Cancelar"
              onPress={() => setShowExportModal(false)}
              variant="secondary"
              size="medium"
            />
            
            <PremiumButton
              title="📤 Exportar"
              onPress={handleExport}
              variant="primary"
              size="medium"
              loading={loading}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Backup */}
      <Modal
        visible={showBackupModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBackupModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💾 Crear Backup</Text>
            <TouchableOpacity onPress={() => setShowBackupModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Tipo de backup */}
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Tipo de Backup</Text>
              <View style={styles.backupTypeGrid}>
                {Object.values(BackupType).map((type) => (
                  <PremiumButton
                    key={type}
                    title={type.replace('_', ' ').toUpperCase()}
                    onPress={() => setBackupType(type)}
                    variant={backupType === type ? 'primary' : 'secondary'}
                    size="small"
                  />
                ))}
              </View>
            </View>

            {/* Opciones */}
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Opciones</Text>
              
              <View style={styles.switchOption}>
                <Text style={styles.switchLabel}>Incluir Imágenes</Text>
                <Switch
                  value={includeImages}
                  onValueChange={setIncludeImages}
                  trackColor={{ false: '#ccc', true: '#2E7D32' }}
                />
              </View>
            </View>

            {/* Información */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💾 Tipo: {backupType.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.infoText}>
                📸 Imágenes: {includeImages ? 'Incluidas' : 'No incluidas'}
              </Text>
              <Text style={styles.infoText}>
                📅 Se creará un backup con fecha actual
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <PremiumButton
              title="❌ Cancelar"
              onPress={() => setShowBackupModal(false)}
              variant="secondary"
              size="medium"
            />
            
            <PremiumButton
              title="💾 Crear"
              onPress={handleCreateBackup}
              variant="primary"
              size="medium"
              loading={loading}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  storageInfo: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  storageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storageItem: {
    alignItems: 'center',
  },
  storageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  quickActions: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  backupsList: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  backupGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  backupCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    width: 140,
    borderWidth: 1,
    borderColor: '#eee',
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  backupType: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  backupDate: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  backupSize: {
    fontSize: 10,
    color: '#666',
    marginBottom: 8,
  },
  backupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionIcon: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  optionSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  formatGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  backupTypeGrid: {
    gap: 8,
  },
  switchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
});