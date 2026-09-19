'use client';

import React from 'react';
import { Book as BookType } from '@/lib/types';
import { BookOpen, Plus, Sparkles, BookMarked } from 'lucide-react';

interface BookSelectorProps {
  books: BookType[];
  selectedBookId: string;
  onSelectBook: (book: BookType) => void;
  onOpenUpload: () => void;
}

export function BookSelector({
  books,
  selectedBookId,
  onSelectBook,
  onOpenUpload
}: BookSelectorProps) {
  return (
    <aside className="shelf-panel">
      <div className="section-title-row">
        <div className="section-title">
          <BookMarked size={18} color="#818cf8" />
          <span>Perpustakaan Buku Paket</span>
        </div>
        <button
          onClick={onOpenUpload}
          className="btn btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Upload buku PDF baru"
        >
          <Plus size={14} /> Upload PDF
        </button>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        Pilih buku pelajaran yang menjadi acuan soal PR kamu:
      </p>

      <div className="books-list">
        {books.map(book => {
          const isActive = book.id === selectedBookId;
          return (
            <div
              key={book.id}
              className={`book-card ${isActive ? 'active' : ''}`}
              style={{ '--book-gradient': book.coverGradient } as React.CSSProperties}
              onClick={() => onSelectBook(book)}
            >
              <div className="book-card-header">
                <span className="book-badge">{book.badge}</span>
                {book.isCustom && (
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600 }}>
                    Unggahan Anda
                  </span>
                )}
              </div>

              <div className="book-title">{book.title}</div>

              <div className="book-meta">
                <span>{book.subject}</span>
                <span>•</span>
                <span>{book.grade}</span>
                <span>•</span>
                <span>{book.sections.length} Bagian</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '10px',
        padding: '12px',
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px dashed rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c7d2fe', fontWeight: 600, marginBottom: '4px' }}>
          <Sparkles size={14} /> AI Terkunci pada Buku
        </div>
        Setiap jawaban dipaksa mencocokkan bab dan kalimat asli dari buku yang aktif di atas.
      </div>
    </aside>
  );
}
