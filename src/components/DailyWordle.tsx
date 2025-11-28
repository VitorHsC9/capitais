import { useState, useEffect } from 'react';
import { useDailyWordle } from '../hooks/useDailyWordle';
import { Clock, CheckCircle, XCircle, Share2, ArrowLeft, Delete, ArrowRight } from 'lucide-react';

interface DailyWordleProps {
    onBack: () => void;
    onNextChallenge: () => void;
}

export function DailyWordle({ onBack, onNextChallenge }: DailyWordleProps) {
    const { targetCountry, guesses, currentGuess, gameStatus, handleKey, checkGuess, nextDailyTime, cursorIndex, setCursorIndex, wordLength } = useDailyWordle();
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

    // Physical keyboard listener
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            handleKey(e.key);
        };
        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [handleKey]);

    if (!targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    const isFinished = gameStatus !== 'playing';

    // Virtual Keyboard Rows
    const keyboardRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Termo da Capital</h2>
                    <p className="text-sm font-black text-[var(--text-primary)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4 overflow-y-auto">

                {/* Grid */}
                <div className="flex flex-col gap-2 mb-4 w-full max-w-2xl px-4 overflow-x-auto">
                    {/* Previous Guesses */}
                    {guesses.map((guess, i) => {
                        const status = checkGuess(guess);
                        return (
                            <div key={i} className="flex gap-1 justify-center min-w-min mx-auto">
                                {guess.split('').map((char, j) => (
                                    <div
                                        key={j}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center text-lg font-black rounded-lg border-2 uppercase transition-all shadow-[2px_2px_0_rgba(0,0,0,0.1)]
                                            ${status[j] === 'correct' ? 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white' :
                                                status[j] === 'present' ? 'bg-yellow-500 border-yellow-500 text-white' :
                                                    'bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)]'
                                            }`}
                                    >
                                        {char}
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {/* Current Guess */}
                    {!isFinished && guesses.length < 5 && (
                        <div className="flex gap-1 justify-center min-w-min mx-auto">
                            {[...Array(wordLength)].map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => setCursorIndex(i)}
                                    className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center text-lg font-black rounded-lg border-2 uppercase cursor-pointer transition-all
                                        ${i === cursorIndex ? 'border-[var(--text-primary)] bg-[var(--surface-color)] shadow-[0_0_0_2px_var(--text-primary)]' : 'border-[var(--border-color)] bg-[var(--bg-color)]'}
                                        ${currentGuess[i] ? 'text-[var(--text-primary)]' : ''}
                                    `}
                                >
                                    {currentGuess[i] || ''}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty Rows */}
                    {[...Array(Math.max(0, 5 - guesses.length - (isFinished ? 0 : 1)))].map((_, i) => (
                        <div key={`empty-${i}`} className="flex gap-1 justify-center min-w-min mx-auto">
                            {[...Array(wordLength)].map((_, j) => (
                                <div
                                    key={j}
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-color)] opacity-50"
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Result Message */}
                {isFinished && (
                    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] animate-in slide-in-from-bottom-4 duration-500 text-center w-full max-w-sm">
                        <div className="mb-6">
                            {gameStatus === 'won' ? (
                                <div className="flex items-center justify-center gap-2 text-[var(--color-correct)] font-black mb-2">
                                    <CheckCircle className="w-6 h-6" />
                                    <span className="uppercase tracking-wide">VOCÊ ACERTOU!</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-[var(--color-error)] font-black mb-2">
                                    <XCircle className="w-6 h-6" />
                                    <span className="uppercase tracking-wide">NÃO FOI DESSA VEZ</span>
                                </div>
                            )}
                            <p className="text-[var(--text-secondary)] text-sm font-bold">A capital era <strong className="text-[var(--text-primary)] uppercase">{targetCountry.capital}</strong> ({targetCountry.name})</p>
                        </div>

                        <div className="flex items-center justify-center gap-8 mb-6">
                            <div className="text-center">
                                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">PRÓXIMO</div>
                                <div className="text-lg font-mono font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {timeLeftStr}
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                            <Share2 className="w-4 h-4" /> Compartilhar
                        </button>

                        <button onClick={onNextChallenge} className="w-full mt-3 py-3 bg-[var(--surface-color)] text-[var(--text-primary)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide border-2 border-[var(--border-color)]">
                            <ArrowRight className="w-4 h-4" /> Próximo Desafio
                        </button>
                    </div>
                )}

                {/* Virtual Keyboard */}
                {!isFinished && (
                    <div className="w-full max-w-md px-1 pb-4">
                        {keyboardRows.map((row, i) => (
                            <div key={i} className="flex justify-center gap-1 mb-1">
                                {row.map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => handleKey(key)}
                                        className="h-10 sm:h-12 min-w-[30px] sm:min-w-[36px] flex-1 rounded-lg bg-[var(--surface-color)] border-b-4 border-[var(--border-color)] text-[var(--text-primary)] font-black text-sm sm:text-base hover:brightness-110 active:border-b-0 active:translate-y-[4px] transition-all"
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        ))}
                        <div className="flex justify-center gap-1 mt-1">
                            <button
                                onClick={() => handleKey('Backspace')}
                                className="h-10 sm:h-12 px-4 rounded-lg bg-[var(--surface-color)] border-b-4 border-[var(--border-color)] text-[var(--text-primary)] font-bold hover:brightness-110 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center"
                            >
                                <Delete className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleKey('Enter')}
                                className="h-10 sm:h-12 px-6 flex-1 rounded-lg bg-[var(--text-primary)] border-b-4 border-black/20 text-[var(--bg-color)] font-black hover:brightness-110 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center uppercase tracking-wider"
                            >
                                ENTER
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
