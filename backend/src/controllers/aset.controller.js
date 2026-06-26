/**
 * Aset Controller
 * Handle request/response untuk transaksi aset
 */

const asetService = require('../services/aset.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get Aset Masuk History
 * GET /api/aset/masuk
 */
const getAsetMasuk = async (req, res, next) => {
  try {
    const result = await asetService.getAsetMasuk(req.query);
    
    return sendSuccess(
      res,
      {
        items: result.items,
        pagination: result.pagination
      },
      'Data aset masuk berhasil diambil',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Aset Keluar History
 * GET /api/aset/keluar
 */
const getAsetKeluar = async (req, res, next) => {
  try {
    const result = await asetService.getAsetKeluar(req.query);
    
    return sendSuccess(
      res,
      {
        items: result.items,
        pagination: result.pagination
      },
      'Data aset keluar berhasil diambil',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Aset Masuk
 * POST /api/aset/masuk
 */
const asetMasuk = async (req, res, next) => {
  try {
    const result = await asetService.asetMasuk(req.body, req.user.id);

    return sendSuccess(
      res,
      result,
      'Aset berhasil diterima',
      201
    );
  } catch (error) {
    if (
      error.message.includes('tidak ditemukan') ||
      error.message.includes('harus berjenis ASET')
    ) {
      return sendError(res, error.message, 400);
    }

    next(error);
  }
};

/**
 * Aset Keluar
 * POST /api/aset/keluar
 */
const asetKeluar = async (req, res, next) => {
  try {
    const result = await asetService.asetKeluar(req.body, req.user.id);

    return sendSuccess(
      res,
      result,
      'Aset berhasil dikeluarkan',
      200
    );
  } catch (error) {
    if (
      error.message.includes('tidak ditemukan') ||
      error.message.includes('sudah dihapus')
    ) {
      return sendError(res, error.message, 400);
    }

    next(error);
  }
};

/**
 * Generate QR Code untuk Unit Aset
 * GET /api/aset/unit/:kode_unit/qr
 */
const generateQR = async (req, res, next) => {
  try {
    const { kode_unit } = req.params;
    
    const qrBuffer = await asetService.generateQRCode(kode_unit);

    // Set response headers untuk PNG
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${kode_unit}.png"`);
    
    return res.send(qrBuffer);
  } catch (error) {
    if (error.message === 'Gagal generate QR code') {
      return sendError(res, error.message, 500);
    }

    next(error);
  }
};

/**
 * Get semua unit aset berdasarkan kode barang
 * GET /api/aset/barang/:kode_barang/units
 */
const getUnitsByBarang = async (req, res, next) => {
  try {
    const { kode_barang } = req.params;
    const result = await asetService.getUnitsByKodeBarang(kode_barang);

    return sendSuccess(
      res,
      result,
      'Data unit aset berhasil diambil',
      200
    );
  } catch (error) {
    if (
      error.message.includes('tidak ditemukan') ||
      error.message.includes('bukan aset')
    ) {
      return sendError(res, error.message, 404);
    }

    next(error);
  }
};

/**
 * Scan Unit Aset
 * GET /api/scan/unit/:kode_unit
 */
const scanUnit = async (req, res, next) => {
  try {
    const { kode_unit } = req.params;
    
    const result = await asetService.scanUnit(kode_unit);

    return sendSuccess(
      res,
      result,
      'Data unit berhasil diambil',
      200
    );
  } catch (error) {
    if (error.message === 'Unit tidak ditemukan') {
      return sendError(res, error.message, 404);
    }

    next(error);
  }
};

/**
 * Update Aset Masuk
 * PUT /api/aset/masuk/:id
 */
const updateAsetMasuk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await asetService.updateAsetMasuk(id, req.body);

    return sendSuccess(
      res,
      result,
      'Data aset masuk berhasil diperbarui',
      200
    );
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || error.message.includes('bukan transaksi')) {
      return sendError(res, error.message, 400);
    }

    next(error);
  }
};

/**
 * Delete Aset Masuk
 * DELETE /api/aset/masuk/:id
 */
const deleteAsetMasuk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await asetService.deleteAsetMasuk(id);

    return sendSuccess(
      res,
      result,
      'Transaksi aset masuk berhasil dihapus',
      200
    );
  } catch (error) {
    if (
      error.message.includes('tidak ditemukan') ||
      error.message.includes('tidak dapat menghapus')
    ) {
      return sendError(res, error.message, 400);
    }

    next(error);
  }
};

/**
 * Update Aset Keluar
 * PUT /api/aset/keluar/:id
 */
const updateAsetKeluar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await asetService.updateAsetKeluar(id, req.body);

    return sendSuccess(
      res,
      result,
      'Data aset keluar berhasil diperbarui',
      200
    );
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || error.message.includes('bukan transaksi')) {
      return sendError(res, error.message, 400);
    }

    next(error);
  }
};

