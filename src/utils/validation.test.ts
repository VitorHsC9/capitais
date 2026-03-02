import { describe, it, expect } from 'vitest';
import { checkCountryName, checkCountryCapital, normalizeText } from './validation';
import type { Country } from '../data/countries';

describe('Validation Utils', () => {

    const mockCountry: Country = {
        name: 'República Democrática do Congo',
        capital: 'Kinshasa',
        continent: 'África',
        code: 'cd',
        mapName: 'Congo (Dem. Rep.)',
        acceptedNames: ['Congo RDC', 'RDC', 'Congo Democrático'],
        acceptedCapitals: ['Quinshasa']
    };

    describe('normalizeText', () => {
        it('removes accents and converts to lowercase', () => {
            expect(normalizeText('São Tomé e Príncipe')).toBe('sao tome e principe');
            expect(normalizeText('  ÁFRICA DO SUL  ')).toBe('africa do sul');
        });
    });

    describe('checkCountryName', () => {
        it('matches exact name', () => {
            expect(checkCountryName(mockCountry, 'República Democrática do Congo')).toBe(true);
        });

        it('matches ignorant to accents and casing', () => {
            expect(checkCountryName(mockCountry, 'republica democratica do congo')).toBe(true);
            expect(checkCountryName(mockCountry, 'REPUBLICA DEMOCRATICA DO CONGO')).toBe(true);
        });

        it('matches mapName fallback', () => {
            expect(checkCountryName(mockCountry, 'Congo (Dem. Rep.)')).toBe(true);
        });

        it('matches any of the acceptedNames', () => {
            expect(checkCountryName(mockCountry, 'Congo RDC')).toBe(true);
            expect(checkCountryName(mockCountry, 'RDC')).toBe(true);
            expect(checkCountryName(mockCountry, 'cOngO demoCRatiCO')).toBe(true);
        });

        it('returns false for wrong names', () => {
            expect(checkCountryName(mockCountry, 'Congo')).toBe(false); // That would be RoC, not DRC
            expect(checkCountryName(mockCountry, 'Brazil')).toBe(false);
        });
    });

    describe('checkCountryCapital', () => {
        it('matches exact capital', () => {
            expect(checkCountryCapital(mockCountry, 'Kinshasa')).toBe(true);
        });

        it('matches ignoring accents and case', () => {
            expect(checkCountryCapital(mockCountry, 'kinshasa')).toBe(true);
        });

        it('matches acceptedCapitals aliases', () => {
            expect(checkCountryCapital(mockCountry, 'Quinshasa')).toBe(true);
            expect(checkCountryCapital(mockCountry, 'quinshasa')).toBe(true);
        });

        it('returns false for wrong capitals', () => {
            expect(checkCountryCapital(mockCountry, 'Brazzaville')).toBe(false);
            expect(checkCountryCapital(mockCountry, 'Luanda')).toBe(false);
        });
    });
});
