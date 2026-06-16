import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COUNTRIES_DB } from '../data/countries';
import type { Country, Continent } from '../data/countries';

export type SrsCategory = 'capitals' | 'flags' | 'map';
export type SrsDirection = 'forward' | 'reverse';
// forward = País -> Info, reverse = Info -> País

export interface SrsItem {
    countryName: string;
    category: SrsCategory;
    direction: SrsDirection;
    interval: number; // Intervalo em dias
    repetition: number; // Qtas vezes acertou seguidas
    efactor: number; // Fator de facilidade
    nextReviewDate: number; // Timestamp de quando deve ser revisto
}

// Chave única para o item no dicionário
export const getSrsItemId = (countryName: string, category: SrsCategory, direction: SrsDirection) =>
    `${countryName}_${category}_${direction}`;

interface SrsSettings {
    maxNewCardsPerDay: number;
}

// Tracking diário de cards novos introduzidos
interface DailyNewCardsTracker {
    date: string;  // 'YYYY-MM-DD'
    count: number;
}

interface SrsStore {
    items: Record<string, SrsItem>;
    settings: SrsSettings;
    dailyNewCards: DailyNewCardsTracker;

    // Ações
    processReview: (countryName: string, category: SrsCategory, direction: SrsDirection, isCorrect: boolean) => void;
    getDueItems: (category: SrsCategory, continent: Continent | 'Todos', maxItems: number) => SrsItemWithCountry[];
    getStats: () => { totalLearning: number; totalMastered: number; dueToday: number; newCardsToday: number; newCardsLimit: number };
    updateSettings: (newSettings: Partial<SrsSettings>) => void;
}

export interface SrsItemWithCountry extends SrsItem {
    country: Country;
}

const MIN_EFACTOR = 1.3;

function getTodayString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function calculateReviewResult(item: SrsItem, isCorrect: boolean) {
    if (!isCorrect) {
        return {
            interval: 0,
            repetition: 0,
            efactor: Math.max(MIN_EFACTOR, item.efactor - 0.2),
        };
    }

    let interval = Math.round(item.interval * item.efactor);
    if (item.repetition === 0) {
        interval = 1;
    } else if (item.repetition === 1) {
        interval = 3;
    }

    return {
        interval,
        repetition: item.repetition + 1,
        efactor: Math.min(3, item.efactor + 0.1),
    };
}

function updateDailyNewCards(dailyNewCards: DailyNewCardsTracker, isFirstTimeSeen: boolean, today: string) {
    if (!isFirstTimeSeen) return dailyNewCards;
    if (dailyNewCards.date !== today) return { date: today, count: 1 };
    return { ...dailyNewCards, count: dailyNewCards.count + 1 };
}

function isNewCard(card: SrsItemWithCountry, items: Record<string, SrsItem>) {
    return card.interval === 0
        && card.repetition === 0
        && !items[getSrsItemId(card.countryName, card.category, card.direction)];
}

function getCountryPool(continent: Continent | 'Todos') {
    if (continent === 'Todos') return COUNTRIES_DB;
    return COUNTRIES_DB.filter(country => country.continent === continent);
}

function getSrsDirections(category: SrsCategory): SrsDirection[] {
    if (category === 'flags') return ['reverse'];
    return ['forward', 'reverse'];
}

function createNewSrsCard(country: Country, category: SrsCategory, direction: SrsDirection, now: number): SrsItemWithCountry {
    return {
        countryName: country.name,
        category,
        direction,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: now - 1000,
        country
    };
}

function buildDueDeck(
    pool: Country[],
    directions: SrsDirection[],
    category: SrsCategory,
    items: Record<string, SrsItem>,
    now: number
) {
    const deck: SrsItemWithCountry[] = [];

    for (const country of pool) {
        for (const direction of directions) {
            const id = getSrsItemId(country.name, category, direction);
            const item = items[id];

            if (item?.nextReviewDate <= now) {
                deck.push({ ...item, country });
            } else if (!item) {
                deck.push(createNewSrsCard(country, category, direction, now));
            }
        }
    }

    return deck;
}

