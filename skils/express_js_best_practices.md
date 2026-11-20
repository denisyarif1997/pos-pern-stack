# Express.js Production Best Practices Guide (with ORM Integration)

Panduan komprehensif untuk membangun aplikasi Express.js yang *scalable*, aman, mudah di-*maintain*, dan siap produksi (*production-ready*), lengkap dengan standar integrasi **ORM (Prisma / Drizzle / Mongoose)**.

---

## 1. Struktur Proyek & Arsitektur (Layered Architecture)

Hindari menaruh seluruh logika bisnis maupun query database di dalam file *route* atau *controller*. Pisahkan tanggung jawab kode (*Separation of Concerns*) menggunakan pola **Controller – Service – Repository (Data Access)**.

```text
src/
├── config/             # Konfigurasi environment, database client, logger
├── controllers/        # Menerima req, memanggil service, mengirim res
├── services/           # Logika bisnis murni (tanpa objek req/res Express)
├── repositories/       # Abstraksi query database / ORM (Prisma, Drizzle, Mongoose)
├── middlewares/        # Auth, error handler, rate limiter, validation
├── routes/             # Definisi endpoint & pemetaan ke controller
├── validators/         # Skema validasi input (Zod / Joi)
├── utils/              # Helper functions & custom error classes
├── types/              # Definisi tipe data (jika menggunakan TypeScript)
├── app.js              # Inisialisasi aplikasi Express & global middlewares
└── server.js           # Entry point (listen port & graceful shutdown)
```

> **Prinsip Utama:** `app.js` dan `server.js` harus dipisah agar aplikasi dapat diimpor langsung saat pengujian (*integration testing* dengan Supertest) tanpa harus menyalakan server HTTP.

---

## 2. Manajemen Konfigurasi & Environment

Jangan pernah melakukan *hardcode* kredensial, API key, atau URL database di dalam kode. Validasi variabel `.env` sejak aplikasi pertama kali dijalankan (*fail-fast*).

```javascript
// src/config/env.js
import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
```

---

## 3. Keamanan (Security Hardening)

### A. HTTP Security Headers (`helmet`)
Gunakan `helmet` untuk mengamankan header HTTP dari kerentanan umum seperti XSS, *clickjacking*, dan *MIME-sniffing*, serta matikan header `X-Powered-By`.

```javascript
import helmet from 'helmet';

app.disable('x-powered-by');
app.use(helmet());
```

### B. Konfigurasi CORS yang Ketat
Jangan biarkan `origin: '*'` di lingkungan produksi jika API menggunakan *cookie* atau autentikasi sensitif.

```javascript
import cors from 'cors';
import { env } from './config/env.js';

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);
```

### C. Rate Limiting & Pembatasan Ukuran Payload
Lindungi server dari serangan *Brute Force* dan *Denial of Service* (DoS) dengan membatasi jumlah permintaan dan ukuran *body* JSON.

```javascript
import express from 'express';
import rateLimit from 'express-rate-limit';

// Batasi ukuran payload body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiter global
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Terlalu banyak permintaan, coba lagi nanti.' },
});

app.use('/api', apiLimiter);
```

### D. Autentikasi & Cookies
* Gunakan **HttpOnly**, **Secure**, dan **SameSite=Strict** (atau `Lax`) saat menyimpan *refresh token* di dalam *cookie*.
* Gunakan `bcrypt` atau `argon2` untuk *hashing* password (jangan pernah menggunakan MD5/SHA1).

---

## 4. Validasi Input & Sanitasi

Jangan pernah mempercayai data dari `req.body`, `req.query`, maupun `req.params`. Gunakan middleware validasi berbasis skema seperti **Zod** atau **Joi**.

```javascript
// src/middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validasi gagal',
      errors: result.error.flatten().fieldErrors,
    });
  }

  // Timpa dengan data yang sudah tervalidasi & ter-parse
  req.validated = result.data;
  next();
};
```

---

## 5. ORM & Database Best Practices

Menggunakan ORM modern seperti **Prisma**, **Drizzle ORM**, atau **Mongoose** membantu mencegah SQL/NoSQL Injection, menjaga *type-safety*, dan mempermudah migrasi skema.

