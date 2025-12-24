import React, { useState, useRef } from 'react';
import { IconAmbience, IconPause, IconPlay, IconSound } from './Icons';

export const AmbiencePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState(false);
  
  // Using a reliable source from Google Actions Sound Library (OGG format supported by most modern browsers)
  // Fallback to a standard reliable MP3 if needed, but OGG is generally fine for web apps now.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const SRC = "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg";

  const togglePlay = () => {
    if (!audioRef.current || error) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error("Ambience playback failed:", error);
            setIsPlaying(false);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (val: number) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const handleError = () => {
    console.error("Ambience audio source failed to load");
    setError(true);
    setIsPlaying(false);
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <audio 
        ref={audioRef} 
        src={SRC} 
        loop 
        preload="none" 
        onError={handleError}
      />
      
      {isOpen && (
        <div className="mb-4 bg-white p-4 rounded-xl shadow-lg border border-stone-100 w-48 animate-in slide-in-from-bottom-2">
          <h4 className="text-xs font-bold text-stone-500 uppercase mb-3 flex items-center gap-2">
            <IconAmbience className="w-3 h-3" /> Focus Mode
          </h4>
          
          <div className="flex items-center justify-between mb-3">
             <span className="text-sm font-serif text-hakeem-emerald">Gentle Rain</span>
             <button 
               onClick={togglePlay} 
               disabled={error}
               className={`text-hakeem-emerald hover:bg-hakeem-emerald/10 p-1 rounded-full ${error ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                {isPlaying ? <IconPause className="w-5 h-5" /> : <IconPlay className="w-5 h-5" />}
             </button>
          </div>

          {!error ? (
            <div className="flex items-center gap-2">
                <IconSound className="w-3 h-3 text-stone-400" />
                <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={volume}
                onChange={(e) => handleVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-hakeem-emerald"
                />
            </div>
          ) : (
            <div className="text-xs text-red-400">Audio unavailable</div>
          )}
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isPlaying ? 'bg-hakeem-emerald text-white animate-pulse' : 'bg-white text-stone-400 hover:text-hakeem-emerald'
        }`}
      >
        <IconAmbience className="w-6 h-6" />
      </button>
    </div>
  );
};