# React.js Production Best Practices Guide

Panduan komprehensif untuk membangun aplikasi **React.js (SPA / Vite)** yang skalabel, mudah di-*maintain*, berkinerja tinggi, dan siap produksi (*production-ready*).

## 1. Struktur Proyek Berbasis Fitur (Feature-Based Architecture)

Hindari mengelompokkan file hanya berdasarkan jenisnya (`components/`, `hooks/`, `utils/` secara datar) pada proyek menengah hingga besar. Gunakan struktur **Feature-Based** agar setiap modul domain terisolasi dengan rapi.

```text
src/
├── app/                        # Inisialisasi aplikasi, providers, dan konfigurasi router
│   ├── App.tsx
│   ├── providers.tsx           # QueryClientProvider, AuthProvider, ThemeProvider
│   └── router.tsx
├── components/                 # Komponen UI bersama (design system / reusable)
│   └── ui/                     # Button, Input, Modal, Table, Badge
├── features/                   # Modul berbasis fitur domain
│   └── products/
│       ├── api/                # API client & TanStack Query hooks khusus produk
│       ├── components/         # Komponen khusus fitur produk (ProductCard, ProductForm)
│       ├── hooks/              # Custom hooks spesifik produk
│       ├── schemas/            # Skema validasi Zod untuk form produk
│       ├── types/              # Tipe TypeScript spesifik produk
│       └── index.ts            # Public API dari fitur (barrel file terkontrol)
├── hooks/                      # Global custom hooks (useDebounce, useLocalStorage)
├── lib/                        # Konfigurasi library pihak ketiga (Axios instance, QueryClient)
├── utils/                      # Fungsi helper murni (formatCurrency, formatDate)
├── types/                      # Tipe TypeScript global
└── main.tsx                    # Entry point React DOM
```

> **Aturan Impor:** Fitur tidak boleh saling mengimpor file internal secara langsung; impor hanya melalui `index.ts` milik fitur tersebut atau pindahkan komponen bersama ke folder `src/components/`.

---

## 2. Desain Komponen & Prinsip Clean Code

### A. Single Responsibility & Komposisi
* Jaga ukuran komponen tetap ringkas (idealnya di bawah 150–200 baris). Jika komponen memiliki terlalu banyak tanggung jawab, pecah menjadi sub-komponen atau ekstrak logikanya ke dalam **Custom Hook**.
* Hindari *prop drilling* yang terlalu dalam (> 2–3 level). Gunakan **Component Composition** (`children` atau *slot props*) sebelum memutuskan menggunakan Context atau global state.

```tsx
// ✅ BENAR: Menggunakan komposisi agar tidak perlu meneruskan props ke banyak layer
function DashboardLayout({ header, sidebar, children }: DashboardLayoutProps) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>
        <header>{header}</header>
        <section>{children}</section>
      </main>
    </div>
  );
}
```

### B. Jangan Mendefinisikan Komponen di Dalam Komponen Lain
Mendeklarasikan komponen di dalam fungsi komponen induk menyebabkan komponen anak selalu di-*unmount* dan di-*mount* ulang pada setiap *re-render*, yang menghancurkan *state* lokal dan merusak fokus input.

---

## 3. State Management yang Tepat Sasaran

Pisahkan jenis *state* berdasarkan sumber dan masa hidupnya—jangan menaruh semua hal di dalam Redux atau Zustand.

| Jenis State | Solusi Terbaik | Contoh Kasus |
| :--- | :--- | :--- |
| **Server / Async State** | **TanStack Query (React Query)** / SWR | Data dari API, caching, pagination, background refetch |
| **URL State** | **React Router** / **nuqs** | Filter pencarian, halaman aktif (`?page=2`), tab aktif, modal ID |
| **Form State** | **React Hook Form** + **Zod** | Input form kompleks, validasi *real-time*, status *dirty/submitting* |
| **Local UI State** | `useState` / `useReducer` | Toggle dropdown, buka/tutup modal, input terkontrol sederhana |
| **Global Client State** | **Zustand** / React Context | Tema (dark/light), status sidebar, sesi autentikasi ringan |

