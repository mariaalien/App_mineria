// ================================
// 📁 controllers/friController.js - CONTROLADORES CRUD GENÉRICOS + ESPECÍFICOS
// ================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// =============================================================================
// MAPEO DE TIPOS FRI A MODELOS PRISMA
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

const getFRIModel = (tipoFRI) => {
  const modelName = FRI_MODELS[tipoFRI];
  if (!modelName) {
    throw new Error(`Tipo de FRI no válido: ${tipoFRI}`);
  }
  return modelName;
};

// =============================================================================
// CONTROLADOR GENÉRICO FACTORY - CREA CONTROLADORES PARA CUALQUIER FRI
// =============================================================================

const createFRIController = (tipoFRI) => {
  const modelName = getFRIModel(tipoFRI);
  
  return {
    // 📝 CREAR NUEVO REGISTRO FRI
    async create(req, res) {
      try {
        const userId = req.user.userId;
        const data = req.validatedData || req.body;
        
        console.log(`📝 Creando registro FRI ${tipoFRI} para usuario: ${req.user.email}`);

        const friRecord = await prisma[modelName].create({
          data: {
            ...data,
            usuarioId: userId,
            sincronizado: true
          },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true
              }
            }
          }
        });

        console.log(`✅ Registro FRI ${tipoFRI} creado exitosamente: ${friRecord.id}`);

        res.status(201).json({
          success: true,
          message: `Registro FRI ${tipoFRI} creado exitosamente`,
          data: friRecord
        });

      } catch (error) {
        console.error(`❌ Error al crear registro FRI ${tipoFRI}:`, error);
        
        if (error.code === 'P2002') {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un registro con estos datos',
            code: 'DUPLICATE_ENTRY'
          });
        }

        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    },

    // 📋 OBTENER MÚLTIPLES REGISTROS CON FILTROS Y PAGINACIÓN
    async getAll(req, res) {
      try {
        const {
          page = 1,
          limit = 10,
          startDate,
          endDate,
          search,
          orderBy = 'createdAt',
          order = 'desc',
          mineral,
          tituloMinero,
          userId: filterUserId
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Construir filtros dinámicos
        const where = {};

        // Filtro por fechas
        if (startDate || endDate) {
          where.createdAt = {};
          if (startDate) where.createdAt.gte = new Date(startDate);
          if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Filtro por mineral
        if (mineral) {
          where.mineral = { contains: mineral, mode: 'insensitive' };
        }

        // Filtro por título minero
        if (tituloMinero) {
          where.tituloMinero = { contains: tituloMinero, mode: 'insensitive' };
        }

        // Búsqueda general (solo si el modelo tiene estos campos)
        if (search) {
          const hasSearchFields = ['mineral', 'tituloMinero'].some(field => 
            prisma[modelName].fields && prisma[modelName].fields[field]
          );
          
          if (hasSearchFields) {
            where.OR = [
              { mineral: { contains: search, mode: 'insensitive' } },
              { tituloMinero: { contains: search, mode: 'insensitive' } }
            ];
          }
        }

        // Control de acceso: si no es admin, solo ver sus registros
        if (req.user.rol !== 'ADMIN') {
          where.usuarioId = req.user.userId;
        } else if (filterUserId) {
          where.usuarioId = filterUserId;
        }

        // Ejecutar consultas en paralelo
        const [records, total] = await Promise.all([
          prisma[modelName].findMany({
            where,
            skip,
            take,
            orderBy: { [orderBy]: order },
            include: {
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                  rol: true
                }
              }
            }
          }),
          prisma[modelName].count({ where })
        ]);

        const totalPages = Math.ceil(total / take);

        console.log(`📋 Obtenidos ${records.length} registros FRI ${tipoFRI} de ${total} total`);

        res.json({
          success: true,
          data: {
            records,
            tipoFRI,
            pagination: {
              page: parseInt(page),
              limit: take,
              total,
              totalPages,
              hasNext: parseInt(page) < totalPages,
              hasPrev: parseInt(page) > 1
            },
            filters: {
              startDate,
              endDate,
              search,
              mineral,
              tituloMinero
            }
          }
        });

      } catch (error) {
        console.error(`❌ Error al obtener registros FRI ${tipoFRI}:`, error);
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    },

    // 👁️ OBTENER UN REGISTRO ESPECÍFICO POR ID
    async getById(req, res) {
      try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.rol;

        console.log(`👁️ Obteniendo registro FRI ${tipoFRI} ID: ${id}`);

        const where = { id: id };

        // Control de acceso: si no es admin, solo ver sus propios registros
        if (userRole !== 'ADMIN') {
          where.usuarioId = userId;
        }

        const record = await prisma[modelName].findFirst({
          where,
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true
              }
            }
          }
        });

        if (!record) {
          return res.status(404).json({
            success: false,
            message: `Registro FRI ${tipoFRI} no encontrado`,
            code: 'NOT_FOUND'
          });
        }

        console.log(`✅ Registro FRI ${tipoFRI} encontrado: ${record.id}`);

        res.json({
          success: true,
          data: record
        });

      } catch (error) {
        console.error(`❌ Error al obtener registro FRI ${tipoFRI}:`, error);
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    },

    // 📝 ACTUALIZAR REGISTRO FRI
    async update(req, res) {
      try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.rol;
        const data = req.validatedData || req.body;

        console.log(`📝 Actualizando registro FRI ${tipoFRI} ID: ${id}`);

        const where = { id: id };

        // Control de acceso: si no es admin, solo actualizar sus registros
        if (userRole !== 'ADMIN') {
          where.usuarioId = userId;
        }

        // Verificar que el registro existe y pertenece al usuario
        const existingRecord = await prisma[modelName].findFirst({ where });

        if (!existingRecord) {
          return res.status(404).json({
            success: false,
            message: `Registro FRI ${tipoFRI} no encontrado o no tienes permisos`,
            code: 'NOT_FOUND'
          });
        }

        // Actualizar el registro
        const updatedRecord = await prisma[modelName].update({
          where: { id: id },
          data: {
            ...data,
            updatedAt: new Date(),
            sincronizado: true
          },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true
              }
            }
          }
        });

        console.log(`✅ Registro FRI ${tipoFRI} actualizado: ${updatedRecord.id}`);

        res.json({
          success: true,
          message: `Registro FRI ${tipoFRI} actualizado exitosamente`,
          data: updatedRecord
        });

      } catch (error) {
        console.error(`❌ Error al actualizar registro FRI ${tipoFRI}:`, error);
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    },

    // 🗑️ ELIMINAR REGISTRO FRI
    async delete(req, res) {
      try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.rol;

        console.log(`🗑️ Eliminando registro FRI ${tipoFRI} ID: ${id}`);

        const where = { id: id };

        // Control de acceso: si no es admin, solo eliminar sus registros
        if (userRole !== 'ADMIN') {
          where.usuarioId = userId;
        }

        // Verificar que el registro existe
        const existingRecord = await prisma[modelName].findFirst({ where });

        if (!existingRecord) {
          return res.status(404).json({
            success: false,
            message: `Registro FRI ${tipoFRI} no encontrado o no tienes permisos`,
            code: 'NOT_FOUND'
          });
        }

        // Eliminar el registro
        await prisma[modelName].delete({
          where: { id: id }
        });

        console.log(`✅ Registro FRI ${tipoFRI} eliminado: ${id}`);

        res.json({
          success: true,
          message: `Registro FRI ${tipoFRI} eliminado exitosamente`
        });

      } catch (error) {
        console.error(`❌ Error al eliminar registro FRI ${tipoFRI}:`, error);
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    },

    // 📊 OBTENER ESTADÍSTICAS DEL FRI ESPECÍFICO
    async getStats(req, res) {
      try {
        const userRole = req.user.rol;
        const userId = req.user.userId;

        const where = {};
        
        // Si no es admin, solo estadísticas de sus registros
        if (userRole !== 'ADMIN') {
          where.usuarioId = userId;
        }

        // Obtener estadísticas básicas
        const [total, thisMonth, thisYear] = await Promise.all([
          prisma[modelName].count({ where }),
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
                gte: new Date(new Date().getFullYear(), 0, 1)
              }
            }
          })
        ]);

        // Estadísticas por mes (últimos 12 meses)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const monthlyStats = await prisma[modelName].groupBy({
          by: ['createdAt'],
          where: {
            ...where,
            createdAt: {
              gte: oneYearAgo
            }
          },
          _count: true
        });

        // Procesar datos mensuales
        const monthlyMap = {};
        monthlyStats.forEach(item => {
          const month = item.createdAt.toISOString().slice(0, 7); // YYYY-MM
          monthlyMap[month] = (monthlyMap[month] || 0) + item._count;
        });

        const monthlyData = Object.entries(monthlyMap)
          .map(([mes, cantidad]) => ({ mes, cantidad }))
          .sort((a, b) => a.mes.localeCompare(b.mes));

        const result = {
          tipoFRI,
          resumen: {
            total,
            esteMes: thisMonth,
            esteAno: thisYear
          },
          tendenciaMensual: monthlyData,
          usuario: {
            nombre: req.user.username || req.user.nombre,
            rol: req.user.rol,
            esAdmin: req.user.rol === 'ADMIN'
          }
        };

        res.json({
          success: true,
          data: result
        });

      } catch (error) {
        console.error(`❌ Error al obtener estadísticas FRI ${tipoFRI}:`, error);
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  };
};

