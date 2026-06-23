import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Country } from '../data/countries';
import { getDailyCountry, getDailySeed } from './daily';

const countries: Country[] = [
    { name: 'Brasil', capital: 'Brasilia', continent: 'Todos', code: 'br' },
    { name: 'Japao', capital: 'Toquio', continent: 'Todos', code: 'jp' },
    { name: 'Canada', capital: 'Ottawa', continent: 'Todos', code: 'ca' },
];

const localStorageMock = () => {
    const store = new Map<string, string>();

    return {
        clear: () => store.clear(),
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
    };
};

describe('daily utils', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', localStorageMock());
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-22T12:00:00.000Z'));
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
        vi.unstubAllGlobals();
    });

    it('returns the current date as the daily seed', () => {
        expect(getDailySeed()).toBe('2026-06-22');
    });

    it('appends debug salt to the daily seed when present', () => {
        localStorage.setItem('debug_seed_salt', 'qa');

        expect(getDailySeed()).toBe('2026-06-22-qa');
    });

    it('selects the same country for the same day and salt', () => {
        const first = getDailyCountry(countries, 3);
        const second = getDailyCountry(countries, 3);

        expect(second).toBe(first);
        expect(countries).toContain(first);
    });

    it('uses debug salt when selecting the country', () => {
        localStorage.setItem('debug_seed_salt', 'qa');

        expect(getDailyCountry(countries, 0)).toBe(countries[2]);
    });
});
