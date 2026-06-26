import { z } from 'zod';

// Current year for validation
const currentYear = new Date().getFullYear();

// Barang validation schema
export const barangSchema = z.object({
  nama_barang: z.string().min(1, 'Nama barang wajib diisi'),
  jenis: z.enum(['ASET', 'HABIS_PAKAI'], { required_error: 'Jenis wajib dipilih' }),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  satuan: z.string().min(1, 'Satuan wajib diisi'),
  keterangan: z.string().optional(),
});

// Aset Masuk validation schema
export const asetMasukSchema = z.object({
  kode_barang: z.string().min(1, 'Kode barang wajib diisi'),
  nama_barang: z.string().min(1, 'Nama barang wajib diisi'),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  merk: z.string().optional(),
  satuan: z.string().min(1, 'Satuan wajib diisi'),
  tahun_masuk: z
    .number({ invalid_type_error: 'Tahun masuk harus berupa angka' })
    .min(1900, 'Tahun masuk tidak valid')
    .max(currentYear, `Tahun masuk tidak boleh lebih dari ${currentYear}`),
  jumlah_unit: z
    .number({ invalid_type_error: 'Jumlah unit harus berupa angka' })
    .min(1, 'Jumlah unit minimal 1'),
  harga_satuan: z
    .number({ invalid_type_error: 'Harga satuan harus berupa angka' })
    .min(0, 'Harga satuan tidak boleh negatif'),
  keterangan: z.string().optional(),
});

// Aset Keluar validation schema
export const asetKeluarSchema = z.object({
  kode_unit: z.string().min(1, 'Kode unit wajib diisi'),
  kondisi: z.enum(
    ['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'HILANG', 'DIHAPUS'],
    { required_error: 'Kondisi wajib dipilih' }
  ),
  keterangan: z.string().optional(),
});

// Habis Pakai Masuk validation schema
export const habisPakaiMasukSchema = z.object({
  kode_barang: z.string().min(1, 'Kode barang wajib diisi'),
  nama_barang: z.string().min(1, 'Nama barang wajib diisi'),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  satuan: z.string().min(1, 'Satuan wajib diisi'),
  jumlah_masuk: z
    .number({ invalid_type_error: 'Jumlah masuk harus berupa angka' })
    .min(1, 'Jumlah masuk minimal 1'),
  harga_satuan: z
    .number({ invalid_type_error: 'Harga satuan harus berupa angka' })
    .min(0, 'Harga satuan tidak boleh negatif'),
  expired_date: z
    .string()
    .min(1, 'Tanggal kadaluarsa wajib diisi')
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: 'Tanggal kadaluarsa tidak boleh kurang dari hari ini' }
    ),
  keterangan: z.string().optional(),
});

// Habis Pakai Keluar validation schema (dynamic validation for available stock)
export const habisPakaiKeluarSchema = z.object({
  kode_barang: z.string().min(1, 'Kode barang wajib diisi'),
  jumlah_keluar: z
    .number({ invalid_type_error: 'Jumlah keluar harus berupa angka' })
    .min(1, 'Jumlah keluar minimal 1'),
  tujuan: z.string().min(1, 'Tujuan wajib diisi'),
  keterangan: z.string().optional(),
});

// User Management validation schemas
export const createUserSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nama: z.string().min(1, 'Nama lengkap wajib diisi'),
  role: z.enum(['ADMIN', 'PETUGAS'], { required_error: 'Role wajib dipilih' }),
});

export const updateUserSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  nama: z.string().min(1, 'Nama lengkap wajib diisi'),
  role: z.enum(['ADMIN', 'PETUGAS'], { required_error: 'Role wajib dipilih' }),
  is_active: z.boolean(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password minimal 6 karakter'),
});

// Profile & Change Password validation schemas
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password baru dan konfirmasi tidak cocok',
  path: ['confirmPassword'],
});
