import { CONFIG, COUNTRIES_DB } from '../data/countries';
import type { Country } from '../data/countries';
import { getRandomItems, shuffleArray } from './array';

export const generateRoundOptions = (correct: Country): Country[] => {
    const needed = CONFIG.OPTIONS_COUNT - 1;
    const sameContinentPool = COUNTRIES_DB.filter(
        (country) => country.continent === correct.continent && country.name !== correct.name
    );
    let distractors = getRandomItems(sameContinentPool, needed);

    if (distractors.length < needed) {
        const remainingNeeded = needed - distractors.length;
        const otherPool = COUNTRIES_DB.filter((country) => country.continent !== correct.continent);
        distractors = [...distractors, ...getRandomItems(otherPool, remainingNeeded)];
    }

    return shuffleArray([...distractors, correct]);
};
