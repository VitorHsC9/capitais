import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    getRandomItems,
    randomFloat,
    randomInRange,
    randomInt,
    randomString,
    shuffleArray,
} from './random';

const UINT32_MAX_PLUS_ONE = 0x100000000;

const mockCryptoValues = (values: number[]) => {
    let index = 0;

    vi.stubGlobal('crypto', {
        getRandomValues: (array: Uint32Array) => {
            array[0] = values[index++] ?? values.at(-1) ?? 0;
            return array;
        },
    });
};

describe('random utils', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('generates a float from crypto values', () => {
        mockCryptoValues([UINT32_MAX_PLUS_ONE / 2]);

        expect(randomFloat()).toBe(0.5);
    });

    it('generates an integer below the exclusive max', () => {
        mockCryptoValues([UINT32_MAX_PLUS_ONE - 1]);

        expect(randomInt(10)).toBe(9);
    });

    it('rejects invalid integer bounds', () => {
        expect(() => randomInt(0)).toThrow(RangeError);
        expect(() => randomInt(-1)).toThrow(RangeError);
        expect(() => randomInt(1.5)).toThrow(RangeError);
    });

    it('generates a number inside a custom range', () => {
        mockCryptoValues([UINT32_MAX_PLUS_ONE / 4]);

        expect(randomInRange(10, 18)).toBe(12);
    });

    it('shuffles without mutating the original array', () => {
        mockCryptoValues([0, UINT32_MAX_PLUS_ONE - 1]);
        const original = ['a', 'b', 'c'];

        expect(shuffleArray(original)).toEqual(['c', 'b', 'a']);
        expect(original).toEqual(['a', 'b', 'c']);
    });

    it('returns random items with and without exclusions', () => {
        mockCryptoValues([0, 0, 0, 0, 0, 0]);

        expect(getRandomItems(['a', 'b', 'c'], 2)).toEqual(['b', 'c']);
        expect(getRandomItems(['a', 'b', 'c'], 2, 'b')).toEqual(['c', 'a']);
    });

    it('builds random strings from a custom alphabet', () => {
        mockCryptoValues([0, UINT32_MAX_PLUS_ONE / 2, UINT32_MAX_PLUS_ONE - 1]);

        expect(randomString(3, 'abc')).toBe('abc');
    });
});
