import { DailyAnagramGame } from './DailyAnagramGame';
import { useDailyAnagram } from '../hooks/useDailyAnagram';

interface DailyAnagramProps {
    readonly onBack: () => void;
    readonly onNextChallenge: () => void;
}

export function DailyAnagram({ onBack, onNextChallenge }: DailyAnagramProps) {
    const game = useDailyAnagram();

    if (!game.targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    return (
        <DailyAnagramGame
            title="Desafio da Capital"
            prompt="Desembaralhe a Capital"
            answer={game.targetCountry.capital}
            clueLabel="Pais"
            clueValue={game.targetCountry.name}
            inputPlaceholder="Digite a capital..."
            targetCountry={game.targetCountry}
            shuffledAnswer={game.shuffledCapital}
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
