const UINT32_MAX_PLUS_ONE = 0x100000000;

export const randomFloat = () => {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] / UINT32_MAX_PLUS_ONE;
};

export const randomInt = (maxExclusive: number) => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new RangeError('maxExclusive must be a positive integer');
    }

    return Math.floor(randomFloat() * maxExclusive);
};

export const randomInRange = (min: number, max: number) => randomFloat() * (max - min) + min;

export const shuffleArray = <T,>(array: readonly T[]): T[] => {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};

export const getRandomItems = <T,>(arr: readonly T[], count: number, excludeItem?: T): T[] => {
    const pool = excludeItem === undefined ? [...arr] : arr.filter((item) => item !== excludeItem);
    return shuffleArray(pool).slice(0, count);
};

export const randomString = (length: number, alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789') => {
    let value = '';

    for (let i = 0; i < length; i++) {
        value += alphabet[randomInt(alphabet.length)];
    }

    return value;
};
