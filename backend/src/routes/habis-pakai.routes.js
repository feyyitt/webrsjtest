/**
 * Habis Pakai Routes
 * Endpoint untuk transaksi habis pakai
 */

const express = require('express');
const router = express.Router();
const habisPakaiController = require('../controllers/habis-pakai.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdminOrPetugas } = require('../middlewares/role.middleware');
const {
  validateHabisPakaiMasuk,
} = require('../validators/habis-pakai.validator');

// Semua route butuh authentikasi dan role ADMIN/PETUGAS
router.use(authenticate);
router.use(isAdminOrPetugas);

// GET /api/habis-pakai/batch/:barangId
router.get('/batch/:barangId', habisPakaiController.getBatchByBarang);

// GET /api/habis-pakai/masuk
router.get('/masuk', habisPakaiController.getHabisPakaiMasuk);

// POST /api/habis-pakai/masuk
router.post('/masuk', validateHabisPakaiMasuk, habisPakaiController.habisPakaiMasuk);

// PUT /api/habis-pakai/masuk/:id
router.put('/masuk/:id', habisPakaiController.updateHabisPakaiMasuk);

// DELETE /api/habis-pakai/masuk/:id
router.delete('/masuk/:id', habisPakaiController.deleteHabisPakaiMasuk);

module.exports = router;
