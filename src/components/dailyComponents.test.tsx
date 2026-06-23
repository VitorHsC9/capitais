/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import type { DailyGameState, LetterStatus } from '../hooks/useDailyWordleGame';
import { DailyAnagramGame } from './DailyAnagramGame';
import { DailyChallenge } from './DailyChallenge';
import { DailyCountry } from './DailyCountry';
import { DailyWordleGame } from './DailyWordleGame';

const country = {
    ...COUNTRIES_DB[0],
    population: 43_000_000,
    neighboringCountries: ['Paquistao'],
    mainLanguage: 'Dari',
};

const dailyGameState = {
    targetCountry: country,
    guesses: ['Brasil'],
    gameStatus: 'playing' as DailyGameState,
    submitGuess: vi.fn(),
    attemptsLeft: 4,
    nextDailyTime: Date.now() + 60_000,
    maxAttempts: 5,
};

vi.mock('../hooks/useCountdown', () => ({
    useCountdown: () => '12:34',
}));

vi.mock('../hooks/useDailyGame', () => ({
    useDailyGame: () => dailyGameState,
}));

vi.mock('../hooks/useDailyCountry', () => ({
    useDailyCountry: () => dailyGameState,
}));

vi.mock('./PixelatedFlag', () => ({
    PixelatedFlag: ({ countryCode, attempt }: { countryCode: string; attempt: number }) => (
        <div data-testid="pixelated-flag">{countryCode}:{attempt}</div>
    ),
}));

