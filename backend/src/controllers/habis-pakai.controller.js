/**
 * Habis Pakai Controller
 * Handler untuk transaksi habis pakai
 */

const habisPakaiService = require('../services/habis-pakai.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get Habis Pakai Masuk History
 * GET /api/habis-pakai/masuk
 */
const getHabisPakaiMasuk = async (req, res, next) => {
  try {
    const result = await habisPakaiService.getHabisPakaiMasuk(req.query);
    
    return sendSuccess(
      res,
      {
        items: result.items,
        pagination: result.pagination
      },
      'Data habis pakai masuk berhasil diambil',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Habis Pakai Masuk
 * POST /api/habis-pakai/masuk
 */
const habisPakaiMasuk = async (req, res, next) => {
  try {
    const result = await habisPakaiService.habisPakaiMasuk(
      req.body,
      req.user.id
    );

    sendSuccess(
      res,
      {
        barang: result.barang,
        batch: result.batch,
        mutasi: result.mutasi,
      },
      'Habis pakai berhasil diterima',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Scan Barang Habis Pakai
 * GET /api/scan/barang/:kode_barang
 */
const scanBarang = async (req, res, next) => {
  try {
    const { kode_barang } = req.params;
    const result = await habisPakaiService.scanBarang(kode_barang);

    sendSuccess(res, result, 'Scan barang berhasil');
  } catch (error) {
    if (error.message === 'Barang tidak ditemukan') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * Update Habis Pakai Masuk
 * PUT /api/habis-pakai/masuk/:id
 */
const updateHabisPakaiMasuk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await habisPakaiService.updateHabisPakaiMasuk(id, req.body);

    sendSuccess(
      res,
      result,
      'Data habis pakai masuk berhasil diperbarui'
    );
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || error.message.includes('bukan transaksi')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * Delete Habis Pakai Masuk
 * DELETE /api/habis-pakai/masuk/:id
 */
const deleteHabisPakaiMasuk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await habisPakaiService.deleteHabisPakaiMasuk(id);

    sendSuccess(
      res,
      result,
      'Transaksi habis pakai masuk berhasil dihapus'
    );
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || error.message.includes('tidak dapat menghapus')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * Get Batch Options by Barang ID
 * GET /api/habis-pakai/batch/:barangId
 */
const getBatchByBarang = async (req, res, next) => {
  try {
    const { barangId } = req.params;
    const result = await habisPakaiService.getBatchByBarang(barangId);
    sendSuccess(res, result, 'Data batch berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHabisPakaiMasuk,
  habisPakaiMasuk,
  getBatchByBarang,
  scanBarang,
  updateHabisPakaiMasuk,
  deleteHabisPakaiMasuk,
};
