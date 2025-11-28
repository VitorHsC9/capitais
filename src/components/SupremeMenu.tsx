import { ArrowLeft, Map, Globe, Trophy } from 'lucide-react';

interface SupremeMenuProps {
    onBack: () => void;
    onSelectCapitals: () => void;
    onSelectCountries: () => void;
    onSelectFinal: () => void;
}

export function SupremeMenu({ onBack, onSelectCapitals, onSelectCountries, onSelectFinal }: SupremeMenuProps) {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Desafios Supremos</h2>
                    <p className="text-xl font-black text-[var(--text-primary)]">Escolha seu Desafio</p>
                </div>
            </div>

            <div className="grid gap-4 overflow-y-auto pr-2 pb-20">

                {/* Mode 1: Capitals */}
                <button
                    onClick={onSelectCapitals}
                    className="group relative overflow-hidden rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] p-4 sm:p-6 text-left transition-all hover:border-[var(--color-secondary)] hover:shadow-lg active:scale-[0.98]"
                >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] group-hover:bg-[var(--color-secondary)] group-hover:text-white transition-colors">
                            <Map className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-[var(--bg-color)] text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-color)]">
                            195 Capitais
                        </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mb-1">Supremo Capitais</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        O mapa está vazio. Digite o nome de cada capital para preenchê-lo. Os países estão organizados por continente.
                    </p>
                </button>

                {/* Mode 2: Countries */}
                <button
                    onClick={onSelectCountries}
                    className="group relative overflow-hidden rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] p-4 sm:p-6 text-left transition-all hover:border-[var(--color-primary)] hover:shadow-lg active:scale-[0.98]"
                >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                            <Globe className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-[var(--bg-color)] text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-color)]">
                            195 Países
                        </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mb-1">Supremo Países</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        Você conhece todos os países? Digite seus nomes para revelar sua localização no mapa.
                    </p>
                </button>

                {/* Mode 3: Final */}
                <button
                    onClick={onSelectFinal}
                    className="group relative overflow-hidden rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] p-4 sm:p-6 text-left transition-all hover:border-yellow-500 hover:shadow-lg active:scale-[0.98]"
                >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                            <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-[var(--bg-color)] text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-color)]">
                            O Desafio Final
                        </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mb-1">Supremo Final</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        O teste definitivo. Acerte o país E a capital para dominar o mapa. Amarelo para acerto parcial, verde para total.
                    </p>
                </button>

            </div>
        </div>
    );
}
