// ================================
// 📁 validators/friValidators.js - VALIDADORES COMPLETOS PARA LOS 9 FRI
// ================================
const Joi = require('joi');

// =============================================================================
// ESQUEMAS BASE REUTILIZABLES
// =============================================================================

const baseUsuarioSchema = {
  usuarioId: Joi.string().uuid().required().messages({
    'string.guid': 'ID de usuario debe ser un UUID válido',
    'any.required': 'Usuario es requerido'
  })
};

const baseFechaSchema = {
  fechaCorteInformacion: Joi.date().iso().max('now').required().messages({
    'date.base': 'Fecha debe ser válida',
    'date.max': 'Fecha no puede ser futura',
    'any.required': 'Fecha de corte es requerida'
  })
};

const baseMineralSchema = {
  mineral: Joi.string().min(2).max(100).uppercase().required().messages({
    'string.min': 'Mineral debe tener al menos 2 caracteres',
    'string.max': 'Mineral no puede exceder 100 caracteres',
    'any.required': 'Mineral es requerido'
  }),
  tituloMinero: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Título minero debe tener al menos 3 caracteres',
    'string.max': 'Título minero no puede exceder 50 caracteres',
    'any.required': 'Título minero es requerido'
  })
};

const coordenadaSchema = {
  coordenadaLatitud: Joi.number().min(-90).max(90).precision(8).optional().messages({
    'number.min': 'Latitud debe estar entre -90 y 90',
    'number.max': 'Latitud debe estar entre -90 y 90'
  }),
  coordenadaLongitud: Joi.number().min(-180).max(180).precision(8).optional().messages({
    'number.min': 'Longitud debe estar entre -180 y 180',
    'number.max': 'Longitud debe estar entre -180 y 180'
  })
};

// =============================================================================
// 1. FRI PRODUCCIÓN (MENSUAL) - VALIDADOR
// =============================================================================

const friProduccionSchema = Joi.object({
  ...baseFechaSchema,
  ...baseMineralSchema,
  municipioExtraccion: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Municipio debe tener al menos 2 caracteres',
    'string.max': 'Municipio no puede exceder 100 caracteres'
  }),
  codigoMunicipioExtraccion: Joi.string().pattern(/^\d{5}$/).optional().messages({
    'string.pattern.base': 'Código de municipio debe tener 5 dígitos'
  }),
  horasOperativas: Joi.number().min(0).max(744).precision(2).optional().messages({
    'number.min': 'Horas operativas no pueden ser negativas',
    'number.max': 'Horas operativas no pueden exceder 744 (mes completo)'
  }),
  cantidadProduccion: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Cantidad de producción debe ser positiva'
  }),
  unidadMedidaProduccion: Joi.string().valid('TONELADAS', 'M3', 'KG', 'GRAMOS', 'ONZAS').optional(),
  cantidadMaterialEntraPlanta: Joi.number().min(0).precision(4).optional(),
  cantidadMaterialSalePlanta: Joi.number().min(0).precision(4).optional(),
  masaUnitaria: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Masa unitaria debe ser positiva'
  }),
  ...baseUsuarioSchema
});

// =============================================================================
// 2. FRI INVENTARIOS (MENSUAL) - VALIDADOR
// =============================================================================

const friInventariosSchema = Joi.object({
  ...baseFechaSchema,
  ...baseMineralSchema,
  unidadMedidaInventarios: Joi.string().valid('TONELADAS', 'M3', 'KG', 'GRAMOS').optional(),
  inventarioInicialAcopio: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Inventario inicial debe ser positivo'
  }),
  inventarioFinalAcopio: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Inventario final debe ser positivo'
  }),
  ingresoAcopio: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Ingreso de acopio debe ser positivo'
  }),
  salidaAcopio: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Salida de acopio debe ser positiva'
  }),
  ...baseUsuarioSchema
});

// =============================================================================
// 3. FRI PARADAS DE PRODUCCIÓN (MENSUAL) - VALIDADOR
// =============================================================================

