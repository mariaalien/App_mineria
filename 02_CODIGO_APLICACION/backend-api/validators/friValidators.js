const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors.array()
        });
    }
    next();
};

// Validadores para crear solicitud FRI
const validateCreateFRI = [
    body('nit')
        .notEmpty()
        .withMessage('El NIT es requerido')
        .isLength({ min: 8, max: 12 })
        .withMessage('El NIT debe tener entre 8 y 12 caracteres')
        .matches(/^[0-9]+$/)
        .withMessage('El NIT solo debe contener números'),
    
    body('razonSocial')
        .notEmpty()
        .withMessage('La razón social es requerida')
        .isLength({ min: 3, max: 200 })
        .withMessage('La razón social debe tener entre 3 y 200 caracteres'),
    
    body('representanteLegal')
        .notEmpty()
        .withMessage('El representante legal es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El representante legal debe tener entre 3 y 100 caracteres'),
    
    body('telefono')
        .notEmpty()
        .withMessage('El teléfono es requerido')
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('El teléfono solo debe contener números, espacios, +, -, ()'),
    
    body('email')
        .notEmpty()
        .withMessage('El email es requerido')
        .isEmail()
        .withMessage('Debe ser un email válido'),
    
    body('direccion')
        .notEmpty()
        .withMessage('La dirección es requerida')
        .isLength({ min: 10, max: 200 })
        .withMessage('La dirección debe tener entre 10 y 200 caracteres'),
    
    body('municipio')
        .notEmpty()
        .withMessage('El municipio es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El municipio debe tener entre 3 y 100 caracteres'),
    
    body('departamento')
        .notEmpty()
        .withMessage('El departamento es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El departamento debe tener entre 3 y 100 caracteres'),
    
    body('tipoSolicitud')
        .notEmpty()
        .withMessage('El tipo de solicitud es requerido')
        .isIn(['EXPLORACION', 'EXPLOTACION', 'BENEFICIO', 'TRANSFORMACION'])
        .withMessage('Tipo de solicitud inválido'),
    
    body('coordenadas')
        .optional()
        .isArray()
        .withMessage('Las coordenadas deben ser un array'),
    
    body('coordenadas.*.latitud')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('La latitud debe estar entre -90 y 90'),
    
    body('coordenadas.*.longitud')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('La longitud debe estar entre -180 y 180'),
    
    handleValidationErrors
];

// Validadores para actualizar solicitud FRI
const validateUpdateFRI = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('nit')
        .optional()
        .isLength({ min: 8, max: 12 })
        .withMessage('El NIT debe tener entre 8 y 12 caracteres')
        .matches(/^[0-9]+$/)
        .withMessage('El NIT solo debe contener números'),
    
    body('razonSocial')
        .optional()
        .isLength({ min: 3, max: 200 })
        .withMessage('La razón social debe tener entre 3 y 200 caracteres'),
    
    body('representanteLegal')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El representante legal debe tener entre 3 y 100 caracteres'),
    
    body('telefono')
        .optional()
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('El teléfono solo debe contener números, espacios, +, -, ()'),
    
    body('email')
        .optional()
        .isEmail()
        .withMessage('Debe ser un email válido'),
    
    body('direccion')
        .optional()
        .isLength({ min: 10, max: 200 })
        .withMessage('La dirección debe tener entre 10 y 200 caracteres'),
    
    body('municipio')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El municipio debe tener entre 3 y 100 caracteres'),
    
    body('departamento')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El departamento debe tener entre 3 y 100 caracteres'),
    
    body('tipoSolicitud')
        .optional()
        .isIn(['EXPLORACION', 'EXPLOTACION', 'BENEFICIO', 'TRANSFORMACION'])
        .withMessage('Tipo de solicitud inválido'),
    
    body('estado')
        .optional()
        .isIn(['PENDIENTE', 'REVISION', 'APROBADO', 'RECHAZADO'])
        .withMessage('Estado inválido'),
    
    handleValidationErrors
];

// Validadores para obtener solicitud por ID
const validateGetFRIById = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    handleValidationErrors
];

// Validadores para eliminar solicitud
const validateDeleteFRI = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    handleValidationErrors
];

// Validadores para búsqueda y filtros
const validateSearchFRI = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
    
    query('estado')
        .optional()
        .isIn(['PENDIENTE', 'REVISION', 'APROBADO', 'RECHAZADO'])
        .withMessage('Estado inválido'),
    
    query('tipoSolicitud')
        .optional()
        .isIn(['EXPLORACION', 'EXPLOTACION', 'BENEFICIO', 'TRANSFORMACION'])
        .withMessage('Tipo de solicitud inválido'),
    
    query('nit')
        .optional()
        .matches(/^[0-9]+$/)
        .withMessage('El NIT solo debe contener números'),
    
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)'),
    
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)'),
    
    handleValidationErrors
];

