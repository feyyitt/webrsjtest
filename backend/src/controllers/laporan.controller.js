/**
 * Laporan Controller
 * Handler untuk endpoint laporan inventaris
 */

const laporanService = require('../services/laporan.service');
const { sendSuccess } = require('../utils/response');

/**
 * Laporan Stok Keseluruhan
 * GET /api/laporan/stok
 */
const laporanStok = async (req, res, next) => {
  try {
    const result = await laporanService.getLaporanStok();
    sendSuccess(res, result, 'Laporan stok berhasil diambil');
  } catch (error) {
    next(error);
  }
};

/**
 * Rekap Per Kategori
 * GET /api/laporan/rekap-kategori?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
const rekapKategori = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const result = await laporanService.getRekapKategori(from, to);
    sendSuccess(res, result, 'Rekap per kategori berhasil diambil');
  } catch (error) {
    next(error);
  }
};

/**
 * Laporan Transaksi Masuk
 * GET /api/laporan/masuk?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
const laporanMasuk = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const result = await laporanService.getLaporanMasuk(from, to);
    sendSuccess(res, result, 'Laporan transaksi masuk berhasil diambil');
  } catch (error) {
    next(error);
  }
};

/**
 * Laporan Transaksi Keluar
 * GET /api/laporan/keluar?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
const laporanKeluar = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const result = await laporanService.getLaporanKeluar(from, to);
    sendSuccess(res, result, 'Laporan transaksi keluar berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  laporanStok,
  rekapKategori,
  laporanMasuk,
  laporanKeluar,
};
