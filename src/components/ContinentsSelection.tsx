import { ChevronLeft, Globe } from 'lucide-react';
import type { Continent } from '../data/countries';

const continentsList: Continent[] = [
    'América do Sul',
    'Europa',
    'Ásia',
    'América do Norte',
    'América Central',
    'África',
    'Oceania',
    'Todos'
];

interface ContinentsSelectionProps {
    onBack: () => void;
    onSelect: (continent: Continent) => void;
}

export function ContinentsSelection({ onBack, onSelect }: ContinentsSelectionProps) {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Configuração</h2>
                    <p className="text-xl font-black text-[var(--text-primary)]">Selecione a Região</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2">
                {continentsList.map((c) => (
                    <button
                        key={c}
                        onClick={() => onSelect(c)}
                        className="w-full text-left p-4 rounded-xl bg-[var(--surface-color)] hover:bg-[var(--bg-color)] border-2 border-[var(--border-color)] flex items-center justify-between transition-all active:scale-[0.98] hover:border-[var(--text-primary)] group"
                    >
                        <span className="font-bold text-sm text-[var(--text-primary)]">{c}</span>
                        <Globe className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                    </button>
                ))}
            </div>
        </div>
    );
}
