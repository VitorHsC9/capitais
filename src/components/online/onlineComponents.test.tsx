/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { useOnlineGame } from '../../hooks/useOnlineGame';
import type { RoomData, RoundData } from '../../services/roomService';
import { OnlineGame } from './OnlineGame';
import { OnlineLobby } from './OnlineLobby';
import { OnlineResults } from './OnlineResults';

let currentGame: ReturnType<typeof useOnlineGame>;

vi.mock('../../hooks/useOnlineGame', () => ({
    useOnlineGame: () => currentGame,
}));

vi.mock('./TerritoryMap', () => ({
    TerritoryMap: ({ countryCode }: { countryCode: string }) => (
        <div data-testid="territory-map">{countryCode}</div>
    ),
}));

const question = {
    name: 'Brasil',
    capital: 'Brasilia',
    continent: 'Todos' as const,
    code: 'br',
};

const other = {
    name: 'Argentina',
    capital: 'Buenos Aires',
    continent: 'Todos' as const,
    code: 'ar',
};

const round = (overrides: Partial<RoundData> = {}): RoundData => ({
    question,
    options: [question, other],
    type: 'capital',
    startedAt: Date.now(),
    ...overrides,
});

const room = (overrides: Partial<RoomData> = {}): RoomData => ({
    status: 'playing',
    category: 'capitals',
    mode: 'classic',
    inputFormat: 'multiple_choice',
    hostId: 'me',
    createdAt: Date.now(),
    currentRound: 0,
    totalRounds: 10,
    players: {
        me: {
            name: 'Ana',
            score: 120,
            streak: 1,
            lives: 3,
            isReady: true,
            isAlive: true,
            isConnected: true,
        },
        them: {
            name: 'Beto',
            score: 90,
            streak: 0,
            lives: 2,
            isReady: true,
            isAlive: true,
            isConnected: true,
        },
    },
    rounds: { 0: round() },
    ...overrides,
});

const makeGame = (overrides: Partial<ReturnType<typeof useOnlineGame>> = {}): ReturnType<typeof useOnlineGame> => ({
    phase: 'playing',
    roomCode: 'ROOM1',
    playerId: 'me',
    playerName: 'Ana',
    roomData: room(),
    currentRound: round(),
    myAnswer: null,
    opponentAnswer: null,
    opponentId: 'them',
    opponentName: 'Beto',
    roundAnswers: null,
    timeLeft: 8,
    error: null,
    isHost: true,
    isLoading: false,
    selectedCategory: null,
    selectedMode: null,
    selectedInputFormat: 'multiple_choice',
    setPlayerName: vi.fn(),
    selectCategory: vi.fn(),
    selectMode: vi.fn(),
    setSelectedInputFormat: vi.fn(),
    handleCreateRoom: vi.fn(),
    handleJoinRoom: vi.fn(),
    handleReady: vi.fn(),
    handleStartGame: vi.fn(),
    handleAnswer: vi.fn(),
    handleRematch: vi.fn(),
    handleLeave: vi.fn(),
    goToCategorySelect: vi.fn(),
    goBackToMenu: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
});

