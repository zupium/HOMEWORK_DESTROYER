'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_BOOKS } from '@/lib/books/sample-books';
import { retrieveRelevantSections } from '@/lib/books/retriever';
import { Book, ChatMessage, GroundingCitation } from '@/lib/types';
import { getStoredCustomBooks, saveStoredCustomBook, deleteStoredCustomBook } from '@/lib/storage';
import { BookSelector } from '@/components/BookSelector';
import { AnswerCard } from '@/components/AnswerCard';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { PdfUploadModal } from '@/components/PdfUploadModal';
import {
  GraduationCap,
  Send,
  Key,
  HelpCircle,
  BookOpen,
  Loader2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>(SAMPLE_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book>(SAMPLE_BOOKS[0]);
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load API key and custom books from IndexedDB upon mounting
  useEffect(() => {
    const savedKey = localStorage.getItem('bukupintar_groq_key') || '';
    setApiKey(savedKey);

    // Ambil buku kustom yang disimpan di browser secara asinkron (IndexedDB)
    getStoredCustomBooks()
      .then(customBooks => {
        if (customBooks && customBooks.length > 0) {
          setBooks([...SAMPLE_BOOKS, ...customBooks]);
        }
      })
      .catch(err => {
        console.error('Failed to load custom books from storage:', err);
      });
  }, []);

  // Auto scroll down on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('bukupintar_groq_key', key);
  };

  const handleBookAdded = async (newBook: Book) => {
    const updated = [...books, newBook];
    setBooks(updated);
    setSelectedBook(newBook);

    // Simpan ke IndexedDB (bisa menampung buku ukuran besar tanpa quota error)
    await saveStoredCustomBook(newBook);
  };

  const handleDeleteBook = async (bookId: string) => {
    await deleteStoredCustomBook(bookId);
    const updated = books.filter(b => b.id !== bookId);
    setBooks(updated);
    if (selectedBook.id === bookId) {
      setSelectedBook(SAMPLE_BOOKS[0]);
      setMessages([]);
    }
  };

  const sampleQuestionsByBook: Record<string, string[]> = {
    'biologi-sma-11': [
      'Apa perbedaan mendasar antara difusi sederhana dan difusi terfasilitasi?',
      'Mengapa sel prokariotik berbeda dengan sel eukariotik?',
      'Jelaskan apa itu osmosis dan bagaimana pengaruhnya pada sel tumbuhan!',
      'Apa perbedaan utama katabolisme dan anabolisme?'
    ],
    'fisika-sma-10': [
      'Mengapa gaya normal dan gaya berat pada buku di atas meja BUKAN pasangan aksi-reaksi?',
      'Jelaskan bunyi Hukum I Newton dan apa yang dimaksud dengan sifat kelembaman!',
      'Kapan usaha bernilai nol dalam fisika meskipun kita mengeluarkan tenaga?'
    ],
    'sejarah-sma-11': [
      'Jelaskan perbedaan haluan dan keanggotaan antara Budi Utomo dengan Sarekat Islam!',
      'Mengapa golongan muda membawa Soekarno dan Hatta ke Rengasdengklok?',
      'Siapa saja tokoh yang merumuskan kalimat dalam teks proklamasi?'
    ],
    'ppkn-sma-10': [
      'Apa perbedaan antara nilai instrumental dan nilai praksis dalam ideologi Pancasila?',
      'Sebutkan tata urutan peraturan perundang-undangan menurut UU No. 12 Tahun 2011!'
    ]
  };

  const currentSampleQuestions = sampleQuestionsByBook[selectedBook.id] || [
    'Ringkas materi utama bab pertama dari buku ini.',
    'Apa definisi kunci yang dibahas pada buku pelajaran ini?'
  ];

  const handleSendQuestion = async (textToSend?: string) => {
    const query = (textToSend || question).trim();
    if (!query || isLoading) return;

    setErrorMessage('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setQuestion('');
    setIsLoading(true);

    try {
      // Optimasi efisiensi untuk buku kustom unggahan:
      // Eksekusi pencarian bab relevan di sisi browser dan kirimkan hanya 4 bab terbaik ke API.
      // Ini membuat payload request sangat kecil (< 10 KB) dan mencegah limit 4.5MB Vercel.
      let customSections = undefined;
      if (selectedBook.isCustom) {
        const retrieval = retrieveRelevantSections(selectedBook, query, 4);
        customSections = retrieval.sections;
      }

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedBook.id,
          bookTitle: selectedBook.title,
          question: query,
          apiKey: apiKey || undefined,
          relevantSections: customSections
        })
      });

      let data;
      const resText = await res.text();
      try {
        data = JSON.parse(resText);
      } catch {
        throw new Error(`Respon server tidak valid (${res.status}): ${resText.slice(0, 100)}`);
      }

      if (!res.ok) {
        if (data.error && data.error.includes('API Key')) {
          setIsKeyModalOpen(true);
        }
        throw new Error(data.error || 'Gagal mendapatkan jawaban dari AI.');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now(),
        citations: data.citations as GroundingCitation[],
        foundInBook: data.foundInBook
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Terjadi masalah saat memproses soal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-group">
          <div className="brand-logo">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="brand-title">BukuPintar AI</h1>
            <div className="brand-subtitle">
              Asisten PR & Soal Sekolah Berbasis Buku Paket Resmi
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <Key size={15} color={apiKey ? '#34d399' : '#f59e0b'} />
            <span>{apiKey ? 'API Key Terpasang' : 'Atur API Key'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="main-grid">
        {/* Left Column: Book Selector Shelf */}
        <BookSelector
          books={books}
          selectedBookId={selectedBook.id}
          onSelectBook={book => {
            setSelectedBook(book);
            setErrorMessage('');
          }}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onDeleteBook={handleDeleteBook}
        />

        {/* Right Column: Q&A Workspace */}
        <main className="workspace-panel">
          {/* Active Book Banner */}
          <div className="active-book-banner">
            <div className="active-book-info">
              <div
                className="book-icon-box"
                style={{ background: selectedBook.coverGradient }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Buku Acuan Aktif:
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {selectedBook.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {selectedBook.subject} • {selectedBook.grade} • {selectedBook.sections.length} Bagian Materi Terindeks
                </div>
              </div>
            </div>

            <span className="book-badge" style={{ alignSelf: 'flex-start' }}>
              {selectedBook.badge}
            </span>
          </div>

          {/* Sample Prompts Pills */}
          <div className="sample-prompts-container">
            <div className="sample-prompts-label">
              <Sparkles size={13} style={{ display: 'inline', marginRight: '5px' }} />
              Coba Klik Contoh Soal PR dari Buku Ini:
            </div>
            <div className="sample-prompts-list">
              {currentSampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="sample-chip"
                  onClick={() => handleSendQuestion(q)}
                  disabled={isLoading}
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                color: '#f87171',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{errorMessage}</div>
              {!apiKey && (
                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  Masukkan Key
                </button>
              )}
            </div>
          )}

          {/* Chat Feed */}
          <div className="chat-feed">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <HelpCircle size={28} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Punya PR yang Jawabannya Harus dari Buku?
                </h3>
                <p style={{ maxWidth: '460px', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  Ketik soal PR kamu di bawah atau klik salah satu contoh pertanyaan di atas. BukuPintar AI akan mencari teks bab yang tepat dan memberikan jawaban resmi beserta nomor halamannya.
                </p>
              </div>
            )}

            {messages.map(msg => (
              <React.Fragment key={msg.id}>
                {msg.role === 'user' ? (
                  <div className="question-card">{msg.content}</div>
                ) : (
                  <AnswerCard
                    answer={msg.content}
                    citations={msg.citations || []}
                    foundInBook={msg.foundInBook ?? true}
                    bookTitle={selectedBook.title}
                  />
                )}
              </React.Fragment>
            ))}

            {isLoading && (
              <div className="answer-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <Loader2 size={20} className="spin-icon" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
                <span>Mencocokkan teks buku pelajaran & memformulasikan jawaban resmi...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Dock */}
          <div className="input-dock">
            <form
              className="input-form"
              onSubmit={e => {
                e.preventDefault();
                handleSendQuestion();
              }}
            >
              <input
                type="text"
                className="input-field"
                placeholder={`Tanyakan soal PR dari ${selectedBook.title}...`}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="submit-btn"
                disabled={!question.trim() || isLoading}
                title="Kirim pertanyaan"
              >
                {isLoading ? (
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      <PdfUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onBookAdded={handleBookAdded}
      />
    </div>
  );
}
