import { useState, useEffect, useCallback } from 'react';
import { COUNTRIES_DB, type Country } from '../data/countries';

import { getDailySeed } from '../utils/daily';

export type MixGameMode = 'classic' | 'reverse' | 'flags';

interface DailyMixState {
    date: string;
    questions: { country: Country; mode: MixGameMode; options: Country[] }[];
    currentIndex: number;
    status: 'playing' | 'won' | 'lost';
    answers: boolean[]; // true for correct, false for incorrect
}

const STORAGE_KEY = 'daily_mix_state';

// Simple seeded random number generator
const mulberry32 = (a: number) => {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

export const useDailyMix = () => {
    const [gameState, setGameState] = useState<DailyMixState | null>(null);
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);

    const generateDailyQuestions = useCallback((dateStr: string) => {
        // Create a seed from the date string (e.g., "2023-10-27")
        let seed = 0;
        for (let i = 0; i < dateStr.length; i++) {
            seed = ((seed << 5) - seed) + dateStr.charCodeAt(i);
            seed |= 0;
        }
        const random = mulberry32(seed);

        const questions: { country: Country; mode: MixGameMode; options: Country[] }[] = [];
        const availableCountries = [...COUNTRIES_DB];

        // Select 10 unique countries
        for (let i = 0; i < 10; i++) {
            if (availableCountries.length === 0) break;
            const randomIndex = Math.floor(random() * availableCountries.length);
            const country = availableCountries.splice(randomIndex, 1)[0] || COUNTRIES_DB[0];

            // Select a random mode
            const modes: MixGameMode[] = ['classic', 'reverse', 'flags'];
            const mode = modes[Math.floor(random() * modes.length)];

            // Generate options
            const options = [country];
            const pool = COUNTRIES_DB.filter(c => c.name !== country.name); // Simple pool for now

            while (options.length < 4) {
                const randomOptionIndex = Math.floor(random() * pool.length);
                const option = pool[randomOptionIndex];
                if (!options.find(o => o.name === option.name)) {
                    options.push(option);
                }
            }

            // Shuffle options
            for (let j = options.length - 1; j > 0; j--) {
                const k = Math.floor(random() * (j + 1));
                [options[j], options[k]] = [options[k], options[j]];
            }

            questions.push({ country, mode, options });
        }

        return questions;
    }, []);

    useEffect(() => {
        const checkDaily = () => {
            const now = new Date();
            const dateStr = getDailySeed();

            // Calculate next day midnight
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            setNextDailyTime(tomorrow.getTime());

            const saved = localStorage.getItem(STORAGE_KEY);
            let parsed: DailyMixState | null = null;

            if (saved) {
                try {
                    parsed = JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse daily mix state", e);
                }
            }

            if (parsed && parsed.date === dateStr) {
                setGameState(parsed);
            } else {
                // New day, new game
                const questions = generateDailyQuestions(dateStr);
                const newState: DailyMixState = {
                    date: dateStr,
                    questions,
                    currentIndex: 0,
                    status: 'playing',
                    answers: []
                };
                setGameState(newState);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            }
        };

        checkDaily();
        const interval = setInterval(checkDaily, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [generateDailyQuestions]);

    const submitAnswer = (answer: string) => {
        if (!gameState || gameState.status !== 'playing') return;

        const currentQ = gameState.questions[gameState.currentIndex];
        let isCorrect = false;

        if (currentQ.mode === 'classic') {
            isCorrect = answer === currentQ.country.capital;
        } else {
            isCorrect = answer === currentQ.country.name;
        }

        const newAnswers = [...gameState.answers, isCorrect];
        let newStatus: 'playing' | 'won' | 'lost' = gameState.status;

        if (!isCorrect) {
            newStatus = 'lost';
        } else if (gameState.currentIndex === 9) {
            newStatus = 'won';
        }

        const newState: DailyMixState = {
            ...gameState,
            answers: newAnswers,
            status: newStatus,
            currentIndex: isCorrect ? gameState.currentIndex + 1 : gameState.currentIndex
        };

        setGameState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    };

    return {
        gameState,
        submitAnswer,
        nextDailyTime
    };
};
