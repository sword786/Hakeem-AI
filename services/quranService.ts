import { GeminiVerseSuggestion, HakeemVerse, QuranChapter, QuranResource, TafsirResource } from "../types";

const BASE_URL = "https://api.quran.com/api/v4";

// Defaults
export const DEFAULT_TRANSLATION_ID = 131; // The Clear Quran
export const DEFAULT_RECITER_ID = 7; // Mishary Rashid Alafasy
export const DEFAULT_TAFSIR_ID = 169; // Ibn Kathir (English)

export const fetchVerseDetails = async (
  suggestion: GeminiVerseSuggestion, 
  translationId: number = DEFAULT_TRANSLATION_ID,
  reciterId: number = DEFAULT_RECITER_ID
): Promise<HakeemVerse | null> => {
  try {
    const { surahNumber, ayahNumber, reasoning } = suggestion;
    const verseKey = `${surahNumber}:${ayahNumber}`;
    
    // Fetch Text, Translation, Audio AND WORDS
    const response = await fetch(
      `${BASE_URL}/verses/by_key/${verseKey}?language=en&words=true&translations=${translationId}&fields=text_uthmani&audio=${reciterId}`
    );

    if (!response.ok) return null;
    const data = await response.json();
    const verseData = data.verse;

    if (!verseData) return null;

    // Fetch Surah Info
    const surahResponse = await fetch(`${BASE_URL}/chapters/${surahNumber}?language=en`);
    const surahData = await surahResponse.json();
    const chapter = surahData.chapter;

    return {
      surahNumber,
      ayahNumber,
      arabicText: verseData.text_uthmani || "",
      translation: verseData.translations?.[0]?.text || "Translation unavailable",
      audioUrl: verseData.audio?.url ? `https://verses.quran.com/${verseData.audio.url}` : "",
      aiExplanation: reasoning,
      surahNameEnglish: chapter?.name_simple || `Surah ${surahNumber}`,
      surahNameArabic: chapter?.name_arabic || "",
      words: verseData.words || []
    };

  } catch (error) {
    console.error("Quran API Error:", error);
    return null;
  }
};

export const fetchMultipleVerses = async (
  suggestions: GeminiVerseSuggestion[],
  translationId: number,
  reciterId: number
): Promise<HakeemVerse[]> => {
  const promises = suggestions.map(s => fetchVerseDetails(s, translationId, reciterId));
  const results = await Promise.all(promises);
  return results.filter((v): v is HakeemVerse => v !== null);
};

export const fetchChapters = async (): Promise<QuranChapter[]> => {
  try {
    const response = await fetch(`${BASE_URL}/chapters?language=en`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.chapters;
  } catch (error) {
    console.error("Failed to fetch chapters", error);
    return [];
  }
};

export const fetchChapterVerses = async (
  chapterId: number,
  translationId: number = DEFAULT_TRANSLATION_ID,
  reciterId: number = DEFAULT_RECITER_ID,
  page: number = 1,
  chapterInfo?: QuranChapter
): Promise<HakeemVerse[]> => {
  try {
    // Pagination: 50 verses per page, include words=true
    const response = await fetch(
      `${BASE_URL}/verses/by_chapter/${chapterId}?language=en&words=true&translations=${translationId}&fields=text_uthmani&audio=${reciterId}&per_page=50&page=${page}`
    );
    
    if (!response.ok) return [];
    const data = await response.json();
    
    // Use provided chapter info or fetch if missing
    let currentChapter = chapterInfo;
    if (!currentChapter) {
      const chapters = await fetchChapters();
      currentChapter = chapters.find(c => c.id === chapterId);
    }

    return data.verses.map((v: any) => ({
      surahNumber: chapterId,
      ayahNumber: v.verse_number,
      arabicText: v.text_uthmani,
      translation: v.translations?.[0]?.text || "",
      audioUrl: v.audio?.url ? `https://verses.quran.com/${v.audio.url}` : "",
      aiExplanation: "", 
      surahNameEnglish: currentChapter?.name_simple || "",
      surahNameArabic: currentChapter?.name_arabic || "",
      words: v.words || []
    }));

  } catch (error) {
    console.error("Failed to fetch chapter verses", error);
    return [];
  }
};

// --- Standard Text Search ---

export const searchQuranText = async (
  query: string, 
  translationId: number = DEFAULT_TRANSLATION_ID,
  reciterId: number = DEFAULT_RECITER_ID
): Promise<HakeemVerse[]> => {
  try {
    // Uses Quran.com search API
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&size=20&page=1&language=en`);
    if (!response.ok) return [];
    
    const data = await response.json();
    const searchResults = data.search.results;
    
    // The search results give us verse_keys (e.g., "2:255"). We need to fetch full details for them.
    // We limit to top 5 to avoid spamming the API with individual verse requests.
    const topResults = searchResults.slice(0, 5);
    
    const suggestions: GeminiVerseSuggestion[] = topResults.map((r: any) => {
        const [surah, ayah] = r.verse_key.split(':');
        return {
            surahNumber: parseInt(surah),
            ayahNumber: parseInt(ayah),
            reasoning: "Search Result" // Fallback reasoning
        }
    });

    return fetchMultipleVerses(suggestions, translationId, reciterId);

  } catch (error) {
    console.error("Search API Error", error);
    return [];
  }
}

// --- Resources ---

export const fetchAvailableTranslations = async (): Promise<QuranResource[]> => {
  try {
    const response = await fetch(`${BASE_URL}/resources/translations?language=en`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.translations.map((t: any) => ({
      id: t.id,
      name: t.name,
      author_name: t.author_name,
      language_name: t.language_name
    }));
  } catch (error) {
    return [];
  }
};

export const fetchAvailableReciters = async (): Promise<QuranResource[]> => {
  try {
    const response = await fetch(`${BASE_URL}/resources/recitations?language=en`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.recitations.map((r: any) => ({
      id: r.id,
      name: r.reciter_name,
      style: r.style
    }));
  } catch (error) {
    return [];
  }
};

export const fetchAvailableTafsirs = async (): Promise<TafsirResource[]> => {
  try {
    const response = await fetch(`${BASE_URL}/resources/tafsirs`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.tafsirs.map((t: any) => ({
      id: t.id,
      name: t.name,
      author_name: t.author_name,
      language_name: t.language_name,
      slug: t.slug
    }));
  } catch (error) {
    return [];
  }
};

export const fetchTafsir = async (verseKey: string, tafsirId: number): Promise<string | null> => {
  try {
    const response = await fetch(`${BASE_URL}/quran/tafsirs/${tafsirId}?verse_key=${verseKey}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.tafsirs?.[0]?.text || null;
  } catch (error) {
    return null;
  }
};