const friParadasSchema = Joi.object({
  ...baseMineralSchema,
  fechaInicioEvento: Joi.date().iso().required().messages({
    'date.base': 'Fecha de inicio debe ser válida',
    'any.required': 'Fecha de inicio es requerida'
  }),
  fechaFinEvento: Joi.date().iso().min(Joi.ref('fechaInicioEvento')).required().messages({
    'date.base': 'Fecha de fin debe ser válida',
    'date.min': 'Fecha de fin debe ser posterior a fecha de inicio',
    'any.required': 'Fecha de fin es requerida'
  }),
  tipoParada: Joi.string().valid(
    'MANTENIMIENTO_PROGRAMADO',
    'MANTENIMIENTO_CORRECTIVO', 
    'CLIMATICAS',
    'TECNICAS',
    'ADMINISTRATIVAS',
    'SEGURIDAD',
    'AMBIENTAL',
    'OTRAS'
  ).optional(),
  causaParada: Joi.string().min(10).max(500).optional().messages({
    'string.min': 'Causa de parada debe tener al menos 10 caracteres',
    'string.max': 'Causa de parada no puede exceder 500 caracteres'
  }),
  duracionEventoHoras: Joi.number().min(0).max(8760).precision(2).optional().messages({
    'number.min': 'Duración debe ser positiva',
    'number.max': 'Duración no puede exceder un año (8760 horas)'
  }),
  duracionRetomaOperacion: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Duración de retoma debe ser positiva'
  }),
  impactoProduccion: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Impacto en producción debe ser positivo'
  }),
  unidadMedidaImpacto: Joi.string().valid('TONELADAS', 'M3', 'KG', 'GRAMOS', 'HORAS').optional(),
  ...baseUsuarioSchema
});

// =============================================================================
// 4. FRI EJECUCIÓN (MENSUAL) - VALIDADOR
// =============================================================================

const friEjecucionSchema = Joi.object({
  ...baseFechaSchema,
  ...baseMineralSchema,
  denominacionFrente: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Denominación de frente debe tener al menos 2 caracteres',
    'string.max': 'Denominación de frente no puede exceder 100 caracteres'
  }),
  ...coordenadaSchema,
  metodoExplotacion: Joi.string().valid(
    'CIELO_ABIERTO',
    'SUBTERRANEO',
    'ALUVIAL',
    'DRAGADO',
    'CANTERAS',
    'OTROS'
  ).optional(),
  avanceYacimientoEjecutado: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Avance ejecutado debe ser positivo'
  }),
  unidadMedidaAvance: Joi.string().valid('METROS', 'HECTAREAS', 'M2', 'M3').optional(),
  volumenEjecutado: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Volumen ejecutado debe ser positivo'
  }),
  unidadMedidaVolumen: Joi.string().valid('M3', 'M2', 'METROS').optional(),
  densidadMantoEjecutado: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Densidad del manto debe ser positiva'
  }),
  unidadMedidaDensidad: Joi.string().valid('TON_M3', 'KG_M3', 'G_CM3').optional(),
  frentesEjecutado: Joi.number().integer().min(0).optional().messages({
    'number.integer': 'Frentes ejecutados debe ser un número entero',
    'number.min': 'Frentes ejecutados debe ser positivo'
  }),
  avanceTopografia: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Avance topográfico debe ser positivo'
  }),
  ...baseUsuarioSchema
});

// =============================================================================
// 5. FRI MAQUINARIA TRANSPORTE (MENSUAL) - VALIDADOR
// =============================================================================

const friMaquinariaTransporteSchema = Joi.object({
  ...baseFechaSchema,
  ...baseMineralSchema,
  tipoVehiculo: Joi.string().valid(
    'VOLQUETA',
    'TRACTOMULA',
    'CAMION',
    'MOTO',
    'BARCAZA',
    'FERROCARRIL',
    'BANDA_TRANSPORTADORA',
    'OTROS'
  ).optional(),
  unidadCapacidadVehiculo: Joi.string().valid('TONELADAS', 'M3', 'KG').optional(),
  capacidadVehiculo: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Capacidad del vehículo debe ser positiva'
  }),
  usoMecanismo: Joi.string().min(5).max(200).optional().messages({
    'string.min': 'Descripción de uso debe tener al menos 5 caracteres',
    'string.max': 'Descripción de uso no puede exceder 200 caracteres'
  }),
  unidadUsoMecanismo: Joi.string().valid('HORAS', 'VIAJES', 'KM', 'DÍAS').optional(),
  densidadMaterialTransportado: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Densidad del material debe ser positiva'
  }),
  ...baseUsuarioSchema
});

