import { useState, useMemo, useEffect } from 'react';
import { COUNTRIES_DB, type Country } from '../data/countries';

type GameStatus = 'playing' | 'won' | 'lost';

interface SupremeGameConfig {
    isMatch: (country: Country, text: string) => boolean;
}

export function useSupremeGame({ isMatch }: SupremeGameConfig) {
    const [input, setInput] = useState('');
    const [guessedCodes, setGuessedCodes] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(12 * 60);
    const [gameStatus, setGameStatus] = useState<GameStatus>('playing');

    const countriesByContinent = useMemo(() => {
        const grouped: Record<string, Country[]> = {};
        COUNTRIES_DB.forEach(country => {
            if (!grouped[country.continent]) grouped[country.continent] = [];
            grouped[country.continent].push(country);
        });
        return grouped;
    }, []);

    useEffect(() => {
        if (gameStatus !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setGameStatus('lost');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStatus]);

    const handleInput = (text: string) => {
        if (gameStatus !== 'playing') return;
        setInput(text);

        const normalizedInput = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        if (!normalizedInput) return;

        const match = COUNTRIES_DB.find(country => !guessedCodes.has(country.code) && isMatch(country, text));

        if (match) {
            setGuessedCodes(prev => {
                const nextGuessedCodes = new Set(prev).add(match.code);
                if (nextGuessedCodes.size === COUNTRIES_DB.length) {
                    setGameStatus('won');
                }
                return nextGuessedCodes;
            });
            setInput('');
        }
    };

    const resetGame = () => {
        setGuessedCodes(new Set());
        setTimeLeft(12 * 60);
        setGameStatus('playing');
        setInput('');
    };

    const highlights = useMemo(() => {
        return Array.from(guessedCodes).map(code => {
            const country = COUNTRIES_DB.find(item => item.code === code);
            return {
                code,
                mapName: country?.mapName || country?.name,
                status: 'full' as const,
            };
        });
    }, [guessedCodes]);

    return {
        input,
        handleInput,
        guessedCodes,
        countriesByContinent,
        highlights,
        totalCountries: COUNTRIES_DB.length,
        progress: guessedCodes.size,
        timeLeft,
        gameStatus,
        resetGame,
    };
}
