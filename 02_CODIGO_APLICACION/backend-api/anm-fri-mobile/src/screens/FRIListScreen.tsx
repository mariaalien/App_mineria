// src/screens/FRIListScreen.tsx - Lista de FRIs con exportación múltiple
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFRIExport } from '../../hooks/useFRIExport'; // ⬅️ IMPORTAR EL HOOK

interface FRIItem {
  id: string;
  tipo: string;
  fecha: string;
  evidencias: any[];
  ubicacion: any;
  datos: any;
}

export default function FRIListScreen({ navigation }: any) {
  const [friList, setFriList] = useState<FRIItem[]>([]);
  const [selectedFRIs, setSelectedFRIs] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // ⬅️ USAR EL HOOK DE EXPORTACIÓN
  const { 
    exportMultipleFRIs,
    exportAndShareFRI,
    isExporting,
    exportProgress,
    getExportHistory,
    cleanupExportHistory
  } = useFRIExport();

  useEffect(() => {
    loadFRIList();
    // Limpiar archivos antiguos al inicio
    cleanupExportHistory(30);
  }, []);

  const loadFRIList = async () => {
    // Aquí cargarías tus FRIs desde AsyncStorage o API
    const mockFRIs: FRIItem[] = [
      {
        id: '1',
        tipo: 'mensual',
        fecha: '2024-01-15',
        evidencias: [{ id: '1', type: 'Sitio' }],
        ubicacion: { lat: 4.6097, lng: -74.0817 },
        datos: { mineral: 'Oro' }
      },
      {
        id: '2',
        tipo: 'trimestral',
        fecha: '2024-01-10',
        evidencias: [{ id: '2', type: 'Maquinaria' }],
        ubicacion: { lat: 4.6097, lng: -74.0817 },
        datos: { mineral: 'Carbón' }
      },
    ];
    setFriList(mockFRIs);
  };

  // ⬅️ FUNCIÓN PARA EXPORTAR FRI INDIVIDUAL
  const exportSingleFRI = async (fri: FRIItem) => {
    try {
      const success = await exportAndShareFRI(fri, {
        format: 'json',
        includePhotos: true,
        autoSave: true
      });

      if (success) {
        Alert.alert('Éxito', `FRI ${fri.tipo} exportado correctamente`);
      }
    } catch (error) {
      console.error('❌ Error exportando FRI individual:', error);
    }
  };

  // ⬅️ FUNCIÓN PARA EXPORTAR MÚLTIPLES FRIs
  const exportSelectedFRIs = async () => {
    if (selectedFRIs.length === 0) {
      Alert.alert('Selección', 'Selecciona al menos un FRI para exportar');
      return;
    }

    try {
      const selectedFRIData = friList.filter(fri => selectedFRIs.includes(fri.id));
      
      Alert.alert(
        'Exportar FRIs Seleccionados',
        `¿Exportar ${selectedFRIs.length} FRI(s)?`,
        [
          {
            text: 'JSON Completo',
            onPress: () => processMultipleExport(selectedFRIData, 'json', true)
          },
          {
            text: 'CSV para Excel',
            onPress: () => processMultipleExport(selectedFRIData, 'csv', false)
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );

    } catch (error) {
      console.error('❌ Error preparando exportación múltiple:', error);
    }
  };

  const processMultipleExport = async (
    fris: FRIItem[], 
    format: 'json' | 'csv' | 'txt', 
    includePhotos: boolean
  ) => {
    try {
      const result = await exportMultipleFRIs(fris, {
        format,
        includePhotos,
        autoSave: true
      });

      if (result.success) {
        Alert.alert(
          'Exportación Completada',
          `${fris.length} FRI(s) exportados exitosamente`,
          [
            {
              text: 'Compartir Ahora',
              onPress: async () => {
                if (result.filePath) {
                  // Usar el servicio para compartir
                  const { ExportShareService } = await import('../services/exportShareService');
                  await ExportShareService.shareFile(result.filePath, 'FRIs Consolidados');
                }
              }
            },
            { text: 'OK' }
          ]
        );
        
        // Limpiar selección
        setSelectedFRIs([]);
        setSelectionMode(false);
      } else {
        Alert.alert('Error', result.error || 'No se pudieron exportar los FRIs');
      }

    } catch (error) {
      console.error('❌ Error en exportación múltiple:', error);
      Alert.alert('Error', 'No se pudo completar la exportación');
    }
  };

  // ⬅️ FUNCIÓN PARA MOSTRAR ESTADÍSTICAS DE EXPORTACIÓN
  const showExportStats = async () => {
    try {
      const history = await getExportHistory();
      
      const stats = {
        total: history.length,
        thisMonth: history.filter(item => {
          const exportDate = new Date(item.exportDate);
          const now = new Date();
          return exportDate.getMonth() === now.getMonth() && 
                 exportDate.getFullYear() === now.getFullYear();
        }).length,
        byFormat: history.reduce((acc, item) => {
          acc[item.format] = (acc[item.format] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      Alert.alert(
        'Estadísticas de Exportación',
        `Total exportaciones: ${stats.total}
Este mes: ${stats.thisMonth}
JSON: ${stats.byFormat.json || 0}
CSV: ${stats.byFormat.csv || 0}
TXT: ${stats.byFormat.txt || 0}`,
        [
          {
            text: 'Limpiar Historial',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Confirmar',
                '¿Eliminar historial de exportaciones?',
                [
                  { text: 'Cancelar' },
                  { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: () => cleanupExportHistory(0) 
                  }
                ]
              );
            }
          },
          { text: 'Cerrar' }
        ]
      );

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
    }
  };

  const toggleSelection = (friId: string) => {
    if (selectedFRIs.includes(friId)) {
      setSelectedFRIs(prev => prev.filter(id => id !== friId));
    } else {
      setSelectedFRIs(prev => [...prev, friId]);
    }
  };

  const renderFRIItem = ({ item }: { item: FRIItem }) => (
    <TouchableOpacity
      style={[
        styles.friCard,
        selectedFRIs.includes(item.id) && styles.selectedCard
      ]}
      onPress={() => {
        if (selectionMode) {
          toggleSelection(item.id);
        } else {
          navigation.navigate('FRIDetail', { friId: item.id });
        }
      }}
      onLongPress={() => {
        setSelectionMode(true);
        toggleSelection(item.id);
      }}
    >
      <View style={styles.friHeader}>
        <Text style={styles.friType}>📋 FRI {item.tipo.toUpperCase()}</Text>
        <Text style={styles.friDate}>{new Date(item.fecha).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.friInfo}>
        <Text style={styles.friDetail}>
          📸 {item.evidencias?.length || 0} evidencias
        </Text>
        <Text style={styles.friDetail}>
          📍 {item.ubicacion ? 'Con GPS' : 'Sin GPS'}
        </Text>
      </View>

      <View style={styles.friActions}>
        {selectionMode && (
          <View style={styles.checkbox}>
            <Ionicons 
              name={selectedFRIs.includes(item.id) ? "checkbox" : "square-outline"} 
              size={20} 
              color="#007AFF" 
            />
          </View>
        )}
        
        <TouchableOpacity
          style={styles.exportIconButton}
          onPress={() => exportSingleFRI(item)}
          disabled={isExporting}
        >
          <Ionicons 
            name="share-outline" 
            size={16} 
            color={isExporting ? "#999" : "#007AFF"} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis FRIs</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={showExportStats}>
            <Ionicons name="stats-chart-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectionMode(!selectionMode)}>
            <Ionicons 
              name={selectionMode ? "close" : "checkmark-circle-outline"} 
              size={24} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de selección múltiple */}
      {selectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedFRIs.length} seleccionado(s)
          </Text>
          <TouchableOpacity 
            style={styles.exportSelectedButton}
            onPress={exportSelectedFRIs}
            disabled={selectedFRIs.length === 0 || isExporting}
          >
            <Ionicons name="download-outline" size={16} color="white" />
            <Text style={styles.exportSelectedText}>Exportar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Indicador de progreso */}
      {isExporting && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Exportando... {exportProgress}%
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${exportProgress}%` }]} 
            />
          </View>
        </View>
      )}

      {/* Lista de FRIs */}
      <FlatList
        data={friList}
        renderItem={renderFRIItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  selectionText: {
    fontSize: 14,
    color: '#1976D2',
  },
  exportSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  exportSelectedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  progressText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  listContainer: {
    padding: 16,
  },
  friCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  friHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  friType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  friDate: {
    fontSize: 14,
    color: '#6D6D80',
  },
  friInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  friDetail: {
    fontSize: 12,
    color: '#6D6D80',
  },
  friActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkbox: {
    padding: 4,
  },
  exportIconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F0F8FF',
  },
});