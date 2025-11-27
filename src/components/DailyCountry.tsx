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
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-[var(--tone-5)] rounded-lg text-[var(--tone-2)] hover:text-[var(--tone-1)] transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--tone-2)]">País do Dia</h2>
                    <p className="text-sm font-bold text-[var(--tone-1)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-8"></div>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
                {/* Hints Area */}
                <div className="bg-[var(--tone-5)] rounded-xl p-4 border border-[var(--tone-4)] space-y-4">
                    <div className="text-center mb-2">
                        <h3 className="text-lg font-black text-[var(--tone-1)]">DICAS</h3>
                        <p className="text-xs text-[var(--tone-3)]">Erre para liberar mais dicas</p>
                    </div>

                    {/* Hint 1: Continent (Always visible after 1 miss or if game over) */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${misses >= 1 || isFinished ? 'bg-[var(--bg-color)] opacity-100' : 'bg-[var(--tone-4)] opacity-50 blur-[2px]'}`}>
                        <Globe className="w-5 h-5 text-[var(--tone-2)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-bold uppercase text-[var(--tone-3)]">Continente</div>
                            <div className="font-bold text-[var(--tone-1)]">{(misses >= 1 || isFinished) ? targetCountry.continent : '???'}</div>
                        </div>
                    </div>

                    {/* Hint 2: Population */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${misses >= 2 || isFinished ? 'bg-[var(--bg-color)] opacity-100' : 'bg-[var(--tone-4)] opacity-50 blur-[2px]'}`}>
                        <Users className="w-5 h-5 text-[var(--tone-2)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-bold uppercase text-[var(--tone-3)]">População</div>
                            <div className="font-bold text-[var(--tone-1)]">
                                {(misses >= 2 || isFinished) ? (targetCountry.population ? formatPopulation(targetCountry.population) : 'N/A') : '???'}
                            </div>
                        </div>
                    </div>

                    {/* Hint 3: Neighbors */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${misses >= 3 || isFinished ? 'bg-[var(--bg-color)] opacity-100' : 'bg-[var(--tone-4)] opacity-50 blur-[2px]'}`}>
                        <Map className="w-5 h-5 text-[var(--tone-2)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-bold uppercase text-[var(--tone-3)]">Vizinhos</div>
                            <div className="font-bold text-[var(--tone-1)]">
                                {(misses >= 3 || isFinished) ? (targetCountry.neighboringCountries?.length ? targetCountry.neighboringCountries.join(', ') : 'Nenhum / Ilha') : '???'}
                            </div>
                        </div>
                    </div>

                    {/* Hint 4: Language */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${misses >= 4 || isFinished ? 'bg-[var(--bg-color)] opacity-100' : 'bg-[var(--tone-4)] opacity-50 blur-[2px]'}`}>
                        <Languages className="w-5 h-5 text-[var(--tone-2)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-bold uppercase text-[var(--tone-3)]">Idioma</div>
                            <div className="font-bold text-[var(--tone-1)]">
                                {(misses >= 4 || isFinished) ? (targetCountry.mainLanguage || 'N/A') : '???'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guesses History */}
                <div className="flex flex-col gap-2">
                    {guesses.map((g, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-[var(--tone-5)] border border-[var(--tone-4)] text-[var(--tone-2)]">
                            <div className="w-6 h-6 flex items-center justify-center bg-[var(--color-error)] text-white rounded-full text-xs font-bold">X</div>
                            <span>{g}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="mt-4 relative">
                {lastIncorrectGuess && (
                    <div className="absolute -top-12 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-[var(--color-error)] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Não é {lastIncorrectGuess}
                        </div>
                    </div>
                )}

                {isFinished ? (
                    <div className="bg-[var(--tone-5)] p-4 rounded-xl border border-[var(--tone-4)] animate-in slide-in-from-bottom-4 duration-500 text-center">
                        <div className={`flex items-center justify-center gap-2 ${gameStatus === 'won' ? 'text-[var(--color-correct)]' : 'text-[var(--color-error)]'} font-bold mb-2`}>
                            {gameStatus === 'won' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            <span>{gameStatus === 'won' ? 'VOCÊ ACERTOU!' : 'FIM DE JOGO'}</span>
                        </div>
                        <p className="text-[var(--tone-2)] text-sm mb-4">O país era <strong className="text-[var(--tone-1)] uppercase">{targetCountry.name}</strong></p>

                        <div className="text-center mb-4">
                            <div className="text-xs font-bold text-[var(--tone-3)] mb-1">PRÓXIMO</div>
                            <div className="text-lg font-mono font-bold text-[var(--tone-1)] flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                {timeLeftStr}
                            </div>
                        </div>

                        <button className="w-full py-3 bg-[var(--tone-1)] text-[var(--bg-color)] font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                            <Share2 className="w-4 h-4" /> Compartilhar
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center text-xs font-bold text-[var(--tone-3)] mb-2">
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
