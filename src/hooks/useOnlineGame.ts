import { useState, useEffect, useCallback, useRef } from 'react';
import {
    createRoom,
    joinRoom,
    setPlayerReady,
    startGame,
    submitAnswer,
    updatePlayerScore,
    advanceRound,
    finishGame,
    requestRematch,
    leaveRoom,
    listenToRoom,
    listenToAnswers,
    generatePlayerId,
    type OnlineCategory,
    type OnlineGameMode,
    type InputFormat,
    type RoomData,
    type PlayerAnswer,
    type RoundData,
} from '../services/roomService';
import { checkCountryCapital, checkCountryName } from '../utils/validation';

export type OnlinePhase = 'menu' | 'category-select' | 'mode-select' | 'waiting' | 'playing' | 'round-result' | 'results';

interface UseOnlineGameReturn {
    // State
    phase: OnlinePhase;
    roomCode: string | null;
    playerId: string;
    playerName: string;
    roomData: RoomData | null;
    currentRound: RoundData | null;
    myAnswer: PlayerAnswer | null;
    opponentAnswer: PlayerAnswer | null;
    opponentId: string | null;
    opponentName: string;
    roundAnswers: Record<string, PlayerAnswer> | null;
    timeLeft: number;
    error: string | null;
    isHost: boolean;
    isLoading: boolean;
    selectedCategory: OnlineCategory | null;
    selectedMode: OnlineGameMode | null;
    selectedInputFormat: InputFormat;

    // Actions
    setPlayerName: (name: string) => void;
    selectCategory: (cat: OnlineCategory) => void;
    selectMode: (mode: OnlineGameMode) => void;
    setSelectedInputFormat: (format: InputFormat) => void;
    handleCreateRoom: () => Promise<void>;
    handleJoinRoom: (code: string) => Promise<void>;
    handleReady: () => Promise<void>;
    handleStartGame: () => Promise<void>;
    handleAnswer: (answer: string) => void;
    handleRematch: () => Promise<void>;
    handleLeave: () => Promise<void>;
    goToCategorySelect: () => void;
    goBackToMenu: () => void;
    clearError: () => void;
}

