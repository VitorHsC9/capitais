import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, Share2, ArrowLeft, Delete, ArrowRight } from 'lucide-react';
import { COUNTRIES_DB, type Country } from '../data/countries';
import { getDailyCountry, getDailySeed } from '../utils/daily';

interface DailyCountryWordleProps {
    onBack: () => void;
    onNextChallenge: () => void;
}

type DailyGameState = 'playing' | 'won' | 'lost';
type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface DailyCountryWordleState {
    date: string;
    guesses: string[];
    status: DailyGameState;
}

const STORAGE_KEY = 'quiz_capitais_daily_country_wordle_v1';
const MAX_ATTEMPTS = 5;

export function DailyCountryWordle({ onBack, onNextChallenge }: DailyCountryWordleProps) {
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<DailyGameState>('playing');
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);
    const [cursorIndex, setCursorIndex] = useState(0);
    const [timeLeftStr, setTimeLeftStr] = useState('');

    // Initialize Game
    useEffect(() => {
        const todaySeed = getDailySeed();
        // Use salt 11 for Country Wordle
        const dailyCountry = getDailyCountry(COUNTRIES_DB, 11) || COUNTRIES_DB[0];
        setTargetCountry(dailyCountry);

        // Calculate next midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        setNextDailyTime(tomorrow.getTime());

        // Load from storage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed: DailyCountryWordleState = JSON.parse(saved);
                if (parsed.date === todaySeed) {
                    setGuesses(parsed.guesses);
                    setGameStatus(parsed.status);
                    return;
                }
            } catch (e) {
                console.error("Error parsing daily country wordle state", e);
            }
        }

        // New day or no save
        setGuesses([]);
        setGameStatus('playing');
        setCurrentGuess([]);
        setCursorIndex(0);
    }, []);

    // Save to storage
    useEffect(() => {
        if (!targetCountry) return;
        const todaySeed = getDailySeed();
        const state: DailyCountryWordleState = {
            date: todaySeed,
            guesses,
            status: gameStatus
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [guesses, gameStatus, targetCountry]);

    // Timer
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

    const targetWord = targetCountry ? targetCountry.name.replace(/\s/g, '').toUpperCase() : '';
    const wordLength = targetWord.length;

    const handleKey = useCallback((key: string) => {
        if (gameStatus !== 'playing' || !targetCountry) return;

        const currentGuessFilledLength = currentGuess.filter(Boolean).length;

        if (key === 'Enter') {
            if (currentGuessFilledLength !== wordLength) {
                return;
            }
            // Submit guess
            const newGuesses = [...guesses, currentGuess.join('')];
            setGuesses(newGuesses);
            setCurrentGuess([]);
            setCursorIndex(0);

            const normalizedGuess = currentGuess.join('').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedTarget = targetWord.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (normalizedGuess === normalizedTarget) {
                setGameStatus('won');
            } else if (newGuesses.length >= MAX_ATTEMPTS) {
                setGameStatus('lost');
            }
        } else if (key === 'Backspace') {
            const newGuess = [...currentGuess];
            if (cursorIndex > 0 && !newGuess[cursorIndex]) { // If cursor is at an empty spot, move back and delete
                setCursorIndex(prev => prev - 1);
                newGuess[cursorIndex - 1] = '';
                setCurrentGuess(newGuess);
            } else if (newGuess[cursorIndex]) { // If there's a char at cursor, delete it
                newGuess[cursorIndex] = '';
                setCurrentGuess(newGuess);
            } else if (cursorIndex === wordLength && newGuess[cursorIndex - 1]) { // If cursor is at the end and previous char exists
                setCursorIndex(prev => prev - 1);
                newGuess[cursorIndex - 1] = '';
                setCurrentGuess(newGuess);
            }
        } else if (key === 'ArrowLeft') {
            setCursorIndex(prev => Math.max(0, prev - 1));
        } else if (key === 'ArrowRight') {
            setCursorIndex(prev => Math.min(wordLength, prev + 1));
        } else if (/^[a-zA-Z]$/.test(key)) {
            if (cursorIndex < wordLength) {
                const newGuess = [...currentGuess];
                // Ensure the array is long enough
                while (newGuess.length <= cursorIndex) {
                    newGuess.push('');
                }
                newGuess[cursorIndex] = key.toUpperCase();
                setCurrentGuess(newGuess);
                // Move cursor forward if not at end
                if (cursorIndex < wordLength) {
                    setCursorIndex(prev => prev + 1);
                }
            }
        }
    }, [gameStatus, targetCountry, currentGuess, guesses, cursorIndex, targetWord, wordLength]);

    // Physical keyboard listener
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            handleKey(e.key);
        };
        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [handleKey]);

    const checkGuess = (guess: string) => {
        if (!targetCountry) return [];
        const target = targetWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const g = guess.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const status: LetterStatus[] = new Array(g.length).fill('absent');
        const targetChars = target.split('');
        const guessChars = g.split('');

        // First pass: correct position
        guessChars.forEach((char, i) => {
            if (char === targetChars[i]) {
                status[i] = 'correct';
                targetChars[i] = '#'; // Mark as used
            }
        });

        // Second pass: present but wrong position
        guessChars.forEach((char, i) => {
            if (status[i] !== 'correct') {
                const targetIndex = targetChars.indexOf(char);
                if (targetIndex !== -1) {
                    status[i] = 'present';
                    targetChars[targetIndex] = '#';
                }
            }
        });

        return status;
    };

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
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Termo do País</h2>
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
                            <p className="text-[var(--text-secondary)] text-sm font-bold">O país era <strong className="text-[var(--text-primary)] uppercase">{targetCountry.name}</strong> ({targetCountry.capital})</p>
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
