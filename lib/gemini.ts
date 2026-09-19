import { GoogleGenAI } from '@google/genai';
import { BookSection, AnswerResponse } from './types';

export async function askGeminiAboutBook({
  apiKey,
  bookTitle,
  question,
  sections
}: {
  apiKey?: string;
  bookTitle: string;
  question: string;
  sections: BookSection[];
}): Promise<AnswerResponse> {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    throw new Error(
      'Gemini API Key belum dikonfigurasi. Silakan masukkan API Key di menu pengaturan atau set GEMINI_API_KEY di Vercel.'
    );
  }

  const ai = new GoogleGenAI({ apiKey: activeKey });

  // Format context dari potongan bab & halaman buku
  const formattedContext = sections
    .map(
      (sec, idx) => `
--- KUTIPAN BAGIAN ${idx + 1} ---
Buku: ${bookTitle}
Bab: ${sec.chapter}
Subbab / Topik: ${sec.title}
Halaman: ${sec.page}
Isi Teks Buku:
"""
${sec.content}
"""
`
    )
    .join('\n');

  const systemPrompt = `Kamu adalah "BukuPintar AI", asisten pengerjaan tugas dan PR sekolah/kuliah yang bertugas memberikan jawaban yang AKURAT, TERPERINCI, dan WAJIB BERSUMBER HANYA dari teks buku paket yang disediakan.

ATURAN EMAS:
1. HANYA GUNAKAN MATERI BUKU: Jawablah pertanyaan siswa HANYA berdasarkan teks kutipan buku yang disertakan. Jangan mereka-reka atau berasumsi jika informasinya tidak tertulis di buku.
2. RESOLUSI SOAL MIRIP / JEBAKAN: Siswa sering kebingungan ketika dua soal terasa mirip atau memiliki kata kunci serupa padahal konsep di buku membedakannya secara tegas (contoh: mengapa gaya normal dan berat BUKAN aksi-reaksi, perbedaan difusi sederhana vs difusi terfasilitasi, dsb). Jelaskan perbedaan konsep tersebut agar siswa paham alasan di balik jawaban tersebut.
3. KUTIPAN RESMI: Sertakan kutipan kalimat asli (verbatim quote) dari buku beserta nomor halaman dan bab agar siswa dapat membuktikannya kepada guru/dosen.
4. FORMAT OUTPUT: Wajib menghasilkan JSON murni yang valid tanpa format pembungkus markdown apapun (jangan ada \`\`\`json atau \`\`\`), dengan struktur:
{
  "answer": "Jawaban lengkap, runtut, jelas, dan siap disalin untuk lembar tugas/PR.",
  "foundInBook": true/false (true jika ada di buku, false jika teks buku tidak memuat jawaban tersebut),
  "citations": [
    {
      "bookTitle": "${bookTitle}",
      "chapter": "Nama Bab yang relevan",
      "page": "Nomor Halaman atau range halaman",
      "verbatimQuote": "Kalimat asli persis dari isi teks buku yang menjadi bukti utama",
      "nuanceExplanation": "Catatan penting pembeda konsep jika ada soal yang mirip"
    }
  ]
}`;

  const userPrompt = `Pertanyaan / Soal PR Siswa:
"${question}"

Buku Pegangan: ${bookTitle}

Teks Referensi dari Buku:
${formattedContext}

Ingat, jawab dalam format JSON valid sesuai instruksi sistem.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const rawText = response.text || '{}';
    // Membersihkan kemungkinan formatting markdown jika ada
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      answer: parsed.answer || 'Tidak dapat menemukan jawaban spesifik di buku.',
      citations: Array.isArray(parsed.citations) ? parsed.citations : [],
      foundInBook: typeof parsed.foundInBook === 'boolean' ? parsed.foundInBook : true,
      modelUsed: 'gemini-2.5-flash'
    };
  } catch (err: unknown) {
    const error = err as Error;
    // Fallback jika model gemini-2.5-flash belum tersedia di region/key tertentu
    if (error.message && (error.message.includes('not found') || error.message.includes('404'))) {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });
      const rawFallback = fallbackResponse.text || '{}';
      const cleaned = rawFallback.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        answer: parsed.answer || 'Tidak dapat menemukan jawaban spesifik di buku.',
        citations: Array.isArray(parsed.citations) ? parsed.citations : [],
        foundInBook: typeof parsed.foundInBook === 'boolean' ? parsed.foundInBook : true,
        modelUsed: 'gemini-1.5-flash'
      };
    }
    throw error;
  }
}
