# Tebak Lokasi — Gereja Yesus Sejati

Game web mirip GeoGuessr, *mobile first*. Pemain melihat Street View di depan salah satu cabang Gereja Yesus Sejati di dunia, lalu menaruh pin di peta. Poin dihitung dari jarak tebakan ke lokasi sebenarnya.

Semuanya gratis: tanpa Google Maps API key, tanpa billing. Papan skor online (Supabase) opsional.

## Jalankan di komputer

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit test (Vitest)
npm run build      # cek TypeScript + build ke dist/
npm run preview    # coba hasil build
```

## Data lokasi

- `public/locations.json`: daftar lokasi hasil kurasi. Buka `kurasi-lokasi.html` di browser, tandai ✓ Pakai, lalu klik **Export locations.json** dan simpan ke folder `public/`.
- `public/candidates.json`: dipakai otomatis kalau `locations.json` tidak ada atau kosong.
- `locations.json` bawaan repo (67 lokasi, 37 negara) = semua kandidat, **dikurangi** yang dicek pada 14 Nov 2026 dan ternyata bermasalah:
  - *No Street View available*: Brunei House of Prayer, Lautoka (Fiji), Georgia Place of Worship, Agoro & Bugengi (Kenya), Liberia Church, Macau Worship Place, Myanmar Church, East Auckland (NZ), Sierra Leone Church, Tanzania Church, Maemor/Likai/Phrankratai (Thailand), Accra (Ghana), Uganda Church.
  - Foto di dalam ruangan (tidak ada petunjuk lokasi): Goma (DR Congo), Hamburg (Jerman), Zurich (Swiss).

  Lokasi-lokasi ini bisa diselamatkan lewat `kurasi-lokasi.html`: cari panorama terdekat di Google Maps, lalu tempel URL *Share → Embed a map*.
- `embed` boleh berupa URL `...output=svembed` atau `https://www.google.com/maps/embed?pb=...` (hasil *Share → Embed a map*). Kalau yang ditempel adalah kode `<iframe ...>` lengkap, `src`-nya diambil otomatis.
- `lat`/`lng` adalah titik jawaban.
- Kalau ada negara baru, tambahkan di `src/data/countries.ts`. `npm test` akan gagal kalau ada `country` yang belum terdaftar.

## Pengaturan

| Apa | Di mana |
| --- | --- |
| Jumlah ronde (10), durasi ronde (90 detik), rumus skor | `src/lib/game.ts` |
| Sumber tile peta | `src/lib/mapConfig.ts` (`TILE`) |
| Ukuran overlay penutup kartu alamat | `src/styles.css` (`--leak-w`, `--leak-h`) |

Urutan lokasi ditentukan oleh **Kode Ruangan**. Kode sama berarti lokasi dan urutan sama untuk semua pemain. Untuk sesi baru dengan lokasi berbeda, host cukup memakai kode lain (misalnya `TJC2`).

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di Vercel: **Add New → Project**, import repo. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Deploy, lalu bagikan link ke pemain (bisa lewat QR code di layar).

Alternatif:
- **Netlify**: jalankan `npm run build`, lalu drag-and-drop folder `dist` ke app.netlify.com/drop.
- **GitHub Pages**: `base` di `vite.config.ts` sudah `./`, jadi folder `dist` bisa langsung dipasang di subfolder mana pun.

## Papan skor online (opsional, Supabase)

1. Buat project gratis di supabase.com (tidak perlu kartu kredit).
2. Buka **SQL Editor**, tempel isi `supabase/schema.sql`, lalu **Run**.
3. Buka **Project Settings → API**. Salin **Project URL** dan **anon / publishable key**.
4. Di Vercel: **Settings → Environment Variables**, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`, lalu **Redeploy**. Untuk lokal, salin `.env.example` ke `.env`.

Kalau env kosong, game tetap jalan penuh. Papan skor hanya menampilkan pesan bahwa fitur ini belum diatur.

Papan skor untuk proyektor: `https://<domain>/#/board?room=TJC`. Data diperbarui tiap 5 detik; tiap nama hanya ditampilkan dengan skor terbaiknya.

## Checklist sebelum acara

- [ ] `npm test` dan `npm run build` lolos.
- [ ] Buka link Vercel di HP sungguhan (iPhone dan Android), main satu ronde.
- [ ] Cek pojok kiri atas Street View: kartu alamat Google harus tertutup kotak "Ronde x/10". Kalau masih kelihatan, perbesar `--leak-w` / `--leak-h`.
- [ ] Kalau pakai Supabase: selesaikan satu game, lalu cek skornya muncul di `#/board`.

## Keputusan yang diambil (dan alasannya)

- **Tile peta pakai OpenStreetMap standar, bukan CARTO Voyager.** Per November 2026, tile CARTO tanpa key hanya menampilkan watermark "API KEY REQUIRED". Akibatnya label peta memakai bahasa lokal (mis. 日本, Россия). Alternatif berlabel Latin ada di komentar `src/lib/mapConfig.ts`.
- **Fullscreen di dalam iframe Street View dimatikan.** Mode fullscreen milik iframe akan menyembunyikan overlay penutup kartu alamat. Iframe sudah memenuhi layar, jadi tidak ada yang hilang. Bisa diaktifkan lagi lewat `ALLOW_IFRAME_FULLSCREEN` di `src/screens/Round.tsx`.
- **Rata-rata jarak**: ronde yang tidak ditebak dihitung 20.000 km (kira-kira setengah keliling bumi).
- **Refresh di tengah game**: progres tersimpan di `localStorage`, jadi pemain kembali ke ronde yang sama. Timer tidak di-reset, supaya refresh tidak bisa dipakai untuk menambah waktu. Pin yang belum dikirim akan hilang.
- **Main Lagi dengan kode sama tidak mengirim skor lagi**, karena lokasinya sudah ketahuan. Skor pertama yang tercatat.
- **Bottom sheet tidak bisa ditutup dengan swipe**, hanya dengan tombol ✕ Tutup, supaya geser peta tidak menutupnya.
- Uji Jakarta–Singapura: pusat kota ke pusat kota sekitar 905 km. Angka "880 km" di brief adalah perkiraan, jadi batas tes dibuat 860–910 km.
