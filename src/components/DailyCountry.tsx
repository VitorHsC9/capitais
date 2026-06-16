import { useState } from 'react';
import { useDailyCountry } from '../hooks/useDailyCountry';
import { useCountdown } from '../hooks/useCountdown';
import { ArrowLeft, AlertCircle, Users, Globe, Languages, Map } from 'lucide-react';
import { CountryAutocomplete } from './CountryAutocomplete';
import { DailyResultCard } from './DailyResultCard';

interface DailyCountryProps {
    readonly onBack: () => void;
    readonly onNextChallenge: () => void;
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

const normalizeGuess = (guess: string) => guess.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const getHintClass = (isVisible: boolean) => {
    if (isVisible) return 'bg-[var(--bg-color)] border-[var(--border-color)] opacity-100';
    return 'bg-[var(--surface-color)] border-transparent opacity-50 blur-[2px]';
};

const getPopulationHint = (population?: number) => {
    if (!population) return 'N/A';
    return formatPopulation(population);
};

const getNeighborsHint = (neighboringCountries?: string[]) => {
    if (!neighboringCountries?.length) return 'Nenhum / Ilha';
    return neighboringCountries.join(', ');
};

export function DailyCountry({ onBack, onNextChallenge }: DailyCountryProps) {
    const { targetCountry, gameStatus, guesses, submitGuess, nextDailyTime, maxAttempts } = useDailyCountry();
    const timeLeftStr = useCountdown(nextDailyTime);
    const [lastIncorrectGuess, setLastIncorrectGuess] = useState<string | null>(null);

    const handleGuess = (guess: string) => {
        if (!targetCountry) return;
        const normalizedGuess = normalizeGuess(guess);
        const normalizedTarget = normalizeGuess(targetCountry.name);

        if (normalizedGuess !== normalizedTarget) {
            setLastIncorrectGuess(guess);
            setTimeout(() => setLastIncorrectGuess(null), 2000);
        }
        submitGuess(guess);
    };

    if (!targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    const isFinished = gameStatus !== 'playing';
    const misses = guesses.length;
    const showContinentHint = misses >= 1 || isFinished;
    const showPopulationHint = misses >= 2 || isFinished;
    const showNeighborsHint = misses >= 3 || isFinished;
    const showLanguageHint = misses >= 4 || isFinished;

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
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${getHintClass(showContinentHint)}`}>
                        <Globe className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Continente</div>
                            <div className="font-bold text-[var(--text-primary)]">{showContinentHint ? targetCountry.continent : '???'}</div>
                        </div>
                    </div>

                    {/* Hint 2: Population */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${getHintClass(showPopulationHint)}`}>
                        <Users className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">População</div>
                            <div className="font-bold text-[var(--text-primary)]">
                                {showPopulationHint ? getPopulationHint(targetCountry.population) : '???'}
                            </div>
                        </div>
                    </div>

                    {/* Hint 3: Neighbors */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${getHintClass(showNeighborsHint)}`}>
                        <Map className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Vizinhos</div>
                            <div className="font-bold text-[var(--text-primary)]">
                                {showNeighborsHint ? getNeighborsHint(targetCountry.neighboringCountries) : '???'}
                            </div>
                        </div>
                    </div>

                    {/* Hint 4: Language */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${getHintClass(showLanguageHint)}`}>
                        <Languages className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Idioma</div>
                            <div className="font-bold text-[var(--text-primary)]">
                                {showLanguageHint ? (targetCountry.mainLanguage || 'N/A') : '???'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guesses History */}
                <div className="flex flex-col gap-2">
                    {guesses.map((g) => (
                        <div key={g} className="flex items-center gap-2 text-sm p-3 rounded-xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] font-bold">
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
                    <DailyResultCard
                        gameStatus={gameStatus}
                        countryName={targetCountry.name}
                        timeLeftStr={timeLeftStr}
                        onNextChallenge={onNextChallenge}
                    />
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
