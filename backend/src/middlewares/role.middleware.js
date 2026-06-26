/**
 * Role Middleware
 * Middleware untuk cek user role/permission
 */

const { sendError } = require('../utils/response');

/**
 * Middleware untuk cek apakah user punya role tertentu
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Pastikan user sudah login (sudah melewati authenticate middleware)
    if (!req.user) {
      return sendError(res, 'Unauthorized. Silakan login terlebih dahulu', 401);
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Akses ditolak. Hanya ${allowedRoles.join(' atau ')} yang diizinkan`,
        403
      );
    }

    next();
  };
};

/**
 * Middleware untuk cek apakah user adalah ADMIN
 */
const isAdmin = checkRole('ADMIN');

/**
 * Middleware untuk cek apakah user adalah PETUGAS
 */
const isPetugas = checkRole('PETUGAS');

/**
 * Middleware untuk cek apakah user adalah ADMIN atau PETUGAS
 */
const isAdminOrPetugas = checkRole('ADMIN', 'PETUGAS');

module.exports = {
  checkRole,
  isAdmin,
  isPetugas,
  isAdminOrPetugas,
};
