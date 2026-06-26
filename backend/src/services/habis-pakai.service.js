/**
 * Habis Pakai Service
 * Business logic untuk transaksi habis pakai dengan FIFO
 */

const prisma = require('../config/database');
const crypto = require('crypto');
const { generateKodeBarang } = require('./barang.service');

/**
 * Get Habis Pakai Masuk (Transaction History)
 * GET /api/habis-pakai/masuk
 */
const getHabisPakaiMasuk = async (query = {}) => {
  const { page = 1, limit = 10, search = '' } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    tipe: 'MASUK',
    tipe_barang: 'HABIS_PAKAI',
  };

  if (search) {
    where.OR = [
      { keterangan: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [mutasi, total] = await Promise.all([
    prisma.mutasi.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { tanggal: 'desc' },
      include: {
        users: {
          select: {
            username: true,
            nama: true,
          },
        },
        mutasi_detail_habis_pakai: {
          include: {
            batch_habis_pakai: {
              include: {
                barang: true,
              },
            },
          },
        },
      },
    }),
    prisma.mutasi.count({ where }),
  ]);

  return {
    items: mutasi,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Habis Pakai Masuk
 * - Auto-create barang jika belum ada
 * - Buat batch_habis_pakai
 * - Catat mutasi MASUK
 */
const habisPakaiMasuk = async (data, user_id) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Cari atau buat barang
    let barang;
    
    if (data.kode_barang) {
      // Cari barang berdasarkan kode
      barang = await tx.barang.findUnique({
        where: { kode_barang: data.kode_barang },
      });

      if (!barang) {
        throw new Error(`Barang dengan kode ${data.kode_barang} tidak ditemukan`);
      }

      // Validasi jenis_barang harus HABIS_PAKAI
      if (barang.jenis_barang !== 'HABIS_PAKAI') {
        throw new Error('Barang harus berjenis HABIS_PAKAI');
      }
    } else {
      // Auto-create barang baru
      const kode_barang = await generateKodeBarang(tx);
      
      barang = await tx.barang.create({
        data: {
          id: crypto.randomUUID(),
          kode_barang,
          nama_barang: data.nama_barang,
          kategori: data.kategori || null,
          merk: data.merk || null,
          jenis_barang: 'HABIS_PAKAI',
          satuan: data.satuan || 'pcs',
          is_active: true,
        },
      });
    }

    // 2. Auto-generate kode_batch (format: BATCH-BARANG-TIMESTAMP)
    const generateKodeBatch = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `BATCH-${barang.kode_barang.slice(-4)}-${timestamp}-${random}`;
    };
    
    const kode_batch = generateKodeBatch();

    // 3. Buat batch_habis_pakai
    const batch = await tx.batch_habis_pakai.create({
      data: {
        id: crypto.randomUUID(),
        barang_id: barang.id,
        kode_batch,
        expired_date: null, // Tidak lagi require
        jumlah_masuk: data.jumlah_masuk,
        jumlah_keluar: 0,
        jumlah_sisa: data.jumlah_masuk,
        harga_satuan: data.harga_satuan || 0,
      },
    });

    // 4. Catat mutasi MASUK
    const mutasi = await tx.mutasi.create({
      data: {
        id: crypto.randomUUID(),
        tipe: 'MASUK',
        tipe_barang: 'HABIS_PAKAI',
        tanggal: new Date(),
        user_id,
        keterangan: `Penerimaan habis pakai ${barang.nama_barang} sebanyak ${data.jumlah_masuk} ${barang.satuan}`,
      },
    });

    // 5. Catat mutasi_detail_habis_pakai
    await tx.mutasi_detail_habis_pakai.create({
      data: {
        id: crypto.randomUUID(),
        mutasi_id: mutasi.id,
        batch_id: batch.id,
        jumlah: data.jumlah_masuk,
      },
    });

    return {
      barang,
      batch,
      mutasi,
    };
  });
};

/**
 * Get Batch Options by Barang ID
 * Untuk dropdown pemilihan batch saat keluar
 */
const getBatchByBarang = async (barang_id) => {
  const batches = await prisma.batch_habis_pakai.findMany({
    where: {
      barang_id: String(barang_id),
      jumlah_sisa: { gt: 0 },
    },
    orderBy: [
      { expired_date: { sort: 'asc', nulls: 'last' } },
      { created_at: 'asc' },
    ],
    select: {
      id: true,
      kode_batch: true,
      expired_date: true,
      jumlah_sisa: true,
      harga_satuan: true,
    },
  });
  return batches;
};

/**
 * Scan Barang Habis Pakai
 * - Detail barang
 * - Total stok sisa
 * - Daftar batch dengan expired date
 */
