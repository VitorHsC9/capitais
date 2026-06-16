import { DailyWordleGame } from './DailyWordleGame';
import { useDailyWordleGame } from '../hooks/useDailyWordleGame';
import type { Country } from '../data/countries';

interface DailyCountryWordleProps {
    readonly onBack: () => void;
    readonly onNextChallenge: () => void;
}

const getCountryName = (country: { name: string }) => country.name;
const renderCountryResult = (country: Country) => (
    <>O pais era <strong className="text-[var(--text-primary)] uppercase">{country.name}</strong> ({country.capital})</>
);

export function DailyCountryWordle({ onBack, onNextChallenge }: DailyCountryWordleProps) {
    const game = useDailyWordleGame({
        storageKey: 'quiz_capitais_daily_country_wordle_v1',
        salt: 11,
        getTargetWord: getCountryName,
        parseErrorMessage: 'Error parsing daily country wordle state',
    });

    if (!game.targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    return (
        <DailyWordleGame
            title="Termo do Pais"
            targetCountry={game.targetCountry}
            guesses={game.guesses}
            currentGuess={game.currentGuess}
            gameStatus={game.gameStatus}
            handleKey={game.handleKey}
            checkGuess={game.checkGuess}
            nextDailyTime={game.nextDailyTime}
            cursorIndex={game.cursorIndex}
            setCursorIndex={game.setCursorIndex}
            wordLength={game.wordLength}
            resultText={renderCountryResult}
            onBack={onBack}
            onNextChallenge={onNextChallenge}
        />
    );
}
