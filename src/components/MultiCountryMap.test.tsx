/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MultiCountryMap } from './MultiCountryMap';

const geoJson = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { name: 'Brazil', iso_a2: 'br' },
            geometry: {},
        },
        {
            type: 'Feature',
            properties: { name: 'Argentina', ISO_A2: 'ar' },
            geometry: {},
        },
        {
            type: 'Feature',
            properties: { name: 'Chile', iso_a2: 'cl' },
            geometry: {},
        },
        {
            type: 'Feature',
            properties: {},
            geometry: {},
        },
    ],
};

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
    useMap: () => ({}),
}));

describe('MultiCountryMap', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            json: () => Promise.resolve(geoJson),
        })));
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('loads map data and styles full, partial and default countries', async () => {
        render(<MultiCountryMap highlights={[
            { code: 'br', mapName: 'Brazil', status: 'full' },
            { code: 'xx', mapName: 'Argentina', status: 'partial' },
        ]} />);

        expect(screen.getByText('Carregando mapa...')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument());

        const styles = screen.getByTestId('geo-json').textContent ?? '';
        expect(styles).toContain('#22c55e');
        expect(styles).toContain('#eab308');
        expect(styles).toContain('#3f3f46');
    });

    it('hides the loader when map data fails to load', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network'))));

        render(<MultiCountryMap highlights={[]} />);

        await waitFor(() => expect(errorSpy).toHaveBeenCalled());
        expect(screen.queryByText('Carregando mapa...')).not.toBeInTheDocument();
        expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
    });
});
