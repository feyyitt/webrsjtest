/**
 * Prisma Seed Script
 * Menambahkan data default ke database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const petugasPassword = await bcrypt.hash('petugas123', 10);

  // =====================================================
  // SEED USERS
  // =====================================================
  console.log('👤 Creating default users...');

  // Create Admin User
  const admin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {
      password: adminPassword,
      nama: 'Administrator',
      role: 'ADMIN',
      is_active: true,
    },
    create: {
      id: randomUUID(),
      username: 'admin',
      password: adminPassword,
      nama: 'Administrator',
      role: 'ADMIN',
      is_active: true,
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // Create Petugas User
  const petugas = await prisma.users.upsert({
    where: { username: 'petugas' },
    update: {
      password: petugasPassword,
      nama: 'Petugas Inventaris',
      role: 'PETUGAS',
      is_active: true,
    },
    create: {
      id: randomUUID(),
      username: 'petugas',
      password: petugasPassword,
      nama: 'Petugas Inventaris',
      role: 'PETUGAS',
      is_active: true,
    },
  });
  console.log('✅ Petugas user created:', petugas.username);

  // =====================================================
  // SEED BARANG (OPTIONAL - Contoh Data)
  // =====================================================
  console.log('📦 Creating sample barang...');

  // Contoh Barang Aset
  const barangAset1 = await prisma.barang.upsert({
    where: { kode_barang: 'AST-001' },
    update: {},
    create: {
      id: randomUUID(),
      kode_barang: 'AST-001',
      nama_barang: 'Komputer Desktop',
      jenis_barang: 'ASET',
      satuan: 'unit',
      is_active: true,
    },
  });
  console.log('✅ Barang Aset created:', barangAset1.nama_barang);

  const barangAset2 = await prisma.barang.upsert({
    where: { kode_barang: 'AST-002' },
    update: {},
    create: {
      id: randomUUID(),
      kode_barang: 'AST-002',
      nama_barang: 'Kursi Kantor',
      jenis_barang: 'ASET',
      satuan: 'unit',
      is_active: true,
    },
  });
  console.log('✅ Barang Aset created:', barangAset2.nama_barang);

  // Contoh Barang Habis Pakai
  const barangHabisPakai1 = await prisma.barang.upsert({
    where: { kode_barang: 'HP-001' },
    update: {},
    create: {
      id: randomUUID(),
      kode_barang: 'HP-001',
      nama_barang: 'Kertas A4',
      jenis_barang: 'HABIS_PAKAI',
      satuan: 'rim',
      is_active: true,
    },
  });
  console.log('✅ Barang Habis Pakai created:', barangHabisPakai1.nama_barang);

  const barangHabisPakai2 = await prisma.barang.upsert({
    where: { kode_barang: 'HP-002' },
    update: {},
    create: {
      id: randomUUID(),
      kode_barang: 'HP-002',
      nama_barang: 'Pulpen',
      jenis_barang: 'HABIS_PAKAI',
      satuan: 'box',
      is_active: true,
    },
  });
  console.log('✅ Barang Habis Pakai created:', barangHabisPakai2.nama_barang);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
