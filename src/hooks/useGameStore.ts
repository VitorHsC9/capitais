import { create } from 'zustand';
import { COUNTRIES_DB, CONFIG } from '../data/countries';
import type { Country, Continent } from '../data/countries';

import { checkCountryName, checkCountryCapital } from '../utils/validation';

export type GameMode = 'classic' | 'flags' | 'reverse' | 'suddenDeath' | 'writing' | 'survival' | 'anagram';
export type GameState = 'start' | 'playing' | 'finished' | 'stats' | 'game_over';

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const getRandomItems = <T,>(arr: T[], count: number, excludeItem?: T): T[] => {
    const result: T[] = [];
    const takenIndices = new Set<number>();

    const excludeIndex = excludeItem ? arr.indexOf(excludeItem) : -1;
    if (excludeIndex !== -1) takenIndices.add(excludeIndex);

    while (result.length < count && takenIndices.size < arr.length) {
        const idx = Math.floor(Math.random() * arr.length);
        if (!takenIndices.has(idx)) {
            takenIndices.add(idx);
            result.push(arr[idx]);
        }
    }
    return result;
};

const generateRoundOptions = (correct: Country): Country[] => {
    const needed = CONFIG.OPTIONS_COUNT - 1;
    const sameContinentPool = COUNTRIES_DB.filter(c => c.continent === correct.continent && c.name !== correct.name);
    let distractors = getRandomItems(sameContinentPool, needed);

    if (distractors.length < needed) {
        const remainingNeeded = needed - distractors.length;
        const otherPool = COUNTRIES_DB.filter(c => c.continent !== correct.continent);
        const extraDistractors = getRandomItems(otherPool, remainingNeeded);
        distractors = [...distractors, ...extraDistractors];
    }

    return shuffleArray([...distractors, correct]);
};

interface GameStore {
    // State
    gameState: GameState;
    gameMode: GameMode;
    questions: Country[];
    currentIndex: number;
    currentOptions: Country[];
    selectedAnswer: string | null;
    isAnswered: boolean;
    selectedContinent: Continent;
    score: number;
    correctCount: number;
    streak: number;
    maxStreak: number;
    timeLeft: number;

    // Actions
    setGameMode: (mode: GameMode) => void;
    startQuiz: (continent: Continent) => void;
    handleAnswer: (answer: string) => void;
    nextQuestion: () => void;
    restart: () => void;
    goToStats: () => void;
    tickTimer: () => void; // for the useEffect interval
    finishGameAsLoss: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    gameState: 'start',
    gameMode: 'classic',
    questions: [],
    currentIndex: 0,
    currentOptions: [],
    selectedAnswer: null,
    isAnswered: false,
    selectedContinent: 'Todos',
    score: 0,
    correctCount: 0,
    streak: 0,
    maxStreak: 0,
    timeLeft: 5,

    setGameMode: (mode) => set({ gameMode: mode }),

    startQuiz: (continent) => {
        const pool = continent === 'Todos'
            ? COUNTRIES_DB
            : COUNTRIES_DB.filter(c => c.continent === continent);

        if (pool.length === 0) {
            alert("Erro ao carregar países.");
            return;
        }

        const shuffledQuestions = shuffleArray(pool);
        const firstRoundOptions = generateRoundOptions(shuffledQuestions[0]);

        set({
            selectedContinent: continent,
            questions: shuffledQuestions,
            currentIndex: 0,
            score: 0,
            correctCount: 0,
            streak: 0,
            maxStreak: 0,
            isAnswered: false,
            selectedAnswer: null,
            timeLeft: 5,
            currentOptions: firstRoundOptions,
            gameState: 'playing'
        });
    },

    nextQuestion: () => {
        const state = get();
        const nextIndex = state.currentIndex + 1;

        if (nextIndex < state.questions.length) {
            const nextRoundOptions = generateRoundOptions(state.questions[nextIndex]);
            set({
                currentIndex: nextIndex,
                isAnswered: false,
                selectedAnswer: null,
                timeLeft: 5,
                currentOptions: nextRoundOptions
            });
        } else {
            set({ gameState: 'finished' });
        }
    },

    finishGameAsLoss: () => {
        set({ gameState: 'game_over' });
    },

    handleAnswer: (answer) => {
        const state = get();
        if (state.isAnswered) return;

        const currentQ = state.questions[state.currentIndex];
        const isCapitalMode = ['classic', 'suddenDeath', 'writing', 'survival', 'anagram'].includes(state.gameMode);
        const isCorrect = isCapitalMode
            ? checkCountryCapital(currentQ, answer)
            : checkCountryName(currentQ, answer);

        let newScore = state.score;
        let newCorrectCount = state.correctCount;
        let newStreak = state.streak;
        let newMaxStreak = state.maxStreak;
        let newGameState = state.gameState;

        if (isCorrect) {
            const points = 100 + (state.streak * 20);
            newScore += points;
            newCorrectCount += 1;
            newStreak += 1;
            if (newStreak > newMaxStreak) newMaxStreak = newStreak;
        } else {
            newStreak = 0;
            if (state.gameMode === 'survival') {
                newGameState = 'game_over';
            }
        }

        set({
            isAnswered: true,
            selectedAnswer: answer,
            score: newScore,
            correctCount: newCorrectCount,
            streak: newStreak,
            maxStreak: newMaxStreak,
            gameState: newGameState
        });

        if (state.gameMode === 'suddenDeath') {
            setTimeout(() => {
                if (isCorrect) {
                    get().nextQuestion();
                } else {
                    get().finishGameAsLoss();
                }
            }, 1000);
        }
    },

    tickTimer: () => {
        set((state) => ({ timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0 }));
    },

    restart: () => {
        set({ gameState: 'start' });
    },

    goToStats: () => {
        set({ gameState: 'stats' });
    }
}));
