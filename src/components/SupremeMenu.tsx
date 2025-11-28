import { ArrowLeft, Map, Globe, Trophy, Play, Star, Crown } from 'lucide-react';

interface SupremeMenuProps {
    onBack: () => void;
    onSelectCapitals: () => void;
    onSelectCountries: () => void;
    onSelectFinal: () => void;
}

export function SupremeMenu({ onBack, onSelectCapitals, onSelectCountries, onSelectFinal }: SupremeMenuProps) {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                        <Crown className="w-3 h-3" />
                        Modo Hardcore
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-primary)] italic">
                        Desafios <span className="text-yellow-500">Supremos</span>
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-4">

                {/* Mode 1: Capitals */}
                <button
                    onClick={onSelectCapitals}
                    className="w-full group relative overflow-hidden rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] p-6 text-left transition-all hover:border-yellow-500 hover:shadow-lg active:scale-[0.98]"
                >
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
                                <Map className="w-8 h-8" />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-[var(--bg-color)] text-[10px] font-black text-[var(--text-secondary)] border border-[var(--border-color)] uppercase tracking-wider flex items-center gap-1.5">
                                <Star className="w-3 h-3 fill-current" />
                                195 Capitais
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-wide">
                            Supremo Capitais
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed mb-6">
                            O mapa está vazio. Digite o nome de cada capital para preenchê-lo. Os países estão organizados por continente.
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-yellow-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            Começar Desafio <Play className="w-3 h-3 fill-current" />
                        </div>
                    </div>
                </button>

                {/* Mode 2: Countries */}
                <button
                    onClick={onSelectCountries}
                    className="w-full group relative overflow-hidden rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg active:scale-[0.98]"
                >
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                <Globe className="w-8 h-8" />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-[var(--bg-color)] text-[10px] font-black text-[var(--text-secondary)] border border-[var(--border-color)] uppercase tracking-wider flex items-center gap-1.5">
                                <Star className="w-3 h-3 fill-current" />
                                195 Países
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-wide">
                            Supremo Países
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed mb-6">
                            Você conhece todos os países? Digite seus nomes para revelar sua localização no mapa.
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            Começar Desafio <Play className="w-3 h-3 fill-current" />
                        </div>
                    </div>
                </button>

                {/* Mode 3: Final */}
                <button
                    onClick={onSelectFinal}
                    className="w-full group relative overflow-hidden rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] p-6 text-left transition-all hover:border-purple-500 hover:shadow-lg active:scale-[0.98]"
                >
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-[var(--bg-color)] text-[10px] font-black text-[var(--text-secondary)] border border-[var(--border-color)] uppercase tracking-wider flex items-center gap-1.5">
                                <Crown className="w-3 h-3 fill-current" />
                                O Desafio Final
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-wide">
                            Supremo Final
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed mb-6">
                            O teste definitivo. Acerte o país E a capital para dominar o mapa. Amarelo para acerto parcial, verde para total.
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            Começar Desafio <Play className="w-3 h-3 fill-current" />
                        </div>
                    </div>
                </button>

            </div>
        </div>
    );
}
