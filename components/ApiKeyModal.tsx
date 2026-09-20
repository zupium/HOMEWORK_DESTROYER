'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }: ApiKeyModalProps) {
  const [inputKey, setInputKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(0, 200, 255, 0.12)', color: '#00c8ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Key size={18} />
            </div>
            <h3 className="modal-title">Pengaturan Groq API Key</h3>
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

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Untuk menjalankan AI, kamu memerlukan <strong>Groq API Key</strong> (model GPT-OSS 120B). Jika sudah dideploy di Vercel, kamu juga bisa menyimpannya di Environment Variable <code>GROQ_API_KEY</code>.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">API Key Kamu (Tersimpan aman di browser):</label>
            <input
              type="password"
              className="text-input"
              placeholder="gsk_..."
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
            />
          </div>

          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>Belum punya key?</span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00c8ff', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              Dapatkan Gratis di Groq Console <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Tersimpan!
                </>
              ) : (
                'Simpan Kunci'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
