import { Book, BookSection } from '../types';

interface ScoredSection {
  section: BookSection;
  score: number;
  matchedKeywords: string[];
}

// Stopwords umum bahasa Indonesia untuk memfilter kata kunci penting
const ID_STOPWORDS = new Set([
  'yang', 'untuk', 'pada', 'ke', 'para', 'namun', 'menurut', 'antara', 'dia', 'dua',
  'ia', 'seperti', 'jika', 'sehingga', 'kembali', 'dan', 'ini', 'karena', 'oleh',
  'dari', 'adalah', 'dengan', 'itu', 'atau', 'dalam', 'bisa', 'ada', 'akan', 'sudah',
  'apakah', 'bagaimana', 'kenapa', 'mengapa', 'sebutkan', 'jelaskan', 'berikan', 'apa'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !ID_STOPWORDS.has(token));
}

/**
 * Mencari bagian buku (sections) yang paling relevan dengan pertanyaan PR
 */
export function retrieveRelevantSections(
  book: Book,
  query: string,
  topK: number = 3
): { sections: BookSection[]; score: number } {
  if (!book.sections || book.sections.length === 0) {
    return { sections: [], score: 0 };
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return { sections: book.sections.slice(0, topK), score: 0.1 };
  }

  const scored: ScoredSection[] = book.sections.map(section => {
    let score = 0;
    const matchedKeywords: string[] = [];

    const titleTokens = tokenize(section.title);
    const chapterTokens = tokenize(section.chapter);
    const contentTokens = tokenize(section.content);
    const contentLower = section.content.toLowerCase();

    for (const qToken of queryTokens) {
      // Bobot tertinggi jika cocok di judul subbab
      if (titleTokens.includes(qToken)) {
        score += 8;
        matchedKeywords.push(qToken);
      }
      // Bobot sedang jika cocok di nama bab
      if (chapterTokens.includes(qToken)) {
        score += 4;
      }
      // Frekuensi kemunculan di isi teks
      const occurrences = (contentLower.match(new RegExp(`\\b${qToken}`, 'g')) || []).length;
      if (occurrences > 0) {
        score += Math.min(occurrences * 2, 10);
        matchedKeywords.push(qToken);
      }
    }

    // Bonus jika kata kunci berdekatan (phrase match)
    if (contentLower.includes(query.toLowerCase().trim())) {
      score += 20;
    }

    return {
      section,
      score,
      matchedKeywords: Array.from(new Set(matchedKeywords))
    };
  });

  // Urutkan dari skor tertinggi
  scored.sort((a, b) => b.score - a.score);

  const topSections = scored
    .filter(item => item.score > 0)
    .slice(0, topK)
    .map(item => item.section);

  const highestScore = scored[0]?.score || 0;

  // Jika tidak ada kata kunci yang cocok sama sekali, ambil 2 section pertama sebagai fallback
  if (topSections.length === 0) {
    return {
      sections: book.sections.slice(0, 2),
      score: 0
    };
  }

  return {
    sections: topSections,
    score: highestScore
  };
}
