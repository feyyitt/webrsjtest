/**
 * Barang Validators
 * Validasi request untuk CRUD barang menggunakan Zod
 */

const { z } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Enum untuk jenis barang
 */
const JenisBarangEnum = z.enum(['ASET', 'HABIS_PAKAI'], {
  errorMap: () => ({ message: 'Jenis barang harus ASET atau HABIS_PAKAI' }),
});

/**
 * Schema validasi untuk create barang
 */
const createBarangSchema = z.object({
  kode_barang: z.string().optional(), // Optional, akan auto-generate jika tidak dikirim
  nama_barang: z
    .string({
      required_error: 'Nama barang wajib diisi',
    })
    .min(3, 'Nama barang minimal 3 karakter')
    .max(200, 'Nama barang maksimal 200 karakter'),
  kategori: z
    .string()
    .max(100, 'Kategori maksimal 100 karakter')
    .optional()
    .nullable(),
  merk: z
    .string()
    .max(100, 'Merk maksimal 100 karakter')
    .optional()
    .nullable(),
  keterangan: z
    .string()
    .max(500, 'Keterangan maksimal 500 karakter')
    .optional()
    .nullable(),
  jenis_barang: JenisBarangEnum,
  satuan: z
    .string({
      required_error: 'Satuan wajib diisi',
    })
    .min(1, 'Satuan minimal 1 karakter')
    .max(50, 'Satuan maksimal 50 karakter'),
});

/**
 * Schema validasi untuk update barang
 */
const updateBarangSchema = z.object({
  nama_barang: z
    .string()
    .min(3, 'Nama barang minimal 3 karakter')
    .max(200, 'Nama barang maksimal 200 karakter')
    .optional(),
  kategori: z
    .string()
    .max(100, 'Kategori maksimal 100 karakter')
    .optional()
    .nullable(),
  merk: z
    .string()
    .max(100, 'Merk maksimal 100 karakter')
    .optional()
    .nullable(),
  keterangan: z
    .string()
    .max(500, 'Keterangan maksimal 500 karakter')
    .optional()
    .nullable(),
  jenis_barang: JenisBarangEnum.optional(),
  satuan: z
    .string()
    .min(1, 'Satuan minimal 1 karakter')
    .max(50, 'Satuan maksimal 50 karakter')
    .optional(),
  is_active: z.boolean().optional(),
});

/**
 * Schema validasi untuk query params (pagination, search, filter)
 */
const queryBarangSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page harus lebih dari 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit harus antara 1-100'),
  search: z.string().optional(),
  jenis_barang: z
    .string()
    .optional()
    .refine((val) => !val || val === 'ASET' || val === 'HABIS_PAKAI', {
      message: 'jenis_barang harus ASET atau HABIS_PAKAI',
    })
    .transform((val) => {
      if (!val || val === '') return undefined;
      return val;
    }),
  kategori: z.string().optional(),
  is_active: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

/**
 * Middleware untuk validasi create barang
 */
const validateCreateBarang = (req, res, next) => {
  try {
    createBarangSchema.parse(req.body);
    next();
  } catch (error) {
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

/**
 * Middleware untuk validasi update barang
 */
const validateUpdateBarang = (req, res, next) => {
  try {
    updateBarangSchema.parse(req.body);
    next();
  } catch (error) {
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

/**
 * Middleware untuk validasi query params
 */
const validateQueryBarang = (req, res, next) => {
  try {
    const validated = queryBarangSchema.parse(req.query);
    req.query = validated; // Replace with validated data
    next();
  } catch (error) {
    if (error.errors) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendError(res, 'Validasi query gagal', 400, errors);
    }
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  validateCreateBarang,
  validateUpdateBarang,
  validateQueryBarang,
};
