'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Book } from '@/lib/types';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (newBook: Book) => void;
}

export function PdfUploadModal({ isOpen, onClose, onBookAdded }: PdfUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('IPA / Biologi');
  const [grade, setGrade] = useState('Kelas 10 SMA');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        // Otomatis pakai nama file tanpa ekstensi sebagai judul awal
        const baseName = selected.name.replace(/\.[^/.]+$/, '');
        setTitle(baseName);
      }
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Pilih file buku digital terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('subject', subject);
      formData.append('grade', grade);

      const res = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengekstrak teks buku.');
      }

      onBookAdded(data.book);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Terjadi kesalahan saat memproses buku.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Upload size={18} />
            </div>
            <h3 className="modal-title">Tambah Buku Paket Baru</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Unggah file buku digital (format <strong>PDF</strong> atau <strong>Teks .txt</strong>). Sistem akan otomatis membaca dan membuat indeks pencarian untuk AI.
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#f87171',
            fontSize: '0.82rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* File Picker */}
          <div 
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(15, 23, 42, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#34d399' }}>
                <CheckCircle2 size={24} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <FileText size={32} color="var(--accent-primary)" />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Klik untuk memilih file PDF / TXT</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maksimal 25MB (PDF berbasis teks / ebook)</div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Judul Buku:</label>
            <input
              type="text"
              className="text-input"
              placeholder="Contoh: Kimia SMA Kelas XII Kurikulum Merdeka"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Mata Pelajaran:</label>
              <input
                type="text"
                className="text-input"
                placeholder="Contoh: Kimia, Sosiologi..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jenjang Kelas:</label>
              <input
                type="text"
                className="text-input"
                placeholder="Contoh: Kelas 12 SMA"
                value={grade}
                onChange={e => setGrade(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading || !file}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> Memproses Teks Buku...
                </>
              ) : (
                'Simpan & Jadikan Database AI'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
