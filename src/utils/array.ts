/**
 * Shared array utility functions.
 * Used by useGameStore, roomService, and others.
 */

export const shuffleArray = <T,>(array: T[]): T[] =>
    [...array].sort(() => Math.random() - 0.5);

export const getRandomItems = <T,>(arr: T[], count: number, excludeItem?: T): T[] => {
    const result: T[] = [];
    const takenIndices = new Set<number>();

    const excludeIndex = excludeItem ? arr.indexOf(excludeItem) : -1;
    if (excludeIndex !== -1) takenIndices.add(excludeIndex);

    while (result.length < count && takenIndices.size < arr.length) {
        const idx = Math.floor(Math.random() * arr.length);
        if (!takenIndices.has(idx)) {
            takenIndices.add(idx);
            result.push(arr[idx]);
        }
    }
    return result;
};
