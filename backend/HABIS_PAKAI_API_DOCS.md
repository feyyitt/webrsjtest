# API Documentation - Habis Pakai Module

Dokumentasi lengkap untuk modul HABIS PAKAI (consumable goods) dengan sistem FIFO (First In First Out).

## Base URL

```
http://localhost:5000/api
```

## Authentication

Semua endpoint memerlukan:

- Header: `Authorization: Bearer <token>`
- Role: `ADMIN` atau `PETUGAS`

---

## 1. Habis Pakai Masuk (Penerimaan)

### Endpoint

```
POST /api/habis-pakai/masuk
```

### Description

Mencatat penerimaan barang habis pakai dengan sistem batch. Jika barang belum ada, akan otomatis dibuat.

### Request Body

**Opsi 1: Barang Baru (Auto-create)**

```json
{
  "nama_barang": "Masker N95",
  "kategori": "APD",
  "merk": "3M",
  "satuan": "box",
  "kode_batch": "BATCH-2024-001",
  "expired_date": "2026-12-31T00:00:00.000Z",
  "jumlah_masuk": 100,
  "harga_satuan": 50000
}
```

**Opsi 2: Barang Existing**

```json
{
  "kode_barang": "BRG-2024-0003",
  "kode_batch": "BATCH-2024-002",
  "expired_date": "2026-06-30T00:00:00.000Z",
  "jumlah_masuk": 50,
  "harga_satuan": 45000
}
```

### Request Body Schema

