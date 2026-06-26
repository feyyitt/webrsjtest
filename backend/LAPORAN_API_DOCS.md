# API Documentation - Laporan Module

Dokumentasi lengkap untuk modul LAPORAN inventaris (khusus ADMIN).

## Base URL

```
http://localhost:5000/api
```

## Authentication & Authorization

Semua endpoint laporan memerlukan:

- Header: `Authorization: Bearer <token>`
- Role: **ADMIN** (hanya admin yang bisa akses)

---

## 1. Laporan Stok Keseluruhan

### Endpoint

```
GET /api/laporan/stok
```

### Description

Menampilkan laporan stok keseluruhan untuk ASET dan HABIS_PAKAI yang masih aktif.

- **ASET**: Menghitung jumlah unit dengan status AKTIF
- **HABIS_PAKAI**: Menjumlahkan stok tersedia (jumlah_sisa) dari semua batch

### Query Parameters

Tidak ada query parameter.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Laporan stok berhasil diambil",
  "data": {
    "aset": [
      {
        "kode_barang": "BRG-2024-0001",
        "nama_barang": "Laptop Dell Latitude",
        "kategori": "Elektronik",
        "merk": "Dell",
        "jenis_barang": "ASET",
        "satuan": "unit",
        "jumlah": 15
      },
      {
        "kode_barang": "BRG-2024-0002",
        "nama_barang": "Kursi Kantor",
        "kategori": "Furniture",
        "merk": "Informa",
        "jenis_barang": "ASET",
        "satuan": "unit",
        "jumlah": 50
      }
    ],
    "habis_pakai": [
      {
        "kode_barang": "BRG-2024-0003",
        "nama_barang": "Masker N95",
        "kategori": "APD",
        "merk": "3M",
        "jenis_barang": "HABIS_PAKAI",
        "satuan": "box",
        "jumlah": 230
      },
      {
        "kode_barang": "BRG-2024-0004",
        "nama_barang": "Sarung Tangan Latex",
        "kategori": "APD",
        "merk": "Sensi Gloves",
        "jenis_barang": "HABIS_PAKAI",
        "satuan": "box",
        "jumlah": 180
      }
    ],
    "ringkasan": {
      "total_jenis_aset": 2,
      "total_unit_aset": 65,
      "total_jenis_habis_pakai": 2,
      "total_stok_habis_pakai": 410
    }
  }
}
```

### Response Details

- `aset`: Array berisi semua barang jenis ASET dengan jumlah unit aktif
- `habis_pakai`: Array berisi semua barang jenis HABIS_PAKAI dengan total stok tersedia
- `ringkasan.total_jenis_aset`: Jumlah jenis/item barang ASET
- `ringkasan.total_unit_aset`: Total semua unit ASET yang aktif
- `ringkasan.total_jenis_habis_pakai`: Jumlah jenis/item barang HABIS_PAKAI
- `ringkasan.total_stok_habis_pakai`: Total semua stok HABIS_PAKAI

---

## 2. Rekap Per Kategori

### Endpoint

```
GET /api/laporan/rekap-kategori
GET /api/laporan/rekap-kategori?from=2024-01-01&to=2024-01-31
```

### Description

Menampilkan rekap transaksi masuk dan keluar per kategori barang. Dapat difilter berdasarkan periode tanggal.

### Query Parameters

| Parameter | Type                | Required | Description                            |
| --------- | ------------------- | -------- | -------------------------------------- |
| `from`    | string (YYYY-MM-DD) | No       | Tanggal mulai periode (default: semua) |
| `to`      | string (YYYY-MM-DD) | No       | Tanggal akhir periode (default: semua) |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Rekap per kategori berhasil diambil",
  "data": {
    "periode": {
      "dari": "2024-01-01",
      "sampai": "2024-01-31"
    },
    "data": [
      {
        "kategori": "Elektronik",
        "aset_masuk": 15,
        "aset_keluar": 3,
        "habis_pakai_masuk": 0,
        "habis_pakai_keluar": 0
      },
      {
        "kategori": "APD",
        "aset_masuk": 0,
        "aset_keluar": 0,
        "habis_pakai_masuk": 500,
        "habis_pakai_keluar": 120
      },
      {
        "kategori": "Furniture",
        "aset_masuk": 50,
        "aset_keluar": 0,
        "habis_pakai_masuk": 0,
        "habis_pakai_keluar": 0
      },
      {
        "kategori": "Tanpa Kategori",
        "aset_masuk": 5,
        "aset_keluar": 2,
        "habis_pakai_masuk": 100,
        "habis_pakai_keluar": 30
      }
    ],
    "ringkasan": {
      "total_aset_masuk": 70,
      "total_aset_keluar": 5,
      "total_habis_pakai_masuk": 600,
      "total_habis_pakai_keluar": 150
    }
  }
}
```

### Response Details

- `periode.dari`: Tanggal mulai filter (null jika tidak difilter)
- `periode.sampai`: Tanggal akhir filter (null jika tidak difilter)
- `data`: Array rekap per kategori dengan jumlah masuk/keluar untuk ASET (unit) dan HABIS_PAKAI (jumlah)
- `ringkasan`: Total keseluruhan semua kategori

