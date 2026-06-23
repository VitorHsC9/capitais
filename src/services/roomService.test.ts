import { beforeEach, describe, expect, it, vi } from 'vitest';

const databaseState = new Map<string, unknown>();
const listeners: Array<{ path: string; callback: (snapshot: Snapshot) => void }> = [];

type Snapshot = {
    exists: () => boolean;
    val: () => unknown;
};

const makeSnapshot = (value: unknown): Snapshot => ({
    exists: () => value !== undefined,
    val: () => value,
});

const pathRef = (path: string) => ({ path });

vi.mock('./firebase', () => ({
    db: {},
}));

vi.mock('firebase/database', () => ({
    ref: (_db: unknown, path: string) => pathRef(path),
    set: vi.fn(async (refValue: { path: string }, value: unknown) => {
        databaseState.set(refValue.path, value);
    }),
    get: vi.fn(async (refValue: { path: string }) => makeSnapshot(databaseState.get(refValue.path))),
    update: vi.fn(async (refValue: { path: string }, value: Record<string, unknown>) => {
        const current = databaseState.get(refValue.path);
        databaseState.set(refValue.path, { ...(current as object ?? {}), ...value });
    }),
    remove: vi.fn(async (refValue: { path: string }) => {
        databaseState.delete(refValue.path);
    }),
    onValue: vi.fn((refValue: { path: string }, callback: (snapshot: Snapshot) => void) => {
        listeners.push({ path: refValue.path, callback });
        callback(makeSnapshot(databaseState.get(refValue.path)));
        return vi.fn();
    }),
    onDisconnect: vi.fn(() => ({ set: vi.fn() })),
}));

