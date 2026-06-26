/**
 * Laporan Service
 * Business logic untuk laporan inventaris
 */

const prisma = require('../config/database');

/**
 * Laporan Stok Keseluruhan
 * - Stok ASET: count unit_aset aktif melalui penerimaan_aset per barang
 * - Stok HABIS_PAKAI: sum jumlah_sisa dari batch per barang
 */
const getLaporanStok = async () => {
  // 1. Stok ASET (count unit aktif per barang)
  const stokAset = await prisma.barang.findMany({
    where: {
      jenis_barang: 'ASET',
      is_active: true,
    },
    select: {
      kode_barang: true,
      nama_barang: true,
      kategori: true,
      merk: true,
      satuan: true,
      penerimaan_aset: {
        select: {
          unit_aset: {
            where: {
              status: 'AKTIF',
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  const dataAset = stokAset.map((barang) => ({
    kode_barang: barang.kode_barang,
    nama_barang: barang.nama_barang,
    kategori: barang.kategori,
    merk: barang.merk,
    jenis_barang: 'ASET',
    satuan: barang.satuan,
    jumlah: barang.penerimaan_aset.reduce(
      (sum, penerimaan) => sum + penerimaan.unit_aset.length,
      0
    ),
  }));

  // 2. Stok HABIS_PAKAI (sum jumlah_sisa per barang)
  const stokHabisPakai = await prisma.barang.findMany({
    where: {
      jenis_barang: 'HABIS_PAKAI',
      is_active: true,
    },
    select: {
      kode_barang: true,
      nama_barang: true,
      kategori: true,
      merk: true,
      satuan: true,
      batch_habis_pakai: {
        select: {
          jumlah_sisa: true,
        },
      },
    },
  });

  const dataHabisPakai = stokHabisPakai.map((barang) => ({
    kode_barang: barang.kode_barang,
    nama_barang: barang.nama_barang,
    kategori: barang.kategori,
    merk: barang.merk,
    jenis_barang: 'HABIS_PAKAI',
    satuan: barang.satuan,
    jumlah: barang.batch_habis_pakai.reduce(
      (sum, batch) => sum + batch.jumlah_sisa,
      0
    ),
  }));

  // 3. Ringkasan
  const totalAset = dataAset.reduce((sum, item) => sum + item.jumlah, 0);
  const totalHabisPakai = dataHabisPakai.reduce((sum, item) => sum + item.jumlah, 0);

  return {
    aset: dataAset,
    habis_pakai: dataHabisPakai,
    ringkasan: {
      total_jenis_aset: dataAset.length,
      total_unit_aset: totalAset,
      total_jenis_habis_pakai: dataHabisPakai.length,
      total_stok_habis_pakai: totalHabisPakai,
    },
  };
};

/**
 * Rekap Per Kategori dengan Filter Tanggal
 * Rekap masuk & keluar per kategori untuk ASET dan HABIS_PAKAI
 */
const getRekapKategori = async (from, to) => {
  // Build where clause untuk filter tanggal
  const whereClause = {};
  if (from || to) {
    whereClause.tanggal = {};
    if (from) whereClause.tanggal.gte = from;
    if (to) {
      // Set to ke akhir hari (23:59:59)
      const endOfDay = new Date(to);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.tanggal.lte = endOfDay;
    }
  }

  // 1. Mutasi ASET
  const mutasiAset = await prisma.mutasi.findMany({
    where: {
      ...whereClause,
      tipe_barang: 'ASET',
    },
    include: {
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
  });

  // 2. Mutasi HABIS_PAKAI
  const mutasiHabisPakai = await prisma.mutasi.findMany({
    where: {
      ...whereClause,
      tipe_barang: 'HABIS_PAKAI',
    },
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

  // 3. Grouping per kategori
  const rekapKategori = {};

  // Process ASET
  mutasiAset.forEach((mutasi) => {
    mutasi.mutasi_detail_aset.forEach((detail) => {
      const barang = detail.unit_aset.penerimaan_aset.barang;
      const kategori = barang.kategori || 'Tanpa Kategori';

      if (!rekapKategori[kategori]) {
        rekapKategori[kategori] = {
          kategori,
          aset_masuk: 0,
          aset_keluar: 0,
          habis_pakai_masuk: 0,
          habis_pakai_keluar: 0,
        };
      }

      if (mutasi.tipe === 'MASUK') {
        rekapKategori[kategori].aset_masuk += 1;
      } else if (mutasi.tipe === 'KELUAR') {
        rekapKategori[kategori].aset_keluar += 1;
      }
    });
  });

  // Process HABIS_PAKAI
  mutasiHabisPakai.forEach((mutasi) => {
    mutasi.mutasi_detail_habis_pakai.forEach((detail) => {
      const barang = detail.batch_habis_pakai.barang;
      const kategori = barang.kategori || 'Tanpa Kategori';

      if (!rekapKategori[kategori]) {
        rekapKategori[kategori] = {
          kategori,
          aset_masuk: 0,
          aset_keluar: 0,
          habis_pakai_masuk: 0,
          habis_pakai_keluar: 0,
        };
      }

      if (mutasi.tipe === 'MASUK') {
        rekapKategori[kategori].habis_pakai_masuk += detail.jumlah;
      } else if (mutasi.tipe === 'KELUAR') {
        rekapKategori[kategori].habis_pakai_keluar += detail.jumlah;
      }
    });
  });

  // Convert object to array
  const dataKategori = Object.values(rekapKategori);

  // 4. Ringkasan total
  const ringkasan = dataKategori.reduce(
    (acc, item) => ({
      total_aset_masuk: acc.total_aset_masuk + item.aset_masuk,
      total_aset_keluar: acc.total_aset_keluar + item.aset_keluar,
      total_habis_pakai_masuk: acc.total_habis_pakai_masuk + item.habis_pakai_masuk,
      total_habis_pakai_keluar: acc.total_habis_pakai_keluar + item.habis_pakai_keluar,
    }),
    {
      total_aset_masuk: 0,
      total_aset_keluar: 0,
      total_habis_pakai_masuk: 0,
      total_habis_pakai_keluar: 0,
    }
  );

  return {
    periode: {
      dari: from ? from.toISOString().split('T')[0] : null,
      sampai: to ? to.toISOString().split('T')[0] : null,
    },
    data: dataKategori,
    ringkasan,
  };
};

/**
 * Laporan Transaksi Masuk
 * Detail semua transaksi masuk (ASET & HABIS_PAKAI)
 */
const getLaporanMasuk = async (from, to) => {
  const whereClause = { tipe: 'MASUK' };
  if (from || to) {
    whereClause.tanggal = {};
    if (from) whereClause.tanggal.gte = from;
    if (to) {
      const endOfDay = new Date(to);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.tanggal.lte = endOfDay;
    }
  }

  const mutasi = await prisma.mutasi.findMany({
    where: whereClause,
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
    orderBy: {
      tanggal: 'desc',
    },
  });

  // Transform data
  const data = mutasi.map((m) => {
    let detail_barang = [];
    let total_item = 0;

    // Process ASET
    if (m.mutasi_detail_aset.length > 0) {
      const grouped = {};
      m.mutasi_detail_aset.forEach((detail) => {
        const barang = detail.unit_aset.penerimaan_aset.barang;
        const key = barang.kode_barang;
        if (!grouped[key]) {
          grouped[key] = {
            kode_barang: barang.kode_barang,
            nama_barang: barang.nama_barang,
            kategori: barang.kategori,
            jenis_barang: 'ASET',
            satuan: barang.satuan,
            jumlah: 0,
          };
        }
        grouped[key].jumlah += 1;
      });
      detail_barang = Object.values(grouped);
      total_item = m.mutasi_detail_aset.length;
    }

    // Process HABIS_PAKAI
    if (m.mutasi_detail_habis_pakai.length > 0) {
      const grouped = {};
      m.mutasi_detail_habis_pakai.forEach((detail) => {
        const barang = detail.batch_habis_pakai.barang;
        const key = barang.kode_barang;
        if (!grouped[key]) {
          grouped[key] = {
            kode_barang: barang.kode_barang,
            nama_barang: barang.nama_barang,
            kategori: barang.kategori,
            jenis_barang: 'HABIS_PAKAI',
            satuan: barang.satuan,
            jumlah: 0,
          };
        }
        grouped[key].jumlah += detail.jumlah;
      });
      detail_barang = Object.values(grouped);
      total_item = detail_barang.reduce((sum, item) => sum + item.jumlah, 0);
    }

    return {
      id: m.id,
      tanggal: m.tanggal,
      tipe_barang: m.tipe_barang,
      keterangan: m.keterangan,
      user: m.users?.nama || m.users?.username,
      detail_barang,
      total_item,
    };
  });

  // Ringkasan
  const totalAset = data
    .filter((d) => d.tipe_barang === 'ASET')
    .reduce((sum, d) => sum + d.total_item, 0);
  const totalHabisPakai = data
    .filter((d) => d.tipe_barang === 'HABIS_PAKAI')
    .reduce((sum, d) => sum + d.total_item, 0);

  return {
    periode: {
      dari: from ? from.toISOString().split('T')[0] : null,
      sampai: to ? to.toISOString().split('T')[0] : null,
    },
    data,
    ringkasan: {
      total_transaksi: data.length,
      total_aset_masuk: totalAset,
      total_habis_pakai_masuk: totalHabisPakai,
    },
  };
};

/**
 * Laporan Transaksi Keluar
 * Detail semua transaksi keluar (ASET & HABIS_PAKAI)
 */
const getLaporanKeluar = async (from, to) => {
  const whereClause = { tipe: 'KELUAR' };
  if (from || to) {
    whereClause.tanggal = {};
    if (from) whereClause.tanggal.gte = from;
    if (to) {
      const endOfDay = new Date(to);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.tanggal.lte = endOfDay;
    }
  }

  const mutasi = await prisma.mutasi.findMany({
    where: whereClause,
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
    orderBy: {
      tanggal: 'desc',
    },
  });

  // Transform data (sama seperti laporan masuk)
  const data = mutasi.map((m) => {
    let detail_barang = [];
    let total_item = 0;

    // Process ASET
    if (m.mutasi_detail_aset.length > 0) {
      const grouped = {};
      m.mutasi_detail_aset.forEach((detail) => {
        const barang = detail.unit_aset.penerimaan_aset.barang;
        const key = barang.kode_barang;
        if (!grouped[key]) {
          grouped[key] = {
            kode_barang: barang.kode_barang,
            nama_barang: barang.nama_barang,
            kategori: barang.kategori,
            jenis_barang: 'ASET',
            satuan: barang.satuan,
            jumlah: 0,
          };
        }
        grouped[key].jumlah += 1;
      });
      detail_barang = Object.values(grouped);
      total_item = m.mutasi_detail_aset.length;
    }

    // Process HABIS_PAKAI
    if (m.mutasi_detail_habis_pakai.length > 0) {
      const grouped = {};
      m.mutasi_detail_habis_pakai.forEach((detail) => {
        const barang = detail.batch_habis_pakai.barang;
        const key = barang.kode_barang;
        if (!grouped[key]) {
          grouped[key] = {
            kode_barang: barang.kode_barang,
            nama_barang: barang.nama_barang,
            kategori: barang.kategori,
            jenis_barang: 'HABIS_PAKAI',
            satuan: barang.satuan,
            jumlah: 0,
          };
        }
        grouped[key].jumlah += detail.jumlah;
      });
      detail_barang = Object.values(grouped);
      total_item = detail_barang.reduce((sum, item) => sum + item.jumlah, 0);
    }

    return {
      id: m.id,
      tanggal: m.tanggal,
      tipe_barang: m.tipe_barang,
      keterangan: m.keterangan,
      user: m.users?.nama || m.users?.username,
      detail_barang,
      total_item,
    };
  });

  // Ringkasan
  const totalAset = data
    .filter((d) => d.tipe_barang === 'ASET')
    .reduce((sum, d) => sum + d.total_item, 0);
  const totalHabisPakai = data
    .filter((d) => d.tipe_barang === 'HABIS_PAKAI')
    .reduce((sum, d) => sum + d.total_item, 0);

  return {
    periode: {
      dari: from ? from.toISOString().split('T')[0] : null,
      sampai: to ? to.toISOString().split('T')[0] : null,
    },
    data,
    ringkasan: {
      total_transaksi: data.length,
      total_aset_keluar: totalAset,
      total_habis_pakai_keluar: totalHabisPakai,
    },
  };
};

module.exports = {
  getLaporanStok,
  getRekapKategori,
  getLaporanMasuk,
  getLaporanKeluar,
};
