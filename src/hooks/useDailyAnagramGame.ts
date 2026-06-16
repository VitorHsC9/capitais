import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Country } from '../data/countries';
import { COUNTRIES_DB } from '../data/countries';
import { getDailyCountry, getDailySeed } from '../utils/daily';
import { shuffleArray } from '../utils/array';
import type { DailyGameState } from './useDailyWordleGame';

interface DailyAnagramState {
    date: string;
    guesses: string[];
    status: DailyGameState;
}

interface DailyAnagramGameConfig {
    storageKey: string;
    salt: number;
    getAnswer: (country: Country) => string;
    parseErrorMessage: string;
}

const MAX_ATTEMPTS = 5;
const normalizeWord = (word: string) => word.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const shuffleWord = (word: string) => shuffleArray(word.toUpperCase().split('')).join('');
const getNextMidnight = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
};

const getSavedState = (storageKey: string, parseErrorMessage: string) => {
    const saved = globalThis.localStorage?.getItem(storageKey);
    if (!saved) return null;

    try {
        const parsed: DailyAnagramState = JSON.parse(saved);
        return parsed.date === getDailySeed() ? parsed : null;
    } catch (e) {
        console.error(parseErrorMessage, e);
        return null;
    }
};

export const useDailyAnagramGame = ({
    storageKey,
    salt,
    getAnswer,
    parseErrorMessage,
}: DailyAnagramGameConfig) => {
    const targetCountry = useMemo(() => getDailyCountry(COUNTRIES_DB, salt) || COUNTRIES_DB[0], [salt]);
    const savedState = useMemo(() => getSavedState(storageKey, parseErrorMessage), [parseErrorMessage, storageKey]);
    const [guesses, setGuesses] = useState<string[]>(() => savedState?.guesses || []);
    const [gameStatus, setGameStatus] = useState<DailyGameState>(() => savedState?.status || 'playing');
    const nextDailyTime = useMemo(() => getNextMidnight(), []);
    const shuffledAnswer = useMemo(() => shuffleWord(getAnswer(targetCountry)), [getAnswer, targetCountry]);

    useEffect(() => {
        const state: DailyAnagramState = {
            date: getDailySeed(),
            guesses,
            status: gameStatus,
        };
        globalThis.localStorage.setItem(storageKey, JSON.stringify(state));
    }, [guesses, gameStatus, storageKey]);

    const submitGuess = useCallback((guess: string) => {
        if (gameStatus !== 'playing' || !targetCountry) return;

        const newGuesses = [...guesses, guess];
        setGuesses(newGuesses);

        if (normalizeWord(guess) === normalizeWord(getAnswer(targetCountry))) {
            setGameStatus('won');
        } else if (newGuesses.length >= MAX_ATTEMPTS) {
            setGameStatus('lost');
        }
    }, [gameStatus, getAnswer, guesses, targetCountry]);

    return {
        targetCountry,
        shuffledAnswer,
        guesses,
        gameStatus,
        submitGuess,
        attemptsLeft: MAX_ATTEMPTS - guesses.length,
        nextDailyTime,
    };
};
