/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { COUNTRIES_DB } from './data/countries';

const state = vi.hoisted(() => ({
    game: {} as any,
    statsStore: {} as any,
    triggerConfetti: vi.fn(),
    triggerAchievementConfetti: vi.fn(),
}));

vi.mock('@vercel/analytics/react', () => ({
    Analytics: () => <div data-testid="analytics" />,
}));

vi.mock('./utils/confetti', () => ({
    triggerConfetti: state.triggerConfetti,
    triggerAchievementConfetti: state.triggerAchievementConfetti,
}));

vi.mock('./hooks/useGameStore', () => ({
    useGameStore: () => state.game,
}));

vi.mock('./hooks/useStatistics', () => ({
    useStatistics: () => state.statsStore,
}));

vi.mock('./components/Header', () => ({
    Header: ({ onOpenHelp, onOpenStats }: { onOpenHelp: () => void; onOpenStats: () => void }) => (
        <header>
            <button onClick={onOpenHelp}>help</button>
            <button onClick={onOpenStats}>stats</button>
        </header>
    ),
}));

vi.mock('./components/HelpModal', () => ({
    HelpModal: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="help-modal"><button onClick={onClose}>close-help</button></div>
    ),
}));

vi.mock('./components/StatsModal', () => ({
    StatsModal: ({ onClose, onRestart, gameState }: { onClose: () => void; onRestart: () => void; gameState: string }) => (
        <div data-testid="stats-modal">
            <span>{gameState}</span>
            <button onClick={onClose}>close-stats</button>
            <button onClick={onRestart}>restart-stats</button>
        </div>
    ),
}));

vi.mock('./components/ContinentsSelection', () => ({
    ContinentsSelection: ({ onBack, onSelect }: { onBack: () => void; onSelect: (continent: string) => void }) => (
        <div data-testid="continents">
            <button onClick={onBack}>continent-back</button>
            <button onClick={() => onSelect('Todos')}>continent-select</button>
        </div>
    ),
}));

vi.mock('./components/PlayingScreen', () => ({
    PlayingScreen: () => <div data-testid="playing-screen" />,
}));

vi.mock('./components/NotFound', () => ({
    NotFound: () => <div data-testid="not-found" />,
}));

vi.mock('./components/Home', () => ({
    Home: () => <div data-testid="home" />,
}));

vi.mock('./components/PracticeModes', () => ({
    PracticeModes: ({ onSelectMode }: { onSelectMode: (mode: string) => void }) => (
        <button onClick={() => onSelectMode('classic')}>select-mode</button>
    ),
}));

const RouteStub = ({ testId, onBack, onNextChallenge, onSelectCapitals, onSelectCountries, onSelectFinal }: any) => (
    <div data-testid={testId}>
        <button onClick={onBack}>back</button>
        <button onClick={onNextChallenge}>next</button>
        <button onClick={onSelectCapitals}>capitals</button>
        <button onClick={onSelectCountries}>countries</button>
        <button onClick={onSelectFinal}>final</button>
    </div>
);

vi.mock('./components/DailyChallenge', () => ({
    DailyChallenge: (props: any) => <RouteStub {...props} testId="daily" />,
}));
vi.mock('./components/DailyAnagram', () => ({
    DailyAnagram: (props: any) => <RouteStub {...props} testId="daily-anagram" />,
}));
vi.mock('./components/DailyWordle', () => ({
    DailyWordle: (props: any) => <RouteStub {...props} testId="daily-wordle" />,
}));
vi.mock('./components/DailyMap', () => ({
    DailyMap: (props: any) => <RouteStub {...props} testId="daily-map" />,
}));
vi.mock('./components/DailyCountry', () => ({
    DailyCountry: (props: any) => <RouteStub {...props} testId="daily-country" />,
}));
vi.mock('./components/DailyMix', () => ({
    DailyMix: (props: any) => <RouteStub {...props} testId="daily-mix" />,
}));
vi.mock('./components/DailyPopulation', () => ({
    DailyPopulation: (props: any) => <RouteStub {...props} testId="daily-population" />,
}));
vi.mock('./components/DailyCountryAnagram', () => ({
    DailyCountryAnagram: (props: any) => <RouteStub {...props} testId="daily-country-anagram" />,
}));
vi.mock('./components/DailyCountryWordle', () => ({
    DailyCountryWordle: (props: any) => <RouteStub {...props} testId="daily-country-wordle" />,
}));
vi.mock('./components/SupremeMenu', () => ({
    SupremeMenu: (props: any) => <RouteStub {...props} testId="supreme-menu" />,
}));
vi.mock('./components/SupremeCapitals', () => ({
    SupremeCapitals: (props: any) => <RouteStub {...props} testId="supreme-capitals" />,
}));
vi.mock('./components/SupremeCountries', () => ({
    SupremeCountries: (props: any) => <RouteStub {...props} testId="supreme-countries" />,
}));
vi.mock('./components/SupremeFinal', () => ({
    SupremeFinal: (props: any) => <RouteStub {...props} testId="supreme-final" />,
}));
vi.mock('./components/srs/SrsMenu', () => ({
    SrsMenu: (props: any) => <RouteStub {...props} testId="srs-menu" />,
}));
vi.mock('./components/srs/SrsFlashcard', () => ({
    SrsFlashcard: (props: any) => <RouteStub {...props} testId="srs-flashcard" />,
}));
vi.mock('./components/srs/SrsBrowser', () => ({
    SrsBrowser: (props: any) => <RouteStub {...props} testId="srs-browser" />,
}));
vi.mock('./components/online/OnlineLobby', () => ({
    OnlineLobby: (props: any) => <RouteStub {...props} testId="online-lobby" />,
}));

