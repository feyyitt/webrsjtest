/**
 * Aset Service
 * Business logic untuk transaksi aset (masuk/keluar)
 */

const prisma = require('../config/database');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { generateKodeBarang } = require('./barang.service');

/**
 * Get Aset Masuk (Transaction History)
 * GET /api/aset/masuk
 */
const getAsetMasuk = async (query = {}) => {
  const { page = 1, limit = 10, search = '' } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    tipe: 'MASUK',
    tipe_barang: 'ASET',
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
        mutasi_detail_aset: {
          include: {
            unit_aset: {
              include: {
                penerimaan_aset: {
                  include: {
                    barang: true,
                  },
                },
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
 * Get Aset Keluar (Transaction History)
 * GET /api/aset/keluar
 */
const getAsetKeluar = async (query = {}) => {
  const { page = 1, limit = 10, search = '' } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    tipe: 'KELUAR',
    tipe_barang: 'ASET',
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
        mutasi_detail_aset: {
          include: {
            unit_aset: {
              include: {
                penerimaan_aset: {
                  include: {
                    barang: true,
                  },
                },
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
 * Generate kode unit untuk aset
 * Format: <kode_barang>-001, <kode_barang>-002, dst
 * @param {string} kode_barang - Kode barang
 * @param {Object} tx - Optional Prisma transaction client
 */
const generateKodeUnit = async (kode_barang, tx = null) => {
  // Gunakan tx jika ada (dalam transaction), jika tidak gunakan prisma global
  const client = tx || prisma;

  // Cari unit terakhir untuk barang ini agar nomor unit tidak berulang
  // walaupun aset yang sama diterima lewat beberapa transaksi.
  const lastUnit = await client.unit_aset.findFirst({
    where: {
      kode_unit: {
        startsWith: `${kode_barang}-`,
      },
    },
    orderBy: {
      kode_unit: 'desc',
    },
  });

  let nextNumber = 1;

  if (lastUnit) {
    // Extract nomor dari kode terakhir
    const parts = lastUnit.kode_unit.split('-');
    const lastNumber = parseInt(parts[parts.length - 1]);
    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Format: <kode_barang>-NNN (3 digit dengan leading zeros)
  const kode_unit = `${kode_barang}-${String(nextNumber).padStart(3, '0')}`;

  return kode_unit;
};

/**
 * Aset Masuk
 * - Auto-create barang jika belum ada
 * - Buat penerimaan_aset
 * - Generate unit_aset sebanyak jumlah_unit
 * - Catat mutasi MASUK
 */
const asetMasuk = async (data, user_id) => {
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

      // Validasi jenis_barang harus ASET
      if (barang.jenis_barang !== 'ASET') {
        throw new Error('Barang harus berjenis ASET');
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
          jenis_barang: 'ASET',
          satuan: data.satuan || 'unit',
          is_active: true,
        },
      });
    }

    // 2. Buat penerimaan_aset
    const penerimaan_aset = await tx.penerimaan_aset.create({
      data: {
        id: crypto.randomUUID(),
        barang_id: barang.id,
        tahun_masuk: data.tahun_masuk,
        jumlah_unit: data.jumlah_unit,
        harga_satuan: data.harga_satuan || 0,
        keterangan: data.keterangan || null,
      },
    });

    // 3. Generate unit_aset sebanyak jumlah_unit
    const unit_aset_list = [];

    for (let i = 0; i < data.jumlah_unit; i++) {
      const kode_unit = await generateKodeUnit(barang.kode_barang, tx);

      const unit_aset = await tx.unit_aset.create({
        data: {
          id: crypto.randomUUID(),
          penerimaan_aset_id: penerimaan_aset.id,
          kode_unit,
          status: 'AKTIF',
          kondisi: 'BAIK',
          keterangan: null,
        },
      });

      unit_aset_list.push(unit_aset);
    }

    // 4. Catat mutasi MASUK
    const mutasi = await tx.mutasi.create({
      data: {
        id: crypto.randomUUID(),
        tipe: 'MASUK',
        tipe_barang: 'ASET',
        tanggal: new Date(),
        user_id,
        keterangan: `Penerimaan aset ${barang.nama_barang} sebanyak ${data.jumlah_unit} unit (tahun ${data.tahun_masuk})`,
      },
    });

    // 5. Catat mutasi_detail_aset untuk setiap unit
    for (const unit of unit_aset_list) {
      await tx.mutasi_detail_aset.create({
        data: {
          id: crypto.randomUUID(),
          mutasi_id: mutasi.id,
          unit_aset_id: unit.id,
        },
      });
    }

    return {
      barang,
      penerimaan_aset,
      unit_aset: unit_aset_list,
      mutasi,
      total_unit: unit_aset_list.length,
    };
  });
};

/**
 * Aset Keluar
 * - Ambil unit_aset dari barang berdasarkan jumlah yang diminta
 * - Update status unit menjadi DIHAPUS
 * - Catat mutasi KELUAR
 */
const asetKeluar = async (data, user_id) => {
  return await prisma.$transaction(async (tx) => {
    const { barang_id, jumlah_unit, tujuan, keterangan } = data;

    // 1. Cari barang - convert ID to string for Prisma
    const barang = await tx.barang.findUnique({
      where: { id: String(barang_id) },
    });

    if (!barang) {
      throw new Error(`Barang tidak ditemukan`);
    }

    // Validasi jenis_barang harus ASET
    if (barang.jenis_barang !== 'ASET') {
      throw new Error('Barang harus berjenis ASET');
    }

    // 2. Ambil unit yang masih AKTIF sejumlah yang diminta
    const availableUnits = await tx.unit_aset.findMany({
      where: {
        penerimaan_aset: {
          barang_id: barang.id,
        },
        status: 'AKTIF',
      },
      include: {
        penerimaan_aset: {
          include: {
            barang: true,
          },
        },
      },
      orderBy: {
        kode_unit: 'asc', // Ambil yang paling lama dulu (FIFO)
      },
      take: jumlah_unit,
    });

    if (availableUnits.length === 0) {
      throw new Error('Tidak ada unit tersedia');
    }

    if (availableUnits.length < jumlah_unit) {
      throw new Error(`Unit tidak mencukupi. Tersedia: ${availableUnits.length}, Diminta: ${jumlah_unit}`);
    }

    // 3. Update status unit_aset menjadi DIHAPUS
    const updated_units = [];

    for (const unit of availableUnits) {
      const updated = await tx.unit_aset.update({
        where: { id: unit.id },
        data: {
          status: 'DIHAPUS',
          kondisi: 'BAIK', // Default kondisi
          keterangan: keterangan,
        },
      });
      updated_units.push(updated);
    }

    // 4. Catat mutasi KELUAR
    const keterangan_lengkap = tujuan
      ? `Pengeluaran aset: ${barang.nama_barang} - Tujuan: ${tujuan} - ${keterangan}`
      : `Pengeluaran aset: ${barang.nama_barang} - ${keterangan}`;

    const mutasi = await tx.mutasi.create({
      data: {
        id: crypto.randomUUID(),
        tipe: 'KELUAR',
        tipe_barang: 'ASET',
        tanggal: new Date(),
        user_id,
        keterangan: keterangan_lengkap,
      },
    });

    // 5. Catat mutasi_detail_aset untuk setiap unit
    for (const unit of updated_units) {
      await tx.mutasi_detail_aset.create({
        data: {
          id: crypto.randomUUID(),
          mutasi_id: mutasi.id,
          unit_aset_id: unit.id,
        },
      });
    }

    return {
      unit_aset: updated_units,
      mutasi,
      total_unit: updated_units.length,
    };
  });
};

/**
 * Generate QR Code untuk unit aset
 * QR berisi URL publik agar bisa dibuka langsung dari kamera HP
 */
const generateQRCode = async (kode_unit) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${frontendUrl}/aset/${kode_unit}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrBuffer;
  } catch (error) {
    throw new Error('Gagal generate QR code');
  }
};

/**
 * Ambil semua unit aset berdasarkan kode barang.
 * Digunakan agar tombol QR menampilkan seluruh QR unit untuk satu jenis barang.
 */
const getUnitsByKodeBarang = async (kode_barang) => {
  const barang = await prisma.barang.findUnique({
    where: { kode_barang },
    include: {
      penerimaan_aset: {
        include: {
          unit_aset: {
            orderBy: {
              kode_unit: 'asc',
            },
          },
        },
      },
    },
  });

  if (!barang) {
    throw new Error('Barang tidak ditemukan');
  }

  if (barang.jenis_barang !== 'ASET') {
    throw new Error('Barang bukan aset');
  }

  const units = barang.penerimaan_aset.flatMap((penerimaan) =>
    penerimaan.unit_aset.map((unit) => ({
      id: unit.id,
      kode_unit: unit.kode_unit,
      status: unit.status,
      kondisi: unit.kondisi,
      keterangan: unit.keterangan,
      tahun_masuk: penerimaan.tahun_masuk,
      penerimaan_aset_id: penerimaan.id,
    }))
  );

  return {
    barang: {
      id: barang.id,
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      kategori: barang.kategori,
      merk: barang.merk,
      satuan: barang.satuan,
    },
    total_unit: units.length,
    units,
  };
};

/**
 * Get Unit Riwayat Mutasi
 */
const getUnitRiwayat = async (kode_unit) => {
  const unit = await prisma.unit_aset.findUnique({
    where: { kode_unit },
  });

  if (!unit) {
    throw new Error('Unit tidak ditemukan');
  }

  const riwayat = await prisma.mutasi_detail_aset.findMany({
    where: { unit_aset_id: unit.id },
    include: {
      mutasi: {
        include: {
          users: {
            select: { username: true, nama: true },
          },
        },
      },
    },
    orderBy: {
      mutasi: { tanggal: 'desc' },
    },
  });

  return riwayat.map((r) => ({
    id: r.id,
    tipe: r.mutasi.tipe,
    tanggal: r.mutasi.tanggal,
    keterangan: r.mutasi.keterangan,
    petugas: r.mutasi.users?.nama || r.mutasi.users?.username || '-',
  }));
};

/**
 * Update Kondisi Unit Aset
 */
const updateUnitKondisi = async (kode_unit, kondisi, keterangan) => {
  const unit = await prisma.unit_aset.findUnique({
    where: { kode_unit },
  });

  if (!unit) {
    throw new Error('Unit tidak ditemukan');
  }

  const updated = await prisma.unit_aset.update({
    where: { kode_unit },
    data: {
      kondisi,
      ...(keterangan !== undefined && { keterangan }),
    },
  });

  return updated;
};

/**
 * Catat Keluar untuk unit aset tertentu berdasarkan kode_unit
 */
const asetKeluarByUnit = async (kode_unit, data, user_id) => {
  return await prisma.$transaction(async (tx) => {
    const { tujuan, keterangan } = data;

    const unit = await tx.unit_aset.findUnique({
      where: { kode_unit },
      include: {
        penerimaan_aset: {
          include: { barang: true },
        },
      },
    });

    if (!unit) throw new Error('Unit tidak ditemukan');
    if (unit.status === 'DIHAPUS') throw new Error('Unit sudah tidak aktif');

    const barang = unit.penerimaan_aset.barang;

    await tx.unit_aset.update({
      where: { id: unit.id },
      data: {
        status: 'DIHAPUS',
        keterangan: keterangan || null,
      },
    });

    const keterangan_lengkap = tujuan
      ? `Pengeluaran aset: ${barang.nama_barang} (${kode_unit}) - Tujuan: ${tujuan}${keterangan ? ` - ${keterangan}` : ''}`
      : `Pengeluaran aset: ${barang.nama_barang} (${kode_unit})${keterangan ? ` - ${keterangan}` : ''}`;

    const mutasi = await tx.mutasi.create({
      data: {
        id: crypto.randomUUID(),
        tipe: 'KELUAR',
        tipe_barang: 'ASET',
        tanggal: new Date(),
        user_id,
        keterangan: keterangan_lengkap,
      },
    });

    await tx.mutasi_detail_aset.create({
      data: {
        id: crypto.randomUUID(),
        mutasi_id: mutasi.id,
        unit_aset_id: unit.id,
      },
    });

    return { unit_aset: unit, mutasi };
  });
};

/**
 * Scan unit aset - Get detail unit
 */
const scanUnit = async (kode_unit) => {
  const unit = await prisma.unit_aset.findUnique({
    where: { kode_unit },
    include: {
      penerimaan_aset: {
        include: {
          barang: true,
        },
      },
    },
  });

  if (!unit) {
    throw new Error('Unit tidak ditemukan');
  }

  // Hitung jumlah unit AKTIF untuk barang yang sama
  const jumlah_unit_aktif = await prisma.unit_aset.count({
    where: {
      penerimaan_aset: {
        barang_id: unit.penerimaan_aset.barang_id,
      },
      status: 'AKTIF',
    },
  });

  return {
    unit_aset: {
      id: unit.id,
      kode_unit: unit.kode_unit,
      status: unit.status,
      kondisi: unit.kondisi,
      keterangan: unit.keterangan,
      created_at: unit.created_at,
      updated_at: unit.updated_at,
    },
    barang: unit.penerimaan_aset.barang,
    penerimaan: {
      id: unit.penerimaan_aset.id,
      tahun_masuk: unit.penerimaan_aset.tahun_masuk,
      jumlah_unit: unit.penerimaan_aset.jumlah_unit,
      harga_satuan: unit.penerimaan_aset.harga_satuan,
      keterangan: unit.penerimaan_aset.keterangan,
    },
    jumlah_unit_aktif,
  };
};

/**
 * Update Aset Masuk
 * Update data penerimaan_aset (tahun, jumlah, harga, keterangan)
 */
const updateAsetMasuk = async (mutasi_id, data) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Cari mutasi dan validasi
    const mutasi = await tx.mutasi.findUnique({
      where: { id: mutasi_id },
      include: {
        mutasi_detail_aset: {
          include: {
            unit_aset: {
              include: {
                penerimaan_aset: true,
              },
            },
          },
        },
      },
    });

    if (!mutasi) {
      throw new Error('Mutasi tidak ditemukan');
    }

    if (mutasi.tipe !== 'MASUK' || mutasi.tipe_barang !== 'ASET') {
      throw new Error('Mutasi bukan transaksi aset masuk');
    }

    // 2. Ambil penerimaan_aset_id dari detail mutasi
    const penerimaan_aset_id = mutasi.mutasi_detail_aset[0]?.unit_aset?.penerimaan_aset_id;

    if (!penerimaan_aset_id) {
      throw new Error('Data penerimaan tidak ditemukan');
    }

    // 3. Update penerimaan_aset
    const updated = await tx.penerimaan_aset.update({
      where: { id: penerimaan_aset_id },
      data: {
        tahun_masuk: data.tahun_masuk,
        harga_satuan: data.harga_satuan,
        keterangan: data.keterangan,
      },
      include: {
        barang: true,
      },
    });

    // 4. Update keterangan mutasi
    await tx.mutasi.update({
      where: { id: mutasi_id },
      data: {
        keterangan: data.keterangan_mutasi || `Penerimaan aset ${updated.barang.nama_barang} (tahun ${data.tahun_masuk})`,
      },
    });

    return {
      penerimaan_aset: updated,
      mutasi_id,
    };
  });
};

/**
 * Delete Aset Masuk
 * Hapus mutasi, mutasi_detail, unit_aset, dan penerimaan_aset
 */
const deleteAsetMasuk = async (mutasi_id) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Cari mutasi dan validasi
    const mutasi = await tx.mutasi.findUnique({
      where: { id: mutasi_id },
      include: {
        mutasi_detail_aset: {
          include: {
            unit_aset: true,
          },
        },
      },
    });

    if (!mutasi) {
      throw new Error('Mutasi tidak ditemukan');
    }

    if (mutasi.tipe !== 'MASUK' || mutasi.tipe_barang !== 'ASET') {
      throw new Error('Mutasi bukan transaksi aset masuk');
    }

    // 2. Cek apakah ada unit yang sudah DIHAPUS (keluar)
    const unitIds = mutasi.mutasi_detail_aset.map(d => d.unit_aset_id);
    const units = await tx.unit_aset.findMany({
      where: { id: { in: unitIds } },
    });

    const hasDeletedUnit = units.some(u => u.status === 'DIHAPUS');
    if (hasDeletedUnit) {
      throw new Error('Tidak dapat menghapus transaksi karena ada unit yang sudah dikeluarkan');
    }

    // 3. Ambil penerimaan_aset_id
    const penerimaan_aset_id = mutasi.mutasi_detail_aset[0]?.unit_aset?.penerimaan_aset_id;

    // 4. Hapus mutasi_detail_aset (akan otomatis trigger cascade delete ke unit_aset dan penerimaan_aset)
    await tx.mutasi_detail_aset.deleteMany({
      where: { mutasi_id },
    });

    // 5. Hapus unit_aset
    await tx.unit_aset.deleteMany({
      where: { penerimaan_aset_id },
    });

    // 6. Hapus penerimaan_aset
    if (penerimaan_aset_id) {
      await tx.penerimaan_aset.delete({
        where: { id: penerimaan_aset_id },
      });
    }

    // 7. Hapus mutasi
    await tx.mutasi.delete({
      where: { id: mutasi_id },
    });

    return {
      message: 'Transaksi aset masuk berhasil dihapus',
      mutasi_id,
    };
  });
};

