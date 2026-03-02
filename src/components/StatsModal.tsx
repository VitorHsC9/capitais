import { X } from 'lucide-react';
import type { GameState } from '../hooks/useGameStore';

interface StatsModalProps {
    onClose: () => void;
    onRestart: () => void;
    gameState: GameState;
    score: number;
    correctCount: number;
    totalQuestions: number;
    stats: {
        totalGames: number;
        totalCorrect: number;
        totalQuestions: number;
        bestStreak: number;
        totalScore: number;
    };
}

export function StatsModal({ onClose, onRestart, gameState, score, correctCount, totalQuestions, stats }: StatsModalProps) {
    const handleClose = () => {
        onClose();
        if (gameState === 'finished' || gameState === 'game_over') {
            onRestart();
        }
    };

    return (
        <div className="modal-overlay" onClick={() => gameState === 'playing' ? onClose() : null}>
            <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end mb-2">
                    <button onClick={handleClose}>
                        <X className="w-5 h-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
                    </button>
                </div>

                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-8 text-[var(--text-primary)]">Estatísticas</h2>

                    <div className="grid grid-cols-4 gap-2 mb-8">
                        {[
                            { label: 'Jogos', val: stats.totalGames },
                            { label: 'Vitórias', val: `${Math.round((stats.totalCorrect / (stats.totalQuestions || 1)) * 100) || 0}%` },
                            { label: 'Sequência', val: stats.bestStreak },
                            { label: 'Pontos', val: stats.totalScore || score },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stat.val}</div>
                                <div className="text-[9px] uppercase font-bold text-[var(--text-secondary)] mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {(gameState === 'game_over' || gameState === 'finished') && (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <div className="p-4 bg-[var(--surface-color)] rounded-xl mb-4 border-2 border-[var(--border-color)]">
                                <p className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-1">
                                    {gameState === 'finished' ? 'Parabéns!' : 'Fim de Jogo'}
                                </p>
                                <p className="text-2xl font-black text-[var(--text-primary)]">
                                    {correctCount} <span className="text-sm font-medium text-[var(--text-secondary)]">/ {totalQuestions}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => { onRestart(); onClose(); }}
                                className="w-full py-4 bg-[var(--color-correct)] text-white font-bold uppercase text-sm rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all"
                            >
                                Jogar Novamente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
