# TRANSAKSI ASET - API Documentation

## 📌 Base URL

```
http://localhost:5000/api/aset
http://localhost:5000/api/scan
```

## 🔐 Authentication

Semua endpoint memerlukan:

- **Header:** `Authorization: Bearer <token>`
- **Role:** ADMIN atau PETUGAS

---

## 📌 Endpoints

### 1. Aset Masuk

**POST** `/api/aset/masuk`

Menerima aset masuk. Jika barang belum ada, akan auto-create.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "kode_barang": "BRG-2026-0001",
  "nama_barang": "Laptop Dell",
  "kategori": "Elektronik",
  "merk": "Dell",
  "satuan": "unit",
  "tahun_masuk": 2026,
  "jumlah_unit": 5,
  "harga_satuan": 15000000,
  "keterangan": "Pembelian laptop untuk karyawan baru"
}
```

**Field Opsional:**

- `kode_barang` - Jika tidak dikirim, akan auto-create barang baru
- `kategori`, `merk`, `satuan`, `harga_satuan`, `keterangan`

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Aset berhasil diterima",
  "data": {
    "barang": {
      "id": "uuid",
      "kode_barang": "BRG-2026-0001",
      "nama_barang": "Laptop Dell",
      "kategori": "Elektronik",
      "merk": "Dell",
      "jenis_barang": "ASET",
      "satuan": "unit",
      "is_active": true
    },
    "penerimaan_aset": {
      "id": "uuid",
      "barang_id": "uuid",
      "tahun_masuk": 2026,
      "jumlah_unit": 5,
      "harga_satuan": "15000000.00",
      "keterangan": "Pembelian laptop untuk karyawan baru"
    },
    "unit_aset": [
      {
        "id": "uuid",
        "penerimaan_aset_id": "uuid",
        "kode_unit": "BRG-2026-0001-001",
        "status": "AKTIF",
        "kondisi": "BAIK"
      },
      {
        "id": "uuid",
        "penerimaan_aset_id": "uuid",
        "kode_unit": "BRG-2026-0001-002",
        "status": "AKTIF",
        "kondisi": "BAIK"
      },
      {
        "id": "uuid",
        "penerimaan_aset_id": "uuid",
        "kode_unit": "BRG-2026-0001-003",
        "status": "AKTIF",
        "kondisi": "BAIK"
      },
      {
        "id": "uuid",
        "penerimaan_aset_id": "uuid",
        "kode_unit": "BRG-2026-0001-004",
        "status": "AKTIF",
        "kondisi": "BAIK"
      },
      {
        "id": "uuid",
        "penerimaan_aset_id": "uuid",
        "kode_unit": "BRG-2026-0001-005",
        "status": "AKTIF",
        "kondisi": "BAIK"
      }
    ],
    "mutasi": {
      "id": "uuid",
      "tipe": "MASUK",
      "tipe_barang": "ASET",
      "tanggal": "2026-01-29T05:00:00.000Z",
      "user_id": "uuid",
      "keterangan": "Penerimaan aset Laptop Dell sebanyak 5 unit (tahun 2026)"
    },
    "total_unit": 5
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Barang harus berjenis ASET"
}
```

---

### 2. Aset Keluar

**POST** `/api/aset/keluar`

Mengeluarkan aset (soft delete). Unit akan diubah statusnya menjadi DIHAPUS.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "kode_unit": ["BRG-2026-0001-001", "BRG-2026-0001-002"],
  "kondisi": "RUSAK",
  "keterangan": "Laptop rusak tidak bisa diperbaiki"
}
```

**Kondisi:** BAIK, RUSAK, atau HILANG

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Aset berhasil dikeluarkan",
  "data": {
    "unit_aset": [
      {
        "id": "uuid",
        "penerimaan_aset_id": "uuid",
        "kode_unit": "BRG-2026-0001-001",
        "status": "DIHAPUS",
        "kondisi": "RUSAK",
        "keterangan": "Laptop rusak tidak bisa diperbaiki"
      },
      {
        "id": "uuid",
        "penerimaan_aset_id": "uuid",
        "kode_unit": "BRG-2026-0001-002",
        "status": "DIHAPUS",
        "kondisi": "RUSAK",
        "keterangan": "Laptop rusak tidak bisa diperbaiki"
      }
    ],
    "mutasi": {
      "id": "uuid",
      "tipe": "KELUAR",
      "tipe_barang": "ASET",
      "tanggal": "2026-01-29T06:00:00.000Z",
      "user_id": "uuid",
      "keterangan": "Pengeluaran aset: Laptop Dell - Laptop rusak tidak bisa diperbaiki"
    },
    "total_unit": 2
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Unit tidak ditemukan: BRG-2026-0001-999"
}
```

```json
{
  "success": false,
  "message": "Unit sudah dihapus: BRG-2026-0001-001"
}
```

---

### 3. Generate QR Code Unit

**GET** `/api/aset/unit/:kode_unit/qr`

Generate QR code PNG untuk unit aset.

**Headers:**

```
Authorization: Bearer <token>
```

**Example Request:**

```
GET /api/aset/unit/BRG-2026-0001-001/qr
```

**Success Response:**