### A. Singleton Database Client & Connection Pooling
Jangan pernah membuat instansiasi client database baru di dalam setiap *request*. Gunakan pola **Singleton** agar *connection pool* digunakan kembali secara efisien.

```javascript
// src/config/db.js (Contoh menggunakan Prisma)
import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### B. Pola Repository & Pencegahan Over-Fetching
Isolasi query ORM di lapisan `repositories/`. Selalu gunakan `select` atau proyeksi kolom untuk menghindari pengambilan kolom sensitif (seperti `passwordHash`) dan menghemat bandwidth.

```javascript
// src/repositories/user.repository.js
import { prisma } from '../config/db.js';

export const userRepository = {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // passwordHash sengaja tidak di-select
      },
    });
  },

  async findManyPaginated({ page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true },
      }),
      prisma.user.count(),
    ]);

    return { items, total, page, limit };
  },
};
```

### C. Database Transactions (ACID)
Setiap operasi yang mengubah lebih dari satu tabel/koleksi secara bersamaan (misalnya membuat pesanan + mengurangi stok + mencatat pembayaran) **wajib** dibungkus dalam *transaction* agar tidak terjadi inkonsistensi data jika salah satu gagal.

```javascript
// Contoh Transaction di Service/Repository
export async function createOrderWithItems(userId, items, totalAmount) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: { userId, totalAmount, status: 'PENDING' },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return order;
  });
}
```

### D. Aturan Emas ORM di Produksi
1. **Hindari N+1 Query Problem:** Gunakan *eager loading* (`include` di Prisma, `with` di Drizzle, atau `.populate()` di Mongoose) daripada melakukan query di dalam perulangan `for` / `map`.
2. **Gunakan Indexing:** Tambahkan `@index` / `@@index` pada kolom yang sering dipakai di klausa `WHERE`, `ORDER BY`, dan *foreign key*.
3. **Migrasi Skema Terkontrol:** Gunakan `prisma migrate deploy` atau `drizzle-kit migrate` pada pipeline CI/CD produksi. **Jangan pernah** menggunakan `db push` atau `synchronize: true` di produksi.
4. **Soft Delete jika Diperlukan:** Gunakan kolom `deletedAt` (`DateTime?`) untuk data kritikal (transaksi, user, audit log) alih-alih menghapus baris secara permanen.
5. **Hindari Raw Query Tanpa Parameter:** Jika terpaksa menggunakan raw SQL, gunakan *tagged template literals* (`prisma.$queryRaw\`SELECT * FROM users WHERE id = ${id}\``) yang otomatis terparameterisasi—jangan gunakan penggabungan string (`+` atau `${}` biasa).

---

## 6. Penanganan Error Terpusat (Centralized Error Handling)

### A. Custom Operational Error Class
Bedakan antara **Operational Error** (kesalahan terprediksi seperti input salah, data tidak ditemukan) dan **Programmer Error** (*bug* kode).

```javascript
// src/utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
```

### B. Penanganan Error Spesifik ORM
Terjemahkan kode error internal database/ORM menjadi respons HTTP yang ramah dan aman (tidak membocorkan nama tabel atau struktur database).

```javascript
// Contoh pemetaan error Prisma di dalam errorHandler
function handleORMError(err) {
  // P2002: Unique constraint violation (misal: email sudah terdaftar)
  if (err.code === 'P2002') {
    const target = err.meta?.target?.join(', ') || 'field';
    return new AppError(`Data pada ${target} sudah digunakan.`, 409);
  }

  // P2025: Record not found
  if (err.code === 'P2025') {
    return new AppError('Data yang diminta tidak ditemukan.', 404);
  }

  return err;
}
```

### C. Global Error Middleware
Letakkan middleware ini di urutan **paling bawah** setelah semua *route* didaftarkan.

```javascript
// src/middlewares/errorHandler.js
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const error = handleORMError(err);
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  logger.error({
    message: error.message,
    code: error.code,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (env.NODE_ENV === 'production' && !error.isOperational) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal pada server.',
    });
  }

  res.status(statusCode).json({
    status,
    message: error.message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
```

---

## 7. Standarisasi Response API & Versioning

Gunakan format respons JSON yang konsisten di seluruh *endpoint* dan terapkan **API Versioning** sejak awal.

