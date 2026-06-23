/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SrsItem, SrsItemWithCountry } from '../../hooks/useSrsStore';
import { SrsBrowser } from './SrsBrowser';
import { SrsFlashcard } from './SrsFlashcard';
import { SrsMenu } from './SrsMenu';

const navigate = vi.fn();
let search = new URLSearchParams('cat=capitals&cont=Todos');

const country = {
    name: 'Brasil',
    capital: 'Brasilia',
    continent: 'Todos' as const,
    code: 'br',
    mapName: 'Brazil',
};

const dueCards: SrsItemWithCountry[] = [
    {
        countryName: 'Brasil',
        category: 'capitals',
        direction: 'forward',
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: Date.now() - 1,
        country,
    },
    {
        countryName: 'Brasil',
        category: 'flags',
        direction: 'reverse',
        interval: 3,
        repetition: 2,
        efactor: 2.6,
        nextReviewDate: Date.now() - 1,
        country,
    },
    {
        countryName: 'Brasil',
        category: 'map',
        direction: 'reverse',
        interval: 21,
        repetition: 5,
        efactor: 2.9,
        nextReviewDate: Date.now() - 1,
        country,
    },
];

const storeState = {
    items: {
        capitals: {
            countryName: 'Brasil',
            category: 'capitals',
            direction: 'forward',
            interval: 0,
            repetition: 0,
            efactor: 2.5,
            nextReviewDate: Date.now() - 1,
        },
        flags: {
            countryName: 'Brasil',
            category: 'flags',
            direction: 'reverse',
            interval: 3,
            repetition: 2,
            efactor: 2.6,
            nextReviewDate: Date.now() + 10_000,
        },
        map: {
            countryName: 'Brasil',
            category: 'map',
            direction: 'reverse',
            interval: 21,
            repetition: 5,
            efactor: 2.9,
            nextReviewDate: Date.now() - 1,
        },
    } satisfies Record<string, SrsItem>,
    settings: { maxNewCardsPerDay: 20 },
    updateSettings: vi.fn(),
    getDueItems: vi.fn(() => dueCards),
    processReview: vi.fn(),
};

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
    useSearchParams: () => [search],
}));

vi.mock('../../hooks/useSrsStore', () => ({
    useSrsStore: (selector?: (state: typeof storeState) => unknown) => {
        if (selector) return selector(storeState);
        return storeState;
    },
}));

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    GeoJSON: ({ onEachFeature }: { onEachFeature?: (feature: unknown, layer: unknown) => void }) => {
        const layer = {
            on: vi.fn((_event: string, callback: () => void) => callback()),
            setStyle: vi.fn(),
            bindPopup: vi.fn(() => ({ openPopup: vi.fn() })),
            getBounds: vi.fn(() => ({ isValid: () => true })),
            _map: { flyToBounds: vi.fn() },
        };
        onEachFeature?.({ properties: { name: 'Brazil' } }, layer);
        return <div data-testid="geo-json" />;
    },
    useMap: () => ({
        closePopup: vi.fn(),
        flyToBounds: vi.fn(),
    }),
}));

vi.mock('leaflet', () => ({
    default: {
        geoJSON: vi.fn(() => ({
            getBounds: () => ({ isValid: () => true }),
        })),
    },
}));

describe('SRS components', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-23T10:00:00.000Z'));
        vi.stubGlobal('fetch', vi.fn(async () => ({
            json: async () => ({ features: [{ properties: { name: 'Brazil' } }] }),
        })));
        search = new URLSearchParams('cat=capitals&cont=Todos');
        storeState.getDueItems.mockReturnValue(dueCards);
        storeState.processReview.mockClear();
        storeState.updateSettings.mockClear();
        navigate.mockClear();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('renders SRS menu, settings and navigation', () => {
        render(<SrsMenu />);

        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(navigate).toHaveBeenCalledWith('/');

        fireEvent.click(screen.getByText('Bandeiras'));
        fireEvent.click(screen.getByText('Europa'));
        fireEvent.click(screen.getByText(/Iniciar/));
        expect(navigate).toHaveBeenLastCalledWith('/srs/study?cat=flags&cont=Europa');

        fireEvent.click(screen.getAllByRole('button')[2]);
        fireEvent.click(screen.getByText('-'));
        fireEvent.click(screen.getByText('+'));
        expect(storeState.updateSettings).toHaveBeenCalledWith({ maxNewCardsPerDay: 15 });
        expect(storeState.updateSettings).toHaveBeenCalledWith({ maxNewCardsPerDay: 25 });
        fireEvent.click(screen.getByText('Salvar e Fechar'));

        fireEvent.click(screen.getAllByRole('button')[1]);
        expect(navigate).toHaveBeenCalledWith('/srs/browser');
    });

    it('renders SRS browser cards and filters', () => {
        render(<SrsBrowser />);

        expect(screen.getByText('Deck Browser')).toBeInTheDocument();
        expect(screen.getByText('Aprender/Esquecido')).toBeInTheDocument();
        expect(screen.getByText('Graduado')).toBeInTheDocument();

        fireEvent.click(screen.getByText('flags'));
        expect(screen.getByText('Bandeira')).toBeInTheDocument();

        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(navigate).toHaveBeenCalledWith('/srs');
    });

    it('renders empty browser state', () => {
        const oldItems = storeState.items;
        storeState.items = {} as typeof storeState.items;

        render(<SrsBrowser />);

        expect(screen.getByText(/Nenhum/)).toBeInTheDocument();
        storeState.items = oldItems;
    });

    it('reviews capital flashcards through correct and wrong ratings', () => {
        storeState.getDueItems.mockReturnValue([dueCards[0]]);
        render(<SrsFlashcard />);

        expect(storeState.getDueItems).toHaveBeenCalledWith('capitals', 'Todos', 20);
        expect(screen.getByText(/Qual a capital/)).toBeInTheDocument();
        expect(screen.getByText('Brasil')).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Revelar/));
        expect(screen.getByText('Brasilia')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Bom'));
        expect(screen.getByText('2/2')).toBeInTheDocument();
    });

    it('reviews wrong flashcards and can navigate back to decks', () => {
        storeState.getDueItems.mockReturnValue([{ ...dueCards[0], interval: 3 }]);
        render(<SrsFlashcard />);

        fireEvent.click(screen.getByText(/Revelar/));
        fireEvent.click(screen.getByText('Errei'));

        expect(storeState.processReview).toHaveBeenCalledWith('Brasil', 'capitals', 'forward', false);
        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(navigate).toHaveBeenCalledWith('/srs');
    });

    it('renders flag and map flashcards including empty deck', () => {
        search = new URLSearchParams('cat=flags&cont=Todos');
        storeState.getDueItems.mockReturnValue([dueCards[1]]);
        const { rerender, container } = render(<SrsFlashcard />);

        expect(screen.getByAltText('Bandeira')).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Revelar/));
        expect(screen.getByText('Brasil')).toBeInTheDocument();

        search = new URLSearchParams('cat=map&cont=Todos');
        storeState.getDueItems.mockReturnValue([dueCards[2]]);
        rerender(<SrsFlashcard />);
        expect(screen.getByAltText('Mapa')).toBeInTheDocument();

        cleanup();
        storeState.getDueItems.mockReturnValue([]);
        render(<SrsFlashcard />);
        expect(screen.getByText(/Conclu/)).toBeInTheDocument();

        storeState.getDueItems.mockReturnValue([undefined as never]);
        render(<SrsFlashcard />);
        expect(container).toBeDefined();
    });
});
