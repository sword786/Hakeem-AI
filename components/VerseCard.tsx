import React, { useState, useEffect } from 'react';
import { HakeemVerse } from '../types';
import { IconVerified, IconQuote, IconTafsir, IconChevronDown, IconChevronUp, IconLoading, IconAnalysis } from './Icons';
import { AudioPlayer } from './AudioPlayer';
import { fetchTafsir, DEFAULT_TAFSIR_ID } from '../services/quranService';

interface VerseCardProps {
  verse: HakeemVerse;
  onJournal: (verse: HakeemVerse) => void;
  isSaved?: boolean;
  tafsirId?: number;
}

export const VerseCard: React.FC<VerseCardProps> = ({ 
  verse, 
  onJournal, 
  isSaved,
  tafsirId = DEFAULT_TAFSIR_ID 
}) => {
  const [showTafsir, setShowTafsir] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [tafsirContent, setTafsirContent] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  
  // Bismillah Logic: First Verse of Surah, but not Surah 9 (Tawbah) nor Surah 1 (Fatiha - as it's part of the text usually, but API separates it. Let's add it for all except 9 and 1 if text doesn't have it).
  // Actually, standard Mushaf prints Bismillah at top of block. 
  const shouldShowBismillah = verse.ayahNumber === 1 && verse.surahNumber !== 9 && verse.surahNumber !== 1;

  useEffect(() => {
    if (showTafsir) {
        setTafsirContent(null);
        loadTafsir();
    }
  }, [tafsirId]);

  const loadTafsir = async () => {
    setLoadingTafsir(true);
    const text = await fetchTafsir(`${verse.surahNumber}:${verse.ayahNumber}`, tafsirId);
    setTafsirContent(text);
    setLoadingTafsir(false);
  };

  const handleToggleTafsir = async () => {
    if (showAnalysis) setShowAnalysis(false); // Close analysis if opening Tafsir
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }

    setShowTafsir(true);
    if (!tafsirContent) {
      await loadTafsir();
    }
  };

  const handleToggleAnalysis = () => {
    if (showTafsir) setShowTafsir(false); // Close Tafsir if opening Analysis
    setShowAnalysis(!showAnalysis);
  }

  const isArabicTafsir = tafsirContent && /[\u0600-\u06FF]/.test(tafsirContent.substring(0, 50));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 mb-6 relative overflow-hidden transition-all hover:shadow-md group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-hakeem-gold/5 rounded-bl-full -mr-10 -mt-10 z-0 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="font-serif text-lg text-hakeem-emerald font-bold">
            {verse.surahNameEnglish}
          </h3>
          <p className="text-xs text-stone-500 uppercase tracking-wider">
            Surah {verse.surahNumber}, Ayah {verse.ayahNumber}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-hakeem-emerald/5 px-2 py-1 rounded-md border border-hakeem-emerald/10">
          <IconVerified className="w-3 h-3 text-hakeem-emerald" />
          <span className="text-[10px] font-semibold text-hakeem-emerald">Verified</span>
        </div>
      </div>

      {/* Bismillah Header */}
      {shouldShowBismillah && (
        <div className="text-center mb-8">
            <span className="font-arabic text-2xl text-stone-600">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
        </div>
      )}

      {/* Arabic Text - Enlarge font for "World Class" readability */}
      <div className="mb-8 text-right px-1" dir="rtl">
        <p className="font-arabic text-4xl leading-[2.2] text-stone-800 antialiased">
          {verse.arabicText}
        </p>
      </div>

      {/* Translation */}
      <div className="mb-6">
        <p className="font-serif text-stone-700 italic leading-relaxed text-lg">
          "{verse.translation}"
        </p>
      </div>

      {/* AI Context */}
      {verse.aiExplanation && (
        <div className="bg-hakeem-sand/50 p-4 rounded-lg border-l-4 border-hakeem-gold mb-6">
          <h4 className="text-xs font-bold text-stone-500 uppercase mb-1 flex items-center gap-2">
            <IconQuote className="w-3 h-3" /> AI Context
          </h4>
          <p className="text-sm text-stone-600 leading-relaxed">
            {verse.aiExplanation}
          </p>
        </div>
      )}

      {/* Actions Row */}
      <div className="flex flex-wrap gap-3 items-center justify-between pt-4 border-t border-stone-100">
        <AudioPlayer src={verse.audioUrl} />
        
        <div className="flex gap-2">
          {/* Word Analysis Button */}
          <button
            onClick={handleToggleAnalysis}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showAnalysis 
                ? 'bg-hakeem-emerald text-white' 
                : 'text-stone-500 hover:bg-stone-100'
            }`}
            title="Word Analysis"
          >
            <IconAnalysis className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze</span>
          </button>

          <button
            onClick={handleToggleTafsir}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showTafsir 
                ? 'bg-stone-100 text-stone-600' 
                : 'text-hakeem-emerald hover:bg-hakeem-emerald/5'
            }`}
          >
            <IconTafsir className="w-4 h-4" />
            <span className="hidden sm:inline">Tafsir</span>
            {showTafsir ? <IconChevronUp className="w-3 h-3" /> : <IconChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={() => onJournal(verse)}
            disabled={isSaved}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isSaved 
                ? 'bg-stone-100 text-stone-400 cursor-default' 
                : 'bg-hakeem-emerald text-white hover:bg-hakeem-emerald/90'
            }`}
          >
            {isSaved ? 'Saved' : 'Reflect'}
          </button>
        </div>
      </div>

      {/* Word-by-Word Analysis Section */}
      {showAnalysis && (
        <div className="mt-6 pt-4 border-t border-stone-100 animate-in slide-in-from-top-2 duration-300">
             <h4 className="text-xs font-bold text-hakeem-emerald uppercase mb-4 flex items-center gap-2">
                <IconAnalysis className="w-3 h-3" /> Word-by-Word Analysis
            </h4>
            <div className="flex flex-wrap flex-row-reverse gap-4 justify-center">
                {verse.words.map((word, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-hakeem-sand/30 transition-colors min-w-[60px]">
                        <span className="font-arabic text-xl mb-1 text-stone-800">{word.text_uthmani}</span>
                        <span className="text-[10px] text-stone-500 uppercase font-bold">{word.translation?.text}</span>
                        <span className="text-[9px] text-stone-400 italic">{word.transliteration?.text}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Expanded Tafsir Section */}
      {showTafsir && (
        <div className="mt-6 pt-4 border-t border-stone-100 animate-in slide-in-from-top-2 duration-300">
          <h4 className="text-xs font-bold text-hakeem-emerald uppercase mb-2 flex items-center gap-2">
             Tafsir Commentary
          </h4>
          {loadingTafsir ? (
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <IconLoading className="w-4 h-4" /> Loading commentary...
            </div>
          ) : tafsirContent ? (
            <div 
              className={`text-sm text-stone-600 leading-relaxed font-serif prose prose-sm max-w-none prose-p:mb-2 prose-a:text-hakeem-emerald ${isArabicTafsir ? 'font-arabic text-right text-lg' : ''}`}
              dir={isArabicTafsir ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: tafsirContent }} 
            />
          ) : (
            <p className="text-sm text-stone-400 italic">No detailed Tafsir available for this verse.</p>
          )}
        </div>
      )}
    </div>
  );
};