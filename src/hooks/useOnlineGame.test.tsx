/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOnlineGame } from './useOnlineGame';
import type { PlayerAnswer, RoomData } from '../services/roomService';

type RoundAnswers = Record<string, PlayerAnswer>;
type JoinRoomResult = { success: boolean; error?: string };

const service = vi.hoisted(() => {
    let roomCallback: ((data: RoomData | null) => void) | null = null;
    let answersCallback: ((answers: RoundAnswers | null) => void) | null = null;

    return {
        get roomCallback() {
            return roomCallback;
        },
        set roomCallback(value) {
            roomCallback = value;
        },
        get answersCallback() {
            return answersCallback;
        },
        set answersCallback(value) {
            answersCallback = value;
        },
        createRoom: vi.fn(async () => 'ROOM1'),
        joinRoom: vi.fn(async (): Promise<JoinRoomResult> => ({ success: true })),
        setPlayerReady: vi.fn(async () => undefined),
        startGame: vi.fn(async () => undefined),
        submitAnswer: vi.fn(async () => undefined),
        updatePlayerScore: vi.fn(async () => undefined),
        advanceRound: vi.fn(async () => true),
        finishGame: vi.fn(async () => undefined),
        requestRematch: vi.fn(async () => 'ROOM1'),
        leaveRoom: vi.fn(async () => undefined),
        listenToRoom: vi.fn((_roomCode: string, callback: (data: RoomData | null) => void) => {
            roomCallback = callback;
            return vi.fn();
        }),
        listenToAnswers: vi.fn((_roomCode: string, _round: number, callback: (answers: RoundAnswers | null) => void) => {
            answersCallback = callback;
            return vi.fn();
        }),
        generatePlayerId: vi.fn(() => 'player-1'),
    };
});

vi.mock('../services/roomService', () => service);

const question = {
    name: 'Brasil',
    capital: 'Brasilia',
    continent: 'Todos' as const,
    code: 'br',
};

const makeRoom = (overrides: Partial<RoomData> = {}): RoomData => ({
    status: 'waiting',
    category: 'capitals',
    mode: 'classic',
    inputFormat: 'multiple_choice',
    hostId: 'player-1',
    createdAt: Date.now(),
    currentRound: 0,
    totalRounds: 2,
    players: {
        'player-1': {
            name: 'Ana',
            score: 0,
            streak: 0,
            lives: 3,
            isReady: false,
            isAlive: true,
            isConnected: true,
        },
        'player-2': {
            name: 'Beto',
            score: 0,
            streak: 0,
            lives: 3,
            isReady: false,
            isAlive: true,
            isConnected: true,
        },
    },
    ...overrides,
});

