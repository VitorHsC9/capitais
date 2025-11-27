import type { Country } from '../data/countries';
import type { GameMode } from '../hooks/useQuizGame';

interface OptionButtonProps {
  option: Country;
  idx: number;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  onSelect: () => void;
  mode: GameMode;
  isDark: boolean; // Mantido por compatibilidade
}

export const OptionButton = ({ 
  option, idx, isSelected, isCorrect, isAnswered, onSelect, mode
}: OptionButtonProps) => {
  
  const label = mode === 'classic' ? option.capital : option.name;

  let btnClass = "font-bold uppercase rounded flex items-center justify-center select-none transition-all text-sm sm:text-base min-h-[56px] w-full relative ";

  if (isAnswered) {
    if (isCorrect) {
      btnClass += "bg-[var(--color-correct)] text-white border-transparent";
    } else if (isSelected) {
      btnClass += "bg-[var(--tone-4)] text-[var(--color-error)] border-2 border-[var(--color-error)]"; 
    } else {
      btnClass += "bg-[var(--tone-4)] opacity-40";
    }
  } else {
    btnClass += "bg-[var(--key-bg)] text-[var(--bg-color)] hover:opacity-90 active:bg-[var(--tone-3)]";
  }

  return (
    <button disabled={isAnswered} onClick={onSelect} className={btnClass}>
      {/* Dica de Atalho para Desktop */}
      {!isAnswered && (
        <span className="absolute left-3 text-[10px] opacity-30 hidden sm:block font-mono">
          {idx + 1}
        </span>
      )}
      {label}
    </button>
  );
};