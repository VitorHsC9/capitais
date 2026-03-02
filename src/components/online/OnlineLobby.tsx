import { useState } from 'react';
import {
    ChevronLeft,
    Copy,
    Check,
    Wifi,
    Users,
    Loader2,
    Swords,
    Zap,
    Skull,
    Flag,
    Shuffle,
    Crown,
    AlertCircle,
    Globe,
    Map,
    Infinity,
    Keyboard,
    ListChecks,
} from 'lucide-react';
import { useOnlineGame } from '../../hooks/useOnlineGame';
import { OnlineGame } from './OnlineGame';
import { OnlineResults } from './OnlineResults';
import type { OnlineCategory, OnlineGameMode } from '../../services/roomService';

interface OnlineLobbyProps {
    onBack: () => void;
}

const CATEGORY_CONFIG: {
    id: OnlineCategory;
    icon: typeof Swords;
    title: string;
    desc: string;
    color: string;
    emoji: string;
}[] = [
        { id: 'capitals', icon: Globe, title: 'CAPITAIS', desc: 'País ↔ Capital', color: 'text-emerald-400', emoji: '🏛️' },
        { id: 'flags', icon: Flag, title: 'BANDEIRAS', desc: 'Bandeira → País', color: 'text-blue-400', emoji: '🏴' },
        { id: 'territories', icon: Map, title: 'TERRITÓRIOS', desc: 'Formato do mapa → País', color: 'text-amber-400', emoji: '🗺️' },
        { id: 'mix', icon: Shuffle, title: 'MISTO', desc: 'Aleatório entre todos', color: 'text-purple-400', emoji: '🎲' },
    ];

const MODE_CONFIG: {
    id: OnlineGameMode;
    icon: typeof Swords;
    title: string;
    desc: string;
    color: string;
    emoji: string;
}[] = [
        { id: 'classic', icon: Swords, title: 'CLÁSSICO', desc: '10 rodadas • 10s por pergunta', color: 'text-[var(--color-primary)]', emoji: '⚔️' },
        { id: 'speed', icon: Zap, title: 'VELOCIDADE', desc: '10 rodadas • Timer de 5s • Bônus por rapidez', color: 'text-yellow-400', emoji: '⚡' },
        { id: 'survival', icon: Skull, title: 'SOBREVIVÊNCIA', desc: 'Errou = Eliminado', color: 'text-red-400', emoji: '💀' },
        { id: 'infinite', icon: Infinity, title: 'INFINITO', desc: '3 vidas • Joga até morrer', color: 'text-cyan-400', emoji: '♾️' },
    ];

