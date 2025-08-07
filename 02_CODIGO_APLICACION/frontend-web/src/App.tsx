import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importar tus componentes
import LoginImproved from './pages/LoginImproved';
import Dashboard from './pages/Dashboard';
import AdvancedCharts from './pages/AdvancedCharts'; // NUEVA RUTA

// Componente de ruta protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Layout con navegación
const Layout = ({ children }: { children: React.ReactNode }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header simple */}
      <header style={{
        background: 'white',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#1f2937' }}>Sistema ANM FRI</h1>
        
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            📊 Dashboard
          </a>
          <a href="/analytics" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            📈 Analytics
          </a>
          <button onClick={handleLogout} style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Salir
          </button>
        </nav>
      </header>
      
      <main style={{ padding: '24px' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginImproved />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* NUEVA RUTA: Analytics */}
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout>
              <AdvancedCharts />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>404 - Página no encontrada</h1>
            <a href="/dashboard">Volver al Dashboard</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;