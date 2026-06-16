import { AlertCircle, ArrowRight, CheckCircle, Clock, Share2 } from 'lucide-react';
import type { DailyGameState } from '../hooks/useDailyWordleGame';

interface DailyResultCardProps {
    readonly gameStatus: DailyGameState;
    readonly countryName: string;
    readonly timeLeftStr: string;
    readonly onNextChallenge: () => void;
}

export function DailyResultCard({
    gameStatus,
    countryName,
    timeLeftStr,
    onNextChallenge,
}: DailyResultCardProps) {
    const won = gameStatus === 'won';

    return (
        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border-2 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] animate-in slide-in-from-bottom-4 duration-500 text-center">
            <div className={`flex items-center justify-center gap-2 ${won ? 'text-[var(--color-correct)]' : 'text-[var(--color-error)]'} font-black mb-2`}>
                {won ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                <span className="uppercase tracking-wide">{won ? 'VOCE ACERTOU!' : 'FIM DE JOGO'}</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm mb-6 font-bold">O pais era <strong className="text-[var(--text-primary)] uppercase">{countryName}</strong></p>

            <div className="text-center mb-6">
                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">PROXIMO</div>
                <div className="text-lg font-mono font-bold text-[var(--text-primary)] flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    {timeLeftStr}
                </div>
            </div>

            <button className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                <Share2 className="w-4 h-4" /> Compartilhar
            </button>

            <button onClick={onNextChallenge} className="w-full mt-3 py-3 bg-[var(--surface-color)] text-[var(--text-primary)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide border-2 border-[var(--border-color)]">
                <ArrowRight className="w-4 h-4" /> Proximo Desafio
            </button>
        </div>
    );
}
