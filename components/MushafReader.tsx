import React, { useState, useEffect } from 'react';
import { QuranChapter, HakeemVerse, AppSettings } from '../types';
import { fetchChapters, fetchChapterVerses, DEFAULT_TRANSLATION_ID, DEFAULT_RECITER_ID } from '../services/quranService';
import { VerseCard } from './VerseCard';
import { IconLoading, IconSearch, IconChevronDown } from './Icons';

interface MushafReaderProps {
  onJournal: (verse: HakeemVerse) => void;
  savedVerseKeys: Set<string>; // 'surah:ayah'
  tafsirId?: number;
}

export const MushafReader: React.FC<MushafReaderProps> = ({ 
  onJournal, 
  savedVerseKeys,
  tafsirId 
}) => {
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<QuranChapter | null>(null);
  const [verses, setVerses] = useState<HakeemVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const getSettings = () => {
    const saved = localStorage.getItem('hakeem_settings');
    if (saved) return JSON.parse(saved);
    return { translationId: DEFAULT_TRANSLATION_ID, reciterId: DEFAULT_RECITER_ID };
  };

  useEffect(() => {
    const loadChapters = async () => {
      setLoading(true);
      const data = await fetchChapters();
      setChapters(data);
      setLoading(false);
    };
    loadChapters();
  }, []);

  const handleChapterClick = async (chapter: QuranChapter) => {
    setSelectedChapter(chapter);
    setVerses([]);
    setPage(1);
    setLoading(true);
    
    const settings = getSettings();
    const chapterVerses = await fetchChapterVerses(
      chapter.id, 
      settings.translationId, 
      settings.reciterId, 
      1, 
      chapter
    );
    
    setVerses(chapterVerses);
    setLoading(false);
  };

  const loadMoreVerses = async () => {
    if (!selectedChapter) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    const settings = getSettings();
    
    const newVerses = await fetchChapterVerses(
      selectedChapter.id, 
      settings.translationId, 
      settings.reciterId, 
      nextPage, 
      selectedChapter
    );
    
    setVerses(prev => [...prev, ...newVerses]);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleBack = () => {
    setSelectedChapter(null);
    setVerses([]);
    setPage(1);
  };

  const filteredChapters = chapters.filter(c => 
    c.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.name_arabic.includes(searchTerm) ||
    String(c.id).includes(searchTerm)
  );

  if (selectedChapter) {
    const hasMore = verses.length < selectedChapter.verses_count;

    return (
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <button 
          onClick={handleBack}
          className="mb-4 text-hakeem-emerald font-bold text-sm flex items-center gap-1 hover:underline mt-4"
        >
          ← Back to Surahs
        </button>
        
        <div className="text-center mb-8 border-b border-stone-200 pb-6">
          <h2 className="text-3xl font-serif text-hakeem-emerald font-bold mb-2">{selectedChapter.name_simple}</h2>
          <p className="font-arabic text-2xl text-stone-600 mb-2">{selectedChapter.name_arabic}</p>
          <p className="text-xs text-stone-400 uppercase tracking-widest">{selectedChapter.revelation_place} • {selectedChapter.verses_count} Verses</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <IconLoading className="w-8 h-8 text-hakeem-emerald" />
          </div>
        ) : (
          <div>
            {verses.map((verse) => (
              <VerseCard 
                key={`${verse.surahNumber}:${verse.ayahNumber}`} 
                verse={verse} 
                onJournal={onJournal}
                isSaved={savedVerseKeys.has(`${verse.surahNumber}:${verse.ayahNumber}`)}
                tafsirId={tafsirId}
              />
            ))}
            
            {hasMore && (
              <div className="flex justify-center mt-8 mb-8">
                <button 
                  onClick={loadMoreVerses}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white border border-hakeem-emerald text-hakeem-emerald rounded-full font-bold hover:bg-hakeem-emerald hover:text-white transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingMore ? <IconLoading className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />}
                  {loadingMore ? 'Loading...' : 'Load Next Verses'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-4">
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Search Surah name or number..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-hakeem-emerald focus:outline-none focus:ring-2 focus:ring-hakeem-emerald/10 bg-white"
        />
        <IconSearch className="w-5 h-5 text-stone-400 absolute left-3 top-3.5" />
      </div>

      {loading && chapters.length === 0 ? (
        <div className="flex justify-center py-20">
            <IconLoading className="w-8 h-8 text-hakeem-emerald" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredChapters.map((chapter) => (
            <button 
              key={chapter.id}
              onClick={() => handleChapterClick(chapter)}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-hakeem-emerald/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-hakeem-sand flex items-center justify-center text-hakeem-emerald font-bold text-sm font-serif">
                  {chapter.id}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-stone-800 group-hover:text-hakeem-emerald transition-colors">{chapter.name_simple}</h3>
                  <p className="text-xs text-stone-500">{chapter.translated_name.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-arabic text-xl text-stone-600">{chapter.name_arabic}</p>
                <p className="text-[10px] text-stone-400">{chapter.verses_count} Verses</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};