import { useState, useMemo, useEffect } from 'react';
import { COUNTRIES_DB, type Country } from '../data/countries';

export function useSupremeFinal() {
    const [input, setInput] = useState('');
    const [guessedCountries, setGuessedCountries] = useState<Set<string>>(new Set());
    const [guessedCapitals, setGuessedCapitals] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

    // Group countries by continent
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

        // Check against all countries/capitals
        const match = COUNTRIES_DB.find(c => {
            const normalizedName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedCapital = c.capital.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // Check if it matches name and hasn't been guessed yet
            if (normalizedName === normalizedInput && !guessedCountries.has(c.code)) {
                setGuessedCountries(prev => {
                    const newSet = new Set(prev).add(c.code);
                    checkWin(newSet, guessedCapitals);
                    return newSet;
                });
                return true;
            }

            // Check if it matches capital and hasn't been guessed yet
            if (normalizedCapital === normalizedInput && !guessedCapitals.has(c.code)) {
                setGuessedCapitals(prev => {
                    const newSet = new Set(prev).add(c.code);
                    checkWin(guessedCountries, newSet);
                    return newSet;
                });
                return true;
            }

            return false;
        });

        if (match) {
            setInput(''); // Clear input on success
        }
    };

    const checkWin = (countries: Set<string>, capitals: Set<string>) => {
        if (countries.size === COUNTRIES_DB.length && capitals.size === COUNTRIES_DB.length) {
            setGameStatus('won');
        }
    };

    const resetGame = () => {
        setGuessedCountries(new Set());
        setGuessedCapitals(new Set());
        setTimeLeft(25 * 60);
        setGameStatus('playing');
        setInput('');
    };

    const highlights = useMemo(() => {
        const allCodes = new Set([...guessedCountries, ...guessedCapitals]);
        return Array.from(allCodes).map(code => {
            const country = COUNTRIES_DB.find(c => c.code === code);
            const hasCountry = guessedCountries.has(code);
            const hasCapital = guessedCapitals.has(code);

            const mapName = country?.mapName || country?.name;

            if (hasCountry && hasCapital) {
                return { code, mapName, status: 'full' as const };
            } else {
                return { code, mapName, status: 'partial' as const };
            }
        });
    }, [guessedCountries, guessedCapitals]);

    // Calculate total progress (2 points per country)
    const progress = guessedCountries.size + guessedCapitals.size;
    const totalPoints = COUNTRIES_DB.length * 2;

    return {
        input,
        handleInput,
        guessedCountries,
        guessedCapitals,
        countriesByContinent,
        highlights,
        totalCountries: COUNTRIES_DB.length,
        progress,
        totalPoints,
        timeLeft,
        gameStatus,
        resetGame
    };
}
