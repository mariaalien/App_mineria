const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapeo de tipos FRI a modelos Prisma
const getFRIModel = (tipoFRI) => {
    const modelMap = {
        'fRIProduccion': 'fRIProduccion',
        'fRIInventarios': 'fRIInventarios', 
        'fRIParadasProduccion': 'fRIParadasProduccion',
        'fRIEjecucion': 'fRIEjecucion',
        'fRIMaquinariaTransporte': 'fRIMaquinariaTransporte',
        'fRIRegalias': 'fRIRegalias',
        'fRIInventarioMaquinaria': 'fRIInventarioMaquinaria',
        'fRICapacidadTecnologica': 'fRICapacidadTecnologica',
        'fRIProyecciones': 'fRIProyecciones'
    };
    
    return modelMap[tipoFRI] || 'fRIProduccion';
};

// Crear nuevo registro FRI
const createFRIRecord = (tipoFRI = 'fRIProduccion') => {
    return async (req, res) => {
        try {
            const userId = req.user.userId;
            const modelName = getFRIModel(tipoFRI);
            
            // Crear el registro usando el modelo específico
            const friRecord = await prisma[modelName].create({
                data: {
                    ...req.body,
                    usuarioId: userId
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true
                        }
                    }
                }
            });

            res.status(201).json({
                success: true,
                message: `Registro FRI ${tipoFRI} creado exitosamente`,
                data: friRecord
            });

        } catch (error) {
            console.error(`Error al crear registro FRI ${tipoFRI}:`, error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
};

// Obtener múltiples registros FRI con filtros y paginación
const getFRIRecords = (tipoFRI = 'fRIProduccion') => {
    return async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                startDate,
                endDate,
                search
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            const modelName = getFRIModel(tipoFRI);

            // Construir filtros dinámicos
            const where = {};

            // Filtro por fechas
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            // Búsqueda general (si aplica para el modelo)
            if (search) {
                where.OR = [
                    { tituloMinero: { contains: search, mode: 'insensitive' } },
                    { mineral: { contains: search, mode: 'insensitive' } }
                ];
            }

            // Si no es administrador, solo mostrar sus propios registros
            if (req.user.role !== 'ADMIN' && req.user.role !== 'ADMINISTRADOR') {
                where.usuarioId = req.user.userId;
            }

            // Obtener registros con paginación
            const [records, total] = await Promise.all([
                prisma[modelName].findMany({
                    where,
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                email: true
                            }
                        }
                    }
                }),
                prisma[modelName].count({ where })
            ]);

            const totalPages = Math.ceil(total / take);

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
                    }
                }
            });

        } catch (error) {
            console.error(`Error al obtener registros FRI ${tipoFRI}:`, error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
};

// Obtener un registro FRI específico por ID
const getFRIRecord = (tipoFRI = 'fRIProduccion') => {
    return async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const modelName = getFRIModel(tipoFRI);

            const where = { id: id };

            // Si no es administrador, solo puede ver sus propios registros
            if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRADOR') {
                where.usuarioId = userId;
            }

            const record = await prisma[modelName].findFirst({
                where,
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true
                        }
                    }
                }
            });

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: `Registro FRI ${tipoFRI} no encontrado`
                });
            }

            res.json({
                success: true,
                data: record
            });

        } catch (error) {
            console.error(`Error al obtener registro FRI ${tipoFRI}:`, error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
};

// Actualizar registro FRI
const updateFRIRecord = (tipoFRI = 'fRIProduccion') => {
    return async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const modelName = getFRIModel(tipoFRI);

            const where = { id: id };

            // Si no es administrador, solo puede actualizar sus propios registros
            if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRADOR') {
                where.usuarioId = userId;
            }

            // Verificar que el registro existe y pertenece al usuario
            const existingRecord = await prisma[modelName].findFirst({ where });

            if (!existingRecord) {
                return res.status(404).json({
                    success: false,
                    message: `Registro FRI ${tipoFRI} no encontrado`
                });
            }

            // Actualizar el registro
            const updatedRecord = await prisma[modelName].update({
                where: { id: id },
                data: {
                    ...req.body,
                    updatedAt: new Date()
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true
                        }
                    }
                }
            });

            res.json({
                success: true,
                message: `Registro FRI ${tipoFRI} actualizado exitosamente`,
                data: updatedRecord
            });

        } catch (error) {
            console.error(`Error al actualizar registro FRI ${tipoFRI}:`, error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
};

// Eliminar registro FRI
const deleteFRIRecord = (tipoFRI = 'fRIProduccion') => {
    return async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const modelName = getFRIModel(tipoFRI);

            const where = { id: id };

            // Si no es administrador, solo puede eliminar sus propios registros
            if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRADOR') {
                where.usuarioId = userId;
            }

            // Verificar que el registro existe
            const existingRecord = await prisma[modelName].findFirst({ where });

            if (!existingRecord) {
                return res.status(404).json({
                    success: false,
                    message: `Registro FRI ${tipoFRI} no encontrado`
                });
            }

            // Eliminar el registro
            await prisma[modelName].delete({
                where: { id: id }
            });

            res.json({
                success: true,
                message: `Registro FRI ${tipoFRI} eliminado exitosamente`
            });

        } catch (error) {
            console.error(`Error al eliminar registro FRI ${tipoFRI}:`, error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
};

// Obtener estadísticas de registros FRI
const getStats = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.userId;

        const where = {};
        
        // Si no es administrador, solo estadísticas de sus registros
        if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRADOR') {
            where.usuarioId = userId;
        }

        // Obtener estadísticas de todos los tipos de FRI
        const stats = {};

        // Lista de todos los modelos FRI
        const friModels = [
            'fRIProduccion',
            'fRIInventarios', 
            'fRIParadasProduccion',
            'fRIEjecucion',
            'fRIMaquinariaTransporte',
            'fRIRegalias',
            'fRIInventarioMaquinaria',
            'fRICapacidadTecnologica',
            'fRIProyecciones'
        ];

        // Obtener count de cada modelo
        for (const modelName of friModels) {
            try {
                const count = await prisma[modelName].count({ where });
                stats[modelName] = count;
            } catch (error) {
                console.warn(`Error getting stats for ${modelName}:`, error.message);
                stats[modelName] = 0;
            }
        }

        // Calcular totales
        const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);

        // Estadísticas por mes (últimos 6 meses) - usando FRIProduccion como ejemplo
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        let monthlyStats = [];
        try {
            const monthlyData = await prisma.fRIProduccion.groupBy({
                by: ['createdAt'],
                where: {
                    ...where,
                    createdAt: {
                        gte: sixMonthsAgo
                    }
                },
                _count: true
            });

            // Procesar datos mensuales
            const monthlyMap = {};
            monthlyData.forEach(item => {
                const month = item.createdAt.toISOString().slice(0, 7); // YYYY-MM
                monthlyMap[month] = (monthlyMap[month] || 0) + item._count;
            });

            monthlyStats = Object.entries(monthlyMap)
                .map(([mes, cantidad]) => ({ mes, cantidad }))
                .sort((a, b) => a.mes.localeCompare(b.mes));
        } catch (error) {
            console.warn('Error getting monthly stats:', error.message);
            monthlyStats = [];
        }

        const result = {
            resumen: {
                total: totalRecords,
                porTipo: stats
            },
            porTipoFRI: Object.entries(stats).map(([tipo, cantidad]) => ({
                tipo: tipo.replace('fRI', ''),
                cantidad
            })),
            tendenciaMensual: monthlyStats,
            usuario: {
                nombre: req.user.username,
                rol: req.user.role,
                esAdmin: ['ADMIN', 'ADMINISTRADOR'].includes(req.user.role)
            }
        };

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    createFRIRecord,
    getFRIRecords,
    getFRIRecord,
    updateFRIRecord,
    deleteFRIRecord,
    getStats
};