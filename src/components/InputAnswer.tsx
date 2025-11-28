import { useState, useEffect, type KeyboardEvent } from 'react';
import { Check, CornerDownLeft } from 'lucide-react';

interface InputAnswerProps {
  onSubmit: (answer: string) => void;
  isAnswered: boolean;
  correctAnswer: string;
  nextQuestion: () => void;
  isDark: boolean;
  placeholder?: string;
}

export const InputAnswer = ({ onSubmit, isAnswered, correctAnswer, nextQuestion, placeholder }: InputAnswerProps) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [correctAnswer]);

  const handleSubmit = () => {
    if (!value.trim() || isAnswered) return;
    onSubmit(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isAnswered) nextQuestion();
      else handleSubmit();
    }
  };

  const normalize = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const isCorrect = isAnswered && normalize(value) === normalize(correctAnswer);

  return (
    <div className="w-full space-y-3">
      <div className={`
        flex items-center justify-between border-2 rounded px-4 py-3 transition-colors
        ${isAnswered
          ? (isCorrect ? 'border-[var(--color-correct)] bg-[var(--color-correct)] text-white' : 'border-[var(--color-error)] text-[var(--color-error)]')
          : 'border-[var(--tone-4)] bg-transparent focus-within:border-[var(--tone-2)] text-[var(--tone-1)]'}
      `}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnswered}
          placeholder={placeholder || "DIGITE AQUI..."}
          className="bg-transparent border-none outline-none w-full text-lg font-bold uppercase placeholder:text-[var(--tone-4)]"
          autoFocus
          autoComplete="off"
        />
        {isAnswered && isCorrect && <Check className="w-6 h-6" />}
        {!isAnswered && <CornerDownLeft className="w-4 h-4 text-[var(--tone-3)]" />}
      </div>

      {isAnswered && !isCorrect && (
        <div className="flex flex-col items-center justify-center p-3 bg-[var(--tone-5)] rounded animate-bounce border border-[var(--tone-4)]">
          <span className="text-[10px] font-bold text-[var(--tone-2)] uppercase tracking-widest">Resposta Correta</span>
          <span className="text-lg font-black uppercase text-[var(--tone-1)]">{correctAnswer}</span>
        </div>
      )}

      {!isAnswered && (
        <button onClick={handleSubmit} disabled={!value.trim()} className="btn-termo py-4 w-full bg-[var(--tone-2)] text-[var(--bg-color)] font-black">
          ENVIAR
        </button>
      )}

      {isAnswered && (
        <button onClick={nextQuestion} className="btn-termo py-4 w-full bg-[var(--tone-1)] text-[var(--bg-color)] font-black animate-pulse">
          PRÓXIMA
        </button>
      )}
    </div>
  );
};