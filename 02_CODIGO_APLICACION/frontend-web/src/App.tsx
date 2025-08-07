import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/LoginImproved';
import Dashboard from './pages/Dashboard';
import AdvancedCharts from './pages/AdvancedCharts';
import Analytics from './pages/Analytics';
import PremiumNavbar from './components/PremiumNavbar';

// ============================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
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