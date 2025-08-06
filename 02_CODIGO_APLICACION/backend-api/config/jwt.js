const jwt = require('jsonwebtoken');

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'anm_fri_secret_2025_secure_key',
  expiresIn: '24h',
  issuer: 'ANM-FRI-System',
  audience: 'anm-fri-users'
};

const generateToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
};

module.exports = {
  JWT_CONFIG,
  generateToken,
  verifyToken
};
