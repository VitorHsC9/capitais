import { useState, useMemo, useEffect } from 'react';
import { COUNTRIES_DB, type Country } from '../data/countries';

export function useSupremeCapitals() {
    const [input, setInput] = useState('');
    const [guessedCodes, setGuessedCodes] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(12 * 60); // 12 minutes in seconds
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

    // Group countries by continent for display
    const countriesByContinent = useMemo(() => {
        const grouped: Record<string, Country[]> = {};
        COUNTRIES_DB.forEach(c => {
            if (!grouped[c.continent]) grouped[c.continent] = [];
            grouped[c.continent].push(c);
        });
        return grouped;
    }, []);

    // Timer logic
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

        const normalizedInput = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (!normalizedInput) return;

        // Check against all capitals that haven't been guessed yet
        const match = COUNTRIES_DB.find(c => {
            if (guessedCodes.has(c.code)) return false;
            const normalizedCapital = c.capital.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedCapital === normalizedInput;
        });

        if (match) {
            setGuessedCodes(prev => {
                const newSet = new Set(prev).add(match.code);
                if (newSet.size === COUNTRIES_DB.length) {
                    setGameStatus('won');
                }
                return newSet;
            });
            setInput(''); // Clear input on success
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
            const country = COUNTRIES_DB.find(c => c.code === code);
            return {
                code,
                mapName: country?.mapName || country?.name,
                status: 'full' as const
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
        resetGame
    };
}