// Validadores para comentarios
const validateComment = [
    param('friId')
        .isInt({ min: 1 })
        .withMessage('El ID de la solicitud FRI debe ser un número entero positivo'),
    
    body('comentario')
        .notEmpty()
        .withMessage('El comentario es requerido')
        .isLength({ min: 10, max: 1000 })
        .withMessage('El comentario debe tener entre 10 y 1000 caracteres'),
    
    body('esPublico')
        .optional()
        .isBoolean()
        .withMessage('esPublico debe ser un valor booleano'),
    
    handleValidationErrors
];

// Alias para compatibilidad con routes/fri.js
const validateFRI = validateCreateFRI;

// Esquemas de validación específicos para diferentes módulos FRI
const produccionSchema = [
    body('produccion.*.mes')
        .notEmpty()
        .withMessage('El mes es requerido')
        .isInt({ min: 1, max: 12 })
        .withMessage('El mes debe estar entre 1 y 12'),
    
    body('produccion.*.cantidad')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isFloat({ min: 0 })
        .withMessage('La cantidad debe ser un número positivo'),
    
    body('produccion.*.unidad')
        .notEmpty()
        .withMessage('La unidad es requerida')
        .isIn(['TONELADAS', 'METROS_CUBICOS', 'KILOGRAMOS', 'GRAMOS'])
        .withMessage('Unidad inválida'),
    
    handleValidationErrors
];

const inventariosSchema = [
    body('inventarios.*.mineral')
        .notEmpty()
        .withMessage('El mineral es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El mineral debe tener entre 2 y 100 caracteres'),
    
    body('inventarios.*.cantidad')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isFloat({ min: 0 })
        .withMessage('La cantidad debe ser un número positivo'),
    
    body('inventarios.*.ubicacion')
        .notEmpty()
        .withMessage('La ubicación es requerida')
        .isLength({ min: 5, max: 200 })
        .withMessage('La ubicación debe tener entre 5 y 200 caracteres'),
    
    handleValidationErrors
];

const paradasSchema = [
    body('paradas.*.fechaInicio')
        .notEmpty()
        .withMessage('La fecha de inicio es requerida')
        .isISO8601()
        .withMessage('La fecha de inicio debe ser válida'),
    
    body('paradas.*.fechaFin')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe ser válida'),
    
    body('paradas.*.motivo')
        .notEmpty()
        .withMessage('El motivo es requerido')
        .isLength({ min: 10, max: 500 })
        .withMessage('El motivo debe tener entre 10 y 500 caracteres'),
    
    body('paradas.*.tipo')
        .notEmpty()
        .withMessage('El tipo de parada es requerido')
        .isIn(['MANTENIMIENTO', 'CLIMATICAS', 'TECNICAS', 'ADMINISTRATIVAS', 'OTRAS'])
        .withMessage('Tipo de parada inválido'),
    
    handleValidationErrors
];

const ejecucionSchema = [
    body('ejecucion.presupuestoTotal')
        .notEmpty()
        .withMessage('El presupuesto total es requerido')
        .isFloat({ min: 0 })
        .withMessage('El presupuesto debe ser un número positivo'),
    
    body('ejecucion.presupuestoEjecutado')
        .notEmpty()
        .withMessage('El presupuesto ejecutado es requerido')
        .isFloat({ min: 0 })
        .withMessage('El presupuesto ejecutado debe ser un número positivo'),
    
    body('ejecucion.porcentajeEjecucion')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El porcentaje debe estar entre 0 y 100'),
    
    body('ejecucion.actividades.*.descripcion')
        .notEmpty()
        .withMessage('La descripción de la actividad es requerida'),
    
    body('ejecucion.actividades.*.costo')
        .isFloat({ min: 0 })
        .withMessage('El costo debe ser un número positivo'),
    
    handleValidationErrors
];

const maquinariaTransporteSchema = [
    body('maquinaria.*.tipo')
        .notEmpty()
        .withMessage('El tipo de maquinaria es requerido')
        .isIn(['EXCAVADORA', 'VOLQUETA', 'BULLDOZER', 'PERFORADORA', 'CARGADOR', 'GRUA', 'OTRO'])
        .withMessage('Tipo de maquinaria inválido'),
    
    body('maquinaria.*.marca')
        .notEmpty()
        .withMessage('La marca es requerida')
        .isLength({ min: 2, max: 50 })
        .withMessage('La marca debe tener entre 2 y 50 caracteres'),
    
    body('maquinaria.*.modelo')
        .notEmpty()
        .withMessage('El modelo es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El modelo debe tener entre 2 y 50 caracteres'),
    
    body('maquinaria.*.placa')
        .optional()
        .matches(/^[A-Z0-9\-]+$/)
        .withMessage('La placa debe contener solo letras mayúsculas, números y guiones'),
    
    body('maquinaria.*.estado')
        .notEmpty()
        .withMessage('El estado es requerido')
        .isIn(['OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO'])
        .withMessage('Estado inválido'),
    
    handleValidationErrors
];

