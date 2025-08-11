// src/components/MobileDashboard.tsx - Dashboard móvil con gráficos interactivos
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  PanGestureHandler,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import PremiumButton from './PremiumButton';

// Obtener dimensiones de pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const chartWidth = screenWidth - 40;
const chartHeight = 200;

// Datos mock para los gráficos
const mockData = {
  produccionMensual: [
    { mes: 'Ene', oro: 120, plata: 850, carbon: 15000 },
    { mes: 'Feb', oro: 135, plata: 920, carbon: 18000 },
    { mes: 'Mar', oro: 158, plata: 1100, carbon: 22000 },
    { mes: 'Abr', oro: 142, plata: 980, carbon: 19500 },
    { mes: 'May', oro: 168, plata: 1250, carbon: 25000 },
    { mes: 'Jun', oro: 175, plata: 1300, carbon: 28000 },
  ],
  estadisticasKPI: {
    totalProduccion: { valor: 1250000, cambio: 12.5, unidad: 'COP' },
    eficiencia: { valor: 94.8, cambio: 3.2, unidad: '%' },
    cumplimiento: { valor: 98.5, cambio: 1.8, unidad: '%' },
    friEnviados: { valor: 15, cambio: 5, unidad: '' },
  },
  distribucionMinerales: [
    { mineral: 'Oro', cantidad: 158, porcentaje: 35, color: '#FFD700' },
    { mineral: 'Plata', cantidad: 1250, porcentaje: 28, color: '#C0C0C0' },
    { mineral: 'Carbón', cantidad: 25000, porcentaje: 37, color: '#2C3E50' },
  ],
  tendenciaSemanal: [
    { dia: 'Lun', valor: 85 },
    { dia: 'Mar', valor: 92 },
    { dia: 'Mié', valor: 78 },
    { dia: 'Jue', valor: 96 },
    { dia: 'Vie', valor: 88 },
    { dia: 'Sáb', valor: 94 },
    { dia: 'Dom', valor: 82 },
  ]
};

interface MobileDashboardProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export default function MobileDashboard({ onRefresh, loading = false }: MobileDashboardProps) {
  const [selectedChart, setSelectedChart] = useState<'produccion' | 'tendencia' | 'distribucion'>('produccion');
  const [selectedMineral, setSelectedMineral] = useState<string>('oro');
  const [touchPoint, setTouchPoint] = useState<{ x: number; y: number } | null>(null);