vi.mock('../utils/random', () => ({
    randomInt: () => 0,
    randomString: (length: number, alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789') => alphabet[0].repeat(length),
}));

vi.mock('../utils/array', () => ({
    shuffleArray: <T,>(items: readonly T[]) => [...items],
    getRandomItems: <T,>(items: readonly T[], count: number) => items.slice(0, count),
}));

describe('roomService', () => {
    beforeEach(() => {
        databaseState.clear();
        listeners.length = 0;
        vi.setSystemTime(new Date('2026-06-23T10:00:00.000Z'));
    });

    it('generates room codes and player ids', async () => {
        const service = await import('./roomService');

        expect(service.generateRoomCode()).toBe('AAAAAA');
        expect(service.generatePlayerId()).toBe('aaaaaaaaaa');
    });

    it('creates and joins rooms', async () => {
        const service = await import('./roomService');

        const roomCode = await service.createRoom('Host', 'capitals', 'classic', 'multiple_choice', 'host-1');
        expect(roomCode).toBe('AAAAAA');
        expect(databaseState.get('rooms/AAAAAA')).toMatchObject({
            status: 'waiting',
            category: 'capitals',
            mode: 'classic',
            inputFormat: 'multiple_choice',
            hostId: 'host-1',
            totalRounds: 10,
        });

        databaseState.set('rooms/ROOM1', { status: 'waiting', players: { host: {} } });
        await expect(service.joinRoom('ROOM1', 'Guest', 'guest-1')).resolves.toEqual({ success: true });
        expect(databaseState.get('rooms/ROOM1/players/guest-1')).toMatchObject({
            name: 'Guest',
            score: 0,
            lives: 3,
            isConnected: true,
        });
    });

    it('rejects invalid joins', async () => {
        const service = await import('./roomService');

        await expect(service.joinRoom('MISSING', 'Guest', 'guest')).resolves.toEqual({
            success: false,
            error: 'Sala não encontrada',
        });

        databaseState.set('rooms/PLAYING', { status: 'playing' });
        await expect(service.joinRoom('PLAYING', 'Guest', 'guest')).resolves.toEqual({
            success: false,
            error: 'A partida já começou',
        });

        databaseState.set('rooms/FULL', { status: 'waiting', players: { one: {}, two: {} } });
        await expect(service.joinRoom('FULL', 'Guest', 'guest')).resolves.toEqual({
            success: false,
            error: 'Sala cheia',
        });
    });

    it('updates readiness, starts games, answers, scores, and finish state', async () => {
        const service = await import('./roomService');
        databaseState.set('rooms/ROOM', { status: 'waiting', category: 'mix', mode: 'speed', inputFormat: 'typing' });

        await service.setPlayerReady('ROOM', 'p1', true);
        expect(databaseState.get('rooms/ROOM/players/p1')).toMatchObject({ isReady: true });

        await service.startGame('ROOM');
        expect(databaseState.get('rooms/ROOM')).toMatchObject({
            status: 'playing',
            currentRound: 0,
        });

        await service.submitAnswer('ROOM', 0, 'p1', 'Brasilia', true);
        expect(databaseState.get('rooms/ROOM/answers/0/p1')).toMatchObject({
            answer: 'Brasilia',
            isCorrect: true,
        });

        await service.updatePlayerScore('ROOM', 'p1', 200, 2, true, 3);
        expect(databaseState.get('rooms/ROOM/players/p1')).toMatchObject({
            score: 200,
            streak: 2,
            isAlive: true,
            lives: 3,
        });

        await service.finishGame('ROOM');
        expect(databaseState.get('rooms/ROOM')).toMatchObject({ status: 'finished' });
    });

    it('advances rounds and stops on end conditions', async () => {
        const service = await import('./roomService');

        databaseState.set('rooms/ROOM', {
            category: 'capitals',
            mode: 'classic',
            inputFormat: 'multiple_choice',
            currentRound: 0,
            totalRounds: 2,
        });
        await expect(service.advanceRound('ROOM')).resolves.toBe(true);
        expect(databaseState.get('rooms/ROOM')).toMatchObject({ currentRound: 1 });
        await expect(service.advanceRound('ROOM')).resolves.toBe(false);
        expect(databaseState.get('rooms/ROOM')).toMatchObject({ status: 'finished' });

        databaseState.set('rooms/SURVIVAL', {
            category: 'flags',
            mode: 'survival',
            inputFormat: 'multiple_choice',
            currentRound: 0,
            totalRounds: 50,
            players: { a: { isAlive: true }, b: { isAlive: false } },
        });
        await expect(service.advanceRound('SURVIVAL')).resolves.toBe(false);

        databaseState.set('rooms/INFINITE', {
            category: 'territories',
            mode: 'infinite',
            inputFormat: 'multiple_choice',
            currentRound: 0,
            totalRounds: 999,
            players: { a: { lives: 0 }, b: { lives: 3 } },
        });
        await expect(service.advanceRound('INFINITE')).resolves.toBe(false);
    });

    it('requests rematches, leaves rooms, and emits listener snapshots', async () => {
        const service = await import('./roomService');
        databaseState.set('rooms/ROOM', {
            status: 'finished',
            currentRound: 4,
            players: {
                p1: { score: 10, streak: 1, isReady: true, isAlive: true, lives: 2 },
            },
        });
        databaseState.set('rooms/ROOM/rounds', { 0: {} });
        databaseState.set('rooms/ROOM/answers', { 0: {} });

        await expect(service.requestRematch('ROOM')).resolves.toBe('ROOM');
        expect(databaseState.get('rooms/ROOM')).toMatchObject({
            status: 'waiting',
            currentRound: 0,
            'players/p1/score': 0,
            'players/p1/isReady': false,
        });
        expect(databaseState.has('rooms/ROOM/rounds')).toBe(false);
        expect(databaseState.has('rooms/ROOM/answers')).toBe(false);

        const roomCallback = vi.fn();
        service.listenToRoom('ROOM', roomCallback);
        expect(roomCallback).toHaveBeenCalledWith(expect.objectContaining({ status: 'waiting' }));

        databaseState.set('rooms/ROOM/answers/1', { p1: { answer: 'x' } });
        const answersCallback = vi.fn();
        service.listenToAnswers('ROOM', 1, answersCallback);
        expect(answersCallback).toHaveBeenCalledWith({ p1: { answer: 'x' } });

        databaseState.set('rooms/ROOM/players', {});
        await service.leaveRoom('ROOM', 'p1');
        expect(databaseState.has('rooms/ROOM/players/p1')).toBe(false);
        expect(databaseState.has('rooms/ROOM')).toBe(false);
    });
});
