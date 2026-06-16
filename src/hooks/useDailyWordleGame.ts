import { useState, useEffect, useCallback, useMemo } from 'react';
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

interface DailyWordleGameConfig {
    storageKey: string;
    salt: number;
    getTargetWord: (country: Country) => string;
    parseErrorMessage: string;
}

const MAX_ATTEMPTS = 5;
const normalizeWord = (word: string) => word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
        const parsed: DailyWordleState = JSON.parse(saved);
        return parsed.date === getDailySeed() ? parsed : null;
    } catch (e) {
        console.error(parseErrorMessage, e);
        return null;
    }
};

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

export const useDailyWordleGame = ({
    storageKey,
    salt,
    getTargetWord,
    parseErrorMessage,
}: DailyWordleGameConfig) => {
    const targetCountry = useMemo(() => getDailyCountry(COUNTRIES_DB, salt) || COUNTRIES_DB[0], [salt]);
    const savedState = useMemo(() => getSavedState(storageKey, parseErrorMessage), [parseErrorMessage, storageKey]);
    const [guesses, setGuesses] = useState<string[]>(() => savedState?.guesses || []);
    const [currentGuess, setCurrentGuess] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<DailyGameState>(() => savedState?.status || 'playing');
    const nextDailyTime = useMemo(() => getNextMidnight(), []);
    const [cursorIndex, setCursorIndex] = useState(0);

    useEffect(() => {
        const state: DailyWordleState = {
            date: getDailySeed(),
            guesses,
            status: gameStatus,
        };
        globalThis.localStorage.setItem(storageKey, JSON.stringify(state));
    }, [guesses, gameStatus, storageKey]);

    const targetWord = getTargetWord(targetCountry).replace(/\s/g, '').toUpperCase();
    const wordLength = targetWord.length;

    const handleKey = useCallback((key: string) => {
        if (gameStatus !== 'playing' || !targetCountry) return;

        if (key === 'Enter') {
            if (currentGuess.filter(Boolean).length !== wordLength) {
                return;
            }

            const newGuesses = [...guesses, currentGuess.join('')];
            setGuesses(newGuesses);
            setCurrentGuess([]);
            setCursorIndex(0);

            if (normalizeWord(currentGuess.join('')) === normalizeWord(targetWord)) {
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
    }, [currentGuess, cursorIndex, gameStatus, guesses, targetCountry, targetWord, wordLength]);

    const checkGuess = (guess: string) => {
        if (!targetCountry) return [];
        const targetChars = normalizeWord(targetWord).toUpperCase().split('');
        const guessChars = normalizeWord(guess).toUpperCase().split('');
        const status: LetterStatus[] = new Array(guessChars.length).fill('absent');

        guessChars.forEach((char, i) => {
            if (char === targetChars[i]) {
                status[i] = 'correct';
                targetChars[i] = '#';
            }
        });

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
        wordLength,
    };
};
