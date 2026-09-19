import { Book, BookSection } from './types';

export interface ExtractProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
  status: string;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

/**
 * Memuat pustaka PDF.js dari CDN yang andal secara dinamis
 */
export async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Ekstraksi PDF hanya dapat dijalankan di browser.');
  }

  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    // Periksa apakah tag script sudah ada
    const existingScript = document.getElementById('pdfjs-cdn-script');
    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.pdfjsLib) {
          clearInterval(interval);
          resolve(window.pdfjsLib);
        } else if (attempts > 50) {
          clearInterval(interval);
          reject(new Error('Waktu tunggu inisialisasi PDF.js habis.'));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = 'pdfjs-cdn-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      const pdfjs = window.pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjs);
      } else {
        reject(new Error('Pustaka PDF.js tidak ditemukan setelah pemuatan script.'));
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          'Gagal mengunduh pustaka PDF parser dari CDN. Periksa koneksi internet Anda.'
        )
      );
    };

    document.head.appendChild(script);
  });
}

/**
 * Ekstraksi teks buku langsung di sisi browser pengguna (Client-Side).
 * Keuntungan:
 * 1. Menghindari batas payload request Vercel Serverless (4.5 MB). File 20MB-50MB dapat diproses tanpa upload ke server.
 * 2. Nomor halaman yang dihasilkan 100% akurat sesuai lembar asli PDF.
 * 3. Indikator progress real-time per halaman.
 */
export async function extractBookInBrowser(
  file: File,
  title: string,
  subject: string,
  grade: string,
  onProgress?: (progress: ExtractProgress) => void
): Promise<Book> {
  const isPdf = file.name.toLowerCase().endsWith('.pdf');
  const sections: BookSection[] = [];

  if (isPdf) {
    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      percent: 5,
      status: 'Memuat modul pembaca PDF...'
    });

    const pdfjs = await loadPdfJs();

    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      percent: 15,
      status: 'Membaca struktur dokumen PDF...'
    });

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    if (totalPages === 0) {
      throw new Error('Dokumen PDF tidak memiliki halaman.');
    }

    let sectionIndex = 1;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const percent = Math.min(
        95,
        Math.round(15 + (pageNum / totalPages) * 80)
      );

      onProgress?.({
        currentPage: pageNum,
        totalPages,
        percent,
        status: `Mengekstrak halaman ${pageNum} dari ${totalPages}...`
      });

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Abaikan halaman yang hampir kosong (misal halaman sampul bergambar tanpa teks)
      if (pageText.length > 25) {
        // Ambil potongan teks awal sebagai indikator subbab/topik
        const cleanPreview = pageText
          .slice(0, 70)
          .replace(/[^\w\s-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        const sectionTitle = cleanPreview
          ? `Hal. ${pageNum}: ${cleanPreview}...`
          : `Materi Halaman ${pageNum}`;

        sections.push({
          id: `custom-sec-${sectionIndex}`,
          chapter: `Halaman ${pageNum}`,
          title: sectionTitle,
          page: pageNum,
          content: pageText
        });
        sectionIndex++;
      }
    }
  } else {
    // Format Text (.txt) atau Markdown (.md)
    onProgress?.({
      currentPage: 1,
      totalPages: 1,
      percent: 40,
      status: 'Membaca isi file teks...'
    });

    const text = await file.text();
    const CHUNK_SIZE = 1800;
    const paragraphs = text.split(/\n\s*\n/);

    let currentChunk = '';
    let pageNumber = 1;
    let sectionIndex = 1;

    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;

      if (
        (currentChunk + '\n' + trimmed).length > CHUNK_SIZE &&
        currentChunk.length > 300
      ) {
        sections.push({
          id: `custom-sec-${sectionIndex}`,
          chapter: `Bagian ${sectionIndex}`,
          title: `Materi Bagian ${sectionIndex} (Est. Hal. ${pageNumber})`,
          page: pageNumber,
          content: currentChunk.trim()
        });
        sectionIndex++;
        pageNumber++;
        currentChunk = trimmed;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
      }
    }

    if (currentChunk.trim().length > 0) {
      sections.push({
        id: `custom-sec-${sectionIndex}`,
        chapter: `Bagian ${sectionIndex}`,
        title: `Materi Bagian ${sectionIndex} (Est. Hal. ${pageNumber})`,
        page: pageNumber,
        content: currentChunk.trim()
      });
    }
  }

  if (sections.length === 0) {
    throw new Error(
      'Gagal mengekstrak teks dari buku. Dokumen mungkin berupa hasil scan gambar murni tanpa teks/OCR. Pastikan menggunakan PDF berbasis teks atau file .txt.'
    );
  }

  onProgress?.({
    currentPage: sections.length,
    totalPages: sections.length,
    percent: 100,
    status: 'Indeks materi berhasil disusun!'
  });

  const finalTitle = (
    title || file.name.replace(/\.[^/.]+$/, '')
  ).trim();

  return {
    id: `custom-book-${Date.now()}`,
    title: finalTitle,
    subject: subject.trim() || 'Umum',
    grade: grade.trim() || 'Semua Jenjang',
    badge: 'Buku Siswa (Unggahan)',
    description: `Buku digital yang diunggah sendiri (${sections.length} halaman/bagian terindeks).`,
    coverGradient:
      'linear-gradient(135deg, #0284c7 0%, #06b6d4 50%, #0369a1 100%)',
    sections,
    isCustom: true
  };
}