### Prinsip Derived State (State Turunan)
**Jangan pernah menyinkronkan state menggunakan `useEffect`.** Jika sebuah nilai bisa dihitung dari `props` atau `state` yang sudah ada, hitung langsung saat proses *render*.

```tsx
// ❌ SALAH: Menyimpan state turunan dan menyinkronkannya lewat useEffect
const [items, setItems] = useState<CartItem[]>([]);
const [totalPrice, setTotalPrice] = useState(0);

useEffect(() => {
  setTotalPrice(items.reduce((sum, item) => sum + item.price * item.qty, 0));
}, [items]);

// ✅ BENAR: Hitung langsung saat render
const [items, setItems] = useState<CartItem[]>([]);
const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);
```

---

## 4. Penggunaan `useEffect` Secara Disiplin

`useEffect` adalah *escape hatch* untuk menyinkronkan komponen React dengan **sistem eksternal** (DOM API, WebSocket, timer, browser event listener)—bukan untuk alur logika aplikasi.

1. **Jangan gunakan `useEffect` untuk menangani event pengguna:** Logika seperti submit form atau klik tombol harus berada di dalam *event handler* (`onClick`, `onSubmit`).
2. **Jangan gunakan `useEffect` untuk *data fetching* mentah:** Gunakan **TanStack Query** agar otomatis menangani *race condition*, *caching*, *deduplication*, *retry*, dan pembatalan request (`AbortController`).
3. **Selalu bersihkan efek samping (*Cleanup Function*):** Hapus event listener, `setInterval`, atau langganan WebSocket di dalam fungsi `return () => { ... }`.

