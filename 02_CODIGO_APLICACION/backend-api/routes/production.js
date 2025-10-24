// ==========================================
// 02_CODIGO_APLICACION/backend-api/routes/production.js
// Rutas para Registro de Producción Minera
// ==========================================

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validateProductionEntry } = require('../validators/productionValidators');

const prisma = new PrismaClient();

// =============================================================================
// 📊 RUTAS DE PRODUCCIÓN
// =============================================================================

/**
 * POST /api/production/register
 * Registra una nueva entrada de producción
 */
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const {
      nombre_operador,
      ubicacion,
      titulo_minero,
      tipo_mineral,
      cantidad,
      observaciones,
      latitud,
      longitud,
      fecha_hora,
      es_repeticion,
      entrada_anterior_id
    } = req.body;

    const userId = req.user.id;

    // Validar datos de entrada
    const validation = validateProductionEntry(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: validation.errors
      });
    }

    // Crear entrada de producción
    const productionEntry = await prisma.productionEntry.create({
      data: {
        nombreOperador: nombre_operador,
        ubicacion: ubicacion,
        tituloMinero: titulo_minero,
        tipoMineral: tipo_mineral,
        cantidad: parseFloat(cantidad),
        observaciones: observaciones || '',
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        fechaHora: new Date(fecha_hora),
        esRepeticion: es_repeticion || false,
        entradaAnteriorId: entrada_anterior_id || null,
        operadorId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        operador: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });

    console.log('✅ Entrada de producción registrada:', {
      id: productionEntry.id,
      operador: productionEntry.nombreOperador,
      cantidad: productionEntry.cantidad,
      fecha: productionEntry.fechaHora
    });

    res.status(201).json({
      success: true,
      message: 'Entrada de producción registrada correctamente',
      data: productionEntry
    });

  } catch (error) {
    console.error('❌ Error registrando producción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/production/sync-offline
 * Sincroniza entradas guardadas offline
 */
router.post('/sync-offline', authenticateToken, async (req, res) => {
  try {
    const { entries } = req.body;
    const userId = req.user.id;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de entradas inválido'
      });
    }

    const syncedEntries = [];
    const errors = [];

    for (const entry of entries) {
      try {
        // Validar entrada offline
        const validation = validateProductionEntry(entry);
        if (!validation.isValid) {
          errors.push({
            entry: entry.id || 'unknown',
            errors: validation.errors
          });
          continue;
        }

        // Crear entrada en la base de datos
        const productionEntry = await prisma.productionEntry.create({
          data: {
            nombreOperador: entry.nombreOperador,
            ubicacion: entry.ubicacion,
            tituloMinero: entry.tituloMinero,
            tipoMineral: entry.tipoMineral,
            cantidad: parseFloat(entry.cantidad),
            observaciones: entry.observaciones || '',
            latitud: parseFloat(entry.coordenadas?.latitude),
            longitud: parseFloat(entry.coordenadas?.longitude),
            fechaHora: new Date(entry.fechaHora),
            esRepeticion: entry.esRepeticion || false,
            entradaAnteriorId: entry.entradaAnteriorId || null,
            operadorId: userId,
            savedOffline: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        syncedEntries.push(productionEntry);

      } catch (entryError) {
        console.error('Error sincronizando entrada:', entryError);
        errors.push({
          entry: entry.id || 'unknown',
          error: entryError.message
        });
      }
    }

    console.log(`✅ Sincronizadas ${syncedEntries.length} entradas offline`);

    res.json({
      success: true,
      message: `${syncedEntries.length} entradas sincronizadas correctamente`,
      data: {
        syncedCount: syncedEntries.length,
        syncedEntries,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('❌ Error sincronizando entradas offline:', error);
    res.status(500).json({
      success: false,
      message: 'Error sincronizando entradas offline'
    });
  }
});

/**
 * GET /api/production/history
 * Obtiene el historial de producción del usuario
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      tipoMineral,
      tituloMinero
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {
      operadorId: userId
    };

    if (startDate || endDate) {
      where.fechaHora = {};
      if (startDate) where.fechaHora.gte = new Date(startDate);
      if (endDate) where.fechaHora.lte = new Date(endDate);
    }

    if (tipoMineral) {
      where.tipoMineral = {
        contains: tipoMineral,
        mode: 'insensitive'
      };
    }

    if (tituloMinero) {
      where.tituloMinero = {
        contains: tituloMinero,
        mode: 'insensitive'
      };
    }

    // Obtener entradas con paginación
    const [entries, totalCount] = await Promise.all([
      prisma.productionEntry.findMany({
        where,
        orderBy: { fechaHora: 'desc' },
        skip,
        take,
        include: {
          operador: {
            select: {
              id: true,
              nombre: true,
              email: true,
              rol: true
            }
          }
        }
      }),
      prisma.productionEntry.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      success: true,
      data: entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial de producción'
    });
  }
});

/**
 * GET /api/production/stats
 * Obtiene estadísticas de producción
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Construir filtros de fecha
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.fechaHora = {};
      if (startDate) dateFilter.fechaHora.gte = new Date(startDate);
      if (endDate) dateFilter.fechaHora.lte = new Date(endDate);
    }

    const where = {
      operadorId: userId,
      ...dateFilter
    };

    // Estadísticas generales
    const [
      totalEntries,
      totalQuantity,
      mineralTypes,
      recentEntries
    ] = await Promise.all([
      // Total de entradas
      prisma.productionEntry.count({ where }),
      
      // Cantidad total
      prisma.productionEntry.aggregate({
        where,
        _sum: { cantidad: true }
      }),
      
      // Tipos de mineral
      prisma.productionEntry.groupBy({
        by: ['tipoMineral'],
        where,
        _sum: { cantidad: true },
        _count: { id: true },
        orderBy: { _sum: { cantidad: 'desc' } }
      }),
      
      // Entradas recientes (últimas 5)
      prisma.productionEntry.findMany({
        where,
        orderBy: { fechaHora: 'desc' },
        take: 5,
        select: {
          id: true,
          tipoMineral: true,
          cantidad: true,
          fechaHora: true,
          ubicacion: true
        }
      })
    ]);

    // Estadísticas por período
    let periodStats = [];
    if (groupBy === 'day') {
      periodStats = await prisma.productionEntry.groupBy({
        by: ['fechaHora'],
        where,
        _sum: { cantidad: true },
        _count: { id: true },
        orderBy: { fechaHora: 'desc' },
        take: 30
      });
    } else if (groupBy === 'month') {
      // Agrupar por mes
      const monthlyStats = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "fechaHora") as month,
          SUM(cantidad) as total_quantity,
          COUNT(*) as total_entries
        FROM "ProductionEntry"
        WHERE "operadorId" = ${userId}
        ${startDate ? `AND "fechaHora" >= ${new Date(startDate)}` : ''}
        ${endDate ? `AND "fechaHora" <= ${new Date(endDate)}` : ''}
        GROUP BY DATE_TRUNC('month', "fechaHora")
        ORDER BY month DESC
        LIMIT 12
      `;
      periodStats = monthlyStats;
    }

    res.json({
      success: true,
      data: {
        totalEntries,
        totalQuantity: totalQuantity._sum.cantidad || 0,
        mineralTypes,
        recentEntries,
        periodStats
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de producción'
    });
  }
});

/**
 * PUT /api/production/:id
 * Actualiza una entrada de producción
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verificar que la entrada pertenece al usuario
    const existingEntry = await prisma.productionEntry.findFirst({
      where: {
        id: parseInt(id),
        operadorId: userId
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de producción no encontrada'
      });
    }

    // Validar datos de actualización
    const validation = validateProductionEntry(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Datos de actualización inválidos',
        errors: validation.errors
      });
    }

    // Actualizar entrada
    const updatedEntry = await prisma.productionEntry.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        operador: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Entrada actualizada correctamente',
      data: updatedEntry
    });

  } catch (error) {
    console.error('❌ Error actualizando entrada:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando entrada de producción'
    });
  }
});

/**
 * DELETE /api/production/:id
 * Elimina una entrada de producción
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la entrada pertenece al usuario
    const existingEntry = await prisma.productionEntry.findFirst({
      where: {
        id: parseInt(id),
        operadorId: userId
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de producción no encontrada'
      });
    }

    // Eliminar entrada
    await prisma.productionEntry.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Entrada eliminada correctamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando entrada:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando entrada de producción'
    });
  }
});

module.exports = router;
