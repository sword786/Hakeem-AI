import React from 'react';
import { HakeemVerse } from '../types';
import { IconQuote, IconPlay, IconPause } from './Icons';
import { AudioPlayer } from './AudioPlayer';

interface DailyAyahCardProps {
  verse: HakeemVerse;
  onJournal: (verse: HakeemVerse) => void;
}

export const DailyAyahCard: React.FC<DailyAyahCardProps> = ({ verse, onJournal }) => {
  return (
    <div className="bg-gradient-to-br from-hakeem-emerald to-[#043E2F] rounded-2xl p-6 text-white mb-8 shadow-lg relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold tracking-[0.2em] text-hakeem-gold uppercase">Daily Wisdom</span>
          <span className="text-xs text-white/60">
            {verse.surahNameEnglish} {verse.surahNumber}:{verse.ayahNumber}
          </span>
        </div>

        <p className="font-serif text-xl leading-relaxed italic mb-4 text-hakeem-cream/90">
          "{verse.translation}"
        </p>

        {verse.aiExplanation && (
          <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm">
            <p className="text-xs text-hakeem-cream/80 leading-relaxed">
              {verse.aiExplanation}
            </p>
          </div>
        )}

        <div className="flex gap-3 items-center mt-2">
            <button 
                onClick={() => onJournal(verse)}
                className="bg-hakeem-gold text-hakeem-emerald px-4 py-2 rounded-full text-xs font-bold hover:bg-[#E5C158] transition-colors"
            >
                Reflect
            </button>
            {/* Custom light audio player for dark card */}
            <div className="flex-1">
                <AudioPlayer src={verse.audioUrl} />
            </div>
        </div>
      </div>
    </div>
  );
};