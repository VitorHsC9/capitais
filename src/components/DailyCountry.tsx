import { useState, useEffect } from 'react';
import { useDailyCountry } from '../hooks/useDailyCountry';
import { Clock, CheckCircle, Share2, ArrowLeft, AlertCircle, Users, Globe, Languages, Map } from 'lucide-react';
import { CountryAutocomplete } from './CountryAutocomplete';

interface DailyCountryProps {
    onBack: () => void;
}

function formatPopulation(pop: number): string {
    if (pop < 1000000) {
        return `Menos de 1 milhão`;
    }
    const millions = pop / 1000000;
    const lower = Math.floor(millions * 0.8);
    const upper = Math.ceil(millions * 1.2);
    return `Entre ${lower} e ${upper} milhões`;
}

export function DailyCountry({ onBack }: DailyCountryProps) {
    const { targetCountry, gameStatus, guesses, submitGuess, nextDailyTime, maxAttempts } = useDailyCountry();
    const [timeLeftStr, setTimeLeftStr] = useState('');
    const [lastIncorrectGuess, setLastIncorrectGuess] = useState<string | null>(null);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = nextDailyTime - now;

            if (distance < 0) {
                setTimeLeftStr("00:00:00");
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeftStr(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextDailyTime]);

    const handleGuess = (guess: string) => {
        if (!targetCountry) return;
        const normalizedGuess = guess.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedTarget = targetCountry.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (normalizedGuess !== normalizedTarget) {
            setLastIncorrectGuess(guess);
            setTimeout(() => setLastIncorrectGuess(null), 2000);
        }
        submitGuess(guess);
    };

    if (!targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    const isFinished = gameStatus !== 'playing';
    const misses = guesses.length;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-10 relative">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">País do Dia</h2>
                    <p className="text-sm font-black text-[var(--text-primary)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4 px-1">
                {/* Hints Area */}
                <div className="bg-[var(--surface-color)] rounded-2xl p-4 border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] space-y-4">
                    <div className="text-center mb-2">
                        <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wide">DICAS</h3>
                        <p className="text-xs text-[var(--text-secondary)] font-bold">Erre para liberar mais dicas</p>
                    </div>

                    {/* Hint 1: Continent (Always visible after 1 miss or if game over) */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${misses >= 1 || isFinished ? 'bg-[var(--bg-color)] border-[var(--border-color)] opacity-100' : 'bg-[var(--surface-color)] border-transparent opacity-50 blur-[2px]'}`}>
                        <Globe className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Continente</div>
                            <div className="font-bold text-[var(--text-primary)]">{(misses >= 1 || isFinished) ? targetCountry.continent : '???'}</div>
                        </div>
                    </div>

                    {/* Hint 2: Population */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${misses >= 2 || isFinished ? 'bg-[var(--bg-color)] border-[var(--border-color)] opacity-100' : 'bg-[var(--surface-color)] border-transparent opacity-50 blur-[2px]'}`}>
                        <Users className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">População</div>
                            <div className="font-bold text-[var(--text-primary)]">
                                {(misses >= 2 || isFinished) ? (targetCountry.population ? formatPopulation(targetCountry.population) : 'N/A') : '???'}
                            </div>
                        </div>
                    </div>

                    {/* Hint 3: Neighbors */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${misses >= 3 || isFinished ? 'bg-[var(--bg-color)] border-[var(--border-color)] opacity-100' : 'bg-[var(--surface-color)] border-transparent opacity-50 blur-[2px]'}`}>
                        <Map className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Vizinhos</div>
                            <div className="font-bold text-[var(--text-primary)]">
                                {(misses >= 3 || isFinished) ? (targetCountry.neighboringCountries?.length ? targetCountry.neighboringCountries.join(', ') : 'Nenhum / Ilha') : '???'}
                            </div>
                        </div>
                    </div>

                    {/* Hint 4: Language */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${misses >= 4 || isFinished ? 'bg-[var(--bg-color)] border-[var(--border-color)] opacity-100' : 'bg-[var(--surface-color)] border-transparent opacity-50 blur-[2px]'}`}>
                        <Languages className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Idioma</div>
                            <div className="font-bold text-[var(--text-primary)]">
                                {(misses >= 4 || isFinished) ? (targetCountry.mainLanguage || 'N/A') : '???'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guesses History */}
                <div className="flex flex-col gap-2">
                    {guesses.map((g, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm p-3 rounded-xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] font-bold">
                            <div className="w-6 h-6 flex items-center justify-center bg-[var(--color-error)] text-white rounded-lg text-xs font-black border-2 border-black/10">X</div>
                            <span>{g}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="mt-4 relative px-4 pb-4">
                {lastIncorrectGuess && (
                    <div className="absolute -top-16 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300 z-20">
                        <div className="bg-[var(--color-error)] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 border-2 border-white/20">
                            <AlertCircle className="w-4 h-4" />
                            Não é {lastIncorrectGuess}
                        </div>
                    </div>
                )}

                {isFinished ? (
                    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] animate-in slide-in-from-bottom-4 duration-500 text-center">
                        <div className={`flex items-center justify-center gap-2 ${gameStatus === 'won' ? 'text-[var(--color-correct)]' : 'text-[var(--color-error)]'} font-black mb-2`}>
                            {gameStatus === 'won' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            <span className="uppercase tracking-wide">{gameStatus === 'won' ? 'VOCÊ ACERTOU!' : 'FIM DE JOGO'}</span>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm mb-6 font-bold">O país era <strong className="text-[var(--text-primary)] uppercase">{targetCountry.name}</strong></p>

                        <div className="text-center mb-6">
                            <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">PRÓXIMO</div>
                            <div className="text-lg font-mono font-bold text-[var(--text-primary)] flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                {timeLeftStr}
                            </div>
                        </div>

                        <button className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                            <Share2 className="w-4 h-4" /> Compartilhar
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                            Tentativa {guesses.length + 1} de {maxAttempts}
                        </div>
                        <CountryAutocomplete
                            onSelect={handleGuess}
                            placeholder="Digite o nome do país..."
                        />
                    </>
                )}
            </div>
        </div>
    );
}
