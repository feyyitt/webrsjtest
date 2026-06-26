/**
 * Routes Configuration
 * Mengelola semua routing endpoint API
 */

const express = require('express');
const { sendSuccess } = require('../utils/response');
const authRoutes = require('./auth.routes');
const barangRoutes = require('./barang.routes');
const asetRoutes = require('./aset.routes');
const habisPakaiRoutes = require('./habis-pakai.routes');
const laporanRoutes = require('./laporan.routes');
const scanRoutes = require('./scan.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

/**
 * Health Check Endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    service: 'Inventaris Barang RSJ API',
    version: '1.0.0',
  };

  return sendSuccess(res, healthData, 'Server is running healthy');
});

/**
 * Welcome Endpoint
 * GET /api/
 */
router.get('/', (req, res) => {
  return sendSuccess(
    res,
    {
      name: 'Inventaris Barang RSJ API',
      version: '1.0.0',
      description: 'Backend API untuk Sistem Inventaris Barang RSJ',
    },
    'Welcome to Inventaris Barang RSJ API'
  );
});

/**
 * Mount Routes
 */

// Auth routes
router.use('/auth', authRoutes);

// Barang routes
router.use('/barang', barangRoutes);

// Aset routes
router.use('/aset', asetRoutes);

// Habis Pakai routes
router.use('/habis-pakai', habisPakaiRoutes);

// Laporan routes (khusus ADMIN)
router.use('/laporan', laporanRoutes);

// Scan routes
router.use('/scan', scanRoutes);

// User management routes (admin only)
router.use('/users', userRoutes);

// Export router
module.exports = router;
