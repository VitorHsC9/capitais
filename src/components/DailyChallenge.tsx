import { useState, useEffect } from 'react';
import { PixelatedFlag } from './PixelatedFlag';
import { CountryAutocomplete } from './CountryAutocomplete';
import { useDailyGame } from '../hooks/useDailyGame';
import { Clock, CheckCircle, XCircle, Share2, ArrowLeft, ArrowRight } from 'lucide-react';

interface DailyChallengeProps {
    onBack: () => void;
    onNextChallenge: () => void;
}

export function DailyChallenge({ onBack, onNextChallenge }: DailyChallengeProps) {
    const { targetCountry, guesses, gameStatus, submitGuess, attemptsLeft, nextDailyTime } = useDailyGame();
    const [timeLeftStr, setTimeLeftStr] = useState('');

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = nextDailyTime - now;

            if (distance < 0) {
                setTimeLeftStr("00:00:00");
                // Optionally trigger a reload or re-check here
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeftStr(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextDailyTime]);

    if (!targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    const isFinished = gameStatus !== 'playing';

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header simplificado */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Desafio Diário</h2>
                    <p className="text-sm font-black text-[var(--text-primary)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">

                {/* Flag Area */}
                <div className="relative w-full max-w-[320px]">
                    <div className="p-1 bg-[var(--surface-color)] rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)]">
                        <PixelatedFlag
                            countryCode={targetCountry.code}
                            attempt={isFinished ? 5 : guesses.length} // Show clear if finished
                            maxAttempts={5}
                        />
                    </div>

                    {/* Status Overlay if finished */}
                    {isFinished && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[var(--bg-color)] px-4 py-2 rounded-xl border-2 border-[var(--border-color)] shadow-lg flex items-center gap-2 whitespace-nowrap z-10">
                            {gameStatus === 'won' ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-[var(--color-correct)]" />
                                    <span className="text-sm font-black text-[var(--color-correct)] uppercase tracking-wide">VOCÊ ACERTOU!</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-[var(--color-error)]" />
                                    <span className="text-sm font-black text-[var(--color-error)] uppercase tracking-wide">NÃO FOI DESSA VEZ</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Info / Result */}
                <div className="text-center w-full px-4">
                    {isFinished ? (
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] animate-in slide-in-from-bottom-4 duration-500">
                            <p className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-2">País de Hoje</p>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-6">{targetCountry.name}</h1>

                            <div className="flex items-center justify-center gap-8 mb-6">
                                <div className="text-center">
                                    <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">PRÓXIMO</div>
                                    <div className="text-xl font-mono font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {timeLeftStr}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">TENTATIVAS</div>
                                    <div className="text-xl font-bold text-[var(--text-primary)]">
                                        {gameStatus === 'won' ? guesses.length : 'X'}/5
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                                <Share2 className="w-4 h-4" /> Compartilhar Resultado
                            </button>

                            <button onClick={onNextChallenge} className="w-full mt-3 py-3 bg-[var(--surface-color)] text-[var(--text-primary)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide border-2 border-[var(--border-color)]">
                                <ArrowRight className="w-4 h-4" /> Próximo Desafio
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Que país é esse?</h2>
                            <div className="flex justify-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full border-2 border-[var(--border-color)] transition-colors ${i < guesses.length ? 'bg-[var(--color-error)]' : 'bg-[var(--surface-color)]'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wide">
                                {attemptsLeft} tentativas restantes
                            </p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {!isFinished && (
                    <div className="w-full pb-4 px-4">
                        <CountryAutocomplete
                            onSelect={submitGuess}
                            placeholder="Digite o nome do país..."
                            disabled={isFinished}
                        />
                        {/* Previous Guesses List */}
                        {guesses.length > 0 && (
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {guesses.map((g, i) => (
                                    <span key={i} className="text-[10px] px-2 py-1 bg-[var(--surface-color)] text-[var(--text-secondary)] rounded-lg border-2 border-[var(--border-color)] line-through opacity-70 font-bold">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
