/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import { useCountdown } from './useCountdown';
import { useDailyAnagramGame } from './useDailyAnagramGame';
import { useDailyAnagram } from './useDailyAnagram';
import { useDailyCountry } from './useDailyCountry';
import { useDailyGame } from './useDailyGame';
import { useDailyMap } from './useDailyMap';
import { useDailyStatus } from './useDailyStatus';
import { useDailyWordle } from './useDailyWordle';
import { useDailyWordleGame } from './useDailyWordleGame';

vi.mock('../utils/array', () => ({
    shuffleArray: <T,>(items: readonly T[]) => [...items].reverse(),
}));

vi.mock('../utils/daily', () => ({
    getDailyCountry: () => COUNTRIES_DB[0],
    getDailySeed: () => '2026-06-23',
}));

const getExpectedTimeUntilLocalMidnight = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const distance = tomorrow.getTime() - now.getTime();

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

describe('daily hooks', () => {
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

    it('counts down to a target time and clamps expired values', () => {
        const { result, rerender } = renderHook(({ target }) => useCountdown(target), {
            initialProps: { target: Date.now() + 3_661_000 },
        });

        expect(result.current).toBe('01:01:01');

        act(() => vi.advanceTimersByTime(1000));
        expect(result.current).toBe('01:01:00');

        rerender({ target: Date.now() - 1 });
        expect(result.current).toBe('00:00:00');
    });

    it('plays, wins, loses and persists wordle state', () => {
        const storageKey = 'wordle-test';
        const getTargetWord = () => 'CABUL';
        const { result, rerender } = renderHook(() => useDailyWordleGame({
            storageKey,
            salt: 1,
            getTargetWord,
            parseErrorMessage: 'bad wordle',
        }));

        ['C', 'A', 'ArrowLeft', 'ArrowRight', 'B', 'U', 'L', 'Enter'].forEach((key) => {
            act(() => result.current.handleKey(key));
        });

        expect(result.current.gameStatus).toBe('won');
        expect(result.current.guesses).toEqual(['CABUL']);
        expect(JSON.parse(localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
            date: '2026-06-23',
            status: 'won',
        });

        act(() => result.current.handleKey('X'));
        expect(result.current.guesses).toEqual(['CABUL']);

        rerender();
        expect(result.current.checkGuess('CBAUL')).toEqual(['correct', 'present', 'present', 'correct', 'correct']);
    });

    it('handles backspace and lost wordle games', () => {
        const { result } = renderHook(() => useDailyWordleGame({
            storageKey: 'wordle-lost',
            salt: 1,
            getTargetWord: () => 'CABUL',
            parseErrorMessage: 'bad wordle',
        }));

        ['X', 'Backspace'].forEach((key) => {
            act(() => result.current.handleKey(key));
        });
        for (let attempt = 0; attempt < 5; attempt++) {
            ['Y', 'Y', 'Y', 'Y', 'Y', 'Enter'].forEach((key) => {
                act(() => result.current.handleKey(key));
            });
        }

        expect(result.current.gameStatus).toBe('lost');
        expect(result.current.guesses).toHaveLength(5);
    });

    it('ignores incomplete wordle submits and clamps typing/deleting at bounds', () => {
        const { result } = renderHook(() => useDailyWordleGame({
            storageKey: 'wordle-bounds',
            salt: 1,
            getTargetWord: () => 'CABUL',
            parseErrorMessage: 'bad wordle',
        }));

        act(() => result.current.handleKey('Enter'));
        expect(result.current.guesses).toEqual([]);

        'CABULX'.split('').forEach((key) => {
            act(() => result.current.handleKey(key));
        });
        expect(result.current.currentGuess.join('')).toBe('CABUL');

        act(() => result.current.handleKey('Backspace'));
        expect(result.current.currentGuess.join('')).toBe('CABU');

        act(() => result.current.handleKey('ArrowRight'));
        act(() => result.current.handleKey('Backspace'));
        expect(result.current.currentGuess.join('')).toBe('CABU');
    });

    it('restores saved wordle state and ignores old or invalid state', () => {
        localStorage.setItem('saved-wordle', JSON.stringify({
            date: '2026-06-23',
            guesses: ['CABUL'],
            status: 'won',
        }));

        const saved = renderHook(() => useDailyWordleGame({
            storageKey: 'saved-wordle',
            salt: 1,
            getTargetWord: () => 'CABUL',
            parseErrorMessage: 'bad wordle',
        }));
        expect(saved.result.current.gameStatus).toBe('won');

        localStorage.setItem('old-wordle', JSON.stringify({ date: '2026-06-22', guesses: ['AAAAA'], status: 'lost' }));
        const old = renderHook(() => useDailyWordleGame({
            storageKey: 'old-wordle',
            salt: 1,
            getTargetWord: () => 'CABUL',
            parseErrorMessage: 'bad wordle',
        }));
        expect(old.result.current.gameStatus).toBe('playing');

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        localStorage.setItem('invalid-wordle', '{');
        renderHook(() => useDailyWordleGame({
            storageKey: 'invalid-wordle',
            salt: 1,
            getTargetWord: () => 'CABUL',
            parseErrorMessage: 'bad wordle',
        }));
        expect(errorSpy).toHaveBeenCalled();
    });

    it('plays and persists anagram state', () => {
        const { result } = renderHook(() => useDailyAnagramGame({
            storageKey: 'anagram-test',
            salt: 1,
            getAnswer: () => 'Cabul',
            parseErrorMessage: 'bad anagram',
        }));

        expect(result.current.shuffledAnswer).toBe('LUBAC');

        act(() => result.current.submitGuess('errado'));
        expect(result.current.gameStatus).toBe('playing');
        expect(result.current.attemptsLeft).toBe(4);

        act(() => result.current.submitGuess('cábul'));
        expect(result.current.gameStatus).toBe('won');
        expect(JSON.parse(localStorage.getItem('anagram-test') ?? '{}')).toMatchObject({
            guesses: ['errado', 'cábul'],
            status: 'won',
        });

        act(() => result.current.submitGuess('ignored'));
        expect(result.current.guesses).toEqual(['errado', 'cábul']);
    });

    it('loses anagram games and handles saved state parsing', () => {
        const { result } = renderHook(() => useDailyAnagramGame({
            storageKey: 'anagram-lost',
            salt: 1,
            getAnswer: () => 'Cabul',
            parseErrorMessage: 'bad anagram',
        }));

        ['a', 'b', 'c', 'd', 'e'].forEach((guess) => {
            act(() => result.current.submitGuess(guess));
        });

        expect(result.current.gameStatus).toBe('lost');

        localStorage.setItem('saved-anagram', JSON.stringify({
            date: '2026-06-23',
            guesses: ['Cabul'],
            status: 'won',
        }));
        const saved = renderHook(() => useDailyAnagramGame({
            storageKey: 'saved-anagram',
            salt: 1,
            getAnswer: () => 'Cabul',
            parseErrorMessage: 'bad anagram',
        }));
        expect(saved.result.current.gameStatus).toBe('won');

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        localStorage.setItem('bad-anagram', '{');
        renderHook(() => useDailyAnagramGame({
            storageKey: 'bad-anagram',
            salt: 1,
            getAnswer: () => 'Cabul',
            parseErrorMessage: 'bad anagram',
        }));
        expect(errorSpy).toHaveBeenCalled();
    });

    it('tracks completion for daily statuses', () => {
        localStorage.setItem('quiz_capitais_daily_wordle_v1', JSON.stringify({
            date: '2026-06-23',
            status: 'won',
        }));
        localStorage.setItem('quiz_capitais_daily_map_v1', '{');
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const { result } = renderHook(() => useDailyStatus());

        expect(result.current.wordle.isCompleted).toBe(true);
        expect(result.current.flag.isCompleted).toBe(false);
        expect(result.current.wordle.timeLeft).toBe(getExpectedTimeUntilLocalMidnight());
        expect(errorSpy).toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1000));
        expect(result.current.wordle.timeLeft).toBe(getExpectedTimeUntilLocalMidnight());
    });

    it('plays the daily country-name guessing game and persists results', () => {
        const { result } = renderHook(() => useDailyGame());
        const target = COUNTRIES_DB[0];

        expect(result.current.targetCountry).toEqual(target);
        expect(result.current.gameStatus).toBe('playing');

        act(() => result.current.submitGuess('wrong'));
        expect(result.current.guesses).toEqual(['wrong']);
        expect(result.current.attemptsLeft).toBe(4);

        act(() => result.current.submitGuess(target.name.toUpperCase()));
        expect(result.current.gameStatus).toBe('won');
        expect(JSON.parse(localStorage.getItem('quiz_capitais_daily_v1') ?? '{}')).toMatchObject({
            date: '2026-06-23',
            status: 'won',
        });

        act(() => result.current.submitGuess('ignored'));
        expect(result.current.guesses).toEqual(['wrong', target.name.toUpperCase()]);
    });

    it('restores and rejects saved daily country-name game state', () => {
        localStorage.setItem('quiz_capitais_daily_v1', JSON.stringify({
            date: '2026-06-23',
            guesses: ['saved'],
            status: 'lost',
        }));
        const saved = renderHook(() => useDailyGame());
        expect(saved.result.current.gameStatus).toBe('lost');
        expect(saved.result.current.guesses).toEqual(['saved']);

        localStorage.setItem('quiz_capitais_daily_v1', JSON.stringify({
            date: '2026-06-22',
            guesses: ['old'],
            status: 'won',
        }));
        const old = renderHook(() => useDailyGame());
        expect(old.result.current.gameStatus).toBe('playing');
        expect(old.result.current.guesses).toEqual([]);

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        localStorage.setItem('quiz_capitais_daily_v1', '{');
        renderHook(() => useDailyGame());
        expect(errorSpy).toHaveBeenCalled();
    });

    it('loses daily country mode after the maximum attempts', () => {
        const { result } = renderHook(() => useDailyCountry());

        expect(result.current.maxAttempts).toBe(5);
        for (let attempt = 0; attempt < result.current.maxAttempts; attempt++) {
            act(() => result.current.submitGuess(`wrong-${attempt}`));
        }

        expect(result.current.gameStatus).toBe('lost');
        expect(result.current.guesses).toHaveLength(5);
    });

    it('wins and restores daily country mode', () => {
        const target = COUNTRIES_DB[0];
        const { result } = renderHook(() => useDailyCountry());

        act(() => result.current.submitGuess(target.name));
        expect(result.current.gameStatus).toBe('won');
        expect(JSON.parse(localStorage.getItem('quiz_capitais_daily_country_v1') ?? '{}')).toMatchObject({
            date: '2026-06-23',
            guesses: [target.name],
            status: 'won',
        });

        const restored = renderHook(() => useDailyCountry());
        expect(restored.result.current.gameStatus).toBe('won');
    });

    it('handles daily map wins, manual status changes and parse errors', () => {
        const target = COUNTRIES_DB[0];
        const { result } = renderHook(() => useDailyMap());

        act(() => result.current.submitGuess('wrong'));
        expect(result.current.gameStatus).toBe('playing');

        act(() => result.current.submitGuess(target.name));
        expect(result.current.gameStatus).toBe('won');
        expect(JSON.parse(localStorage.getItem('quiz_capitais_daily_map_v1') ?? '{}')).toMatchObject({
            isCorrect: true,
            status: 'won',
        });

        act(() => result.current.setGameStatus('lost'));
        expect(result.current.gameStatus).toBe('lost');

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        localStorage.setItem('quiz_capitais_daily_map_v1', '{');
        renderHook(() => useDailyMap());
        expect(errorSpy).toHaveBeenCalled();
    });

    it('restores saved daily map status for the current day', () => {
        localStorage.setItem('quiz_capitais_daily_map_v1', JSON.stringify({
            date: '2026-06-23',
            isCorrect: true,
            status: 'won',
        }));

        const { result } = renderHook(() => useDailyMap());

        expect(result.current.gameStatus).toBe('won');
    });

    it('wraps the daily anagram and wordle games with country capitals', () => {
        const anagram = renderHook(() => useDailyAnagram());
        expect(anagram.result.current.shuffledCapital).toBe(anagram.result.current.shuffledAnswer);

        act(() => anagram.result.current.submitGuess(COUNTRIES_DB[0].capital));
        expect(anagram.result.current.gameStatus).toBe('won');

        const wordle = renderHook(() => useDailyWordle());
        COUNTRIES_DB[0].capital.toUpperCase().split('').forEach((key) => {
            act(() => wordle.result.current.handleKey(key));
        });
        act(() => wordle.result.current.handleKey('Enter'));

        expect(wordle.result.current.gameStatus).toBe('won');
    });
});
