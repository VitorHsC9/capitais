/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import { DailyMix } from './DailyMix';
import { DailyPopulation } from './DailyPopulation';

const submitAnswer = vi.fn();
let mixState: ReturnType<typeof makeMixState> | null;

vi.mock('../hooks/useCountdown', () => ({
    useCountdown: () => '12:34',
}));

vi.mock('../hooks/useDailyMix', () => ({
    useDailyMix: () => ({
        gameState: mixState,
        submitAnswer,
        nextDailyTime: Date.now() + 60_000,
    }),
}));

vi.mock('../utils/daily', () => ({
    getDailySeed: () => '2026-06-23',
}));

function makeMixState(overrides: Partial<{
    currentIndex: number;
    status: 'playing' | 'won' | 'lost';
    answers: boolean[];
    mode: 'classic' | 'reverse' | 'flags';
}> = {}) {
    const country = COUNTRIES_DB[0];
    const other = COUNTRIES_DB[1];
    const mode = overrides.mode ?? 'classic';

    return {
        date: '2026-06-23',
        questions: [{
            country,
            mode,
            options: [country, other],
        }],
        currentIndex: overrides.currentIndex ?? 0,
        status: overrides.status ?? 'playing',
        answers: overrides.answers ?? [],
    };
}

describe('large daily components', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-23T10:00:00.000Z'));
        localStorage.clear();
        mixState = makeMixState();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders daily mix loading, classic play and delayed answer submit', () => {
        mixState = null;
        const { rerender } = render(<DailyMix onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByText('Carregando desafio...')).toBeInTheDocument();

        mixState = makeMixState();
        rerender(<DailyMix onBack={vi.fn()} onNextChallenge={vi.fn()} />);

        fireEvent.click(screen.getByText(COUNTRIES_DB[0].capital));
        fireEvent.click(screen.getByText(COUNTRIES_DB[1].capital));
        expect(submitAnswer).not.toHaveBeenCalled();

        vi.advanceTimersByTime(500);
        expect(submitAnswer).toHaveBeenCalledWith(COUNTRIES_DB[0].capital);
        expect(screen.getByText(/PERGUNTA 1/)).toBeInTheDocument();
    });

    it('renders daily mix reverse, flags and finished screens', () => {
        const onBack = vi.fn();
        const onNextChallenge = vi.fn();
        const { rerender } = render(<DailyMix onBack={onBack} onNextChallenge={onNextChallenge} />);

        mixState = makeMixState({ mode: 'reverse' });
        rerender(<DailyMix onBack={onBack} onNextChallenge={onNextChallenge} />);
        const input = screen.getByPlaceholderText(/Digite/);
        fireEvent.change(input, { target: { value: COUNTRIES_DB[0].name } });
        fireEvent.keyDown(input, { key: 'Enter' });
        vi.advanceTimersByTime(500);
        expect(submitAnswer).toHaveBeenCalledWith(COUNTRIES_DB[0].name);

        mixState = makeMixState({ mode: 'flags' });
        rerender(<DailyMix onBack={onBack} onNextChallenge={onNextChallenge} />);
        expect(screen.getByAltText('Flag')).toBeInTheDocument();

        mixState = makeMixState({ status: 'won', answers: [true, true] });
        rerender(<DailyMix onBack={onBack} onNextChallenge={onNextChallenge} />);
        expect(screen.getByText(/VIT/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Pr.ximo Desafio/i }));
        expect(onNextChallenge).toHaveBeenCalledOnce();

        mixState = makeMixState({ status: 'lost', answers: [true, false] });
        rerender(<DailyMix onBack={onBack} onNextChallenge={onNextChallenge} />);
        expect(screen.getByText('FIM DE JOGO')).toBeInTheDocument();
    });

    it('plays daily population, reorders with keyboard and stores a result', () => {
        const onBack = vi.fn();
        render(<DailyPopulation onBack={onBack} onNextChallenge={vi.fn()} />);

        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(onBack).toHaveBeenCalledOnce();

        const countryButtons = screen.getAllByRole('button').filter((button) => button.textContent?.match(/\d/));
        expect(countryButtons.length).toBeGreaterThanOrEqual(5);

        fireEvent.keyDown(countryButtons[0], { key: 'ArrowDown' });
        fireEvent.keyDown(countryButtons[1], { key: 'ArrowUp' });
        fireEvent.keyDown(countryButtons[0], { key: 'ArrowLeft' });
        fireEvent.click(screen.getByText('CONFIRMAR ORDEM'));

        expect(JSON.parse(localStorage.getItem('quiz_capitais_daily_population_v1') ?? '{}')).toMatchObject({
            date: '2026-06-23',
        });
        expect(screen.getByRole('button', { name: /Pr.ximo Desafio/i })).toBeInTheDocument();
    });

    it('restores daily population won, lost, old and invalid saved states', () => {
        const onNextChallenge = vi.fn();
        localStorage.setItem('quiz_capitais_daily_population_v1', JSON.stringify({
            date: '2026-06-23',
            status: 'won',
            items: [],
        }));

        const { unmount } = render(<DailyPopulation onBack={vi.fn()} onNextChallenge={onNextChallenge} />);
        expect(screen.getByText(/Parab/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Pr.ximo Desafio/i }));
        expect(onNextChallenge).toHaveBeenCalledOnce();
        unmount();

        localStorage.setItem('quiz_capitais_daily_population_v1', JSON.stringify({
            date: '2026-06-23',
            status: 'lost',
            items: COUNTRIES_DB.filter((country) => country.population !== undefined).slice(0, 5),
        }));
        const lost = render(<DailyPopulation onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByText(/Resposta Correta/)).toBeInTheDocument();
        lost.unmount();

        localStorage.setItem('quiz_capitais_daily_population_v1', JSON.stringify({ date: '2026-06-22', status: 'won' }));
        const old = render(<DailyPopulation onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByText('CONFIRMAR ORDEM')).toBeInTheDocument();
        expect(localStorage.getItem('quiz_capitais_daily_population_v1') ?? '').not.toContain('2026-06-22');
        old.unmount();

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        localStorage.setItem('quiz_capitais_daily_population_v1', '{');
        render(<DailyPopulation onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(errorSpy).toHaveBeenCalled();
    });

    it('can reorder daily population into the winning order and supports drag handlers', () => {
        render(<DailyPopulation onBack={vi.fn()} onNextChallenge={vi.fn()} />);

        const getCountryButtons = () => screen.getAllByRole('button')
            .filter((button) => COUNTRIES_DB.some((country) => button.textContent?.includes(country.name)));

        const names = getCountryButtons().map((button) => {
            const country = COUNTRIES_DB.find((item) => button.textContent?.includes(item.name));
            return country!.name;
        });
        const sortedNames = [...names].sort((a, b) => {
            const aPopulation = COUNTRIES_DB.find((country) => country.name === a)?.population ?? 0;
            const bPopulation = COUNTRIES_DB.find((country) => country.name === b)?.population ?? 0;
            return bPopulation - aPopulation;
        });

        const dataTransfer = { effectAllowed: '' };
        fireEvent.dragStart(getCountryButtons()[0], { dataTransfer });
        fireEvent.dragOver(getCountryButtons()[1]);
        fireEvent.dragEnd(getCountryButtons()[1]);

        sortedNames.forEach((name, targetIndex) => {
            let currentIndex = getCountryButtons().findIndex((button) => button.textContent?.includes(name));
            while (currentIndex > targetIndex) {
                fireEvent.keyDown(getCountryButtons()[currentIndex], { key: 'ArrowUp' });
                currentIndex--;
            }
            while (currentIndex < targetIndex) {
                fireEvent.keyDown(getCountryButtons()[currentIndex], { key: 'ArrowDown' });
                currentIndex++;
            }
        });

        fireEvent.click(screen.getByText('CONFIRMAR ORDEM'));
        expect(screen.getByText(/Parab/)).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem('quiz_capitais_daily_population_v1') ?? '{}')).toMatchObject({
            status: 'won',
        });
    });
});
