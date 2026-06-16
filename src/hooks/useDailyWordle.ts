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
const MAX_ATTEMPTS = 5;
const normalizeWord = (word: string) => word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function deleteCharacter(guess: string[], cursorIndex: number, wordLength: number) {
    const nextGuess = [...guess];
    const shouldDeletePrevious = cursorIndex > 0 && !nextGuess[cursorIndex];
    const deleteIndex = shouldDeletePrevious ? cursorIndex - 1 : cursorIndex;

    if (nextGuess[deleteIndex]) {
        nextGuess[deleteIndex] = '';
        return {
            guess: nextGuess,
            cursorIndex: shouldDeletePrevious ? deleteIndex : cursorIndex,
        };
    }

    const endIndex = wordLength - 1;
    if (cursorIndex === wordLength && nextGuess[endIndex]) {
        nextGuess[endIndex] = '';
        return { guess: nextGuess, cursorIndex: endIndex };
    }

    return { guess, cursorIndex };
}

function typeCharacter(guess: string[], cursorIndex: number, key: string, wordLength: number) {
    if (cursorIndex >= wordLength) {
        return { guess, cursorIndex };
    }

    const nextGuess = [...guess];
    while (nextGuess.length <= cursorIndex) {
        nextGuess.push('');
    }
    nextGuess[cursorIndex] = key.toUpperCase();
    return { guess: nextGuess, cursorIndex: cursorIndex + 1 };
}

export const useDailyWordle = () => {
    const [targetCountry, setTargetCountry] = useState<Country | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<DailyGameState>('playing');
    const [nextDailyTime, setNextDailyTime] = useState<number>(0);
    const [cursorIndex, setCursorIndex] = useState(0);

    // Load or Initialize Game
    useEffect(() => {
        const todaySeed = getDailySeed();
        // Use salt 2 for Wordle
        const dailyCountry = getDailyCountry(COUNTRIES_DB, 2) || COUNTRIES_DB[0];
        setTargetCountry(dailyCountry);

        // Calculate next midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        setNextDailyTime(tomorrow.getTime());

        // Load from storage
        const saved = globalThis.localStorage.getItem(STORAGE_KEY);
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
        setCurrentGuess([]);
        setCursorIndex(0);
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
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [guesses, gameStatus, targetCountry]);

    const targetWord = targetCountry ? targetCountry.capital.replace(/\s/g, '').toUpperCase() : '';
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

            const normalizedGuess = normalizeWord(currentGuess.join(''));
            const normalizedTarget = normalizeWord(targetWord);

            if (normalizedGuess === normalizedTarget) {
                setGameStatus('won');
            } else if (newGuesses.length >= MAX_ATTEMPTS) {
                setGameStatus('lost');
            }
        } else if (key === 'Backspace') {
            const next = deleteCharacter(currentGuess, cursorIndex, wordLength);
            setCursorIndex(next.cursorIndex);
            setCurrentGuess(next.guess);
        } else if (key === 'ArrowLeft') {
            setCursorIndex(prev => Math.max(0, prev - 1));
        } else if (key === 'ArrowRight') {
            setCursorIndex(prev => Math.min(wordLength, prev + 1));
        } else if (/^[a-zA-Z]$/.test(key)) {
            const next = typeCharacter(currentGuess, cursorIndex, key, wordLength);
            setCursorIndex(next.cursorIndex);
            setCurrentGuess(next.guess);
        }
    }, [gameStatus, targetCountry, currentGuess, guesses, cursorIndex, targetWord, wordLength]);

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

    return {
        targetCountry,
        guesses,
        currentGuess,
        gameStatus,
        handleKey,
        checkGuess,
        attemptsLeft: MAX_ATTEMPTS - guesses.length,
        nextDailyTime,
        cursorIndex,
        setCursorIndex,
        wordLength // Export wordLength
    };
};
