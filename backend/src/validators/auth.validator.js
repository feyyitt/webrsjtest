/**
 * Auth Validators
 * Validasi request menggunakan Zod
 */

const { z } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Schema validasi untuk login
 */
const loginSchema = z.object({
  username: z
    .string({
      required_error: 'Username wajib diisi',
    })
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter'),
  password: z
    .string({
      required_error: 'Password wajib diisi',
    })
    .min(6, 'Password minimal 6 karakter'),
});

/**
 * Middleware untuk validasi login request
 */
const validateLogin = (req, res, next) => {
  try {
    // Validasi request body
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    // Format Zod errors
    if (error.errors) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendError(res, 'Validasi gagal', 400, errors);
    }
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  validateLogin,
};
