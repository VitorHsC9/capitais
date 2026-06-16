import { useDailyWordleGame } from './useDailyWordleGame';

export type { DailyGameState, LetterStatus } from './useDailyWordleGame';

const getCountryCapital = (country: { capital: string }) => country.capital;

export const useDailyWordle = () => useDailyWordleGame({
    storageKey: 'quiz_capitais_daily_wordle_v1',
    salt: 2,
    getTargetWord: getCountryCapital,
    parseErrorMessage: 'Error parsing daily wordle state',
});
