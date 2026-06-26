/**
 * Barang Routes
 * Routing untuk CRUD master barang
 */

const express = require('express');
const barangController = require('../controllers/barang.controller');
const {
  validateCreateBarang,
  validateUpdateBarang,
  validateQueryBarang,
} = require('../validators/barang.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdminOrPetugas } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * Semua endpoint barang memerlukan authentication
 * dan role ADMIN atau PETUGAS
 */
router.use(authenticate);
router.use(isAdminOrPetugas);

/**
 * POST /api/barang
 * Create barang baru
 */
router.post('/', validateCreateBarang, barangController.createBarang);

/**
 * GET /api/barang
 * Get all barang dengan pagination, search, filter
 * Query params: ?page=1&limit=10&search=kursi&jenis_barang=ASET&kategori=Furniture
 */
router.get('/', validateQueryBarang, barangController.getAllBarang);

/**
 * GET /api/barang/:kode_barang
 * Get barang by kode_barang
 */
router.get('/:kode_barang', barangController.getBarangByKode);

/**
 * PUT /api/barang/:kode_barang
 * Update barang by kode_barang
 */
router.put('/:kode_barang', validateUpdateBarang, barangController.updateBarang);

/**
 * DELETE /api/barang/:kode_barang
 * Soft delete barang (set is_active = false)
 */
router.delete('/:kode_barang', barangController.deleteBarang);

module.exports = router;
