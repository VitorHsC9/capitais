import { BarChart3, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenStats: () => void;
}

export const Header = ({ onOpenHelp, onOpenStats }: HeaderProps) => (
  <header className="flex items-center justify-between p-4">
    <div className="flex justify-start">
      <button onClick={onOpenHelp} className="btn-neutral w-10 h-10 rounded-xl">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>

    <h1 className="font-black text-3xl tracking-tight text-[var(--text-primary)] uppercase drop-shadow-md">
      CAPITAIS
    </h1>

    <div className="flex justify-end">
      <button onClick={onOpenStats} className="btn-neutral w-10 h-10 rounded-xl">
        <BarChart3 className="w-6 h-6" />
      </button>
    </div>
  </header>
);