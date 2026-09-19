import { BookSection, AnswerResponse } from './types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Model ID resmi GPT-OSS 120B di Groq. Bisa di-override lewat env GROQ_MODEL. */
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

/** Error dengan status HTTP agar route API bisa meneruskan kode yang tepat. */
export class GroqError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'GroqError';
    this.status = status;
  }
}

interface GroqResponseBody {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string; code?: string; type?: string };
}

/** Ambil objek JSON dari teks, toleran terhadap pembungkus markdown / teks tambahan. */
function extractJson(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new GroqError('Jawaban AI tidak berformat JSON yang valid. Silakan coba kirim ulang soalnya.', 502);
  }
}

function buildPrompts(bookTitle: string, question: string, sections: BookSection[]) {
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
3. KUTIPAN RESMI: Sertakan kutipan kalimat asli (verbatim quote) dari buku beserta nomor halaman dan bab agar siswa dapat membuktikannya kepada guru/dosen. Salin kutipan PERSIS dari teks yang diberikan, jangan diubah.
4. BAHASA: Jawab dalam Bahasa Indonesia.
5. FORMAT OUTPUT: Wajib menghasilkan satu objek JSON murni yang valid tanpa format pembungkus markdown apapun (jangan ada \`\`\`json atau \`\`\`) dan tanpa teks lain di luar JSON, dengan struktur:
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

Ingat, jawab hanya dalam format JSON valid sesuai instruksi sistem.`;

  return { systemPrompt, userPrompt };
}

async function callGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  useJsonMode: boolean
): Promise<Response> {
  return fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      // Termasuk token "berpikir" GPT-OSS, jadi dibuat cukup longgar
      max_completion_tokens: 6000,
      reasoning_effort: 'medium',
      ...(useJsonMode ? { response_format: { type: 'json_object' } } : {})
    })
  });
}

export async function askGroqAboutBook({
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
  const activeKey = apiKey || process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

  if (!activeKey) {
    throw new GroqError(
      'Groq API Key belum dikonfigurasi. Silakan masukkan API Key di menu pengaturan atau set GROQ_API_KEY di Vercel.',
      500
    );
  }

  const { systemPrompt, userPrompt } = buildPrompts(bookTitle, question, sections);

  let res = await callGroq(activeKey, model, systemPrompt, userPrompt, true);

  // JSON mode kadang gagal validasi di sisi Groq (HTTP 400) -> coba ulang tanpa JSON mode,
  // parsing JSON ditangani sendiri oleh extractJson().
  if (res.status === 400) {
    const errBody = (await res.clone().json().catch(() => ({}))) as GroqResponseBody;
    if (errBody.error?.code === 'json_validate_failed') {
      res = await callGroq(activeKey, model, systemPrompt, userPrompt, false);
    }
  }

  const data = (await res.json().catch(() => ({}))) as GroqResponseBody;

  if (!res.ok) {
    const detail = data.error?.message || `HTTP ${res.status}`;
    if (res.status === 401) {
      throw new GroqError('Groq API Key tidak valid atau sudah dicabut. Periksa kembali API Key kamu.', 401);
    }
    if (res.status === 429) {
      throw new GroqError(
        'Batas penggunaan Groq tercapai (rate limit). Tunggu beberapa saat lalu coba lagi.',
        429
      );
    }
    if (res.status === 413) {
      throw new GroqError('Teks buku yang dikirim terlalu besar untuk model. Coba soal yang lebih spesifik.', 413);
    }
    throw new GroqError(`Groq API error: ${detail}`, res.status >= 400 && res.status < 600 ? res.status : 500);
  }

  const rawText = data.choices?.[0]?.message?.content || '';
  if (!rawText.trim()) {
    throw new GroqError('AI tidak mengembalikan jawaban. Silakan coba kirim ulang soalnya.', 502);
  }

  const parsed = extractJson(rawText) as {
    answer?: string;
    citations?: AnswerResponse['citations'];
    foundInBook?: boolean;
  };

  return {
    answer: parsed.answer || 'Tidak dapat menemukan jawaban spesifik di buku.',
    citations: Array.isArray(parsed.citations) ? parsed.citations : [],
    foundInBook: typeof parsed.foundInBook === 'boolean' ? parsed.foundInBook : true,
    modelUsed: model
  };
}
