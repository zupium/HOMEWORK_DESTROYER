'use client';

import React, { useState } from 'react';
import { BookOpen, BookmarkCheck, Copy, Check, Sparkles, AlertCircle, Quote } from 'lucide-react';
import { GroundingCitation } from '@/lib/types';

interface AnswerCardProps {
  answer: string;
  citations: GroundingCitation[];
  foundInBook: boolean;
  modelUsed?: string;
  bookTitle?: string;
}

export function AnswerCard({
  answer,
  citations,
  foundInBook,
  modelUsed = 'openai/gpt-oss-120b',
  bookTitle
}: AnswerCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let fullTextToCopy = answer;
    if (citations.length > 0) {
      fullTextToCopy += `\n\n--- Referensi Buku ---\nBuku: ${bookTitle || citations[0].bookTitle}\nBab: ${citations[0].chapter} (Hal. ${citations[0].page})\nKutipan Buku: "${citations[0].verbatimQuote}"`;
    }
    navigator.clipboard.writeText(fullTextToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="answer-card">
      <div className="answer-header">
        <div className="answer-tag">
          <Sparkles size={16} />
          <span>Jawaban Resmi Buku ({modelUsed})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {foundInBook ? (
            <span className="status-pill">
              <BookmarkCheck size={14} /> Terverifikasi Teks Buku
            </span>
          ) : (
            <span className="status-pill warning">
              <AlertCircle size={14} /> Teks Tidak Lengkap di Buku
            </span>
          )}
          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Salin jawaban untuk PR"
          >
            {copied ? (
              <>
                <Check size={14} color="#00ffaa" /> Disalin!
              </>
            ) : (
              <>
                <Copy size={14} /> Salin Jawaban
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Answer Text */}
      <div className="answer-body">{answer}</div>

      {/* Citation Box (Kutipan Kalimat Asli Buku & Nomor Halaman) */}
      {citations && citations.length > 0 && (
        <div className="citation-box">
          <div className="citation-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} />
              <span>Sumber Rujukan Buku Pegangan</span>
            </div>
            <span style={{
              background: 'rgba(0, 255, 170, 0.15)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              Halaman {citations[0].page}
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>{citations[0].chapter}</strong>
          </div>

          <div className="citation-quote">
            <Quote size={14} style={{ display: 'inline', marginRight: '6px', opacity: 0.7 }} />
            &ldquo;{citations[0].verbatimQuote}&rdquo;
          </div>

          {citations[0].nuanceExplanation && (
            <div className="nuance-box" style={{ marginTop: '6px' }}>
              <AlertCircle size={18} className="nuance-icon" />
              <div>
                <strong>Pembeda Soal yang Mirip:</strong> {citations[0].nuanceExplanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
