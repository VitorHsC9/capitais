import { useEffect, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { COUNTRIES_DB, type Country } from '../data/countries';

type SupremeStatus = 'playing' | 'won' | 'lost';

export const useCountriesByContinent = () => useMemo(() => {
    const grouped: Record<string, Country[]> = {};

    for (const country of COUNTRIES_DB) {
        grouped[country.continent] ??= [];
        grouped[country.continent].push(country);
    }

    return grouped;
}, []);

export const useSupremeCountdown = (
    gameStatus: SupremeStatus,
    setGameStatus: (status: SupremeStatus) => void,
    setTimeLeft: Dispatch<SetStateAction<number>>
) => {
    useEffect(() => {
        if (gameStatus !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setGameStatus('lost');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStatus, setGameStatus, setTimeLeft]);
};
