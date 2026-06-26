/**
 * Auth Middleware
 * Middleware untuk verifikasi JWT token
 */

const authService = require('../services/auth.service');
const { sendError } = require('../utils/response');

/**
 * Middleware untuk autentikasi
 * Verifikasi JWT token dari header Authorization
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendError(res, 'Token tidak ditemukan', 401);
    }

    // Check Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Format token tidak valid. Gunakan: Bearer <token>', 401);
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!token) {
      return sendError(res, 'Token tidak ditemukan', 401);
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user data
    const user = await authService.getUserById(decoded.id);

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    // Handle token errors
    if (
      error.message === 'Token sudah kadaluarsa' ||
      error.message === 'Token tidak valid' ||
      error.message === 'User tidak ditemukan' ||
      error.message === 'Akun tidak aktif'
    ) {
      return sendError(res, error.message, 401);
    }

    // Pass unexpected errors to error handler
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Tidak wajib login, tapi jika ada token akan di-attach ke req.user
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    const decoded = authService.verifyToken(token);
    const user = await authService.getUserById(decoded.id);

    req.user = user;
    next();
  } catch (error) {
    // Jika token invalid, lanjutkan tanpa user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
