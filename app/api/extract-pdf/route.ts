import { NextRequest, NextResponse } from 'next/server';
import { Book, BookSection } from '@/lib/types';
import pdf from 'pdf-parse';

export const maxDuration = 30; // Max execution timeout for Vercel functions if supported

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Buku Kustom Siswa';
    const subject = (formData.get('subject') as string) || 'Umum';
    const grade = (formData.get('grade') as string) || 'Semua Jenjang';

    if (!file) {
      return NextResponse.json(
        { error: 'File buku tidak ditemukan. Harap unggah file PDF atau Teks (.txt).' },
        { status: 400 }
      );
    }

    // Cek batas ukuran aman untuk Vercel Serverless Function (4.2 MB)
    if (file.size > 4.2 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            'Ukuran file terlalu besar untuk server Vercel (maksimal 4.5MB). Harap proses file melalui browser.'
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = '';

    if (file.name.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdf(buffer);
      extractedText = pdfData.text;
    } else {
      // Text / Markdown file
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Gagal mengekstrak teks dari file. Pastikan file tidak kosong dan bukan hasil scan gambar murni tanpa OCR.'
        },
        { status: 400 }
      );
    }

    // Pecah teks menjadi section/chunk logis
    const CHUNK_SIZE = 1800;
    const paragraphs = extractedText.split(/\n\s*\n/);
    const sections: BookSection[] = [];

    let currentChunk = '';
    let pageNumber = 1;
    let sectionIndex = 1;

    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;

      if ((currentChunk + '\n' + trimmed).length > CHUNK_SIZE && currentChunk.length > 300) {
        sections.push({
          id: `custom-sec-${sectionIndex}`,
          chapter: `Bab Terdeteksi / Est. Halaman ${pageNumber}`,
          title: `Materi Bagian ${sectionIndex} (Hal. ${pageNumber})`,
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
        chapter: `Bab Terdeteksi / Est. Halaman ${pageNumber}`,
        title: `Materi Bagian ${sectionIndex} (Hal. ${pageNumber})`,
        page: pageNumber,
        content: currentChunk.trim()
      });
    }

    const customBook: Book = {
      id: `custom-book-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      badge: 'Buku Siswa (Unggahan)',
      description: `Buku digital yang diunggah sendiri (${sections.length} bagian materi terindeks).`,
      coverGradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 50%, #0369a1 100%)',
      sections,
      isCustom: true
    };

    return NextResponse.json({
      success: true,
      book: customBook,
      totalSections: sections.length
    });
  } catch (error: unknown) {
    console.error('Error in /api/extract-pdf:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Gagal memproses file buku digital di server.' },
      { status: 500 }
    );
  }
}