/**
 * Update Aset Keluar
 * Update kondisi dan keterangan unit_aset yang keluar
 */
const updateAsetKeluar = async (mutasi_id, data) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Cari mutasi dan validasi
    const mutasi = await tx.mutasi.findUnique({
      where: { id: mutasi_id },
      include: {
        mutasi_detail_aset: {
          include: {
            unit_aset: true,
          },
        },
      },
    });

    if (!mutasi) {
      throw new Error('Mutasi tidak ditemukan');
    }

    if (mutasi.tipe !== 'KELUAR' || mutasi.tipe_barang !== 'ASET') {
      throw new Error('Mutasi bukan transaksi aset keluar');
    }

    // 2. Update kondisi dan keterangan unit_aset
    const unitIds = mutasi.mutasi_detail_aset.map(d => d.unit_aset_id);

    await tx.unit_aset.updateMany({
      where: { id: { in: unitIds } },
      data: {
        kondisi: data.kondisi,
        keterangan: data.keterangan,
      },
    });

    // 3. Update keterangan mutasi
    await tx.mutasi.update({
      where: { id: mutasi_id },
      data: {
        keterangan: data.keterangan_mutasi || data.keterangan,
      },
    });

    // 4. Get updated units
    const updated_units = await tx.unit_aset.findMany({
      where: { id: { in: unitIds } },
    });

    return {
      unit_aset: updated_units,
      mutasi_id,
    };
  });
};

