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

interface SrsStore {
    items: Record<string, SrsItem>;
    settings: SrsSettings;

    // Ações
    processReview: (countryName: string, category: SrsCategory, direction: SrsDirection, isCorrect: boolean) => void;
    getDueItems: (category: SrsCategory, continent: Continent | 'Todos', maxItems: number) => SrsItemWithCountry[];
    getStats: () => { totalLearning: number; totalMastered: number; dueToday: number };
    updateSettings: (newSettings: Partial<SrsSettings>) => void;
}

export interface SrsItemWithCountry extends SrsItem {
    country: Country;
}

const MIN_EFACTOR = 1.3;

export const useSrsStore = create<SrsStore>()(
    persist(
        (set, get) => ({
            items: {},
            settings: { maxNewCardsPerDay: 20 },

            updateSettings: (newSettings: Partial<SrsSettings>) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            processReview: (countryName, category, direction, isCorrect) => {
                set((state) => {
                    const id = getSrsItemId(countryName, category, direction);
                    const item = state.items[id] || {
                        countryName,
                        category,
                        direction,
                        interval: 0,
                        repetition: 0,
                        efactor: 2.5,
                        nextReviewDate: Date.now()
                    };

                    let newInterval: number;
                    let newRepetition: number;
                    let newEfactor = item.efactor;

                    if (isCorrect) {
                        // "Bom" / Acerto
                        if (item.repetition === 0) {
                            newInterval = 1;
                        } else if (item.repetition === 1) {
                            newInterval = 3;
                        } else {
                            newInterval = Math.round(item.interval * item.efactor);
                        }
                        newRepetition = item.repetition + 1;
                        // Slightly increase efactor to reward correct answers
                        newEfactor = Math.min(3.0, item.efactor + 0.1);
                    } else {
                        // "Errei"
                        newRepetition = 0;
                        newInterval = 0; // Revisa no mesmo dia / imediatamente
                        newEfactor = Math.max(MIN_EFACTOR, item.efactor - 0.2); // Fica mais dificil
                    }

                    // Calcula a proxima data
                    // Se for 0 dias, bota pra daqui a 5 minutos na sessao atual (ou apenas Data atual)
                    const nextDate = newInterval === 0
                        ? Date.now() + 5 * 60 * 1000
                        : Date.now() + newInterval * 24 * 60 * 60 * 1000;

                    return {
                        items: {
                            ...state.items,
                            [id]: {
                                ...item,
                                interval: newInterval,
                                repetition: newRepetition,
                                efactor: newEfactor,
                                nextReviewDate: nextDate
                            }
                        }
                    };
                });
            },

            getDueItems: (category, continent, maxItems) => {
                const state = get();
                const now = Date.now();

                // Filtra os países do banco original para garantir que as cartas novas apareçam
                const pool = continent === 'Todos'
                    ? COUNTRIES_DB
                    : COUNTRIES_DB.filter(c => c.continent === continent);

                // Bandeiras só usam reverse (Bandeira -> País). Resto usa as duas direções.
                const directions: SrsDirection[] = category === 'flags' ? ['reverse'] : ['forward', 'reverse'];

                // Se a categoria for "map", o reverse não faz muito sentido (Mapa -> Pais ate faz). Vamos por ambas.

                // Criar uma lista combinada (vistos que estao vencidos + nao vistos)
                const deck: SrsItemWithCountry[] = [];

                for (const country of pool) {
                    for (const direction of directions) {
                        const id = getSrsItemId(country.name, category, direction);
                        const item = state.items[id];

                        if (item) {
                            // Ja foi visto. Ta vencido?
                            if (item.nextReviewDate <= now) {
                                deck.push({ ...item, country });
                            }
                        } else {
                            // Nunca foi visto, eh cartao "novo"
                            deck.push({
                                countryName: country.name,
                                category,
                                direction,
                                interval: 0,
                                repetition: 0,
                                efactor: 2.5,
                                nextReviewDate: now - 1000, // Vencido pra aparecer no topo
                                country
                            });
                        }
                    }
                }

                // Ordena: primeiro todas as cartas 'forward', depois 'reverse'. 
                // Dentro do mesmo tipo, ordena pelas que "venceram" primeiro (mais antigas).
                deck.sort((a, b) => {
                    if (a.direction !== b.direction) {
                        return a.direction === 'forward' ? -1 : 1;
                    }
                    if (a.nextReviewDate !== b.nextReviewDate) {
                        return a.nextReviewDate - b.nextReviewDate;
                    }
                    return Math.random() - 0.5;
                });

                // Aqui nós cortamos a array pra retornar apenas o máximo selecionado
                // Entretando, um detalhe cru do Anki: o maxItems geralmente capta TODAS as repetições
                // E SÓ TOSA O LIMITE NAS "Cartas Novas".
                const newCardsLimit = state.settings.maxNewCardsPerDay;
                let addedNewCards = 0;

                const finalDeck: SrsItemWithCountry[] = [];
                for (const card of deck) {
                    if (finalDeck.length >= maxItems) break;

                    const isNewCard = card.interval === 0 && card.repetition === 0 && card.nextReviewDate >= now - (24 * 60 * 60 * 1000); // heurística simples

                    // Se a carta é nova, vê se estouramos banco
                    if (card.interval === 0 && card.repetition === 0) {
                        if (addedNewCards < newCardsLimit) {
                            finalDeck.push(card);
                            addedNewCards++;
                        }
                    } else {
                        // É revisão devida (Erros ou Learning), entra livremente até o teto geral
                        finalDeck.push(card);
                    }
                }

                return finalDeck;
            },

            getStats: () => {
                const items = Object.values(get().items);
                const now = Date.now();
                const dueToday = items.filter(i => i.nextReviewDate <= now).length;
                const totalMastered = items.filter(i => i.interval >= 21).length;
                const totalLearning = items.length - totalMastered;

                return { totalLearning, totalMastered, dueToday };
            }
        }),
        {
            name: 'capitais-srs-storage',
        }
    )
);
