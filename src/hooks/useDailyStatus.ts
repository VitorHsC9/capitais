import { useState, useEffect } from 'react';
import { getDailySeed } from '../utils/daily';

interface DailyStatus {
    isCompleted: boolean;
    timeLeft: string;
}

interface AllDailyStatuses {
    mix: DailyStatus;
    flag: DailyStatus;
    anagram: DailyStatus;
    wordle: DailyStatus;
    map: DailyStatus;
    country: DailyStatus;
    population: DailyStatus;
    countryAnagram: DailyStatus;
    countryWordle: DailyStatus;
}

const STORAGE_KEYS = {
    mix: 'daily_mix_state',
    flag: 'quiz_capitais_daily_v1',
    anagram: 'quiz_capitais_daily_anagram_v1',
    wordle: 'quiz_capitais_daily_wordle_v1',
    map: 'quiz_capitais_daily_map_v1',
    country: 'quiz_capitais_daily_country_v1',
    population: 'quiz_capitais_daily_population_v1',
    countryAnagram: 'quiz_capitais_daily_country_anagram_v1',
    countryWordle: 'quiz_capitais_daily_country_wordle_v1',
};

export const useDailyStatus = () => {
    const [statuses, setStatuses] = useState<AllDailyStatuses>({
        mix: { isCompleted: false, timeLeft: '' },
        flag: { isCompleted: false, timeLeft: '' },
        anagram: { isCompleted: false, timeLeft: '' },
        wordle: { isCompleted: false, timeLeft: '' },
        map: { isCompleted: false, timeLeft: '' },
        country: { isCompleted: false, timeLeft: '' },
        population: { isCompleted: false, timeLeft: '' },
        countryAnagram: { isCompleted: false, timeLeft: '' },
        countryWordle: { isCompleted: false, timeLeft: '' },
    });

    useEffect(() => {
        const checkStatus = () => {
            const todaySeed = getDailySeed();
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const distance = tomorrow.getTime() - now.getTime();

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            const timeLeft = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            const newStatuses = {} as AllDailyStatuses;

            (Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>).forEach((key) => {
                const storageKey = STORAGE_KEYS[key];
                const saved = localStorage.getItem(storageKey);
                let isCompleted = false;

                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (parsed.date === todaySeed && parsed.status !== 'playing') {
                            isCompleted = true;
                        }
                    } catch (e) {
                        console.error(`Error parsing ${key} state`, e);
                    }
                }

                newStatuses[key] = { isCompleted, timeLeft };
            });

            setStatuses(newStatuses);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    return statuses;
};