describe('daily game components', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        dailyGameState.gameStatus = 'playing';
        dailyGameState.guesses = ['Brasil'];
        dailyGameState.targetCountry = country;
    });

    it('renders anagram gameplay and submits guesses', () => {
        const onBack = vi.fn();
        const submitGuess = vi.fn();

        render(
            <DailyAnagramGame
                title="Desafio"
                prompt="Desembaralhe"
                answer="Cabul"
                clueLabel="Pais"
                clueValue="Afeganistao"
                inputPlaceholder="Digite"
                shuffledAnswer="BULCA"
                guesses={['wrong']}
                gameStatus="playing"
                submitGuess={submitGuess}
                attemptsLeft={4}
                nextDailyTime={Date.now()}
                onBack={onBack}
                onNextChallenge={vi.fn()}
            />
        );

        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Cabul' } });
        fireEvent.click(screen.getByText('ENVIAR'));

        expect(onBack).toHaveBeenCalledOnce();
        expect(submitGuess).toHaveBeenCalledWith('Cabul');
        expect(screen.getByText('wrong')).toBeInTheDocument();
    });

    it('renders anagram finished states', () => {
        const onNextChallenge = vi.fn();

        const { rerender } = render(
            <DailyAnagramGame
                title="Desafio"
                prompt="Desembaralhe"
                answer="Cabul"
                clueLabel="Pais"
                clueValue="Afeganistao"
                inputPlaceholder="Digite"
                shuffledAnswer="BULCA"
                guesses={['Cabul']}
                gameStatus="won"
                submitGuess={vi.fn()}
                attemptsLeft={4}
                nextDailyTime={Date.now()}
                onBack={vi.fn()}
                onNextChallenge={onNextChallenge}
            />
        );

        fireEvent.click(screen.getByText(/Proximo/));
        expect(onNextChallenge).toHaveBeenCalledOnce();

        rerender(
            <DailyAnagramGame
                title="Desafio"
                prompt="Desembaralhe"
                answer="Cabul"
                clueLabel="Pais"
                clueValue="Afeganistao"
                inputPlaceholder="Digite"
                shuffledAnswer="BULCA"
                guesses={['wrong', 'again']}
                gameStatus="lost"
                submitGuess={vi.fn()}
                attemptsLeft={0}
                nextDailyTime={Date.now()}
                onBack={vi.fn()}
                onNextChallenge={onNextChallenge}
            />
        );

        expect(screen.getByText('NAO FOI DESSA VEZ')).toBeInTheDocument();
    });

    it('renders wordle gameplay, keyboard, cursor and guesses', () => {
        const handleKey = vi.fn();
        const setCursorIndex = vi.fn();
        const checkGuess = vi.fn<(_: string) => LetterStatus[]>(() => ['correct', 'present', 'absent']);

        render(
            <DailyWordleGame
                title="Termo"
                targetCountry={country}
                guesses={['ABC']}
                currentGuess={['D', '', '']}
                gameStatus="playing"
                handleKey={handleKey}
                checkGuess={checkGuess}
                nextDailyTime={Date.now()}
                cursorIndex={1}
                setCursorIndex={setCursorIndex}
                wordLength={3}
                resultText={(target) => <span>{target.capital}</span>}
                onBack={vi.fn()}
                onNextChallenge={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Q'));
        fireEvent.click(screen.getByText('ENTER'));
        fireEvent.keyDown(window, { key: 'A' });
        fireEvent.click(screen.getAllByRole('button')[1]);

        expect(handleKey).toHaveBeenCalledWith('Q');
        expect(handleKey).toHaveBeenCalledWith('Enter');
        expect(handleKey).toHaveBeenCalledWith('A');
        expect(setCursorIndex).toHaveBeenCalledWith(0);
        expect(checkGuess).toHaveBeenCalledWith('ABC');
    });

    it('renders wordle finished states', () => {
        const onNextChallenge = vi.fn();

        const { rerender } = render(
            <DailyWordleGame
                title="Termo"
                targetCountry={country}
                guesses={['CABUL']}
                currentGuess={[]}
                gameStatus="won"
                handleKey={vi.fn()}
                checkGuess={() => ['correct', 'correct', 'correct', 'correct', 'correct']}
                nextDailyTime={Date.now()}
                cursorIndex={0}
                setCursorIndex={vi.fn()}
                wordLength={5}
                resultText={(target) => <span>{target.capital}</span>}
                onBack={vi.fn()}
                onNextChallenge={onNextChallenge}
            />
        );

        fireEvent.click(screen.getByText(/Proximo/));
        expect(onNextChallenge).toHaveBeenCalledOnce();

        rerender(
            <DailyWordleGame
                title="Termo"
                targetCountry={country}
                guesses={['ERRAR']}
                currentGuess={[]}
                gameStatus="lost"
                handleKey={vi.fn()}
                checkGuess={() => ['absent', 'absent', 'absent', 'absent', 'absent']}
                nextDailyTime={Date.now()}
                cursorIndex={0}
                setCursorIndex={vi.fn()}
                wordLength={5}
                resultText={(target) => <span>{target.capital}</span>}
                onBack={vi.fn()}
                onNextChallenge={onNextChallenge}
            />
        );

        expect(screen.getByText('NAO FOI DESSA VEZ')).toBeInTheDocument();
    });

    it('renders daily challenge in playing and finished modes', () => {
        const onNextChallenge = vi.fn();

        const { rerender } = render(<DailyChallenge onBack={vi.fn()} onNextChallenge={onNextChallenge} />);

        expect(screen.getByTestId('pixelated-flag')).toHaveTextContent(`${country.code}:1`);
        expect(screen.getByText('Brasil')).toBeInTheDocument();

        dailyGameState.gameStatus = 'won';
        dailyGameState.guesses = ['Afeganistao'];
        rerender(<DailyChallenge onBack={vi.fn()} onNextChallenge={onNextChallenge} />);

        fireEvent.click(screen.getByText(/Pr/));
        expect(onNextChallenge).toHaveBeenCalledOnce();
        expect(screen.getByTestId('pixelated-flag')).toHaveTextContent(`${country.code}:5`);
    });

    it('renders daily country hints, wrong feedback and result card', () => {
        const onNextChallenge = vi.fn();
        dailyGameState.guesses = ['Brasil', 'Japao'];

        const { rerender } = render(<DailyCountry onBack={vi.fn()} onNextChallenge={onNextChallenge} />);

        expect(screen.getByText(country.continent)).toBeInTheDocument();
        expect(screen.getByText(/Entre/)).toBeInTheDocument();

        const input = screen.getByPlaceholderText(/Digite/);
        fireEvent.change(input, { target: { value: 'Brasil' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(dailyGameState.submitGuess).toHaveBeenCalledWith('Brasil');

        dailyGameState.gameStatus = 'lost';
        dailyGameState.guesses = ['Brasil', 'Japao', 'Canada', 'Chile', 'Peru'];
        rerender(<DailyCountry onBack={vi.fn()} onNextChallenge={onNextChallenge} />);

        fireEvent.click(screen.getByText(/Proximo/));
        expect(onNextChallenge).toHaveBeenCalledOnce();

        dailyGameState.gameStatus = 'playing';
        dailyGameState.guesses = ['Brasil', 'Japao'];
        dailyGameState.targetCountry = { ...country, population: 500_000, neighboringCountries: [] };
        rerender(<DailyCountry onBack={vi.fn()} onNextChallenge={onNextChallenge} />);
        expect(screen.getByText(/Menos de 1/)).toBeInTheDocument();
    });

    it('shows loading states when hooks have no target country', () => {
        dailyGameState.targetCountry = null as never;

        const { rerender } = render(<DailyChallenge onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByText('Carregando desafio...')).toBeInTheDocument();

        rerender(<DailyCountry onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByText('Carregando desafio...')).toBeInTheDocument();
    });
});
