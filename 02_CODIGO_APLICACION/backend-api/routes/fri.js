// routes/fri.js - Versión mínima para aislar el error
const express = require('express');

const router = express.Router();

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '🎉 Ruta básica funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta con parámetro simple
router.get('/test/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Ruta con parámetro funcionando',
    id: req.params.id,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;