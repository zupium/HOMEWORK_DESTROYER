# 🚀 Panduan Lengkap Deploy BukuPintar AI ke Vercel

Aplikasi **BukuPintar AI** dibuat menggunakan **Next.js**, framework resmi yang dikembangkan langsung oleh tim Vercel. Oleh karena itu, proses deploy ke Vercel sangat cepat, otomatis, dan 100% gratis!

---

## 📋 Persiapan Awal (Hanya Butuh 2 Hal)

1. **Akun GitHub**: [github.com](https://github.com/) (Gratis)
2. **Akun Vercel**: [vercel.com](https://vercel.com/) (Bisa langsung login menggunakan akun GitHub kamu)
3. **Google Gemini API Key**: Dapatkan secara gratis di [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🌟 Metode 1: Deploy via GitHub & Vercel Dashboard (Paling Direkomendasikan)

Ini adalah cara standar industri. Setiap kali kamu mengupdate buku atau kode di GitHub, Vercel akan otomatis meng-update web kamu secara live!

### Langkah 1: Inisialisasi Git & Upload ke GitHub

Buka terminal (PowerShell) di folder proyek ini (`d:\gandhi\ai vercel`):

```powershell
# 1. Masuk ke folder proyek
cd "d:\gandhi\ai vercel"

# 2. Inisialisasi Git (jika belum)
git init
git add .
git commit -m "Inisialisasi Proyek BukuPintar AI"
git branch -M main

# 3. Buat repositori baru di github.com/new (beri nama misalnya: bukupintar-ai)
# Kemudian hubungkan dan push (ganti USERNAME_KAMU dengan username GitHub kamu):
git remote add origin https://github.com/USERNAME_KAMU/bukupintar-ai.git
git push -u origin main
```

*(Tips: Jika kamu memakai aplikasi **GitHub Desktop**, kamu cukup pilih `File -> Add Local Repository`, arahkan ke `d:\gandhi\ai vercel`, lalu klik **Publish repository**).*

---

### Langkah 2: Import Proyek di Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub kamu.
2. Di dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Di daftar repositori GitHub kamu, cari **`bukupintar-ai`** lalu klik tombol **"Import"**.

---

### Langkah 3: Pengaturan Environment Variable (API Key)

Sebelum menekan tombol Deploy, atur API Key agar AI bisa langsung aktif untuk semua pengunjung:

1. Di halaman konfigurasi Vercel, buka menu **"Environment Variables"** (klik panah dropdown-nya).
2. Isi kolom formulir:
   * **Key (Nama)**: `GEMINI_API_KEY`
   * **Value (Isi)**: Masukkan API Key kamu (dimulai dengan `AIzaSy...`)
3. Klik tombol **"Add"**.

> *Catatan: Jika kamu tidak memasukkan API Key di langkah ini, aplikasi tetap bisa dibuka! Pengguna nanti bisa memasukkan API Key sendiri melalui tombol "Atur API Key" di pojok kanan atas website.*

---

### Langkah 4: Klik Deploy! 🎉

1. Klik tombol warna biru **"Deploy"**.
2. Tunggu sekitar 45 - 60 detik. Vercel akan meng-compile Next.js secara otomatis.
3. Setelah selesai, akan muncul animasi konfeti dan tautan website kamu:
   👉 **`https://bukupintar-ai.vercel.app`** (atau nama unik yang diberikan Vercel).
4. Selesai! Website kamu sudah live dan bisa dibuka dari HP, tablet, maupun laptop teman-temanmu!

---

## ⚡ Metode 2: Deploy Cepat via Terminal (Vercel CLI)

Jika kamu lebih suka deploy langsung dari terminal tanpa membuka web GitHub:

1. Buka terminal di folder `d:\gandhi\ai vercel`:
   ```powershell
   npx vercel login
   ```
   *(Pilih Login with GitHub di browser yang terbuka).*

2. Jalankan perintah deploy:
   ```powershell
   npx vercel
   ```
   Tekan `Enter` untuk menyetujui semua pengaturan default:
   * *Set up and deploy?* -> `Y`
   * *Which scope?* -> pilih akunmu
   * *Link to existing project?* -> `N`
   * *Project name?* -> `bukupintar-ai`
   * *In which directory?* -> `./`

3. Tambahkan environment variable Gemini API Key:
   ```powershell
   npx vercel env add GEMINI_API_KEY
   ```
   *(Paste API Key kamu saat diminta, lalu pilih Environment: Production, Preview, Development).*

4. Deploy ke domain produksi publik:
   ```powershell
   npx vercel --prod
   ```

---

## 🔑 Cara Mendapatkan Google Gemini API Key Gratis

1. Kunjungi website [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Login dengan akun Google / Gmail kamu.
3. Klik tombol biru **"Create API key"**.
4. Pilih **"Create API key in new project"**.
5. Salin kode API key yang muncul (contoh: `AIzaSyD...`).
6. API key ini gratis untuk ribuan kali request per hari dan siap digunakan!

---

## 💡 Cara Menggunakan BukuPintar AI untuk PR Kamu

1. **Pilih Buku Pelajaran**: Di panel sebelah kiri, pilih buku yang sesuai dengan mata pelajaran PR kamu (misalnya *Biologi SMA Kelas 11* atau *Fisika SMA Kelas 10*).
2. **Ketik Soal PR**: Masukkan soal PR yang kamu dapatkan.
3. **Lihat Hasil**:
   * **Jawaban Resmi**: Disusun sistematis dan siap disalin ke buku tugas.
   * **Kutipan Buku & Halaman**: Bukti otentik halaman bab buku paket untuk guru.
   * **Pembeda Soal Serupa**: Menjelaskan jebakan konsep agar kamu tidak keliru membedakan 2 istilah yang mirip!
4. **Upload Buku Sendiri**: Klik tombol **"+ Upload PDF"** jika kamu punya file PDF buku paket pelajaran lain dari Kemdikbud / sekolah. AI akan otomatis mengindeks seluruh isi bukunya!
