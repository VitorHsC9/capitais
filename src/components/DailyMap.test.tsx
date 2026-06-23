/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import { DailyMap } from './DailyMap';

const setGameStatus = vi.fn();
let dailyMapState = {
    targetCountry: COUNTRIES_DB[0],
    gameStatus: 'playing' as 'playing' | 'won' | 'lost',
    setGameStatus,
    submitGuess: vi.fn(),
    nextDailyTime: Date.now() + 60_000,
};

const fitBounds = vi.fn();

vi.mock('../hooks/useDailyMap', () => ({
    useDailyMap: () => dailyMapState,
}));

vi.mock('../hooks/useCountdown', () => ({
    useCountdown: () => '12:34',
}));

vi.mock('leaflet', () => ({
    default: {
        geoJSON: () => ({
            getBounds: () => ({
                isValid: () => true,
            }),
        }),
    },
}));

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    GeoJSON: ({ data, style }: { data: { features: unknown[] }; style: (feature: unknown) => unknown }) => (
        <div data-testid="geo-json">
            {data.features.map((feature, index) => (
                <span key={index}>{JSON.stringify(style(feature))}</span>
            ))}
        </div>
    ),
    useMap: () => ({ fitBounds }),
}));

const geoJson = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { name: COUNTRIES_DB[0].mapName ?? COUNTRIES_DB[0].name, iso_a2: COUNTRIES_DB[0].code },
            geometry: {},
        },
        {
            type: 'Feature',
            properties: { name: 'Other', ISO_A2: 'zz' },
            geometry: {},
        },
    ],
};

describe('DailyMap', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            json: () => Promise.resolve(geoJson),
        })));
        dailyMapState = {
            targetCountry: COUNTRIES_DB[0],
            gameStatus: 'playing',
            setGameStatus,
            submitGuess: vi.fn(),
            nextDailyTime: Date.now() + 60_000,
        };
        setGameStatus.mockClear();
        fitBounds.mockClear();
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('loads map data, focuses the target feature and handles guesses', async () => {
        const onBack = vi.fn();
        render(<DailyMap onBack={onBack} onNextChallenge={vi.fn()} />);

        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(onBack).toHaveBeenCalledOnce();
        expect(screen.getByText('Carregando mapa...')).toBeInTheDocument();

        await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument());
        expect(screen.getByTestId('geo-json')).toHaveTextContent('#ef4444');
        await waitFor(() => expect(fitBounds).toHaveBeenCalled());

        const input = screen.getByPlaceholderText(/Digite/);
        const wrongCountry = COUNTRIES_DB[1].name;
        fireEvent.change(input, { target: { value: wrongCountry } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(screen.getByText(new RegExp(wrongCountry))).toBeInTheDocument();

        fireEvent.change(input, { target: { value: COUNTRIES_DB[0].name } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(setGameStatus).toHaveBeenCalledWith('won');
    });

    it('renders finished, loading and map fetch error states', async () => {
        const onNextChallenge = vi.fn();
        dailyMapState = {
            ...dailyMapState,
            gameStatus: 'lost',
        };

        const { rerender } = render(<DailyMap onBack={vi.fn()} onNextChallenge={onNextChallenge} />);
        await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument());
        expect(screen.getByText(/12:34/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Pr.ximo Desafio/i }));
        expect(onNextChallenge).toHaveBeenCalledOnce();

        dailyMapState = {
            ...dailyMapState,
            targetCountry: null as never,
        };
        rerender(<DailyMap onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        expect(screen.getByText('Carregando desafio...')).toBeInTheDocument();

        cleanup();
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network'))));
        dailyMapState = {
            ...dailyMapState,
            targetCountry: COUNTRIES_DB[0],
            gameStatus: 'playing',
        };
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(<DailyMap onBack={vi.fn()} onNextChallenge={vi.fn()} />);
        await waitFor(() => expect(errorSpy).toHaveBeenCalled());
        expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
    });
});
