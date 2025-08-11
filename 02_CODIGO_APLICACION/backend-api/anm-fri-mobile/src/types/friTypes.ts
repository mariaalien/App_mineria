// src/types/friTypes.ts - Tipos e interfaces para formularios FRI
export type FRIType = 'mensual' | 'trimestral' | 'anual';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  address?: string;
  timestamp: string;
}

export interface EvidenceItem {
  id: string;
  uri: string;
  location?: LocationData;
  timestamp: string;
  type: string;
  description?: string;
}

// ============================================================================
// INTERFACES PARA DIFERENTES TIPOS DE FRI
// ============================================================================

// Base común para todos los FRIs
export interface BaseFRIData {
  id: string;
  tipo: FRIType;
  fechaCreacion: string;
  estado: 'borrador' | 'enviado' | 'rechazado' | 'aprobado';
  ubicacion?: LocationData;
  evidencias: EvidenceItem[];
  observaciones?: string;
  responsable: {
    nombre: string;
    cedula: string;
    cargo: string;
    email?: string;
  };
}

// ============================================================================
// FRI MENSUAL - Reporte de producción mensual
// ============================================================================
export interface FRIMensualData extends BaseFRIData {
  tipo: 'mensual';
  periodo: {
    mes: number;
    año: number;
  };
  datosProduccion: {
    tipoMineral: string;
    cantidadExtraida: number; // En toneladas
    unidadMedida: 'toneladas' | 'metros_cubicos' | 'kilogramos';
    metodologiaExtraccion: string;
    equiposUtilizados: string[];
    diasTrabajo: number;
    numeroTrabajadores: number;
  };
  datosComercializacion: {
    cantidadVendida: number;
    precioUnitario: number;
    comprador?: string;
    fechaVenta?: string;
    documentoVenta?: string;
  };
  datosAmbientales: {
    consumoAgua: number; // En metros cúbicos
    generacionResiduos: number; // En toneladas
    medidasMitigacion: string;
    incidentesAmbientales?: string;
  };
}

// ============================================================================
// FRI TRIMESTRAL - Reporte trimestral con análisis
// ============================================================================
export interface FRITrimestralData extends BaseFRIData {
  tipo: 'trimestral';
  periodo: {
    trimestre: 1 | 2 | 3 | 4;
    año: number;
  };
  resumenTrimestral: {
    totalProducido: number;
    totalVendido: number;
    ingresosBrutos: number;
    costosOperacion: number;
    utilidadNeta: number;
  };
  analisisProduccion: {
    tendenciaProduccion: 'creciente' | 'estable' | 'decreciente';
    factoresInfluyen: string;
    comparacionTrimesterAnterior: number; // Porcentaje
    proyeccionProximoTrimestre: number;
  };
  gestionAmbiental: {
    planManejo: string;
    cumplimientoNormas: boolean;
    certificacionesObtenidas: string[];
    inversionAmbiental: number;
  };
  gestionSocial: {
    empleosDirectos: number;
    empleosIndirectos: number;
    inversionSocial: number;
    programasComunidad: string[];
    relacionesComunidad: 'excelente' | 'buena' | 'regular' | 'mala';
  };
}

// ============================================================================
// FRI ANUAL - Reporte anual completo
// ============================================================================
export interface FRIAnualData extends BaseFRIData {
  tipo: 'anual';
  periodo: {
    año: number;
  };
  resumenEjecutivo: {
    totalProducidoAnual: number;
    totalVendidoAnual: number;
    ingresosAnuales: number;
    utilidadAnual: number;
    crecimientoAnual: number; // Porcentaje
  };
  estadisticasOperacionales: {
    diasOperacion: number;
    promedioTrabajadores: number;
    accidentesLaborales: number;
    capacitacionesRealizadas: number;
    inversionTecnologia: number;
  };
  impactoAmbiental: {
    huellaCarbono: number;
    consumoAguaAnual: number;
    residuosGenerados: number;
    areasRehabilitadas: number;
    certificacionesAmbientales: string[];
    multasAmbientales: number;
  };
  responsabilidadSocial: {
    empleosGenerados: number;
    inversionComunidad: number;
    proyectosSociales: string[];
    beneficiariosProgramas: number;
    satisfaccionComunidad: number; // Del 1 al 10
  };
  proyecciones: {
    metasProduccionProximoAño: number;
    inversionesPlaneadas: number;
    expansionOperaciones: string;
    riesgosIdentificados: string[];
    oportunidadesMercado: string[];
  };
}

// ============================================================================
// CONFIGURACIÓN DE CAMPOS PARA FORMULARIOS DINÁMICOS
// ============================================================================
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: string[]; // Para select y multiselect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  section: string; // Para agrupar campos
  order: number; // Para ordenar campos
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  fields: FormField[];
  order: number;
}

