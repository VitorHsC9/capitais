/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TerritoryMap } from './TerritoryMap';

const geoJson = {
    type: 'FeatureCollection',
    features: [
        {
            id: 'BRA',
            type: 'Feature',
            properties: { name: 'Brazil' },
            geometry: {
                type: 'Polygon',
                coordinates: [[[-60, 5], [-35, 5], [-35, -30], [-60, -30], [-60, 5]]],
            },
        },
        {
            id: 'ARG',
            type: 'Feature',
            properties: { name: 'Argentina' },
            geometry: {
                type: 'MultiPolygon',
                coordinates: [[[[-70, -20], [-55, -20], [-55, -50], [-70, -50], [-70, -20]]]],
            },
        },
        {
            id: 'EMPTY',
            type: 'Feature',
            properties: { name: 'Empty' },
            geometry: {
                type: 'Point',
                coordinates: [],
            },
        },
    ],
};

describe('TerritoryMap', () => {
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

    it('loads geojson, highlights the requested country and supports controls', async () => {
        const { container, rerender } = render(<TerritoryMap countryCode="br" className="map-class" />);

        expect(screen.getByText('Carregando mapa...')).toBeInTheDocument();
        await waitFor(() => expect(container.querySelector('svg')).toBeInTheDocument());

        const paths = container.querySelectorAll('path');
        expect(paths).toHaveLength(2);
        expect(paths[0]).toHaveAttribute('fill', 'var(--color-primary)');
        expect(paths[1]).toHaveAttribute('fill', 'var(--surface-color)');

        fireEvent.click(screen.getByTitle('Zoom in'));
        fireEvent.click(screen.getByTitle('Zoom in'));
        expect(screen.getByTitle('Reset view')).toBeInTheDocument();

        fireEvent.click(screen.getByTitle('Reset view'));
        expect(screen.getByText(/scroll para zoom/)).toBeInTheDocument();

        rerender(<TerritoryMap countryCode="ARG" />);
        expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 800 450');
    });

    it('handles wheel, mouse and touch gestures plus failed loads', async () => {
        const { container, unmount } = render(<TerritoryMap countryCode="xx" />);
        await waitFor(() => expect(container.querySelector('svg')).toBeInTheDocument());

        const svg = container.querySelector('svg') as SVGSVGElement;
        svg.getBoundingClientRect = () => ({
            x: 0,
            y: 0,
            left: 0,
            top: 0,
            right: 800,
            bottom: 450,
            width: 800,
            height: 450,
            toJSON: () => undefined,
        });

        fireEvent.wheel(svg, { deltaY: -1, clientX: 400, clientY: 200 });
        fireEvent.mouseDown(svg, { button: 1, clientX: 400, clientY: 200 });
        fireEvent.mouseDown(svg, { button: 0, clientX: 400, clientY: 200 });
        fireEvent.mouseMove(svg, { clientX: 420, clientY: 220 });
        fireEvent.mouseUp(svg);
        fireEvent.mouseLeave(svg);

        fireEvent.touchStart(svg, {
            touches: [{ clientX: 100, clientY: 100 }],
        });
        fireEvent.touchMove(svg, {
            touches: [{ clientX: 120, clientY: 125 }],
        });
        fireEvent.touchStart(svg, {
            touches: [{ clientX: 100, clientY: 100 }, { clientX: 200, clientY: 100 }],
        });
        fireEvent.touchMove(svg, {
            touches: [{ clientX: 100, clientY: 100 }, { clientX: 250, clientY: 100 }],
        });
        fireEvent.touchEnd(svg);

        unmount();
    });
});
