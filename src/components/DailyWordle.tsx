import { useState, useEffect } from 'react';
import { useDailyWordle } from '../hooks/useDailyWordle';
import { Clock, CheckCircle, XCircle, Share2, ArrowLeft, Delete, CornerDownLeft } from 'lucide-react';

interface DailyWordleProps {
    onBack: () => void;
}

export function DailyWordle({ onBack }: DailyWordleProps) {
    const { targetCountry, guesses, currentGuess, gameStatus, handleKey, checkGuess, attemptsLeft, nextDailyTime } = useDailyWordle();
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
    const wordLength = targetCountry.capital.length;

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
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-[var(--tone-5)] rounded-lg text-[var(--tone-2)] hover:text-[var(--tone-1)] transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--tone-2)]">Termo da Capital</h2>
                    <p className="text-sm font-bold text-[var(--tone-1)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-8"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4 overflow-y-auto">

                {/* Grid */}
                <div className="flex flex-col gap-2 mb-4">
                    {/* Previous Guesses */}
                    {guesses.map((guess, i) => {
                        const status = checkGuess(guess);
                        return (
                            <div key={i} className="flex gap-1 justify-center">
                                {guess.split('').map((char, j) => (
                                    <div
                                        key={j}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl font-bold rounded border-2 uppercase transition-all
                                            ${status[j] === 'correct' ? 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white' :
                                                status[j] === 'present' ? 'bg-yellow-500 border-yellow-500 text-white' :
                                                    'bg-[var(--tone-4)] border-[var(--tone-4)] text-[var(--tone-2)]'
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
                        <div className="flex gap-1 justify-center">
                            {[...Array(wordLength)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl font-bold rounded border-2 uppercase
                                        ${i < currentGuess.length
                                            ? 'border-[var(--tone-3)] text-[var(--tone-1)] bg-[var(--tone-5)]'
                                            : 'border-[var(--tone-4)] text-transparent bg-transparent'}`}
                                >
                                    {currentGuess[i] || ''}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty Rows */}
                    {[...Array(Math.max(0, 5 - guesses.length - (isFinished ? 0 : 1)))].map((_, i) => (
                        <div key={`empty-${i}`} className="flex gap-1 justify-center">
                            {[...Array(wordLength)].map((_, j) => (
                                <div
                                    key={j}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded border-2 border-[var(--tone-5)] bg-transparent"
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Result Message */}
                {isFinished && (
                    <div className="bg-[var(--tone-5)] p-4 rounded-xl border border-[var(--tone-4)] animate-in slide-in-from-bottom-4 duration-500 text-center w-full max-w-sm">
                        <div className="mb-4">
                            {gameStatus === 'won' ? (
                                <div className="flex items-center justify-center gap-2 text-[var(--color-correct)] font-bold mb-2">
                                    <CheckCircle className="w-6 h-6" />
                                    <span>VOCÊ ACERTOU!</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-[var(--color-error)] font-bold mb-2">
                                    <XCircle className="w-6 h-6" />
                                    <span>NÃO FOI DESSA VEZ</span>
                                </div>
                            )}
                            <p className="text-[var(--tone-2)] text-sm">A capital era <strong className="text-[var(--tone-1)] uppercase">{targetCountry.capital}</strong> ({targetCountry.name})</p>
                        </div>

                        <div className="flex items-center justify-center gap-8 mb-4">
                            <div className="text-center">
                                <div className="text-xs font-bold text-[var(--tone-3)] mb-1">PRÓXIMO</div>
                                <div className="text-lg font-mono font-bold text-[var(--tone-1)] flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {timeLeftStr}
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-[var(--tone-1)] text-[var(--bg-color)] font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                            <Share2 className="w-4 h-4" /> Compartilhar
                        </button>
                    </div>
                )}

                {/* Virtual Keyboard */}
                {!isFinished && (
                    <div className="w-full max-w-md px-1">
                        {keyboardRows.map((row, i) => (
                            <div key={i} className="flex justify-center gap-1 mb-1">
                                {row.map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => handleKey(key)}
                                        className="h-10 sm:h-12 min-w-[30px] sm:min-w-[36px] flex-1 rounded bg-[var(--tone-5)] text-[var(--tone-1)] font-bold text-sm sm:text-base hover:bg-[var(--tone-4)] active:scale-95 transition-all"
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        ))}
                        <div className="flex justify-center gap-1 mt-1">
                            <button
                                onClick={() => handleKey('Backspace')}
                                className="h-10 sm:h-12 px-4 rounded bg-[var(--tone-5)] text-[var(--tone-1)] font-bold hover:bg-[var(--tone-4)] active:scale-95 transition-all flex items-center justify-center"
                            >
                                <Delete className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleKey('Enter')}
                                className="h-10 sm:h-12 px-6 flex-1 rounded bg-[var(--tone-1)] text-[var(--bg-color)] font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
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
