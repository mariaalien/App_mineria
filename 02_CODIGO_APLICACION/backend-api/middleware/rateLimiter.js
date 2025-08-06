const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Rate limiters por endpoint
const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
      success: false,
      message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip para usuarios ADMIN
      return req.user?.rol === 'ADMIN';
    }
  };

  return rateLimit({ ...defaults, ...options });
};

// Rate limiter específico para login
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.',
    code: 'LOGIN_RATE_LIMIT'
  }
});

// Rate limiter para API general
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Rate limiter para operaciones críticas
const criticalLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 operaciones críticas
  message: {
    success: false,
    message: 'Límite de operaciones críticas excedido.',
    code: 'CRITICAL_RATE_LIMIT'
  }
});

// Slow down para degradar performance gradualmente
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50, // después de 50 requests, empezar a ralentizar
  delayMs: 500, // agregar 500ms de delay por cada request adicional
  maxDelayMs: 20000, // máximo 20 segundos de delay
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  apiLimiter,
  criticalLimiter,
  speedLimiter
};
