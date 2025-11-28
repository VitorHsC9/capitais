import { useState } from 'react';
import { Play, Trophy, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useDailyStatus } from '../hooks/useDailyStatus';

interface HomeProps {
    onSelectDaily: () => void;
    onSelectDailyAnagram: () => void;
    onSelectDailyWordle: () => void;
    onSelectDailyMap: () => void;
    onSelectDailyCountry: () => void;
    onSelectDailyMix: () => void;
    onSelectPractice: () => void;
}

interface GameCardProps {
    title: string;
    description: string;
    imageSrc: string;
    onClick: () => void;
    colorClass: string; // e.g., "group-hover:bg-pink-500"
    isCompleted?: boolean;
    timeLeft?: string;
}

function GameCard({ title, description, imageSrc, onClick, colorClass, isCompleted, timeLeft }: GameCardProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <button
            onClick={onClick}
            className="game-card p-4 group flex flex-col items-start text-left h-full relative overflow-hidden"
        >
            <div className="mb-4 w-full aspect-video rounded-xl overflow-hidden border-2 border-[var(--border-color)] shadow-sm relative bg-[var(--surface-color)]">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-color)] z-10">
                        <Loader2 className="w-8 h-8 text-[var(--text-secondary)] animate-spin" />
                    </div>
                )}
                <img
                    src={imageSrc}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    alt={title}
                    onLoad={() => setIsLoading(false)}
                />

                {/* Completed Overlay */}
                {isCompleted && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-20 animate-in fade-in duration-300">
                        <div className="bg-[var(--color-correct)] p-1.5 rounded-full mb-1 shadow-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-black uppercase tracking-widest text-[10px] mb-1">Completo</div>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs bg-black/40 px-2 py-1 rounded-lg border border-white/20">
                            <Clock className="w-3 h-3" />
                            {timeLeft}
                        </div>
                    </div>
                )}
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-wide">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] font-bold mb-6 flex-1">
                {description}
            </p>
            <div className={`w-full py-2 rounded-lg bg-[var(--bg-color)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest text-center group-hover:text-white transition-colors ${colorClass}`}>
                {isCompleted ? 'VER RESULTADO' : 'JOGAR'}
            </div>
        </button>
    );
}

export function Home({ onSelectDaily, onSelectDailyAnagram, onSelectDailyWordle, onSelectDailyMap, onSelectDailyCountry, onSelectDailyMix, onSelectPractice }: HomeProps) {
    const dailyStatus = useDailyStatus();

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--tone-2)] mb-1">Bem-vindo</h2>
                <p className="text-2xl font-bold text-[var(--tone-1)]">Desafios de Hoje</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-20">

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <GameCard
                        title="Desafio Mix"
                        description="10 perguntas variadas. Errou, perdeu!"
                        imageSrc="/assets/home_mix.png"
                        onClick={onSelectDailyMix}
                        colorClass="group-hover:bg-pink-500"
                        isCompleted={dailyStatus.mix.isCompleted}
                        timeLeft={dailyStatus.mix.timeLeft}
                    />

                    <GameCard
                        title="Bandeiras"
                        description="Adivinhe o país pela bandeira pixelada."
                        imageSrc="/assets/BandeiraDoBrasil.png"
                        onClick={onSelectDaily}
                        colorClass="group-hover:bg-[var(--color-primary)]"
                        isCompleted={dailyStatus.flag.isCompleted}
                        timeLeft={dailyStatus.flag.timeLeft}
                    />

                    <GameCard
                        title="Capital"
                        description="Desembaralhe as letras da capital."
                        imageSrc="/assets/Tajmahal.jpg"
                        onClick={onSelectDailyAnagram}
                        colorClass="group-hover:bg-[var(--color-secondary)]"
                        isCompleted={dailyStatus.anagram.isCompleted}
                        timeLeft={dailyStatus.anagram.timeLeft}
                    />

                    <GameCard
                        title="Termo"
                        description="Descubra a capital em 5 tentativas."
                        imageSrc="/assets/wordle.jpg"
                        onClick={onSelectDailyWordle}
                        colorClass="group-hover:bg-purple-500"
                        isCompleted={dailyStatus.wordle.isCompleted}
                        timeLeft={dailyStatus.wordle.timeLeft}
                    />

                    <GameCard
                        title="Mapa"
                        description="Identifique o país no mapa."
                        imageSrc="/assets/mapapais.jpg"
                        onClick={onSelectDailyMap}
                        colorClass="group-hover:bg-emerald-500"
                        isCompleted={dailyStatus.map.isCompleted}
                        timeLeft={dailyStatus.map.timeLeft}
                    />

                    <GameCard
                        title="País"
                        description="Descubra o país com dicas."
                        imageSrc="/assets/globalmap.jpg"
                        onClick={onSelectDailyCountry}
                        colorClass="group-hover:bg-orange-500"
                        isCompleted={dailyStatus.country.isCompleted}
                        timeLeft={dailyStatus.country.timeLeft}
                    />
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
