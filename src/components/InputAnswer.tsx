import { useState, type KeyboardEvent } from 'react'; // CORREÇÃO: Adicionado 'type'
import { Send, Check, X as XIcon } from 'lucide-react';

interface InputAnswerProps {
  onSubmit: (answer: string) => void;
  isAnswered: boolean;
  isDark: boolean;
  correctAnswer: string;
}

export const InputAnswer = ({ onSubmit, isAnswered, isDark, correctAnswer }: InputAnswerProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value.trim() || isAnswered) return;
    onSubmit(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getStyles = () => {
    if (isAnswered) {
      const normalize = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      
      const isCorrect = normalize(value) === normalize(correctAnswer);

      if (isCorrect) {
        return {
          container: isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200',
          input: `text-green-600 font-bold border-transparent bg-transparent placeholder-green-300`,
          icon: <Check className="w-6 h-6 text-green-500" />
        };
      } else {
        return {
          container: isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200',
          input: `text-red-500 font-bold border-transparent bg-transparent`,
          icon: <XIcon className="w-6 h-6 text-red-500" />
        };
      }
    }

    return {
      container: isDark ? 'bg-zinc-800/50' : 'bg-white',
      input: `${isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`,
      icon: <Send className={`w-5 h-5 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
    };
  };

  const s = getStyles();

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnswered}
          placeholder="Digite a resposta..."
          className={`${s.input} w-full p-4 pr-12 rounded-xl border text-lg outline-none transition-all`}
          autoFocus
          autoComplete="off"
        />
        <button 
          onClick={handleSubmit}
          disabled={isAnswered || !value.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
        >
          {s.icon}
        </button>
      </div>

      {isAnswered && (
        <div className={`animate-fade-in text-center p-4 rounded-xl border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
          <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            Resposta Correta
          </p>
          <p className="text-xl font-bold">{correctAnswer}</p>
        </div>
      )}
    </div>
  );
};