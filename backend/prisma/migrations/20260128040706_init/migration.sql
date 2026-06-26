-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PETUGAS');

-- CreateEnum
CREATE TYPE "JenisBarang" AS ENUM ('ASET', 'HABIS_PAKAI');

-- CreateEnum
CREATE TYPE "StatusUnitAset" AS ENUM ('AKTIF', 'DIHAPUS');

-- CreateEnum
CREATE TYPE "KondisiUnitAset" AS ENUM ('BAIK', 'RUSAK', 'HILANG');

-- CreateEnum
CREATE TYPE "TipeMutasi" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "TipeBarangMutasi" AS ENUM ('ASET', 'HABIS_PAKAI');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barang" (
    "id" TEXT NOT NULL,
    "kode_barang" TEXT NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "jenis_barang" "JenisBarang" NOT NULL,
    "satuan" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penerimaan_aset" (
    "id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,
    "tahun_masuk" INTEGER NOT NULL,
    "jumlah_unit" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penerimaan_aset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_aset" (
    "id" TEXT NOT NULL,
    "penerimaan_aset_id" TEXT NOT NULL,
    "kode_unit" TEXT NOT NULL,
    "status" "StatusUnitAset" NOT NULL DEFAULT 'AKTIF',
    "kondisi" "KondisiUnitAset" NOT NULL DEFAULT 'BAIK',
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_aset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_habis_pakai" (
    "id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,
    "kode_batch" TEXT NOT NULL,
    "expired_date" TIMESTAMP(3),
    "jumlah_masuk" INTEGER NOT NULL,
    "jumlah_keluar" INTEGER NOT NULL DEFAULT 0,
    "jumlah_sisa" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_habis_pakai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutasi" (
    "id" TEXT NOT NULL,
    "tipe" "TipeMutasi" NOT NULL,
    "tipe_barang" "TipeBarangMutasi" NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mutasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutasi_detail_aset" (
    "id" TEXT NOT NULL,
    "mutasi_id" TEXT NOT NULL,
    "unit_aset_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mutasi_detail_aset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutasi_detail_habis_pakai" (
    "id" TEXT NOT NULL,
    "mutasi_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mutasi_detail_habis_pakai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "barang_kode_barang_key" ON "barang"("kode_barang");

-- CreateIndex
CREATE UNIQUE INDEX "unit_aset_kode_unit_key" ON "unit_aset"("kode_unit");

-- CreateIndex
CREATE UNIQUE INDEX "batch_habis_pakai_kode_batch_key" ON "batch_habis_pakai"("kode_batch");

-- AddForeignKey
ALTER TABLE "penerimaan_aset" ADD CONSTRAINT "penerimaan_aset_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_aset" ADD CONSTRAINT "unit_aset_penerimaan_aset_id_fkey" FOREIGN KEY ("penerimaan_aset_id") REFERENCES "penerimaan_aset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_habis_pakai" ADD CONSTRAINT "batch_habis_pakai_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi" ADD CONSTRAINT "mutasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_detail_aset" ADD CONSTRAINT "mutasi_detail_aset_mutasi_id_fkey" FOREIGN KEY ("mutasi_id") REFERENCES "mutasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_detail_aset" ADD CONSTRAINT "mutasi_detail_aset_unit_aset_id_fkey" FOREIGN KEY ("unit_aset_id") REFERENCES "unit_aset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_detail_habis_pakai" ADD CONSTRAINT "mutasi_detail_habis_pakai_mutasi_id_fkey" FOREIGN KEY ("mutasi_id") REFERENCES "mutasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_detail_habis_pakai" ADD CONSTRAINT "mutasi_detail_habis_pakai_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch_habis_pakai"("id") ON DELETE CASCADE ON UPDATE CASCADE;
