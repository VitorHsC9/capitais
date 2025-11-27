import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, XCircle, Share2, Trophy } from 'lucide-react';
import { useDailyMix } from '../hooks/useDailyMix';
import { OptionButton } from './OptionButton';
import { ProgressBar } from './ProgressBar';
import { CountryAutocomplete } from './CountryAutocomplete';

interface DailyMixProps {
    onBack: () => void;
}

export function DailyMix({ onBack }: DailyMixProps) {
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
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-[var(--tone-5)] rounded-lg text-[var(--tone-2)] hover:text-[var(--tone-1)] transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--tone-2)]">Desafio Mix</h2>
                        <p className="text-sm font-bold text-[var(--tone-1)]">{gameState.date}</p>
                    </div>
                    <div className="w-8"></div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
                    <div className="bg-[var(--tone-5)] p-8 rounded-2xl border border-[var(--tone-4)] animate-in slide-in-from-bottom-4 duration-500 w-full max-w-sm text-center shadow-2xl">
                        {gameState.status === 'won' ? (
                            <>
                                <div className="w-20 h-20 bg-[var(--color-correct)]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-correct)]">
                                    <Trophy className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl font-black text-[var(--tone-1)] mb-2">VITÓRIA!</h1>
                                <p className="text-sm text-[var(--tone-2)] mb-8">Você completou o desafio de hoje.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-[var(--color-error)]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-error)]">
                                    <XCircle className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl font-black text-[var(--tone-1)] mb-2">FIM DE JOGO</h1>
                                <p className="text-sm text-[var(--tone-2)] mb-8">Você errou na questão {gameState.currentIndex + 1}.</p>
                            </>
                        )}

                        <div className="flex items-center justify-center gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-xs font-bold text-[var(--tone-3)] mb-1">PRÓXIMO</div>
                                <div className="text-xl font-mono font-bold text-[var(--tone-1)] flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {timeLeftStr}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold text-[var(--tone-3)] mb-1">ACERTOS</div>
                                <div className="text-xl font-bold text-[var(--tone-1)]">
                                    {gameState.answers.filter(a => a).length}/10
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-[var(--tone-1)] text-[var(--bg-color)] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                            <Share2 className="w-5 h-5" /> Compartilhar Resultado
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-[var(--tone-5)] p-3 rounded-xl border border-[var(--tone-4)] mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--tone-2)] hover:text-[var(--color-error)] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Sair
                </button>

                <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-[var(--tone-2)] uppercase tracking-wider">PERGUNTA {gameState.currentIndex + 1}/10</span>
                </div>
            </div>

            <ProgressBar current={gameState.currentIndex} total={10} isDark={true} />

            <div className="flex-1 flex flex-col items-center justify-center gap-6 relative py-4">

                {currentQ.mode === 'flags' && (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-correct)] to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <img
                            src={`https://flagcdn.com/w320/${currentQ.country.code}.png`}
                            className="h-32 relative rounded-lg shadow-2xl border border-[var(--tone-4)]"
                            alt="Flag"
                        />
                    </div>
                )}

                <div className="text-center px-4 w-full">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-[var(--tone-1)] drop-shadow-sm">
                        {currentQ.mode === 'classic' && currentQ.country.name}
                        {currentQ.mode === 'reverse' && currentQ.country.capital}
                        {currentQ.mode === 'flags' && "QUE PAÍS É ESSE?"}
                    </h2>
                    {currentQ.mode === 'reverse' && <p className="text-sm mt-2 text-[var(--tone-3)] font-bold">QUAL O PAÍS DESSA CAPITAL?</p>}
                    {currentQ.mode === 'classic' && <p className="text-sm mt-2 text-[var(--tone-3)] font-bold">QUAL A CAPITAL?</p>}
                </div>
            </div>

            <div className="pb-2 flex flex-col gap-2.5 w-full max-w-md mx-auto">
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