const makeGame = (overrides: Record<string, unknown> = {}) => ({
    gameMode: 'classic',
    gameState: 'start',
    isAnswered: false,
    timeLeft: 5,
    currentOptions: COUNTRIES_DB.slice(0, 5),
    score: 10,
    correctCount: 1,
    maxStreak: 1,
    questions: COUNTRIES_DB.slice(0, 2),
    setGameMode: vi.fn(),
    startQuiz: vi.fn(),
    tickTimer: vi.fn(),
    handleAnswer: vi.fn(),
    restart: vi.fn(),
    ...overrides,
});

const makeStatsStore = (overrides: Record<string, unknown> = {}) => ({
    clearNotifications: vi.fn(),
    updateStats: vi.fn(),
    newAchievements: [],
    stats: {
        totalGames: 1,
        totalCorrect: 1,
        totalQuestions: 2,
        bestStreak: 1,
        totalScore: 10,
        unlockedAchievements: [],
    },
    ...overrides,
});

const renderApp = (path = '/') => render(
    <MemoryRouter initialEntries={[path]}>
        <App />
    </MemoryRouter>
);

describe('App', () => {
    beforeEach(() => {
        state.game = makeGame();
        state.statsStore = makeStatsStore();
        state.triggerConfetti.mockClear();
        state.triggerAchievementConfetti.mockClear();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('renders home and opens/closes help and stats modals from the header', async () => {
        renderApp('/');

        expect(await screen.findByTestId('home')).toBeInTheDocument();
        fireEvent.click(screen.getByText('help'));
        expect(screen.getByTestId('help-modal')).toBeInTheDocument();
        fireEvent.click(screen.getByText('close-help'));
        expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('stats'));
        expect(screen.getByTestId('stats-modal')).toBeInTheDocument();
        fireEvent.click(screen.getByText('close-stats'));
        expect(screen.queryByTestId('stats-modal')).not.toBeInTheDocument();
    });

    it('routes practice mode selection through continents into playing', async () => {
        renderApp('/practice');

        fireEvent.click(await screen.findByText('select-mode'));
        expect(state.game.setGameMode).toHaveBeenCalledWith('classic');
        expect(await screen.findByTestId('continents')).toBeInTheDocument();

        fireEvent.click(screen.getByText('continent-select'));
        expect(state.statsStore.clearNotifications).toHaveBeenCalled();
        expect(state.game.startQuiz).toHaveBeenCalledWith('Todos');
        expect(await screen.findByTestId('playing-screen')).toBeInTheDocument();
    });

    it('supports daily next navigation and supreme menu callbacks', async () => {
        renderApp('/daily');

        expect(await screen.findByTestId('daily')).toBeInTheDocument();
        fireEvent.click(screen.getByText('next'));
        expect(await screen.findByTestId('daily-anagram')).toBeInTheDocument();

        cleanup();
        renderApp('/supreme-menu');
        expect(await screen.findByTestId('supreme-menu')).toBeInTheDocument();
        fireEvent.click(screen.getByText('capitals'));
        expect(await screen.findByTestId('supreme-capitals')).toBeInTheDocument();

        cleanup();
        renderApp('/supreme-menu');
        fireEvent.click(await screen.findByText('countries'));
        expect(await screen.findByTestId('supreme-countries')).toBeInTheDocument();

        cleanup();
        renderApp('/supreme-menu');
        fireEvent.click(await screen.findByText('final'));
        expect(await screen.findByTestId('supreme-final')).toBeInTheDocument();
    });

    it('handles global shortcuts and sudden death timer ticks while playing', async () => {
        state.game = makeGame({
            gameMode: 'suddenDeath',
            gameState: 'playing',
            isAnswered: false,
        });

        renderApp('/playing');
        expect(await screen.findByTestId('playing-screen')).toBeInTheDocument();

        fireEvent.keyDown(window, { key: '1' });
        expect(state.game.handleAnswer).toHaveBeenCalledWith(COUNTRIES_DB[0].capital);
    });

    it('ticks sudden death timer interval', () => {
        vi.useFakeTimers();
        state.game = makeGame({
            gameMode: 'suddenDeath',
            gameState: 'playing',
            isAnswered: false,
        });

        renderApp('/playing');
        vi.advanceTimersByTime(1000);

        expect(state.game.tickTimer).toHaveBeenCalledOnce();
    });

    it('submits timeout answers, records finished games and shows achievement toasts', async () => {
        state.game = makeGame({
            gameMode: 'suddenDeath',
            gameState: 'playing',
            isAnswered: false,
            timeLeft: 0,
        });
        state.statsStore = makeStatsStore({
            newAchievements: [{ id: 'first_win', title: 'Primeiros Passos' }],
        });

        renderApp('/playing');
        expect(await screen.findByTestId('playing-screen')).toBeInTheDocument();
        expect(state.game.handleAnswer).toHaveBeenCalledWith('TIME_UP');
        expect(state.triggerAchievementConfetti).toHaveBeenCalled();
        expect(screen.getByText('Primeiros Passos')).toBeInTheDocument();

        cleanup();
        state.game = makeGame({ gameState: 'finished' });
        renderApp('/playing');

        expect(state.statsStore.updateStats).toHaveBeenCalledWith({
            score: 10,
            correctCount: 1,
            streak: 1,
        }, 2);
        expect(state.triggerConfetti).toHaveBeenCalled();

        await waitFor(() => expect(screen.getByTestId('stats-modal')).toBeInTheDocument());
        fireEvent.click(screen.getByText('restart-stats'));
        expect(state.game.restart).toHaveBeenCalled();
    });

    it('renders remaining lazy routes and not found', async () => {
        const routes = [
            ['/daily-wordle', 'daily-wordle'],
            ['/daily-map', 'daily-map'],
            ['/daily-country', 'daily-country'],
            ['/daily-population', 'daily-population'],
            ['/daily-country-anagram', 'daily-country-anagram'],
            ['/daily-country-wordle', 'daily-country-wordle'],
            ['/daily-mix', 'daily-mix'],
            ['/supreme-countries', 'supreme-countries'],
            ['/supreme-final', 'supreme-final'],
            ['/srs', 'srs-menu'],
            ['/srs/study', 'srs-flashcard'],
            ['/srs/browser', 'srs-browser'],
            ['/online', 'online-lobby'],
            ['/missing', 'not-found'],
        ];

        for (const [path, testId] of routes) {
            cleanup();
            renderApp(path);
            expect(await screen.findByTestId(testId)).toBeInTheDocument();
        }
    }, 15_000);

    it('executes route back and next callbacks across routed screens', async () => {
        const routeActions = [
            ['/supreme-capitals', 'supreme-capitals', 'back', 'supreme-menu'],
            ['/supreme-countries', 'supreme-countries', 'back', 'supreme-menu'],
            ['/supreme-final', 'supreme-final', 'back', 'supreme-menu'],
            ['/supreme-menu', 'supreme-menu', 'back', 'home'],
            ['/daily', 'daily', 'back', 'home'],
            ['/daily-anagram', 'daily-anagram', 'back', 'home'],
            ['/daily-wordle', 'daily-wordle', 'back', 'home'],
            ['/daily-map', 'daily-map', 'back', 'home'],
            ['/daily-country', 'daily-country', 'back', 'home'],
            ['/daily-population', 'daily-population', 'back', 'home'],
            ['/daily-country-anagram', 'daily-country-anagram', 'back', 'home'],
            ['/daily-country-wordle', 'daily-country-wordle', 'back', 'home'],
            ['/daily-mix', 'daily-mix', 'back', 'home'],
            ['/daily-mix', 'daily-mix', 'next', 'daily'],
            ['/online', 'online-lobby', 'back', 'home'],
        ];

        for (const [path, initialId, buttonText, finalId] of routeActions) {
            cleanup();
            renderApp(path);
            expect(await screen.findByTestId(initialId)).toBeInTheDocument();
            fireEvent.click(screen.getByText(buttonText));
            expect(await screen.findByTestId(finalId)).toBeInTheDocument();
        }

        cleanup();
        renderApp('/practice');
        await screen.findByText('select-mode');
        fireEvent.click(screen.getAllByRole('button')[2]);
        expect(await screen.findByTestId('home')).toBeInTheDocument();

        cleanup();
        renderApp('/continents');
        expect(await screen.findByTestId('continents')).toBeInTheDocument();
        fireEvent.click(screen.getByText('continent-back'));
        expect(await screen.findByText('select-mode')).toBeInTheDocument();
    }, 15_000);
});
