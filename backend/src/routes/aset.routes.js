/**
 * Aset Routes
 * Routing untuk transaksi aset (masuk/keluar)
 */

const express = require('express');
const asetController = require('../controllers/aset.controller');
const { validateAsetMasuk, validateAsetKeluar } = require('../validators/aset.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdminOrPetugas } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * Public Routes - tidak memerlukan authentication
 * Digunakan untuk detail halaman yang dibuka dari scan QR
 */

/**
 * GET /api/aset/unit/:kode_unit
 * Get detail unit aset (publik, untuk halaman scan QR)
 */
router.get('/unit/:kode_unit', asetController.getPublicUnitDetail);

/**
 * GET /api/aset/unit/:kode_unit/riwayat
 * Get riwayat mutasi unit aset (publik)
 */
router.get('/unit/:kode_unit/riwayat', asetController.getUnitRiwayat);

/**
 * Semua endpoint di bawah memerlukan authentication
 * dan role ADMIN atau PETUGAS
 */
router.use(authenticate);
router.use(isAdminOrPetugas);

/**
 * GET /api/aset/barang/:kode_barang/units
 * Get semua unit aset untuk satu kode barang
 */
router.get('/barang/:kode_barang/units', asetController.getUnitsByBarang);

/**
 * GET /api/aset/unit/:kode_unit/qr
 * Generate QR code untuk unit aset (auth required)
 */
router.get('/unit/:kode_unit/qr', asetController.generateQR);

/**
 * PUT /api/aset/unit/:kode_unit/kondisi
 * Update kondisi unit aset
 */
router.put('/unit/:kode_unit/kondisi', asetController.updateUnitKondisi);

/**
 * POST /api/aset/unit/:kode_unit/keluar
 * Catat keluar untuk unit aset tertentu (dari scan QR)
 */
router.post('/unit/:kode_unit/keluar', asetController.asetKeluarByUnit);

/**
 * GET /api/aset/masuk
 * Get aset masuk transaction history
 */
router.get('/masuk', asetController.getAsetMasuk);

/**
 * POST /api/aset/masuk
 * Transaksi aset masuk
 */
router.post('/masuk', validateAsetMasuk, asetController.asetMasuk);

/**
 * PUT /api/aset/masuk/:id
 * Update transaksi aset masuk
 */
router.put('/masuk/:id', asetController.updateAsetMasuk);

/**
 * DELETE /api/aset/masuk/:id
 * Hapus transaksi aset masuk
 */
router.delete('/masuk/:id', asetController.deleteAsetMasuk);

/**
 * GET /api/aset/keluar
 * Get aset keluar transaction history
 */
router.get('/keluar', asetController.getAsetKeluar);

/**
 * POST /api/aset/keluar
 * Transaksi aset keluar
 */
router.post('/keluar', validateAsetKeluar, asetController.asetKeluar);

/**
 * PUT /api/aset/keluar/:id
 * Update transaksi aset keluar
 */
router.put('/keluar/:id', asetController.updateAsetKeluar);

/**
 * DELETE /api/aset/keluar/:id
 * Hapus transaksi aset keluar
 */
router.delete('/keluar/:id', asetController.deleteAsetKeluar);

module.exports = router;