  // Componente KPI Card
  const KPICard = ({ title, icon, valor, cambio, unidad, color = '#2E7D32' }: any) => (
    <TouchableOpacity 
      style={styles.kpiCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log(`📊 KPI seleccionado: ${title}`);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.kpiHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.kpiTitle}>{title}</Text>
      </View>
      
      <Text style={[styles.kpiValue, { color }]}>
        {typeof valor === 'number' ? valor.toLocaleString('es-CO') : valor}{unidad}
      </Text>
      
      <View style={styles.kpiChange}>
        <Ionicons 
          name={cambio >= 0 ? "trending-up" : "trending-down"} 
          size={12} 
          color={cambio >= 0 ? '#27ae60' : '#e74c3c'} 
        />
        <Text style={[styles.kpiChangeText, { color: cambio >= 0 ? '#27ae60' : '#e74c3c' }]}>
          {cambio >= 0 ? '+' : ''}{cambio}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Componente Gráfico de Barras Interactivo
  const BarChart = ({ data, selectedMineral }: any) => {
    const maxValue = Math.max(...data.map((item: any) => item[selectedMineral]));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          📊 Producción Mensual - {selectedMineral.charAt(0).toUpperCase() + selectedMineral.slice(1)}
        </Text>
        
        <View style={styles.chart}>
          {data.map((item: any, index: number) => {
            const barHeight = (item[selectedMineral] / maxValue) * (chartHeight - 60);
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.barContainer}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  console.log(`📊 Mes seleccionado: ${item.mes} - ${item[selectedMineral]}`);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.barWrapper}>
                  <Text style={styles.barValue}>{item[selectedMineral]}</Text>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight,
                        backgroundColor: selectedMineral === 'oro' ? '#FFD700' : 
                                       selectedMineral === 'plata' ? '#C0C0C0' : '#2C3E50'
                      }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{item.mes}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Componente Gráfico de Línea Interactivo
  const LineChart = ({ data }: any) => {
    const maxValue = Math.max(...data.map((item: any) => item.valor));
    const minValue = Math.min(...data.map((item: any) => item.valor));
    const range = maxValue - minValue;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📈 Tendencia Semanal</Text>
        
        <View style={styles.chart}>
          <View style={styles.lineChartContainer}>
            {/* Puntos y líneas */}
            {data.map((item: any, index: number) => {
              const x = (index / (data.length - 1)) * (chartWidth - 40);
              const y = chartHeight - 80 - ((item.valor - minValue) / range) * (chartHeight - 100);
              
              return (
                <View key={index}>
                  {/* Línea al siguiente punto */}
                  {index < data.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        {
                          left: x + 20,
                          top: y + 20,
                          width: Math.sqrt(
                            Math.pow((chartWidth - 40) / (data.length - 1), 2) +
                            Math.pow(
                              ((data[index + 1].valor - minValue) / range) * (chartHeight - 100) -
                              ((item.valor - minValue) / range) * (chartHeight - 100), 2
                            )
                          ),
                          transform: [
                            {
                              rotate: `${Math.atan2(
                                ((data[index + 1].valor - minValue) / range) * (chartHeight - 100) -
                                ((item.valor - minValue) / range) * (chartHeight - 100),
                                (chartWidth - 40) / (data.length - 1)
                              )}rad`,
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                  
                  {/* Punto */}
                  <TouchableOpacity
                    style={[styles.linePoint, { left: x + 20, top: y + 20 }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      console.log(`📈 Punto seleccionado: ${item.dia} - ${item.valor}`);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pointValue}>{item.valor}</Text>
                  </TouchableOpacity>
                  
                  {/* Label */}
                  <Text style={[styles.lineLabel, { left: x + 20, top: y + 60 }]}>
                    {item.dia}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // Componente Gráfico Circular (Donut Chart)
  const DonutChart = ({ data }: any) => {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>🥧 Distribución por Mineral</Text>
        
        <View style={styles.donutContainer}>
          {/* Gráfico circular simulado con círculos */}
          <View style={styles.donutChart}>
            {data.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.donutSegment,
                  {
                    backgroundColor: item.color,
                    width: 60 + (item.porcentaje * 2),
                    height: 60 + (item.porcentaje * 2),
                    borderRadius: (60 + (item.porcentaje * 2)) / 2,
                    opacity: 0.8,
                    marginHorizontal: 5,
                  }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  console.log(`🥧 Mineral seleccionado: ${item.mineral} - ${item.porcentaje}%`);
                }}
                activeOpacity={0.6}
              >
                <Text style={styles.donutPercentage}>{item.porcentaje}%</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Leyenda */}
          <View style={styles.donutLegend}>
            {data.map((item: any, index: number) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.mineral}: {item.cantidad.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>📊 Dashboard FRI</Text>
          <Text style={styles.subtitle}>Analytics Móvil Interactivo</Text>
        </View>
        
        <PremiumButton
          title="🔄"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRefresh?.();
          }}
          variant="secondary"
          size="small"
          loading={loading}
        />
      </View>

      {/* KPIs Grid */}
      <View style={styles.kpiGrid}>
        <KPICard
          title="Producción"
          icon="trending-up"
          valor={mockData.estadisticasKPI.totalProduccion.valor}
          cambio={mockData.estadisticasKPI.totalProduccion.cambio}
          unidad=" COP"
          color="#2E7D32"
        />
        
        <KPICard
          title="Eficiencia"
          icon="speedometer"
          valor={mockData.estadisticasKPI.eficiencia.valor}
          cambio={mockData.estadisticasKPI.eficiencia.cambio}
          unidad="%"
          color="#3498db"
        />
        
        <KPICard
          title="Cumplimiento"
          icon="checkmark-circle"
          valor={mockData.estadisticasKPI.cumplimiento.valor}
          cambio={mockData.estadisticasKPI.cumplimiento.cambio}
          unidad="%"
          color="#27ae60"
        />
        
        <KPICard
          title="FRI Enviados"
          icon="document-text"
          valor={mockData.estadisticasKPI.friEnviados.valor}
          cambio={mockData.estadisticasKPI.friEnviados.cambio}
          unidad=""
          color="#e67e22"
        />
      </View>

      {/* Selector de Gráficos */}
      <View style={styles.chartSelector}>
        <Text style={styles.sectionTitle}>📈 Gráficos Interactivos</Text>
        
        <View style={styles.selectorButtons}>
          <PremiumButton
            title="📊 Producción"
            onPress={() => {
              setSelectedChart('produccion');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            variant={selectedChart === 'produccion' ? 'primary' : 'secondary'}
            size="small"
          />
          
          <PremiumButton
            title="📈 Tendencia"
            onPress={() => {
              setSelectedChart('tendencia');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            variant={selectedChart === 'tendencia' ? 'primary' : 'secondary'}
            size="small"
          />
          
          <PremiumButton
            title="🥧 Distribución"
            onPress={() => {
              setSelectedChart('distribucion');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            variant={selectedChart === 'distribucion' ? 'primary' : 'secondary'}
            size="small"
          />
        </View>
      </View>

      {/* Selector de Mineral (solo para gráfico de producción) */}
      {selectedChart === 'produccion' && (
        <View style={styles.mineralSelector}>
          <Text style={styles.mineralTitle}>Seleccionar Mineral:</Text>
          <View style={styles.mineralButtons}>
            {['oro', 'plata', 'carbon'].map((mineral) => (
              <PremiumButton
                key={mineral}
                title={mineral.charAt(0).toUpperCase() + mineral.slice(1)}
                onPress={() => {
                  setSelectedMineral(mineral);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                variant={selectedMineral === mineral ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>
        </View>
      )}

      {/* Gráficos */}
      <View style={styles.chartsSection}>
        {selectedChart === 'produccion' && (
          <BarChart data={mockData.produccionMensual} selectedMineral={selectedMineral} />
        )}
        
        {selectedChart === 'tendencia' && (
          <LineChart data={mockData.tendenciaSemanal} />
        )}
        
        {selectedChart === 'distribucion' && (
          <DonutChart data={mockData.distribucionMinerales} />
        )}
      </View>

      {/* Información Adicional */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Información</Text>
        <Text style={styles.infoText}>
          • Toca cualquier gráfico para ver detalles
        </Text>
        <Text style={styles.infoText}>
          • Los KPIs se actualizan en tiempo real
        </Text>
        <Text style={styles.infoText}>
          • Desliza para ver más gráficos
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📊 Dashboard Móvil • Optimizado para Touch
        </Text>
      </View>
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerInfo: {
    flex: 1,
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: (screenWidth - 60) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  kpiTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kpiChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartSelector: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  mineralSelector: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mineralTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  mineralButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chartsSection: {
    marginHorizontal: 16,
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    height: chartHeight,
    position: 'relative',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 30,
    borderRadius: 4,
    marginVertical: 8,
  },
  barValue: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  lineChartContainer: {
    position: 'relative',
    height: '100%',
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#2E7D32',
  },
  linePoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointValue: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  lineLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  donutContainer: {
    alignItems: 'center',
  },
  donutChart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  donutSegment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  donutLegend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  infoSection: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});