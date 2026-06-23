/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import type { GameMode } from '../hooks/useGameStore';
import { PlayingScreen } from './PlayingScreen';

const navigate = vi.fn();
let game: ReturnType<typeof makeGame>;

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}));

vi.mock('../hooks/useGameStore', () => ({
    useGameStore: () => game,
}));

vi.mock('../utils/array', () => ({
    shuffleArray: <T,>(items: readonly T[]) => [...items].reverse(),
}));

function makeGame(overrides: Partial<{
    gameMode: GameMode;
    isAnswered: boolean;
    gameState: 'playing' | 'finished' | 'game_over';
    selectedAnswer: string | null;
    timeLeft: number;
    questions: typeof COUNTRIES_DB;
}> = {}) {
    const questions = overrides.questions ?? COUNTRIES_DB.slice(0, 2);

    return {
        questions,
        currentIndex: 0,
        currentOptions: questions,
        gameMode: overrides.gameMode ?? 'classic',
        gameState: overrides.gameState ?? 'playing',
        isAnswered: overrides.isAnswered ?? false,
        selectedAnswer: overrides.selectedAnswer ?? null,
        score: 120,
        timeLeft: overrides.timeLeft ?? 5,
        restart: vi.fn(),
        handleAnswer: vi.fn(),
        nextQuestion: vi.fn(),
    };
}

describe('PlayingScreen', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('redirects when there is no current question', () => {
        game = makeGame({ questions: [] });
        render(<PlayingScreen />);
        expect(screen.getByTestId('navigate')).toHaveTextContent('/practice');
    });

    it('renders classic options, exits and advances after an answer', () => {
        game = makeGame();

        const { rerender } = render(<PlayingScreen />);

        fireEvent.click(screen.getByText(/Sair/));
        fireEvent.click(screen.getByText(COUNTRIES_DB[0].capital));

        expect(game.restart).toHaveBeenCalledOnce();
        expect(navigate).toHaveBeenCalledWith('/practice');
        expect(game.handleAnswer).toHaveBeenCalledWith(COUNTRIES_DB[0].capital);

        game = makeGame({
            isAnswered: true,
            selectedAnswer: COUNTRIES_DB[0].capital,
        });
        rerender(<PlayingScreen />);
        fireEvent.click(screen.getByText(/PR/));
        expect(game.nextQuestion).toHaveBeenCalledOnce();
    });

    it('renders flags, reverse and sudden death answer modes', () => {
        game = makeGame();
        const { rerender } = render(<PlayingScreen />);

        game = makeGame({ gameMode: 'flags' });
        rerender(<PlayingScreen />);
        expect(screen.getByAltText('Flag')).toBeInTheDocument();
        fireEvent.click(screen.getByText(COUNTRIES_DB[0].name));
        expect(game.handleAnswer).toHaveBeenCalledWith(COUNTRIES_DB[0].name);

        game = makeGame({ gameMode: 'reverse' });
        rerender(<PlayingScreen />);
        expect(screen.getByText(COUNTRIES_DB[0].capital)).toBeInTheDocument();

        game = makeGame({ gameMode: 'suddenDeath', timeLeft: 2 });
        rerender(<PlayingScreen />);
        expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('renders writing and anagram input modes', () => {
        game = makeGame();
        const { rerender } = render(<PlayingScreen />);

        game = makeGame({ gameMode: 'writing' });
        rerender(<PlayingScreen />);
        fireEvent.change(screen.getByPlaceholderText(/DIGITE/), { target: { value: COUNTRIES_DB[0].capital } });
        fireEvent.click(screen.getByText('ENVIAR'));
        expect(game.handleAnswer).toHaveBeenCalledWith(COUNTRIES_DB[0].capital);

        game = makeGame({ gameMode: 'anagram' });
        rerender(<PlayingScreen />);
        expect(screen.getByText(/DESEMBARALHE/)).toBeInTheDocument();
    });
});
