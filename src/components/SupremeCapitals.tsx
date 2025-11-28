import { ArrowLeft, Search, Trophy, Clock, Map } from 'lucide-react';
import { useSupremeCapitals } from '../hooks/useSupremeCapitals';
import { MultiCountryMap } from './MultiCountryMap';

interface SupremeCapitalsProps {
    onBack: () => void;
}

export function SupremeCapitals({ onBack }: SupremeCapitalsProps) {
    const { input, handleInput, guessedCodes, countriesByContinent, highlights, progress, totalCountries, timeLeft, gameStatus, resetGame } = useSupremeCapitals();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (gameStatus === 'lost') {
        return (
            <div className="flex flex-col h-full items-center justify-center p-6 animate-in fade-in duration-500">
                <div className="text-6xl mb-6 animate-bounce">⏰</div>
                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tighter text-center">Tempo Esgotado!</h2>
                <p className="text-[var(--text-secondary)] font-medium mb-8 text-center max-w-xs">
                    Você conseguiu dominar <span className="text-yellow-600 font-bold">{progress}</span> de <span className="text-[var(--text-primary)] font-bold">{totalCountries}</span> capitais.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={resetGame}
                        className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
                    >
                        Tentar Novamente
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full py-4 bg-[var(--surface-color)] text-[var(--text-primary)] font-black rounded-xl border-2 border-[var(--border-color)] hover:border-[var(--text-primary)] active:scale-[0.98] transition-all uppercase tracking-widest"
                    >
                        Voltar ao Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
            {/* Header & Input (Sticky) */}
            <div className="flex flex-col gap-4 mb-4 z-10 relative bg-[var(--bg-color)] pb-4 pt-4 px-4 border-b border-[var(--border-color)] shadow-sm">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                            <Map className="w-3 h-3" />
                            Supremo Capitais
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="text-xl font-black text-[var(--text-primary)] tabular-nums">{progress} <span className="text-sm text-[var(--text-secondary)]">/ {totalCountries}</span></span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                                <Clock className="w-3 h-3" />
                                <span className="text-sm font-mono font-bold tabular-nums">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-10"></div>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--text-secondary)] group-focus-within:text-yellow-500 transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => handleInput(e.target.value)}
                        placeholder="DIGITE UMA CAPITAL..."
                        className="w-full pl-10 pr-4 py-4 rounded-xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all uppercase tracking-wider"
                        autoFocus
                    />
                </div>
            </div>

            {/* Map Area */}
            <div className="h-64 mb-4 flex-shrink-0 px-4">
                <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[var(--border-color)] bg-[var(--surface-color)] relative">
                    <MultiCountryMap highlights={highlights} />
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-8">
                {Object.entries(countriesByContinent).map(([continent, countries]) => (
                    <div key={continent}>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-4 flex items-center gap-2 after:h-px after:flex-1 after:bg-[var(--border-color)]">
                            {continent}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {countries.map(country => {
                                const isGuessed = guessedCodes.has(country.code);
                                return (
                                    <div
                                        key={country.code}
                                        className={`p-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group
                                            ${isGuessed
                                                ? 'bg-yellow-500/10 border-yellow-500'
                                                : 'bg-[var(--surface-color)] border-[var(--border-color)]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <span className={`font-bold text-sm transition-colors ${isGuessed ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                {country.name}
                                            </span>
                                            {isGuessed ? (
                                                <span className="font-black text-xs text-yellow-600 uppercase tracking-wider animate-in fade-in slide-in-from-right-4">
                                                    {country.capital}
                                                </span>
                                            ) : (
                                                <div className="h-1.5 w-12 bg-[var(--border-color)] rounded-full" />
                                            )}
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
