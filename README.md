# Inventaris Barang RSJ - Backend API

Backend API untuk Sistem Inventaris Barang RSJ menggunakan Node.js + Express.js.

## 📦 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM untuk PostgreSQL
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables
- **Zod** - Schema validation
- **Nodemon** - Development auto-reload

## 📁 Struktur Folder

```
inventaris-barang-rsj-backend/
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma         # Prisma schema
│   ├── seed.js               # Database seeder
│   └── migrations/           # Migration history
├── src/
│   ├── config/                # Konfigurasi aplikasi
│   │   └── env.js            # Environment variables
│   ├── controllers/           # Request handlers (nanti)
│   ├── services/              # Business logic (nanti)
│   ├── routes/                # API routes
│   │   └── index.js          # Main routes
│   ├── validators/            # Request validation (nanti)
│   ├── middlewares/           # Express middlewares
│   │   └── error.middleware.js
│   ├── utils/                 # Utility functions
│   │   └── response.js       # Response helpers
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── .env                       # Environment variables (buat sendiri)
├── .env.example               # Template environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies & scripts
└── README.md                  # Dokumentasi
```

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
cd inventaris-barang-rsj-backend
npm install
```

### 2. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
copy .env.example .env
```

Edit file `.env` sesuai kebutuhan:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventaris_rsj?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

**Penting:** Sesuaikan `DATABASE_URL` dengan kredensial PostgreSQL Anda.

### 3. Setup Database

Pastikan PostgreSQL sudah terinstall dan berjalan, lalu buat database:

```sql
CREATE DATABASE inventaris_rsj;
```

Jalankan Prisma migration untuk membuat tabel:

```bash
npx prisma migrate dev --name init
```

Atau gunakan script:

```bash
npm run prisma:migrate
```

### 4. Seed Database

Jalankan seeder untuk membuat user default:

```bash
npm run prisma:seed
```

**User Default:**

- **Admin:** username: `admin`, password: `Admin123!`
- **Petugas:** username: `petugas`, password: `Petugas123!`

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Jalankan Server

**Development mode (dengan nodemon):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📌 API Endpoints

### Health Check

- **GET** `/api/health`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Server is running healthy",
    "data": {
      "status": "OK",
      "timestamp": "2026-01-28T10:30:00.000Z",
      "uptime": 123.456,
      "environment": "development",
      "service": "Inventaris Barang RSJ API",
      "version": "1.0.0"
    }
  }
  ```

### Welcome

- **GET** `/api/`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Welcome to Inventaris Barang RSJ API",
    "data": {
      "name": "Inventaris Barang RSJ API",
      "version": "1.0.0",
      "description": "Backend API untuk Sistem Inventaris Barang RSJ"
    }
  }
  ```

## ✅ Features (Step 1)

- ✅ Struktur folder backend yang rapi dan terorganisir
- ✅ Express.js server berjalan dengan baik
- ✅ CORS enabled untuk akses cross-origin
- ✅ dotenv untuk environment variables
- ✅ Response helper JSON standar
- ✅ Global error handler middleware
- ✅ Health check endpoint
- ✅ Request logging
- ✅ Graceful shutdown handling

## ✅ Features (Step 2)

- ✅ Prisma ORM terintegrasi dengan PostgreSQL
- ✅ Database schema lengkap (8 tabel)
- ✅ Enum types untuk data consistency
- ✅ Relational database design
- ✅ Database seeder dengan user default
- ✅ Password hashing dengan bcryptjs
- ✅ Migration system untuk version control database

## 📊 Database Schema

### Tabel Utama:

1. **users** - User management (Admin/Petugas)
2. **barang** - Master data barang (Aset/Habis Pakai)
3. **penerimaan_aset** - Batch penerimaan aset
4. **unit_aset** - Unit individual aset (dengan QR code)
5. **batch_habis_pakai** - Batch barang habis pakai (stok)
6. **mutasi** - Log transaksi masuk/keluar
7. **mutasi_detail_aset** - Detail mutasi untuk aset
8. **mutasi_detail_habis_pakai** - Detail mutasi untuk habis pakai

### Enum Types:

- `UserRole`: ADMIN, PETUGAS
- `JenisBarang`: ASET, HABIS_PAKAI
- `StatusUnitAset`: AKTIF, DIHAPUS
- `KondisiUnitAset`: BAIK, RUSAK, HILANG
- `TipeMutasi`: MASUK, KELUAR
- `TipeBarangMutasi`: ASET, HABIS_PAKAI

## 🛠️ Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Run seeder
npm run prisma:seed

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Reset database (drop all data)
npx prisma migrate reset
```

## 🔜 Next Steps

- [ ] Implementasi authentication & authorization (JWT)
- [ ] CRUD endpoints untuk semua entitas
- [ ] Upload & generate QR code untuk unit aset
- [ ] Business logic untuk mutasi barang
- [ ] Laporan dan statistik
- [ ] API documentation dengan Swagger

## 📝 Conventions

### Response Format

**Success Response:**

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]  // optional
}
```

**Paginated Response:**

```json
{
  "success": true,
  "message": "Success message",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 👨‍💻 Development

- Gunakan **CommonJS** (`require`/`module.exports`)
- Konsisten dengan penamaan file dan folder
- Gunakan **camelCase** untuk variabel dan fungsi
- Gunakan **PascalCase** untuk class names
- Tambahkan komentar JSDoc untuk dokumentasi fungsi

---

**Version:** 1.0.0  
**Last Updated:** January 28, 2026  
**Database:** PostgreSQL with Prisma ORM
