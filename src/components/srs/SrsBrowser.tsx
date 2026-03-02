import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Brain } from 'lucide-react';
import { useSrsStore, type SrsCategory } from '../../hooks/useSrsStore';
import { COUNTRIES_DB } from '../../data/countries';

export const SrsBrowser = () => {
    const navigate = useNavigate();
    const items = useSrsStore(s => s.items);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<SrsCategory | 'todas'>('todas');

    // Convert Record into an array mapped with DB strings for easy rendering
    const cards = useMemo(() => {
        const list = Object.values(items).map(item => {
            const country = COUNTRIES_DB.find(c => c.name === item.countryName);
            return {
                ...item,
                country
            };
        }).filter(item => item.country != null); // Só mantém válidos

        if (selectedCategory !== 'todas') {
            return list.filter(i => i.category === selectedCategory);
        }

        // Sorting by "Needs Attention" -> NextReviewDate ascending
        return list.sort((a, b) => a.nextReviewDate - b.nextReviewDate);
    }, [items, selectedCategory]);

    const getFrontBack = (card: any) => {
        const c = card.country;
        if (card.category === 'capitals') {
            return card.direction === 'forward'
                ? { front: c.name, back: c.capital }
                : { front: c.capital, back: c.name };
        }
        if (card.category === 'flags') {
            return { front: 'Bandeira', back: c.name };
        }
        if (card.category === 'map') {
            return card.direction === 'forward'
                ? { front: c.name, back: 'Mapa' }
                : { front: 'Mapa', back: c.name };
        }
        return { front: '?', back: '?' };
    };

    const getStatusStr = (card: any) => {
        if (card.interval === 0 && card.repetition === 0) return 'Aprender/Esquecido';
        if (card.interval >= 21) return 'Graduado';
        return `Intervalo: ${card.interval} dias`;
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6 px-1">
                <button onClick={() => navigate('/srs')} className="btn-neutral w-10 h-10 rounded-xl">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Gerenciador</h2>
                    <p className="text-xl font-black text-[var(--text-primary)]">Deck Browser</p>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-2" style={{ scrollbarWidth: 'none' }}>
                {(['todas', 'capitals', 'flags', 'map'] as const).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors ${selectedCategory === cat
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--surface-color)] text-[var(--text-secondary)] border-2 border-[var(--border-color)]'
                            }`}
                    >
                        {cat === 'todas' ? 'Todos' : cat}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pb-[100px]">
                {cards.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Brain className="w-12 h-12 mx-auto mb-4" />
                        <p className="font-bold">Nenhum cartão encotrado.</p>
                        <p className="text-xs">Estude para popular o seu banco de dados.</p>
                    </div>
                )}
                {cards.map(card => {
                    const { front, back } = getFrontBack(card);
                    const isDue = card.nextReviewDate <= Date.now();

                    return (
                        <div key={`${card.countryName}-${card.category}-${card.direction}`} className="bg-[var(--surface-color)] border-2 border-[var(--border-color)] p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm tracking-widest ${isDue ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {isDue ? 'Avaliar Hoje' : 'Em Dia'}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">{getStatusStr(card)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 font-bold text-sm text-[var(--text-primary)] truncate">{front}</div>
                                    <div className="text-xs text-[var(--text-secondary)] px-2">{"->"}</div>
                                    <div className="flex-1 font-bold text-sm text-[var(--color-primary)] truncate text-right">{back}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
