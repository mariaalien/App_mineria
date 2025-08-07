import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  FileText,
  Calendar,
  MapPin,
  Factory,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface FRIProduccionData {
  // Información básica
  fechaReporte: string;
  periodoProduccion: string;
  tipoMineral: string;
  codigoMunicipio: string;
  nombreMunicipio: string;
  
  // Datos de producción
  cantidadExtraida: number | '';
  unidadMedida: string;
  destinoMineral: string;
  valorProduccion: number | '';
  metodosExtraccion: string[];
  
  // Información adicional
  observaciones: string;
  usuarioCreacion: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// ============================================================================
// DATOS MOCK PARA OPCIONES
// ============================================================================

const tiposMinerales = [
  { value: 'ORO', label: 'Oro' },
  { value: 'PLATA', label: 'Plata' },
  { value: 'PLATINO', label: 'Platino' },
  { value: 'CARBON', label: 'Carbón' },
  { value: 'NIQUEL', label: 'Níquel' },
  { value: 'HIERRO', label: 'Hierro' },
  { value: 'COBRE', label: 'Cobre' },
  { value: 'OTROS', label: 'Otros' }
];

const unidadesMedida = [
  { value: 'TONELADAS', label: 'Toneladas' },
  { value: 'GRAMOS', label: 'Gramos' },
  { value: 'KILOGRAMOS', label: 'Kilogramos' },
  { value: 'ONZAS', label: 'Onzas' },
  { value: 'M3', label: 'Metros Cúbicos' }
];

const destinosMinerales = [
  { value: 'EXPORTACION', label: 'Exportación' },
  { value: 'MERCADO_INTERNO', label: 'Mercado Interno' },
  { value: 'TRANSFORMACION', label: 'Transformación' },
  { value: 'ALMACENAMIENTO', label: 'Almacenamiento' }
];

const metodosExtraccion = [
  { value: 'SUBTERRANEA', label: 'Minería Subterránea' },
  { value: 'CIELO_ABIERTO', label: 'Cielo Abierto' },
  { value: 'ALUVIAL', label: 'Aluvial' },
  { value: 'FILONIANA', label: 'Filoniana' },
  { value: 'PLACER', label: 'Placer' }
];

const municipiosAntioquia = [
  { codigo: '05001', nombre: 'Medellín' },
  { codigo: '05088', nombre: 'Segovia' },
  { codigo: '05895', nombre: 'Remedios' },
  { codigo: '05250', nombre: 'El Bagre' },
  { codigo: '05490', nombre: 'Nechí' },
  { codigo: '05893', nombre: 'Zaragoza' }
];

// ============================================================================
// COMPONENTE PRINCIPAL - FORMULARIO FRI PRODUCCIÓN
// ============================================================================

const FormularioFRIProduccion: React.FC = () => {
  const [formData, setFormData] = useState<FRIProduccionData>({
    fechaReporte: new Date().toISOString().split('T')[0],
    periodoProduccion: '',
    tipoMineral: '',
    codigoMunicipio: '',
    nombreMunicipio: '',
    cantidadExtraida: '',
    unidadMedida: '',
    destinoMineral: '',
    valorProduccion: '',
    metodosExtraccion: [],
    observaciones: '',
    usuarioCreacion: 'María González'
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [progress, setProgress] = useState(0);

  // ============================================================================
  // VALIDACIONES
  // ============================================================================

  const validateField = useCallback((name: string, value: any): string => {
    switch (name) {
      case 'periodoProduccion':
        if (!value) return 'El período de producción es requerido';
        return '';
      
      case 'tipoMineral':
        if (!value) return 'El tipo de mineral es requerido';
        return '';
      
      case 'codigoMunicipio':
        if (!value) return 'El código de municipio es requerido';
        if (!/^\d{5}$/.test(value)) return 'El código debe tener 5 dígitos';
        return '';
      
      case 'cantidadExtraida':
        if (value === '' || value < 0) return 'La cantidad debe ser mayor a 0';
        return '';
      
      case 'unidadMedida':
        if (!value) return 'La unidad de medida es requerida';
        return '';
      
      case 'destinoMineral':
        if (!value) return 'El destino del mineral es requerido';
        return '';
      
      case 'valorProduccion':
        if (value === '' || value < 0) return 'El valor de producción debe ser mayor a 0';
        return '';
      
      case 'metodosExtraccion':
        if (!Array.isArray(value) || value.length === 0) {
          return 'Debe seleccionar al menos un método de extracción';
        }
        return '';
      
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FRIProduccionData]);
      if (error) newErrors[key] = error;
    });

    return newErrors;
  }, [formData, validateField]);

  // ============================================================================
  // HANDLERS DE CAMBIO
  // ============================================================================

  const handleInputChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validación en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Auto-save después de 2 segundos
    triggerAutoSave();
  }, [validateField]);

  const handleMunicipioChange = useCallback((codigo: string) => {
    const municipio = municipiosAntioquia.find(m => m.codigo === codigo);
    setFormData(prev => ({
      ...prev,
      codigoMunicipio: codigo,
      nombreMunicipio: municipio?.nombre || ''
    }));
    
    triggerAutoSave();
  }, []);

  const handleMetodosChange = useCallback((metodo: string, checked: boolean) => {
    setFormData(prev => {
      const newMetodos = checked 
        ? [...prev.metodosExtraccion, metodo]
        : prev.metodosExtraccion.filter(m => m !== metodo);
      
      return { ...prev, metodosExtraccion: newMetodos };
    });
    
    triggerAutoSave();
  }, []);

  // ============================================================================
  // AUTO-SAVE
  // ============================================================================

  const triggerAutoSave = useCallback(() => {
    setAutoSaveStatus('saving');
    
    setTimeout(() => {
      // Simular guardado automático
      localStorage.setItem('fri_produccion_draft', JSON.stringify(formData));
      setAutoSaveStatus('saved');
      setIsDraft(true);
      
      setTimeout(() => setAutoSaveStatus(null), 2000);
    }, 1000);
  }, [formData]);

  // ============================================================================
  // CÁLCULO DE PROGRESO
  // ============================================================================

  useEffect(() => {
    const requiredFields = [
      'periodoProduccion', 'tipoMineral', 'codigoMunicipio', 
      'cantidadExtraida', 'unidadMedida', 'destinoMineral', 
      'valorProduccion', 'metodosExtraccion'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof FRIProduccionData];
      return Array.isArray(value) ? value.length > 0 : value !== '' && value !== null;
    });
    
    setProgress((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  // ============================================================================
  // CARGAR BORRADOR
  // ============================================================================

  useEffect(() => {
    const draft = localStorage.getItem('fri_produccion_draft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setFormData(draftData);
        setIsDraft(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // ============================================================================
  // HANDLERS DE ENVÍO
  // ============================================================================

  const handleSubmit = useCallback(async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular envío a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpiar borrador
      localStorage.removeItem('fri_produccion_draft');
      setIsDraft(false);
      
      alert('Formulario FRI de Producción enviado exitosamente');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error al enviar el formulario');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm]);

  const handleSaveDraft = useCallback(() => {
    localStorage.setItem('fri_produccion_draft', JSON.stringify(formData));
    setIsDraft(true);
    setAutoSaveStatus('saved');
    setTimeout(() => setAutoSaveStatus(null), 2000);
  }, [formData]);

  const handleReset = useCallback(() => {
    if (window.confirm('¿Está seguro que desea limpiar todos los campos?')) {
      setFormData({
        fechaReporte: new Date().toISOString().split('T')[0],
        periodoProduccion: '',
        tipoMineral: '',
        codigoMunicipio: '',
        nombreMunicipio: '',
        cantidadExtraida: '',
        unidadMedida: '',
        destinoMineral: '',
        valorProduccion: '',
        metodosExtraccion: [],
        observaciones: '',
        usuarioCreacion: 'María González'
      });
      setErrors({});
      localStorage.removeItem('fri_produccion_draft');
      setIsDraft(false);
    }
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      
      {/* HEADER */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
            }}>
              <FileText style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 4px 0'
              }}>
                FRI Producción Mensual
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontWeight: '500' }}>
                Formato de Registro de Información - Resolución ANM 371/2024
              </p>
            </div>
          </div>

          {/* STATUS Y ACCIONES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {autoSaveStatus && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: autoSaveStatus === 'saved' ? '#f0fdf4' : '#fef3c7',
                color: autoSaveStatus === 'saved' ? '#166534' : '#92400e',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {autoSaveStatus === 'saving' ? (
                  <Clock style={{ width: '14px', height: '14px' }} />
                ) : autoSaveStatus === 'saved' ? (
                  <CheckCircle style={{ width: '14px', height: '14px' }} />
                ) : (
                  <AlertCircle style={{ width: '14px', height: '14px' }} />
                )}
                {autoSaveStatus === 'saving' ? 'Guardando...' : 
                 autoSaveStatus === 'saved' ? 'Guardado automático' : 'Error al guardar'}
              </div>
            )}

            {isDraft && (
              <div style={{
                padding: '8px 12px',
                background: '#fef3c7',
                color: '#92400e',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Borrador guardado
              </div>
            )}
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Progreso del formulario
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        
        {/* INFORMACIÓN BÁSICA */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            Información Básica
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Fecha Reporte */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Fecha del Reporte *
              </label>
              <input
                type="date"
                value={formData.fechaReporte}
                onChange={(e) => handleInputChange('fechaReporte', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.fechaReporte ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
              {errors.fechaReporte && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.fechaReporte}
                </p>
              )}
            </div>

            {/* Período Producción */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Período de Producción *
              </label>
              <input
                type="month"
                value={formData.periodoProduccion}
                onChange={(e) => handleInputChange('periodoProduccion', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.periodoProduccion ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
              {errors.periodoProduccion && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.periodoProduccion}
                </p>
              )}
            </div>

            {/* Tipo Mineral */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Tipo de Mineral *
              </label>
              <select
                value={formData.tipoMineral}
                onChange={(e) => handleInputChange('tipoMineral', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.tipoMineral ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <option value="">Seleccione tipo de mineral</option>
                {tiposMinerales.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {errors.tipoMineral && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.tipoMineral}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* UBICACIÓN */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin style={{ width: '20px', height: '20px', color: '#10b981' }} />
            Ubicación
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Municipio */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Municipio *
              </label>
              <select
                value={formData.codigoMunicipio}
                onChange={(e) => handleMunicipioChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.codigoMunicipio ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <option value="">Seleccione municipio</option>
                {municipiosAntioquia.map(municipio => (
                  <option key={municipio.codigo} value={municipio.codigo}>
                    {municipio.nombre} ({municipio.codigo})
                  </option>
                ))}
              </select>
              {errors.codigoMunicipio && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.codigoMunicipio}
                </p>
              )}
            </div>

            {/* Código Municipio (readonly) */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Código DANE
              </label>
              <input
                type="text"
                value={formData.codigoMunicipio}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  background: '#f9fafb',
                  color: '#6b7280'
                }}
              />
            </div>
          </div>
        </div>

        {/* DATOS DE PRODUCCIÓN */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Factory style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            Datos de Producción
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Cantidad Extraída */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Cantidad Extraída *
              </label>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={formData.cantidadExtraida}
                onChange={(e) => handleInputChange('cantidadExtraida', parseFloat(e.target.value) || '')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.cantidadExtraida ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                placeholder="Ej: 150.5"
              />
              {errors.cantidadExtraida && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.cantidadExtraida}
                </p>
              )}
            </div>

            {/* Unidad Medida */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Unidad de Medida *
              </label>
              <select
                value={formData.unidadMedida}
                onChange={(e) => handleInputChange('unidadMedida', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.unidadMedida ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <option value="">Seleccione unidad</option>
                {unidadesMedida.map(unidad => (
                  <option key={unidad.value} value={unidad.value}>
                    {unidad.label}
                  </option>
                ))}
              </select>
              {errors.unidadMedida && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.unidadMedida}
                </p>
              )}
            </div>

            {/* Valor Producción */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Valor de Producción (COP) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.valorProduccion}
                onChange={(e) => handleInputChange('valorProduccion', parseFloat(e.target.value) || '')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.valorProduccion ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                placeholder="Ej: 5500000"
              />
              {errors.valorProduccion && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.valorProduccion}
                </p>
              )}
            </div>

            {/* Destino Mineral */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Destino del Mineral *
              </label>
              <select
                value={formData.destinoMineral}
                onChange={(e) => handleInputChange('destinoMineral', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.destinoMineral ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <option value="">Seleccione destino</option>
                {destinosMinerales.map(destino => (
                  <option key={destino.value} value={destino.value}>
                    {destino.label}
                  </option>
                ))}
              </select>
              {errors.destinoMineral && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.destinoMineral}
                </p>
              )}
            </div>
          </div>

          {/* Métodos de Extracción */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Métodos de Extracción * (Seleccione uno o más)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: errors.metodosExtraccion ? '2px solid #ef4444' : '1px solid #e5e7eb'
            }}>
              {metodosExtraccion.map(metodo => (
                <label key={metodo.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                >
                  <input
                    type="checkbox"
                    checked={formData.metodosExtraccion.includes(metodo.value)}
                    onChange={(e) => handleMetodosChange(metodo.value, e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span style={{
                    fontSize: '14px',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {metodo.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.metodosExtraccion && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '8px 0 0 0' }}>
                {errors.metodosExtraccion}
              </p>
            )}
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Observaciones
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            rows={4}
            placeholder="Información adicional relevante sobre la producción..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.2s ease'
            }}
          />
        </div>

        {/* ACCIONES */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '24px 0 0 0',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleSaveDraft}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f59e0b';
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              Guardar Borrador
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#6b7280';
              }}
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} />
              Limpiar
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              <Eye style={{ width: '16px', height: '16px' }} />
              Vista Previa
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload style={{ width: '16px', height: '16px' }} />
                  Enviar FRI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS ANIMATIONS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default FormularioFRIProduccion;