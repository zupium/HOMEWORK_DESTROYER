'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle2, Cpu } from 'lucide-react';
import { Book } from '@/lib/types';
import { extractBookInBrowser, ExtractProgress } from '@/lib/pdf-client';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (newBook: Book) => void;
}

export function PdfUploadModal({ isOpen, onClose, onBookAdded }: PdfUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Informatika');
  const [grade, setGrade] = useState('Kelas 11 SMK');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ExtractProgress | null>(null);
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
      setProgress(null);
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
    setProgress({
      currentPage: 0,
      totalPages: 0,
      percent: 5,
      status: 'Mempersiapkan ekstraksi teks...'
    });

    try {
      // 1. Ekstraksi langsung di browser (Client-Side)
      // Ini 100% aman dari limit 4.5MB Vercel serverless functions
      const newBook = await extractBookInBrowser(
        file,
        title || file.name,
        subject,
        grade,
        prog => setProgress(prog)
      );

      onBookAdded(newBook);
      onClose();
    } catch (browserErr: unknown) {
      console.warn('Browser extraction failed or cancelled:', browserErr);
      const bError = browserErr as Error;

      // 2. Jika file kecil (< 4MB), coba fallback ke serverless API
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB < 4.0) {
        setProgress({
          currentPage: 0,
          totalPages: 0,
          percent: 50,
          status: 'Mencoba memproses via server...'
        });

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

          if (!res.ok) {
            if (res.status === 413) {
              throw new Error(
                'File terlalu besar untuk diunggah ke server Vercel (maksimal 4.5MB). Harap gunakan PDF yang teksnya dapat dibaca langsung.'
              );
            }
            const resText = await res.text();
            try {
              const errJson = JSON.parse(resText);
              throw new Error(errJson.error || `Server error (${res.status})`);
            } catch {
              throw new Error(`Gagal memproses di server (${res.status}): ${resText.slice(0, 120)}`);
            }
          }

          const data = await res.json();
          onBookAdded(data.book);
          onClose();
          return;
        } catch (serverErr: unknown) {
          const sError = serverErr as Error;
          setErrorMsg(sError.message || bError.message || 'Gagal memproses file buku.');
        }
      } else {
        // File besar >= 4MB gagal diekstrak di browser
        setErrorMsg(
          bError.message ||
            'Gagal memproses dokumen di browser. Pastikan file PDF berbasis teks dan koneksi internet stabil.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isLoading ? undefined : onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 255, 170, 0.12)',
                color: '#00ffaa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Upload size={18} />
            </div>
            <h3 className="modal-title">Tambah Buku Paket Baru</h3>
          </div>
          {!isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Unggah file buku digital (format <strong>PDF</strong> atau <strong>Teks .txt</strong>). Sistem akan otomatis membaca dan mengindeks seluruh bab dan nomor halaman untuk AI.
        </p>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(255, 68, 102, 0.08)',
              border: '1px solid rgba(255, 68, 102, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#ff8fa3',
              fontSize: '0.82rem',
              lineHeight: 1.5
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* File Picker */}
          <div
            style={{
              border: file ? '2px solid rgba(0, 255, 170, 0.4)' : '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '22px 16px',
              textAlign: 'center',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              background: 'rgba(13, 20, 37, 0.6)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => !isLoading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              style={{ display: 'none' }}
              disabled={isLoading}
              onChange={handleFileChange}
            />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#00ffaa' }}>
                <CheckCircle2 size={26} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e8f0ff' }}>{file.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ekstraksi Instan di Browser (Bebas Limit Server)
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <FileText size={32} color="var(--accent-primary)" />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Klik untuk memilih file PDF / TXT</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Mendukung file besar hingga 50MB+ (Diproses langsung di browser Anda)
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar saat memproses */}
          {isLoading && progress && (
            <div
              style={{
                background: 'rgba(17, 28, 53, 0.7)',
                border: '1px solid rgba(0, 200, 255, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={14} color="var(--accent-primary)" /> {progress.status}
                </span>
                <span style={{ fontWeight: 700, color: '#00c8ff' }}>{progress.percent}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${progress.percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #00c8ff 0%, #7b4fff 100%)',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Judul Buku:</label>
            <input
              type="text"
              className="text-input"
              placeholder="Contoh: 7 in 1 Pemrograman Web untuk Pemula"
              value={title}
              disabled={isLoading}
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
                placeholder="Contoh: Informatika, Kimia, dll."
                value={subject}
                disabled={isLoading}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Jenjang Kelas:</label>
              <input
                type="text"
                className="text-input"
                placeholder="Contoh: Kelas 11 SMK"
                value={grade}
                disabled={isLoading}
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
                  <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> Membaca Teks Buku...
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
