/**
 * Application Routes Constants
 * Centralize semua route paths untuk mudah refactoring
 */

export const ROUTE_PATHS = {
  // Public Routes
  LOGIN: '/login',
  ASET_DETAIL: '/aset/:kode_unit',
  ASET_DETAIL_BY_UNIT: (kodeUnit) => `/aset/${kodeUnit}`,
  
  // Protected Routes - Dashboard & Main
  DASHBOARD: '/dashboard',
  
  // Aset Management
  ASET: {
    MASUK: '/aset/masuk',
    KELUAR: '/aset/keluar',
    SCAN: '/aset/scan',
  },
  
  // Barang Management
  BARANG: {
    LIST: '/barang',
  },
  
  // Habis Pakai Management
  HABIS_PAKAI: {
    MASUK: '/habis-pakai/masuk',
  },
  
  // Reports
  LAPORAN: {
    LIST: '/laporan',
  },
  
  // User Management (Admin only)
  USER_MANAGEMENT: '/users',
  
  // Profile
  PROFILE: '/profile',
};

export default ROUTE_PATHS;
