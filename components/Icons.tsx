import React from 'react';
import { 
  BookOpen, 
  Compass, 
  Feather, 
  Home, 
  Loader2, 
  Play, 
  Pause, 
  Search, 
  CheckCircle, 
  Quote, 
  Settings, 
  BookText,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Volume2,
  Sparkles,
  AlignRight
} from 'lucide-react';

export const IconHome = ({ className }: { className?: string }) => <Home className={className} />;
export const IconBook = ({ className }: { className?: string }) => <BookOpen className={className} />;
export const IconJournal = ({ className }: { className?: string }) => <Feather className={className} />;
export const IconCompass = ({ className }: { className?: string }) => <Compass className={className} />;
export const IconLoading = ({ className }: { className?: string }) => <Loader2 className={`animate-spin ${className}`} />;
export const IconPlay = ({ className }: { className?: string }) => <Play className={className} />;
export const IconPause = ({ className }: { className?: string }) => <Pause className={className} />;
export const IconSearch = ({ className }: { className?: string }) => <Search className={className} />;
export const IconVerified = ({ className }: { className?: string }) => <CheckCircle className={className} />;
export const IconQuote = ({ className }: { className?: string }) => <Quote className={className} />;
export const IconSettings = ({ className }: { className?: string }) => <Settings className={className} />;
export const IconTafsir = ({ className }: { className?: string }) => <BookText className={className} />;
export const IconChevronDown = ({ className }: { className?: string }) => <ChevronDown className={className} />;
export const IconChevronUp = ({ className }: { className?: string }) => <ChevronUp className={className} />;
export const IconAmbience = ({ className }: { className?: string }) => <CloudRain className={className} />;
export const IconSound = ({ className }: { className?: string }) => <Volume2 className={className} />;
export const IconAI = ({ className }: { className?: string }) => <Sparkles className={className} />;
export const IconAnalysis = ({ className }: { className?: string }) => <AlignRight className={className} />;