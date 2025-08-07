import React, { useState } from 'react';

interface LoginCredentials {
  email: string;
  password: string;
}

const LoginImproved: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Credenciales válidas según tu backend
  const validCredentials = [
    { 
      email: 'admin@anm.gov.co', 
      password: 'admin123', 
      role: 'ADMIN',
      name: 'Administrador',
      bgColor: '#2563eb',
      icon: '👑'
    },
    { 
      email: 'supervisor@anm.gov.co', 
      password: 'supervisor123', 
      role: 'SUPERVISOR',
      name: 'Supervisor',
      bgColor: '#059669',
      icon: '👨‍💼'
    },
    { 
      email: 'operador@anm.gov.co', 
      password: 'operador123', 
      role: 'OPERADOR',
      name: 'Operador',
      bgColor: '#7c3aed',
      icon: '👨‍💻'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Por favor completa todos los campos');
      }

      if (!credentials.email.includes('@')) {
        throw new Error('Por favor ingresa un email válido');
      }

      if (credentials.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      if (data.success) {
        setSuccess('¡Login exitoso! Redirigiendo al dashboard...');
        
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }

    } catch (error) {
      console.error('Error en login:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (credIndex: number) => {
    const creds = validCredentials[credIndex];
    if (creds) {
      setCredentials({
        email: creds.email,
        password: creds.password
      });
      setError('');
      setSuccess('');
    }
  };

  const isFormValid = credentials.email.length > 0 && credentials.password.length >= 6;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Fondo con patrón */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                         radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
        backgroundSize: '60px 60px'
      }}></div>

      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%', 
        maxWidth: '900px',
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
        gap: '40px',
        alignItems: 'center'
      }}>
        
        {/* Panel izquierdo - Solo visible en pantallas grandes */}
        {window.innerWidth > 768 && (
          <div style={{ color: 'white', padding: '40px' }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                margin: '0 0 16px 0',
                background: 'linear-gradient(135deg, #ffffff, #e0e7ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Sistema ANM FRI
              </h1>
              <p style={{ 
                fontSize: '20px', 
                margin: '0 0 32px 0',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.6'
              }}>
                Plataforma Integral de Gestión de Formatos de Reportes de Información
              </p>
              <div style={{
                width: '60px',
                height: '4px',
                background: 'linear-gradient(90deg, #ffffff, transparent)',
                borderRadius: '2px'
              }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  🛡️
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    margin: '0 0 4px 0',
                    color: 'white'
                  }}>
                    Seguridad Avanzada
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px' 
                  }}>
                    Autenticación JWT con roles y permisos granulares
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  📊
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    margin: '0 0 4px 0',
                    color: 'white'
                  }}>
                    Dashboard Empresarial
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px' 
                  }}>
                    Métricas en tiempo real y KPIs avanzados
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  ✅
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    margin: '0 0 4px 0',
                    color: 'white'
                  }}>
                    Cumplimiento Total
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px' 
                  }}>
                    100% compatible con Resolución ANM 371/2024
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: '40px', 
              paddingTop: '24px', 
              borderTop: '1px solid rgba(255,255,255,0.2)' 
            }}>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.7)',
                margin: 0 
              }}>
                Desarrollado por <strong style={{ color: 'rgba(255,255,255,0.9)' }}>CTGlobal</strong> - Día 8 de desarrollo
              </p>
            </div>
          </div>
        )}

        {/* Panel derecho - Formulario de login */}
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            
            {/* Header del formulario */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '16px',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <span style={{ fontSize: '28px' }}>🔐</span>
              </div>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                margin: '0 0 8px 0' 
              }}>
                Acceso al Sistema
              </h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                Ingresa con tu cuenta autorizada
              </p>
            </div>

            {/* Credenciales rápidas */}
            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '28px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                margin: '0 0 16px 0' 
              }}>
                🚀 Acceso rápido - Demo:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {validCredentials.map((cred, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillDemoCredentials(index)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = cred.bgColor;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: cred.bgColor,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {cred.icon}
                    </div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                        {cred.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {cred.email}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af',
                      fontWeight: '500'
                    }}>
                      Click para acceder
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario */}
            <div style={{ marginBottom: '24px' }}>
              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  📧 Correo Electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  placeholder="usuario@anm.gov.co"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    background: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  🔒 Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={handleInputChange}
                    placeholder="Tu contraseña"
                    style={{
                      width: '100%',
                      padding: '16px 50px 16px 20px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.background = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: '#6b7280',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Mensajes */}
              {error && (
                <div style={{
                  padding: '16px',
                  background: '#fee2e2',
                  border: '2px solid #fecaca',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <span style={{ color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>{error}</span>
                </div>
              )}

              {success && (
                <div style={{
                  padding: '16px',
                  background: '#d1fae5',
                  border: '2px solid #a7f3d0',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  <span style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>{success}</span>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isFormValid && !isLoading 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                    : '#9ca3af',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: isFormValid && !isLoading ? '0 8px 32px rgba(102, 126, 234, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (isFormValid && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isFormValid && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
                  }
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  '🚀 Acceder al Sistema'
                )}
              </button>
            </div>

            {/* Footer */}
            <div style={{ 
              textAlign: 'center', 
              paddingTop: '24px', 
              borderTop: '2px solid #f3f4f6',
              marginTop: '24px'
            }}>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0' }}>
                🏛️ Sistema de Gestión ANM FRI v1.0
              </p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                Agencia Nacional de Minería - Colombia
              </p>
            </div>

            {/* Estado de conexión */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#f0fdf4',
                borderRadius: '20px',
                border: '2px solid #bbf7d0'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#22c55e',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
                  🌐 Backend conectado - Puerto 3001
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default LoginImproved;