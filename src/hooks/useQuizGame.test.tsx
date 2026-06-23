/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import { useQuizGame } from './useQuizGame';

const clearNotifications = vi.fn();
const updateStats = vi.fn();

vi.mock('./useStatistics', () => ({
    useStatistics: () => ({
        stats: {
            totalGames: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            bestStreak: 0,
            totalScore: 0,
            unlockedAchievements: [],
        },
        newAchievements: [],
        clearNotifications,
        updateStats,
    }),
}));

vi.mock('../utils/array', () => ({
    shuffleArray: <T,>(items: readonly T[]) => items.slice(0, 2),
}));

vi.mock('../utils/quiz', () => ({
    generateRoundOptions: (country: (typeof COUNTRIES_DB)[number]) => [country],
}));

describe('useQuizGame', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(window, 'alert').mockImplementation(() => undefined);
        clearNotifications.mockClear();
        updateStats.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('starts a quiz, answers questions and records a finished session', () => {
        const first = COUNTRIES_DB[0];
        const second = COUNTRIES_DB[1];
        const { result } = renderHook(() => useQuizGame());

        act(() => result.current.startQuiz('Todos'));

        expect(result.current.gameState).toBe('playing');
        expect(result.current.questions).toEqual([first, second]);
        expect(result.current.currentOptions).toEqual([first]);
        expect(clearNotifications).toHaveBeenCalled();

        act(() => result.current.handleAnswer(first.capital.toUpperCase()));

        expect(result.current.isAnswered).toBe(true);
        expect(result.current.selectedAnswer).toBe(first.capital.toUpperCase());
        expect(result.current.score).toBe(100);
        expect(result.current.correctCount).toBe(1);
        expect(result.current.streak).toBe(1);

        act(() => result.current.nextQuestion());
        expect(result.current.currentIndex).toBe(1);
        expect(result.current.currentOptions).toEqual([second]);
        expect(result.current.isAnswered).toBe(false);

        act(() => result.current.handleAnswer('wrong answer'));
        expect(result.current.streak).toBe(0);

        act(() => result.current.nextQuestion());
        expect(result.current.gameState).toBe('finished');
        expect(updateStats).toHaveBeenCalledWith({
            score: 100,
            correctCount: 1,
            streak: 1,
        }, 2);
    });

    it('alerts when quiz starts without a country pool', () => {
        const { result } = renderHook(() => useQuizGame());

        act(() => result.current.startQuiz('Atlantida' as never));

        expect(window.alert).toHaveBeenCalledWith('Erro ao carregar países.');
        expect(result.current.gameState).toBe('start');
    });

    it('uses country names as answers in reverse and flags modes', () => {
        const first = COUNTRIES_DB[0];
        const { result } = renderHook(() => useQuizGame());

        act(() => result.current.setGameMode('reverse'));
        act(() => result.current.startQuiz(first.continent));
        act(() => result.current.handleAnswer(first.name.toUpperCase()));

        expect(result.current.correctCount).toBe(1);
        expect(result.current.score).toBe(100);

        act(() => result.current.restart());
        act(() => result.current.setGameMode('flags'));
        act(() => result.current.startQuiz('Todos'));
        act(() => result.current.handleAnswer(first.capital));

        expect(result.current.correctCount).toBe(0);
        expect(result.current.selectedAnswer).toBe(first.capital);
    });

    it('finishes survival mode immediately after a wrong answer', () => {
        const { result } = renderHook(() => useQuizGame());

        act(() => result.current.setGameMode('survival'));
        act(() => result.current.startQuiz('Todos'));
        act(() => result.current.handleAnswer('wrong'));

        expect(result.current.gameState).toBe('game_over');
        expect(updateStats).toHaveBeenCalledWith({
            score: 0,
            correctCount: 0,
            streak: 0,
        }, 1);
    });

    it('advances or loses automatically in sudden death mode', () => {
        const first = COUNTRIES_DB[0];
        const second = COUNTRIES_DB[1];
        const { result } = renderHook(() => useQuizGame());

        act(() => result.current.setGameMode('suddenDeath'));
        act(() => result.current.startQuiz('Todos'));
        act(() => result.current.handleAnswer(first.capital));
        act(() => vi.advanceTimersByTime(1000));

        expect(result.current.currentIndex).toBe(1);
        expect(result.current.currentOptions).toEqual([second]);

        act(() => result.current.handleAnswer('wrong'));
        act(() => vi.advanceTimersByTime(1000));

        expect(result.current.gameState).toBe('game_over');
    });

    it('counts down in sudden death and treats timeout as a loss', () => {
        const { result } = renderHook(() => useQuizGame());

        act(() => result.current.setGameMode('suddenDeath'));
        act(() => result.current.startQuiz('Todos'));

        act(() => vi.advanceTimersByTime(5000));

        expect(result.current.timeLeft).toBe(0);
        expect(result.current.selectedAnswer).toBe('TIME_UP');
        act(() => vi.advanceTimersByTime(1000));
        expect(result.current.gameState).toBe('game_over');
    });

    it('navigates between start and stats screens while clearing notifications', () => {
        const { result } = renderHook(() => useQuizGame());

        act(() => result.current.goToStats());
        expect(result.current.gameState).toBe('stats');

        act(() => result.current.restart());
        expect(result.current.gameState).toBe('start');
        expect(clearNotifications).toHaveBeenCalledTimes(2);
    });
});
