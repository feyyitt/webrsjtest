/**
 * Habis Pakai Validators
 * Validasi request untuk transaksi habis pakai
 */

const { z } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Schema validasi untuk habis pakai masuk
 */
const habisPakaiMasukSchema = z.object({
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
  
  // Data transaksi (Batch dan Expired dihapus - akan auto-generate)
  jumlah_masuk: z
    .number({
      required_error: 'Jumlah masuk wajib diisi',
    })
    .int('Jumlah masuk harus berupa angka bulat')
    .min(1, 'Jumlah masuk minimal 1')
    .max(1000000, 'Jumlah masuk maksimal 1.000.000'),
  harga_satuan: z
    .number()
    .min(0, 'Harga satuan tidak boleh negatif')
    .optional()
    .default(0),
});

/**
 * Middleware untuk validasi habis pakai masuk
 */
const validateHabisPakaiMasuk = (req, res, next) => {
  try {
    habisPakaiMasukSchema.parse(req.body);
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
  validateHabisPakaiMasuk,
};
