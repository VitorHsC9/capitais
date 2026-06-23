/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import { DailyAnagram } from './DailyAnagram';
import { DailyCountryAnagram } from './DailyCountryAnagram';
import { DailyCountryWordle } from './DailyCountryWordle';
import { DailyWordle } from './DailyWordle';
import { NotFound } from './NotFound';
import { StatsModal } from './StatsModal';

const state = vi.hoisted(() => ({
    anagramGame: {} as any,
    countryAnagramGame: {} as any,
    wordleGame: {} as any,
    countryWordleGame: {} as any,
    navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => state.navigate,
}));

vi.mock('../hooks/useDailyAnagram', () => ({
    useDailyAnagram: () => state.anagramGame,
}));

vi.mock('../hooks/useDailyAnagramGame', () => ({
    useDailyAnagramGame: (config: { storageKey: string; getAnswer: (country: typeof COUNTRIES_DB[number]) => string }) => {
        const game = config.storageKey.includes('country') ? state.countryAnagramGame : state.anagramGame;
        return {
            ...game,
            answerFromConfig: game.targetCountry ? config.getAnswer(game.targetCountry) : '',
        };
    },
}));

vi.mock('../hooks/useDailyWordle', () => ({
    useDailyWordle: () => state.wordleGame,
}));

vi.mock('../hooks/useDailyWordleGame', () => ({
    useDailyWordleGame: (config: { storageKey: string; getTargetWord: (country: typeof COUNTRIES_DB[number]) => string }) => {
        const game = config.storageKey.includes('country') ? state.countryWordleGame : state.wordleGame;
        return {
            ...game,
            targetFromConfig: game.targetCountry ? config.getTargetWord(game.targetCountry) : '',
        };
    },
}));

vi.mock('./DailyAnagramGame', () => ({
    DailyAnagramGame: (props: any) => (
        <div data-testid="daily-anagram-game">
            <span>{props.title}</span>
            <span>{props.answer}</span>
            <span>{props.clueValue}</span>
            <span>{props.shuffledAnswer}</span>
            <button onClick={props.onBack}>back</button>
            <button onClick={props.onNextChallenge}>next</button>
        </div>
    ),
}));

vi.mock('./DailyWordleGame', () => ({
    DailyWordleGame: (props: any) => (
        <div data-testid="daily-wordle-game">
            <span>{props.title}</span>
            <span>{props.targetCountry.name}</span>
            <span>{props.wordLength}</span>
            <span>{props.resultText(props.targetCountry)}</span>
            <button onClick={props.onBack}>back</button>
            <button onClick={props.onNextChallenge}>next</button>
        </div>
    ),
}));

const makeAnagramGame = () => ({
    targetCountry: COUNTRIES_DB[0],
    shuffledCapital: 'LUBAC',
    shuffledAnswer: 'OATSIAP',
    guesses: [],
    gameStatus: 'playing',
    submitGuess: vi.fn(),
    attemptsLeft: 5,
    nextDailyTime: Date.now() + 60_000,
});

const makeWordleGame = () => ({
    targetCountry: COUNTRIES_DB[0],
    guesses: [],
    currentGuess: [],
    gameStatus: 'playing',
    handleKey: vi.fn(),
    checkGuess: vi.fn(),
    nextDailyTime: Date.now() + 60_000,
    cursorIndex: 0,
    setCursorIndex: vi.fn(),
    wordLength: 5,
});

const modalStats = {
    totalGames: 3,
    totalCorrect: 8,
    totalQuestions: 10,
    bestStreak: 4,
    totalScore: 900,
};

