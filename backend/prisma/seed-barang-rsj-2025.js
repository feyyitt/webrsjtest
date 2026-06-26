/**
 * Seeder untuk 30 Barang Aset RSJ Tahun 2025
 * Run: node prisma/seed-barang-rsj-2025.js
 */

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

// Data 30 barang Aset RSJ tahun 2025
const barangData = [
  {
    kode_barang: "1.3.2.10.02.03.003",
    nama_barang: "PRINTER EPSON L850",
    kategori: "Peralatan Kantor",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Peralatan Personal Komputer"
  },
  {
    kode_barang: "1.3.2.10.01.02.001",
    nama_barang: "PC LENOVO",
    kategori: "Peralatan Kantor",
    jumlah_unit: 5,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "P.C Unit"
  },
  {
    kode_barang: "1.3.2.05.02.01.006",
    nama_barang: "KURSI TUNGGU PASIEN",
    kategori: "Perabot Kantor",
    jumlah_unit: 50,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Perabot Kantor"
  },
  {
    kode_barang: "1.3.2.05.02.06.113",
    nama_barang: "ANDROID TV LED SAMSUNG 65\"",
    kategori: "Alat Rumah Tangga",
    jumlah_unit: 3,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Rumah Tangga Lain-lain"
  },
  {
    kode_barang: "1.3.2.05.02.01.024",
    nama_barang: "MEJA ½ BIRO",
    kategori: "Perabot Kantor",
    jumlah_unit: 25,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Perabot Kantor"
  },
  {
    kode_barang: "1.3.2.10.01.02.002",
    nama_barang: "LAPTOP LENOVO",
    kategori: "Peralatan Kantor",
    jumlah_unit: 2,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Peralatan Personal Komputer"
  },
  {
    kode_barang: "1.3.2.05.02.05.002",
    nama_barang: "TUNGKU KOMPOR GAS RINNAI",
    kategori: "Alat Rumah Tangga",
    jumlah_unit: 4,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Rumah Tangga Lain-lain"
  },
  {
    kode_barang: "1.3.2.05.02.06.111",
    nama_barang: "BRACKET TV",
    kategori: "Alat Rumah Tangga",
    jumlah_unit: 3,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Rumah Tangga Lain-lain"
  },
  {
    kode_barang: "1.3.2.05.02.01.003",
    nama_barang: "KURSI BESI AULA",
    kategori: "Perabot Kantor",
    jumlah_unit: 100,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Perabot Kantor"
  },
  {
    kode_barang: "1.3.2.05.02.06.007",
    nama_barang: "LOUDSPEAKER",
    kategori: "Peralatan Audio",
    jumlah_unit: 4,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Peralatan Studio Audio"
  },
  {
    kode_barang: "1.3.2.06.02.06.007",
    nama_barang: "LOUDSPEAKER PORTABLE",
    kategori: "Peralatan Audio",
    jumlah_unit: 2,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Peralatan Studio Audio"
  },
  {
    kode_barang: "1.3.2.06.01.01.001",
    nama_barang: "AUDIO MIXING CONSOLE",
    kategori: "Peralatan Audio",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Peralatan Studio Audio"
  },
  {
    kode_barang: "1.3.2.06.01.01.036",
    nama_barang: "MICROPHONE/WIRELESS MIC",
    kategori: "Peralatan Audio",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Peralatan Studio Audio"
  },
  {
    kode_barang: "1.3.2.06.01.01.099",
    nama_barang: "TRIPOT SPEAKER",
    kategori: "Peralatan Audio",
    jumlah_unit: 4,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Peralatan Studio Audio Lainnya"
  },
  {
    kode_barang: "1.3.2.07.01.19.046",
    nama_barang: "STERILIZER",
    kategori: "Alat Medis",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.07.01.14.022",
    nama_barang: "ECG",
    kategori: "Alat Medis",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.07.01.13.005",
    nama_barang: "PATIENT MONITOR",
    kategori: "Alat Medis",
    jumlah_unit: 2,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.07.01.01.080",
    nama_barang: "INFUSION PUMP",
    kategori: "Alat Medis",
    jumlah_unit: 2,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.07.01.01.143",
    nama_barang: "SYRINGE PUMP",
    kategori: "Alat Medis",
    jumlah_unit: 2,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.05.02.01.009",
    nama_barang: "2 CRANK PSYCHIATRIC BED",
    kategori: "Perabot Medis",
    jumlah_unit: 72,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Bed Khusus Pasien Jiwa"
  },
  {
    kode_barang: "1.3.2.05.02.01.045",
    nama_barang: "BEDSIDE MONITOR",
    kategori: "Alat Medis",
    jumlah_unit: 76,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Medis"
  },
  {
    kode_barang: "1.3.2.08.01.14.011",
    nama_barang: "HEMATOLOGY ANALYZER",
    kategori: "Alat Medis",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.07.01.15.008",
    nama_barang: "DIGITAL RADIOGRAPHY X-RAY",
    kategori: "Alat Medis Radiologi",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Radiologi"
  },
  {
    kode_barang: "1.3.2.07.01.21.020",
    nama_barang: "ELECTROLYTE ANALYZER",
    kategori: "Alat Medis",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.07.01.02.005",
    nama_barang: "DENTAL INSTRUMENT",
    kategori: "Alat Medis Gigi",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Gigi"
  },
  {
    kode_barang: "1.3.2.07.01.01.133",
    nama_barang: "SUCTION PUMP",
    kategori: "Alat Medis",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.07.01.13.999",
    nama_barang: "REPETITIVE MAGNETIC SIMULATOR",
    kategori: "Alat Medis",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Saraf"
  },
  {
    kode_barang: "1.3.2.07.01.22.001",
    nama_barang: "ELECTROCONVULSIVE",
    kategori: "Alat Medis",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Jiwa"
  },
  {
    kode_barang: "1.3.2.07.01.04.071",
    nama_barang: "EMERGENCY TROLLEY",
    kategori: "Perabot Medis",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Umum"
  },
  {
    kode_barang: "1.3.2.07.01.02.002",
    nama_barang: "DENTAL UNIT",
    kategori: "Alat Medis Gigi",
    jumlah_unit: 1,
    satuan: "unit",
    tahun_masuk: 2025,
    keterangan: "Alat Kedokteran Gigi"
  }
];

