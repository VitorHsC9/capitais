import { RotateCcw, Home } from 'lucide-react';
import type { useOnlineGame } from '../../hooks/useOnlineGame';

interface OnlineResultsProps {
    game: ReturnType<typeof useOnlineGame>;
    onBack: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    capitals: '🏛️ Capitais',
    flags: '🏴 Bandeiras',
    territories: '🗺️ Territórios',
    mix: '🎲 Misto',
};

const MODE_LABELS: Record<string, string> = {
    classic: '⚔️ Clássico',
    speed: '⚡ Velocidade',
    survival: '💀 Sobrevivência',
    infinite: '♾️ Infinito',
};

export function OnlineResults({ game, onBack }: OnlineResultsProps) {
    const { roomData, playerId, opponentId } = game;

    if (!roomData) return null;

    const myPlayer = roomData.players?.[playerId];
    const opponent = opponentId ? roomData.players?.[opponentId] : null;
    const myScore = myPlayer?.score || 0;
    const opponentScore = opponent?.score || 0;

    const isWinner = myScore > opponentScore;
    const isDraw = myScore === opponentScore;
    const isLoser = myScore < opponentScore;

    const getResultEmoji = () => {
        if (isWinner) return '🏆';
        if (isDraw) return '🤝';
        return '😞';
    };

    const getResultText = () => {
        if (isWinner) return 'VITÓRIA!';
        if (isDraw) return 'EMPATE!';
        return 'DERROTA';
    };

    const getResultColor = () => {
        if (isWinner) return 'text-[var(--color-accent)]';
        if (isDraw) return 'text-[var(--text-secondary)]';
        return 'text-[var(--color-error)]';
    };

    return (
        <div className="flex flex-col h-full items-center justify-center gap-6 animate-in fade-in zoom-in duration-500">
            {/* Result Icon */}
            <div className="text-7xl animate-in zoom-in duration-700">{getResultEmoji()}</div>

            {/* Result Text */}
            <h1 className={`text-4xl font-black uppercase tracking-tight ${getResultColor()}`}>
                {getResultText()}
            </h1>

            {/* Game Info Badges */}
            <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold">
                    {CATEGORY_LABELS[roomData.category] || roomData.category}
                </span>
                <span className="px-2 py-1 rounded-full bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold">
                    {MODE_LABELS[roomData.mode] || roomData.mode}
                </span>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {/* My Card */}
                <div className={`p-5 rounded-2xl border-2 text-center ${isWinner
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : isDraw
                        ? 'border-[var(--border-color)] bg-[var(--surface-color)]'
                        : 'border-[var(--color-error)]/30 bg-[var(--surface-color)]'
                    }`}>
                    <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-black text-lg border-2 border-[var(--color-primary)]/30 mb-2">
                        {myPlayer?.name.charAt(0).toUpperCase() || '?'}
                    </div>
                    <p className="font-bold text-sm text-[var(--text-primary)] truncate">{myPlayer?.name}</p>
                    <p className="text-3xl font-black text-[var(--color-primary)] mt-2 tabular-nums">{myScore}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-1">pontos</p>
                </div>

                {/* Opponent Card */}
                <div className={`p-5 rounded-2xl border-2 text-center ${isLoser
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : isDraw
                        ? 'border-[var(--border-color)] bg-[var(--surface-color)]'
                        : 'border-[var(--color-error)]/30 bg-[var(--surface-color)]'
                    }`}>
                    <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] flex items-center justify-center font-black text-lg border-2 border-[var(--color-secondary)]/30 mb-2">
                        {opponent?.name.charAt(0).toUpperCase() || '?'}
                    </div>
                    <p className="font-bold text-sm text-[var(--text-primary)] truncate">{opponent?.name}</p>
                    <p className="text-3xl font-black text-[var(--color-secondary)] mt-2 tabular-nums">{opponentScore}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-1">pontos</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full max-w-sm pb-4">
                {game.isHost && (
                    <button
                        onClick={game.handleRematch}
                        disabled={game.isLoading}
                        className="flex-1 py-4 rounded-xl bg-[var(--color-primary)] text-white font-black uppercase tracking-widest shadow-[0_4px_0_var(--color-primary-dark)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        REVANCHE
                    </button>
                )}
                <button
                    onClick={() => { game.handleLeave(); onBack(); }}
                    className={`${game.isHost ? '' : 'flex-1'} py-4 px-6 rounded-xl bg-[var(--surface-color)] text-[var(--text-primary)] border-2 border-[var(--border-color)] font-black uppercase tracking-widest shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2`}
                >
                    <Home className="w-5 h-5" />
                    MENU
                </button>
            </div>
        </div>
    );
}
