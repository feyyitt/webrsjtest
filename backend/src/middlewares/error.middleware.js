/**
 * Global Error Handler Middleware
 * Menangani semua error yang terjadi di aplikasi
 */

const { sendError } = require('../utils/response');

/**
 * Error handler middleware untuk menangkap semua error
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Zod validation errors (nanti)
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));
  }

  // Handle Prisma errors (nanti)
  if (err.code && err.code.startsWith('P')) {
    statusCode = 400;
    message = 'Database Error';
    
    // Prisma unique constraint error
    if (err.code === 'P2002') {
      message = 'Data sudah ada (duplicate entry)';
    }
    
    // Prisma not found error
    if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Data tidak ditemukan';
    }
  }

  // Handle JWT errors (nanti)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token tidak valid';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token sudah kadaluarsa';
  }

  // Send error response
  return sendError(res, message, statusCode, errors);
};

/**
 * Middleware untuk handle 404 Not Found
 */
const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route ${req.originalUrl} tidak ditemukan`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
