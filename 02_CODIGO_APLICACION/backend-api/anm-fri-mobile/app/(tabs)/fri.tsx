// app/(tabs)/fri.tsx - Pantalla principal de FRI con formularios
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchFRIData, fetchFRIStats } from '../../src/store/slices/friSlice';
import { RootState, AppDispatch } from '../../src/store/store';
import FRIForm from '../../src/components/FRIForm';

export default function FRIScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, stats } = useSelector((state: RootState) => state.fri);
  const [showForm, setShowForm] = useState(false);
  const [selectedFRIType, setSelectedFRIType] = useState<'produccion' | 'inventarios' | 'paradas'>('produccion');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await dispatch(fetchFRIData('produccion')).unwrap();
      await dispatch(fetchFRIStats()).unwrap();
    } catch (error) {
      console.error('Error cargando datos FRI:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openForm = (tipo: 'produccion' | 'inventarios' | 'paradas') => {
    setSelectedFRIType(tipo);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    loadData(); // Recargar datos después de crear FRI
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const FRITypeCard = ({ 
    title, 
    description, 
    icon, 
    count, 
    onPress 
  }: {
    title: string;
    description: string;
    icon: any;
    count: number;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.friTypeCard} onPress={onPress}>
      <View style={styles.friTypeHeader}>
        <Ionicons name={icon} size={32} color="#2E7D32" />
        <View style={styles.friTypeInfo}>
          <Text style={styles.friTypeTitle}>{title}</Text>
          <Text style={styles.friTypeDescription}>{description}</Text>
        </View>
        <Text style={styles.friTypeCount}>{count}</Text>
      </View>
      <View style={styles.friTypeAction}>
        <Text style={styles.friTypeActionText}>Crear Nuevo</Text>
        <Ionicons name="add-circle" size={20} color="#2E7D32" />
      </View>
    </TouchableOpacity>
  );

  const FRIListItem = ({ item }: { item: any }) => (
    <View style={styles.friItem}>
      <View style={styles.friItemHeader}>
        <Text style={styles.friItemTitle}>{item.mineral || 'N/A'}</Text>
        <Text style={styles.friItemDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.friItemDetails}>
        <Text style={styles.friItemText}>Título: {item.tituloMinero}</Text>
        <Text style={styles.friItemText}>Municipio: {item.municipio}</Text>
        {item.produccionBruta && (
          <Text style={styles.friItemText}>
            Producción: {item.produccionBruta} {item.unidadMedida}
          </Text>
        )}
      </View>
      <View style={styles.friItemActions}>
        <TouchableOpacity style={styles.friItemButton}>
          <Ionicons name="eye" size={16} color="#2E7D32" />
          <Text style={styles.friItemButtonText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.friItemButton}>
          <Ionicons name="create" size={16} color="#2E7D32" />
          <Text style={styles.friItemButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con estadísticas */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gestión de FRI</Text>
          <Text style={styles.headerSubtitle}>Formatos de Reporte de Información</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.enviados}</Text>
              <Text style={styles.statLabel}>Enviados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.pendientes}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
        </View>

        {/* Tipos de FRI disponibles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crear Nuevo FRI</Text>
          
          <FRITypeCard
            title="FRI Producción"
            description="Reporte de producción minera"
            icon="analytics"
            count={items.filter(item => item.tipoReporte === 'produccion').length}
            onPress={() => openForm('produccion')}
          />
          
          <FRITypeCard
            title="FRI Inventarios"
            description="Control de inventarios"
            icon="cube"
            count={items.filter(item => item.tipoReporte === 'inventarios').length}
            onPress={() => openForm('inventarios')}
          />
          
          <FRITypeCard
            title="FRI Paradas"
            description="Registro de paradas de producción"
            icon="pause-circle"
            count={items.filter(item => item.tipoReporte === 'paradas').length}
            onPress={() => openForm('paradas')}
          />
        </View>

        {/* Lista de FRI recientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FRI Recientes</Text>
          
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No hay FRI creados aún</Text>
              <Text style={styles.emptyStateSubtext}>
                Crea tu primer formato usando los botones de arriba
              </Text>
            </View>
          ) : (
            items.slice(0, 5).map((item, index) => (
              <FRIListItem key={item.id || index} item={item} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal del formulario */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuevo FRI</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <FRIForm
            tipo={selectedFRIType}
            onSuccess={closeForm}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  friTypeCard: {
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
  friTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  friTypeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  friTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  friTypeCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  friTypeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  friTypeActionText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    marginRight: 8,
  },
  friItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  friItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  friItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  friItemDate: {
    fontSize: 12,
    color: '#666',
  },
  friItemDetails: {
    marginBottom: 12,
  },
  friItemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  friItemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  friItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  friItemButtonText: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});