import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_BOOKS } from '@/lib/books/sample-books';
import { retrieveRelevantSections } from '@/lib/books/retriever';
import { askGeminiAboutBook } from '@/lib/gemini';
import { Book } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookId, question, apiKey, customBook } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Pertanyaan atau soal PR wajib diisi.' },
        { status: 400 }
      );
    }

    // Cari buku yang dipilih (bisa dari sampel atau buku kustom yang diunggah)
    let selectedBook: Book | undefined;
    if (customBook && customBook.id === bookId) {
      selectedBook = customBook;
    } else {
      selectedBook = SAMPLE_BOOKS.find(b => b.id === bookId);
    }

    if (!selectedBook) {
      return NextResponse.json(
        { error: 'Buku paket yang dipilih tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 1. Temukan bagian / bab buku yang paling relevan
    const { sections, score } = retrieveRelevantSections(selectedBook, question, 4);

    if (sections.length === 0) {
      return NextResponse.json({
        answer: 'Materi untuk menjawab pertanyaan ini tidak ditemukan dalam buku yang dipilih.',
        citations: [],
        foundInBook: false,
        modelUsed: 'none'
      });
    }

    // 2. Hubungi Gemini API dengan instruksi grounding ketat
    const result = await askGeminiAboutBook({
      apiKey,
      bookTitle: selectedBook.title,
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
    return NextResponse.json(
      {
        error: err.message || 'Terjadi kesalahan saat memproses jawaban dengan AI.'
      },
      { status: 500 }
    );
  }
}
