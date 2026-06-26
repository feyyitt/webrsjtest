/**
 * Express App Configuration
 * Setup semua middleware dan routing
 */

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// Inisialisasi Express app
const app = express();

/**
 * Middlewares
 */

// CORS - Hanya izinkan origin yang dikenal
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'http://localhost:5173']
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parser untuk JSON
app.use(express.json());

// Body parser untuk URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (hanya di development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Routes
 */

// Mount API routes di /api
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventaris Barang RSJ API',
    version: '1.0.0',
    docs: '/api',
  });
});

/**
 * Error Handlers
 */

// Handle 404 - Route tidak ditemukan
app.use(notFoundHandler);

// Global error handler - harus di akhir
app.use(errorHandler);

module.exports = app;
