import { MapPin, Building2, Flag, Zap, PenTool, Skull, Shuffle } from 'lucide-react';
import type { GameMode } from '../hooks/useQuizGame';

interface PracticeModesProps {
    onSelectMode: (mode: GameMode) => void;
}

export function PracticeModes({ onSelectMode }: PracticeModesProps) {
    const modes = [
        { id: 'classic', icon: MapPin, title: 'CLÁSSICO', desc: 'País para Capital' },
        { id: 'reverse', icon: Building2, title: 'REVERSO', desc: 'Capital para País' },
        { id: 'flags', icon: Flag, title: 'BANDEIRAS', desc: 'Identifique a Bandeira' },
        { id: 'suddenDeath', icon: Zap, title: 'MORTE SÚBITA', desc: '5 Segundos' },
        { id: 'writing', icon: PenTool, title: 'ESCRITA', desc: 'Digite o nome' },
        { id: 'survival', icon: Skull, title: 'SOBREVIVÊNCIA', desc: 'Errou, Perdeu!' },
        { id: 'anagram', icon: Shuffle, title: 'ANAGRAMA', desc: 'Desembaralhe a Capital' },
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--tone-2)] mb-1">Prática</h2>
                <p className="text-2xl font-bold text-[var(--tone-1)]">Escolha o Modo</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => onSelectMode(m.id as GameMode)}
                        className="w-full text-left p-4 rounded-xl bg-[var(--tone-5)] hover:bg-[var(--tone-4)] border border-[var(--tone-4)] flex items-center gap-4 transition-all group active:scale-[0.98] hover:border-[var(--tone-3)] hover:shadow-lg"
                    >
                        <div className="p-3 rounded-lg bg-[var(--bg-color)] text-[var(--tone-2)] group-hover:text-[var(--color-correct)] transition-colors">
                            <m.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-base text-[var(--tone-1)]">{m.title}</div>
                            <div className="text-xs text-[var(--tone-2)] font-medium">{m.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