// ============================================================================
// CONFIGURACIONES DE FORMULARIOS POR TIPO
// ============================================================================
export const FRI_FORM_CONFIGS: Record<FRIType, FormSection[]> = {
  mensual: [
    {
      id: 'info_general',
      title: 'Información General',
      description: 'Datos básicos del reporte mensual',
      icon: 'information-circle',
      order: 1,
      fields: [
        {
          id: 'periodo_mes',
          label: 'Mes del reporte',
          type: 'select',
          required: true,
          options: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          section: 'info_general',
          order: 1
        },
        {
          id: 'periodo_año',
          label: 'Año',
          type: 'number',
          required: true,
          validation: { min: 2020, max: 2030 },
          section: 'info_general',
          order: 2
        }
      ]
    },
    {
      id: 'produccion',
      title: 'Datos de Producción',
      description: 'Información sobre la extracción mensual',
      icon: 'hammer',
      order: 2,
      fields: [
        {
          id: 'tipo_mineral',
          label: 'Tipo de Mineral',
          type: 'select',
          required: true,
          options: ['Oro', 'Carbón', 'Esmeraldas', 'Cobre', 'Hierro', 'Otro'],
          section: 'produccion',
          order: 1
        },
        {
          id: 'cantidad_extraida',
          label: 'Cantidad Extraída',
          type: 'number',
          required: true,
          validation: { min: 0, message: 'La cantidad debe ser positiva' },
          section: 'produccion',
          order: 2
        },
        {
          id: 'unidad_medida',
          label: 'Unidad de Medida',
          type: 'select',
          required: true,
          options: ['Toneladas', 'Metros Cúbicos', 'Kilogramos'],
          section: 'produccion',
          order: 3
        },
        {
          id: 'metodologia_extraccion',
          label: 'Metodología de Extracción',
          type: 'textarea',
          required: true,
          placeholder: 'Describe el método utilizado para la extracción...',
          section: 'produccion',
          order: 4
        },
        {
          id: 'dias_trabajo',
          label: 'Días de Trabajo',
          type: 'number',
          required: true,
          validation: { min: 1, max: 31 },
          section: 'produccion',
          order: 5
        },
        {
          id: 'numero_trabajadores',
          label: 'Número de Trabajadores',
          type: 'number',
          required: true,
          validation: { min: 1 },
          section: 'produccion',
          order: 6
        }
      ]
    },
    {
      id: 'comercializacion',
      title: 'Comercialización',
      description: 'Datos de venta y comercialización',
      icon: 'cash',
      order: 3,
      fields: [
        {
          id: 'cantidad_vendida',
          label: 'Cantidad Vendida',
          type: 'number',
          required: false,
          validation: { min: 0 },
          section: 'comercializacion',
          order: 1
        },
        {
          id: 'precio_unitario',
          label: 'Precio Unitario (COP)',
          type: 'number',
          required: false,
          validation: { min: 0 },
          section: 'comercializacion',
          order: 2
        },
        {
          id: 'comprador',
          label: 'Comprador',
          type: 'text',
          required: false,
          placeholder: 'Nombre del comprador o empresa',
          section: 'comercializacion',
          order: 3
        }
      ]
    },
    {
      id: 'ambiental',
      title: 'Aspectos Ambientales',
      description: 'Impacto y medidas ambientales',
      icon: 'leaf',
      order: 4,
      fields: [
        {
          id: 'consumo_agua',
          label: 'Consumo de Agua (m³)',
          type: 'number',
          required: true,
          validation: { min: 0 },
          section: 'ambiental',
          order: 1
        },
        {
          id: 'generacion_residuos',
          label: 'Generación de Residuos (Ton)',
          type: 'number',
          required: true,
          validation: { min: 0 },
          section: 'ambiental',
          order: 2
        },
        {
          id: 'medidas_mitigacion',
          label: 'Medidas de Mitigación',
          type: 'textarea',
          required: true,
          placeholder: 'Describe las medidas ambientales implementadas...',
          section: 'ambiental',
          order: 3
        }
      ]
    }
  ],
  
  trimestral: [
    // Configuración simplificada para trimestral - se puede expandir
    {
      id: 'resumen_trimestral',
      title: 'Resumen Trimestral',
      description: 'Consolidado del trimestre',
      icon: 'bar-chart',
      order: 1,
      fields: [
        {
          id: 'trimestre',
          label: 'Trimestre',
          type: 'select',
          required: true,
          options: ['1', '2', '3', '4'],
          section: 'resumen_trimestral',
          order: 1
        },
        {
          id: 'total_producido',
          label: 'Total Producido',
          type: 'number',
          required: true,
          validation: { min: 0 },
          section: 'resumen_trimestral',
          order: 2
        }
      ]
    }
  ],
  
  anual: [
    // Configuración simplificada para anual - se puede expandir
    {
      id: 'resumen_anual',
      title: 'Resumen Anual',
      description: 'Consolidado del año',
      icon: 'calendar',
      order: 1,
      fields: [
        {
          id: 'año',
          label: 'Año del Reporte',
          type: 'number',
          required: true,
          validation: { min: 2020, max: 2030 },
          section: 'resumen_anual',
          order: 1
        },
        {
          id: 'total_producido_anual',
          label: 'Total Producido en el Año',
          type: 'number',
          required: true,
          validation: { min: 0 },
          section: 'resumen_anual',
          order: 2
        }
      ]
    }
  ]
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================
export const createEmptyFRI = (tipo: FRIType): BaseFRIData => ({
  id: Date.now().toString(),
  tipo,
  fechaCreacion: new Date().toISOString(),
  estado: 'borrador',
  evidencias: [],
  responsable: {
    nombre: '',
    cedula: '',
    cargo: ''
  }
});

export const getFRITypeLabel = (tipo: FRIType): string => {
  const labels = {
    mensual: 'FRI Mensual',
    trimestral: 'FRI Trimestral',
    anual: 'FRI Anual'
  };
  return labels[tipo];
};

export const getFRITypeDescription = (tipo: FRIType): string => {
  const descriptions = {
    mensual: 'Reporte mensual de producción y actividades mineras',
    trimestral: 'Informe trimestral con análisis y proyecciones',
    anual: 'Reporte anual completo con impacto social y ambiental'
  };
  return descriptions[tipo];
};