// =============================================================================
// CONTROLADORES ESPECÍFICOS PARA CADA TIPO DE FRI
// =============================================================================

const friProduccionController = createFRIController('produccion');
const friInventariosController = createFRIController('inventarios');
const friParadasController = createFRIController('paradas');
const friEjecucionController = createFRIController('ejecucion');
const friMaquinariaController = createFRIController('maquinaria');
const friRegaliasController = createFRIController('regalias');
const friInventarioMaquinariaController = createFRIController('inventario-maquinaria');
const friCapacidadController = createFRIController('capacidad');
const friProyeccionesController = createFRIController('proyecciones');

// =============================================================================
// CONTROLADOR DASHBOARD GENERAL - ESTADÍSTICAS DE TODOS LOS FRI
// =============================================================================

const dashboardController = {
  async getGeneralStats(req, res) {
    try {
      const userRole = req.user.rol;
      const userId = req.user.userId;

      const where = {};
      
      // Si no es admin, solo estadísticas de sus registros
      if (userRole !== 'ADMIN') {
        where.usuarioId = userId;
      }

      console.log(`📊 Obteniendo estadísticas generales para: ${req.user.email}`);

      // Obtener estadísticas de todos los tipos de FRI
      const stats = {};

      for (const [tipoFRI, modelName] of Object.entries(FRI_MODELS)) {
        try {
          const count = await prisma[modelName].count({ where });
          stats[tipoFRI] = count;
        } catch (error) {
          console.warn(`⚠️ Error obteniendo stats para ${modelName}:`, error.message);
          stats[tipoFRI] = 0;
        }
      }

      // Calcular totales
      const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);

      // Top 5 tipos de FRI más usados
      const topFRITypes = Object.entries(stats)
        .map(([tipo, cantidad]) => ({ tipo, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Actividad reciente (últimos 30 días) usando FRIProduccion como ejemplo
      let actividadReciente = [];
      try {
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

        const recentActivity = await prisma.fRIProduccion.findMany({
          where: {
            ...where,
            createdAt: {
              gte: treintaDiasAtras
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            usuario: {
              select: {
                nombre: true,
                email: true
              }
            }
          }
        });

        actividadReciente = recentActivity.map(record => ({
          id: record.id,
          tipo: 'produccion',
          mineral: record.mineral,
          tituloMinero: record.tituloMinero,
          fecha: record.createdAt,
          usuario: record.usuario.nombre
        }));
      } catch (error) {
        console.warn('⚠️ Error obteniendo actividad reciente:', error.message);
      }

      const result = {
        resumen: {
          totalRegistros: totalRecords,
          tiposActivos: Object.values(stats).filter(count => count > 0).length,
          registrosEsteMes: 0, // Se calculará en una mejora futura
          usuariosActivos: 1 // Simplificado por ahora
        },
        porTipoFRI: topFRITypes,
        estadisticasDetalladas: stats,
        actividadReciente,
        usuario: {
          nombre: req.user.username || req.user.nombre,
          rol: req.user.rol,
          esAdmin: req.user.rol === 'ADMIN'
        },
        configuracion: {
          formatosFRI: Object.keys(FRI_MODELS).length,
          cumplimiento: 'Resolución ANM 371/2024'
        }
      };

      console.log(`✅ Estadísticas generales calculadas: ${totalRecords} registros total`);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('❌ Error al obtener estadísticas generales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// =============================================================================
// EXPORTACIONES
// =============================================================================

module.exports = {
  // Factory para crear controladores dinámicos
  createFRIController,
  
  // Controladores específicos listos para usar
  friProduccionController,
  friInventariosController,
  friParadasController,
  friEjecucionController,
  friMaquinariaController,
  friRegaliasController,
  friInventarioMaquinariaController,
  friCapacidadController,
  friProyeccionesController,
  
  // Dashboard general
  dashboardController,
  
  // Utilidades
  FRI_MODELS,
  getFRIModel
};