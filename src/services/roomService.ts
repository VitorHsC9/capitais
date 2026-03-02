import { db } from './firebase';
import {
    ref,
    set,
    get,
    update,
    remove,
    onValue,
    onDisconnect,
    type Unsubscribe,
} from 'firebase/database';
import { COUNTRIES_DB, CONFIG } from '../data/countries';
import type { Country } from '../data/countries';
import { shuffleArray, getRandomItems } from '../utils/array';

// ─── Types ───────────────────────────────────────────────────────

// Level 1: What you play (question type)
export type OnlineCategory = 'capitals' | 'flags' | 'territories' | 'mix';

// Level 2: How you play (win condition)
export type OnlineGameMode = 'classic' | 'speed' | 'survival' | 'infinite';

// Level 3: How you answer
export type InputFormat = 'multiple_choice' | 'typing';

export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type RoundType = 'capital' | 'flag' | 'reverse' | 'territory';

export interface OnlinePlayer {
    name: string;
    score: number;
    streak: number;
    lives: number; // Used for infinite mode (3 lives)
    isReady: boolean;
    isAlive: boolean;
    isConnected: boolean;
}

export type RoundQuestion = Country;

export interface RoundData {
    question: RoundQuestion;
    options: RoundQuestion[]; // Only used for multiple_choice
    type: RoundType;
    startedAt: number;
}

export interface PlayerAnswer {
    answer: string;
    answeredAt: number;
    isCorrect: boolean;
}

export interface RoomData {
    status: RoomStatus;
    category: OnlineCategory;
    mode: OnlineGameMode;
    inputFormat: InputFormat;
    hostId: string;
    createdAt: number;
    currentRound: number;
    totalRounds: number;
    players?: Record<string, OnlinePlayer>;
    rounds?: Record<string, RoundData>;
    answers?: Record<string, Record<string, PlayerAnswer>>;
}

// ─── Config ──────────────────────────────────────────────────────
const MODE_ROUNDS: Record<OnlineGameMode, number> = {
    classic: 10,
    speed: 10,
    survival: 50,
    infinite: 999, // effectively unlimited, game ends on 3 wrong
};

// Map categories to round types
function getCategoryRoundTypes(category: OnlineCategory): RoundType[] {
    switch (category) {
        case 'capitals': return ['capital', 'reverse'];
        case 'flags': return ['flag'];
        case 'territories': return ['territory'];
        case 'mix': return ['capital', 'flag', 'reverse', 'territory'];
    }
}

function generateRoundQuestion(category: OnlineCategory, roundIndex: number, inputFormat: InputFormat): RoundData {
    const correctCountry = COUNTRIES_DB[Math.floor(Math.random() * COUNTRIES_DB.length)];

    // Pick round type based on category
    const availableTypes = getCategoryRoundTypes(category);
    const type = availableTypes[roundIndex % availableTypes.length];

    // Generate options (4 distractors + 1 correct) — only needed for multiple_choice
    let options: RoundQuestion[] = [];

    if (inputFormat === 'multiple_choice') {
        const sameContinentPool = COUNTRIES_DB.filter(
            (c) => c.continent === correctCountry.continent && c.name !== correctCountry.name
        );
        let distractors = getRandomItems(sameContinentPool, CONFIG.OPTIONS_COUNT - 1);

        if (distractors.length < CONFIG.OPTIONS_COUNT - 1) {
            const remainingNeeded = CONFIG.OPTIONS_COUNT - 1 - distractors.length;
            const otherPool = COUNTRIES_DB.filter((c) => c.continent !== correctCountry.continent);
            const extraDistractors = getRandomItems(otherPool, remainingNeeded);
            distractors = [...distractors, ...extraDistractors];
        }

        const toQuestion = (c: Country): RoundQuestion => ({
            name: c.name,
            capital: c.capital,
            code: c.code,
            continent: c.continent,
        });

        options = shuffleArray([...distractors.map(toQuestion), toQuestion(correctCountry)]);
    }

    const toQuestion = (c: Country): RoundQuestion => ({
        name: c.name,
        capital: c.capital,
        code: c.code,
        continent: c.continent,
    });

    return {
        question: toQuestion(correctCountry),
        options,
        type,
        startedAt: Date.now(),
    };
}

export function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export function generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 12);
}

// ─── Room Operations ─────────────────────────────────────────────
export async function createRoom(
    hostName: string,
    category: OnlineCategory,
    mode: OnlineGameMode,
    inputFormat: InputFormat,
    hostId: string
): Promise<string> {
    let roomCode = generateRoomCode();
    let existingRoom = await get(ref(db, `rooms/${roomCode}`));

    let attempts = 0;
    while (existingRoom.exists() && attempts < 10) {
        roomCode = generateRoomCode();
        existingRoom = await get(ref(db, `rooms/${roomCode}`));
        attempts++;
    }

    const totalRounds = MODE_ROUNDS[mode];

    const roomData: RoomData = {
        status: 'waiting',
        category,
        mode,
        inputFormat,
        hostId,
        createdAt: Date.now(),
        currentRound: 0,
        totalRounds,
    };

    await set(ref(db, `rooms/${roomCode}`), roomData);

    await set(ref(db, `rooms/${roomCode}/players/${hostId}`), {
        name: hostName,
        score: 0,
        streak: 0,
        lives: 3,
        isReady: false,
        isAlive: true,
        isConnected: true,
    } satisfies OnlinePlayer);

    const playerConnRef = ref(db, `rooms/${roomCode}/players/${hostId}/isConnected`);
    onDisconnect(playerConnRef).set(false);

    return roomCode;
}

