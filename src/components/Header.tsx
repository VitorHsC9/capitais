import { MapPin, Sun, Moon, X } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onExit: () => void;
  isPlaying: boolean;
}

export const Header = ({ isDark, toggleTheme, onExit, isPlaying }: HeaderProps) => (
  <header className="px-6 py-6 flex justify-between items-center relative z-10">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white'}`}>
        <MapPin className="w-4 h-4" />
      </div>
      <h1 className="text-lg font-bold tracking-tight">Quiz Capitais</h1>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      {isPlaying && (
        <button onClick={onExit} className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  </header>
);