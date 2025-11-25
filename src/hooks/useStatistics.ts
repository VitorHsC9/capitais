import { useState, useEffect } from 'react';
import { ACHIEVEMENTS_DB } from '../data/achievements';
import type { GameStats, Achievement, GameSession } from '../data/achievements';

const INITIAL_STATS: GameStats = {
  totalGames: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  bestStreak: 0,
  totalScore: 0,
  unlockedAchievements: [],
};

export const useStatistics = () => {
  const [stats, setStats] = useState<GameStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz-stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    }
    return INITIAL_STATS;
  });

  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    localStorage.setItem('quiz-stats', JSON.stringify(stats));
  }, [stats]);

  const updateStats = (session: GameSession, totalQuestionsInGame: number) => {
    setStats(prev => {
      const newStats = { ...prev };
      
      // Atualiza contadores
      newStats.totalGames += 1;
      newStats.totalCorrect += session.correctCount;
      newStats.totalQuestions += totalQuestionsInGame;
      newStats.totalScore += session.score;
      
      if (session.streak > newStats.bestStreak) {
        newStats.bestStreak = session.streak;
      }

      // Verifica conquistas
      const unlockedNow: Achievement[] = [];
      
      ACHIEVEMENTS_DB.forEach(achievement => {
        if (!newStats.unlockedAchievements.includes(achievement.id)) {
          // Passa stats e session para a verificação
          if (achievement.condition(newStats, session)) {
            newStats.unlockedAchievements.push(achievement.id);
            unlockedNow.push(achievement);
          }
        }
      });

      if (unlockedNow.length > 0) {
        setNewAchievements(unlockedNow);
      }

      return newStats;
    });
  };

  const clearNotifications = () => setNewAchievements([]);

  return { stats, updateStats, newAchievements, clearNotifications };
};