export async function joinRoom(
    roomCode: string,
    playerName: string,
    playerId: string
): Promise<{ success: boolean; error?: string }> {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
        return { success: false, error: 'Sala não encontrada' };
    }

    const roomData = snapshot.val() as RoomData;

    if (roomData.status !== 'waiting') {
        return { success: false, error: 'A partida já começou' };
    }

    const players = roomData.players || {};
    const playerCount = Object.keys(players).length;

    if (playerCount >= 2) {
        return { success: false, error: 'Sala cheia' };
    }

    await set(ref(db, `rooms/${roomCode}/players/${playerId}`), {
        name: playerName,
        score: 0,
        streak: 0,
        lives: 3,
        isReady: false,
        isAlive: true,
        isConnected: true,
    } satisfies OnlinePlayer);

    const playerConnRef = ref(db, `rooms/${roomCode}/players/${playerId}/isConnected`);
    onDisconnect(playerConnRef).set(false);

    return { success: true };
}

export async function setPlayerReady(
    roomCode: string,
    playerId: string,
    ready: boolean
): Promise<void> {
    await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
        isReady: ready,
    });
}

export async function startGame(roomCode: string): Promise<void> {
    const roomSnapshot = await get(ref(db, `rooms/${roomCode}`));
    const roomData = roomSnapshot.val() as RoomData;

    const firstRound = generateRoundQuestion(roomData.category, 0, roomData.inputFormat);

    await update(ref(db, `rooms/${roomCode}`), {
        status: 'playing',
        currentRound: 0,
        [`rounds/0`]: firstRound,
    });
}

export async function submitAnswer(
    roomCode: string,
    round: number,
    playerId: string,
    answer: string,
    isCorrect: boolean
): Promise<void> {
    const answerData: PlayerAnswer = {
        answer,
        answeredAt: Date.now(),
        isCorrect,
    };

    await set(ref(db, `rooms/${roomCode}/answers/${round}/${playerId}`), answerData);
}

export async function updatePlayerScore(
    roomCode: string,
    playerId: string,
    score: number,
    streak: number,
    isAlive: boolean,
    lives: number
): Promise<void> {
    await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
        score,
        streak,
        isAlive,
        lives,
    });
}

export async function advanceRound(roomCode: string): Promise<boolean> {
    const roomSnapshot = await get(ref(db, `rooms/${roomCode}`));
    const roomData = roomSnapshot.val() as RoomData;

    const nextRound = roomData.currentRound + 1;

    // Check if max rounds reached (classic/speed)
    if (nextRound >= roomData.totalRounds) {
        await update(ref(db, `rooms/${roomCode}`), { status: 'finished' });
        return false;
    }

    // Survival mode: if only one player alive, game ends
    if (roomData.mode === 'survival' && roomData.players) {
        const alivePlayers = Object.values(roomData.players).filter((p) => p.isAlive);
        if (alivePlayers.length <= 1) {
            await update(ref(db, `rooms/${roomCode}`), { status: 'finished' });
            return false;
        }
    }

    // Infinite mode: if any player has 0 lives, game ends
    if (roomData.mode === 'infinite' && roomData.players) {
        const deadPlayers = Object.values(roomData.players).filter((p) => p.lives <= 0);
        if (deadPlayers.length > 0) {
            await update(ref(db, `rooms/${roomCode}`), { status: 'finished' });
            return false;
        }
    }

    // Generate next round
    const nextRoundData = generateRoundQuestion(roomData.category, nextRound, roomData.inputFormat);

    await update(ref(db, `rooms/${roomCode}`), {
        currentRound: nextRound,
        [`rounds/${nextRound}`]: nextRoundData,
    });

    return true;
}

export async function finishGame(roomCode: string): Promise<void> {
    await update(ref(db, `rooms/${roomCode}`), { status: 'finished' });
}

export async function requestRematch(roomCode: string): Promise<string> {
    const roomSnapshot = await get(ref(db, `rooms/${roomCode}`));
    const roomData = roomSnapshot.val() as RoomData;

    const playerUpdates: Record<string, unknown> = {};
    if (roomData.players) {
        for (const pid of Object.keys(roomData.players)) {
            playerUpdates[`players/${pid}/score`] = 0;
            playerUpdates[`players/${pid}/streak`] = 0;
            playerUpdates[`players/${pid}/isReady`] = false;
            playerUpdates[`players/${pid}/isAlive`] = true;
            playerUpdates[`players/${pid}/lives`] = 3;
        }
    }

    await update(ref(db, `rooms/${roomCode}`), {
        status: 'waiting',
        currentRound: 0,
        ...playerUpdates,
    });

    await remove(ref(db, `rooms/${roomCode}/rounds`));
    await remove(ref(db, `rooms/${roomCode}/answers`));

    return roomCode;
}

export async function leaveRoom(roomCode: string, playerId: string): Promise<void> {
    await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));

    const playersSnapshot = await get(ref(db, `rooms/${roomCode}/players`));
    if (!playersSnapshot.exists() || Object.keys(playersSnapshot.val()).length === 0) {
        await remove(ref(db, `rooms/${roomCode}`));
    }
}

// ─── Listeners ───────────────────────────────────────────────────
export function listenToRoom(
    roomCode: string,
    callback: (data: RoomData | null) => void
): Unsubscribe {
    const roomRef = ref(db, `rooms/${roomCode}`);
    return onValue(roomRef, (snapshot) => {
        callback(snapshot.exists() ? (snapshot.val() as RoomData) : null);
    });
}

export function listenToAnswers(
    roomCode: string,
    round: number,
    callback: (answers: Record<string, PlayerAnswer> | null) => void
): Unsubscribe {
    const answersRef = ref(db, `rooms/${roomCode}/answers/${round}`);
    return onValue(answersRef, (snapshot) => {
        callback(snapshot.exists() ? (snapshot.val() as Record<string, PlayerAnswer>) : null);
    });
}
