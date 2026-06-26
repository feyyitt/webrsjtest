/**
 * Backend Enumerations & Constants
 * Define semua enum values untuk backend
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

// Asset Condition (Kondisi Aset)
export const KONDISI_ASET = {
  BAIK: 'BAIK',
  SEDANG: 'SEDANG',
  RUSAK: 'RUSAK',
};

// Jenis Barang (Item Type)
export const JENIS_BARANG = {
  HABIS_PAKAI: 'HABIS_PAKAI',
  ASET: 'ASET',
};

// Mutation Types
export const TIPE_MUTASI = {
  MASUK: 'MASUK',
  KELUAR: 'KELUAR',
  TRANSFER: 'TRANSFER',
  ADJUSTMENT: 'ADJUSTMENT',
};

// Mutation Item Types
export const TIPE_BARANG_MUTASI = {
  ASET: 'ASET',
  HABIS_PAKAI: 'HABIS_PAKAI',
};
