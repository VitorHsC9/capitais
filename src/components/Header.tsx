import { BarChart3, HelpCircle, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const Header = ({ onOpenHelp, onOpenStats, onOpenSettings }: HeaderProps) => (
  <header className="flex items-center justify-between h-[60px] border-b border-[var(--tone-4)] select-none shrink-0">
    <div className="flex gap-1">
       <button onClick={onOpenHelp} className="p-2 rounded hover:bg-[var(--tone-5)] transition-colors">
         <HelpCircle className="w-5 h-5 text-[var(--tone-2)]" />
       </button>
    </div>
    
    <h1 className="font-serif font-bold text-3xl tracking-wider text-[var(--tone-1)] uppercase">
      CAPITAIS
    </h1>

    <div className="flex justify-end gap-1">
       <button onClick={onOpenStats} className="p-2 rounded hover:bg-[var(--tone-5)] transition-colors">
         <BarChart3 className="w-5 h-5 text-[var(--tone-2)]" />
       </button>
       <button onClick={onOpenSettings} className="p-2 rounded hover:bg-[var(--tone-5)] transition-colors">
         <Settings className="w-5 h-5 text-[var(--tone-2)]" />
       </button>
    </div>
  </header>
);