// =============================================================================
// 6. FRI REGALÍAS (TRIMESTRAL) - VALIDADOR
// =============================================================================

const friRegaliasSchema = Joi.object({
  fechaCorteDeclaracion: Joi.date().iso().max('now').required().messages({
    'date.base': 'Fecha de corte debe ser válida',
    'date.max': 'Fecha no puede ser futura',
    'any.required': 'Fecha de corte de declaración es requerida'
  }),
  ...baseMineralSchema,
  municipioExtraccion: Joi.string().min(2).max(100).optional(),
  codigoMunicipioExtraccion: Joi.string().pattern(/^\d{5}$/).optional(),
  cantidadMineralExtraido: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Cantidad extraída debe ser positiva'
  }),
  unidadMedidaMineral: Joi.string().valid('TONELADAS', 'M3', 'KG', 'GRAMOS', 'ONZAS').optional(),
  valorDeclaracionRegalias: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Valor de declaración debe ser positivo'
  }),
  valorOtrasContraprestaciones: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Valor de contraprestaciones debe ser positivo'
  }),
  resolucionUpme: Joi.string().pattern(/^\d{4}-\d{2}-\d{3}$/).optional().messages({
    'string.pattern.base': 'Resolución UPME debe tener formato YYYY-MM-NNN'
  }),
  precioBaseLiquidacion: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Precio base debe ser positivo'
  }),
  porcentajeRegalias: Joi.number().min(0).max(100).precision(4).optional().messages({
    'number.min': 'Porcentaje de regalías debe ser positivo',
    'number.max': 'Porcentaje de regalías no puede exceder 100%'
  }),
  ...baseUsuarioSchema
});

// =============================================================================
// 7. FRI INVENTARIO MAQUINARIA (ANUAL) - VALIDADOR
// =============================================================================

const friInventarioMaquinariaSchema = Joi.object({
  ...baseFechaSchema,
  ...baseMineralSchema,
  tipoMaquinaria: Joi.string().valid(
    'EXCAVADORA',
    'BULLDOZER',
    'CARGADOR_FRONTAL',
    'RETROEXCAVADORA',
    'PERFORADORA',
    'VOLQUETA',
    'GRUA',
    'COMPRESORES',
    'BOMBAS',
    'PLANTAS_ELECTRICAS',
    'OTROS'
  ).optional(),
  cantidadMaquinaria: Joi.number().integer().min(0).optional().messages({
    'number.integer': 'Cantidad debe ser un número entero',
    'number.min': 'Cantidad debe ser positiva'
  }),
  unidadCapacidadMaquinaria: Joi.string().valid('TONELADAS', 'M3', 'HP', 'KW', 'GALONES').optional(),
  capacidadMaquinaria: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Capacidad debe ser positiva'
  }),
  unidadRendimientoMaquinaria: Joi.string().valid('TON_HORA', 'M3_HORA', 'KG_HORA').optional(),
  rendimientoMaquinaria: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Rendimiento debe ser positivo'
  }),
  ...baseUsuarioSchema
});

// =============================================================================
// 8. FRI CAPACIDAD TECNOLÓGICA (ANUAL) - VALIDADOR
// =============================================================================

