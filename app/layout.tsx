import type { Metadata } from 'next';
import './globals.css';
import { SpaceBackground } from '@/components/SpaceBackground';

export const metadata: Metadata = {
  title: 'BukuPintar AI - Asisten PR Berbasis Buku Paket Digital',
  description: 'AI cerdas yang mencari dan menjawab soal PR sekolah secara tepat berdasarkan teks buku paket resmi, lengkap dengan kutipan dan nomor halaman.',
  keywords: ['AI PR', 'Tanya Jawab Buku Paket', 'RAG AI', 'Kurikulum Merdeka', 'Buku Digital', 'GPT-OSS 120B', 'Groq']
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <SpaceBackground />
        {children}
      </body>
    </html>
  );
}
