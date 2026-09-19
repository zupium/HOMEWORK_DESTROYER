import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_BOOKS } from '@/lib/books/sample-books';
import { retrieveRelevantSections } from '@/lib/books/retriever';
import { askGroqAboutBook, GroqError } from '@/lib/groq';
import { Book, BookSection } from '@/lib/types';

export const maxDuration = 60; // GPT-OSS 120B melakukan reasoning, beri waktu cukup

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookId, bookTitle, question, apiKey, customBook, relevantSections } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Pertanyaan atau soal PR wajib diisi.' },
        { status: 400 }
      );
    }

    let sections: BookSection[] = [];
    let score = 0;
    let targetBookTitle = bookTitle || '';

    // 1. Jika client sudah mengirimkan potongan bab yang relevan secara efisien
    // (menghemat bandwidth dan menghindari limit 4.5MB Vercel untuk buku kustom)
    if (Array.isArray(relevantSections) && relevantSections.length > 0) {
      sections = relevantSections;
      score = 15;
      if (!targetBookTitle) {
        targetBookTitle = customBook?.title || 'Buku Paket Siswa';
      }
    } else {
      // Cari buku dari database sampel atau buku kustom lengkap
      let selectedBook: Book | undefined;
      if (customBook && customBook.id === bookId) {
        selectedBook = customBook;
      } else {
        selectedBook = SAMPLE_BOOKS.find(b => b.id === bookId);
      }

      if (!selectedBook) {
        return NextResponse.json(
          { error: 'Buku pelajaran yang dipilih tidak ditemukan.' },
          { status: 404 }
        );
      }

      targetBookTitle = selectedBook.title;

      // Temukan bagian / bab buku yang paling relevan
      const retrieval = retrieveRelevantSections(selectedBook, question, 4);
      sections = retrieval.sections;
      score = retrieval.score;
    }

    if (sections.length === 0) {
      return NextResponse.json({
        answer:
          'Materi untuk menjawab pertanyaan ini tidak ditemukan dalam buku yang dipilih. Coba gunakan kata kunci materi yang lebih spesifik.',
        citations: [],
        foundInBook: false,
        modelUsed: 'none'
      });
    }

    // 2. Hubungi Groq API (GPT-OSS 120B) dengan instruksi grounding ketat
    const result = await askGroqAboutBook({
      apiKey,
      bookTitle: targetBookTitle,
      question,
      sections
    });

    return NextResponse.json({
      success: true,
      ...result,
      matchScore: score,
      sectionsUsedCount: sections.length
    });
  } catch (error: unknown) {
    console.error('Error in /api/ask:', error);
    const err = error as Error;
    const status = error instanceof GroqError ? error.status : 500;
    return NextResponse.json(
      {
        error: err.message || 'Terjadi kesalahan saat memproses jawaban dengan AI.'
      },
      { status }
    );
  }
}
