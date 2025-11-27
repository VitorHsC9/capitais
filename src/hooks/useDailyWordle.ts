import { useState, useEffect, useCallback } from 'react';
import type { Country } from '../data/countries';
import { COUNTRIES_DB } from '../data/countries';
import { getDailyCountry, getDailySeed } from '../utils/daily';

export type DailyGameState = 'playing' | 'won' | 'lost';

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface DailyWordleState {
    date: string;
    guesses: string[];
    status: DailyGameState;
}

const STORAGE_KEY = 'quiz_capitais_daily_wordle_v1';

export const useDailyWordle = () => {
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [gameStatus, setGameStatus] = useState<DailyGameState>('playing');
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);

    // Load or Initialize Game
    useEffect(() => {
        const todaySeed = getDailySeed();
        // Use salt 2 for Wordle mode
        const dailyCountry = getDailyCountry(COUNTRIES_DB, 2);
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
                const parsed: DailyWordleState = JSON.parse(saved);
                if (parsed.date === todaySeed) {
                    setGuesses(parsed.guesses);
                    setGameStatus(parsed.status);
                    return;
                }
            } catch (e) {
                console.error("Error parsing daily wordle state", e);
            }
        }

        // New day or no save
        setGuesses([]);
        setGameStatus('playing');
        setCurrentGuess('');
    }, []);

    // Save to storage
    useEffect(() => {
        if (!targetCountry) return;
        const todaySeed = getDailySeed();
        const state: DailyWordleState = {
            date: todaySeed,
            guesses,
            status: gameStatus
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [guesses, gameStatus, targetCountry]);

    const handleKey = useCallback((key: string) => {
        if (gameStatus !== 'playing' || !targetCountry) return;

        if (key === 'Backspace') {
            setCurrentGuess(prev => prev.slice(0, -1));
            return;
        }

        if (key === 'Enter') {
            if (currentGuess.length !== targetCountry.capital.length) return;

            const newGuesses = [...guesses, currentGuess];
            setGuesses(newGuesses);
            setCurrentGuess('');

            const normalizedGuess = currentGuess.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedTarget = targetCountry.capital.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (normalizedGuess === normalizedTarget) {
                setGameStatus('won');
            } else if (newGuesses.length >= 5) {
                setGameStatus('lost');
            }
            return;
        }

        // Add letter if not full
        if (currentGuess.length < targetCountry.capital.length && /^[a-zA-Z]$/.test(key)) {
            setCurrentGuess(prev => prev + key.toUpperCase());
        }
    }, [currentGuess, gameStatus, targetCountry, guesses]);

    // Helper to check letters
    const checkGuess = (guess: string) => {
        if (!targetCountry) return [];
        const target = targetCountry.capital.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

    return {
        targetCountry,
        guesses,
        currentGuess,
        gameStatus,
        handleKey,
        checkGuess,
        attemptsLeft: 5 - guesses.length,
        nextDailyTime
    };
};
