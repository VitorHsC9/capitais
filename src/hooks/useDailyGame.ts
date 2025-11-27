import { useState, useEffect, useCallback } from 'react';
import type { Country } from '../data/countries';
import { COUNTRIES_DB } from '../data/countries';
import { getDailyCountry, getDailySeed } from '../utils/daily';

export type DailyGameState = 'playing' | 'won' | 'lost';

interface DailyState {
    date: string; // YYYY-MM-DD
    guesses: string[];
    status: DailyGameState;
}

const STORAGE_KEY = 'quiz_capitais_daily_v1';

export const useDailyGame = () => {
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<DailyGameState>('playing');
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);

    // Load or Initialize Game
    useEffect(() => {
        const todaySeed = getDailySeed();
        const dailyCountry = getDailyCountry(COUNTRIES_DB);
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
                const parsed: DailyState = JSON.parse(saved);
                if (parsed.date === todaySeed) {
                    setGuesses(parsed.guesses);
                    setGameStatus(parsed.status);
                    return;
                }
            } catch (e) {
                console.error("Error parsing daily state", e);
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
        const state: DailyState = {
            date: todaySeed,
            guesses,
            status: gameStatus
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [guesses, gameStatus, targetCountry]);

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

    return {
        targetCountry,
        guesses,
        gameStatus,
        submitGuess,
        attemptsLeft: 5 - guesses.length,
        nextDailyTime
    };
};
