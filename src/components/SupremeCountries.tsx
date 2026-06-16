import { Globe } from 'lucide-react';
import type { Country } from '../data/countries';
import { useSupremeCountries } from '../hooks/useSupremeCountries';
import { SupremeGameScreen } from './SupremeGameScreen';

interface SupremeCountriesProps {
    readonly onBack: () => void;
}

const renderCountryCard = (country: Country, isGuessed: boolean) => (
    <div
        key={country.code}
        className={`p-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group flex items-center justify-center text-center min-h-[3.5rem]
            ${isGuessed
                ? 'bg-blue-500/10 border-blue-500'
                : 'bg-[var(--surface-color)] border-[var(--border-color)]'
            }`}
    >
        <div className="relative z-10">
            {isGuessed ? (
                <span className="font-bold text-sm text-[var(--text-primary)] animate-in fade-in zoom-in duration-300 leading-tight">
                    {country.name}
                </span>
            ) : (
                <div className="h-1.5 w-12 bg-[var(--border-color)] rounded-full" />
            )}
        </div>
    </div>
);

export function SupremeCountries({ onBack }: SupremeCountriesProps) {
    const game = useSupremeCountries();

    return (
        <SupremeGameScreen
            {...game}
            onBack={onBack}
            title="Supremo Paises"
            conqueredLabel="paises"
            placeholder="DIGITE UM PAIS..."
            accentClass="focus:border-blue-500"
            accentTextClass="text-blue-500"
            gridClass="grid grid-cols-2 sm:grid-cols-3 gap-2"
            ProgressIcon={Globe}
            renderCountryCard={renderCountryCard}
        />
    );
}