```javascript
// Contoh struktur response sukses dengan pagination
{
  "status": "success",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

* Daftarkan *route* dengan awalan versi: `app.use('/api/v1', v1Routes);`.
* Sediakan endpoint `/health` yang juga mengecek konektivitas database untuk pemantauan infrastruktur (*load balancer* / Docker / Kubernetes).

```javascript
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});
```

---

## 8. Performa & Optimasi

1. **Hindari Operasi Sinkron (Blocking Event Loop):** Jangan pernah menggunakan fungsi `*Sync` seperti `fs.readFileSync` atau `crypto.pbkdf2Sync` di dalam *request handler*.
2. **Kompresi Response:** Gunakan `compression` (atau biarkan *reverse proxy* seperti Nginx/Cloudflare yang menanganinya).
3. **Wajib Pagination:** Jangan pernah mengembalikan seluruh isi tabel (`findMany()` tanpa `take`/`limit`) pada endpoint publik.
4. **Caching:** Gunakan Redis untuk menyimpan hasil query ORM yang berat dan sering dibaca tetapi jarang berubah.
5. **Reverse Proxy & Process Manager:** Di produksi, jalankan Express di belakang **Nginx** atau **Caddy**, dan aktifkan `app.set('trust proxy', 1)` agar pembacaan IP klien dan protokol HTTPS akurat.

---

## 9. Structured Logging & Observability

Hindari penggunaan `console.log()` di produksi karena bersifat sinkron dan sulit dianalisis. Gunakan logger terstruktur berbasis JSON seperti **Pino** atau **Winston**, lengkap dengan penyensoran data sensitif.

```javascript
// src/utils/logger.js
import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: ['req.headers.authorization', 'req.body.password', 'req.body.token'],
});
```

---

## 10. Graceful Shutdown & Uncaught Exceptions

Pastikan server menutup koneksi HTTP aktif dan *connection pool* ORM/database dengan rapi saat menerima sinyal terminasi (`SIGTERM` / `SIGINT` dari Docker, PM2, atau Kubernetes).

```javascript
// src/server.js
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server berjalan di port ${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal) => {
  logger.info(`Menerima sinyal ${signal}. Menutup server dengan rapi...`);
  server.close(async () => {
    logger.info('Koneksi HTTP ditutup.');
    await prisma.$disconnect();
    logger.info('Koneksi database ditutup.');
    process.exit(0);
  });

  // Paksa keluar jika melebihi 10 detik
  setTimeout(() => {
    logger.error('Gagal menutup koneksi tepat waktu, memaksa keluar.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled Rejection');
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  process.exit(1);
});
```

---

## 11. Testing & Quality Assurance

* **Unit Test:** Uji lapisan `services/` secara terisolasi menggunakan **Vitest** atau **Jest** dengan melakukan *mock* pada lapisan `repositories/`.
* **Integration Test:** Uji alur *endpoint* secara menyeluruh dari *route* hingga database menggunakan **Supertest** dan database khusus testing (misalnya via Docker / Testcontainers).
* **Linting & Formatting:** Wajibkan **ESLint** dan **Prettier** melalui *pre-commit hook* (Husky + lint-staged) sebelum kode masuk ke repositori.

---

## Checklist Kesiapan Produksi (Production Readiness)

- [ ] `NODE_ENV=production` sudah diatur.
- [ ] Seluruh variabel `.env` tervalidasi saat startup.
- [ ] `helmet`, `cors`, dan `express-rate-limit` aktif.
- [ ] Ukuran *request body* dibatasi (`limit: '10kb'`).
- [ ] Seluruh input (`body`, `params`, `query`) divalidasi dengan skema.
- [ ] Koneksi ORM menggunakan pola *Singleton* dengan *connection pooling*.
- [ ] Query database terisolasi di `repositories/`, terbebas dari *N+1 query*, dan menerapkan *pagination*.
- [ ] Operasi multi-tabel menggunakan *database transaction*.
- [ ] Error spesifik ORM dipetakan ke kode status HTTP yang aman tanpa membocorkan struktur tabel.
- [ ] Endpoint `/health` memverifikasi koneksi database.
- [ ] *Graceful shutdown* menutup server HTTP sekaligus memutus koneksi ORM (`$disconnect()`).