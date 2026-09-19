export interface BookSection {
  id: string;
  chapter: string;
  title: string;
  page: number | string;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  badge: string;
  coverGradient: string;
  sections: BookSection[];
  isCustom?: boolean;
}

export interface GroundingCitation {
  bookTitle: string;
  chapter: string;
  page: number | string;
  verbatimQuote: string;
  nuanceExplanation?: string; // Penjelasan kenapa jawaban ini tepat jika ada soal yang mirip
}

export interface AnswerResponse {
  answer: string;
  citations: GroundingCitation[];
  foundInBook: boolean;
  modelUsed: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  citations?: GroundingCitation[];
  foundInBook?: boolean;
}
