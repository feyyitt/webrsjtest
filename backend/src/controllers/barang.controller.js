/**
 * Barang Controller
 * Handle request/response untuk CRUD master barang
 */

const barangService = require('../services/barang.service');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

/**
 * Create Barang
 * POST /api/barang
 */
const createBarang = async (req, res, next) => {
  try {
    const barang = await barangService.createBarang(req.body);

    return sendSuccess(
      res,
      barang,
      'Barang berhasil ditambahkan',
      201
    );
  } catch (error) {
    if (error.message === 'Kode barang sudah digunakan') {
      return sendError(res, error.message, 400);
    }

    next(error);
  }
};

/**
 * Get All Barang
 * GET /api/barang
 */
const getAllBarang = async (req, res, next) => {
  try {
    const result = await barangService.getAllBarang(req.query);

    return sendPaginated(
      res,
      result.data,
      result.pagination,
      'Data barang berhasil diambil'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Barang by Kode
 * GET /api/barang/:kode_barang
 */
const getBarangByKode = async (req, res, next) => {
  try {
    const { kode_barang } = req.params;
    const barang = await barangService.getBarangByKode(kode_barang);

    return sendSuccess(
      res,
      barang,
      'Data barang berhasil diambil',
      200
    );
  } catch (error) {
    if (error.message === 'Barang tidak ditemukan') {
      return sendError(res, error.message, 404);
    }

    next(error);
  }
};

/**
 * Update Barang
 * PUT /api/barang/:kode_barang
 */
const updateBarang = async (req, res, next) => {
  try {
    const { kode_barang } = req.params;
    const barang = await barangService.updateBarang(kode_barang, req.body);

    return sendSuccess(
      res,
      barang,
      'Barang berhasil diupdate',
      200
    );
  } catch (error) {
    if (error.message === 'Barang tidak ditemukan') {
      return sendError(res, error.message, 404);
    }

    next(error);
  }
};

/**
 * Delete Barang (Soft Delete)
 * DELETE /api/barang/:kode_barang
 */
const deleteBarang = async (req, res, next) => {
  try {
    const { kode_barang } = req.params;
    const barang = await barangService.deleteBarang(kode_barang);

    return sendSuccess(
      res,
      barang,
      'Barang berhasil dihapus (soft delete)',
      200
    );
  } catch (error) {
    if (error.message === 'Barang tidak ditemukan') {
      return sendError(res, error.message, 404);
    }

    next(error);
  }
};

module.exports = {
  createBarang,
  getAllBarang,
  getBarangByKode,
  updateBarang,
  deleteBarang,
};
