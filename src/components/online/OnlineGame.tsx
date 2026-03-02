import { useState } from 'react';
import { X, Check, Clock, Loader2, Heart, HeartOff, Send } from 'lucide-react';
import { TerritoryMap } from './TerritoryMap';
import type { useOnlineGame } from '../../hooks/useOnlineGame';

interface OnlineGameProps {
    game: ReturnType<typeof useOnlineGame>;
}

export function OnlineGame({ game }: OnlineGameProps) {
    const { roomData, currentRound, myAnswer, opponentAnswer, opponentId, timeLeft, phase, roundAnswers } = game;
    const [typingAnswer, setTypingAnswer] = useState('');

    if (!roomData || !currentRound) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 text-[var(--text-secondary)] animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Carregando...</p>
            </div>
        );
    }

    const myPlayer = roomData.players?.[game.playerId];
    const opponent = opponentId ? roomData.players?.[opponentId] : null;
    const roundType = currentRound.type;
    const question = currentRound.question;
    const totalRounds = roomData.totalRounds;
    const currentRoundNum = roomData.currentRound;
    const isShowingResult = phase === 'round-result';
    const isTypingMode = roomData.inputFormat === 'typing';
    const isInfiniteMode = roomData.mode === 'infinite';
    const isSurvivalMode = roomData.mode === 'survival';

    // Use roundAnswers from Firebase as source of truth
    const myAnswerFromFirebase = roundAnswers?.[game.playerId];
    const opponentAnswerFromFirebase = opponentId ? roundAnswers?.[opponentId] : null;
    const myIsCorrect = myAnswer?.isCorrect ?? myAnswerFromFirebase?.isCorrect ?? false;
    const opponentIsCorrect = opponentAnswer?.isCorrect ?? opponentAnswerFromFirebase?.isCorrect ?? false;

    // Timer color based on time left
    const timerColor = timeLeft <= 2
        ? 'text-[var(--color-error)] animate-pulse'
        : timeLeft <= 5
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--text-primary)]';

    // Determine what to show as question
    const getQuestionText = () => {
        if (roundType === 'capital') return question.name;
        if (roundType === 'reverse') return question.capital;
        if (roundType === 'flag') return 'QUE PAÍS É ESSE?';
        if (roundType === 'territory') return 'QUE PAÍS É ESSE?';
        return question.name;
    };

    const getSubtitle = () => {
        if (roundType === 'capital') return 'QUAL A CAPITAL?';
        if (roundType === 'reverse') return 'QUAL O PAÍS?';
        if (roundType === 'flag') return 'IDENTIFIQUE A BANDEIRA';
        if (roundType === 'territory') return 'IDENTIFIQUE O TERRITÓRIO';
        return '';
    };

    const getOptionLabel = (opt: typeof currentRound.options[0]) => {
        if (roundType === 'capital') return opt.capital;
        return opt.name;
    };

    const getCorrectAnswer = () => {
        if (roundType === 'capital') return question.capital;
        return question.name;
    };

    const handleTypingSubmit = () => {
        if (!typingAnswer.trim() || myAnswer) return;
        game.handleAnswer(typingAnswer.trim());
        setTypingAnswer('');
    };

    // Lives display for infinite mode
    const renderLives = (lives: number, maxLives: number = 3) => {
        return Array.from({ length: maxLives }, (_, i) => (
            i < lives
                ? <Heart key={i} className="w-4 h-4 text-red-400 fill-red-400" />
                : <HeartOff key={i} className="w-4 h-4 text-[var(--text-secondary)] opacity-40" />
        ));
    };

    return (
        <div className="flex flex-col h-full gap-2 animate-in fade-in duration-300 overflow-y-auto">
            {/* ── Top Bar: Players + Score ── */}
            <div className="flex items-center justify-between bg-[var(--surface-color)] p-3 rounded-xl border-2 border-[var(--border-color)]">
                {/* My Player */}
                <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-black text-xs border-2 border-[var(--color-primary)]/30">
                        {myPlayer?.name.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[80px]">{myPlayer?.name || 'Você'}</div>
                        <div className="text-[10px] font-bold text-[var(--color-primary)] tabular-nums">{myPlayer?.score || 0} pts</div>
                    </div>
                    {myAnswer && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isShowingResult
                            ? myIsCorrect ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-error)]'
                            : 'bg-[var(--color-primary)]/30'
                            }`}>
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>

                {/* VS / Round */}
                <div className="flex flex-col items-center px-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        {isSurvivalMode || isInfiniteMode ? `${currentRoundNum + 1}` : `${currentRoundNum + 1}/${totalRounds}`}
                    </span>
                    <span className="text-xs font-black text-[var(--text-secondary)]">VS</span>
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    {opponentAnswer && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isShowingResult
                            ? opponentIsCorrect ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-error)]'
                            : 'bg-[var(--color-secondary)]/30'
                            }`}>
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    )}
                    <div className="min-w-0 text-right">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[80px]">{opponent?.name || '???'}</div>
                        <div className="text-[10px] font-bold text-[var(--color-secondary)] tabular-nums">{opponent?.score || 0} pts</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] flex items-center justify-center font-black text-xs border-2 border-[var(--color-secondary)]/30">
                        {opponent?.name.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>
            </div>

            {/* Lives/Survival Indicators */}
            {(isInfiniteMode || isSurvivalMode) && (
                <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-1.5">
                        {isInfiniteMode ? (
                            <div className="flex gap-0.5">{renderLives(myPlayer?.lives ?? 3)}</div>
                        ) : (
                            myPlayer?.isAlive
                                ? <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                                : <HeartOff className="w-4 h-4 text-[var(--text-secondary)]" />
                        )}
                        <span className={`text-xs font-bold ${myPlayer?.isAlive ? 'text-red-400' : 'text-[var(--text-secondary)] line-through'}`}>
                            {myPlayer?.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {isInfiniteMode ? (
                            <div className="flex gap-0.5">{renderLives(opponent?.lives ?? 3)}</div>
                        ) : (
                            opponent?.isAlive
                                ? <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                                : <HeartOff className="w-4 h-4 text-[var(--text-secondary)]" />
                        )}
                        <span className={`text-xs font-bold ${opponent?.isAlive ? 'text-red-400' : 'text-[var(--text-secondary)] line-through'}`}>
                            {opponent?.name}
                        </span>
                    </div>
                </div>
            )}

            {/* ── Timer ── */}
            <div className="flex justify-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-color)] border-2 border-[var(--border-color)] ${timerColor}`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-2xl font-black tabular-nums">{timeLeft}</span>
                </div>
            </div>

            {/* ── Question ── */}
            <div className="flex flex-col items-center justify-center gap-2 py-2 relative">
                {/* Flag image for flag mode */}
                {roundType === 'flag' && (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 rounded-lg blur opacity-25" />
                        <img
                            src={`https://flagcdn.com/w320/${question.code}.png`}
                            className="h-20 relative rounded-lg shadow-2xl border-2 border-[var(--border-color)]"
                            alt="Flag"
                        />
                    </div>
                )}

                {/* Territory world map with highlighted country */}
                {roundType === 'territory' && (
                    <TerritoryMap countryCode={question.code} />
                )}

                {/* Round type badge */}
                <div className="px-3 py-1 rounded-full bg-[var(--surface-color)] border border-[var(--border-color)]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        {getSubtitle()}
                    </span>
                </div>

                {/* Question text */}
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight text-[var(--text-primary)] text-center px-4 drop-shadow-sm">
                    {getQuestionText()}
                </h2>
            </div>

            {/* ── Options (Multiple Choice) ── */}
            {!isTypingMode && (
                <div className="pb-2 space-y-2.5">
                    {currentRound.options.map((opt, idx) => {
                        const optLabel = getOptionLabel(opt);
                        const correctAnswer = getCorrectAnswer();
                        const isSelected = myAnswer?.answer === optLabel;
                        const isCorrectOption = optLabel === correctAnswer;

                        let bgColor = 'bg-[var(--surface-color)] border-[var(--border-color)] hover:border-[var(--text-primary)]';
                        let textColor = 'text-[var(--text-primary)]';

                        if (isShowingResult || myAnswer) {
                            if (isCorrectOption) {
                                bgColor = 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]';
                                textColor = 'text-[var(--color-primary)]';
                            } else if (isSelected && !myIsCorrect) {
                                bgColor = 'bg-[var(--color-error)]/20 border-[var(--color-error)]';
                                textColor = 'text-[var(--color-error)]';
                            } else {
                                bgColor = 'bg-[var(--surface-color)] border-[var(--border-color)] opacity-50';
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => !myAnswer && game.handleAnswer(optLabel)}
                                disabled={!!myAnswer}
                                className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-3 transition-all active:scale-[0.98] ${bgColor} disabled:cursor-default`}
                            >
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-[var(--bg-color)] border-2 border-[var(--border-color)] ${textColor}`}>
                                    {idx + 1}
                                </span>
                                <span className={`font-bold text-sm ${textColor}`}>
                                    {optLabel}
                                </span>
                                {isSelected && (
                                    <span className="ml-auto">
                                        {myIsCorrect ? (
                                            <Check className="w-5 h-5 text-[var(--color-primary)]" />
                                        ) : (
                                            <X className="w-5 h-5 text-[var(--color-error)]" />
                                        )}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Typing Input ── */}
            {isTypingMode && (
                <div className="pb-2 space-y-3">
                    {myAnswer ? (
                        <div className={`p-4 rounded-xl border-2 text-center ${myIsCorrect
                            ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]'
                            : 'bg-[var(--color-error)]/20 border-[var(--color-error)]'
                            }`}>
                            <p className={`text-sm font-bold ${myIsCorrect ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
                                {myIsCorrect ? '✓ Correto!' : `✗ Sua resposta: ${myAnswer.answer}`}
                            </p>
                            {!myIsCorrect && (
                                <p className="text-xs text-[var(--color-primary)] font-bold mt-1">
                                    Resposta: {getCorrectAnswer()}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={typingAnswer}
                                onChange={(e) => setTypingAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTypingSubmit()}
                                placeholder={roundType === 'capital' ? 'Digite a capital...' : 'Digite o país...'}
                                autoFocus
                                className="game-input text-lg flex-1"
                            />
                            <button
                                onClick={handleTypingSubmit}
                                disabled={!typingAnswer.trim()}
                                className="px-4 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-[0_4px_0_var(--color-primary-dark)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Waiting for opponent indicator */}
            {myAnswer && !isShowingResult && (
                <div className="flex items-center justify-center gap-2 py-3 text-[var(--text-secondary)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Aguardando oponente...</span>
                </div>
            )}

            {/* ── Round Result Overlay ── */}
            {isShowingResult && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl p-6 w-[90%] max-w-sm text-center animate-in zoom-in duration-300">
                        {/* Result headline */}
                        <div className="mb-4">
                            {myIsCorrect && !opponentIsCorrect && (
                                <div className="text-[var(--color-primary)] font-black text-xl uppercase">🎉 Ponto seu!</div>
                            )}
                            {!myIsCorrect && opponentIsCorrect && (
                                <div className="text-[var(--color-error)] font-black text-xl uppercase">😓 Ponto do oponente</div>
                            )}
                            {myIsCorrect && opponentIsCorrect && (
                                <div className="text-[var(--color-accent)] font-black text-xl uppercase">⚡ Ambos acertaram!</div>
                            )}
                            {!myIsCorrect && !opponentIsCorrect && (
                                <div className="text-[var(--text-secondary)] font-black text-xl uppercase">😅 Ninguém acertou</div>
                            )}
                        </div>

                        {/* Correct answer */}
                        <div className="p-3 rounded-xl bg-[var(--bg-color)] border-2 border-[var(--border-color)] mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                                Resposta Correta
                            </p>
                            <p className="text-lg font-black text-[var(--color-primary)]">{getCorrectAnswer()}</p>
                        </div>

                        {/* Player results side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-xl border-2 ${myIsCorrect ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-error)] bg-[var(--color-error)]/10'}`}>
                                <p className="text-xs font-bold text-[var(--text-secondary)] truncate">{myPlayer?.name}</p>
                                <p className={`text-lg font-black ${myIsCorrect ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
                                    {myIsCorrect ? '✓' : '✗'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl border-2 ${opponentIsCorrect ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-error)] bg-[var(--color-error)]/10'}`}>
                                <p className="text-xs font-bold text-[var(--text-secondary)] truncate">{opponent?.name}</p>
                                <p className={`text-lg font-black ${opponentIsCorrect ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
                                    {opponentIsCorrect ? '✓' : '✗'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[var(--text-secondary)]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Próxima rodada...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
