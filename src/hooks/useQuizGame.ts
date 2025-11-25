import { useState, useCallback } from 'react';
// Separação de Imports de Tipos e Valores para evitar erros do Vite
import { COUNTRIES_DB, CONFIG } from '../data/countries';
import type { Country, Continent } from '../data/countries';

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

// Função auxiliar extraída para fora do componente/Hook
// Gera as opções de resposta baseadas na pergunta correta
const generateRoundOptions = (correct: Country): Country[] => {
  const needed = CONFIG.OPTIONS_COUNT - 1;

  // 1. Tentar arranjar distratores do mesmo continente
  const sameContinentPool = COUNTRIES_DB.filter(c => c.continent === correct.continent && c.name !== correct.name);
  let distractors = getRandomItems(sameContinentPool, needed);

  // 2. Se não houver suficientes, preencher com outros
  if (distractors.length < needed) {
    const remainingNeeded = needed - distractors.length;
    const otherPool = COUNTRIES_DB.filter(c => c.continent !== correct.continent);
    const extraDistractors = getRandomItems(otherPool, remainingNeeded);
    distractors = [...distractors, ...extraDistractors];
  }

  return shuffleArray([...distractors, correct]);
};

export const useQuizGame = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [questions, setQuestions] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [currentOptions, setCurrentOptions] = useState<Country[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<Continent>('Todos');

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
    setIsAnswered(false);
    setSelectedAnswer(null);
    
    // CORREÇÃO: Gerar as opções imediatamente aqui, em vez de usar useEffect
    const firstRoundOptions = generateRoundOptions(shuffledQuestions[0]);
    setCurrentOptions(firstRoundOptions);

    setGameState('playing');
  }, []);

  const handleAnswer = (capital: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(capital);
    if (capital === questions[currentIndex].capital) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setIsAnswered(false);
      setSelectedAnswer(null);
      
      // CORREÇÃO: Gerar as opções para a próxima pergunta aqui
      const nextRoundOptions = generateRoundOptions(questions[nextIndex]);
      setCurrentOptions(nextRoundOptions);
    } else {
      setGameState('finished');
    }
  };

  return {
    gameState,
    questions,
    currentIndex,
    score,
    currentOptions,
    selectedAnswer,
    isAnswered,
    selectedContinent,
    startQuiz,
    handleAnswer,
    nextQuestion,
    restart: () => setGameState('start')
  };
};