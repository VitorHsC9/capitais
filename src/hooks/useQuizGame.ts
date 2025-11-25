import { useState, useCallback } from 'react';
import { COUNTRIES_DB, CONFIG } from '../data/countries';
import type { Country, Continent } from '../data/countries';
import { useStatistics } from './useStatistics';

// --- FUNÇÕES AUXILIARES (Fora do Hook) ---

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

// --- HOOK PRINCIPAL ---

export const useQuizGame = () => {
  // Estado do jogo agora inclui 'stats' para a tela de estatísticas
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished' | 'stats'>('start');
  
  const [questions, setQuestions] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Estados de Pontuação
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  // Estados da Rodada Atual
  const [currentOptions, setCurrentOptions] = useState<Country[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<Continent>('Todos');

  // Integração com Estatísticas Globais
  const { stats, updateStats, newAchievements, clearNotifications } = useStatistics();

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
    
    // Resetar estados da sessão
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    
    // IMPORTANTE: Limpa notificações antigas ao iniciar novo jogo
    clearNotifications(); 
    
    // Gerar primeira rodada
    const firstRoundOptions = generateRoundOptions(shuffledQuestions[0]);
    setCurrentOptions(firstRoundOptions);

    setGameState('playing');
  }, [clearNotifications]);

  const handleAnswer = (capital: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(capital);
    
    const isCorrect = capital === questions[currentIndex].capital;

    if (isCorrect) {
      // Pontuação: Base 100 + Bônus de Sequência
      const points = 100 + (streak * 20);
      setScore(s => s + points);
      setCorrectCount(c => c + 1);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
    } else {
      setStreak(0); // Zera a sequência se errar
    }
  };

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setIsAnswered(false);
      setSelectedAnswer(null);
      
      const nextRoundOptions = generateRoundOptions(questions[nextIndex]);
      setCurrentOptions(nextRoundOptions);
    } else {
      setGameState('finished');
      
      // Salva estatísticas globais ao fim do jogo
      updateStats({
        score: score,
        correctCount: correctCount,
        streak: maxStreak
      }, questions.length);
    }
  };

  // Funções de Navegação
  const restart = () => {
    clearNotifications(); // Limpa notificações ao voltar para o início
    setGameState('start');
  };

  const goToStats = () => {
    clearNotifications(); // Limpa notificações ao ir para estatísticas
    setGameState('stats');
  };

  return {
    gameState,
    questions,
    currentIndex,
    score,
    correctCount,
    streak,
    currentOptions,
    selectedAnswer,
    isAnswered,
    selectedContinent,
    newAchievements,
    stats,      // Dados globais para a tela de estatísticas
    startQuiz,
    handleAnswer,
    nextQuestion,
    restart,
    goToStats   // Função para navegar para a tela de estatísticas
  };
};