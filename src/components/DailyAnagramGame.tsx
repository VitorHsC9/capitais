import { ArrowLeft, ArrowRight, CheckCircle, Clock, Share2, Shuffle, XCircle } from 'lucide-react';
import { InputAnswer } from './InputAnswer';
import type { Country } from '../data/countries';
import type { DailyGameState } from '../hooks/useDailyWordleGame';
import { useCountdown } from '../hooks/useCountdown';

interface DailyAnagramGameProps {
    readonly title: string;
    readonly prompt: string;
    readonly answer: string;
    readonly clueLabel: string;
    readonly clueValue: string;
    readonly inputPlaceholder: string;
    readonly targetCountry: Country;
    readonly shuffledAnswer: string;
    readonly guesses: string[];
    readonly gameStatus: DailyGameState;
    readonly submitGuess: (guess: string) => void;
    readonly attemptsLeft: number;
    readonly nextDailyTime: number;
    readonly onBack: () => void;
    readonly onNextChallenge: () => void;
}

const ATTEMPT_KEYS = ['attempt-1', 'attempt-2', 'attempt-3', 'attempt-4', 'attempt-5'];

export function DailyAnagramGame({
    title,
    prompt,
    answer,
    clueLabel,
    clueValue,
    inputPlaceholder,
    shuffledAnswer,
    guesses,
    gameStatus,
    submitGuess,
    attemptsLeft,
    nextDailyTime,
    onBack,
    onNextChallenge,
}: DailyAnagramGameProps) {
    const timeLeftStr = useCountdown(nextDailyTime);
    const isFinished = gameStatus !== 'playing';

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">{title}</h2>
                    <p className="text-sm font-black text-[var(--text-primary)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="w-full max-w-[320px] text-center">
                    <div className="mb-2 flex justify-center">
                        <div className="p-3 bg-[var(--surface-color)] rounded-full text-[var(--text-primary)] border-2 border-[var(--border-color)] shadow-[2px_2px_0_var(--border-color)]">
                            <Shuffle className="w-8 h-8" />
                        </div>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-4">{prompt}</p>

                    <div className="relative p-6 bg-[var(--surface-color)] rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] mb-6">
                        <h1 className="text-3xl font-black tracking-[0.2em] text-[var(--text-primary)] break-all leading-relaxed">
                            {isFinished ? answer.toUpperCase() : shuffledAnswer}
                        </h1>
                        {isFinished && (
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--bg-color)] px-4 py-2 rounded-xl border-2 border-[var(--border-color)] shadow-sm flex items-center gap-2 whitespace-nowrap z-10">
                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wide">{clueLabel}: {clueValue}</span>
                            </div>
                        )}
                    </div>

                    {isFinished && (
                        <div className="mb-6 flex justify-center">
                            <div className="bg-[var(--bg-color)] px-4 py-2 rounded-xl border-2 border-[var(--border-color)] shadow-lg flex items-center gap-2">
                                {gameStatus === 'won' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-[var(--color-correct)]" />
                                        <span className="text-sm font-black text-[var(--color-correct)] uppercase tracking-wide">VOCE ACERTOU!</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5 text-[var(--color-error)]" />
                                        <span className="text-sm font-black text-[var(--color-error)] uppercase tracking-wide">NAO FOI DESSA VEZ</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center w-full px-4">
                    {isFinished ? (
                        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-center gap-8 mb-6">
                                <div className="text-center">
                                    <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">PROXIMO</div>
                                    <div className="text-xl font-mono font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {timeLeftStr}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">TENTATIVAS</div>
                                    <div className="text-xl font-bold text-[var(--text-primary)]">
                                        {gameStatus === 'won' ? guesses.length : 'X'}/5
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                                <Share2 className="w-4 h-4" /> Compartilhar Resultado
                            </button>

                            <button onClick={onNextChallenge} className="w-full mt-3 py-3 bg-[var(--surface-color)] text-[var(--text-primary)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide border-2 border-[var(--border-color)]">
                                <ArrowRight className="w-4 h-4" /> Proximo Desafio
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-center gap-2">
                                {ATTEMPT_KEYS.map((key, i) => (
                                    <div
                                        key={key}
                                        className={`w-4 h-4 rounded-full border-2 border-[var(--border-color)] transition-colors ${i < guesses.length ? 'bg-[var(--color-error)]' : 'bg-[var(--surface-color)]'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wide">
                                {attemptsLeft} tentativas restantes
                            </p>
                        </div>
                    )}
                </div>

                {!isFinished && (
                    <div className="w-full pb-4 px-4">
                        <InputAnswer
                            onSubmit={submitGuess}
                            isAnswered={false}
                            correctAnswer={answer}
                            nextQuestion={() => { }}
                            placeholder={inputPlaceholder}
                        />
                        {guesses.length > 0 && (
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {guesses.map((guess) => (
                                    <span key={guess} className="text-[10px] px-2 py-1 bg-[var(--surface-color)] text-[var(--text-secondary)] rounded-lg border-2 border-[var(--border-color)] line-through opacity-70 font-bold">
                                        {guess}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
