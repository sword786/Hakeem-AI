import React, { useState, useRef, useEffect } from 'react';
import { IconPause, IconPlay, IconLoading } from './Icons';

interface AudioPlayerProps {
  src: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset state if src changes
    setIsPlaying(false);
    setHasError(false);
    setIsLoading(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false);
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Playback failed:", error);
            setIsLoading(false);
            setIsPlaying(false);
            // Don't set error immediately on interruption, only on actual failure handled by onError
          });
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    console.error("Audio source failed to load:", src);
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
  };

  if (!src) return null;

  if (hasError) {
      return (
          <div className="mt-4 text-xs text-stone-400 italic">
              Audio unavailable
          </div>
      )
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={handleEnded}
        onError={handleError}
        preload="none"
      />
      <button 
        onClick={togglePlay}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hakeem-emerald/10 text-hakeem-emerald hover:bg-hakeem-emerald/20 transition-colors text-sm font-medium disabled:opacity-70"
      >
        {isLoading ? (
            <IconLoading className="w-4 h-4" />
        ) : isPlaying ? (
            <IconPause className="w-4 h-4" />
        ) : (
            <IconPlay className="w-4 h-4" />
        )}
        {isLoading ? 'Loading...' : isPlaying ? 'Pause Recitation' : 'Listen'}
      </button>
    </div>
  );
};