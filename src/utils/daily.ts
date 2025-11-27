import type { Country } from '../data/countries';

// Simple Linear Congruential Generator (LCG) for seeded random
const seededRandom = (seed: number) => {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));

    return () => {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
};

export const getDailyCountry = (countries: Country[], salt: number = 0): Country => {
    // Create a seed from the current date (YYYYMMDD)
    const now = new Date();
    let seedString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    // Check for debug salt
    const debugSalt = localStorage.getItem('debug_seed_salt');
    if (debugSalt) {
        seedString += debugSalt;
    }

    // Simple hash of the string to get a number
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
        seed = ((seed << 5) - seed) + seedString.charCodeAt(i);
        seed |= 0; // Convert to 32bit integer
    }

    seed += salt;

    const random = seededRandom(seed);

    // Use the random generator to pick an index
    const randomIndex = Math.floor(random() * countries.length);

    return countries[randomIndex];
};

export const getDailySeed = (): string => {
    const now = new Date();
    const baseSeed = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const debugSalt = localStorage.getItem('debug_seed_salt');
    return debugSalt ? `${baseSeed}-${debugSalt}` : baseSeed;
}
