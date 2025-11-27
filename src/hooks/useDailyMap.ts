import { useState, useEffect, useCallback } from 'react';
import type { Country } from '../data/countries';
import { COUNTRIES_DB } from '../data/countries';
import { getDailyCountry, getDailySeed } from '../utils/daily';

export type DailyGameState = 'playing' | 'won' | 'lost';

interface DailyMapState {
    date: string;
    isCorrect: boolean;
    status: DailyGameState;
}

const STORAGE_KEY = 'quiz_capitais_daily_map_v1';

export const useDailyMap = () => {
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [gameStatus, setGameStatus] = useState<DailyGameState>('playing');
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);

    // Load or Initialize Game
    useEffect(() => {
        const todaySeed = getDailySeed();
        // Use salt 3 for Map mode
        const dailyCountry = getDailyCountry(COUNTRIES_DB, 3);
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
                const parsed: DailyMapState = JSON.parse(saved);
                if (parsed.date === todaySeed) {
                    setGameStatus(parsed.status);
                    return;
                }
            } catch (e) {
                console.error("Error parsing daily map state", e);
            }
        }

        // New day or no save
        setGameStatus('playing');
    }, []);

    // Save to storage
    useEffect(() => {
        if (!targetCountry) return;
        const todaySeed = getDailySeed();
        const state: DailyMapState = {
            date: todaySeed,
            isCorrect: gameStatus === 'won',
            status: gameStatus
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [gameStatus, targetCountry]);

    const submitGuess = useCallback((guessName: string) => {
        if (gameStatus !== 'playing' || !targetCountry) return;

        const normalizedGuess = guessName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedTarget = targetCountry.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (normalizedGuess === normalizedTarget) {
            setGameStatus('won');
        } else {
            // In this mode, maybe we just shake or show incorrect, but for now let's say one try? 
            // Or maybe unlimited tries? Let's go with unlimited tries for now, but feedback is handled by component.
            // Actually, usually map games are unlimited tries until you get it or give up.
            // But to keep it consistent with "Daily", let's say if they get it right they win.
            // If they want to give up they can.
            // For now, let's just return true/false
        }
    }, [gameStatus, targetCountry]);

    return {
        targetCountry,
        gameStatus,
        setGameStatus, // Allow component to set won/lost directly if needed (e.g. give up)
        submitGuess,
        nextDailyTime
    };
};
