import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Delete, Share2, XCircle } from 'lucide-react';
import type { Country } from '../data/countries';
import type { DailyGameState, LetterStatus } from '../hooks/useDailyWordleGame';
import { useCountdown } from '../hooks/useCountdown';

interface DailyWordleGameProps {
    readonly title: string;
    readonly targetCountry: Country;
    readonly guesses: string[];
    readonly currentGuess: string[];
    readonly gameStatus: DailyGameState;
    readonly handleKey: (key: string) => void;
    readonly checkGuess: (guess: string) => LetterStatus[];
    readonly nextDailyTime: number;
    readonly cursorIndex: number;
    readonly setCursorIndex: (index: number) => void;
    readonly wordLength: number;
    readonly resultText: (country: Country) => ReactNode;
    readonly onBack: () => void;
    readonly onNextChallenge: () => void;
}

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const getSlotKeys = (length: number, prefix: string) =>
    Array.from({ length }, (_, index) => `${prefix}-${index + 1}`);

const getGuessCells = (guess: string) => {
    const counts = new Map<string, number>();
    return guess.split('').map((char) => {
        const count = (counts.get(char) || 0) + 1;
        counts.set(char, count);
        return { char, key: `${char}-${count}` };
    });
};

const getStatusClass = (status: LetterStatus) => {
    if (status === 'correct') return 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white';
    if (status === 'present') return 'bg-yellow-500 border-yellow-500 text-white';
    return 'bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)]';
};

const getCurrentCellClass = (index: number, cursorIndex: number, value?: string) => {
    const cursorClass = index === cursorIndex
        ? 'border-[var(--text-primary)] bg-[var(--surface-color)] shadow-[0_0_0_2px_var(--text-primary)]'
        : 'border-[var(--border-color)] bg-[var(--bg-color)]';
    const textClass = value ? 'text-[var(--text-primary)]' : '';
    return `${cursorClass} ${textClass}`;
};

export function DailyWordleGame({
    title,
    targetCountry,
    guesses,
    currentGuess,
    gameStatus,
    handleKey,
    checkGuess,
    nextDailyTime,
    cursorIndex,
    setCursorIndex,
    wordLength,
    resultText,
    onBack,
    onNextChallenge,
}: DailyWordleGameProps) {
    const timeLeftStr = useCountdown(nextDailyTime);
    const isFinished = gameStatus !== 'playing';
    const currentSlotKeys = getSlotKeys(wordLength, 'current');
    const emptyRows = getSlotKeys(Math.max(0, 5 - guesses.length - (isFinished ? 0 : 1)), 'empty-row');
    const emptySlotKeys = getSlotKeys(wordLength, 'empty-cell');

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            handleKey(e.key);
        };
        globalThis.addEventListener('keydown', listener);
        return () => globalThis.removeEventListener('keydown', listener);
    }, [handleKey]);

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">{title}</h2>
                    <p className="text-sm font-black text-[var(--text-primary)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4 overflow-y-auto">
                <div className="flex flex-col gap-2 mb-4 w-full max-w-2xl px-4 overflow-x-auto">
                    {guesses.map((guess) => {
                        const status = checkGuess(guess);
                        return (
                            <div key={guess} className="flex gap-1 justify-center min-w-min mx-auto">
                                {getGuessCells(guess).map(({ char, key }, j) => (
                                    <div
                                        key={key}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center text-lg font-black rounded-lg border-2 uppercase transition-all shadow-[2px_2px_0_rgba(0,0,0,0.1)] ${getStatusClass(status[j])}`}
                                    >
                                        {char}
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {!isFinished && guesses.length < 5 && (
                        <div className="flex gap-1 justify-center min-w-min mx-auto">
                            {currentSlotKeys.map((key, i) => (
                                <button
                                    type="button"
                                    key={key}
                                    onClick={() => setCursorIndex(i)}
                                    className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center text-lg font-black rounded-lg border-2 uppercase cursor-pointer transition-all ${getCurrentCellClass(i, cursorIndex, currentGuess[i])}`}
                                >
                                    {currentGuess[i] || ''}
                                </button>
                            ))}
                        </div>
                    )}

                    {emptyRows.map((rowKey) => (
                        <div key={rowKey} className="flex gap-1 justify-center min-w-min mx-auto">
                            {emptySlotKeys.map((key) => (
                                <div
                                    key={`${rowKey}-${key}`}
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-color)] opacity-50"
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {isFinished && (
                    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] animate-in slide-in-from-bottom-4 duration-500 text-center w-full max-w-sm">
                        <div className="mb-6">
                            {gameStatus === 'won' ? (
                                <div className="flex items-center justify-center gap-2 text-[var(--color-correct)] font-black mb-2">
                                    <CheckCircle className="w-6 h-6" />
                                    <span className="uppercase tracking-wide">VOCE ACERTOU!</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-[var(--color-error)] font-black mb-2">
                                    <XCircle className="w-6 h-6" />
                                    <span className="uppercase tracking-wide">NAO FOI DESSA VEZ</span>
                                </div>
                            )}
                            <p className="text-[var(--text-secondary)] text-sm font-bold">{resultText(targetCountry)}</p>
                        </div>

                        <div className="flex items-center justify-center gap-8 mb-6">
                            <div className="text-center">
                                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">PROXIMO</div>
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
                            <ArrowRight className="w-4 h-4" /> Proximo Desafio
                        </button>
                    </div>
                )}

                {!isFinished && (
                    <div className="w-full max-w-md px-1 pb-4">
                        {KEYBOARD_ROWS.map((row) => (
                            <div key={row.join('')} className="flex justify-center gap-1 mb-1">
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
