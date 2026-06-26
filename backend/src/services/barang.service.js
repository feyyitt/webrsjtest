/**
 * Barang Service
 * Business logic untuk CRUD master barang
 */

const prisma = require('../config/database');
const crypto = require('crypto');

/**
 * Generate kode barang otomatis
 * Format: BRG-YYYY-XXXX
 * Contoh: BRG-2026-0001
 * @param {Object} tx - Optional Prisma transaction client
 */
const generateKodeBarang = async (tx = null) => {
  const currentYear = new Date().getFullYear();
  const prefix = `BRG-${currentYear}`;

  // Gunakan tx jika ada (dalam transaction), jika tidak gunakan prisma global
  const client = tx || prisma;

  // Cari kode barang terakhir di tahun ini
  const lastBarang = await client.barang.findFirst({
    where: {
      kode_barang: {
        startsWith: prefix,
      },
    },
    orderBy: {
      kode_barang: 'desc',
    },
  });

  let nextNumber = 1;

  if (lastBarang) {
    // Extract nomor dari kode terakhir
    const lastNumber = parseInt(lastBarang.kode_barang.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  // Format: BRG-YYYY-XXXX (4 digit dengan leading zeros)
  const kodeBarang = `${prefix}-${String(nextNumber).padStart(4, '0')}`;

  return kodeBarang;
};

/**
 * Create barang baru
 */
const createBarang = async (data) => {
  // Generate kode_barang jika tidak dikirim
  if (!data.kode_barang) {
    data.kode_barang = await generateKodeBarang();
  } else {
    // Validasi kode_barang unique jika dikirim manual
    const existingBarang = await prisma.barang.findUnique({
      where: { kode_barang: data.kode_barang },
    });

    if (existingBarang) {
      throw new Error('Kode barang sudah digunakan');
    }
  }

  // Create barang
  const barang = await prisma.barang.create({
    data: {
      id: crypto.randomUUID(), // Generate UUID for id
      kode_barang: data.kode_barang,
      nama_barang: data.nama_barang,
      kategori: data.kategori || null,
      merk: data.merk || null,
      keterangan: data.keterangan || null,
      jenis_barang: data.jenis_barang,
      satuan: data.satuan,
      is_active: true,
    },
  });

  return barang;
};

/**
 * Get all barang dengan pagination, search, dan filter
 */
const getAllBarang = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    jenis_barang,
    kategori,
    is_active,
  } = query;

  // Build where clause
  const where = {};

  // Filter by search (nama_barang)
  if (search) {
    where.nama_barang = {
      contains: search,
      mode: 'insensitive',
    };
  }

  // Filter by jenis_barang
  if (jenis_barang) {
    where.jenis_barang = jenis_barang;
  }

  // Filter by kategori
  if (kategori) {
    where.kategori = {
      contains: kategori,
      mode: 'insensitive',
    };
  }

  // Filter by is_active (default to true if not specified)
  if (is_active !== undefined) {
    where.is_active = is_active;
  } else {
    where.is_active = true; // Default: hanya tampilkan barang aktif
  }

  // Count total records
  const total = await prisma.barang.count({ where });

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  // Get barang with pagination
  const barang = await prisma.barang.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      created_at: 'desc',
    },
  });

  return {
    data: barang,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get barang by kode_barang
 */
const getBarangByKode = async (kode_barang) => {
  const barang = await prisma.barang.findUnique({
    where: { kode_barang },
    include: {
      penerimaan_aset: {
        include: {
          unit_aset: true,
        },
      },
      batch_habis_pakai: true,
    },
  });

  if (!barang) {
    throw new Error('Barang tidak ditemukan');
  }

  return barang;
};

/**
 * Update barang by kode_barang
 */
const updateBarang = async (kode_barang, data) => {
  // Check if barang exists
  const existingBarang = await prisma.barang.findUnique({
    where: { kode_barang },
  });

  if (!existingBarang) {
    throw new Error('Barang tidak ditemukan');
  }

  // Update barang
  const barang = await prisma.barang.update({
    where: { kode_barang },
    data: {
      nama_barang: data.nama_barang,
      kategori: data.kategori,
      merk: data.merk,
      keterangan: data.keterangan,
      jenis_barang: data.jenis_barang,
      satuan: data.satuan,
      is_active: data.is_active,
    },
  });

  return barang;
};

/**
 * Soft delete barang (set is_active = false)
 */
const deleteBarang = async (kode_barang) => {
  // Check if barang exists
  const existingBarang = await prisma.barang.findUnique({
    where: { kode_barang },
  });

  if (!existingBarang) {
    throw new Error('Barang tidak ditemukan');
  }

  // Soft delete (set is_active = false)
  const barang = await prisma.barang.update({
    where: { kode_barang },
    data: {
      is_active: false,
    },
  });

  return barang;
};

module.exports = {
  generateKodeBarang,
  createBarang,
  getAllBarang,
  getBarangByKode,
  updateBarang,
  deleteBarang,
};
