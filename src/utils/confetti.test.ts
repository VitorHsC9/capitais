import confetti from 'canvas-confetti';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { triggerAchievementConfetti, triggerConfetti } from './confetti';

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

vi.mock('./random', () => ({
    randomFloat: vi.fn(() => 0.5),
    randomInRange: vi.fn((min: number, max: number) => (min + max) / 2),
}));

describe('confetti utils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
        vi.mocked(confetti).mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('fires side confetti until the animation window ends', () => {
        triggerConfetti();

        vi.advanceTimersByTime(250);
        expect(confetti).toHaveBeenCalledTimes(2);
        expect(confetti).toHaveBeenNthCalledWith(1, expect.objectContaining({
            particleCount: 36,
            origin: { x: 0.2, y: 0.3 },
        }));
        expect(confetti).toHaveBeenNthCalledWith(2, expect.objectContaining({
            particleCount: 36,
            origin: { x: 0.8, y: 0.3 },
        }));

        vi.advanceTimersByTime(2500);
        expect(confetti).toHaveBeenCalledTimes(18);
    });

    it('fires achievement confetti with celebratory colors', () => {
        triggerAchievementConfetti();

        expect(confetti).toHaveBeenCalledWith({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.1, x: 0.5 },
            colors: ['#FFC800', '#58CC02', '#1CB0F6'],
        });
    });
});