### Error Response

**400 - Invalid Date Range**

```json
{
  "success": false,
  "message": "Tanggal dari harus lebih kecil atau sama dengan tanggal sampai"
}
```

---

## 3. Laporan Transaksi Masuk

### Endpoint

```
GET /api/laporan/masuk
GET /api/laporan/masuk?from=2024-01-01&to=2024-01-31
```

### Description

Menampilkan detail semua transaksi penerimaan barang (ASET & HABIS_PAKAI). Dapat difilter berdasarkan periode tanggal.

### Query Parameters

| Parameter | Type                | Required | Description                            |
| --------- | ------------------- | -------- | -------------------------------------- |
| `from`    | string (YYYY-MM-DD) | No       | Tanggal mulai periode (default: semua) |
| `to`      | string (YYYY-MM-DD) | No       | Tanggal akhir periode (default: semua) |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Laporan transaksi masuk berhasil diambil",
  "data": {
    "periode": {
      "dari": "2024-01-01",
      "sampai": "2024-01-31"
    },
    "data": [
      {
        "id": 5,
        "tanggal": "2024-01-25T10:30:00.000Z",
        "tipe_barang": "HABIS_PAKAI",
        "keterangan": "Penerimaan habis pakai Masker N95 batch BATCH-2024-003 sebanyak 100 box",
        "user": "Administrator",
        "detail_barang": [
          {
            "kode_barang": "BRG-2024-0005",
            "nama_barang": "Masker N95",
            "kategori": "APD",
            "jenis_barang": "HABIS_PAKAI",
            "satuan": "box",
            "jumlah": 100
          }
        ],
        "total_item": 100
      },
      {
        "id": 3,
        "tanggal": "2024-01-20T09:00:00.000Z",
        "tipe_barang": "ASET",
        "keterangan": "Penerimaan aset Laptop Dell Latitude tahun 2024 sebanyak 10 unit",
        "user": "Administrator",
        "detail_barang": [
          {
            "kode_barang": "BRG-2024-0001",
            "nama_barang": "Laptop Dell Latitude",
            "kategori": "Elektronik",
            "jenis_barang": "ASET",
            "satuan": "unit",
            "jumlah": 10
          }
        ],
        "total_item": 10
      }
    ],
    "ringkasan": {
      "total_transaksi": 2,
      "total_aset_masuk": 10,
      "total_habis_pakai_masuk": 100
    }
  }
}
```

### Response Details

- `data`: Array transaksi masuk, diurutkan dari yang terbaru (desc)
- `detail_barang`: Dikelompokkan per kode_barang jika dalam satu transaksi ada beberapa item yang sama
- `total_item`:
  - Untuk ASET: jumlah unit yang masuk
  - Untuk HABIS_PAKAI: total jumlah barang yang masuk
- `ringkasan.total_transaksi`: Jumlah transaksi masuk
- `ringkasan.total_aset_masuk`: Total unit aset yang masuk
- `ringkasan.total_habis_pakai_masuk`: Total jumlah habis pakai yang masuk

---

## 4. Laporan Transaksi Keluar

### Endpoint

```
GET /api/laporan/keluar
GET /api/laporan/keluar?from=2024-01-01&to=2024-01-31
```

### Description

Menampilkan detail semua transaksi pengeluaran barang (ASET & HABIS_PAKAI). Dapat difilter berdasarkan periode tanggal.

### Query Parameters

| Parameter | Type                | Required | Description                            |
| --------- | ------------------- | -------- | -------------------------------------- |
| `from`    | string (YYYY-MM-DD) | No       | Tanggal mulai periode (default: semua) |
| `to`      | string (YYYY-MM-DD) | No       | Tanggal akhir periode (default: semua) |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Laporan transaksi keluar berhasil diambil",
  "data": {
    "periode": {
      "dari": "2024-01-01",
      "sampai": "2024-01-31"
    },
    "data": [
      {
        "id": 8,
        "tanggal": "2024-01-28T14:20:00.000Z",
        "tipe_barang": "HABIS_PAKAI",
        "keterangan": "Pengeluaran habis pakai Masker N95 sebanyak 50 box - Pengeluaran untuk Unit IGD",
        "user": "Administrator",
        "detail_barang": [
          {
            "kode_barang": "BRG-2024-0005",
            "nama_barang": "Masker N95",
            "kategori": "APD",
            "jenis_barang": "HABIS_PAKAI",
            "satuan": "box",
            "jumlah": 50
          }
        ],
        "total_item": 50
      },
      {
        "id": 6,
        "tanggal": "2024-01-22T11:15:00.000Z",
        "tipe_barang": "ASET",
        "keterangan": "Pengeluaran aset - Unit rusak/dihapus",
        "user": "Administrator",
        "detail_barang": [
          {
            "kode_barang": "BRG-2024-0001",
            "nama_barang": "Laptop Dell Latitude",
            "kategori": "Elektronik",
            "jenis_barang": "ASET",
            "satuan": "unit",
            "jumlah": 2
          }
        ],
        "total_item": 2
      }
    ],
    "ringkasan": {
      "total_transaksi": 2,
      "total_aset_keluar": 2,
      "total_habis_pakai_keluar": 50
    }
  }
}
```

