import type { Country } from '../data/countries';

export const normalizeText = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

export const checkCountryName = (country: Country, guess: string) => {
    const normGuess = normalizeText(guess);
    if (normalizeText(country.name) === normGuess) return true;
    if (country.mapName && normalizeText(country.mapName) === normGuess) return true;
    if (country.acceptedNames && country.acceptedNames.some(n => normalizeText(n) === normGuess)) return true;
    return false;
};

export const checkCountryCapital = (country: Country, guess: string) => {
    const normGuess = normalizeText(guess);
    if (normalizeText(country.capital) === normGuess) return true;
    if (country.acceptedCapitals && country.acceptedCapitals.some(c => normalizeText(c) === normGuess)) return true;
    return false;
};