const regaliasSchema = [
    body('regalias.mes')
        .notEmpty()
        .withMessage('El mes es requerido')
        .isInt({ min: 1, max: 12 })
        .withMessage('El mes debe estar entre 1 y 12'),
    
    body('regalias.año')
        .notEmpty()
        .withMessage('El año es requerido')
        .isInt({ min: 2000, max: 2100 })
        .withMessage('El año debe estar entre 2000 y 2100'),
    
    body('regalias.valorProduccion')
        .notEmpty()
        .withMessage('El valor de producción es requerido')
        .isFloat({ min: 0 })
        .withMessage('El valor de producción debe ser positivo'),
    
    body('regalias.porcentajeRegalias')
        .notEmpty()
        .withMessage('El porcentaje de regalías es requerido')
        .isFloat({ min: 0, max: 100 })
        .withMessage('El porcentaje debe estar entre 0 y 100'),
    
    body('regalias.valorRegalias')
        .notEmpty()
        .withMessage('El valor de regalías es requerido')
        .isFloat({ min: 0 })
        .withMessage('El valor de regalías debe ser positivo'),
    
    handleValidationErrors
];

const inventarioMaquinariaSchema = [
    body('inventarioMaquinaria.*.codigo')
        .notEmpty()
        .withMessage('El código es requerido')
        .isLength({ min: 3, max: 20 })
        .withMessage('El código debe tener entre 3 y 20 caracteres'),
    
    body('inventarioMaquinaria.*.descripcion')
        .notEmpty()
        .withMessage('La descripción es requerida')
        .isLength({ min: 10, max: 200 })
        .withMessage('La descripción debe tener entre 10 y 200 caracteres'),
    
    body('inventarioMaquinaria.*.valorComercial')
        .notEmpty()
        .withMessage('El valor comercial es requerido')
        .isFloat({ min: 0 })
        .withMessage('El valor comercial debe ser positivo'),
    
    body('inventarioMaquinaria.*.fechaAdquisicion')
        .optional()
        .isISO8601()
        .withMessage('La fecha de adquisición debe ser válida'),
    
    handleValidationErrors
];

const capacidadTecnologicaSchema = [
    body('capacidadTecnologica.tecnologias.*.nombre')
        .notEmpty()
        .withMessage('El nombre de la tecnología es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    
    body('capacidadTecnologica.tecnologias.*.tipo')
        .notEmpty()
        .withMessage('El tipo de tecnología es requerido')
        .isIn(['EXTRACCION', 'PROCESAMIENTO', 'TRANSPORTE', 'SEGURIDAD', 'AMBIENTAL'])
        .withMessage('Tipo de tecnología inválido'),
    
    body('capacidadTecnologica.personal.*.cargo')
        .notEmpty()
        .withMessage('El cargo es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El cargo debe tener entre 3 y 100 caracteres'),
    
    body('capacidadTecnologica.personal.*.cantidad')
        .notEmpty()
        .withMessage('La cantidad de personal es requerida')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero positivo'),
    
    handleValidationErrors
];

const proyeccionesSchema = [
    body('proyecciones.año')
        .notEmpty()
        .withMessage('El año es requerido')
        .isInt({ min: 2024, max: 2050 })
        .withMessage('El año debe estar entre 2024 y 2050'),
    
    body('proyecciones.produccionEstimada')
        .notEmpty()
        .withMessage('La producción estimada es requerida')
        .isFloat({ min: 0 })
        .withMessage('La producción estimada debe ser positiva'),
    
    body('proyecciones.inversionEstimada')
        .notEmpty()
        .withMessage('La inversión estimada es requerida')
        .isFloat({ min: 0 })
        .withMessage('La inversión estimada debe ser positiva'),
    
    body('proyecciones.empleosGenerados')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Los empleos generados deben ser un número entero positivo'),
    
    handleValidationErrors
];

module.exports = {
    validateCreateFRI,
    validateUpdateFRI,
    validateGetFRIById,
    validateDeleteFRI,
    validateSearchFRI,
    validateComment,
    validateFRI,
    handleValidationErrors,
    // Esquemas específicos
    produccionSchema,
    inventariosSchema,
    paradasSchema,
    ejecucionSchema,
    maquinariaTransporteSchema,
    regaliasSchema,
    inventarioMaquinariaSchema,
    capacidadTecnologicaSchema,
    proyeccionesSchema
};