### Response Details

- Format response sama dengan laporan masuk
- `data`: Array transaksi keluar, diurutkan dari yang terbaru (desc)
- `ringkasan.total_aset_keluar`: Total unit aset yang keluar
- `ringkasan.total_habis_pakai_keluar`: Total jumlah habis pakai yang keluar

---

## Use Case Examples

### Example 1: Cek Stok Keseluruhan

**Request:**

```bash
GET /api/laporan/stok
```

**Use Case:**
Admin ingin melihat gambaran keseluruhan stok yang tersedia di rumah sakit.

**Result:**

- Lihat berapa unit laptop yang masih aktif
- Lihat berapa box masker yang tersedia (dari semua batch)
- Total keseluruhan untuk perencanaan pengadaan

### Example 2: Rekap Bulanan Per Kategori

**Request:**

```bash
GET /api/laporan/rekap-kategori?from=2024-01-01&to=2024-01-31
```

**Use Case:**
Admin ingin membuat laporan bulanan untuk mengetahui pergerakan barang per kategori di bulan Januari 2024.

**Result:**

- Kategori Elektronik: 15 unit masuk, 3 unit keluar
- Kategori APD: 500 box masuk, 120 box keluar
- Kategori Furniture: 50 unit masuk, 0 unit keluar

### Example 3: Audit Transaksi Masuk

**Request:**

```bash
GET /api/laporan/masuk?from=2024-01-20&to=2024-01-25
```

**Use Case:**
Admin ingin mengaudit semua penerimaan barang dalam periode tertentu untuk verifikasi dengan purchase order.

**Result:**

- List detail transaksi dengan tanggal, user yang input, dan keterangan
- Bisa cross-check dengan dokumen pembelian

### Example 4: Monitoring Pengeluaran Habis Pakai

**Request:**

```bash
GET /api/laporan/keluar?from=2024-01-01&to=2024-01-31
```

**Use Case:**
Admin ingin melihat pola pengeluaran barang habis pakai untuk perencanaan stok.

**Result:**

- Detail pengeluaran per tanggal
- Bisa analisis unit mana yang paling banyak pakai
- Estimasi kebutuhan bulan depan

---

## Testing dengan cURL

### Login sebagai Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

### Laporan Stok

```bash
curl -X GET http://localhost:5000/api/laporan/stok \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Rekap Kategori (dengan filter)

```bash
curl -X GET "http://localhost:5000/api/laporan/rekap-kategori?from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Laporan Masuk (semua periode)

```bash
curl -X GET http://localhost:5000/api/laporan/masuk \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Laporan Keluar (dengan filter)

```bash
curl -X GET "http://localhost:5000/api/laporan/keluar?from=2024-01-15&to=2024-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Notes

### Authorization

- Semua endpoint **hanya bisa diakses oleh ADMIN**
- Jika user dengan role PETUGAS mencoba akses, akan mendapat response **403 Forbidden**
- Token JWT harus valid dan belum expired

### Performance

- Query menggunakan Prisma dengan `include` dan `select` yang efisien
- Untuk laporan dengan periode tanggal panjang, response mungkin memakan waktu lebih lama
- Pertimbangkan untuk implementasi pagination jika data sangat besar

### Date Format

- Format tanggal: **YYYY-MM-DD** (contoh: 2024-01-15)
- Parameter `to` otomatis diset ke akhir hari (23:59:59.999) untuk mencakup seluruh hari tersebut
- Timezone mengikuti server timezone

### Data Consistency

- Laporan diambil dari tabel `mutasi` yang mencatat semua transaksi
- Data real-time (tidak ada caching)
- Detail barang di-grouping berdasarkan `kode_barang` untuk kemudahan baca

### Best Practices

1. **Filter by Date**: Gunakan filter tanggal untuk laporan periode tertentu
2. **Export Data**: Response JSON bisa diproses untuk export ke Excel/PDF
3. **Regular Check**: Cek laporan stok secara berkala untuk monitoring
4. **Audit Trail**: Gunakan laporan masuk/keluar untuk audit trail lengkap

---

## Error Responses

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Token tidak valid atau sudah expired"
}
```

### 403 - Forbidden (Non-Admin)

```json
{
  "success": false,
  "message": "Akses ditolak. Hanya ADMIN yang dapat mengakses."
}
```

### 400 - Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "from",
      "message": "Format tanggal harus YYYY-MM-DD"
    }
  ]
}
```

---

## Related Endpoints

- [Auth API](./AUTH_API_DOCS.md) - Login & Authentication
- [Barang API](./BARANG_API_DOCS.md) - Master Data Barang
- [Aset API](./ASET_API_DOCS.md) - Transaksi Aset
- [Habis Pakai API](./HABIS_PAKAI_API_DOCS.md) - Transaksi Habis Pakai

---

**Last Updated:** 2024-01-29  
**API Version:** 1.0.0
