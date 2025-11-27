import { useState, useEffect } from 'react';
import { InputAnswer } from './InputAnswer';
import { useDailyAnagram } from '../hooks/useDailyAnagram';
import { Clock, CheckCircle, XCircle, Share2, ArrowLeft, Shuffle } from 'lucide-react';

interface DailyAnagramProps {
    onBack: () => void;
}

export function DailyAnagram({ onBack }: DailyAnagramProps) {
    const { targetCountry, shuffledCapital, guesses, gameStatus, submitGuess, attemptsLeft, nextDailyTime } = useDailyAnagram();
    const [timeLeftStr, setTimeLeftStr] = useState('');

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

    if (!targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    const isFinished = gameStatus !== 'playing';

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header simplificado */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-[var(--tone-5)] rounded-lg text-[var(--tone-2)] hover:text-[var(--tone-1)] transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--tone-2)]">Desafio da Capital</h2>
                    <p className="text-sm font-bold text-[var(--tone-1)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-8"></div> {/* Spacer */}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">

                {/* Anagram Area */}
                <div className="w-full max-w-[320px] text-center">
                    <div className="mb-2 flex justify-center">
                        <div className="p-3 bg-[var(--tone-5)] rounded-full text-[var(--tone-1)] border border-[var(--tone-4)]">
                            <Shuffle className="w-8 h-8" />
                        </div>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--tone-3)] mb-4">Desembaralhe a Capital</p>

                    <div className="relative p-6 bg-[var(--tone-5)] rounded-2xl border border-[var(--tone-4)] shadow-lg mb-6">
                        <h1 className="text-3xl font-black tracking-[0.2em] text-[var(--tone-1)] break-all leading-relaxed">
                            {isFinished ? targetCountry.capital.toUpperCase() : shuffledCapital}
                        </h1>
                        {isFinished && (
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--bg-color)] px-3 py-1 rounded-full border border-[var(--tone-4)] shadow-sm flex items-center gap-2 whitespace-nowrap">
                                <span className="text-[10px] font-bold text-[var(--tone-2)] uppercase">País: {targetCountry.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Overlay if finished */}
                    {isFinished && (
                        <div className="mb-6 flex justify-center">
                            <div className="bg-[var(--bg-color)] px-4 py-2 rounded-xl border border-[var(--tone-4)] shadow-lg flex items-center gap-2">
                                {gameStatus === 'won' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-[var(--color-correct)]" />
                                        <span className="text-sm font-bold text-[var(--color-correct)]">VOCÊ ACERTOU!</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5 text-[var(--color-error)]" />
                                        <span className="text-sm font-bold text-[var(--color-error)]">NÃO FOI DESSA VEZ</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Info / Result */}
                <div className="text-center w-full px-4">
                    {isFinished ? (
                        <div className="bg-[var(--tone-5)] p-6 rounded-xl border border-[var(--tone-4)] animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-center gap-8 mb-6">
                                <div className="text-center">
                                    <div className="text-xs font-bold text-[var(--tone-3)] mb-1">PRÓXIMO</div>
                                    <div className="text-xl font-mono font-bold text-[var(--tone-1)] flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {timeLeftStr}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-[var(--tone-3)] mb-1">TENTATIVAS</div>
                                    <div className="text-xl font-bold text-[var(--tone-1)]">
                                        {gameStatus === 'won' ? guesses.length : 'X'}/5
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-[var(--tone-1)] text-[var(--bg-color)] font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                <Share2 className="w-4 h-4" /> Compartilhar Resultado
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-colors ${i < guesses.length ? 'bg-[var(--color-error)]' : 'bg-[var(--tone-4)]'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-[var(--tone-3)] font-medium">
                                {attemptsLeft} tentativas restantes
                            </p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {!isFinished && (
                    <div className="w-full pb-4">
                        <InputAnswer
                            onSubmit={submitGuess}
                            isAnswered={false}
                            correctAnswer={targetCountry.capital}
                            nextQuestion={() => { }}
                            isDark={true}
                            placeholder="Digite a capital..."
                        />
                        {guesses.length > 0 && (
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {guesses.map((g, i) => (
                                    <span key={i} className="text-[10px] px-2 py-1 bg-[var(--tone-5)] text-[var(--tone-2)] rounded border border-[var(--tone-4)] line-through opacity-70">
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