/**
 * Generate kode unit untuk aset
 * Format: {kode_barang}-{nomor_urut}
 */
function generateKodeUnit(kodeBarang, nomorUrut) {
  return `${kodeBarang}-${String(nomorUrut).padStart(3, '0')}`;
}

async function seedBarangRSJ() {
  try {
    console.log('🌱 Starting to seed 30 barang aset RSJ 2025...\n');
    
    let barangCount = 0;
    let unitCount = 0;

    for (const item of barangData) {
      // 1. Insert ke tabel barang
      const barang = await prisma.barang.upsert({
        where: { kode_barang: item.kode_barang },
        update: {
          kategori: item.kategori,
          keterangan: item.keterangan,
        },
        create: {
          id: randomUUID(),
          kode_barang: item.kode_barang,
          nama_barang: item.nama_barang,
          jenis_barang: 'ASET',
          satuan: item.satuan,
          kategori: item.kategori,
          keterangan: item.keterangan,
          is_active: true,
        },
      });
      barangCount++;
      console.log(`✅ Barang: ${barang.kode_barang} - ${barang.nama_barang}`);

      // 2. Insert ke tabel penerimaan_aset
      const penerimaan = await prisma.penerimaan_aset.create({
        data: {
          id: randomUUID(),
          barang_id: barang.id,
          tahun_masuk: item.tahun_masuk,
          jumlah_unit: item.jumlah_unit,
          harga_satuan: 0,
          keterangan: item.keterangan,
        },
      });
      
      console.log(`   📥 Penerimaan Aset: ${item.jumlah_unit} unit`);

      // 3. Insert ke tabel unit_aset (buat unit untuk setiap jumlah)
      for (let i = 1; i <= item.jumlah_unit; i++) {
        await prisma.unit_aset.create({
          data: {
            id: randomUUID(),
            penerimaan_aset_id: penerimaan.id,
            kode_unit: generateKodeUnit(item.kode_barang, i),
            status: 'AKTIF',
            kondisi: 'BAIK',
          },
        });
        unitCount++;
      }
      console.log(`   🏷️  Unit Aset: Created ${item.jumlah_unit} unit codes\n`);
    }

    console.log('\n✨ =====================================================');
    console.log(`✅ Seeding completed successfully!`);
    console.log(`📦 Total Barang inserted: ${barangCount}`);
    console.log(`📋 Total Unit Aset created: ${unitCount}`);
    console.log('✨ =====================================================\n');

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
seedBarangRSJ();