/**
 * Delete Aset Keluar
 * Kembalikan status unit_aset menjadi AKTIF
 */
const deleteAsetKeluar = async (mutasi_id) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Cari mutasi dan validasi
    const mutasi = await tx.mutasi.findUnique({
      where: { id: mutasi_id },
      include: {
        mutasi_detail_aset: {
          include: {
            unit_aset: true,
          },
        },
      },
    });

    if (!mutasi) {
      throw new Error('Mutasi tidak ditemukan');
    }

    if (mutasi.tipe !== 'KELUAR' || mutasi.tipe_barang !== 'ASET') {
      throw new Error('Mutasi bukan transaksi aset keluar');
    }

    // 2. Kembalikan status unit_aset menjadi AKTIF
    const unitIds = mutasi.mutasi_detail_aset.map(d => d.unit_aset_id);

    await tx.unit_aset.updateMany({
      where: { id: { in: unitIds } },
      data: {
        status: 'AKTIF',
        keterangan: 'Dibatalkan dari pengeluaran',
      },
    });

    // 3. Hapus mutasi_detail_aset
    await tx.mutasi_detail_aset.deleteMany({
      where: { mutasi_id },
    });

    // 4. Hapus mutasi
    await tx.mutasi.delete({
      where: { id: mutasi_id },
    });

    return {
      message: 'Transaksi aset keluar berhasil dihapus, unit dikembalikan ke status AKTIF',
      mutasi_id,
    };
  });
};

module.exports = {
  getAsetMasuk,
  getAsetKeluar,
  asetMasuk,
  asetKeluar,
  generateQRCode,
  getUnitsByKodeBarang,
  scanUnit,
  getUnitRiwayat,
  updateUnitKondisi,
  asetKeluarByUnit,
  updateAsetMasuk,
  deleteAsetMasuk,
  updateAsetKeluar,
  deleteAsetKeluar,
};
