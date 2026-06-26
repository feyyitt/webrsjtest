/**
 * Laporan Routes
 * Endpoint untuk laporan inventaris (khusus ADMIN)
 */

const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporan.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const { validateLaporanQuery } = require('../validators/laporan.validator');

// Semua endpoint laporan hanya bisa diakses ADMIN
router.use(authenticate);
router.use(isAdmin);

// GET /api/laporan/stok
router.get('/stok', laporanController.laporanStok);

// GET /api/laporan/rekap-kategori?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/rekap-kategori', validateLaporanQuery, laporanController.rekapKategori);

// GET /api/laporan/masuk?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/masuk', validateLaporanQuery, laporanController.laporanMasuk);

// GET /api/laporan/keluar?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/keluar', validateLaporanQuery, laporanController.laporanKeluar);

module.exports = router;
