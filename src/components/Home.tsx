import { Calendar, Play, Trophy } from 'lucide-react';

interface HomeProps {
    onSelectDaily: () => void;
    onSelectPractice: () => void;
}

export function Home({ onSelectDaily, onSelectPractice }: HomeProps) {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--tone-2)] mb-1">Bem-vindo</h2>
                <p className="text-2xl font-bold text-[var(--tone-1)]">Desafios de Hoje</p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2">

                {/* Daily Challenge Card */}
                <button
                    onClick={onSelectDaily}
                    className="w-full text-left p-6 rounded-2xl bg-gradient-to-br from-[var(--tone-5)] to-[var(--bg-color)] border border-[var(--tone-4)] shadow-xl hover:shadow-2xl hover:border-[var(--color-correct)] transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-24 h-24" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-[var(--color-correct)]/20 text-[var(--color-correct)]">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-correct)]">Disponível Agora</span>
                        </div>

                        <h3 className="text-xl font-black text-[var(--tone-1)] mb-2">Bandeira Pixelada</h3>
                        <p className="text-sm text-[var(--tone-2)] font-medium mb-6 max-w-[80%]">
                            Adivinhe o país baseando-se em uma versão pixelada de sua bandeira.
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--tone-1)] group-hover:text-[var(--color-correct)] transition-colors">
                            <span>JOGAR AGORA</span>
                            <Play className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                </button>

                {/* Practice Mode Link */}
                <div className="pt-4 border-t border-[var(--tone-5)]">
                    <button
                        onClick={onSelectPractice}
                        className="w-full p-4 rounded-xl bg-[var(--tone-5)] hover:bg-[var(--tone-4)] border border-[var(--tone-4)] flex items-center justify-between transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-[var(--bg-color)] text-[var(--tone-3)] group-hover:text-[var(--tone-1)] transition-colors">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm text-[var(--tone-1)]">Modos de Prática</div>
                                <div className="text-xs text-[var(--tone-2)]">Treine com Clássico, Bandeiras e mais</div>
                            </div>
                        </div>
                        <div className="text-[var(--tone-3)] group-hover:translate-x-1 transition-transform">
                            <Play className="w-4 h-4" />
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
}
