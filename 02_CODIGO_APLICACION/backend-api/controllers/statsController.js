// ================================
// 📁 controllers/statsController.js - ESTADÍSTICAS AVANZADAS Y REPORTES
// ================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// =============================================================================
// MAPEO DE MODELOS FRI PARA ESTADÍSTICAS
// =============================================================================

const FRI_MODELS = {
  'produccion': 'fRIProduccion',
  'inventarios': 'fRIInventarios', 
  'paradas': 'fRIParadasProduccion',
  'ejecucion': 'fRIEjecucion',
  'maquinaria': 'fRIMaquinariaTransporte',
  'regalias': 'fRIRegalias',
  'inventario-maquinaria': 'fRIInventarioMaquinaria',
  'capacidad': 'fRICapacidadTecnologica',
  'proyecciones': 'fRIProyecciones'
};

// =============================================================================
// CONTROLADOR DE ESTADÍSTICAS AVANZADAS
// =============================================================================

class StatsController {

  // 📊 ESTADÍSTICAS GENERALES AVANZADAS
  static async getAdvancedStats(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.rol;
      const { period = 'year', year = new Date().getFullYear() } = req.query;

      console.log(`📊 Generando estadísticas avanzadas para: ${req.user.email}`);

      const where = userRole !== 'ADMIN' ? { usuarioId: userId } : {};

      // Estadísticas básicas de todos los FRI
      const statsPromises = Object.entries(FRI_MODELS).map(async ([friType, modelName]) => {
        try {
          const [total, thisYear, thisMonth] = await Promise.all([
            prisma[modelName].count({ where }),
            prisma[modelName].count({
              where: {
                ...where,
                createdAt: {
                  gte: new Date(`${year}-01-01`),
                  lte: new Date(`${year}-12-31`)
                }
              }
            }),
            prisma[modelName].count({
              where: {
                ...where,
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            })
          ]);

          return {
            tipo: friType,
            total,
            este_ano: thisYear,
            este_mes: thisMonth,
            crecimiento: thisYear > 0 ? ((thisMonth / (thisYear/12)) * 100).toFixed(1) + '%' : '0%'
          };
        } catch (error) {
          console.warn(`⚠️ Error obteniendo stats para ${friType}:`, error.message);
          return {
            tipo: friType,
            total: 0,
            este_ano: 0,
            este_mes: 0,
            crecimiento: '0%'
          };
        }
      });

      const friStats = await Promise.all(statsPromises);

      // Calcular totales generales
      const totales = friStats.reduce((acc, stat) => ({
        total: acc.total + stat.total,
        este_ano: acc.este_ano + stat.este_ano,
        este_mes: acc.este_mes + stat.este_mes
      }), { total: 0, este_ano: 0, este_mes: 0 });

      // Obtener tendencias mensuales (usando FRI Producción como ejemplo)
      const tendenciaMensual = await StatsController.getTendenciaMensual(where, year);

      // Top 5 FRI más utilizados
      const topFRI = friStats
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(stat => ({
          tipo: stat.tipo,
          cantidad: stat.total,
          porcentaje: totales.total > 0 ? ((stat.total / totales.total) * 100).toFixed(1) + '%' : '0%'
        }));

      // Actividad reciente (últimos 30 días)
      const actividadReciente = await StatsController.getActividadReciente(where);

      // Métricas de cumplimiento
      const cumplimiento = await StatsController.getCumplimientoMetrics(where);

      const result = {
        periodo: { period, year: parseInt(year) },
        resumen: {
          ...totales,
          promedio_mensual: Math.round(totales.este_ano / 12),
          crecimiento_anual: totales.este_ano > 0 ? '+' + ((totales.este_mes / (totales.este_ano/12)) * 100).toFixed(1) + '%' : '0%'
        },
        por_tipo_fri: friStats,
        top_formatos: topFRI,
        tendencia_mensual: tendenciaMensual,
        actividad_reciente: actividadReciente,
        cumplimiento,
        usuario: {
          nombre: req.user.nombre || req.user.email,
          rol: req.user.rol,
          es_admin: req.user.rol === 'ADMIN'
        },
        generado: new Date().toISOString()
      };

      console.log(`✅ Estadísticas avanzadas generadas: ${totales.total} registros analizados`);

      res.json({
        success: true,
        message: `📊 Estadísticas avanzadas - ${period} ${year}`,
        data: result
      });

    } catch (error) {
      console.error('❌ Error generando estadísticas avanzadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando estadísticas avanzadas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📈 TENDENCIAS MENSUALES
  static async getTendenciaMensual(where, year) {
    try {
      // Usar FRI Producción como ejemplo para tendencias
      const monthlyData = await prisma.fRIProduccion.groupBy({
        by: ['createdAt'],
        where: {
          ...where,
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`)
          }
        },
        _count: true
      });

      // Procesar datos por mes
      const monthlyStats = {};
      for (let month = 1; month <= 12; month++) {
        monthlyStats[month] = 0;
      }

      monthlyData.forEach(item => {
        const month = item.createdAt.getMonth() + 1;
        monthlyStats[month] += item._count;
      });

      return Object.entries(monthlyStats).map(([mes, cantidad]) => ({
        mes: parseInt(mes),
        nombre_mes: new Date(year, parseInt(mes) - 1, 1).toLocaleString('es', { month: 'long' }),
        cantidad,
        acumulado: Object.values(monthlyStats).slice(0, parseInt(mes)).reduce((a, b) => a + b, 0)
      }));

    } catch (error) {
      console.warn('⚠️ Error obteniendo tendencia mensual:', error.message);
      return [];
    }
  }

  // 🕐 ACTIVIDAD RECIENTE
  static async getActividadReciente(where) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivity = await prisma.fRIProduccion.findMany({
        where: {
          ...where,
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          usuario: {
            select: { nombre: true, email: true }
          }
        }
      });

      return recentActivity.map(record => ({
        id: record.id,
        tipo: 'produccion',
        mineral: record.mineral,
        titulo_minero: record.tituloMinero,
        fecha: record.createdAt,
        usuario: record.usuario.nombre,
        hace: StatsController.timeAgo(record.createdAt)
      }));

    } catch (error) {
      console.warn('⚠️ Error obteniendo actividad reciente:', error.message);
      return [];
    }
  }

  // 📋 MÉTRICAS DE CUMPLIMIENTO
  static async getCumplimientoMetrics(where) {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Calcular métricas de cumplimiento esperado vs real
      const expectedMonthly = currentMonth * 5; // 5 FRI mensuales
      const expectedQuarterly = Math.floor(currentMonth / 3) * 1; // 1 FRI trimestral
      const expectedAnnual = currentYear === new Date().getFullYear() ? 3 : 0; // 3 FRI anuales

      const totalExpected = expectedMonthly + expectedQuarterly + expectedAnnual;

      // Obtener datos reales del año actual
      const actualData = await Promise.all(
        Object.entries(FRI_MODELS).map(async ([friType, modelName]) => {
          const count = await prisma[modelName].count({
            where: {
              ...where,
              createdAt: {
                gte: new Date(currentYear, 0, 1)
              }
            }
          });
          return { friType, count };
        })
      );

      const totalActual = actualData.reduce((sum, item) => sum + item.count, 0);
      const cumplimientoPercentage = totalExpected > 0 ? ((totalActual / totalExpected) * 100).toFixed(1) : '0';

      return {
        esperado: totalExpected,
        actual: totalActual,
        cumplimiento: cumplimientoPercentage + '%',
        estado: cumplimientoPercentage >= 80 ? 'EXCELENTE' : 
                cumplimientoPercentage >= 60 ? 'BUENO' : 
                cumplimientoPercentage >= 40 ? 'REGULAR' : 'BAJO',
        por_formato: actualData.map(item => ({
          formato: item.friType,
          registros: item.count
        }))
      };

    } catch (error) {
      console.warn('⚠️ Error calculando cumplimiento:', error.message);
      return {
        esperado: 0,
        actual: 0,
        cumplimiento: '0%',
        estado: 'DESCONOCIDO',
        por_formato: []
      };
    }
  }

  // 📊 ESTADÍSTICAS POR TIPO DE FRI
  static async getStatsByType(req, res) {
    try {
      const { tipo } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.rol;

      if (!FRI_MODELS[tipo]) {
        return res.status(400).json({
          success: false,
          message: `Tipo de FRI no válido: ${tipo}`,
          tipos_validos: Object.keys(FRI_MODELS)
        });
      }

      const modelName = FRI_MODELS[tipo];
      const where = userRole !== 'ADMIN' ? { usuarioId: userId } : {};

      console.log(`📈 Generando estadísticas para FRI ${tipo}`);

      // Estadísticas básicas
      const [total, thisYear, thisMonth, lastMonth] = await Promise.all([
        prisma[modelName].count({ where }),
        prisma[modelName].count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(new Date().getFullYear(), 0, 1)
            }
          }
        }),
        prisma[modelName].count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma[modelName].count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      ]);

      // Crecimiento mensual
      const crecimientoMensual = lastMonth > 0 ? 
        (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) + '%' : 
        thisMonth > 0 ? '+100%' : '0%';

      // Registros recientes
      const registrosRecientes = await prisma[modelName].findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          usuario: {
            select: { nombre: true, email: true }
          }
        }
      });

      const result = {
        tipo,
        resumen: {
          total,
          este_ano: thisYear,
          este_mes: thisMonth,
          mes_anterior: lastMonth,
          crecimiento_mensual: crecimientoMensual
        },
        registros_recientes: registrosRecientes.map(record => ({
          id: record.id,
          fecha: record.createdAt,
          usuario: record.usuario.nombre,
          hace: StatsController.timeAgo(record.createdAt)
        })),
        usuario: {
          nombre: req.user.nombre || req.user.email,
          rol: req.user.rol
        },
        generado: new Date().toISOString()
      };

      res.json({
        success: true,
        message: `📈 Estadísticas FRI ${tipo}`,
        data: result
      });

    } catch (error) {
      console.error(`❌ Error generando estadísticas para FRI ${req.params.tipo}:`, error);
      res.status(500).json({
        success: false,
        message: `Error generando estadísticas para FRI ${req.params.tipo}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📑 GENERAR REPORTE COMPLETO
  static async generateReport(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.rol;
      const { 
        tipos = Object.keys(FRI_MODELS), 
        startDate, 
        endDate,
        format = 'json'
      } = req.query;

      console.log(`📑 Generando reporte completo para: ${req.user.email}`);

      const tiposArray = Array.isArray(tipos) ? tipos : [tipos];
      const where = userRole !== 'ADMIN' ? { usuarioId: userId } : {};

      // Agregar filtros de fecha si se proporcionan
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // Generar reporte por cada tipo de FRI
      const reportePromises = tiposArray.map(async (tipo) => {
        if (!FRI_MODELS[tipo]) return null;

        const modelName = FRI_MODELS[tipo];
        
        try {
          const [registros, total] = await Promise.all([
            prisma[modelName].findMany({
              where,
              orderBy: { createdAt: 'desc' },
              take: 100, // Limitamos a 100 para evitar sobrecarga
              include: {
                usuario: {
                  select: { nombre: true, email: true }
                }
              }
            }),
            prisma[modelName].count({ where })
          ]);

          return {
            tipo,
            total_registros: total,
            registros_incluidos: registros.length,
            registros: registros.map(record => ({
              id: record.id,
              fecha_creacion: record.createdAt,
              fecha_actualizacion: record.updatedAt,
              usuario: record.usuario.nombre,
              // Campos específicos según el tipo
              ...(record.mineral && { mineral: record.mineral }),
              ...(record.tituloMinero && { titulo_minero: record.tituloMinero })
            }))
          };
        } catch (error) {
          console.warn(`⚠️ Error en reporte para ${tipo}:`, error.message);
          return {
            tipo,
            error: error.message,
            total_registros: 0,
            registros_incluidos: 0,
            registros: []
          };
        }
      });

      const reporteData = (await Promise.all(reportePromises)).filter(Boolean);

      const reporte = {
        metadata: {
          generado_por: req.user.nombre || req.user.email,
          rol_usuario: req.user.rol,
          fecha_generacion: new Date().toISOString(),
          filtros: {
            tipos: tiposArray,
            fecha_inicio: startDate,
            fecha_fin: endDate
          },
          total_tipos: reporteData.length,
          total_registros: reporteData.reduce((sum, item) => sum + item.total_registros, 0)
        },
        resumen_ejecutivo: {
          formatos_incluidos: reporteData.length,
          total_registros: reporteData.reduce((sum, item) => sum + item.total_registros, 0),
          periodo: startDate && endDate ? `${startDate} a ${endDate}` : 'Todos los registros',
          cumplimiento: 'Resolución ANM 371/2024'
        },
        datos_por_formato: reporteData
      };

      // Si se solicita formato diferente a JSON
      if (format === 'csv') {
        // En una implementación real, aquí generarías CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_fri.csv"');
        return res.send('CSV generation not implemented yet');
      }

      console.log(`✅ Reporte generado: ${reporte.metadata.total_registros} registros`);

      res.json({
        success: true,
        message: '📑 Reporte completo generado',
        data: reporte
      });

    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte completo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 🕐 FUNCIÓN AUXILIAR: CALCULAR TIEMPO TRANSCURRIDO
  static timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'hace unos segundos';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
    return `hace ${Math.floor(seconds / 86400)} días`;
  }
}

module.exports = StatsController;