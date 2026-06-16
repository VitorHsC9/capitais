import { Trophy } from 'lucide-react';
import type { Country } from '../data/countries';
import { useSupremeCapitals } from '../hooks/useSupremeCapitals';
import { SupremeGameScreen } from './SupremeGameScreen';

interface SupremeCapitalsProps {
    readonly onBack: () => void;
}

const renderCapitalCard = (country: Country, isGuessed: boolean) => (
    <div
        key={country.code}
        className={`p-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group
            ${isGuessed
                ? 'bg-yellow-500/10 border-yellow-500'
                : 'bg-[var(--surface-color)] border-[var(--border-color)]'
            }`}
    >
        <div className="flex items-center justify-between relative z-10">
            <span className={`font-bold text-sm transition-colors ${isGuessed ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {country.name}
            </span>
            {isGuessed ? (
                <span className="font-black text-xs text-yellow-600 uppercase tracking-wider animate-in fade-in slide-in-from-right-4">
                    {country.capital}
                </span>
            ) : (
                <div className="h-1.5 w-12 bg-[var(--border-color)] rounded-full" />
            )}
        </div>
    </div>
);

export function SupremeCapitals({ onBack }: SupremeCapitalsProps) {
    const game = useSupremeCapitals();

    return (
        <SupremeGameScreen
            {...game}
            onBack={onBack}
            title="Supremo Capitais"
            conqueredLabel="capitais"
            placeholder="DIGITE UMA CAPITAL..."
            accentClass="focus:border-yellow-500"
            accentTextClass="text-yellow-500"
            gridClass="grid grid-cols-1 sm:grid-cols-2 gap-2"
            ProgressIcon={Trophy}
            renderCountryCard={renderCapitalCard}
        />
    );
}
