import { Play, Trophy } from 'lucide-react';

interface HomeProps {
    onSelectDaily: () => void;
    onSelectDailyAnagram: () => void;
    onSelectDailyWordle: () => void;
    onSelectDailyMap: () => void;
    onSelectDailyCountry: () => void;
    onSelectDailyMix: () => void;
    onSelectPractice: () => void;
}

export function Home({ onSelectDaily, onSelectDailyAnagram, onSelectDailyWordle, onSelectDailyMap, onSelectDailyCountry, onSelectDailyMix, onSelectPractice }: HomeProps) {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--tone-2)] mb-1">Bem-vindo</h2>
                <p className="text-2xl font-bold text-[var(--tone-1)]">Desafios de Hoje</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-20">

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {/* Daily Challenge Card - Mix */}
                    <button
                        onClick={onSelectDailyMix}
                        className="game-card p-4 group flex flex-col items-start text-left"
                    >
                        <div className="mb-4 w-full aspect-video rounded-xl overflow-hidden border-2 border-[var(--border-color)] shadow-sm relative bg-[var(--surface-color)]">
                            <img src="/assets/home_mix.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Desafio Mix" />
                        </div>
                        <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-wide">Desafio Mix</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-bold mb-6 flex-1">
                            10 perguntas variadas. Errou, perdeu!
                        </p>
                        <div className="w-full py-2 rounded-lg bg-[var(--bg-color)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest text-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                            JOGAR
                        </div>
                    </button>

                    {/* Daily Challenge Card - Flag */}
                    <button
                        onClick={onSelectDaily}
                        className="game-card p-4 group flex flex-col items-start text-left"
                    >
                        <div className="mb-4 w-full aspect-video rounded-xl overflow-hidden border-2 border-[var(--border-color)] shadow-sm relative bg-[var(--surface-color)]">
                            <img src="/assets/BandeiraDoBrasil.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Bandeiras" />
                        </div>
                        <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-wide">Bandeiras</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-bold mb-6 flex-1">
                            Adivinhe o país pela bandeira pixelada.
                        </p>
                        <div className="w-full py-2 rounded-lg bg-[var(--bg-color)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest text-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                            JOGAR
                        </div>
                    </button>

                    {/* Daily Challenge Card - Anagram */}
                    <button
                        onClick={onSelectDailyAnagram}
                        className="game-card p-4 group flex flex-col items-start text-left"
                    >
                        <div className="mb-4 w-full aspect-video rounded-xl overflow-hidden border-2 border-[var(--border-color)] shadow-sm relative bg-[var(--surface-color)]">
                            <img src="/assets/Tajmahal.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Capital" />
                        </div>
                        <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-wide">Capital</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-bold mb-6 flex-1">
                            Desembaralhe as letras da capital.
                        </p>
                        <div className="w-full py-2 rounded-lg bg-[var(--bg-color)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest text-center group-hover:bg-[var(--color-secondary)] group-hover:text-white transition-colors">
                            JOGAR
                        </div>
                    </button>

                    {/* Daily Challenge Card - Wordle */}
                    <button
                        onClick={onSelectDailyWordle}
                        className="game-card p-4 group flex flex-col items-start text-left"
                    >
                        <div className="mb-4 w-full aspect-video rounded-xl overflow-hidden border-2 border-[var(--border-color)] shadow-sm relative bg-[var(--surface-color)]">
                            <img src="/assets/wordle.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Termo" />
                        </div>
                        <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-wide">Termo</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-bold mb-6 flex-1">
                            Descubra a capital em 5 tentativas.
                        </p>
                        <div className="w-full py-2 rounded-lg bg-[var(--bg-color)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest text-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            JOGAR
                        </div>
                    </button>

                    {/* Daily Challenge Card - Map */}
                    <button
                        onClick={onSelectDailyMap}
                        className="game-card p-4 group flex flex-col items-start text-left"
                    >
                        <div className="mb-4 w-full aspect-video rounded-xl overflow-hidden border-2 border-[var(--border-color)] shadow-sm relative bg-[var(--surface-color)]">
                            <img src="/assets/mapapais.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Mapa" />
                        </div>
                        <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-wide">Mapa</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-bold mb-6 flex-1">
                            Identifique o país no mapa.
                        </p>
                        <div className="w-full py-2 rounded-lg bg-[var(--bg-color)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest text-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            JOGAR
                        </div>
                    </button>

                    {/* Daily Challenge Card - Country */}
                    <button
                        onClick={onSelectDailyCountry}
                        className="game-card p-4 group flex flex-col items-start text-left"
                    >
                        <div className="mb-4 w-full aspect-video rounded-xl overflow-hidden border-2 border-[var(--border-color)] shadow-sm relative bg-[var(--surface-color)]">
                            <img src="/assets/globalmap.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="País" />
                        </div>
                        <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-wide">País</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-bold mb-6 flex-1">
                            Descubra o país com dicas.
                        </p>
                        <div className="w-full py-2 rounded-lg bg-[var(--bg-color)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest text-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            JOGAR
                        </div>
                    </button>
                </div>

                {/* Practice Mode Link */}
                <div className="pt-4 border-t-2 border-[var(--border-color)]">
                    <button
                        onClick={onSelectPractice}
                        className="game-card w-full p-4 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-[var(--bg-color)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="font-extrabold text-lg text-[var(--text-primary)] uppercase">Modos de Prática</div>
                                <div className="text-xs font-bold text-[var(--text-secondary)]">Treine sem limites</div>
                            </div>
                        </div>
                        <div className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform">
                            <Play className="w-6 h-6 fill-current" />
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
}
