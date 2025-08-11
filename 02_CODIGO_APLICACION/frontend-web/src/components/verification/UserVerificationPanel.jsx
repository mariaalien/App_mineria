import React, { useState } from 'react';

const UserVerificationPanel = () => {
  const [formData, setFormData] = useState({
    telefono: '',
    tituloMinero: '',
    codigoVerificacion: ''
  });
  
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [user] = useState({
    id: 'user123',
    email: 'operador@minera.com',
    nombre: 'María Fernanda Operador',
    verificado: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCode = async () => {
    setLoading(true);
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCodeGenerated(true);
      alert('Código enviado: 123456 (Solo visible en desarrollo)');
    } catch (error) {
      alert('Error generando código');
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular verificación
      const score = Math.random() * 100;
      const mockResult = {
        puntuacionConfianza: Math.floor(score),
        nivelVerificacion: score >= 70 ? 'ALTO' : score >= 40 ? 'MEDIO' : 'BAJO',
        verificaciones: [
          { campo: 'telefono', verificado: !!formData.telefono },
          { campo: 'tituloMinero', verificado: !!formData.tituloMinero },
          { campo: 'codigoVerificacion', verificado: formData.codigoVerificacion === '123456' }
        ],
        exitosa: score >= 70
      };
      
      setResult(mockResult);
    } catch (error) {
      alert('Error en verificación');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10B981'; // green
    if (score >= 40) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F9FAFB', 
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#3B82F6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              🛡️
            </div>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#111827',
                margin: 0
              }}>
                Verificación de Usuario
              </h1>
              <p style={{ 
                color: '#6B7280', 
                fontSize: '14px',
                margin: '4px 0 0 0'
              }}>
                Sistema de verificación de identidad ANM FRI
              </p>
            </div>
          </div>
          
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: user.verificado ? '#D1FAE5' : '#FEF3C7',
            borderRadius: '8px',
            border: `1px solid ${user.verificado ? '#A7F3D0' : '#FDE68A'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>
              {user.verificado ? '✅' : '⚠️'}
            </span>
            <span style={{ 
              fontWeight: '500',
              color: user.verificado ? '#065F46' : '#92400E'
            }}>
              Estado: {user.verificado ? 'Verificado' : 'No Verificado'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Panel de Verificación */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '16px'
            }}>
              Información del Usuario
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Nombre:</strong> {user.nombre}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Email:</strong> {user.email}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>ID:</strong> <code style={{ 
                  backgroundColor: '#F3F4F6', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>{user.id}</code>
              </div>
            </div>

            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '16px'
            }}>
              Datos de Verificación
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '6px'
              }}>
                📱 Número de Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="+57 300 123 4567"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '6px'
              }}>
                📄 Título Minero
              </label>
              <input
                type="text"
                value={formData.tituloMinero}
                onChange={(e) => handleInputChange('tituloMinero', e.target.value)}
                placeholder="TM-12345-2024"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            <button
              onClick={generateCode}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: '16px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563EB')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3B82F6')}
            >
              {loading ? '⏳ Generando...' : codeGenerated ? '📤 Reenviar Código' : '📨 Generar Código'}
            </button>

            {codeGenerated && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  🔑 Código de Verificación
                </label>
                <input
                  type="text"
                  value={formData.codigoVerificacion}
                  onChange={(e) => handleInputChange('codigoVerificacion', e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6B7280', 
                  marginTop: '4px' 
                }}>
                  Código enviado por SMS/Email. Válido por 10 minutos.
                </p>
              </div>
            )}

            <button
              onClick={submitVerification}
              disabled={loading || !codeGenerated || !formData.codigoVerificacion}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: (!codeGenerated || !formData.codigoVerificacion || loading) ? 'not-allowed' : 'pointer',
                opacity: (!codeGenerated || !formData.codigoVerificacion || loading) ? 0.5 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (codeGenerated && formData.codigoVerificacion && !loading) {
                  e.target.style.backgroundColor = '#059669';
                }
              }}
              onMouseOut={(e) => {
                if (codeGenerated && formData.codigoVerificacion && !loading) {
                  e.target.style.backgroundColor = '#10B981';
                }
              }}
            >
              {loading ? '🔄 Verificando...' : '✅ Verificar Identidad'}
            </button>
          </div>

          {/* Resultado */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '16px'
            }}>
              Resultado de Verificación
            </h2>

            {!result ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6B7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                <p>Complete el formulario de verificación para ver el resultado</p>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: result.exitosa ? '#D1FAE5' : '#FEF3C7',
                border: `1px solid ${result.exitosa ? '#A7F3D0' : '#FDE68A'}`
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '24px' }}>
                    {result.exitosa ? '✅' : '⚠️'}
                  </span>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    margin: 0,
                    color: result.exitosa ? '#065F46' : '#92400E'
                  }}>
                    {result.exitosa ? 'Verificación Exitosa' : 'Verificación Incompleta'}
                  </h3>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '500' }}>Puntuación de Confianza:</span>
                    <span style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold',
                      color: getScoreColor(result.puntuacionConfianza)
                    }}>
                      {result.puntuacionConfianza}%
                    </span>
                  </div>
                  
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${result.puntuacionConfianza}%`,
                      height: '100%',
                      backgroundColor: getScoreColor(result.puntuacionConfianza),
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: '500' }}>Nivel de Verificación:</span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: result.puntuacionConfianza >= 70 ? '#D1FAE5' : 
                                      result.puntuacionConfianza >= 40 ? '#FEF3C7' : '#FEE2E2',
                      color: result.puntuacionConfianza >= 70 ? '#065F46' : 
                             result.puntuacionConfianza >= 40 ? '#92400E' : '#991B1B'
                    }}>
                      {result.nivelVerificacion}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '12px',
                    color: '#374151'
                  }}>
                    Detalles de Verificación:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.verificaciones.map((v, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}>
                        <span style={{ textTransform: 'capitalize' }}>
                          {v.campo.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <span style={{ fontSize: '16px' }}>
                          {v.verificado ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVerificationPanel;v