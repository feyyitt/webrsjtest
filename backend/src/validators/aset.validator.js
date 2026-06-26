/**
 * Aset Validators
 * Validasi request untuk transaksi aset (masuk/keluar)
 */

const { z } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Enum untuk kondisi unit aset
 */
const KondisiUnitEnum = z.enum(['BAIK', 'RUSAK', 'HILANG'], {
  errorMap: () => ({ message: 'Kondisi harus BAIK, RUSAK, atau HILANG' }),
});

/**
 * Schema validasi untuk aset masuk
 */
const asetMasukSchema = z.object({
  // Kode barang opsional, bisa auto-create
  kode_barang: z.string().optional(),
  
  // Data barang untuk auto-create jika belum ada
  nama_barang: z
    .string({
      required_error: 'Nama barang wajib diisi',
    })
    .min(3, 'Nama barang minimal 3 karakter')
    .max(200, 'Nama barang maksimal 200 karakter'),
  kategori: z.string().max(100).optional().nullable(),
  merk: z.string().max(100).optional().nullable(),
  satuan: z.string().max(50).optional().nullable(),
  
  // Data penerimaan
  tahun_masuk: z
    .number({
      required_error: 'Tahun masuk wajib diisi',
    })
    .int('Tahun masuk harus berupa angka bulat')
    .min(2000, 'Tahun masuk minimal 2000')
    .max(new Date().getFullYear() + 1, `Tahun masuk maksimal ${new Date().getFullYear() + 1}`),
  jumlah_unit: z
    .number({
      required_error: 'Jumlah unit wajib diisi',
    })
    .int('Jumlah unit harus berupa angka bulat')
    .min(1, 'Jumlah unit minimal 1')
    .max(1000, 'Jumlah unit maksimal 1000'),
  harga_satuan: z
    .number()
    .min(0, 'Harga satuan tidak boleh negatif')
    .optional()
    .default(0),
  keterangan: z.string().max(500).optional().nullable(),
});

/**
 * Schema validasi untuk aset keluar
 */
const asetKeluarSchema = z.object({
  barang_id: z
    .string({
      required_error: 'Barang wajib dipilih',
    })
    .uuid('Barang ID tidak valid'),
  jumlah_unit: z
    .number({
      required_error: 'Jumlah unit wajib diisi',
    })
    .int('Jumlah unit harus berupa angka bulat')
    .min(1, 'Jumlah unit minimal 1')
    .max(1000, 'Jumlah unit maksimal 1000'),
  tujuan: z
    .string()
    .max(200, 'Tujuan maksimal 200 karakter')
    .optional()
    .nullable(),
  keterangan: z
    .string()
    .max(500, 'Keterangan maksimal 500 karakter')
    .optional()
    .default('')
});

/**
 * Middleware untuk validasi aset masuk
 */
const validateAsetMasuk = (req, res, next) => {
  try {
    asetMasukSchema.parse(req.body);
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
 * Middleware untuk validasi aset keluar
 */
const validateAsetKeluar = (req, res, next) => {
  try {
    asetKeluarSchema.parse(req.body);
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

module.exports = {
  validateAsetMasuk,
  validateAsetKeluar,
};