const scanBarang = async (kode_barang) => {
  const barang = await prisma.barang.findUnique({
    where: { kode_barang },
    include: {
      batch_habis_pakai: {
        orderBy: [
          {
            expired_date: {
              sort: 'asc',
              nulls: 'last',
            },
          },
          {
            created_at: 'asc',
          },
        ],
      },
    },
  });

  if (!barang) {
    throw new Error('Barang tidak ditemukan');
  }

  // Hitung total stok sisa
  const total_stok = barang.batch_habis_pakai.reduce(
    (sum, batch) => sum + batch.jumlah_sisa,
    0
  );

  return {
    barang: {
      id: barang.id,
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      kategori: barang.kategori,
      merk: barang.merk,
      jenis_barang: barang.jenis_barang,
      satuan: barang.satuan,
      is_active: barang.is_active,
      created_at: barang.created_at,
      updated_at: barang.updated_at,
    },
    total_stok,
    batches: barang.batch_habis_pakai.map((batch) => ({
      id: batch.id,
      kode_batch: batch.kode_batch,
      expired_date: batch.expired_date,
      jumlah_masuk: batch.jumlah_masuk,
      jumlah_keluar: batch.jumlah_keluar,
      jumlah_sisa: batch.jumlah_sisa,
      harga_satuan: batch.harga_satuan,
      created_at: batch.created_at,
    })),
  };
};

/**
 * Update Habis Pakai Masuk
 * Update data batch (kode_batch, expired_date, harga_satuan)
 */
const updateHabisPakaiMasuk = async (mutasi_id, data) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Cari mutasi dan validasi
    const mutasi = await tx.mutasi.findUnique({
      where: { id: mutasi_id },
      include: {
        mutasi_detail_habis_pakai: {
          include: {
            batch_habis_pakai: {
              include: {
                barang: true,
              },
            },
          },
        },
      },
    });

    if (!mutasi) {
      throw new Error('Mutasi tidak ditemukan');
    }

    if (mutasi.tipe !== 'MASUK' || mutasi.tipe_barang !== 'HABIS_PAKAI') {
      throw new Error('Mutasi bukan transaksi habis pakai masuk');
    }

    // 2. Ambil batch_id dari detail mutasi
    const batch_id = mutasi.mutasi_detail_habis_pakai[0]?.batch_id;
    
    if (!batch_id) {
      throw new Error('Data batch tidak ditemukan');
    }

    // 3. Update batch - hanya harga_satuan
    const updated = await tx.batch_habis_pakai.update({
      where: { id: batch_id },
      data: {
        harga_satuan: data.harga_satuan || 0,
      },
      include: {
        barang: true,
      },
    });

    // 4. Update keterangan mutasi jika ada
    if (data.keterangan) {
      await tx.mutasi.update({
        where: { id: mutasi_id },
        data: {
          keterangan: data.keterangan,
        },
      });
    }

    return {
      batch: updated,
      mutasi_id,
    };
  });
};

/**
 * Delete Habis Pakai Masuk
 * Hapus mutasi, mutasi_detail, dan batch
 */
const deleteHabisPakaiMasuk = async (mutasi_id) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Cari mutasi dan validasi
    const mutasi = await tx.mutasi.findUnique({
      where: { id: mutasi_id },
      include: {
        mutasi_detail_habis_pakai: {
          include: {
            batch_habis_pakai: true,
          },
        },
      },
    });

    if (!mutasi) {
      throw new Error('Mutasi tidak ditemukan');
    }

    if (mutasi.tipe !== 'MASUK' || mutasi.tipe_barang !== 'HABIS_PAKAI') {
      throw new Error('Mutasi bukan transaksi habis pakai masuk');
    }

    // 2. Cek apakah batch sudah terpakai (jumlah_keluar > 0)
    const batch_id = mutasi.mutasi_detail_habis_pakai[0]?.batch_id;
    const batch = await tx.batch_habis_pakai.findUnique({
      where: { id: batch_id },
    });

    if (batch && batch.jumlah_keluar > 0) {
      throw new Error('Tidak dapat menghapus transaksi karena batch sudah terpakai');
    }

    // 3. Hapus mutasi_detail_habis_pakai
    await tx.mutasi_detail_habis_pakai.deleteMany({
      where: { mutasi_id },
    });

    // 4. Hapus batch
    if (batch_id) {
      await tx.batch_habis_pakai.delete({
        where: { id: batch_id },
      });
    }

    // 5. Hapus mutasi
    await tx.mutasi.delete({
      where: { id: mutasi_id },
    });

    return {
      message: 'Transaksi habis pakai masuk berhasil dihapus',
      mutasi_id,
    };
  });
};

module.exports = {
  getHabisPakaiMasuk,
  habisPakaiMasuk,
  getBatchByBarang,
  scanBarang,
  updateHabisPakaiMasuk,
  deleteHabisPakaiMasuk,
};