describe('online components', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders loading and multiple-choice online game states', () => {
        const loadingGame = makeGame({ roomData: null, currentRound: null });
        const { rerender } = render(<OnlineGame game={loadingGame} />);
        expect(screen.getByText('Carregando...')).toBeInTheDocument();

        const game = makeGame();
        rerender(<OnlineGame game={game} />);

        fireEvent.click(screen.getByText('Brasilia'));
        expect(game.handleAnswer).toHaveBeenCalledWith('Brasilia');
        expect(screen.getByText('QUAL A CAPITAL?')).toBeInTheDocument();
        expect(screen.getByText('1/10')).toBeInTheDocument();
    });

    it('renders flag, territory, typing, timer and answer states', () => {
        const flagGame = makeGame({
            currentRound: round({ type: 'flag' }),
            roomData: room({ rounds: { 0: round({ type: 'flag' }) } }),
            timeLeft: 2,
        });
        const { rerender } = render(<OnlineGame game={flagGame} />);
        expect(screen.getByAltText('Flag')).toBeInTheDocument();
        expect(screen.getByText('QUE PAIS E ESSE?')).toBeInTheDocument();

        const territoryGame = makeGame({
            currentRound: round({ type: 'territory' }),
            roomData: room({ rounds: { 0: round({ type: 'territory' }) } }),
        });
        rerender(<OnlineGame game={territoryGame} />);
        expect(screen.getByTestId('territory-map')).toHaveTextContent('br');

        const typingGame = makeGame({
            currentRound: round({ type: 'reverse' }),
            roomData: room({ inputFormat: 'typing', rounds: { 0: round({ type: 'reverse' }) } }),
        });
        rerender(<OnlineGame game={typingGame} />);
        fireEvent.change(screen.getByPlaceholderText(/Digite o pa/), { target: { value: 'Brasil' } });
        fireEvent.keyDown(screen.getByPlaceholderText(/Digite o pa/), { key: 'Enter' });
        expect(typingGame.handleAnswer).toHaveBeenCalledWith('Brasil');
        fireEvent.change(screen.getByPlaceholderText(/Digite o pa/), { target: { value: 'Brasil' } });
        fireEvent.click(screen.getByRole('button', { name: '' }));
        expect(typingGame.handleAnswer).toHaveBeenCalledWith('Brasil');

        const answeredTyping = makeGame({
            myAnswer: { answer: 'Argentina', answeredAt: Date.now(), isCorrect: false },
            currentRound: round({ type: 'reverse' }),
            roomData: room({ inputFormat: 'typing', rounds: { 0: round({ type: 'reverse' }) } }),
        });
        rerender(<OnlineGame game={answeredTyping} />);
        expect(screen.getByText(/Sua resposta/)).toBeInTheDocument();
        expect(screen.getByText(/Resposta: Brasil/)).toBeInTheDocument();
    });

    it('renders round result overlays and life modes', () => {
        const resultGame = makeGame({
            phase: 'round-result',
            myAnswer: { answer: 'Brasilia', answeredAt: Date.now(), isCorrect: true },
            opponentAnswer: { answer: 'wrong', answeredAt: Date.now(), isCorrect: false },
            roundAnswers: {
                me: { answer: 'Brasilia', answeredAt: Date.now(), isCorrect: true },
                them: { answer: 'wrong', answeredAt: Date.now(), isCorrect: false },
            },
        });
        const { rerender } = render(<OnlineGame game={resultGame} />);
        expect(screen.getByText('Ponto seu!')).toBeInTheDocument();
        expect(screen.getByText('Resposta Correta')).toBeInTheDocument();

        rerender(<OnlineGame game={{
            ...resultGame,
            myAnswer: { answer: 'wrong', answeredAt: Date.now(), isCorrect: false },
            opponentAnswer: { answer: 'Brasilia', answeredAt: Date.now(), isCorrect: true },
        }} />);
        expect(screen.getByText('Ponto do oponente')).toBeInTheDocument();

        rerender(<OnlineGame game={{
            ...resultGame,
            myAnswer: { answer: 'Brasilia', answeredAt: Date.now(), isCorrect: true },
            opponentAnswer: { answer: 'Brasilia', answeredAt: Date.now(), isCorrect: true },
        }} />);
        expect(screen.getByText('Ambos acertaram!')).toBeInTheDocument();

        rerender(<OnlineGame game={{
            ...resultGame,
            myAnswer: { answer: 'wrong', answeredAt: Date.now(), isCorrect: false },
            opponentAnswer: { answer: 'wrong', answeredAt: Date.now(), isCorrect: false },
        }} />);
        expect(screen.getByText('Ninguem acertou')).toBeInTheDocument();

        const infiniteGame = makeGame({
            roomData: room({ mode: 'infinite' }),
            currentRound: round(),
        });
        rerender(<OnlineGame game={infiniteGame} />);
        expect(screen.getAllByText('1').length).toBeGreaterThan(0);

        const survivalGame = makeGame({
            roomData: room({
                mode: 'survival',
                players: {
                    ...room().players!,
                    them: { ...room().players!.them, isAlive: false },
                },
            }),
            currentRound: round(),
        });
        rerender(<OnlineGame game={survivalGame} />);
        expect(screen.getAllByText('Beto').length).toBeGreaterThan(0);
    });

    it('renders incorrect selected options and fallback round labels', () => {
        const wrongSelectionGame = makeGame({
            phase: 'round-result',
            myAnswer: { answer: 'Buenos Aires', answeredAt: Date.now(), isCorrect: false },
            opponentAnswer: { answer: 'Brasilia', answeredAt: Date.now(), isCorrect: true },
        });
        const { rerender } = render(<OnlineGame game={wrongSelectionGame} />);
        expect(screen.getByText('Ponto do oponente')).toBeInTheDocument();

        const fallbackGame = makeGame({
            currentRound: round({ type: 'unknown' as never }),
            roomData: room({ rounds: { 0: round({ type: 'unknown' as never }) } }),
        });
        rerender(<OnlineGame game={fallbackGame} />);
        expect(screen.getAllByText('Brasil').length).toBeGreaterThan(0);
    });

    it('covers online game timer, missing opponent and guarded typing submit states', () => {
        const noOpponentGame = makeGame({
            opponentId: null,
            timeLeft: 4,
            roomData: room({
                mode: 'infinite',
                players: {
                    me: { ...room().players!.me, lives: undefined as never },
                },
            }),
        });
        const { rerender } = render(<OnlineGame game={noOpponentGame} />);
        expect(screen.getByText('???')).toBeInTheDocument();

        const capitalTypingGame = makeGame({
            currentRound: round({ type: 'capital' }),
            roomData: room({ inputFormat: 'typing', rounds: { 0: round({ type: 'capital' }) } }),
        });
        rerender(<OnlineGame game={capitalTypingGame} />);
        const input = screen.getByPlaceholderText(/Digite a capital/);
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(capitalTypingGame.handleAnswer).not.toHaveBeenCalled();

        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.click(screen.getByRole('button', { name: '' }));
        expect(capitalTypingGame.handleAnswer).not.toHaveBeenCalled();

        const answeredGame = makeGame({
            myAnswer: { answer: 'Brasilia', answeredAt: Date.now(), isCorrect: true },
        });
        rerender(<OnlineGame game={answeredGame} />);
        fireEvent.click(screen.getByText('Brasilia'));
        expect(answeredGame.handleAnswer).not.toHaveBeenCalled();
    });

    it('renders online results winner, draw, loser and actions', () => {
        const onBack = vi.fn();
        const game = makeGame({ phase: 'results', roomData: room({ status: 'finished' }) });
        const { rerender } = render(<OnlineResults game={game} onBack={onBack} />);

        expect(screen.getByText('VITÓRIA!')).toBeInTheDocument();
        fireEvent.click(screen.getByText('REVANCHE'));
        fireEvent.click(screen.getByText('MENU'));
        expect(game.handleRematch).toHaveBeenCalledOnce();
        expect(game.handleLeave).toHaveBeenCalledOnce();
        expect(onBack).toHaveBeenCalledOnce();

        rerender(<OnlineResults game={makeGame({
            isHost: false,
            roomData: room({
                mode: 'classic',
                players: {
                    me: { ...room().players!.me, score: 100 },
                    them: { ...room().players!.them, score: 100 },
                },
            }),
        })} onBack={onBack} />);
        expect(screen.getByText('EMPATE!')).toBeInTheDocument();

        rerender(<OnlineResults game={makeGame({
            roomData: room({
                mode: 'survival',
                players: {
                    me: { ...room().players!.me, score: 200, isAlive: false },
                    them: { ...room().players!.them, score: 10, isAlive: true },
                },
            }),
        })} onBack={onBack} />);
        expect(screen.getByText('DERROTA')).toBeInTheDocument();

        rerender(<OnlineResults game={makeGame({
            roomData: room({
                mode: 'infinite',
                players: {
                    me: { ...room().players!.me, score: 0, isAlive: true },
                    them: { ...room().players!.them, score: 999, isAlive: false },
                },
            }),
        })} onBack={onBack} />);
        expect(screen.getByText('VITÓRIA!')).toBeInTheDocument();

        const { container } = render(<OnlineResults game={makeGame({ roomData: null })} onBack={onBack} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders lobby menu, category, mode and waiting phases', () => {
        currentGame = makeGame({
            phase: 'menu',
            playerName: '',
            roomData: null,
            roomCode: null,
            error: 'Erro',
        });
        const onBack = vi.fn();
        const { rerender } = render(<OnlineLobby onBack={onBack} />);

        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(onBack).toHaveBeenCalledOnce();
        fireEvent.change(screen.getByLabelText('Seu Nome'), { target: { value: 'Ana' } });
        expect(currentGame.setPlayerName).toHaveBeenCalledWith('Ana');
        fireEvent.click(screen.getByText('✕'));
        expect(currentGame.clearError).toHaveBeenCalledOnce();

        currentGame = makeGame({ phase: 'category-select' });
        rerender(<OnlineLobby onBack={onBack} />);
        fireEvent.click(screen.getByText('CAPITAIS'));
        expect(currentGame.selectCategory).toHaveBeenCalledWith('capitals');

        currentGame = makeGame({ phase: 'mode-select', selectedCategory: 'capitals', selectedMode: null });
        rerender(<OnlineLobby onBack={onBack} />);
        fireEvent.click(screen.getByText(/VELOCIDADE/));
        expect(currentGame.selectMode).toHaveBeenCalledWith('speed');

        currentGame = makeGame({ phase: 'mode-select', selectedCategory: 'capitals', selectedMode: 'speed' });
        rerender(<OnlineLobby onBack={onBack} />);
        fireEvent.click(screen.getByText('Digitação'));
        fireEvent.click(screen.getByText('CRIAR SALA'));
        expect(currentGame.setSelectedInputFormat).toHaveBeenCalledWith('typing');
        expect(currentGame.handleCreateRoom).toHaveBeenCalledOnce();

        currentGame = makeGame({ phase: 'waiting', roomData: room({ status: 'waiting' }), roomCode: 'ROOM1' });
        Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
        rerender(<OnlineLobby onBack={onBack} />);
        fireEvent.click(screen.getByText('ROOM1'));
        fireEvent.click(screen.getByText('CANCELAR PRONTO'));
        fireEvent.click(screen.getByText(/INICIAR/));
        expect(currentGame.handleReady).toHaveBeenCalledOnce();
        expect(currentGame.handleStartGame).toHaveBeenCalledOnce();
    });

    it('covers lobby join, loading, back and incomplete waiting states', () => {
        currentGame = makeGame({
            phase: 'menu',
            playerName: 'Ana',
            roomData: null,
            roomCode: null,
            isLoading: true,
        });
        const onBack = vi.fn();
        const { rerender } = render(<OnlineLobby onBack={onBack} />);

        fireEvent.change(screen.getByLabelText('Entrar numa Sala'), { target: { value: 'ab-12_3' } });
        expect(screen.getByDisplayValue('AB123')).toBeInTheDocument();
        expect(screen.getAllByRole('button').some((button) => button.querySelector('.animate-spin'))).toBe(true);

        currentGame = makeGame({
            phase: 'menu',
            playerName: 'Ana',
            roomData: null,
            roomCode: null,
            isLoading: false,
        });
        rerender(<OnlineLobby onBack={onBack} />);
        fireEvent.click(screen.getByText('CRIAR SALA'));
        expect(currentGame.goToCategorySelect).toHaveBeenCalledOnce();
        fireEvent.change(screen.getByLabelText('Entrar numa Sala'), { target: { value: 'ROOM99' } });
        fireEvent.click(screen.getByText('ENTRAR'));
        expect(currentGame.handleJoinRoom).toHaveBeenCalledWith('ROOM99');

        currentGame = makeGame({
            phase: 'mystery' as never,
            roomData: null,
        });
        rerender(<OnlineLobby onBack={onBack} />);
        expect(screen.getAllByText('Online')).toHaveLength(2);

        currentGame = makeGame({
            phase: 'category-select',
            roomData: null,
        });
        rerender(<OnlineLobby onBack={onBack} />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(currentGame.goBackToMenu).toHaveBeenCalledOnce();
        fireEvent.click(screen.getByText('BANDEIRAS'));
        fireEvent.click(screen.getByText(/TERRIT/));
        fireEvent.click(screen.getByText('MISTO'));
        expect(currentGame.selectCategory).toHaveBeenCalledWith('flags');
        expect(currentGame.selectCategory).toHaveBeenCalledWith('territories');
        expect(currentGame.selectCategory).toHaveBeenCalledWith('mix');

        currentGame = makeGame({
            phase: 'mode-select',
            selectedCategory: 'mix',
            selectedMode: 'classic',
            selectedInputFormat: 'multiple_choice',
            isLoading: true,
        });
        rerender(<OnlineLobby onBack={onBack} />);
        fireEvent.click(screen.getByText('Alternativas'));
        fireEvent.click(screen.getByText(/SOBREVIV/));
        fireEvent.click(screen.getByText('INFINITO'));
        expect(currentGame.setSelectedInputFormat).toHaveBeenCalledWith('multiple_choice');
        expect(currentGame.selectMode).toHaveBeenCalledWith('survival');
        expect(currentGame.selectMode).toHaveBeenCalledWith('infinite');

        currentGame = makeGame({
            phase: 'waiting',
            roomData: room({
                status: 'waiting',
                inputFormat: 'typing',
                players: {
                    me: { ...room().players!.me, isReady: false },
                },
            }),
            roomCode: 'ROOM1',
            isHost: false,
        });
        Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
        rerender(<OnlineLobby onBack={onBack} />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(currentGame.handleLeave).toHaveBeenCalledOnce();
        expect(screen.getByText(/Aguardando oponente/)).toBeInTheDocument();
        expect(screen.getByText('ESTOU PRONTO')).toBeInTheDocument();
        fireEvent.click(screen.getAllByRole('button')[1]);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ROOM1');
    });

    it('routes lobby directly to game and results phases', () => {
        currentGame = makeGame({ phase: 'playing' });
        const { rerender } = render(<OnlineLobby onBack={vi.fn()} />);
        expect(screen.getByText('QUAL A CAPITAL?')).toBeInTheDocument();

        currentGame = makeGame({ phase: 'results', roomData: room({ status: 'finished' }) });
        rerender(<OnlineLobby onBack={vi.fn()} />);
        expect(screen.getByText('VITÓRIA!')).toBeInTheDocument();
    });
});
