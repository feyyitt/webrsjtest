/**
 * Environment Configuration
 * Mengelola semua environment variables
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database (untuk nanti)
  databaseUrl: process.env.DATABASE_URL,
  
  // JWT (untuk nanti)
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

// Validasi environment variables yang wajib
const validateEnv = () => {
  const requiredEnvVars = [
    { key: 'databaseUrl', name: 'DATABASE_URL' },
    { key: 'jwtSecret', name: 'JWT_SECRET' },
  ];
  
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!config[envVar.key]) {
      missingVars.push(envVar.name);
    }
  }
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
  }
};

// Jalankan validasi saat aplikasi start
try {
  validateEnv();
} catch (error) {
  console.error('❌ Environment validation error:', error.message);
  console.error('💡 Please copy .env.example to .env and fill in the required values.');
  process.exit(1); // Exit aplikasi jika env vars tidak lengkap
}

module.exports = config;
