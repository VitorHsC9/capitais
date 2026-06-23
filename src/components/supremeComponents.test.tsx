/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Trophy } from 'lucide-react';
import { COUNTRIES_DB } from '../data/countries';
import { useSupremeFinal } from '../hooks/useSupremeFinal';
import { useSupremeGame } from '../hooks/useSupremeGame';
import { SupremeCapitals } from './SupremeCapitals';
import { SupremeCountries } from './SupremeCountries';
import { SupremeFinal } from './SupremeFinal';
import { SupremeGameScreen } from './SupremeGameScreen';
import { SupremeMenu } from './SupremeMenu';

vi.mock('./MultiCountryMap', () => ({
    MultiCountryMap: ({ highlights }: { highlights: { code: string }[] }) => (
        <div data-testid="multi-country-map">{highlights.map((item) => item.code).join(',')}</div>
    ),
}));

describe('supreme components and hooks', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('renders menu actions for every supreme mode', () => {
        const onBack = vi.fn();
        const onSelectCapitals = vi.fn();
        const onSelectCountries = vi.fn();
        const onSelectFinal = vi.fn();

        render(
            <SupremeMenu
                onBack={onBack}
                onSelectCapitals={onSelectCapitals}
                onSelectCountries={onSelectCountries}
                onSelectFinal={onSelectFinal}
            />
        );

        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);
        fireEvent.click(buttons[2]);
        fireEvent.click(buttons[3]);

        expect(onBack).toHaveBeenCalledOnce();
        expect(onSelectCapitals).toHaveBeenCalledOnce();
        expect(onSelectCountries).toHaveBeenCalledOnce();
        expect(onSelectFinal).toHaveBeenCalledOnce();
    });

    it('renders capitals and countries supreme modes and accepts guesses', () => {
        const country = COUNTRIES_DB[0];
        const { rerender } = render(<SupremeCapitals onBack={vi.fn()} />);

        fireEvent.change(screen.getByPlaceholderText(/CAPITAL/), { target: { value: country.capital } });
        expect(screen.getByTestId('multi-country-map')).toHaveTextContent(country.code);
        expect(screen.getByText(country.capital)).toBeInTheDocument();

        rerender(<SupremeCountries onBack={vi.fn()} />);
        fireEvent.change(screen.getByPlaceholderText(/PAIS/), { target: { value: country.name } });
        expect(screen.getByTestId('multi-country-map')).toHaveTextContent(country.code);
        expect(screen.getAllByText(country.name).length).toBeGreaterThan(0);
    });

    it('renders final mode with partial and full country progress', () => {
        const country = COUNTRIES_DB[0];
        render(<SupremeFinal onBack={vi.fn()} />);

        const input = screen.getByPlaceholderText(/CAPITAL/);
        fireEvent.change(input, { target: { value: country.name } });
        expect(screen.getByTestId('multi-country-map')).toHaveTextContent(country.code);

        fireEvent.change(input, { target: { value: country.capital } });
        expect(screen.getAllByText(country.capital).length).toBeGreaterThan(0);
    });

    it('renders generic supreme game screen playing and lost states', () => {
        const onBack = vi.fn();
        const resetGame = vi.fn();
        const handleInput = vi.fn();
        const country = COUNTRIES_DB[0];

        const props = {
            onBack,
            input: 'abc',
            handleInput,
            guessedCodes: new Set([country.code]),
            countriesByContinent: { [country.continent]: [country] },
            highlights: [{ code: country.code, status: 'full' as const }],
            progress: 1,
            totalCountries: 2,
            timeLeft: 59,
            gameStatus: 'playing' as const,
            resetGame,
            title: 'Teste Supremo',
            conqueredLabel: 'itens',
            placeholder: 'Digite',
            accentClass: 'focus:border-yellow-500',
            accentTextClass: 'text-yellow-500',
            gridClass: 'grid',
            ProgressIcon: Trophy,
            renderCountryCard: (item: typeof country, guessed: boolean) => (
                <div key={item.code}>{guessed ? item.name : 'hidden'}</div>
            ),
        };

        const { rerender } = render(<SupremeGameScreen {...props} />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByPlaceholderText('Digite'), { target: { value: 'novo' } });

        expect(onBack).toHaveBeenCalledOnce();
        expect(handleInput).toHaveBeenCalledWith('novo');
        expect(screen.getByText(country.name)).toBeInTheDocument();

        rerender(<SupremeGameScreen {...props} gameStatus="lost" />);
        fireEvent.click(screen.getByText('Tentar Novamente'));
        fireEvent.click(screen.getByText('Voltar ao Menu'));

        expect(resetGame).toHaveBeenCalledOnce();
        expect(onBack).toHaveBeenCalledTimes(2);
    });

    it('drives supreme game hooks through guesses, wins, timeout and reset', () => {
        const capitals = renderHook(() => useSupremeGame({
            isMatch: (country, text) => country.capital === text,
        }));

        act(() => capitals.result.current.handleInput(''));
        act(() => capitals.result.current.handleInput(COUNTRIES_DB[0].capital));
        expect(capitals.result.current.progress).toBe(1);
        expect(capitals.result.current.highlights[0]).toMatchObject({ code: COUNTRIES_DB[0].code, status: 'full' });

        for (const country of COUNTRIES_DB.slice(1)) {
            act(() => capitals.result.current.handleInput(country.capital));
        }
        expect(capitals.result.current.gameStatus).toBe('won');

        act(() => capitals.result.current.resetGame());
        expect(capitals.result.current.progress).toBe(0);
        expect(capitals.result.current.timeLeft).toBe(12 * 60);

        const timeout = renderHook(() => useSupremeGame({
            isMatch: (country, text) => country.name === text,
        }));
        act(() => vi.advanceTimersByTime(12 * 60 * 1000));
        expect(timeout.result.current.gameStatus).toBe('lost');
        act(() => timeout.result.current.handleInput(COUNTRIES_DB[0].name));
        expect(timeout.result.current.progress).toBe(0);
    });

    it('drives supreme final hook through partial, full, win and reset states', () => {
        const { result } = renderHook(() => useSupremeFinal());

        act(() => result.current.handleInput(COUNTRIES_DB[0].name));
        expect(result.current.guessedCountries.has(COUNTRIES_DB[0].code)).toBe(true);
        expect(result.current.highlights[0]).toMatchObject({ status: 'partial' });

        act(() => result.current.handleInput(COUNTRIES_DB[0].capital));
        expect(result.current.guessedCapitals.has(COUNTRIES_DB[0].code)).toBe(true);
        expect(result.current.highlights[0]).toMatchObject({ status: 'full' });

        for (const country of COUNTRIES_DB.slice(1)) {
            act(() => result.current.handleInput(country.name));
            act(() => result.current.handleInput(country.capital));
        }

        expect(result.current.gameStatus).toBe('won');

        act(() => result.current.resetGame());
        expect(result.current.progress).toBe(0);
        expect(result.current.timeLeft).toBe(25 * 60);
    });
});