```tsx
// ✅ BENAR: Cleanup event listener pada window
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

---

## 5. Data Fetching & API Layer (TanStack Query + Axios/Fetch)

Pusatkan konfigurasi HTTP client di satu tempat dan bungkus setiap endpoint ke dalam custom hook TanStack Query dengan **Query Key Factory** yang konsisten.

```tsx
// src/features/products/api/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { Product, CreateProductInput } from '../types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export function useProducts(filters: { page: number; search?: string }) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<{ data: Product[]; total: number }>('/products', {
        params: filters,
        signal, // Otomatis membatalkan request saat query berubah/unmount
      });
      return data;
    },
    staleTime: 60 * 1000, // Data dianggap segar selama 1 menit
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductInput) => apiClient.post('/products', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

---

## 6. Form & Validasi dengan React Hook Form + Zod

Gunakan *uncontrolled components* melalui **React Hook Form** dan skema **Zod** untuk mencegah *re-render* seluruh form setiap kali pengguna mengetik satu huruf.

```tsx
// src/features/products/components/ProductForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  price: z.coerce.number().min(1000, 'Harga minimal Rp 1.000'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({ onSubmit }: { onSubmit: (data: ProductFormValues) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="name">Nama Produk</label>
        <input id="name" {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <span role="alert">{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="price">Harga</label>
        <input id="price" type="number" {...register('price')} aria-invalid={!!errors.price} />
        {errors.price && <span role="alert">{errors.price.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
      </button>
    </form>
  );
}
```

---

## 7. Optimasi Performa & Rendering

1. **Code Splitting & Route-Level Lazy Loading:**
   Gunakan `React.lazy()` dan `<Suspense>` untuk memecah *bundle* berdasarkan rute atau fitur berat (seperti halaman analitik, *chart*, atau *rich text editor*).
   ```tsx
   const AnalyticsPage = lazy(() => import('@/features/analytics/components/AnalyticsPage'));
   ```
2. **Stabilitas `key` pada List:**
   Selalu gunakan ID unik dan stabil dari data (`item.id`). **Jangan pernah** menggunakan indeks array (`index`) sebagai `key` pada daftar yang bisa diurutkan ulang, difilter, ditambah, atau dihapus.
3. **Virtualisasi List Besar:**
   Jika merender ribuan baris data sekaligus, gunakan `@tanstack/react-virtual` agar hanya elemen yang terlihat di layar (*viewport*) yang dirender ke DOM.
4. **Memoization yang Bijak:**
   Jangan membungkus setiap fungsi dan variabel dengan `useMemo` atau `useCallback` secara membabi buta. Gunakan hanya ketika:
   * Mengoper fungsi/objek ke komponen anak yang dibungkus `React.memo()`.
   * Melakukan komputasi berat yang terbukti lambat saat diukur dengan **React DevTools Profiler**.
   *(Catatan: Jika menggunakan React 19+ dengan React Compiler aktif, sebagian besar memoization manual sudah ditangani otomatis oleh compiler).*

---

## 8. Keamanan Frontend (Frontend Security)

1. **Jangan Simpan Token Sensitif di `localStorage`:**
   `localStorage` rentan dicuri jika terjadi serangan XSS. Simpan *access token* di memori aplikasi (variabel/state) dan simpan *refresh token* di dalam **HttpOnly, Secure, SameSite Cookie** yang dikelola oleh backend.
2. **Pencegahan XSS (`dangerouslySetInnerHTML`):**
   Hindari penggunaan `dangerouslySetInnerHTML`. Jika terpaksa merender konten HTML dari user/CMS, wajib lakukan sanitasi terlebih dahulu menggunakan **DOMPurify**.
3. **Environment Variables Publik:**
   Ingat bahwa semua variabel `VITE_*` atau `REACT_APP_*` akan tertanam di dalam *JavaScript bundle* dan dapat dilihat siapa saja melalui DevTools. Jangan pernah menaruh API secret di frontend.

---

## 9. Error Boundaries & Penanganan Error UI

Sediakan **Error Boundary** (menggunakan paket `react-error-boundary`) di level aplikasi dan di sekitar widget kritikal agar error runtime pada satu komponen tidak membuat seluruh layar menjadi putih (*White Screen of Death*).

```tsx
// src/app/App.tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div role="alert" className="p-6 text-center">
      <h2>Terjadi kesalahan pada tampilan ini.</h2>
      <pre className="text-sm text-red-600">{error.message}</pre>
      <button onClick={resetErrorBoundary}>Muat Ulang Bagian Ini</button>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AppRouter />
    </ErrorBoundary>
  );
}
```

---

## 10. Aksesibilitas (a11y) & Testing

### A. Aksesibilitas Dasar
* Gunakan elemen HTML semantik (`<button>`, `<nav>`, `<main>`, `<label>`, `<dialog>`) daripada `<div onClick={...}>`.
* Pastikan setiap elemen interaktif dapat diakses menggunakan keyboard (`Tab`, `Enter`, `Escape`) dan memiliki atribut `aria-label` jika tombol hanya berisi ikon.

### B. Strategi Testing (Testing Trophy)
* **Integration & Component Tests (Prioritas Utama):** Gunakan **Vitest** + **React Testing Library** untuk menguji perilaku komponen dari sudut pandang pengguna (`getByRole`, `getByLabelText`, `userEvent.click`), bukan menguji detail implementasi internal.
* **API Mocking:** Gunakan **MSW (Mock Service Worker)** untuk mencegat *request* jaringan saat pengujian komponen dan pengembangan lokal.
* **End-to-End (E2E) Tests:** Gunakan **Playwright** untuk menguji alur bisnis paling krusial (login, checkout, CRUD utama).

---

## Checklist Kesiapan Produksi (Production Readiness)

- [ ] Struktur proyek modular berbasis fitur (`src/features/*`) diterapkan.
- [ ] TypeScript `strict: true` aktif dan bebas dari tipe `any` yang tidak perlu.
- [ ] *Server state* dikelola oleh TanStack Query dengan pembatalan *request* (`AbortSignal`).
- [ ] Tidak ada *derived state* yang disinkronkan menggunakan `useEffect`.
- [ ] *Code splitting* (`React.lazy`) diterapkan pada rute utama untuk menjaga ukuran *initial bundle* tetap kecil.
- [ ] Seluruh daftar (*list*) menggunakan `key` unik yang stabil (bukan `index`).
- [ ] Token autentikasi sensitif tidak disimpan di `localStorage`.
- [ ] `ErrorBoundary` terpasang di level root maupun fitur kritikal.
- [ ] ESLint (`eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`) dan Prettier berjalan di CI/CD.