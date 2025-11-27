import { useState, useEffect, useCallback } from 'react';
import type { Country } from '../data/countries';
import { COUNTRIES_DB } from '../data/countries';
import { getDailyCountry, getDailySeed } from '../utils/daily';

export type DailyCountryStatus = 'playing' | 'won' | 'lost';

interface DailyCountryState {
    date: string;
    guesses: string[];
    status: DailyCountryStatus;
}

const STORAGE_KEY = 'quiz_capitais_daily_country_v1';
const MAX_ATTEMPTS = 5;

export const useDailyCountry = () => {
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<DailyCountryStatus>('playing');
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);

    // Load or Initialize Game
    useEffect(() => {
        const todaySeed = getDailySeed();
        // Use salt 4 for Country mode
        const dailyCountry = getDailyCountry(COUNTRIES_DB, 4);
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
                const parsed: DailyCountryState = JSON.parse(saved);
                if (parsed.date === todaySeed) {
                    setGuesses(parsed.guesses);
                    setGameStatus(parsed.status);
                    return;
                }
            } catch (e) {
                console.error("Error parsing daily country state", e);
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
        const state: DailyCountryState = {
            date: todaySeed,
            guesses,
            status: gameStatus
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [guesses, gameStatus, targetCountry]);

    const submitGuess = useCallback((guessName: string) => {
        if (gameStatus !== 'playing' || !targetCountry) return;

        const normalizedGuess = guessName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedTarget = targetCountry.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const newGuesses = [...guesses, guessName];
        setGuesses(newGuesses);

        if (normalizedGuess === normalizedTarget) {
            setGameStatus('won');
        } else if (newGuesses.length >= MAX_ATTEMPTS) {
            setGameStatus('lost');
        }
    }, [gameStatus, targetCountry, guesses]);

    return {
        targetCountry,
        guesses,
        gameStatus,
        submitGuess,
        nextDailyTime,
        maxAttempts: MAX_ATTEMPTS
    };
};
