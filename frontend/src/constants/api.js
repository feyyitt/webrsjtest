/**
 * API Configuration Constants
 * Centralize all API endpoints untuk mudah maintenance
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Health Check
  HEALTH: '/health',
  
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    UPDATE_PROFILE: '/auth/profile',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
  },
  
  // Barang (Consumable Items)
  BARANG: {
    LIST: '/barang',
    CREATE: '/barang',
    GET: (kodeBarang) => `/barang/${kodeBarang}`,
    UPDATE: (kodeBarang) => `/barang/${kodeBarang}`,
    DELETE: (kodeBarang) => `/barang/${kodeBarang}`,
  },
  
  // Aset (Fixed Assets)
  ASET: {
    MASUK: '/aset/masuk',
    KELUAR: '/aset/keluar',
    MASUK_BY_ID: (id) => `/aset/masuk/${id}`,
    KELUAR_BY_ID: (id) => `/aset/keluar/${id}`,
    UNIT: (kodeUnit) => `/aset/unit/${kodeUnit}`,
    UNIT_QR: (kodeUnit) => `/aset/unit/${kodeUnit}/qr`,
    UNIT_RIWAYAT: (kodeUnit) => `/aset/unit/${kodeUnit}/riwayat`,
    UNIT_KONDISI: (kodeUnit) => `/aset/unit/${kodeUnit}/kondisi`,
    UNIT_KELUAR: (kodeUnit) => `/aset/unit/${kodeUnit}/keluar`,
    UNITS_BY_BARANG: (kodeBarang) => `/aset/barang/${kodeBarang}/units`,
  },
  
  // Habis Pakai (Consumable Tracking)
  HABIS_PAKAI: {
    MASUK: '/habis-pakai/masuk',
    MASUK_BY_ID: (id) => `/habis-pakai/masuk/${id}`,
    BATCH_BY_BARANG: (barangId) => `/habis-pakai/batch/${barangId}`,
  },
  
  // Laporan (Reports)
  LAPORAN: {
    STOK: '/laporan/stok',
    REKAP_KATEGORI: '/laporan/rekap-kategori',
    MASUK: '/laporan/masuk',
    KELUAR: '/laporan/keluar',
  },
  
  // Scan
  SCAN: {
    UNIT: (kodeUnit) => `/scan/unit/${kodeUnit}`,
  },
};

export default API_BASE_URL;
