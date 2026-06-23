import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSrsStore, getSrsItemId } from './useSrsStore';

vi.mock('../utils/random', () => ({
    randomFloat: () => 0.5,
}));

const resetStore = () => {
    useSrsStore.setState({
        items: {},
        settings: { maxNewCardsPerDay: 20 },
        dailyNewCards: { date: '2026-06-23', count: 0 },
    });
};

describe('useSrsStore', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-23T10:00:00.000Z'));
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('builds stable SRS item ids', () => {
        expect(getSrsItemId('Brasil', 'capitals', 'forward')).toBe('Brasil_capitals_forward');
    });

    it('processes first correct and incorrect reviews', () => {
        useSrsStore.getState().processReview('Brasil', 'capitals', 'forward', true);
        const correctId = getSrsItemId('Brasil', 'capitals', 'forward');

        expect(useSrsStore.getState().items[correctId]).toMatchObject({
            interval: 1,
            repetition: 1,
            efactor: 2.6,
        });
        expect(useSrsStore.getState().dailyNewCards.count).toBe(1);

        useSrsStore.getState().processReview('Brasil', 'capitals', 'forward', false);
        expect(useSrsStore.getState().items[correctId]).toMatchObject({
            interval: 0,
            repetition: 0,
            efactor: 2.4,
        });
        expect(useSrsStore.getState().dailyNewCards.count).toBe(1);
    });

    it('uses the second-review interval and caps efactor', () => {
        const id = getSrsItemId('Brasil', 'capitals', 'forward');
        useSrsStore.setState({
            items: {
                [id]: {
                    countryName: 'Brasil',
                    category: 'capitals',
                    direction: 'forward',
                    interval: 1,
                    repetition: 1,
                    efactor: 3,
                    nextReviewDate: Date.now() - 1,
                },
            },
        });

        useSrsStore.getState().processReview('Brasil', 'capitals', 'forward', true);

        expect(useSrsStore.getState().items[id]).toMatchObject({
            interval: 3,
            repetition: 2,
            efactor: 3,
        });
    });

    it('returns due cards respecting category, continent, and daily limit', () => {
        useSrsStore.getState().updateSettings({ maxNewCardsPerDay: 1 });

        const dueCards = useSrsStore.getState().getDueItems('flags', 'Todos', 5);

        expect(dueCards).toHaveLength(1);
        expect(dueCards[0]).toMatchObject({
            category: 'flags',
            direction: 'reverse',
            interval: 0,
        });
    });

    it('resets daily new-card tracking when the day changes', () => {
        useSrsStore.setState({ dailyNewCards: { date: '2026-06-22', count: 7 } });

        useSrsStore.getState().getDueItems('capitals', 'Todos', 2);

        expect(useSrsStore.getState().dailyNewCards).toEqual({ date: '2026-06-23', count: 0 });
    });

    it('summarizes learning stats', () => {
        useSrsStore.setState({
            items: {
                due: {
                    countryName: 'Brasil',
                    category: 'capitals',
                    direction: 'forward',
                    interval: 1,
                    repetition: 1,
                    efactor: 2.5,
                    nextReviewDate: Date.now() - 1,
                },
                mastered: {
                    countryName: 'Japao',
                    category: 'flags',
                    direction: 'reverse',
                    interval: 21,
                    repetition: 5,
                    efactor: 2.9,
                    nextReviewDate: Date.now() + 1,
                },
            },
            dailyNewCards: { date: '2026-06-23', count: 3 },
        });

        expect(useSrsStore.getState().getStats()).toEqual({
            totalLearning: 1,
            totalMastered: 1,
            dueToday: 1,
            newCardsToday: 3,
            newCardsLimit: 20,
        });
    });
});
