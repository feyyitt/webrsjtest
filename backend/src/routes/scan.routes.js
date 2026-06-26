/**
 * Scan Routes
 * Routing untuk scan unit aset
 */

const express = require('express');
const asetController = require('../controllers/aset.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdminOrPetugas } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * Semua endpoint scan memerlukan authentication
 * dan role ADMIN atau PETUGAS
 */
router.use(authenticate);
router.use(isAdminOrPetugas);

/**
 * GET /api/scan/unit/:kode_unit
 * Scan unit aset untuk mendapatkan detail
 */
router.get('/unit/:kode_unit', asetController.scanUnit);

module.exports = router;