describe('useOnlineGame', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-23T10:00:00.000Z'));
        localStorage.clear();
        sessionStorage.clear();
        service.roomCallback = null;
        service.answersCallback = null;
        Object.values(service).forEach((value) => {
            if (typeof value === 'function' && 'mockClear' in value) {
                value.mockClear();
            }
        });
        service.createRoom.mockResolvedValue('ROOM1');
        service.joinRoom.mockResolvedValue({ success: true });
        service.advanceRound.mockResolvedValue(true);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('creates, joins, answers, rematches and leaves online games', async () => {
        const { result } = renderHook(() => useOnlineGame());

        expect(result.current.playerId).toBe('player-1');
        expect(sessionStorage.getItem('online-player-id')).toBe('player-1');

        await act(async () => result.current.handleCreateRoom());
        expect(result.current.error).toBe('Digite seu nome');

        act(() => {
            result.current.clearError();
            result.current.setPlayerName(' Ana ');
            result.current.goToCategorySelect();
            result.current.selectCategory('capitals');
            result.current.selectMode('speed');
            result.current.setSelectedInputFormat('typing');
        });

        expect(result.current.phase).toBe('mode-select');
        expect(result.current.selectedCategory).toBe('capitals');
        expect(result.current.selectedMode).toBe('speed');

        await act(async () => result.current.handleCreateRoom());
        expect(service.createRoom).toHaveBeenCalledWith('Ana', 'capitals', 'speed', 'typing', 'player-1');
        expect(result.current.roomCode).toBe('ROOM1');
        expect(result.current.phase).toBe('waiting');

        const playingRoom = makeRoom({
            status: 'playing',
            mode: 'speed',
            inputFormat: 'typing',
            rounds: {
                0: {
                    question,
                    options: [],
                    type: 'capital',
                    startedAt: Date.now(),
                },
            },
        });

        act(() => service.roomCallback?.(playingRoom));
        expect(result.current.phase).toBe('playing');
        expect(result.current.currentRound?.question.name).toBe('Brasil');
        expect(result.current.timeLeft).toBe(5);
        expect(result.current.opponentId).toBe('player-2');
        expect(result.current.opponentName).toBe('Beto');

        await act(async () => result.current.handleReady());
        expect(service.setPlayerReady).toHaveBeenCalledWith('ROOM1', 'player-1', true);

        await act(async () => result.current.handleStartGame());
        expect(service.startGame).toHaveBeenCalledWith('ROOM1');

        act(() => result.current.handleAnswer('Brasilia'));
        expect(service.submitAnswer).toHaveBeenCalledWith('ROOM1', 0, 'player-1', 'Brasilia', true);
        expect(service.updatePlayerScore).toHaveBeenCalledWith('ROOM1', 'player-1', 150, 1, true, 3);
        expect(result.current.myAnswer?.isCorrect).toBe(true);

        act(() => service.answersCallback?.({
            'player-1': { answer: 'Brasilia', answeredAt: Date.now(), isCorrect: true },
            'player-2': { answer: 'wrong', answeredAt: Date.now(), isCorrect: false },
        }));

        expect(result.current.phase).toBe('round-result');
        await act(async () => vi.advanceTimersByTime(2500));
        expect(service.advanceRound).toHaveBeenCalledWith('ROOM1');

        await act(async () => result.current.handleRematch());
        expect(service.requestRematch).toHaveBeenCalledWith('ROOM1');

        await act(async () => result.current.handleLeave());
        expect(service.leaveRoom).toHaveBeenCalledWith('ROOM1', 'player-1');
        expect(result.current.phase).toBe('menu');
        expect(result.current.roomCode).toBeNull();
    });

    it('handles join errors, room deletion, timeouts and end-of-game advancement', async () => {
        const { result } = renderHook(() => useOnlineGame());

        await act(async () => result.current.handleJoinRoom(''));
        expect(result.current.error).toBe('Digite seu nome');

        act(() => result.current.setPlayerName('Ana'));
        await act(async () => result.current.handleJoinRoom(''));
        expect(result.current.error).toBe('Digite o código da sala');

        service.joinRoom.mockResolvedValueOnce({ success: false, error: 'Sala cheia' });
        await act(async () => result.current.handleJoinRoom('abc123'));
        expect(service.joinRoom).toHaveBeenCalledWith('ABC123', 'Ana', 'player-1');
        expect(result.current.error).toBe('Sala cheia');

        service.joinRoom.mockRejectedValueOnce(new Error('offline'));
        await act(async () => result.current.handleJoinRoom('abc123'));
        expect(result.current.error).toBe('Erro ao entrar na sala. Verifique o código.');

        service.joinRoom.mockResolvedValueOnce({ success: true });
        await act(async () => result.current.handleJoinRoom('abc123'));
        expect(result.current.phase).toBe('waiting');

        act(() => service.roomCallback?.(null));
        expect(result.current.error).toBe('Sala foi encerrada');
        expect(result.current.phase).toBe('menu');

        service.joinRoom.mockResolvedValueOnce({ success: true });
        await act(async () => result.current.handleJoinRoom('abc123'));
        const infiniteRoom = makeRoom({
            status: 'playing',
            mode: 'infinite',
            inputFormat: 'multiple_choice',
            rounds: {
                0: {
                    question,
                    options: [question],
                    type: 'reverse',
                    startedAt: Date.now(),
                },
            },
        });
        act(() => service.roomCallback?.(infiniteRoom));
        expect(result.current.phase).toBe('playing');

        act(() => vi.advanceTimersByTime(10_000));
        expect(service.submitAnswer).toHaveBeenCalledWith('ABC123', 0, 'player-1', 'TIME_UP', false);
        expect(service.updatePlayerScore).toHaveBeenCalledWith('ABC123', 'player-1', 0, 0, true, 2);

        service.advanceRound.mockResolvedValueOnce(false);
        act(() => service.answersCallback?.({
            'player-1': { answer: 'TIME_UP', answeredAt: Date.now(), isCorrect: false },
            'player-2': { answer: 'Brasil', answeredAt: Date.now(), isCorrect: true },
        }));
        expect(result.current.phase).toBe('round-result');
        await act(async () => vi.advanceTimersByTime(2500));
        expect(service.finishGame).toHaveBeenCalledWith('ABC123');

        act(() => service.roomCallback?.(makeRoom({ status: 'finished' })));
        expect(result.current.phase).toBe('results');

        act(() => service.roomCallback?.(makeRoom({ status: 'waiting' })));
        expect(result.current.phase).toBe('waiting');
    });

    it('navigates back through selection phases', () => {
        const { result } = renderHook(() => useOnlineGame());

        act(() => result.current.goToCategorySelect());
        expect(result.current.phase).toBe('category-select');

        act(() => result.current.selectCategory('flags'));
        expect(result.current.phase).toBe('mode-select');

        act(() => result.current.goBackToMenu());
        expect(result.current.phase).toBe('category-select');
        expect(result.current.selectedMode).toBeNull();

        act(() => result.current.goBackToMenu());
        expect(result.current.phase).toBe('menu');
        expect(result.current.selectedCategory).toBeNull();
    });

    it('handles create/start/rematch/leave failures and fallback navigation', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { result } = renderHook(() => useOnlineGame());

        act(() => result.current.setPlayerName('Ana'));
        await act(async () => result.current.handleCreateRoom());
        expect(result.current.error).toBe('Selecione categoria e modo');

        act(() => {
            result.current.clearError();
            result.current.selectCategory('flags');
            result.current.selectMode('classic');
        });
        service.createRoom.mockRejectedValueOnce(new Error('offline'));
        await act(async () => result.current.handleCreateRoom());
        expect(result.current.error).toBe('Erro ao criar sala. Verifique sua conexão.');

        service.createRoom.mockResolvedValueOnce('ROOM1');
        await act(async () => result.current.handleCreateRoom());
        act(() => service.roomCallback?.(makeRoom({ status: 'waiting' })));

        service.startGame.mockRejectedValueOnce(new Error('start failed'));
        await act(async () => result.current.handleStartGame());
        expect(result.current.error).toBe('Erro ao iniciar partida');

        service.requestRematch.mockRejectedValueOnce(new Error('rematch failed'));
        await act(async () => result.current.handleRematch());
        expect(result.current.error).toBe('Erro ao solicitar revanche');

        service.leaveRoom.mockRejectedValueOnce(new Error('leave failed'));
        await act(async () => result.current.handleLeave());
        expect(consoleSpy).toHaveBeenCalledWith('Error leaving room:', expect.any(Error));

        act(() => result.current.goBackToMenu());
        expect(result.current.phase).toBe('menu');
    });

    it('scores non-capital answers and refreshes answer listeners across rounds', async () => {
        const { result } = renderHook(() => useOnlineGame());

        act(() => {
            result.current.setPlayerName('Ana');
            result.current.selectCategory('territories');
            result.current.selectMode('survival');
        });
        await act(async () => result.current.handleCreateRoom());

        const territoryRoom = makeRoom({
            status: 'playing',
            mode: 'survival',
            inputFormat: 'multiple_choice',
            rounds: {
                0: {
                    question,
                    options: [question],
                    type: 'territory',
                    startedAt: Date.now(),
                },
            },
        });
        act(() => service.roomCallback?.(territoryRoom));
        act(() => result.current.handleAnswer('Argentina'));
        expect(service.submitAnswer).toHaveBeenLastCalledWith('ROOM1', 0, 'player-1', 'Argentina', false);
        expect(service.updatePlayerScore).toHaveBeenLastCalledWith('ROOM1', 'player-1', 0, 0, false, 3);

        act(() => service.answersCallback?.({
            'player-1': { answer: 'Argentina', answeredAt: Date.now(), isCorrect: false },
            'player-2': { answer: 'Brasil', answeredAt: Date.now(), isCorrect: true },
        }));
        expect(result.current.phase).toBe('round-result');
        act(() => service.roomCallback?.({
            ...territoryRoom,
            currentRound: 1,
            rounds: {
                1: {
                    question,
                    options: [question],
                    type: 'flag',
                    startedAt: Date.now(),
                },
            },
        }));
        expect(result.current.phase).toBe('playing');
        expect(result.current.myAnswer).toBeNull();
    });

    it('treats unknown online round types as incorrect answers', async () => {
        const { result } = renderHook(() => useOnlineGame());

        act(() => {
            result.current.setPlayerName('Ana');
            result.current.selectCategory('mix');
            result.current.selectMode('classic');
        });
        await act(async () => result.current.handleCreateRoom());
        act(() => service.roomCallback?.(makeRoom({
            status: 'playing',
            inputFormat: 'multiple_choice',
            rounds: {
                0: {
                    question,
                    options: [question],
                    type: 'unknown' as never,
                    startedAt: Date.now(),
                },
            },
        })));

        act(() => result.current.handleAnswer('Brasil'));

        expect(service.submitAnswer).toHaveBeenLastCalledWith('ROOM1', 0, 'player-1', 'Brasil', false);
    });

    it('restores stored identity and accepts Firebase answers before local answers', async () => {
        sessionStorage.setItem('online-player-id', 'stored-player');
        localStorage.setItem('online-player-name', 'Lia');
        const { result } = renderHook(() => useOnlineGame());

        expect(result.current.playerId).toBe('stored-player');
        expect(result.current.playerName).toBe('Lia');

        await act(async () => result.current.handleJoinRoom('room1'));
        act(() => service.roomCallback?.(makeRoom({
            status: 'playing',
            hostId: 'stored-player',
            rounds: {
                0: {
                    question,
                    options: [question],
                    type: 'flag',
                    startedAt: Date.now(),
                },
            },
        })));
        act(() => service.answersCallback?.({
            'stored-player': { answer: 'Brasil', answeredAt: Date.now(), isCorrect: true },
        }));

        expect(result.current.myAnswer?.answer).toBe('Brasil');
    });
});
