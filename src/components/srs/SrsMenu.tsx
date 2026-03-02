import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Brain, Flag, Map, GraduationCap, Globe } from 'lucide-react';
import type { Continent } from '../../data/countries';
import type { SrsCategory } from '../../hooks/useSrsStore';
import { useSrsStore } from '../../hooks/useSrsStore';

export const SrsMenu = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<SrsCategory>('capitals');
    const [selectedContinent, setSelectedContinent] = useState<Continent | 'Todos'>('Todos');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Store
    const items = useSrsStore(s => s.items);
    const settings = useSrsStore(s => s.settings);
    const updateSettings = useSrsStore(s => s.updateSettings);

    const stats = useMemo(() => {
        const itemsList = Object.values(items);
        const now = Date.now();
        const dueToday = itemsList.filter(i => i.nextReviewDate <= now).length;
        const totalMastered = itemsList.filter(i => i.interval >= 21).length;
        const totalLearning = itemsList.length - totalMastered;

        return { totalLearning, totalMastered, dueToday };
    }, [items]);

    const categories = [
        { id: 'capitals', icon: Brain, label: 'Capitais', desc: 'País ↔ Capital' },
        { id: 'flags', icon: Flag, label: 'Bandeiras', desc: 'Bandeira ↔ País' },
        { id: 'map', icon: Map, label: 'Mapa', desc: 'Formato ↔ País' },
    ] as const;

    const continents: (Continent | 'Todos')[] = ['Todos', 'América do Sul', 'Europa', 'Ásia', 'América do Norte', 'América Central', 'África', 'Oceania'];

    const startReview = () => {
        navigate(`/srs/study?cat=${selectedCategory}&cont=${selectedContinent}`);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/')} className="btn-neutral w-10 h-10 rounded-xl">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Revisão Espaçada</h2>
                    <p className="text-xl font-black text-[var(--text-primary)]">O que vamos estudar?</p>
                </div>
                <button onClick={() => navigate('/srs/browser')} className="btn-neutral w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/10 group-active:bg-blue-500/20 transition-colors" />
                    <Brain className="w-5 h-5 text-blue-500" />
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className="btn-neutral w-10 h-10 rounded-xl">
                    <Globe className="w-6 h-6" />
                </button>
            </div>

            <div className="bg-[var(--surface-color)] p-4 rounded-2xl border-2 border-[var(--border-color)] mb-6 flex items-center gap-4">
                <div className="bg-[var(--color-secondary)]/20 p-3 rounded-xl text-[var(--color-secondary)]">
                    <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                    <p className="font-bold text-[var(--text-primary)]">Progresso Geral</p>
                    <div className="flex gap-4 mt-1 text-xs font-bold text-[var(--text-secondary)]">
                        <span><span className="text-[var(--color-primary)]">{stats.totalMastered}</span> memorizados</span>
                        <span><span className="text-[var(--color-accent)]">{stats.totalLearning}</span> aprendendo</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">1. Categoria (Deck)</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {categories.map(({ id, icon: Icon, label, desc }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedCategory(id as SrsCategory)}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-[0.98]
                  ${selectedCategory === id
                                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]'
                                        : 'bg-[var(--surface-color)] border-[var(--border-color)] hover:border-[var(--text-primary)]'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${selectedCategory === id ? 'bg-[var(--color-primary)] text-[var(--bg-color)]' : 'bg-[var(--bg-color)] text-[var(--text-secondary)]'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <div className={`font-bold ${selectedCategory === id ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}>{label}</div>
                                    <div className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">2. Região</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {continents.map((c) => (
                            <button
                                key={c}
                                onClick={() => setSelectedContinent(c)}
                                className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1
                  ${selectedContinent === c
                                        ? 'bg-[var(--color-secondary)] text-white border-[var(--color-secondary-dark)]'
                                        : 'bg-[var(--surface-color)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-color)]'
                                    }`}
                            >
                                {c === 'Todos' && <Globe className="w-3 h-3" />}
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-auto">
                <button
                    onClick={startReview}
                    className="w-full py-4 bg-[var(--color-primary)] text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                >
                    <Brain className="w-5 h-5" /> Iniciar Sessão
                </button>
            </div>

            {/* Modal de Configurações */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-color)] w-full max-w-sm rounded-2xl p-6 border-2 border-[var(--border-color)] shadow-xl relative animate-in zoom-in-95 duration-200">
                        <h2 className="font-black text-xl text-[var(--text-primary)] mb-2">Configurações SRS</h2>
                        <p className="text-sm font-bold text-[var(--text-secondary)] mb-6">Controle seu ritmo de memorização diária.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] block mb-2">
                                    Novas Cartas por Dia
                                </label>
                                <div className="flex items-center justify-between bg-[var(--surface-color)] p-3 rounded-xl border-2 border-[var(--border-color)]">
                                    <button
                                        onClick={() => updateSettings({ maxNewCardsPerDay: Math.max(5, settings.maxNewCardsPerDay - 5) })}
                                        className="w-8 h-8 rounded-lg bg-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center font-bold"
                                    >-</button>
                                    <span className="font-black text-[var(--text-primary)] text-lg">{settings.maxNewCardsPerDay}</span>
                                    <button
                                        onClick={() => updateSettings({ maxNewCardsPerDay: settings.maxNewCardsPerDay + 5 })}
                                        className="w-8 h-8 rounded-lg bg-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center font-bold"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSettingsOpen(false)}
                            className="w-full py-3 mt-8 bg-[var(--text-primary)] text-[var(--bg-color)] font-black uppercase tracking-widest text-sm rounded-xl active:scale-95 transition-transform"
                        >
                            Salvar e Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
