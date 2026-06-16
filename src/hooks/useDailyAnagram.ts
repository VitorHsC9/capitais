import { useDailyAnagramGame } from './useDailyAnagramGame';
export type { DailyGameState } from './useDailyWordleGame';

const getCountryCapital = (country: { capital: string }) => country.capital;

export const useDailyAnagram = () => {
    const game = useDailyAnagramGame({
        storageKey: 'quiz_capitais_daily_anagram_v1',
        salt: 1,
        getAnswer: getCountryCapital,
        parseErrorMessage: 'Error parsing daily anagram state',
    });

    return {
        ...game,
        shuffledCapital: game.shuffledAnswer,
    };
};