export function useOnlineGame(): UseOnlineGameReturn {
    // Identity
    const [playerId] = useState(() => {
        const stored = sessionStorage.getItem('online-player-id');
        if (stored) return stored;
        const id = generatePlayerId();
        sessionStorage.setItem('online-player-id', id);
        return id;
    });
    const [playerName, setPlayerName] = useState(() => {
        return localStorage.getItem('online-player-name') || '';
    });

    // Selection state
    const [selectedCategory, setSelectedCategory] = useState<OnlineCategory | null>(null);
    const [selectedMode, setSelectedMode] = useState<OnlineGameMode | null>(null);
    const [selectedInputFormat, setSelectedInputFormat] = useState<InputFormat>('multiple_choice');

    // Room state
    const [phase, setPhase] = useState<OnlinePhase>('menu');
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Round state
    const [myAnswer, setMyAnswer] = useState<PlayerAnswer | null>(null);
    const [opponentAnswer, setOpponentAnswer] = useState<PlayerAnswer | null>(null);
    const [timeLeft, setTimeLeft] = useState(10);
    const [roundAnswers, setRoundAnswers] = useState<Record<string, PlayerAnswer> | null>(null);

    // Refs for cleanup and avoiding stale closures
    const roomUnsubRef = useRef<(() => void) | null>(null);
    const answersUnsubRef = useRef<(() => void) | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const roundAdvancingRef = useRef(false);
    const currentRoundRef = useRef<RoundData | null>(null);
    const roomDataRef = useRef<RoomData | null>(null);

    // Derived state
    const isHost = roomData?.hostId === playerId;
    const opponentId = roomData?.players
        ? Object.keys(roomData.players).find((id) => id !== playerId) || null
        : null;
    const opponentName = opponentId && roomData?.players?.[opponentId]
        ? roomData.players[opponentId].name
        : '';
    const currentRound = roomData?.rounds?.[roomData.currentRound] || null;

    // Additional refs (declared after derived state to use initial values)
    const phaseRef = useRef<OnlinePhase>(phase);
    const myAnswerRef = useRef<PlayerAnswer | null>(myAnswer);
    const isHostRef = useRef(isHost);
    const roomCodeRef = useRef<string | null>(roomCode);
    const handleAnswerRef = useRef<(answer: string) => void>(() => { });

    // Keep refs up to date
    useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
    useEffect(() => { roomDataRef.current = roomData; }, [roomData]);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { myAnswerRef.current = myAnswer; }, [myAnswer]);
    useEffect(() => { isHostRef.current = isHost; }, [isHost]);
    useEffect(() => { roomCodeRef.current = roomCode; }, [roomCode]);

    // Save player name
    useEffect(() => {
        if (playerName) {
            localStorage.setItem('online-player-name', playerName);
        }
    }, [playerName]);

    // ─── Room listener ──────────────────────────────────────────────
    // Uses phaseRef to read current phase without re-subscribing to Firebase
    useEffect(() => {
        if (!roomCode) return;

        roomUnsubRef.current = listenToRoom(roomCode, (data) => {
            if (!data) {
                setError('Sala foi encerrada');
                setPhase('menu');
                setRoomCode(null);
                return;
            }
            setRoomData(data);

            const currentPhase = phaseRef.current;
            if (data.status === 'playing' && currentPhase === 'waiting') {
                setPhase('playing');
                setMyAnswer(null);
                setOpponentAnswer(null);
                setTimeLeft(data.mode === 'speed' ? 5 : 10);
            }

            if (data.status === 'finished' && currentPhase !== 'results' && currentPhase !== 'menu') {
                setPhase('results');
            }

            if (data.status === 'waiting' && currentPhase === 'results') {
                setPhase('waiting');
            }
        });

        return () => {
            if (roomUnsubRef.current) {
                roomUnsubRef.current();
                roomUnsubRef.current = null;
            }
        };
    }, [roomCode]);

    // ─── Answer listener ────────────────────────────────────────────
    useEffect(() => {
        if (!roomCode || !roomData || roomData.status !== 'playing') return;

        if (answersUnsubRef.current) {
            answersUnsubRef.current();
        }

        answersUnsubRef.current = listenToAnswers(roomCode, roomData.currentRound, (answers) => {
            setRoundAnswers(answers);

            if (answers) {
                setMyAnswer((prev) => {
                    if (prev) return prev;
                    return answers[playerId] || null;
                });
                if (opponentId && answers[opponentId]) {
                    setOpponentAnswer(answers[opponentId]);
                }
            }
        });

        return () => {
            if (answersUnsubRef.current) {
                answersUnsubRef.current();
                answersUnsubRef.current = null;
            }
        };
    }, [roomCode, roomData?.currentRound, roomData?.status, playerId, opponentId]);

    // ─── Timer ──────────────────────────────────────────────────────
    // Only resets when phase or round changes. roomData/currentRound are
    // intentionally read from refs to avoid restarting the interval on
    // every roomData update (which happens frequently via Firebase).
    useEffect(() => {
        const rd = roomDataRef.current;
        const cr = currentRoundRef.current;
        if (phase !== 'playing' || !rd || !cr) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        setTimeLeft(rd.mode === 'speed' ? 5 : 10);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase, roomData?.currentRound]);

    // ─── Auto-submit on timeout (speed mode) ────────────────────────
    // Uses refs to avoid re-running on every state change; only timeLeft triggers this.
    useEffect(() => {
        if (timeLeft === 0 && phaseRef.current === 'playing' && !myAnswerRef.current && roomDataRef.current?.mode === 'speed') {
            handleAnswerRef.current('TIME_UP');
        }
    }, [timeLeft]);

    // ─── Both answered → show result → advance ────────────────────
    useEffect(() => {
        const rd = roomDataRef.current;
        const code = roomCodeRef.current;
        if (!code || !rd || phase !== 'playing') return;

        const players = rd.players ? Object.keys(rd.players) : [];
        const alivePlayers = rd.players
            ? Object.entries(rd.players).filter(([_, p]) => p.isAlive).map(([id]) => id)
            : [];

        const playersToCheck = rd.mode === 'survival' ? alivePlayers : players;

        if (!roundAnswers) return;
        const answeredPlayers = Object.keys(roundAnswers);
        const allAnswered = playersToCheck.every((pid) => answeredPlayers.includes(pid));

        if (allAnswered && !roundAdvancingRef.current) {
            roundAdvancingRef.current = true;

            setPhase('round-result');

            setTimeout(async () => {
                if (isHostRef.current && code) {
                    const continued = await advanceRound(code);
                    if (!continued) {
                        await finishGame(code);
                    }
                }

                setMyAnswer(null);
                setOpponentAnswer(null);
                setRoundAnswers(null);
                roundAdvancingRef.current = false;
            }, 2500);
        }
    }, [roundAnswers, roomData?.players, phase]);

    // When round changes, go back to playing
    useEffect(() => {
        if (roomDataRef.current?.status === 'playing' && phaseRef.current === 'round-result') {
            setPhase('playing');
            setMyAnswer(null);
            setOpponentAnswer(null);
        }
    }, [roomData?.currentRound]);

    // ─── Actions ────────────────────────────────────────────────────
    const goToCategorySelect = useCallback(() => {
        setPhase('category-select');
    }, []);

    const selectCategory = useCallback((cat: OnlineCategory) => {
        setSelectedCategory(cat);
        setPhase('mode-select');
    }, []);

    const selectMode = useCallback((mode: OnlineGameMode) => {
        setSelectedMode(mode);
    }, []);

    const handleCreateRoom = useCallback(async () => {
        if (!playerName.trim()) {
            setError('Digite seu nome');
            return;
        }
        if (!selectedCategory || !selectedMode) {
            setError('Selecione categoria e modo');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const code = await createRoom(
                playerName.trim(),
                selectedCategory,
                selectedMode,
                selectedInputFormat,
                playerId
            );
            setRoomCode(code);
            setPhase('waiting');
        } catch (err) {
            setError('Erro ao criar sala. Verifique sua conexão.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [playerName, selectedCategory, selectedMode, selectedInputFormat, playerId]);

    const handleJoinRoom = useCallback(async (code: string) => {
        if (!playerName.trim()) {
            setError('Digite seu nome');
            return;
        }
        if (!code.trim()) {
            setError('Digite o código da sala');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await joinRoom(code.trim().toUpperCase(), playerName.trim(), playerId);
            if (result.success) {
                setRoomCode(code.trim().toUpperCase());
                setPhase('waiting');
            } else {
                setError(result.error || 'Erro ao entrar na sala');
            }
        } catch (err) {
            setError('Erro ao entrar na sala. Verifique o código.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [playerName, playerId]);

    const handleReady = useCallback(async () => {
        if (!roomCode) return;
        const currentReady = roomData?.players?.[playerId]?.isReady || false;
        await setPlayerReady(roomCode, playerId, !currentReady);
    }, [roomCode, playerId, roomData]);

    const handleStartGame = useCallback(async () => {
        if (!roomCode || !isHost) return;
        setIsLoading(true);
        try {
            await startGame(roomCode);
        } catch (err) {
            setError('Erro ao iniciar partida');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [roomCode, isHost]);

    const handleAnswer = useCallback((answer: string) => {
        const latestRound = currentRoundRef.current;
        const latestRoomData = roomDataRef.current;

        if (!roomCode || !latestRoomData || !latestRound || myAnswer) return;

        const question = latestRound.question;
        const roundType = latestRound.type;
        const isTyping = latestRoomData.inputFormat === 'typing';

        let isCorrect = false;
        if (answer === 'TIME_UP') {
            isCorrect = false;
        } else if (roundType === 'capital') {
            // Typing mode: normalize for comparison
            isCorrect = isTyping
                ? checkCountryCapital(question, answer)
                : answer === question.capital;
        } else if (roundType === 'flag' || roundType === 'reverse' || roundType === 'territory') {
            isCorrect = isTyping
                ? checkCountryName(question, answer)
                : answer === question.name;
        }

        // Submit answer to Firebase
        submitAnswer(roomCode, latestRoomData.currentRound, playerId, answer, isCorrect);

        // Update score
        const currentPlayer = latestRoomData.players?.[playerId];
        if (currentPlayer) {
            let newScore = currentPlayer.score;
            let newStreak = currentPlayer.streak;
            let isAlive = currentPlayer.isAlive;
            let lives = currentPlayer.lives;

            if (isCorrect) {
                const speedBonus = latestRoomData.mode === 'speed' ? Math.max(0, timeLeft * 10) : 0;
                newScore += 100 + (newStreak * 20) + speedBonus;
                newStreak += 1;
            } else {
                newStreak = 0;
                if (latestRoomData.mode === 'survival') {
                    isAlive = false;
                }
                if (latestRoomData.mode === 'infinite') {
                    lives = Math.max(0, lives - 1);
                    if (lives <= 0) {
                        isAlive = false;
                    }
                }
            }

            updatePlayerScore(roomCode, playerId, newScore, newStreak, isAlive, lives);
        }

        setMyAnswer({
            answer,
            answeredAt: Date.now(),
            isCorrect,
        });
    }, [roomCode, myAnswer, playerId, timeLeft]);

    // Keep handleAnswerRef in sync
    handleAnswerRef.current = handleAnswer;

    const handleRematch = useCallback(async () => {
        if (!roomCode) return;
        setIsLoading(true);
        try {
            await requestRematch(roomCode);
            setMyAnswer(null);
            setOpponentAnswer(null);
            setRoundAnswers(null);
        } catch (err) {
            setError('Erro ao solicitar revanche');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [roomCode]);

    const handleLeave = useCallback(async () => {
        if (roomCode) {
            try {
                await leaveRoom(roomCode, playerId);
            } catch (err) {
                console.error('Error leaving room:', err);
            }
        }

        if (roomUnsubRef.current) roomUnsubRef.current();
        if (answersUnsubRef.current) answersUnsubRef.current();
        if (timerRef.current) clearInterval(timerRef.current);

        setRoomCode(null);
        setRoomData(null);
        setMyAnswer(null);
        setOpponentAnswer(null);
        setRoundAnswers(null);
        setSelectedCategory(null);
        setSelectedMode(null);
        setSelectedInputFormat('multiple_choice');
        setPhase('menu');
        setError(null);
    }, [roomCode, playerId]);

    const goBackToMenu = useCallback(() => {
        if (phase === 'mode-select') {
            setPhase('category-select');
            setSelectedMode(null);
        } else if (phase === 'category-select') {
            setPhase('menu');
            setSelectedCategory(null);
        } else {
            setPhase('menu');
        }
        setError(null);
    }, [phase]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        phase,
        roomCode,
        playerId,
        playerName,
        roomData,
        currentRound,
        myAnswer,
        opponentAnswer,
        opponentId,
        opponentName,
        roundAnswers,
        timeLeft,
        error,
        isHost,
        isLoading,
        selectedCategory,
        selectedMode,
        selectedInputFormat,
        setPlayerName,
        selectCategory,
        selectMode,
        setSelectedInputFormat,
        handleCreateRoom,
        handleJoinRoom,
        handleReady,
        handleStartGame,
        handleAnswer,
        handleRematch,
        handleLeave,
        goToCategorySelect,
        goBackToMenu,
        clearError,
    };
}
