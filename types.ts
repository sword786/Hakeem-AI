export interface GeminiVerseSuggestion {
  surahNumber: number;
  ayahNumber: number;
  reasoning: string;
}

export interface VerseWord {
  id: number;
  position: number;
  audio_url: string;
  char_type_name: string;
  text_uthmani: string;
  translation: {
    text: string;
  };
  transliteration: {
    text: string;
  };
}

export interface QuranApiVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  words?: VerseWord[];
  translations?: {
    id: number;
    resource_id: number;
    text: string;
  }[];
  audio?: {
    url: string;
  };
}

export interface QuranChapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
  translated_name: {
    name: string;
  };
}

export interface QuranResource {
  id: number;
  name: string;
  author_name: string;
  slug?: string;
  language_name?: string;
  style?: string; // For reciters
}

export interface TafsirResource {
  id: number;
  name: string;
  author_name: string;
  language_name: string;
  slug: string;
}

export interface HakeemVerse {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  audioUrl: string;
  aiExplanation: string;
  surahNameEnglish: string;
  surahNameArabic: string;
  tafsir?: string; // HTML content for Tafsir
  words: VerseWord[]; // New: Word by word data
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  verse: HakeemVerse;
  note: string;
  mood?: string;
}

export enum View {
  HOME = 'HOME',
  JOURNAL = 'JOURNAL',
  MUSHAF = 'MUSHAF',
  SETTINGS = 'SETTINGS',
}

export enum SearchMode {
  AI = 'AI',
  TEXT = 'TEXT',
}

export interface AppSettings {
  translationId: number;
  reciterId: number;
  tafsirId: number;
  showTafsir: boolean;
}

export interface DailyAyahState {
  date: string; // YYYY-MM-DD
  verse: HakeemVerse | null;
}