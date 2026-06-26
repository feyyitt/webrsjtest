/**
 * Enumerations & Constants
 * Define semua enum values untuk aplikasi
 */

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  PETUGAS: 'PETUGAS',
};

// Asset Status (Aset)
export const STATUS_ASET = {
  AKTIF: 'AKTIF',
  TIDAK_AKTIF: 'TIDAK_AKTIF',
  RUSAK: 'RUSAK',
  HILANG: 'HILANG',
};

export const STATUS_ASET_LABELS = {
  AKTIF: 'Aktif',
  TIDAK_AKTIF: 'Tidak Aktif',
  RUSAK: 'Rusak',
  HILANG: 'Hilang',
};

export const STATUS_ASET_COLORS = {
  AKTIF: '#22c55e', // green
  TIDAK_AKTIF: '#6b7280', // gray
  RUSAK: '#ef4444', // red
  HILANG: '#f97316', // orange
};

// Asset Condition (Kondisi Aset)
export const KONDISI_ASET = {
  BAIK: 'BAIK',
  SEDANG: 'SEDANG',
  RUSAK: 'RUSAK',
};

export const KONDISI_ASET_LABELS = {
  BAIK: 'Baik',
  SEDANG: 'Sedang',
  RUSAK: 'Rusak',
};

export const KONDISI_ASET_COLORS = {
  BAIK: '#22c55e', // green
  SEDANG: '#eab308', // yellow
  RUSAK: '#ef4444', // red
};

// Jenis Barang (Item Type)
export const JENIS_BARANG = {
  HABIS_PAKAI: 'HABIS_PAKAI',
  ASET: 'ASET',
};

export const JENIS_BARANG_LABELS = {
  HABIS_PAKAI: 'Habis Pakai',
  ASET: 'Aset Tetap',
};

// Mutation Types
export const TIPE_MUTASI = {
  MASUK: 'MASUK',
  KELUAR: 'KELUAR',
  TRANSFER: 'TRANSFER',
  ADJUSTMENT: 'ADJUSTMENT',
};

export const TIPE_MUTASI_LABELS = {
  MASUK: 'Masuk',
  KELUAR: 'Keluar',
  TRANSFER: 'Transfer',
  ADJUSTMENT: 'Penyesuaian',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
};

// API Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

// Messages
export const MESSAGES = {
  SUCCESS: 'Berhasil!',
  ERROR: 'Terjadi kesalahan!',
  LOADING: 'Memuat...',
  CONFIRM_DELETE: 'Apakah Anda yakin ingin menghapus?',
  UNAUTHORIZED: 'Silakan login terlebih dahulu',
  FORBIDDEN: 'Anda tidak memiliki akses ke resource ini',
};
