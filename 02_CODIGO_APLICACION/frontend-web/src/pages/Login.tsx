// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  AdminPanelSettings,
  Engineering,
  Business
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

// ============================================================================
// 🎯 INTERFACES
// ============================================================================

interface DemoUser {
  email: string;
  password: string;
  rol: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// ============================================================================
// 🏠 COMPONENTE LOGIN
// ============================================================================

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, isOnline, apiConnected } = useAuth();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // 👥 USUARIOS DEMO DISPONIBLES
  // ============================================================================

  const demoUsers: DemoUser[] = [
    {
      email: 'admin@anm.gov.co',
      password: 'admin123',
      rol: 'ADMIN',
      description: 'Acceso completo al sistema',
      icon: <AdminPanelSettings />,
      color: '#d32f2f'
    },
    {
      email: 'supervisor@anm.gov.co',
      password: 'supervisor123',
      rol: 'SUPERVISOR',
      description: 'Supervisión y reportes',
      icon: <Security />,
      color: '#ed6c02'
    },
    {
      email: 'operador@anm.gov.co',
      password: 'operador123',
      rol: 'OPERADOR',
      description: 'Captura de datos FRI',
      icon: <Engineering />,
      color: '#2e7d32'
    }
  ];

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  useEffect(() => {
    // Redirigir si ya está autenticado
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  // ============================================================================
  // 📝 MANEJADORES DE EVENTOS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    if (!apiConnected) {
      setError('No hay conexión con el servidor. Verifica tu conexión a internet.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const result = await login({ email: email.trim(), password });

      if (result.success) {
        // El AuthProvider ya maneja la redirección
        console.log('Login exitoso, redirigiendo...');
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (demoUser: DemoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setError('');
  };

  // ============================================================================
  // 🎨 RENDERIZADO
  // ============================================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Box sx={{ width: 300, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Iniciando Sistema ANM FRI...
          </Typography>
          <LinearProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }} elevation={8}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Business sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Sistema ANM FRI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Formatos de Reporte de Información - Agencia Nacional de Minería
            </Typography>
          </Box>

          {/* Estado de conexión */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Chip
                label={isOnline ? "En línea" : "Sin conexión"}
                color={isOnline ? "success" : "error"}
                size="small"
              />
              <Chip
                label={apiConnected ? "API conectada" : "API desconectada"}
                color={apiConnected ? "success" : "warning"}
                size="small"
              />
            </Stack>
          </Box>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                autoFocus
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting || !apiConnected}
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Stack>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Usuarios Demo
            </Typography>
          </Divider>

          {/* Usuarios demo */}
          <Stack spacing={2}>
            {demoUsers.map((user) => (
              <Card
                key={user.email}
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: user.color
                  }
                }}
                onClick={() => handleDemoLogin(user)}
              >
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ color: user.color, mr: 2 }}>
                      {user.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={user.rol}
                      size="small"
                      sx={{
                        bgcolor: user.color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Footer info */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {!apiConnected && (
                <>⚠️ Servidor backend no disponible. Usando modo demo.</>
              )}
              {apiConnected && (
                <>🟢 Conectado al backend en desarrollo.</>
              )}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;