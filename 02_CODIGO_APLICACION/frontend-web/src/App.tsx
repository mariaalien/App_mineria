import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/LoginImproved';
import Dashboard from './pages/Dashboard';
import AdvancedCharts from './pages/AdvancedCharts';
import Analytics from './pages/Analytics';
import SistemaFormularios from './pages/SistemaFormularios';
import FormularioFRIProduccion from './pages/FormularioFRIProduccion';
import PremiumNavbar from './components/PremiumNavbar';
import GestionDatos from './pages/GestionDatos';
import EdicionInline from './pages/EdicionInline';
import SistemaTagsVistas from './pages/SistemaTagsVistas';

// ============================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN - DÍA 9 ACTUALIZADO
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
    <Router>
      <Routes>
        {/* Ruta de Login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated() ? 
            <Navigate to="/dashboard" replace /> : 
            <Login />
          } 
        />
        
        {/* Rutas protegidas */}
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
          path="/charts" 
          element={
            <ProtectedRoute>
              <AdvancedCharts />
            </ProtectedRoute>
          } 
        />

        {/* NUEVAS RUTAS - DÍA 9 */}
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
          path="/edicion" 
          element={
            <ProtectedRoute>
              <EdicionInline />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tags-vistas" 
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
            <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />
          } 
        />
        
        {/* Ruta para páginas no encontradas */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;