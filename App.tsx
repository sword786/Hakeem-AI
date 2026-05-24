import React, { useState, useEffect } from 'react';
import { View, HakeemVerse, JournalEntry, DailyAyahState, AppSettings, SearchMode } from './types';
import { getContextualVerses, getDailyAyahSuggestion } from './services/geminiService';
import { fetchMultipleVerses, fetchVerseDetails, searchQuranText, DEFAULT_TRANSLATION_ID, DEFAULT_RECITER_ID, DEFAULT_TAFSIR_ID } from './services/quranService';
import { VerseCard } from './components/VerseCard';
import { DailyAyahCard } from './components/DailyAyahCard';
import { MushafReader } from './components/MushafReader';
import { SettingsView } from './components/SettingsView';
import { AmbiencePlayer } from './components/AmbiencePlayer';
import { IconHome, IconJournal, IconBook, IconSearch, IconLoading, IconCompass, IconSettings, IconAI } from './components/Icons';
import { AlarmTester } from './AlarmTester';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  
  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    translationId: DEFAULT_TRANSLATION_ID,
    reciterId: DEFAULT_RECITER_ID,
    tafsirId: DEFAULT_TAFSIR_ID,
    showTafsir: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(SearchMode.AI);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<HakeemVerse[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dailyAyah, setDailyAyah] = useState<HakeemVerse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize: Load Settings & Journal & Daily Ayah
  useEffect(() => {
    // Settings
    const savedSettings = localStorage.getItem('hakeem_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Journal
    const savedJournal = localStorage.getItem('hakeem_journal');
    if (savedJournal) {
      setJournalEntries(JSON.parse(savedJournal));
    }

    // Daily Ayah Logic
    const loadDailyAyah = async () => {
      const today = new Date().toISOString().split('T')[0];
      const savedDaily = localStorage.getItem('hakeem_daily_ayah');
      
      let currentTranslation = DEFAULT_TRANSLATION_ID;
      if (savedSettings) {
        currentTranslation = JSON.parse(savedSettings).translationId;
      }

      if (savedDaily) {
        const parsed: DailyAyahState = JSON.parse(savedDaily);
        if (parsed.date === today && parsed.verse) {
          setDailyAyah(parsed.verse);
          return;
        }
      }

      // Fetch new daily ayah
      try {
        const suggestion = await getDailyAyahSuggestion();
        if (suggestion) {
          // Use current settings for daily ayah too
          const verse = await fetchVerseDetails(suggestion, currentTranslation, DEFAULT_RECITER_ID);
          if (verse) {
            setDailyAyah(verse);
            localStorage.setItem('hakeem_daily_ayah', JSON.stringify({
              date: today,
              verse: verse
            }));
          }
        }
      } catch (e) {
        console.error("Could not fetch daily ayah");
      }
    };

    loadDailyAyah();
  }, []);

  // Update Settings handler
  const handleSaveSettings = (translationId: number, reciterId: number, tafsirId: number) => {
    const newSettings = { ...settings, translationId, reciterId, tafsirId };
    setSettings(newSettings);
    localStorage.setItem('hakeem_settings', JSON.stringify(newSettings));
    setCurrentView(View.HOME);
    setSearchResults([]);
    setSearchQuery(''); 
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      if (searchMode === SearchMode.AI) {
        // 1. Get suggestions from Gemini
        const suggestions = await getContextualVerses(searchQuery);
        
        if (suggestions.length === 0) {
          setError("I couldn't find a direct connection in the Quran for that specific query. Try rephrasing.");
          setIsSearching(false);
          return;
        }

        // 2. Fetch real data from Quran.com using CURRENT SETTINGS
        const verses = await fetchMultipleVerses(suggestions, settings.translationId, settings.reciterId);
        setSearchResults(verses);
      } else {
        // STANDARD TEXT SEARCH
        const verses = await searchQuranText(searchQuery, settings.translationId, settings.reciterId);
        if (verses.length === 0) {
           setError("No verses found matching your keyword.");
        }
        setSearchResults(verses);
      }
    } catch (err) {
      setError("Something went wrong while seeking guidance. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const addToJournal = (verse: HakeemVerse) => {
    if (journalEntries.some(e => e.verse.surahNumber === verse.surahNumber && e.verse.ayahNumber === verse.ayahNumber)) {
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      verse,
      note: "",
      mood: searchQuery || "Daily Reflection",
    };
    
    const updatedJournal = [newEntry, ...journalEntries];
    setJournalEntries(updatedJournal);
    localStorage.setItem('hakeem_journal', JSON.stringify(updatedJournal));
    setCurrentView(View.JOURNAL); 
  };

  const updateJournalNote = (id: string, note: string) => {
    const updatedJournal = journalEntries.map(entry => 
      entry.id === id ? { ...entry, note } : entry
    );
    setJournalEntries(updatedJournal);
    localStorage.setItem('hakeem_journal', JSON.stringify(updatedJournal));
  };

  const deleteJournalEntry = (id: string) => {
    const updatedJournal = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updatedJournal);
    localStorage.setItem('hakeem_journal', JSON.stringify(updatedJournal));
  };

  const getSavedKeys = () => {
    return new Set(journalEntries.map(e => `${e.verse.surahNumber}:${e.verse.ayahNumber}`));
  }

  const renderHome = () => (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-hakeem-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconCompass className="w-8 h-8 text-hakeem-emerald" />
        </div>
        <h1 className="text-4xl font-serif text-hakeem-emerald font-bold mb-4">Hakeem AI</h1>
        <p className="text-stone-600 text-lg mb-8 max-w-md mx-auto">
          Your spiritual GPS. Tell me how you're feeling, or search the text directly.
        </p>

        {/* Search Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-full border border-stone-200 shadow-sm flex items-center">
             <button 
                onClick={() => setSearchMode(SearchMode.AI)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${searchMode === SearchMode.AI ? 'bg-hakeem-emerald text-white shadow-md' : 'text-stone-500 hover:text-hakeem-emerald'}`}
             >
                <IconAI className="w-4 h-4" /> Ask AI
             </button>
             <button 
                onClick={() => setSearchMode(SearchMode.TEXT)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${searchMode === SearchMode.TEXT ? 'bg-hakeem-emerald text-white shadow-md' : 'text-stone-500 hover:text-hakeem-emerald'}`}
             >
                <IconSearch className="w-4 h-4" /> Text Search
             </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchMode === SearchMode.AI ? "e.g., I'm feeling anxious..." : "e.g., Musa, Mercy, Paradise..."}
            className="w-full px-6 py-4 rounded-full border-2 border-hakeem-emerald/20 focus:border-hakeem-emerald focus:outline-none focus:ring-4 focus:ring-hakeem-emerald/10 shadow-sm text-stone-800 placeholder-stone-400 bg-white transition-all"
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-2 bg-hakeem-emerald text-white p-2.5 rounded-full hover:bg-hakeem-emerald/90 transition-colors disabled:opacity-50"
          >
            {isSearching ? <IconLoading className="w-5 h-5" /> : <IconSearch className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {dailyAyah && !isSearching && searchResults.length === 0 && (
        <div className="mb-10">
          <DailyAyahCard verse={dailyAyah} onJournal={addToJournal} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 text-center border border-red-100">
          {error}
        </div>
      )}

      <div>
        {searchResults.map((verse) => (
          <VerseCard 
            key={`${verse.surahNumber}:${verse.ayahNumber}`} 
            verse={verse} 
            onJournal={addToJournal}
            isSaved={journalEntries.some(e => e.verse.surahNumber === verse.surahNumber && e.verse.ayahNumber === verse.ayahNumber)}
            tafsirId={settings.tafsirId}
          />
        ))}
      </div>

      {/* Safety Disclaimer */}
      {!isSearching && searchResults.length === 0 && (
        <div className="mt-12 text-center border-t border-stone-200 pt-8 pb-4">
          <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
            <strong className="block text-stone-500 mb-1">Disclaimer</strong>
            This AI is a tool for reflection. For formal rulings, please consult a qualified scholar.
          </p>
        </div>
      )}
    </div>
  );

  const renderJournal = () => (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-8">
      <h2 className="text-3xl font-serif text-hakeem-emerald font-bold mb-8">Reflection Journal</h2>
      
      {journalEntries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-300">
          <IconJournal className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">Your journal is empty.</p>
        </div>
      ) : (
        journalEntries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-hakeem-gold uppercase tracking-wider">
                {new Date(entry.timestamp).toLocaleDateString()}
              </span>
              <button 
                onClick={() => deleteJournalEntry(entry.id)}
                className="text-stone-400 hover:text-red-500 text-xs transition-colors"
              >
                Delete
              </button>
            </div>
            
            <div className="mb-4 opacity-75">
              <p className="font-serif text-stone-700 italic text-sm line-clamp-2">
                "{entry.verse.translation}"
              </p>
              <p className="text-xs text-stone-500 mt-1">
                — Surah {entry.verse.surahNameEnglish} ({entry.verse.surahNumber}:{entry.verse.ayahNumber})
              </p>
            </div>

            <textarea
              value={entry.note}
              onChange={(e) => updateJournalNote(entry.id, e.target.value)}
              placeholder="Write your reflections here..."
              className="w-full bg-hakeem-cream p-4 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-hakeem-emerald/20 min-h-[100px] resize-y font-sans"
            />
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-hakeem-cream font-sans">
      <div className="h-1 bg-hakeem-emerald w-full fixed top-0 z-50"></div>

      <main className="pt-6 min-h-[90vh]">
        {currentView === View.HOME && renderHome()}
        {currentView === View.JOURNAL && renderJournal()}
        {currentView === View.MUSHAF && (
          <MushafReader 
            onJournal={addToJournal} 
            savedVerseKeys={getSavedKeys()} 
            tafsirId={settings.tafsirId}
          />
        )}
        {currentView === View.SETTINGS && (
          <SettingsView 
            currentTranslationId={settings.translationId} 
            currentReciterId={settings.reciterId} 
            currentTafsirId={settings.tafsirId}
            onSave={handleSaveSettings} 
          />
        )}
      </main>
      
      {/* Floating Ambience Player */}
      <AmbiencePlayer />

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-around items-center max-w-md mx-auto h-16">
          <button
            onClick={() => setCurrentView(View.HOME)}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              currentView === View.HOME ? 'text-hakeem-emerald' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <IconHome className="w-6 h-6" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          
          <button
            onClick={() => setCurrentView(View.MUSHAF)}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              currentView === View.MUSHAF ? 'text-hakeem-emerald' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <IconBook className="w-6 h-6" />
            <span className="text-[10px] font-bold">Read</span>
          </button>

          <button
            onClick={() => setCurrentView(View.JOURNAL)}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              currentView === View.JOURNAL ? 'text-hakeem-emerald' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <IconJournal className="w-6 h-6" />
            <span className="text-[10px] font-bold">Reflect</span>
          </button>

          <button
            onClick={() => setCurrentView(View.SETTINGS)}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              currentView === View.SETTINGS ? 'text-hakeem-emerald' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <IconSettings className="w-6 h-6" />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
        <AlarmTester />
      </nav>
    </div>
  );
}
