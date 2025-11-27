import { useState, useEffect, useRef } from 'react';
import { COUNTRIES_DB } from '../data/countries';
import { Check, Search } from 'lucide-react';

interface CountryAutocompleteProps {
    onSelect: (countryName: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function CountryAutocomplete({ onSelect, placeholder, disabled }: CountryAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filteredCountries = query.trim() === ''
        ? []
        : COUNTRIES_DB.filter(c => {
            const normalizedName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedName.includes(normalizedQuery);
        }).slice(0, 5);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCountries.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCountries.length) % filteredCountries.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCountries.length > 0) {
                handleSelect(filteredCountries[selectedIndex].name);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleSelect = (name: string) => {
        setQuery('');
        setIsOpen(false);
        onSelect(name);
    };

    return (
        <div className="relative w-full z-[500]">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                    placeholder={placeholder || "Digite o nome do país..."}
                    className="w-full bg-transparent border-2 border-[var(--tone-4)] rounded-lg px-4 py-3 pl-10 text-[var(--tone-1)] font-bold uppercase placeholder:text-[var(--tone-4)] focus:border-[var(--tone-2)] outline-none transition-colors"
                    autoComplete="off"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--tone-4)]" />
            </div>

            {isOpen && filteredCountries.length > 0 && (
                <ul ref={listRef} className="absolute bottom-full mb-2 w-full bg-[var(--tone-5)] border border-[var(--tone-4)] rounded-lg shadow-xl overflow-hidden z-[1000] max-h-[200px] overflow-y-auto">
                    {filteredCountries.map((country, index) => (
                        <li
                            key={country.code}
                            onClick={() => handleSelect(country.name)}
                            className={`px-4 py-3 cursor-pointer flex items-center justify-between ${index === selectedIndex ? 'bg-[var(--tone-4)]' : 'hover:bg-[var(--tone-5)]'}`}
                        >
                            <span className="font-bold text-[var(--tone-1)]">{country.name}</span>
                            {index === selectedIndex && <Check className="w-4 h-4 text-[var(--tone-2)]" />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
