import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import { useGameStore } from './useGameStore';

vi.mock('../utils/array', () => ({
    shuffleArray: <T,>(items: readonly T[]) => [...items],
}));

vi.mock('../utils/quiz', () => ({
    generateRoundOptions: (correct: unknown) => [correct],
}));

describe('useGameStore', () => {
    beforeEach(() => {
        useGameStore.setState({
            gameState: 'start',
            gameMode: 'classic',
            questions: [],
            currentIndex: 0,
            currentOptions: [],
            selectedAnswer: null,
            isAnswered: false,
            selectedContinent: 'Todos',
            score: 0,
            correctCount: 0,
            streak: 0,
            maxStreak: 0,
            timeLeft: 5,
        });
        vi.useFakeTimers();
        vi.stubGlobal('alert', vi.fn());
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('starts a quiz and initializes the first round', () => {
        useGameStore.getState().startQuiz('Todos');

        const state = useGameStore.getState();
        expect(state.gameState).toBe('playing');
        expect(state.questions).toEqual(COUNTRIES_DB);
        expect(state.currentOptions).toEqual([COUNTRIES_DB[0]]);
    });

    it('shows an alert when the selected continent has no countries', () => {
        useGameStore.getState().startQuiz('Todos');
        useGameStore.getState().startQuiz('Atlantida' as never);

        expect(globalThis.alert).toHaveBeenCalledWith('Erro ao carregar países.');
    });

    it('handles correct answers and moves to the next question', () => {
        useGameStore.getState().startQuiz('Todos');
        const firstQuestion = useGameStore.getState().questions[0];

        useGameStore.getState().handleAnswer(firstQuestion.capital);

        expect(useGameStore.getState()).toMatchObject({
            isAnswered: true,
            selectedAnswer: firstQuestion.capital,
            score: 100,
            correctCount: 1,
            streak: 1,
            maxStreak: 1,
        });

        useGameStore.getState().nextQuestion();
        expect(useGameStore.getState()).toMatchObject({
            currentIndex: 1,
            isAnswered: false,
            selectedAnswer: null,
        });

        useGameStore.setState({ currentIndex: COUNTRIES_DB.length - 1 });
        useGameStore.getState().nextQuestion();
        expect(useGameStore.getState().gameState).toBe('finished');
    });

    it('checks country names in reverse mode', () => {
        useGameStore.getState().startQuiz('Todos');
        useGameStore.getState().setGameMode('reverse');
        const firstQuestion = useGameStore.getState().questions[0];

        useGameStore.getState().handleAnswer(firstQuestion.name);

        expect(useGameStore.getState().correctCount).toBe(1);
    });

    it('ends survival mode on a wrong answer', () => {
        useGameStore.getState().startQuiz('Todos');
        useGameStore.getState().setGameMode('survival');

        useGameStore.getState().handleAnswer('wrong');

        expect(useGameStore.getState()).toMatchObject({
            gameState: 'game_over',
            streak: 0,
            isAnswered: true,
        });
    });

    it('advances sudden death answers after a delay', () => {
        useGameStore.getState().startQuiz('Todos');
        useGameStore.getState().setGameMode('suddenDeath');
        const firstQuestion = useGameStore.getState().questions[0];

        useGameStore.getState().handleAnswer(firstQuestion.capital);
        vi.advanceTimersByTime(1000);

        expect(useGameStore.getState().currentIndex).toBe(1);

        useGameStore.getState().handleAnswer('wrong');
        vi.advanceTimersByTime(1000);

        expect(useGameStore.getState().gameState).toBe('game_over');
    });

    it('ticks timer, restarts and opens stats', () => {
        useGameStore.getState().tickTimer();
        expect(useGameStore.getState().timeLeft).toBe(4);

        useGameStore.setState({ timeLeft: 0, gameState: 'playing' });
        useGameStore.getState().tickTimer();
        expect(useGameStore.getState().timeLeft).toBe(0);

        useGameStore.getState().goToStats();
        expect(useGameStore.getState().gameState).toBe('stats');

        useGameStore.getState().restart();
        expect(useGameStore.getState().gameState).toBe('start');
    });
});
