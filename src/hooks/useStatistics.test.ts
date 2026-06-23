/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useStatistics } from './useStatistics';

const initialStats = {
    totalGames: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestStreak: 0,
    totalScore: 0,
    unlockedAchievements: [],
};

describe('useStatistics', () => {
    beforeEach(() => {
        localStorage.clear();
        useStatistics.setState({
            stats: { ...initialStats },
            newAchievements: [],
        });
    });

    it('updates totals, best streak and new achievement notifications', () => {
        useStatistics.getState().updateStats({
            correctCount: 10,
            streak: 10,
            score: 1200,
        }, 12);

        const state = useStatistics.getState();

        expect(state.stats).toMatchObject({
            totalGames: 1,
            totalCorrect: 10,
            totalQuestions: 12,
            bestStreak: 10,
            totalScore: 1200,
        });
        expect(state.stats.unlockedAchievements).toEqual(['first_win', 'sharpshooter']);
        expect(state.newAchievements.map((achievement) => achievement.id)).toEqual(['first_win', 'sharpshooter']);
    });

    it('unlocks cumulative and perfect-run achievements without duplicating existing ones', () => {
        useStatistics.setState({
            stats: {
                totalGames: 4,
                totalCorrect: 90,
                totalQuestions: 90,
                bestStreak: 3,
                totalScore: 1000,
                unlockedAchievements: ['first_win'],
            },
            newAchievements: [],
        });

        useStatistics.getState().updateStats({
            correctCount: 10,
            streak: 20,
            score: 2000,
        }, 10);

        const state = useStatistics.getState();

        expect(state.stats.totalGames).toBe(5);
        expect(state.stats.totalCorrect).toBe(100);
        expect(state.stats.totalQuestions).toBe(100);
        expect(state.stats.bestStreak).toBe(20);
        expect(state.stats.unlockedAchievements).toEqual([
            'first_win',
            'sharpshooter',
            'globetrotter',
            'fire_streak',
            'perfectionist',
        ]);
        expect(state.newAchievements.map((achievement) => achievement.id)).toEqual([
            'sharpshooter',
            'globetrotter',
            'fire_streak',
            'perfectionist',
        ]);
    });

    it('keeps previous notifications when no achievement unlocks and clears them on demand', () => {
        useStatistics.setState({
            stats: {
                ...initialStats,
                unlockedAchievements: ['first_win'],
            },
            newAchievements: [{
                id: 'first_win',
                title: 'Primeiros Passos',
                description: 'Complete seu primeiro jogo.',
                icon: 'Footprints',
                condition: () => true,
            }],
        });

        useStatistics.getState().updateStats({
            correctCount: 0,
            streak: 0,
            score: 0,
        }, 1);

        expect(useStatistics.getState().newAchievements).toHaveLength(1);

        useStatistics.getState().clearNotifications();
        expect(useStatistics.getState().newAchievements).toEqual([]);
    });
});
