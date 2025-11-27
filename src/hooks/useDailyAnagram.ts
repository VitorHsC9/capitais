import { useState, useEffect, useCallback } from 'react';
import type { Country } from '../data/countries';
import { COUNTRIES_DB } from '../data/countries';
import { getDailyCountry, getDailySeed } from '../utils/daily';

export type DailyGameState = 'playing' | 'won' | 'lost';

interface DailyAnagramState {
    date: string; // YYYY-MM-DD
    guesses: string[];
    status: DailyGameState;
}

const STORAGE_KEY = 'quiz_capitais_daily_anagram_v1';

export const useDailyAnagram = () => {
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<DailyGameState>('playing');
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);
    const [shuffledCapital, setShuffledCapital] = useState<string>('');

    // Load or Initialize Game
    useEffect(() => {
        const todaySeed = getDailySeed();
        // Use salt 1 for Anagram mode to get a different country than the flag mode
        const dailyCountry = getDailyCountry(COUNTRIES_DB, 1);
        setTargetCountry(dailyCountry);

        // Shuffle capital
        if (dailyCountry) {
            const capital = dailyCountry.capital.toUpperCase();
            // Simple deterministic shuffle based on seed would be better, but random is fine for visual if it's consistent per session? 
            // Actually, for a daily challenge, everyone should see the SAME shuffled text ideally, or at least it shouldn't change on refresh if possible.
            // But standard shuffle is fine for now, as long as the target is the same.
            setShuffledCapital(capital.split('').sort(() => Math.random() - 0.5).join(''));
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
                const parsed: DailyAnagramState = JSON.parse(saved);
                if (parsed.date === todaySeed) {
                    setGuesses(parsed.guesses);
                    setGameStatus(parsed.status);
                    return;
                }
            } catch (e) {
                console.error("Error parsing daily anagram state", e);
            }
        }

        // New day or no save
        setGuesses([]);
        setGameStatus('playing');
    }, []);

    // Save to storage whenever state changes
    useEffect(() => {
        if (!targetCountry) return;
        const todaySeed = getDailySeed();
        const state: DailyAnagramState = {
            date: todaySeed,
            guesses,
            status: gameStatus
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [guesses, gameStatus, targetCountry]);

    const submitGuess = useCallback((guess: string) => {
        if (gameStatus !== 'playing' || !targetCountry) return;

        const normalizedGuess = guess.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedTarget = targetCountry.capital.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const newGuesses = [...guesses, guess];
        setGuesses(newGuesses);

        if (normalizedGuess === normalizedTarget) {
            setGameStatus('won');
        } else if (newGuesses.length >= 5) {
            setGameStatus('lost');
        }
    }, [gameStatus, targetCountry, guesses]);

    return {
        targetCountry,
        shuffledCapital,
        guesses,
        gameStatus,
        submitGuess,
        attemptsLeft: 5 - guesses.length,
        nextDailyTime
    };
};
