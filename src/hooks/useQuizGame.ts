import { useState, useCallback, useEffect } from 'react';
import { COUNTRIES_DB, CONFIG } from '../data/countries';
import type { Country, Continent } from '../data/countries';
import { useStatistics } from './useStatistics';

// --- FUNÇÃO DE NORMALIZAÇÃO ---
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export type GameMode = 'classic' | 'flags' | 'reverse' | 'suddenDeath' | 'writing';
type GameState = 'start' | 'playing' | 'finished' | 'stats' | 'game_over';

// --- FUNÇÕES AUXILIARES ---
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

// --- HOOK PRINCIPAL ---

export const useQuizGame = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  
  const [questions, setQuestions] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<Country[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<Continent>('Todos');
  
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(5);
  
  const { stats, updateStats, newAchievements, clearNotifications } = useStatistics();

  // --- AÇÕES ---

  const startQuiz = useCallback((continent: Continent) => {
    setSelectedContinent(continent);
    const pool = continent === 'Todos' 
      ? COUNTRIES_DB 
      : COUNTRIES_DB.filter(c => c.continent === continent);
    
    if (pool.length === 0) {
      alert("Erro ao carregar países.");
      return;
    }

    const shuffledQuestions = shuffleArray(pool);
    setQuestions(shuffledQuestions);
    setCurrentIndex(0);
    
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(5);
    
    clearNotifications(); 
    
    const firstRoundOptions = generateRoundOptions(shuffledQuestions[0]);
    setCurrentOptions(firstRoundOptions);

    setGameState('playing');
  }, [clearNotifications]);

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(5);
      
      const nextRoundOptions = generateRoundOptions(questions[nextIndex]);
      setCurrentOptions(nextRoundOptions);
    } else {
      setGameState('finished');
      updateStats({
        score: score,
        correctCount: correctCount,
        streak: maxStreak
      }, questions.length);
    }
  };

  const finishGameAsLoss = () => {
    setGameState('game_over');
    updateStats({
      score: score,
      correctCount: correctCount,
      streak: maxStreak
    }, correctCount + 1);
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);
    
    const currentQ = questions[currentIndex];
    const isCapitalMode = ['classic', 'suddenDeath', 'writing'].includes(gameMode);
    const correctAnswer = isCapitalMode ? currentQ.capital : currentQ.name;
    
    // CORREÇÃO AQUI: removido o "TZ" antes de normalizeText
    const isCorrect = normalizeText(answer) === normalizeText(correctAnswer);

    if (isCorrect) {
      const points = 100 + (streak * 20);
      setScore(s => s + points);
      setCorrectCount(c => c + 1);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }

    if (gameMode === 'suddenDeath') {
      setTimeout(() => {
        if (isCorrect) {
          nextQuestion();
        } else {
          finishGameAsLoss();
        }
      }, 1000);
    }
  };

  useEffect(() => {
    if (gameMode !== 'suddenDeath' || gameState !== 'playing' || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, gameMode, isAnswered]);

  useEffect(() => {
    if (timeLeft === 0 && gameMode === 'suddenDeath' && gameState === 'playing' && !isAnswered) {
      handleAnswer('TIME_UP');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameMode, gameState, isAnswered]); 

  const restart = () => {
    clearNotifications();
    setGameState('start');
  };

  const goToStats = () => {
    clearNotifications();
    setGameState('stats');
  };

  return {
    gameState,
    gameMode,
    questions,
    currentIndex,
    score,
    correctCount,
    streak,
    currentOptions,
    selectedAnswer,
    isAnswered,
    selectedContinent,
    timeLeft,
    newAchievements,
    stats,
    setGameMode,
    startQuiz,
    handleAnswer,
    nextQuestion,
    restart,
    goToStats
  };
};