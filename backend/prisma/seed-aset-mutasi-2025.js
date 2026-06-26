/**
 * Seeder untuk Mutasi Aset Masuk & Keluar (10 masing-masing)
 * Run: node prisma/seed-aset-mutasi-2025.js
 */

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function seedAsetMutasi() {
  try {
    console.log('🌱 Starting to seed Aset Mutasi (Masuk & Keluar)...\n');

    // 1. Get admin user (dari seeder default)
    const admin = await prisma.users.findFirst({
      where: { username: 'admin' }
    });

    if (!admin) {
      throw new Error('❌ Admin user tidak ditemukan. Jalankan seed.js dulu!');
    }

    console.log(`👤 Using admin user: ${admin.nama}\n`);

    // 2. Get penerimaan_aset untuk link ke unit_aset
    const penerimaanAset = await prisma.penerimaan_aset.findMany({
      take: 20,
      include: {
        barang: true,
        unit_aset: {
          take: 5 // Ambil max 5 unit per barang
        }
      }
    });

    console.log(`📦 Found ${penerimaanAset.length} penerimaan aset\n`);

    // =====================================================
    // ASET MASUK (10 entries)
    // =====================================================
    console.log('📥 Creating 10 Aset Masuk transactions...\n');

    const asetMasukData = [
      {
        barangIndex: 0,
        jumlahUnit: 1,
        keterangan: 'Penerimaan dari supplier resmi'
      },
      {
        barangIndex: 1,
        jumlahUnit: 2,
        keterangan: 'Donasi dari pemerintah pusat'
      },
      {
        barangIndex: 2,
        jumlahUnit: 3,
        keterangan: 'Pembelian tahunan anggaran'
      },
      {
        barangIndex: 3,
        jumlahUnit: 1,
        keterangan: 'Retur barang baru'
      },
      {
        barangIndex: 4,
        jumlahUnit: 2,
        keterangan: 'Aset dari merger departemen'
      },
      {
        barangIndex: 5,
        jumlahUnit: 1,
        keterangan: 'Penggantian barang rusak'
      },
      {
        barangIndex: 6,
        jumlahUnit: 2,
        keterangan: 'Pembelian alat kesehatan baru'
      },
      {
        barangIndex: 7,
        jumlahUnit: 1,
        keterangan: 'Aset bantuan CSR'
      },
      {
        barangIndex: 8,
        jumlahUnit: 2,
        keterangan: 'Upgrade peralatan kantor'
      },
      {
        barangIndex: 9,
        jumlahUnit: 1,
        keterangan: 'Investasi fasilitas medis'
      }
    ];

    const mutasiMasukIds = [];
    let unitMasukCount = 0;

    for (let i = 0; i < asetMasukData.length; i++) {
      const data = asetMasukData[i];
      
      // Jika tidak ada penerimaan cukup, skip
      if (!penerimaanAset[data.barangIndex]) {
        console.log(`⚠️  Skip: Penerimaan aset index ${data.barangIndex} tidak ditemukan`);
        continue;
      }

      const penerimaan = penerimaanAset[data.barangIndex];
      
      // Create mutasi MASUK
      const mutasi = await prisma.mutasi.create({
        data: {
          id: randomUUID(),
          tipe: 'MASUK',
          tipe_barang: 'ASET',
          tanggal: new Date(2025, 3, 15 + i), // 15 April + increment
          user_id: admin.id,
          keterangan: data.keterangan,
        }
      });

      mutasiMasukIds.push({
        mutasiId: mutasi.id,
        unitCount: data.jumlahUnit,
        barangName: penerimaan.barang.nama_barang
      });

      // Get units untuk di-link ke mutasi_detail_aset
      const units = penerimaan.unit_aset.slice(0, data.jumlahUnit);

      for (const unit of units) {
        await prisma.mutasi_detail_aset.create({
          data: {
            id: randomUUID(),
            mutasi_id: mutasi.id,
            unit_aset_id: unit.id,
          }
        });
        unitMasukCount++;
      }

      console.log(`✅ Aset Masuk #${i + 1}: ${penerimaan.barang.nama_barang} (${data.jumlahUnit} unit)`);
      console.log(`   📅 Tanggal: ${mutasi.tanggal.toLocaleDateString('id-ID')}`);
      console.log(`   📝 Keterangan: ${data.keterangan}\n`);
    }

    // =====================================================
    // ASET KELUAR (10 entries)
    // =====================================================
    console.log('\n📤 Creating 10 Aset Keluar transactions...\n');

    const asetKeluarData = [
      {
        barangIndex: 10,
        jumlahUnit: 1,
        keterangan: 'Pemindahan ke unit rawat inap'
      },
      {
        barangIndex: 11,
        jumlahUnit: 1,
        keterangan: 'Penjualan aset lama'
      },
      {
        barangIndex: 12,
        jumlahUnit: 2,
        keterangan: 'Pelepasan aset rusak tidak dapat diperbaiki'
      },
      {
        barangIndex: 13,
        jumlahUnit: 1,
        keterangan: 'Donasi ke institusi lain'
      },
      {
        barangIndex: 14,
        jumlahUnit: 1,
        keterangan: 'Transfer ke cabang baru'
      },
      {
        barangIndex: 15,
        jumlahUnit: 1,
        keterangan: 'Pensiun aset'
      },
      {
        barangIndex: 16,
        jumlahUnit: 1,
        keterangan: 'Pemindahan ke bagian administrasi'
      },
      {
        barangIndex: 17,
        jumlahUnit: 2,
        keterangan: 'Upgrade fasilitas - pelepasan lama'
      },
      {
        barangIndex: 18,
        jumlahUnit: 1,
        keterangan: 'Pelepasan aset hilang'
      },
      {
        barangIndex: 19,
        jumlahUnit: 1,
        keterangan: 'Penghapusan dari pembukuan'
      }
    ];

    let unitKeluarCount = 0;

    for (let i = 0; i < asetKeluarData.length; i++) {
      const data = asetKeluarData[i];
      
      // Jika tidak ada penerimaan cukup, skip
      if (!penerimaanAset[data.barangIndex]) {
        console.log(`⚠️  Skip: Penerimaan aset index ${data.barangIndex} tidak ditemukan`);
        continue;
      }

      const penerimaan = penerimaanAset[data.barangIndex];
      
      // Create mutasi KELUAR
      const mutasi = await prisma.mutasi.create({
        data: {
          id: randomUUID(),
          tipe: 'KELUAR',
          tipe_barang: 'ASET',
          tanggal: new Date(2025, 3, 25 + i), // 25 April + increment
          user_id: admin.id,
          keterangan: data.keterangan,
        }
      });

      // Get units untuk di-link ke mutasi_detail_aset
      const units = penerimaan.unit_aset.slice(0, data.jumlahUnit);

      for (const unit of units) {
        await prisma.mutasi_detail_aset.create({
          data: {
            id: randomUUID(),
            mutasi_id: mutasi.id,
            unit_aset_id: unit.id,
          }
        });
        unitKeluarCount++;
      }

      console.log(`✅ Aset Keluar #${i + 1}: ${penerimaan.barang.nama_barang} (${data.jumlahUnit} unit)`);
      console.log(`   📅 Tanggal: ${mutasi.tanggal.toLocaleDateString('id-ID')}`);
      console.log(`   📝 Keterangan: ${data.keterangan}\n`);
    }

    // =====================================================
    // Summary
    // =====================================================
    console.log('\n✨ =====================================================');
    console.log(`✅ Seeding Mutasi Aset completed successfully!`);
    console.log(`📥 Total Aset Masuk transactions: ${asetMasukData.length}`);
    console.log(`   └─ Total units: ${unitMasukCount}`);
    console.log(`📤 Total Aset Keluar transactions: ${asetKeluarData.length}`);
    console.log(`   └─ Total units: ${unitKeluarCount}`);
    console.log(`✨ =====================================================\n`);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
seedAsetMutasi();