/**
 * Delete Aset Keluar
 * DELETE /api/aset/keluar/:id
 */
const deleteAsetKeluar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await asetService.deleteAsetKeluar(id);

    return sendSuccess(
      res,
      result,
      'Transaksi aset keluar berhasil dihapus',
      200
    );
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || error.message.includes('bukan transaksi')) {
      return sendError(res, error.message, 400);
    }

    next(error);
  }
};

/**
 * Get Public Unit Detail (no auth)
 * GET /api/aset/unit/:kode_unit
 */
const getPublicUnitDetail = async (req, res, next) => {
  try {
    const { kode_unit } = req.params;
    const result = await asetService.scanUnit(kode_unit);
    return sendSuccess(res, result, 'Data unit berhasil diambil', 200);
  } catch (error) {
    if (error.message === 'Unit tidak ditemukan') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * Get Unit Riwayat Mutasi (no auth)
 * GET /api/aset/unit/:kode_unit/riwayat
 */
const getUnitRiwayat = async (req, res, next) => {
  try {
    const { kode_unit } = req.params;
    const result = await asetService.getUnitRiwayat(kode_unit);
    return sendSuccess(res, result, 'Riwayat unit berhasil diambil', 200);
  } catch (error) {
    if (error.message === 'Unit tidak ditemukan') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * Update Kondisi Unit Aset (requires auth)
 * PUT /api/aset/unit/:kode_unit/kondisi
 */
const updateUnitKondisi = async (req, res, next) => {
  try {
    const { kode_unit } = req.params;
    const { kondisi, keterangan } = req.body;

    const VALID_KONDISI = ['BAIK', 'RUSAK', 'HILANG'];
    if (!kondisi || !VALID_KONDISI.includes(kondisi)) {
      return sendError(res, 'Kondisi tidak valid. Pilih: BAIK, RUSAK, atau HILANG', 400);
    }

    const result = await asetService.updateUnitKondisi(kode_unit, kondisi, keterangan);
    return sendSuccess(res, result, 'Kondisi unit berhasil diperbarui', 200);
  } catch (error) {
    if (error.message === 'Unit tidak ditemukan') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * Catat Keluar unit aset tertentu (requires auth)
 * POST /api/aset/unit/:kode_unit/keluar
 */
const asetKeluarByUnit = async (req, res, next) => {
  try {
    const { kode_unit } = req.params;
    const result = await asetService.asetKeluarByUnit(kode_unit, req.body, req.user.id);
    return sendSuccess(res, result, 'Aset berhasil dikeluarkan', 200);
  } catch (error) {
    if (
      error.message.includes('tidak ditemukan') ||
      error.message.includes('sudah tidak aktif')
    ) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

module.exports = {
  getAsetMasuk,
  getAsetKeluar,
  asetMasuk,
  asetKeluar,
  generateQR,
  getUnitsByBarang,
  scanUnit,
  getPublicUnitDetail,
  getUnitRiwayat,
  updateUnitKondisi,
  asetKeluarByUnit,
  updateAsetMasuk,
  deleteAsetMasuk,
  updateAsetKeluar,
  deleteAsetKeluar,
};
