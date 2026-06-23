import { describe, expect, it } from 'vitest';
import { CONFIG, COUNTRIES_DB, type Country } from '../data/countries';
import { generateRoundOptions } from './quiz';

describe('quiz utils', () => {
    it('generates the configured number of options including the correct country', () => {
        const correct = COUNTRIES_DB.find((country) => country.name === 'Brasil') ?? COUNTRIES_DB[0];

        const options = generateRoundOptions(correct);

        expect(options).toHaveLength(CONFIG.OPTIONS_COUNT);
        expect(options).toContain(correct);
        expect(new Set(options).size).toBe(options.length);
    });

    it('fills distractors from other continents when same-continent options are insufficient', () => {
        const correct: Country = {
            name: 'Teste',
            capital: 'Capital',
            continent: 'Todos',
            code: 'tt',
        };

        const options = generateRoundOptions(correct);

        expect(options).toHaveLength(CONFIG.OPTIONS_COUNT);
        expect(options).toContain(correct);
        expect(options.some((country) => country.continent !== correct.continent)).toBe(true);
    });
});