- Content-Type: `image/png`
- Returns PNG image buffer

**Cara Akses di Browser:**

```
http://localhost:5000/api/aset/unit/BRG-2026-0001-001/qr
```

---

### 4. Scan Unit Aset

**GET** `/api/scan/unit/:kode_unit`

Scan unit aset untuk mendapatkan detail lengkap.

**Headers:**

```
Authorization: Bearer <token>
```

**Example Request:**

```
GET /api/scan/unit/BRG-2026-0001-001
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Data unit berhasil diambil",
  "data": {
    "unit_aset": {
      "id": "uuid",
      "kode_unit": "BRG-2026-0001-001",
      "status": "AKTIF",
      "kondisi": "BAIK",
      "keterangan": null,
      "created_at": "2026-01-29T05:00:00.000Z",
      "updated_at": "2026-01-29T05:00:00.000Z"
    },
    "barang": {
      "id": "uuid",
      "kode_barang": "BRG-2026-0001",
      "nama_barang": "Laptop Dell",
      "kategori": "Elektronik",
      "merk": "Dell",
      "jenis_barang": "ASET",
      "satuan": "unit",
      "is_active": true
    },
    "penerimaan": {
      "id": "uuid",
      "tahun_masuk": 2026,
      "jumlah_unit": 5,
      "harga_satuan": "15000000.00",
      "keterangan": "Pembelian laptop untuk karyawan baru"
    },
    "jumlah_unit_aktif": 3
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Unit tidak ditemukan"
}
```

---

## 🧪 Testing dengan cURL

### 1. Login untuk mendapatkan token

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"Admin123!\"}"
```

---

### 2. Aset Masuk (Auto-create Barang Baru)

```bash
curl -X POST http://localhost:5000/api/aset/masuk ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"nama_barang\":\"Laptop Dell\",\"kategori\":\"Elektronik\",\"merk\":\"Dell\",\"satuan\":\"unit\",\"tahun_masuk\":2026,\"jumlah_unit\":5,\"harga_satuan\":15000000,\"keterangan\":\"Pembelian laptop baru\"}"
```

---

### 3. Aset Masuk (Gunakan Barang yang Sudah Ada)

```bash
curl -X POST http://localhost:5000/api/aset/masuk ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"kode_barang\":\"BRG-2026-0001\",\"nama_barang\":\"Laptop Dell\",\"tahun_masuk\":2026,\"jumlah_unit\":3,\"harga_satuan\":15000000}"
```

---

### 4. Aset Keluar (Single Unit)

```bash
curl -X POST http://localhost:5000/api/aset/keluar ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"kode_unit\":[\"BRG-2026-0001-001\"],\"kondisi\":\"RUSAK\",\"keterangan\":\"Laptop rusak tidak bisa diperbaiki\"}"
```

---

### 5. Aset Keluar (Multiple Units)

```bash
curl -X POST http://localhost:5000/api/aset/keluar ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"kode_unit\":[\"BRG-2026-0001-001\",\"BRG-2026-0001-002\"],\"kondisi\":\"HILANG\",\"keterangan\":\"Laptop hilang dicuri\"}"
```

---

### 6. Generate QR Code

```bash
curl -X GET "http://localhost:5000/api/aset/unit/BRG-2026-0001-001/qr" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  --output BRG-2026-0001-001.png
```

**Atau buka di browser:**

```
http://localhost:5000/api/aset/unit/BRG-2026-0001-001/qr
```

---

### 7. Scan Unit

```bash
curl -X GET "http://localhost:5000/api/scan/unit/BRG-2026-0001-001" ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Fitur Khusus

### Auto-Generate Kode Unit

Format: `<kode_barang>-NNN`

- Contoh: BRG-2026-0001-001, BRG-2026-0001-002, dst
- Nomor urut 3 digit dengan leading zeros
- Auto-increment per penerimaan aset

### Prisma Transaction

Semua operasi menggunakan Prisma transaction untuk menjamin data consistency:

- Aset masuk: barang → penerimaan → unit (batch) → mutasi
- Aset keluar: update units (batch) → mutasi

### Soft Delete Unit

Unit yang keluar tidak dihapus dari database, tapi:

- Status diubah menjadi `DIHAPUS`
- Kondisi diupdate (RUSAK/HILANG)
- Keterangan dicatat

### QR Code

- Format PNG 300x300px
- Margin 2px
- Black & White
- Isi QR = kode_unit

---

## ✅ Checklist STEP 5

- ✅ POST /api/aset/masuk (auto-create barang)
- ✅ Generate unit_aset batch (kode_unit: <kode_barang>-001..N)
- ✅ Catat mutasi MASUK + mutasi_detail_aset
- ✅ GET /api/aset/unit/:kode_unit/qr (return PNG)
- ✅ POST /api/aset/keluar (soft delete, kondisi)
- ✅ Catat mutasi KELUAR + mutasi_detail_aset
- ✅ GET /api/scan/unit/:kode_unit (detail + jumlah aktif)
- ✅ ADMIN & PETUGAS access
- ✅ Validasi Zod
- ✅ Prisma transaction untuk batch operation
- ✅ Soft delete (status DIHAPUS)
