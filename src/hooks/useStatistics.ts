import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

interface StatisticsStore {
  stats: GameStats;
  newAchievements: Achievement[];
  updateStats: (session: GameSession, totalQuestionsInGame: number) => void;
  clearNotifications: () => void;
}

export const useStatistics = create<StatisticsStore>()(
  persist(
    (set) => ({
      stats: INITIAL_STATS,
      newAchievements: [],

      updateStats: (session, totalQuestionsInGame) => {
        set((state) => {
          const newStats = { ...state.stats };

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
              if (achievement.condition(newStats, session)) {
                newStats.unlockedAchievements.push(achievement.id);
                unlockedNow.push(achievement);
              }
            }
          });

          return {
            stats: newStats,
            newAchievements: unlockedNow.length > 0 ? unlockedNow : state.newAchievements
          };
        });
      },

      clearNotifications: () => set({ newAchievements: [] }),
    }),
    {
      name: 'quiz-stats', // match the old localstorage key to migrate user data seamlessly
      partialize: (state) => ({ stats: state.stats }), // only persist the stats, not the active notifications
    }
  )
);