import { ArrowLeft, Search } from 'lucide-react';
import { useSupremeFinal } from '../hooks/useSupremeFinal';
import { MultiCountryMap } from './MultiCountryMap';

interface SupremeFinalProps {
    onBack: () => void;
}

export function SupremeFinal({ onBack }: SupremeFinalProps) {
    const { input, handleInput, guessedCountries, guessedCapitals, countriesByContinent, highlights, progress, totalPoints, timeLeft, gameStatus, resetGame } = useSupremeFinal();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (gameStatus === 'lost') {
        return (
            <div className="flex flex-col h-full items-center justify-center p-6 animate-in fade-in duration-500">
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-wide text-center">Tempo Esgotado!</h2>
                <p className="text-[var(--text-secondary)] font-bold mb-8 text-center">Você conseguiu {progress} de {totalPoints} pontos.</p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={resetGame}
                        className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all uppercase tracking-wide"
                    >
                        Tentar Novamente
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full py-4 bg-[var(--surface-color)] text-[var(--text-primary)] font-black rounded-xl border-2 border-[var(--border-color)] shadow-[0_4px_0_var(--border-color)] active:shadow-none active:translate-y-[4px] transition-all uppercase tracking-wide"
                    >
                        Voltar ao Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300 relative">
            {/* Header & Input (Sticky) */}
            <div className="flex flex-col gap-4 mb-4 z-10 relative bg-[var(--bg-color)] pb-2">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Supremo Final</h2>
                        <div className="flex items-center justify-center gap-3">
                            <p className="text-sm font-black text-[var(--text-primary)]">{progress} / {totalPoints}</p>
                            <div className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${timeLeft < 60 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-[var(--surface-color)] text-[var(--text-secondary)]'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                    <div className="w-10"></div>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => handleInput(e.target.value)}
                        placeholder="Digite país ou capital..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-yellow-500 transition-colors uppercase"
                        autoFocus
                    />
                </div>
            </div>

            {/* Map Area */}
            <div className="h-64 mb-4 flex-shrink-0">
                <MultiCountryMap highlights={highlights} />
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto pr-2 pb-20">
                {Object.entries(countriesByContinent).map(([continent, countries]) => (
                    <div key={continent} className="mb-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 sticky top-0 bg-[var(--bg-color)] py-2 z-10 border-b border-[var(--border-color)]">
                            {continent}
                        </h3>
                        <div className="flex flex-col gap-2">
                            {countries.map(country => {
                                const hasCountry = guessedCountries.has(country.code);
                                const hasCapital = guessedCapitals.has(country.code);
                                const isFull = hasCountry && hasCapital;
                                const isPartial = hasCountry || hasCapital;

                                return (
                                    <div
                                        key={country.code}
                                        className={`p-2 rounded-lg border-2 flex items-center gap-2 transition-all
                                            ${isFull
                                                ? 'bg-[var(--color-correct)]/10 border-[var(--color-correct)]'
                                                : isPartial
                                                    ? 'bg-yellow-500/10 border-yellow-500'
                                                    : 'bg-[var(--surface-color)] border-[var(--border-color)]'
                                            }`}
                                    >
                                        {/* Country Slot */}
                                        <div className={`flex-1 p-2 rounded text-center text-sm font-bold transition-all
                                            ${hasCountry ? 'text-[var(--text-primary)] bg-[var(--bg-color)]/50' : 'text-transparent bg-[var(--border-color)]/20'}`}>
                                            {country.name}
                                        </div>

                                        {/* Capital Slot */}
                                        <div className={`flex-1 p-2 rounded text-center text-sm font-bold transition-all
                                            ${hasCapital ? 'text-[var(--text-primary)] bg-[var(--bg-color)]/50' : 'text-transparent bg-[var(--border-color)]/20'}`}>
                                            {country.capital}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
