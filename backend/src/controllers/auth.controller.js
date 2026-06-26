/**
 * Auth Controller
 * Handle request/response untuk authentication
 */

const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Login Controller
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Call auth service
    const result = await authService.login(username, password);

    return sendSuccess(
      res,
      result,
      'Login berhasil',
      200
    );
  } catch (error) {
    // Handle known errors
    if (
      error.message === 'Username atau password salah' ||
      error.message === 'Akun tidak aktif'
    ) {
      return sendError(res, error.message, 401);
    }

    // Pass unexpected errors to error handler
    next(error);
  }
};

/**
 * Get Current User Controller
 * GET /api/auth/me
 */
const me = async (req, res, next) => {
  try {
    // req.user sudah di-attach oleh auth middleware
    const user = await authService.getUserById(req.user.id);

    return sendSuccess(
      res,
      user,
      'Data user berhasil diambil',
      200
    );
  } catch (error) {
    // Handle known errors
    if (
      error.message === 'User tidak ditemukan' ||
      error.message === 'Akun tidak aktif'
    ) {
      return sendError(res, error.message, 404);
    }

    // Pass unexpected errors to error handler
    next(error);
  }
};

/**
 * Change Password Controller
 * POST /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return sendError(res, 'Password lama dan baru harus diisi', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'Password baru minimal 6 karakter', 400);
    }

    const result = await authService.changePassword(
      req.user.id,
      oldPassword,
      newPassword
    );

    return sendSuccess(
      res,
      result,
      'Password berhasil diubah',
      200
    );
  } catch (error) {
    if (error.message === 'Password lama tidak sesuai') {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * Update Profile Controller
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { nama } = req.body;

    if (!nama || nama.trim().length === 0) {
      return sendError(res, 'Nama harus diisi', 400);
    }

    const user = await authService.updateProfile(req.user.id, nama);

    return sendSuccess(
      res,
      user,
      'Profile berhasil diperbarui',
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  me,
  changePassword,
  updateProfile,
};
