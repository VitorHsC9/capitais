import { Check, X as XIcon } from 'lucide-react';
import type { Country } from '../data/countries';
import type { GameMode } from '../hooks/useQuizGame';

interface OptionButtonProps {
  option: Country;
  idx: number;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  onSelect: () => void;
  isDark: boolean;
  mode: GameMode;
}

export const OptionButton = ({ 
  option, idx, isSelected, isCorrect, isAnswered, onSelect, isDark, mode
}: OptionButtonProps) => {
  
  // Se for clássico (País -> Capital), mostramos a Capital como opção.
  // Nos modos Reverso (Capital -> País) e Bandeiras, mostramos o Nome do País.
  const label = mode === 'classic' ? option.capital : option.name;

  const getStyles = () => {
    const base = "group w-full p-4 border rounded-xl transition-all duration-200 flex items-center justify-between gap-4";
    
    if (isAnswered) {
      if (isCorrect) {
        return {
          container: `${base} shadow-sm ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`,
          text: `font-medium text-base truncate flex-grow text-center ${isDark ? 'text-green-400 font-bold' : 'text-green-800 font-bold'}`,
          badge: `flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-200 text-green-800'}`,
          icon: <Check className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        };
      }
      if (isSelected) {
        return {
          container: `${base} shadow-sm ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`,
          text: `font-medium text-base truncate flex-grow text-center ${isDark ? 'text-red-400' : 'text-red-800'}`,
          badge: `flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-200 text-red-800'}`,
          icon: <XIcon className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
        };
      }
      return {
        container: `${base} ${isDark ? 'opacity-40 bg-slate-800 border-slate-700' : 'opacity-50 bg-slate-50 border-slate-100'}`,
        text: "font-medium text-base truncate flex-grow text-center",
        badge: `flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`,
        icon: null
      };
    }

    return {
      container: `${base} ${
        isDark 
          ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md'
      }`,
      text: "font-medium text-base truncate flex-grow text-center",
      badge: `flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
        isDark 
          ? 'bg-zinc-700 text-zinc-400 group-hover:bg-zinc-600 group-hover:text-white'
          : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
      }`,
      icon: null
    };
  };

  const s = getStyles();

  return (
    <button disabled={isAnswered} onClick={onSelect} className={s.container}>
      <div className="flex-shrink-0 w-8 flex justify-start">
        <span className={s.badge}>{String.fromCharCode(65 + idx)}</span>
      </div>
      <span className={s.text}>{label}</span>
      <div className="flex-shrink-0 w-8 flex justify-end">
         {s.icon || <div className="w-6 h-6" />} 
      </div>
    </button>
  );
};