| Field          | Type              | Required | Description                                                                  |
| -------------- | ----------------- | -------- | ---------------------------------------------------------------------------- |
| `kode_barang`  | string            | No       | Kode barang existing. Jika ada, akan validasi jenis_barang harus HABIS_PAKAI |
| `nama_barang`  | string            | No\*     | Nama barang (3-200 karakter). Required jika kode_barang tidak ada            |
| `kategori`     | string            | No       | Kategori barang                                                              |
| `merk`         | string            | No       | Merk barang                                                                  |
| `satuan`       | string            | No       | Satuan (default: "pcs")                                                      |
| `kode_batch`   | string            | Yes      | Kode batch unique (3-100 karakter)                                           |
| `expired_date` | string (ISO 8601) | No       | Tanggal kadaluarsa. Format: YYYY-MM-DD atau YYYY-MM-DDTHH:mm:ss.sssZ         |
| `jumlah_masuk` | number            | Yes      | Jumlah yang diterima (1-1000000)                                             |
| `harga_satuan` | number            | No       | Harga per satuan (default: 0)                                                |

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Habis pakai berhasil diterima",
  "data": {
    "barang": {
      "id": 5,
      "kode_barang": "BRG-2024-0005",
      "nama_barang": "Masker N95",
      "kategori": "APD",
      "merk": "3M",
      "jenis_barang": "HABIS_PAKAI",
      "satuan": "box",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "batch": {
      "id": 1,
      "barang_id": 5,
      "kode_batch": "BATCH-2024-001",
      "expired_date": "2026-12-31T00:00:00.000Z",
      "jumlah_masuk": 100,
      "jumlah_keluar": 0,
      "jumlah_sisa": 100,
      "harga_satuan": 50000,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "mutasi": {
      "id": 1,
      "tipe": "MASUK",
      "tipe_barang": "HABIS_PAKAI",
      "tanggal": "2024-01-15T10:30:00.000Z",
      "user_id": 1,
      "keterangan": "Penerimaan habis pakai Masker N95 batch BATCH-2024-001 sebanyak 100 box",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses

**400 - Validation Error**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "jumlah_masuk",
      "message": "Jumlah masuk harus minimal 1"
    }
  ]
}
```

**400 - Kode Batch Duplicate**

```json
{
  "success": false,
  "message": "Kode batch BATCH-2024-001 sudah digunakan"
}
```

**404 - Barang Not Found**

```json
{
  "success": false,
  "message": "Barang dengan kode BRG-2024-0099 tidak ditemukan"
}
```

**400 - Wrong Jenis Barang**

```json
{
  "success": false,
  "message": "Barang harus berjenis HABIS_PAKAI"
}
```

---

## 2. Habis Pakai Keluar (Pengeluaran dengan FIFO)

### Endpoint

```
POST /api/habis-pakai/keluar
```

### Description

Mengeluarkan barang habis pakai dengan sistem **FIFO (First In First Out)**. Stok akan dikurangi dari batch dengan expired_date terdekat terlebih dahulu.

### FIFO Logic

Sistem akan:

1. Mencari semua batch yang masih ada stok (`jumlah_sisa > 0`)
2. Mengurutkan berdasarkan `expired_date` ASC (batch yang lebih dulu expired diambil dulu)
3. Batch tanpa expired_date akan diambil terakhir (nulls last)
4. Jika expired_date sama, ambil batch yang lebih dulu masuk (`created_at` ASC)
5. Kurangi stok dari batch pertama sampai habis, lanjut ke batch berikutnya
6. Proses dalam **database transaction** untuk konsistensi data

### Request Body

```json
{
  "kode_barang": "BRG-2024-0005",
  "jumlah_keluar": 150,
  "keterangan": "Pengeluaran untuk Unit IGD"
}
```

### Request Body Schema

| Field           | Type   | Required | Description                             |
| --------------- | ------ | -------- | --------------------------------------- |
| `kode_barang`   | string | Yes      | Kode barang yang akan dikeluarkan       |
| `jumlah_keluar` | number | Yes      | Jumlah yang dikeluarkan (1-1000000)     |
| `keterangan`    | string | Yes      | Keterangan pengeluaran (min 5 karakter) |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Habis pakai berhasil dikeluarkan",
  "data": {
    "barang": {
      "id": 5,
      "kode_barang": "BRG-2024-0005",
      "nama_barang": "Masker N95",
      "kategori": "APD",
      "merk": "3M",
      "jenis_barang": "HABIS_PAKAI",
      "satuan": "box",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "mutasi": {
      "id": 2,
      "tipe": "KELUAR",
      "tipe_barang": "HABIS_PAKAI",
      "tanggal": "2024-01-20T14:00:00.000Z",
      "user_id": 1,
      "keterangan": "Pengeluaran habis pakai Masker N95 sebanyak 150 box - Pengeluaran untuk Unit IGD",
      "created_at": "2024-01-20T14:00:00.000Z",
      "updated_at": "2024-01-20T14:00:00.000Z"
    },
    "total_keluar": 150,
    "affected_batches": [
      {
        "kode_batch": "BATCH-2024-001",
        "jumlah_diambil": 100,
        "sisa_sekarang": 0
      },
      {
        "kode_batch": "BATCH-2024-002",
        "jumlah_diambil": 50,
        "sisa_sekarang": 0
      }
    ]
  }
}
```

### FIFO Example

**Scenario:**

- Request: Keluar 150 box Masker N95
- Batch 1: 100 box (expired: 2026-02-15)
- Batch 2: 80 box (expired: 2026-03-20)

**Process:**

1. Ambil 100 box dari Batch 1 → Sisa Batch 1: 0 box
2. Ambil 50 box dari Batch 2 → Sisa Batch 2: 30 box
3. Total diambil: 150 box ✅

### Error Responses

**404 - Barang Not Found**

```json
{
  "success": false,
  "message": "Barang dengan kode BRG-2024-0099 tidak ditemukan"
}
```

**400 - Wrong Jenis Barang**

```json
{
  "success": false,
  "message": "Barang harus berjenis HABIS_PAKAI"
}
```

**400 - No Stock Available**

```json
{
  "success": false,
  "message": "Tidak ada stok tersedia"
}
```

**400 - Insufficient Stock**

```json
{
  "success": false,
  "message": "Stok tidak mencukupi. Tersedia: 80, Diminta: 150"
}
```

---

## 3. Scan Barang Habis Pakai

### Endpoint

```
GET /api/scan/barang/:kode_barang
```

### Description

Melihat detail barang habis pakai, total stok, dan daftar batch dengan expired date.

### URL Parameters

| Parameter     | Type   | Description                  |
| ------------- | ------ | ---------------------------- |
| `kode_barang` | string | Kode barang yang akan discan |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Scan barang berhasil",
  "data": {
    "barang": {
      "id": 5,
      "kode_barang": "BRG-2024-0005",
      "nama_barang": "Masker N95",
      "kategori": "APD",
      "merk": "3M",
      "jenis_barang": "HABIS_PAKAI",
      "satuan": "box",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "total_stok": 130,
    "batches": [
      {
        "id": 1,
        "kode_batch": "BATCH-2024-001",
        "expired_date": "2026-02-15T00:00:00.000Z",
        "jumlah_masuk": 100,
        "jumlah_keluar": 70,
        "jumlah_sisa": 30,
        "harga_satuan": 50000,
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "kode_batch": "BATCH-2024-002",
        "expired_date": "2026-03-20T00:00:00.000Z",
        "jumlah_masuk": 100,
        "jumlah_keluar": 0,
        "jumlah_sisa": 100,
        "harga_satuan": 45000,
        "created_at": "2024-01-20T09:00:00.000Z"
      },
      {
        "id": 3,
        "kode_batch": "BATCH-2024-003",
        "expired_date": null,
        "jumlah_masuk": 50,
        "jumlah_keluar": 50,
        "jumlah_sisa": 0,
        "harga_satuan": 48000,
        "created_at": "2024-01-25T11:00:00.000Z"
      }
    ]
  }
}
```

**Response Details:**

- `total_stok`: Total jumlah_sisa dari semua batch (dalam contoh: 30 + 100 + 0 = 130)
- `batches`: Diurutkan berdasarkan expired_date ASC (nulls last)
- Batch dengan `jumlah_sisa: 0` tetap ditampilkan untuk audit trail

### Error Response

**404 - Not Found**

```json
{
  "success": false,
  "message": "Barang tidak ditemukan"
}
```

---

## Workflow Examples

### Example 1: Penerimaan Barang Baru

**Step 1: Masuk Batch Pertama**

```bash
POST /api/habis-pakai/masuk
{
  "nama_barang": "Sarung Tangan Latex",
  "kategori": "APD",
  "merk": "Sensi Gloves",
  "satuan": "box",
  "kode_batch": "BATCH-STL-001",
  "expired_date": "2025-12-31T00:00:00.000Z",
  "jumlah_masuk": 200,
  "harga_satuan": 35000
}
```

**Result:**

- Barang baru dibuat: BRG-2024-0006
- Batch dibuat: BATCH-STL-001, stok: 200 box

### Example 2: Pengeluaran dengan FIFO

**Setup:**

- Batch 1: 50 box, expired: 2025-06-30 (oldest)
- Batch 2: 100 box, expired: 2025-12-31
- Batch 3: 80 box, expired: null (no expiry)

**Request: Keluar 120 box**

```bash
POST /api/habis-pakai/keluar
{
  "kode_barang": "BRG-2024-0006",
  "jumlah_keluar": 120,
  "keterangan": "Pengeluaran untuk Poli Umum"
}
```

**FIFO Process:**

1. Ambil 50 dari Batch 1 (expired 2025-06-30) → Sisa: 0
2. Ambil 70 dari Batch 2 (expired 2025-12-31) → Sisa: 30
3. Batch 3 tidak tersentuh → Sisa: 80

**Result:**

```json
{
  "total_keluar": 120,
  "affected_batches": [
    { "kode_batch": "BATCH-STL-001", "jumlah_diambil": 50, "sisa_sekarang": 0 },
    { "kode_batch": "BATCH-STL-002", "jumlah_diambil": 70, "sisa_sekarang": 30 }
  ]
}
```

**Total Stok Akhir: 110 box** (30 + 80)

### Example 3: Scan Stok

```bash
GET /api/scan/barang/BRG-2024-0006
```

**Response:**

```json
{
  "barang": { ... },
  "total_stok": 110,
  "batches": [
    { "kode_batch": "BATCH-STL-001", "jumlah_sisa": 0, "expired_date": "2025-06-30" },
    { "kode_batch": "BATCH-STL-002", "jumlah_sisa": 30, "expired_date": "2025-12-31" },
    { "kode_batch": "BATCH-STL-003", "jumlah_sisa": 80, "expired_date": null }
  ]
}
```

---

## Notes

### FIFO Algorithm

- **Priority:** Batch dengan expired_date **paling dekat** diambil dulu
- **Null Handling:** Batch tanpa expired_date diambil **terakhir**
- **Same Date:** Jika expired_date sama, ambil batch yang lebih dulu masuk (created_at ASC)
- **Transaction:** Semua update batch dalam satu transaction untuk konsistensi

### Data Integrity

- Kode batch harus **unique** di seluruh database
- Tidak bisa hapus batch yang sudah tercatat (audit trail)
- `jumlah_masuk` = `jumlah_keluar` + `jumlah_sisa` (selalu konsisten)
- Mutasi detail mencatat semua batch yang terpakai

### Best Practices

1. **Selalu set expired_date** jika barang punya tanggal kadaluarsa
2. **Gunakan kode_batch yang deskriptif** (contoh: BATCH-APD-2024-001)
3. **Cek stok sebelum keluar** dengan endpoint scan
4. **Keterangan keluar harus jelas** untuk audit trail

---

## Testing dengan cURL

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

### Habis Pakai Masuk

```bash
curl -X POST http://localhost:5000/api/habis-pakai/masuk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nama_barang": "Masker N95",
    "kategori": "APD",
    "kode_batch": "BATCH-2024-001",
    "expired_date": "2026-12-31T00:00:00.000Z",
    "jumlah_masuk": 100,
    "harga_satuan": 50000
  }'
```

### Habis Pakai Keluar

```bash
curl -X POST http://localhost:5000/api/habis-pakai/keluar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "kode_barang": "BRG-2024-0005",
    "jumlah_keluar": 50,
    "keterangan": "Pengeluaran untuk Unit IGD"
  }'
```

### Scan Barang

```bash
curl -X GET http://localhost:5000/api/scan/barang/BRG-2024-0005 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Related Endpoints

- [Auth API](./AUTH_API_DOCS.md) - Login & Authentication
- [Barang API](./BARANG_API_DOCS.md) - Master Data Barang
- [Aset API](./ASET_API_DOCS.md) - Transaksi Aset

---

**Last Updated:** 2024-01-25  
**API Version:** 1.0.0