function sortDueDeck(deck: SrsItemWithCountry[]) {
    return deck.sort((a, b) => {
        if (a.direction !== b.direction) {
            return a.direction === 'forward' ? -1 : 1;
        }
        if (a.nextReviewDate !== b.nextReviewDate) {
            return a.nextReviewDate - b.nextReviewDate;
        }
        return Math.random() - 0.5;
    });
}

function limitDueDeck(deck: SrsItemWithCountry[], items: Record<string, SrsItem>, maxItems: number, remainingNewCards: number) {
    let addedNewCards = 0;
    const finalDeck: SrsItemWithCountry[] = [];

    for (const card of deck) {
        if (finalDeck.length >= maxItems) break;

        if (isNewCard(card, items)) {
            if (addedNewCards < remainingNewCards) {
                finalDeck.push(card);
                addedNewCards++;
            }
        } else {
            finalDeck.push(card);
        }
    }

    return finalDeck;
}

export const useSrsStore = create<SrsStore>()(
    persist(
        (set, get) => ({
            items: {},
            settings: { maxNewCardsPerDay: 20 },
            dailyNewCards: { date: getTodayString(), count: 0 },

            updateSettings: (newSettings: Partial<SrsSettings>) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            processReview: (countryName, category, direction, isCorrect) => {
                set((state) => {
                    const id = getSrsItemId(countryName, category, direction);
                    const existing = state.items[id];
                    const isFirstTimeSeen = !existing;

                    const item = existing || {
                        countryName,
                        category,
                        direction,
                        interval: 0,
                        repetition: 0,
                        efactor: 2.5,
                        nextReviewDate: Date.now()
                    };

                    const reviewResult = calculateReviewResult(item, isCorrect);

                    const nextDate = reviewResult.interval === 0
                        ? Date.now() + 5 * 60 * 1000
                        : Date.now() + reviewResult.interval * 24 * 60 * 60 * 1000;

                    // Atualiza o contador diário se é carta nova (primeira vez vista)
                    const today = getTodayString();
                    const dailyNewCards = updateDailyNewCards(state.dailyNewCards, isFirstTimeSeen, today);

                    return {
                        dailyNewCards,
                        items: {
                            ...state.items,
                            [id]: {
                                ...item,
                                interval: reviewResult.interval,
                                repetition: reviewResult.repetition,
                                efactor: reviewResult.efactor,
                                nextReviewDate: nextDate
                            }
                        }
                    };
                });
            },

            getDueItems: (category, continent, maxItems) => {
                const state = get();
                const now = Date.now();
                const today = getTodayString();

                // Reseta o contador se mudou o dia
                const newCardsUsedToday = state.dailyNewCards.date === today
                    ? state.dailyNewCards.count
                    : 0;

                // Se o dia mudou, atualiza o estado
                if (state.dailyNewCards.date !== today) {
                    set({ dailyNewCards: { date: today, count: 0 } });
                }

                const pool = getCountryPool(continent);
                const directions = getSrsDirections(category);
                const deck = sortDueDeck(buildDueDeck(pool, directions, category, state.items, now));

                // Limite diário real: considera cards novos já introduzidos HOJE
                const newCardsLimit = state.settings.maxNewCardsPerDay;
                const remainingNewCards = Math.max(0, newCardsLimit - newCardsUsedToday);
                return limitDueDeck(deck, state.items, maxItems, remainingNewCards);
            },

            getStats: () => {
                const state = get();
                const items = Object.values(state.items);
                const now = Date.now();
                const today = getTodayString();
                const dueToday = items.filter(i => i.nextReviewDate <= now).length;
                const totalMastered = items.filter(i => i.interval >= 21).length;
                const totalLearning = items.length - totalMastered;
                const newCardsToday = state.dailyNewCards.date === today ? state.dailyNewCards.count : 0;
                const newCardsLimit = state.settings.maxNewCardsPerDay;

                return { totalLearning, totalMastered, dueToday, newCardsToday, newCardsLimit };
            }
        }),
        {
            name: 'capitais-srs-storage',
        }
    )
);
