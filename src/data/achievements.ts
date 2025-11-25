export interface GameStats {
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  bestStreak: number;
  totalScore: number;
  unlockedAchievements: string[];
}

export interface GameSession {
  correctCount: number;
  streak: number;
  score: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: GameStats, session?: GameSession) => boolean;
}

export const ACHIEVEMENTS_DB: Achievement[] = [
  {
    id: 'first_win',
    title: 'Primeiros Passos',
    description: 'Complete seu primeiro jogo.',
    icon: 'Footprints',
    condition: (stats) => stats.totalGames >= 1,
  },
  {
    id: 'sharpshooter',
    title: 'Na Mosca',
    description: 'Acerte 10 capitais em sequência.',
    icon: 'Target',
    condition: (_, session) => (session?.streak ?? 0) >= 10,
  },
  {
    id: 'globetrotter',
    title: 'Viajante',
    description: 'Acumule 100 respostas corretas no total.',
    icon: 'Globe',
    condition: (stats) => stats.totalCorrect >= 100,
  },
  {
    id: 'fire_streak',
    title: 'Em Chamas',
    description: 'Atingiu uma sequência de 20 acertos!',
    icon: 'Flame',
    condition: (_, session) => (session?.streak ?? 0) >= 20,
  }
];