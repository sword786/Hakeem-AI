import React, { useEffect, useState } from 'react';
import { QuranResource, TafsirResource } from '../types';
import { fetchAvailableReciters, fetchAvailableTafsirs, fetchAvailableTranslations } from '../services/quranService';
import { IconLoading } from './Icons';

interface SettingsViewProps {
  currentTranslationId: number;
  currentReciterId: number;
  currentTafsirId: number;
  onSave: (translationId: number, reciterId: number, tafsirId: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  currentTranslationId, 
  currentReciterId, 
  currentTafsirId,
  onSave 
}) => {
  const [translations, setTranslations] = useState<QuranResource[]>([]);
  const [reciters, setReciters] = useState<QuranResource[]>([]);
  const [tafsirs, setTafsirs] = useState<TafsirResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Local state for form
  const [selectedTrans, setSelectedTrans] = useState(currentTranslationId);
  const [selectedReciter, setSelectedReciter] = useState(currentReciterId);
  const [selectedTafsir, setSelectedTafsir] = useState(currentTafsirId);

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      const [t, r, taf] = await Promise.all([
        fetchAvailableTranslations(),
        fetchAvailableReciters(),
        fetchAvailableTafsirs()
      ]);
      setTranslations(t);
      setReciters(r);
      // Sort tafsirs to put English/Arabic at top for convenience, or just alphabetically
      setTafsirs(taf.sort((a, b) => a.language_name.localeCompare(b.language_name)));
      setLoading(false);
    };
    loadResources();
  }, []);

  const handleSave = () => {
    onSave(selectedTrans, selectedReciter, selectedTafsir);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-hakeem-emerald">
        <IconLoading className="w-8 h-8 mb-4" />
        <p>Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-8">
      <h2 className="text-3xl font-serif text-hakeem-emerald font-bold mb-8">Settings</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 mb-6">
        <h3 className="text-lg font-bold text-stone-800 mb-4">Quran Preferences</h3>
        
        {/* Translation Selector */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-stone-500 mb-2">Translation</label>
          <select 
            value={selectedTrans}
            onChange={(e) => setSelectedTrans(Number(e.target.value))}
            className="w-full p-3 rounded-lg border border-stone-200 bg-white focus:border-hakeem-emerald focus:ring-1 focus:ring-hakeem-emerald outline-none"
          >
            {translations.map(t => (
              <option key={t.id} value={t.id}>
                {t.language_name} - {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tafsir Selector */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-stone-500 mb-2">Tafsir (Commentary)</label>
          <select 
            value={selectedTafsir}
            onChange={(e) => setSelectedTafsir(Number(e.target.value))}
            className="w-full p-3 rounded-lg border border-stone-200 bg-white focus:border-hakeem-emerald focus:ring-1 focus:ring-hakeem-emerald outline-none"
          >
            {tafsirs.map(t => (
              <option key={t.id} value={t.id}>
                 {t.language_name} - {t.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-400 mt-2">
            Choose between English or Arabic Tafsirs (e.g., Ibn Kathir, Al-Jalalayn).
          </p>
        </div>

        {/* Reciter Selector */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-stone-500 mb-2">Audio Recitation</label>
          <select 
            value={selectedReciter}
            onChange={(e) => setSelectedReciter(Number(e.target.value))}
            className="w-full p-3 rounded-lg border border-stone-200 bg-white focus:border-hakeem-emerald focus:ring-1 focus:ring-hakeem-emerald outline-none"
          >
            {reciters.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} {r.style ? `(${r.style})` : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-hakeem-emerald text-white font-bold rounded-lg hover:bg-hakeem-emerald/90 transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>

      <div className="text-center text-stone-400 text-xs mt-8">
        <p>Hakeem AI v1.2.0</p>
        <p className="mt-1">Data provided by Quran.com API</p>
      </div>
    </div>
  );
};