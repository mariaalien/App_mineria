import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/LoginImproved';
import Dashboard from './pages/Dashboard';
import AdvancedCharts from './pages/AdvancedCharts';
import Analytics from './pages/Analytics';
import SistemaFormularios from './pages/SistemaFormularios';
import FormularioFRIProduccion from './pages/FormularioFRIProduccion';
import ReportsDashboard from './pages/ReportsDashboard';
import PremiumNavbar from './components/PremiumNavbar';
import GestionDatos from './pages/GestionDatos';
import EdicionInline from './pages/EdicionInline';
import SistemaTagsVistas from './pages/SistemaTagsVistas';

// Importar componentes de accesibilidad y PWA
import AccessibilityProvider from './components/AccessibilityProvider';
import AccessibilityFAB, { StatusIndicators } from './components/AccessibilityFAB';

// ============================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN - CON ACCESIBILIDAD Y PWA
// ============================================================================

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null;
  };

  // Componente para rutas protegidas
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return isAuthenticated() ? (
      <>
        <PremiumNavbar 
          activeRoute={currentRoute}
          onRouteChange={setCurrentRoute}
        />
        {children}
      </>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <AccessibilityProvider>
      <Router>
        {/* Skip Links para accesibilidad */}
        <div>
          <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
            Saltar al contenido principal
          </a>
          <a href="#main-navigation" className="skip-link sr-only focus:not-sr-only">
            Ir al menú principal
          </a>
        </div>

        {/* Indicadores de estado */}
        <StatusIndicators />

        <main id="main-content" role="main">
          <Routes>
            {/* Ruta de Login */}
            <Route 
              path="/login" 
              element={
                isAuthenticated() ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              } 
            />

            {/* Rutas Protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/reportes" 
              element={
                <ProtectedRoute>
                  <ReportsDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/graficos" 
              element={
                <ProtectedRoute>
                  <AdvancedCharts />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/formularios" 
              element={
                <ProtectedRoute>
                  <SistemaFormularios />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/formularios/produccion" 
              element={
                <ProtectedRoute>
                  <FormularioFRIProduccion />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/datos" 
              element={
                <ProtectedRoute>
                  <GestionDatos />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/datos/edicion" 
              element={
                <ProtectedRoute>
                  <EdicionInline />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/datos/tags" 
              element={
                <ProtectedRoute>
                  <SistemaTagsVistas />
                </ProtectedRoute>
              } 
            />

            {/* Ruta por defecto */}
            <Route 
              path="/" 
              element={
                isAuthenticated() ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Ruta 404 */}
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      background: 'white',
                      padding: '48px 32px',
                      borderRadius: '20px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                      maxWidth: '480px',
                      margin: '20px'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '50%',
                        margin: '0 auto 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '32px'
                      }}>
                        404
                      </div>
                      <h1 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        margin: '0 0 16px 0',
                        color: '#1f2937'
                      }}>
                        Página no encontrada
                      </h1>
                      <p style={{
                        fontSize: '16px',
                        lineHeight: 1.6,
                        margin: '0 0 32px 0',
                        color: '#6b7280'
                      }}>
                        La página que buscas no existe o ha sido movida.
                      </p>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        style={{
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: 'white',
                          padding: '12px 24px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        Volver al Dashboard
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>

        {/* Botón flotante de accesibilidad */}
        <AccessibilityFAB />

        {/* Estilos para Skip Links */}
        <style>
          {`
            .skip-link {
              position: absolute !important;
              top: -40px !important;
              left: 6px !important;
              background: #2563eb !important;
              color: white !important;
              padding: 8px !important;
              text-decoration: none !important;
              border-radius: 4px !important;
              z-index: 1000 !important;
              font-weight: 600 !important;
            }

            .skip-link:focus {
              top: 6px !important;
            }

            .sr-only {
              position: absolute !important;
              width: 1px !important;
              height: 1px !important;
              padding: 0 !important;
              margin: -1px !important;
              overflow: hidden !important;
              clip: rect(0, 0, 0, 0) !important;
              white-space: nowrap !important;
              border: 0 !important;
            }

            .focus\\:not-sr-only:focus {
              position: static !important;
              width: auto !important;
              height: auto !important;
              padding: inherit !important;
              margin: inherit !important;
              overflow: visible !important;
              clip: auto !important;
              white-space: normal !important;
            }
          `}
        </style>
      </Router>
    </AccessibilityProvider>
  );
};

export default App;