import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, XCircle, Share2, Trophy, ArrowRight } from 'lucide-react';
import { useDailyMix } from '../hooks/useDailyMix';
import { OptionButton } from './OptionButton';
import { ProgressBar } from './ProgressBar';
import { CountryAutocomplete } from './CountryAutocomplete';

interface DailyMixProps {
    onBack: () => void;
    onNextChallenge: () => void;
}

export function DailyMix({ onBack, onNextChallenge }: DailyMixProps) {
    const { gameState, submitAnswer, nextDailyTime } = useDailyMix();
    const [timeLeftStr, setTimeLeftStr] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = nextDailyTime - now;

            if (distance < 0) {
                setTimeLeftStr("00:00:00");
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeftStr(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextDailyTime]);

    if (!gameState) return <div className="p-10 text-center">Carregando desafio...</div>;

    const isFinished = gameState.status !== 'playing';
    const currentQ = gameState.questions[gameState.currentIndex];

    const handleOptionSelect = (value: string) => {
        if (selectedOption) return; // Prevent double click
        setSelectedOption(value);

        // Small delay to show selection before submitting
        setTimeout(() => {
            submitAnswer(value);
            setSelectedOption(null);
        }, 500);
    };

    if (isFinished) {
        return (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Desafio Mix</h2>
                        <p className="text-sm font-black text-[var(--text-primary)]">{gameState.date}</p>
                    </div>
                    <div className="w-10"></div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
                    <div className="bg-[var(--surface-color)] p-8 rounded-2xl border-2 border-[var(--border-color)] animate-in slide-in-from-bottom-4 duration-500 w-full max-w-sm text-center shadow-[4px_4px_0_var(--border-color)]">
                        {gameState.status === 'won' ? (
                            <>
                                <div className="w-20 h-20 bg-[var(--color-correct)]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-correct)] border-2 border-[var(--color-correct)]">
                                    <Trophy className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-wide">VITÓRIA!</h1>
                                <p className="text-sm font-bold text-[var(--text-secondary)] mb-8">Você completou o desafio de hoje.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-[var(--color-error)]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-error)] border-2 border-[var(--color-error)]">
                                    <XCircle className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-wide">FIM DE JOGO</h1>
                                <p className="text-sm font-bold text-[var(--text-secondary)] mb-8">Você errou na questão {gameState.currentIndex + 1}.</p>
                            </>
                        )}

                        <div className="flex items-center justify-center gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">PRÓXIMO</div>
                                <div className="text-xl font-mono font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {timeLeftStr}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">ACERTOS</div>
                                <div className="text-xl font-bold text-[var(--text-primary)]">
                                    {gameState.answers.filter(a => a).length}/10
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] uppercase tracking-wide">
                            <Share2 className="w-5 h-5" /> Compartilhar Resultado
                        </button>

                        <button onClick={onNextChallenge} className="w-full mt-3 py-3 bg-[var(--surface-color)] text-[var(--text-primary)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide border-2 border-[var(--border-color)]">
                            <ArrowRight className="w-4 h-4" /> Próximo Desafio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-[var(--surface-color)] p-3 rounded-xl border-2 border-[var(--border-color)] mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--color-error)] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Sair
                </button>

                <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-[var(--text-secondary)] uppercase tracking-wider">PERGUNTA {gameState.currentIndex + 1}/10</span>
                </div>
            </div>

            <ProgressBar current={gameState.currentIndex} total={10} isDark={true} />

            <div className="flex-1 flex flex-col items-center justify-center gap-6 relative py-4">

                {currentQ.mode === 'flags' && (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-correct)] to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <img
                            src={`https://flagcdn.com/w320/${currentQ.country.code}.png`}
                            className="h-32 relative rounded-lg shadow-2xl border-2 border-[var(--border-color)]"
                            alt="Flag"
                        />
                    </div>
                )}

                <div className="text-center px-4 w-full">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-[var(--text-primary)] drop-shadow-sm">
                        {currentQ.mode === 'classic' && currentQ.country.name}
                        {currentQ.mode === 'reverse' && currentQ.country.capital}
                        {currentQ.mode === 'flags' && "QUE PAÍS É ESSE?"}
                    </h2>
                    {currentQ.mode === 'reverse' && <p className="text-sm mt-2 text-[var(--text-secondary)] font-bold">QUAL O PAÍS DESSA CAPITAL?</p>}
                    {currentQ.mode === 'classic' && <p className="text-sm mt-2 text-[var(--text-secondary)] font-bold">QUAL A CAPITAL?</p>}
                </div>
            </div>

            <div className="pb-2 flex flex-col gap-2.5 w-full max-w-md mx-auto px-4">
                {currentQ.mode === 'classic' ? (
                    currentQ.options.map((opt, idx) => {
                        const isCorrect = opt.capital === currentQ.country.capital;
                        return (
                            <OptionButton
                                key={opt.name}
                                option={opt}
                                idx={idx}
                                isAnswered={!!selectedOption}
                                isSelected={selectedOption === opt.capital}
                                isCorrect={isCorrect}
                                onSelect={() => handleOptionSelect(opt.capital)}
                                mode="classic"
                                isDark={true}
                            />
                        );
                    })
                ) : (
                    <CountryAutocomplete
                        onSelect={handleOptionSelect}
                        placeholder="Digite o nome do país..."
                        disabled={isFinished || !!selectedOption}
                    />
                )}
            </div>
        </div>
    );
}
