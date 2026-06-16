import { DailyAnagramGame } from './DailyAnagramGame';
import { useDailyAnagramGame } from '../hooks/useDailyAnagramGame';

interface DailyCountryAnagramProps {
    readonly onBack: () => void;
    readonly onNextChallenge: () => void;
}

const getCountryName = (country: { name: string }) => country.name;

export function DailyCountryAnagram({ onBack, onNextChallenge }: DailyCountryAnagramProps) {
    const game = useDailyAnagramGame({
        storageKey: 'quiz_capitais_daily_country_anagram_v1',
        salt: 10,
        getAnswer: getCountryName,
        parseErrorMessage: 'Error parsing daily country anagram state',
    });

    if (!game.targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    return (
        <DailyAnagramGame
            title="Desafio do Pais"
            prompt="Desembaralhe o Pais"
            answer={game.targetCountry.name}
            clueLabel="Capital"
            clueValue={game.targetCountry.capital}
            inputPlaceholder="Digite o pais..."
            targetCountry={game.targetCountry}
            shuffledAnswer={game.shuffledAnswer}
            guesses={game.guesses}
            gameStatus={game.gameStatus}
            submitGuess={game.submitGuess}
            attemptsLeft={game.attemptsLeft}
            nextDailyTime={game.nextDailyTime}
            onBack={onBack}
            onNextChallenge={onNextChallenge}
        />
    );
}