export function OnlineLobby({ onBack }: OnlineLobbyProps) {
    const game = useOnlineGame();
    const [joinCode, setJoinCode] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (game.roomCode) {
            navigator.clipboard.writeText(game.roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Route to game/results when playing
    if (game.phase === 'playing' || game.phase === 'round-result') {
        return <OnlineGame game={game} />;
    }
    if (game.phase === 'results') {
        return <OnlineResults game={game} onBack={onBack} />;
    }

    const players = game.roomData?.players ? Object.entries(game.roomData.players) : [];
    const allReady = players.length >= 2 && players.every(([_, p]) => p.isReady);
    const myPlayerData = game.roomData?.players?.[game.playerId];

    const getHeaderTitle = () => {
        switch (game.phase) {
            case 'menu': return 'Jogar Online';
            case 'category-select': return 'Escolha a Categoria';
            case 'mode-select': return 'Modo de Jogo';
            case 'waiting': return 'Sala de Espera';
            default: return 'Online';
        }
    };

    const handleBack = () => {
        if (game.phase === 'menu') onBack();
        else if (game.phase === 'waiting') game.handleLeave();
        else game.goBackToMenu();
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={handleBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                        Online
                    </h2>
                    <p className="text-xl font-black text-[var(--text-primary)]">{getHeaderTitle()}</p>
                </div>
            </div>

            {/* Error Banner */}
            {game.error && (
                <div className="mb-4 p-3 rounded-xl bg-[var(--color-error)]/10 border-2 border-[var(--color-error)]/30 flex items-center gap-3 animate-in fade-in duration-200">
                    <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0" />
                    <p className="text-sm font-bold text-[var(--color-error)] flex-1">{game.error}</p>
                    <button onClick={game.clearError} className="text-[var(--color-error)] font-bold text-xs uppercase">✕</button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2">
                {/* ── MENU PHASE ── */}
                {game.phase === 'menu' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                                Seu Nome
                            </label>
                            <input
                                type="text"
                                value={game.playerName}
                                onChange={(e) => game.setPlayerName(e.target.value)}
                                placeholder="Digite seu nome..."
                                maxLength={20}
                                className="game-input text-lg"
                            />
                        </div>

                        <button
                            onClick={() => {
                                if (!game.playerName.trim()) return;
                                game.goToCategorySelect();
                            }}
                            disabled={!game.playerName.trim() || game.isLoading}
                            className="w-full p-5 rounded-2xl bg-[var(--color-primary)] text-white font-black text-lg uppercase tracking-wide shadow-[0_4px_0_var(--color-primary-dark)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <Wifi className="w-6 h-6" />
                            CRIAR SALA
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-[2px] bg-[var(--border-color)]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">ou</span>
                            <div className="flex-1 h-[2px] bg-[var(--border-color)]" />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                Entrar numa Sala
                            </label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                placeholder="CÓDIGO DA SALA"
                                maxLength={6}
                                className="game-input text-center text-2xl font-black tracking-[0.3em] uppercase"
                            />
                            <button
                                onClick={() => game.handleJoinRoom(joinCode)}
                                disabled={joinCode.length < 6 || !game.playerName.trim() || game.isLoading}
                                className="w-full p-4 rounded-xl bg-[var(--color-secondary)] text-white font-bold uppercase tracking-wide shadow-[0_4px_0_var(--color-secondary-dark)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {game.isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <><Users className="w-5 h-5" /> ENTRAR</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── CATEGORY SELECT PHASE ── */}
                {game.phase === 'category-select' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {CATEGORY_CONFIG.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => game.selectCategory(cat.id)}
                                className="w-full text-left p-4 rounded-xl bg-[var(--surface-color)] hover:bg-[var(--bg-color)] border-2 border-[var(--border-color)] flex items-center gap-4 transition-all group active:scale-[0.98] hover:border-[var(--text-primary)]"
                            >
                                <div className={`p-3 rounded-lg bg-[var(--bg-color)] ${cat.color} transition-colors text-2xl`}>
                                    {cat.emoji}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-base text-[var(--text-primary)]">{cat.title}</div>
                                    <div className="text-xs text-[var(--text-secondary)] font-medium">{cat.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── MODE SELECT PHASE ── */}
                {game.phase === 'mode-select' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Selected category badge */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                                {CATEGORY_CONFIG.find(c => c.id === game.selectedCategory)?.emoji}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-[var(--surface-color)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                {CATEGORY_CONFIG.find(c => c.id === game.selectedCategory)?.title}
                            </span>
                        </div>

                        {/* Game modes */}
                        <div className="space-y-3">
                            {MODE_CONFIG.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => game.selectMode(mode.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-4 transition-all group active:scale-[0.98] ${game.selectedMode === mode.id
                                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]'
                                        : 'bg-[var(--surface-color)] hover:bg-[var(--bg-color)] border-[var(--border-color)] hover:border-[var(--text-primary)]'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg bg-[var(--bg-color)] ${mode.color} text-2xl`}>
                                        {mode.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-base text-[var(--text-primary)]">{mode.title}</div>
                                        <div className="text-xs text-[var(--text-secondary)] font-medium">{mode.desc}</div>
                                    </div>
                                    {game.selectedMode === mode.id && (
                                        <Check className="w-5 h-5 text-[var(--color-primary)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Input Format Toggle */}
                        {game.selectedMode && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                                    Formato de Resposta
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => game.setSelectedInputFormat('multiple_choice')}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${game.selectedInputFormat === 'multiple_choice'
                                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                                            : 'bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                                            }`}
                                    >
                                        <ListChecks className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase">Alternativas</span>
                                    </button>
                                    <button
                                        onClick={() => game.setSelectedInputFormat('typing')}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${game.selectedInputFormat === 'typing'
                                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                                            : 'bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                                            }`}
                                    >
                                        <Keyboard className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase">Digitação</span>
                                    </button>
                                </div>

                                {/* Create Room Button */}
                                <button
                                    onClick={game.handleCreateRoom}
                                    disabled={game.isLoading}
                                    className="w-full mt-4 p-5 rounded-2xl bg-[var(--color-primary)] text-white font-black text-lg uppercase tracking-wide shadow-[0_4px_0_var(--color-primary-dark)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {game.isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <><Wifi className="w-6 h-6" /> CRIAR SALA</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── WAITING PHASE ── */}
                {game.phase === 'waiting' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Room Code Display */}
                        <div className="text-center p-6 rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)]">
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                                Código da Sala
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-4xl font-black tracking-[0.3em] text-[var(--text-primary)] font-mono">
                                    {game.roomCode}
                                </span>
                                <button
                                    onClick={handleCopyCode}
                                    className="p-2 rounded-lg bg-[var(--bg-color)] border-2 border-[var(--border-color)] hover:border-[var(--color-primary)] transition-colors"
                                >
                                    {copied ? <Check className="w-5 h-5 text-[var(--color-primary)]" /> : <Copy className="w-5 h-5 text-[var(--text-secondary)]" />}
                                </button>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-3 font-medium">
                                Compartilhe este código com seu oponente
                            </p>
                        </div>

                        {/* Game Config Badges */}
                        {game.roomData && (
                            <div className="flex flex-wrap justify-center gap-2">
                                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                    {CATEGORY_CONFIG.find((c) => c.id === game.roomData?.category)?.emoji}{' '}
                                    {CATEGORY_CONFIG.find((c) => c.id === game.roomData?.category)?.title}
                                </span>
                                <span className="px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                                    {MODE_CONFIG.find((m) => m.id === game.roomData?.mode)?.emoji}{' '}
                                    {MODE_CONFIG.find((m) => m.id === game.roomData?.mode)?.title}
                                </span>
                                <span className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-bold text-violet-400 uppercase tracking-wider">
                                    {game.roomData.inputFormat === 'typing' ? '⌨️ Digitação' : '🔘 Alternativas'}
                                </span>
                            </div>
                        )}

                        {/* Players List */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                Jogadores ({players.length}/2)
                            </h3>
                            {players.map(([pid, player]) => (
                                <div
                                    key={pid}
                                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-color)] border-2 border-[var(--border-color)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${pid === game.roomData?.hostId
                                            ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/30'
                                            : 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border-2 border-[var(--color-secondary)]/30'
                                            }`}>
                                            {pid === game.roomData?.hostId ? <Crown className="w-5 h-5" /> : player.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="font-bold text-[var(--text-primary)]">
                                                {player.name}
                                                {pid === game.playerId && (
                                                    <span className="ml-2 text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">(Você)</span>
                                                )}
                                            </span>
                                            {pid === game.roomData?.hostId && (
                                                <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Host</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${player.isReady
                                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30'
                                        : 'bg-[var(--border-color)]/30 text-[var(--text-secondary)] border border-[var(--border-color)]'
                                        }`}>
                                        {player.isReady ? '✓ PRONTO' : 'ESPERANDO'}
                                    </div>
                                </div>
                            ))}

                            {players.length < 2 && (
                                <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-[var(--border-color)] text-[var(--text-secondary)]">
                                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                    <span className="text-sm font-bold">Aguardando oponente...</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pb-4">
                            <button
                                onClick={game.handleReady}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] ${myPlayerData?.isReady
                                    ? 'bg-[var(--border-color)] text-[var(--text-secondary)]'
                                    : 'bg-[var(--color-primary)] text-white'
                                    }`}
                            >
                                {myPlayerData?.isReady ? 'CANCELAR PRONTO' : 'ESTOU PRONTO'}
                            </button>

                            {game.isHost && allReady && (
                                <button
                                    onClick={game.handleStartGame}
                                    disabled={game.isLoading}
                                    className="w-full py-4 rounded-xl bg-[var(--color-accent)] text-[var(--bg-color)] font-black uppercase tracking-widest shadow-[0_4px_0_var(--color-accent-dark)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {game.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🚀 INICIAR PARTIDA'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