describe('wrapper components', () => {
    beforeEach(() => {
        state.anagramGame = makeAnagramGame();
        state.countryAnagramGame = makeAnagramGame();
        state.wordleGame = makeWordleGame();
        state.countryWordleGame = makeWordleGame();
        state.navigate.mockClear();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders daily anagram wrappers and loading states', () => {
        const onBack = vi.fn();
        const onNextChallenge = vi.fn();
        const { rerender } = render(<DailyAnagram onBack={onBack} onNextChallenge={onNextChallenge} />);

        expect(screen.getByTestId('daily-anagram-game')).toHaveTextContent('Desafio da Capital');
        expect(screen.getByText(COUNTRIES_DB[0].capital)).toBeInTheDocument();
        fireEvent.click(screen.getByText('back'));
        fireEvent.click(screen.getByText('next'));
        expect(onBack).toHaveBeenCalledOnce();
        expect(onNextChallenge).toHaveBeenCalledOnce();

        rerender(<DailyCountryAnagram onBack={onBack} onNextChallenge={onNextChallenge} />);
        expect(screen.getByTestId('daily-anagram-game')).toHaveTextContent('Desafio do Pais');
        expect(screen.getByText(COUNTRIES_DB[0].name)).toBeInTheDocument();

        state.anagramGame = { ...state.anagramGame, targetCountry: null };
        rerender(<DailyAnagram onBack={onBack} onNextChallenge={onNextChallenge} />);
        expect(screen.getByText('Carregando desafio...')).toBeInTheDocument();

        state.countryAnagramGame = { ...state.countryAnagramGame, targetCountry: null };
        rerender(<DailyCountryAnagram onBack={onBack} onNextChallenge={onNextChallenge} />);
        expect(screen.getByText('Carregando desafio...')).toBeInTheDocument();
    });

    it('renders daily wordle wrappers and loading states', () => {
        const { rerender } = render(<DailyWordle onBack={vi.fn()} onNextChallenge={vi.fn()} />);

        expect(screen.getByTestId('daily-wordle-game')).toHaveTextContent('Termo da Capital');
        expect(screen.getByText(COUNTRIES_DB[0].capital)).toBeInTheDocument();

        rerender(<DailyCountryWordle onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByTestId('daily-wordle-game')).toHaveTextContent('Termo do Pais');
        expect(screen.getAllByText(COUNTRIES_DB[0].name).length).toBeGreaterThan(0);

        state.countryWordleGame = { ...state.countryWordleGame, targetCountry: null };
        rerender(<DailyCountryWordle onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByText('Carregando desafio...')).toBeInTheDocument();

        state.wordleGame = { ...state.wordleGame, targetCountry: null };
        rerender(<DailyWordle onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByText('Carregando desafio...')).toBeInTheDocument();
    });

    it('handles stats modal close, overlay and restart flows', () => {
        const onClose = vi.fn();
        const onRestart = vi.fn();
        const { rerender } = render(
            <StatsModal
                onClose={onClose}
                onRestart={onRestart}
                gameState="playing"
                score={100}
                correctCount={1}
                totalQuestions={2}
                stats={modalStats}
            />
        );

        fireEvent.click(screen.getByLabelText(/Fechar estat/));
        expect(onClose).toHaveBeenCalledOnce();
        expect(onRestart).not.toHaveBeenCalled();

        fireEvent.click(document.querySelector('.absolute.inset-0.cursor-default') as Element);
        expect(onClose).toHaveBeenCalledTimes(2);

        rerender(
            <StatsModal
                onClose={onClose}
                onRestart={onRestart}
                gameState="finished"
                score={100}
                correctCount={2}
                totalQuestions={2}
                stats={{ ...modalStats, totalScore: 0 }}
            />
        );

        expect(screen.getByText(/Parab/)).toBeInTheDocument();
        fireEvent.click(screen.getByText('Jogar Novamente'));
        expect(onRestart).toHaveBeenCalledOnce();
        expect(onClose).toHaveBeenCalledTimes(3);

        rerender(
            <StatsModal
                onClose={onClose}
                onRestart={onRestart}
                gameState="game_over"
                score={100}
                correctCount={1}
                totalQuestions={2}
                stats={modalStats}
            />
        );
        fireEvent.click(screen.getAllByRole('button')[1]);
        expect(onRestart).toHaveBeenCalledTimes(2);
    });

    it('navigates home from not found', () => {
        render(<NotFound />);

        expect(screen.getByText('404')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button'));
        expect(state.navigate).toHaveBeenCalledWith('/');
    });
});
