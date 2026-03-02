import { X } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';
import { ProgressBar } from './ProgressBar';
import { OptionButton } from './OptionButton';
import { InputAnswer } from './InputAnswer';

const shuffleText = (text: string) => {
    return text.split('').sort(() => Math.random() - 0.5).join('').toUpperCase();
};

export function PlayingScreen() {
    const navigate = useNavigate();
    const game = useGameStore();

    const scrambledAnagram = useMemo(() => {
        if (game.gameMode === 'anagram' && game.questions[game.currentIndex]) {
            return shuffleText(game.questions[game.currentIndex].capital);
        }
        return '';
    }, [game.gameMode, game.questions, game.currentIndex]);

    if (!game.questions[game.currentIndex]) {
        return <Navigate to="/practice" replace />;
    }

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-[var(--surface-color)] p-3 rounded-xl border-2 border-[var(--border-color)]">
                <button
                    onClick={() => {
                        game.restart();
                        navigate('/practice');
                    }}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--color-error)] transition-colors"
                >
                    <X className="w-4 h-4" /> Sair
                </button>

                <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-[var(--text-secondary)] uppercase tracking-wider">
                        {game.questions[game.currentIndex]?.continent}
                    </span>
                    <div className="bg-[var(--bg-color)] px-3 py-1 rounded-lg text-[var(--color-correct)] tabular-nums border-2 border-[var(--border-color)]">
                        {game.score} PTS
                    </div>
                </div>
            </div>

            <ProgressBar current={game.currentIndex} total={game.questions.length} isDark={true} />

            {/* ÁREA DA PERGUNTA */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
                {game.gameMode === 'flags' && (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-correct)] to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <img
                            src={`https://flagcdn.com/w320/${game.questions[game.currentIndex].code}.png`}
                            className="h-32 relative rounded-lg shadow-2xl border-2 border-[var(--border-color)]"
                            alt="Flag"
                        />
                    </div>
                )}

                <div className="text-center px-4 w-full">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight text-[var(--text-primary)] drop-shadow-sm">
                        {['classic', 'suddenDeath', 'survival'].includes(game.gameMode) && game.questions[game.currentIndex].name}
                        {game.gameMode === 'writing' && game.questions[game.currentIndex].name}
                        {game.gameMode === 'reverse' && game.questions[game.currentIndex].capital}
                        {game.gameMode === 'flags' && "QUE PAÍS É ESSE?"}
                        {game.gameMode === 'anagram' && (
                            <span className="tracking-[0.2em]">{scrambledAnagram}</span>
                        )}
                    </h2>
                    {game.gameMode === 'anagram' && (
                        <p className="text-sm mt-2 text-[var(--text-secondary)] font-bold">DESEMBARALHE A CAPITAL</p>
                    )}
                </div>

                {game.gameMode === 'suddenDeath' && (
                    <div className={`text-6xl font-black tabular-nums transition-colors duration-300 ${game.timeLeft <= 2 ? 'text-[var(--color-error)] animate-pulse' : 'text-[var(--text-secondary)]'}`}>
                        {game.timeLeft}
                    </div>
                )}
            </div>

            {/* RESPOSTA */}
            <div className="pb-2">
                {['writing', 'anagram'].includes(game.gameMode) ? (
                    <InputAnswer
                        onSubmit={game.handleAnswer}
                        isAnswered={game.isAnswered}
                        correctAnswer={game.questions[game.currentIndex].capital}
                        nextQuestion={game.nextQuestion}
                        isDark={true}
                    />
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {game.currentOptions.map((opt, idx) => (
                            <OptionButton
                                key={opt.name}
                                option={opt}
                                idx={idx}
                                isAnswered={game.isAnswered}
                                isSelected={game.selectedAnswer === (['classic', 'suddenDeath', 'survival'].includes(game.gameMode) ? opt.capital : opt.name)}
                                isCorrect={
                                    ['classic', 'suddenDeath', 'survival'].includes(game.gameMode)
                                        ? opt.capital === game.questions[game.currentIndex].capital
                                        : opt.name === game.questions[game.currentIndex].name
                                }
                                onSelect={() => game.handleAnswer(['classic', 'suddenDeath', 'survival'].includes(game.gameMode) ? opt.capital : opt.name)}
                                mode={game.gameMode}
                                isDark={true}
                            />
                        ))}

                        {/* Botão Próximo */}
                        {game.isAnswered && game.gameState !== 'game_over' && game.gameState !== 'finished' && game.gameMode !== 'suddenDeath' && (
                            <button
                                onClick={game.nextQuestion}
                                className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all uppercase tracking-widest"
                            >
                                PRÓXIMA PERGUNTA
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
