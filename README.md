# Ifadah Aulia — Portfolio

Portofolio pribadi dibangun dengan React + Vite + Three.js (tanpa framework tambahan seperti Tailwind/Next.js — semua styling ditulis inline & dalam tag `<style>` per komponen).

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Lalu buka `http://localhost:5173` di browser.

## Build untuk produksi

```bash
npm run build
```

Hasil build ada di folder `dist/` — folder ini bisa langsung di-deploy ke Vercel, Netlify, GitHub Pages, atau hosting statis apa pun.

## Struktur proyek

```
├── index.html          # entry point HTML
├── src/
│   ├── main.jsx        # entry point React
│   ├── index.css       # reset CSS dasar
│   └── App.jsx         # seluruh halaman portofolio (nav, hero, about, projects, skills, contact)
├── package.json
└── vite.config.js
```

## Catatan teknis

- **Hero**: latar animasi "GLSL hills" dibuat dengan Three.js (noise-displaced terrain), dengan detail geometry otomatis dikurangi di layar < 640px demi performa.
- **Grid kinetik**: latar belakang grid pada section About/Projects/Skills/Contact bereaksi terhadap posisi kursor (mouse) maupun sentuhan jari (mobile).
- **Scramble text**: efek "decode" pada judul "that feel alive" dibuat dengan React state + `setInterval` murni (tanpa dependency `motion/react`).
- **Logo marquee**: baris logo tools yang scroll otomatis di section Skills, dibuat dengan animasi CSS murni (tanpa `motion/react` / `react-use-measure`), logo diambil dari CDN Simple Icons.
- **Responsif**: nav berubah jadi hamburger menu di layar < 640px; seluruh grid/layout menyesuaikan ke 1 kolom di mobile.

## Mengganti konten

Semua teks (nama, email, deskripsi proyek, skill, dsb) ada langsung di dalam `src/App.jsx` — cari komponen terkait (`HeroSection`, `AboutSection`, `ProjectsSection`, `SkillsSection`, `ContactSection`) dan edit sesuai kebutuhan.

Gambar proyek di section "Selected work" saat ini masih berupa panel gradient placeholder (bukan screenshot asli) — ganti dengan gambar sungguhan sesuai kebutuhan.
