/**
 * Laporan Validator
 * Validasi untuk query params laporan dengan filter tanggal
 */

const { z } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Schema untuk query params dengan filter tanggal
 */
const laporanQuerySchema = z.object({
  from: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // Validasi format YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(val)) return false;
        // Cek apakah tanggal valid
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Format tanggal harus YYYY-MM-DD' }
    )
    .transform((val) => (val ? new Date(val) : undefined)),
  to: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(val)) return false;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Format tanggal harus YYYY-MM-DD' }
    )
    .transform((val) => (val ? new Date(val) : undefined)),
});

/**
 * Middleware validasi query params laporan
 */
const validateLaporanQuery = (req, res, next) => {
  try {
    const validated = laporanQuerySchema.parse(req.query);
    
    // Validasi: jika ada from dan to, from harus <= to
    if (validated.from && validated.to && validated.from > validated.to) {
      return sendError(res, 'Tanggal dari harus lebih kecil atau sama dengan tanggal sampai', 400);
    }
    
    req.query = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation failed', 400, error.errors);
    }
    next(error);
  }
};

module.exports = {
  validateLaporanQuery,
};
