/**
 * User Controller
 * Handle request/response untuk user management (admin only)
 */

const userService = require('../services/user.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get All Users
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;

    const result = await userService.getAllUsers({
      page,
      limit,
      search,
      role,
    });

    return sendSuccess(
      res,
      result,
      'Data users berhasil diambil',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get User by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    return sendSuccess(
      res,
      user,
      'Data user berhasil diambil',
      200
    );
  } catch (error) {
    if (error.message === 'User tidak ditemukan') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * Create User
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { username, password, nama, role } = req.body;

    // Validation
    if (!username || !password || !nama || !role) {
      return sendError(res, 'Username, password, nama, dan role harus diisi', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password minimal 6 karakter', 400);
    }

    if (!['ADMIN', 'PETUGAS'].includes(role)) {
      return sendError(res, 'Role harus ADMIN atau PETUGAS', 400);
    }

    const user = await userService.createUser({
      username,
      password,
      nama,
      role,
    });

    return sendSuccess(
      res,
      user,
      'User berhasil dibuat',
      201
    );
  } catch (error) {
    if (error.message === 'Username sudah digunakan') {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * Update User
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, nama, role, is_active } = req.body;

    if (role && !['ADMIN', 'PETUGAS'].includes(role)) {
      return sendError(res, 'Role harus ADMIN atau PETUGAS', 400);
    }

    const user = await userService.updateUser(id, {
      username,
      nama,
      role,
      is_active,
    });

    return sendSuccess(
      res,
      user,
      'User berhasil diperbarui',
      200
    );
  } catch (error) {
    if (error.message === 'User tidak ditemukan') {
      return sendError(res, error.message, 404);
    }
    if (error.message === 'Username sudah digunakan') {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * Delete User
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.id) {
      return sendError(res, 'Tidak dapat menghapus akun sendiri', 400);
    }

    const result = await userService.deleteUser(id);

    return sendSuccess(
      res,
      result,
      'User berhasil dihapus',
      200
    );
  } catch (error) {
    if (error.message === 'User tidak ditemukan') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * Reset Password
 * POST /api/users/:id/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return sendError(res, 'Password baru harus diisi', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'Password minimal 6 karakter', 400);
    }

    const result = await userService.resetPassword(id, newPassword);

    return sendSuccess(
      res,
      result,
      'Password berhasil direset',
      200
    );
  } catch (error) {
    if (error.message === 'User tidak ditemukan') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
};