const friCapacidadTecnologicaSchema = Joi.object({
  ...baseFechaSchema,
  ...baseMineralSchema,
  ubicacionPuntoControl: Joi.string().min(5).max(200).optional().messages({
    'string.min': 'Ubicación debe tener al menos 5 caracteres',
    'string.max': 'Ubicación no puede exceder 200 caracteres'
  }),
  formaControl: Joi.string().valid(
    'MANUAL',
    'AUTOMATICO',
    'SEMIAUTOMATICO',
    'DIGITAL',
    'ANALOGICO'
  ).optional(),
  tipoControl: Joi.string().valid(
    'PESAJE',
    'VOLUMETRICO',
    'CALIDAD',
    'AMBIENTAL',
    'SEGURIDAD',
    'OPERACIONAL'
  ).optional(),
  materialMedido: Joi.string().min(2).max(100).optional(),
  variableMedida: Joi.string().valid(
    'PESO',
    'VOLUMEN',
    'DENSIDAD',
    'HUMEDAD',
    'GRANULOMETRIA',
    'PUREZA',
    'OTROS'
  ).optional(),
  unidadMedicionPuntoControl: Joi.string().valid('TON', 'KG', 'M3', 'L', '%', 'PPM').optional(),
  tecnologiaMedicion: Joi.string().min(5).max(200).optional(),
  tipoSoftwareControl: Joi.string().min(3).max(100).optional(),
  almacenamientoDatos: Joi.string().valid(
    'LOCAL',
    'NUBE',
    'HIBRIDO',
    'PAPEL',
    'DIGITAL'
  ).optional(),
  ...baseUsuarioSchema
});

// =============================================================================
// 9. FRI PROYECCIONES (ANUAL) - VALIDADOR
// =============================================================================

const friProyeccionesSchema = Joi.object({
  ...baseFechaSchema,
  ...baseMineralSchema,
  metodoExplotacion: Joi.string().valid(
    'CIELO_ABIERTO',
    'SUBTERRANEO',
    'ALUVIAL',
    'DRAGADO',
    'CANTERAS',
    'OTROS'
  ).optional(),
  capacidadInstaladaExtraccion: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Capacidad de extracción debe ser positiva'
  }),
  capacidadInstaladaTransporte: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Capacidad de transporte debe ser positiva'
  }),
  capacidadInstaladaBeneficio: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Capacidad de beneficio debe ser positiva'
  }),
  proyeccionTopografia: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Proyección topográfica debe ser positiva'
  }),
  densidadMantoProyectado: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Densidad proyectada debe ser positiva'
  }),
  cantidadProyectadoProduccion: Joi.number().min(0).precision(4).optional().messages({
    'number.min': 'Cantidad proyectada debe ser positiva'
  }),
  unidadMedidaCantidad: Joi.string().valid('TONELADAS', 'M3', 'KG', 'GRAMOS').optional(),
  ...baseUsuarioSchema
});

// =============================================================================
// MIDDLEWARE DE VALIDACIÓN UNIVERSAL
// =============================================================================

const validateFRI = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Errores de validación en los datos enviados',
        errors,
        code: 'VALIDATION_ERROR'
      });
    }

    req.validatedData = value;
    next();
  };
};

// =============================================================================
// EXPORTACIONES
// =============================================================================

module.exports = {
  // Esquemas individuales
  friProduccionSchema,
  friInventariosSchema,
  friParadasSchema,
  friEjecucionSchema,
  friMaquinariaTransporteSchema,
  friRegaliasSchema,
  friInventarioMaquinariaSchema,
  friCapacidadTecnologicaSchema,
  friProyeccionesSchema,
  
  // Middleware de validación
  validateFRI,
  
  // Validadores específicos listos para usar
  validateFRIProduccion: validateFRI(friProduccionSchema),
  validateFRIInventarios: validateFRI(friInventariosSchema),
  validateFRIParadas: validateFRI(friParadasSchema),
  validateFRIEjecucion: validateFRI(friEjecucionSchema),
  validateFRIMaquinariaTransporte: validateFRI(friMaquinariaTransporteSchema),
  validateFRIRegalias: validateFRI(friRegaliasSchema),
  validateFRIInventarioMaquinaria: validateFRI(friInventarioMaquinariaSchema),
  validateFRICapacidadTecnologica: validateFRI(friCapacidadTecnologicaSchema),
  validateFRIProyecciones: validateFRI(friProyeccionesSchema)
};