import { DailyWordleGame } from './DailyWordleGame';
import { useDailyWordle } from '../hooks/useDailyWordle';

interface DailyWordleProps {
    readonly onBack: () => void;
    readonly onNextChallenge: () => void;
}

export function DailyWordle({ onBack, onNextChallenge }: DailyWordleProps) {
    const game = useDailyWordle();

    if (!game.targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    return (
        <DailyWordleGame
            title="Termo da Capital"
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
            resultText={(country) => <>A capital era <strong className="text-[var(--text-primary)] uppercase">{country.capital}</strong> ({country.name})</>}
            onBack={onBack}
            onNextChallenge={onNextChallenge}
        />
    );
}
