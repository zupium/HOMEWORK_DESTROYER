# 📚 BukuPintar AI - Asisten PR Berbasis Buku Paket Resmi

Aplikasi web modern berbasis AI yang dirancang untuk memecahkan masalah klasik pengerjaan tugas sekolah/kuliah: **jawaban PR yang wajib bersumber dan mengutip persis dari buku paket resmi**.

BukuPintar AI menggunakan teknik **RAG (Retrieval-Augmented Generation)** dan **Strict Grounding** dengan Google Gemini API untuk membaca teks buku pelajaran digital, mencocokkan soal dengan halaman buku yang tepat, dan memberikan jawaban resmi lengkap dengan **nomor halaman** dan **kutipan kalimat asli buku**.

---

## ✨ Fitur Unggulan

- 📖 **Perpustakaan Buku Bawaan**: Sudah dilengkapi modul materi buku pelajaran resmi Kurikulum Merdeka (Biologi SMA 11, Fisika SMA 10, Sejarah Indonesia SMA 11, PPKN SMA 10).
- 📤 **Upload Buku Digital Sendiri (PDF/TXT)**: Unggah file buku paket PDF sekolah kamu, sistem akan otomatis membaca dan mengindeks seluruh halamannya menjadi database pencarian AI.
- 🎯 **Pembeda Soal yang Mirip (Nuance Resolution)**: Seringkali ada dua soal PR yang terkesan mirip atau memiliki kata kunci serupa padahal menanyakan konsep yang berbeda di buku. AI memberikan catatan pembeda agar jawaban tidak tertukar.
- 🔖 **Kutipan Kalimat Asli & Halaman**: Setiap jawaban dilengkapi rujukan halaman dan kutipan persis dari teks buku untuk bukti tugas.
- 🎨 **Antarmuka Modern (Rich Aesthetics)**: Dark mode elegan dengan aksen glassmorphism, responsif di HP maupun laptop, animasi halus, dan tombol salin jawaban 1-klik.
- 🚀 **Vercel Ready**: Siap dipublikasikan ke Vercel hanya dalam 1 menit.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Serverless Functions)
- **Language**: TypeScript
- **Styling**: Modern Vanilla CSS (Glassmorphism, custom responsive theme)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (`@google/genai` SDK)
- **Document Engine**: `pdf-parse` untuk ekstraksi teks PDF digital
- **Icons**: `lucide-react`
- **Hosting**: [Vercel](https://vercel.com/)

---

## ⚡ Menjalankan Secara Lokal

1. **Clone atau buka folder**:
   ```bash
   cd "ai vercel"
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Buat file `.env.local`**:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
   *(Dapatkan gratis di [Google AI Studio](https://aistudio.google.com/app/apikey))*

4. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser kamu.

---

## 🌐 Deploy ke Vercel

Panduan lengkap langkah demi langkah untuk mempublikasikan website ini ke Vercel tersedia di file **[PANDUAN_DEPLOY_VERCEL.md](PANDUAN_DEPLOY_VERCEL.md)**.
