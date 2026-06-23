/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Home } from './Home';

const navigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

vi.mock('../hooks/useDailyStatus', () => ({
    useDailyStatus: () => ({
        mix: { isCompleted: true, timeLeft: '12:00' },
        flag: { isCompleted: false, timeLeft: '12:00' },
        anagram: { isCompleted: true, timeLeft: '12:00' },
        wordle: { isCompleted: false, timeLeft: '12:00' },
        map: { isCompleted: true, timeLeft: '12:00' },
        country: { isCompleted: false, timeLeft: '12:00' },
        population: { isCompleted: true, timeLeft: '12:00' },
        countryAnagram: { isCompleted: false, timeLeft: '12:00' },
        countryWordle: { isCompleted: true, timeLeft: '12:00' },
    }),
}));

describe('Home', () => {
    afterEach(() => {
        cleanup();
        navigate.mockClear();
    });

    it('renders daily cards and navigates to every section', () => {
        render(<Home />);

        screen.getAllByRole('img').forEach((image) => {
            fireEvent.load(image);
        });

        expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
        expect(screen.getAllByText('VER RESULTADO').length).toBeGreaterThan(0);
        expect(screen.getAllByText('JOGAR').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Completo')).toHaveLength(5);

        [
            ['/srs', /Revis/],
            ['/online', /Online/],
            ['/daily-mix', 'Desafio Mix'],
            ['/daily', 'Bandeiras'],
            ['/daily-anagram', 'Capital'],
            ['/daily-wordle', 'Termo'],
            ['/daily-map', 'Mapa'],
            ['/daily-country', 'País'],
            ['/daily-population', /Popula/],
            ['/daily-country-anagram', /Desafio do Pa/],
            ['/daily-country-wordle', /Termo do Pa/],
            ['/supreme-menu', /Supremos/],
            ['/practice', /Modos de Pr/],
        ].forEach(([path, label]) => {
            const element = typeof label === 'string'
                ? screen.getByText(label)
                : screen.getByText(label);
            fireEvent.click(element.closest('button')!);
            expect(navigate).toHaveBeenLastCalledWith(path);
        });
    });
});
