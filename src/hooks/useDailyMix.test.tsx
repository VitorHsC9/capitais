/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDailyMix } from './useDailyMix';

vi.mock('../utils/daily', () => ({
    getDailySeed: () => '2026-06-23',
}));

const answerForCurrentQuestion = (question: NonNullable<ReturnType<typeof useDailyMix>['gameState']>['questions'][number]) => (
    question.mode === 'classic' ? question.country.capital : question.country.name
);

describe('useDailyMix', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-23T10:00:00.000Z'));
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('creates a deterministic daily game and persists correct answers', () => {
        const { result } = renderHook(() => useDailyMix());

        expect(result.current.gameState?.date).toBe('2026-06-23');
        expect(result.current.gameState?.questions).toHaveLength(10);
        expect(result.current.nextDailyTime).toBeGreaterThan(Date.now());

        const firstQuestion = result.current.gameState!.questions[0];
        act(() => result.current.submitAnswer(answerForCurrentQuestion(firstQuestion)));

        expect(result.current.gameState?.answers).toEqual([true]);
        expect(result.current.gameState?.currentIndex).toBe(1);
        expect(JSON.parse(localStorage.getItem('daily_mix_state') ?? '{}')).toMatchObject({
            date: '2026-06-23',
            currentIndex: 1,
            status: 'playing',
            answers: [true],
        });
    });

    it('loses on the first wrong answer and ignores further submissions', () => {
        const { result } = renderHook(() => useDailyMix());

        act(() => result.current.submitAnswer('wrong answer'));

        expect(result.current.gameState?.status).toBe('lost');
        expect(result.current.gameState?.answers).toEqual([false]);

        act(() => result.current.submitAnswer('ignored'));
        expect(result.current.gameState?.answers).toEqual([false]);
    });

    it('wins after ten correct answers and restores saved games', () => {
        const { result, unmount } = renderHook(() => useDailyMix());

        for (let index = 0; index < 10; index++) {
            const question = result.current.gameState!.questions[result.current.gameState!.currentIndex];
            act(() => result.current.submitAnswer(answerForCurrentQuestion(question)));
        }

        expect(result.current.gameState?.status).toBe('won');
        expect(result.current.gameState?.answers).toHaveLength(10);

        const savedState = result.current.gameState;
        unmount();

        const restored = renderHook(() => useDailyMix());
        expect(restored.result.current.gameState).toEqual(savedState);
    });

    it('recovers from invalid or old saved data and checks the date periodically', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        localStorage.setItem('daily_mix_state', '{');

        const invalid = renderHook(() => useDailyMix());
        expect(errorSpy).toHaveBeenCalled();
        expect(invalid.result.current.gameState?.status).toBe('playing');

        invalid.unmount();
        localStorage.setItem('daily_mix_state', JSON.stringify({
            date: '2026-06-22',
            questions: [],
            currentIndex: 3,
            status: 'lost',
            answers: [false],
        }));

        const old = renderHook(() => useDailyMix());
        expect(old.result.current.gameState?.date).toBe('2026-06-23');
        expect(old.result.current.gameState?.questions).toHaveLength(10);

        act(() => vi.advanceTimersByTime(60_000));
        expect(old.result.current.gameState?.date).toBe('2026-06-23');
    });
});
