import { useState, useEffect, useCallback } from 'react';
import { InputAnswer } from './InputAnswer';
import { Clock, CheckCircle, XCircle, Share2, ArrowLeft, Shuffle, ArrowRight } from 'lucide-react';
import { COUNTRIES_DB, type Country } from '../data/countries';
import { getDailyCountry, getDailySeed } from '../utils/daily';

interface DailyCountryAnagramProps {
    onBack: () => void;
    onNextChallenge: () => void;
}

type DailyGameState = 'playing' | 'won' | 'lost';

interface DailyCountryAnagramState {
    date: string;
    guesses: string[];
    status: DailyGameState;
}

const STORAGE_KEY = 'quiz_capitais_daily_country_anagram_v1';

export function DailyCountryAnagram({ onBack, onNextChallenge }: DailyCountryAnagramProps) {
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<DailyGameState>('playing');
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);
    const [shuffledName, setShuffledName] = useState<string>('');
    const [timeLeftStr, setTimeLeftStr] = useState('');

    // Initialize Game
    useEffect(() => {
        const todaySeed = getDailySeed();
        // Use salt 10 for Country Anagram
        const dailyCountry = getDailyCountry(COUNTRIES_DB, 10) || COUNTRIES_DB[0];
        setTargetCountry(dailyCountry);

        // Shuffle Country Name
        if (dailyCountry) {
            const name = dailyCountry.name.toUpperCase();
            // Simple shuffle
            setShuffledName(name.split('').sort(() => Math.random() - 0.5).join(''));
        }

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
                const parsed: DailyCountryAnagramState = JSON.parse(saved);
                if (parsed.date === todaySeed) {
                    setGuesses(parsed.guesses);
                    setGameStatus(parsed.status);
                    return;
                }
            } catch (e) {
                console.error("Error parsing daily country anagram state", e);
            }
        }

        // New day or no save
        setGuesses([]);
        setGameStatus('playing');
    }, []);

    // Save to storage
    useEffect(() => {
        if (!targetCountry) return;
        const todaySeed = getDailySeed();
        const state: DailyCountryAnagramState = {
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

    const submitGuess = useCallback((guess: string) => {
        if (gameStatus !== 'playing' || !targetCountry) return;

        const normalizedGuess = guess.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedTarget = targetCountry.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const newGuesses = [...guesses, guess];
        setGuesses(newGuesses);

        if (normalizedGuess === normalizedTarget) {
            setGameStatus('won');
        } else if (newGuesses.length >= 5) {
            setGameStatus('lost');
        }
    }, [gameStatus, targetCountry, guesses]);

    if (!targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    const isFinished = gameStatus !== 'playing';
    const attemptsLeft = 5 - guesses.length;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Desafio do País</h2>
                    <p className="text-sm font-black text-[var(--text-primary)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">

                {/* Anagram Area */}
                <div className="w-full max-w-[320px] text-center">
                    <div className="mb-2 flex justify-center">
                        <div className="p-3 bg-[var(--surface-color)] rounded-full text-[var(--text-primary)] border-2 border-[var(--border-color)] shadow-[2px_2px_0_var(--border-color)]">
                            <Shuffle className="w-8 h-8" />
                        </div>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Desembaralhe o País</p>

                    <div className="relative p-6 bg-[var(--surface-color)] rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] mb-6">
                        <h1 className="text-3xl font-black tracking-[0.2em] text-[var(--text-primary)] break-all leading-relaxed">
                            {isFinished ? targetCountry.name.toUpperCase() : shuffledName}
                        </h1>
                        {isFinished && (
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--bg-color)] px-4 py-2 rounded-xl border-2 border-[var(--border-color)] shadow-sm flex items-center gap-2 whitespace-nowrap z-10">
                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wide">Capital: {targetCountry.capital}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Overlay if finished */}
                    {isFinished && (
                        <div className="mb-6 flex justify-center">
                            <div className="bg-[var(--bg-color)] px-4 py-2 rounded-xl border-2 border-[var(--border-color)] shadow-lg flex items-center gap-2">
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
                        </div>
                    )}
                </div>

                {/* Info / Result */}
                <div className="text-center w-full px-4">
                    {isFinished ? (
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] animate-in slide-in-from-bottom-4 duration-500">
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
                        <InputAnswer
                            onSubmit={submitGuess}
                            isAnswered={false}
                            correctAnswer={targetCountry.name}
                            nextQuestion={() => { }}
                            isDark={true}
                            placeholder="Digite o país..."
                        />
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
