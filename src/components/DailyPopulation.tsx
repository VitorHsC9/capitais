import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, ArrowRight, Share2, Clock } from 'lucide-react';
import { COUNTRIES_DB, type Country } from '../data/countries';
import { getDailySeed } from '../utils/daily';

interface DailyPopulationProps {
    onBack: () => void;
    onNextChallenge: () => void;
}

const STORAGE_KEY = 'quiz_capitais_daily_population_v1';

export function DailyPopulation({ onBack, onNextChallenge }: DailyPopulationProps) {
    const [items, setItems] = useState<Country[]>([]);
    const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [feedback, setFeedback] = useState<boolean[]>([]);
    const [timeLeftStr, setTimeLeftStr] = useState('');
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // Initialize game
    useEffect(() => {
        const seedString = getDailySeed();
        const saved = localStorage.getItem(STORAGE_KEY);

        // Hash the seed string to a number
        let seedNum = 0;
        for (let i = 0; i < seedString.length; i++) {
            seedNum = ((seedNum << 5) - seedNum) + seedString.charCodeAt(i);
            seedNum |= 0;
        }

        // Simple PRNG based on seed
        const prng = (s: number) => {
            return function () {
                s = Math.sin(s) * 10000;
                return s - Math.floor(s);
            };
        };

        const rng = prng(seedNum + 12345); // Different salt than other games

        // Filter countries that have population data
        const validCountries = COUNTRIES_DB.filter(c => c.population !== undefined);

        // Shuffle and pick 5
        const shuffled = [...validCountries].sort(() => rng() - 0.5);
        const selected = shuffled.slice(0, 5);
        const correctOrder = [...selected].sort((a, b) => (b.population || 0) - (a.population || 0));

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.date === seedString) {
                    if (parsed.status === 'won') {
                        setStatus('won');
                        setItems(correctOrder);
                        setFeedback(new Array(5).fill(true));
                        return;
                    } else if (parsed.status === 'lost') {
                        setStatus('lost');
                        // Load user's wrong order if available, otherwise show correct (fallback)
                        const userItems = parsed.items || correctOrder;
                        setItems(userItems);

                        // Calculate feedback for the loaded items
                        const newFeedback = userItems.map((item: Country, index: number) => item.name === correctOrder[index].name);
                        setFeedback(newFeedback);
                        return;
                    }
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch (e) {
                console.error("Error parsing saved state", e);
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        // Initial shuffle for playing state (deterministic for the day)
        setItems(selected);
        setFeedback(new Array(5).fill(false));

    }, []);

    // Timer
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const distance = tomorrow.getTime() - now.getTime();

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        setTimeLeftStr(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeftStr(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (status !== 'playing') return;
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (status !== 'playing' || draggedItemIndex === null || draggedItemIndex === index) return;

        const newItems = [...items];
        const draggedItem = newItems[draggedItemIndex];

        // Remove dragged item
        newItems.splice(draggedItemIndex, 1);
        // Insert at new position
        newItems.splice(index, 0, draggedItem);

        setItems(newItems);
        setDraggedItemIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const handleConfirm = () => {
        // Check order - Descending (Largest to Smallest)
        const sorted = [...items].sort((a, b) => (b.population || 0) - (a.population || 0));
        const newFeedback = items.map((item, index) => item.name === sorted[index].name);

        setFeedback(newFeedback);

        const allCorrect = newFeedback.every(f => f);
        const seed = getDailySeed();

        if (allCorrect) {
            setStatus('won');
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                date: seed,
                status: 'won',
                items: items // Save the winning order
            }));
        } else {
            setStatus('lost');
            // Keep user's order to show feedback
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                date: seed,
                status: 'lost',
                items: items // Save the user's wrong order
            }));
        }
    };

    const formatPopulation = (pop?: number) => {
        if (!pop) return 'N/A';
        return new Intl.NumberFormat('pt-BR').format(pop);
    };

    // Helper to get the correct sorted list for display
    const getCorrectList = () => {
        return [...items].sort((a, b) => (b.population || 0) - (a.population || 0));
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="btn-neutral w-10 h-10 rounded-xl">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Desafio Diário</h2>
                    <p className="text-sm font-black text-[var(--text-primary)]">População</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pb-8 overflow-y-auto">

                <div className="mb-6 text-center">
                    <h1 className="text-xl font-black text-[var(--text-primary)] uppercase mb-2">Ordene por População</h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                        Do <span className="text-[var(--color-primary)] font-bold">MAIOR</span> (topo) para o <span className="text-[var(--color-secondary)] font-bold">MENOR</span> (fundo)
                    </p>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                    {items.map((country, index) => {
                        const isCorrect = status === 'won' ? true : (status === 'lost' ? feedback[index] : false);
                        const showFeedback = status === 'won' || status === 'lost';

                        return (
                            <div
                                key={country.name}
                                draggable={status === 'playing'}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`
                                    relative p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group
                                    ${status === 'playing' ? 'cursor-grab active:cursor-grabbing hover:border-[var(--text-primary)]' : ''}
                                    ${showFeedback
                                        ? (isCorrect
                                            ? 'bg-[var(--color-correct)]/10 border-[var(--color-correct)]'
                                            : 'bg-[var(--color-error)]/10 border-[var(--color-error)]')
                                        : 'bg-[var(--surface-color)] border-[var(--border-color)]'
                                    }
                                    ${draggedItemIndex === index ? 'opacity-50 scale-95' : ''}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                                        ${showFeedback
                                            ? (isCorrect ? 'bg-[var(--color-correct)] text-white' : 'bg-[var(--color-error)] text-white')
                                            : 'bg-[var(--bg-color)] text-[var(--text-secondary)]'
                                        }
                                    `}>
                                        {index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[var(--text-primary)]">{country.name}</span>
                                        {showFeedback && (
                                            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] animate-in fade-in">
                                                {formatPopulation(country.population)} hab.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {status === 'playing' && (
                                    <div className="p-2 text-[var(--text-secondary)] opacity-50">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                                        </svg>
                                    </div>
                                )}

                                {status === 'won' && (
                                    <CheckCircle className="w-6 h-6 text-[var(--color-correct)]" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {status === 'playing' ? (
                    <button
                        onClick={handleConfirm}
                        className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all uppercase tracking-widest"
                    >
                        CONFIRMAR ORDEM
                    </button>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 space-y-4">
                        <div className={`p-6 rounded-2xl border-2 text-center ${status === 'won' ? 'bg-[var(--surface-color)] border-[var(--border-color)]' : 'bg-[var(--color-error)]/10 border-[var(--color-error)]'}`}>
                            <h2 className={`text-2xl font-black uppercase mb-2 ${status === 'won' ? 'text-[var(--color-correct)]' : 'text-[var(--color-error)]'}`}>
                                {status === 'won' ? 'Parabéns!' : 'Não foi dessa vez!'}
                            </h2>
                            <p className="text-[var(--text-secondary)] font-medium mb-6">
                                {status === 'won' ? 'Você ordenou corretamente os países.' : 'Veja acima onde você errou.'}
                            </p>

                            {status === 'lost' && (
                                <div className="mb-6 text-left bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                                    <p className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2 text-center">Resposta Correta</p>
                                    <div className="space-y-2">
                                        {getCorrectList().map((c, i) => (
                                            <div key={c.name} className="flex justify-between text-sm">
                                                <span className="font-bold text-[var(--text-primary)]">{i + 1}. {c.name}</span>
                                                <span className="font-mono text-[var(--text-secondary)]">{formatPopulation(c.population)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-2 text-xl font-mono font-bold text-[var(--text-primary)] mb-6">
                                <Clock className="w-5 h-5" />
                                <span>Próximo: {timeLeftStr}</span>
                            </div>

                            <button className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide mb-3">
                                <Share2 className="w-4 h-4" /> Compartilhar
                            </button>

                            <button onClick={onNextChallenge} className="w-full py-3 bg-[var(--surface-color)] text-[var(--text-primary)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide border-2 border-[var(--border-color)]">
                                <ArrowRight className="w-4 h-4" /> Próximo Desafio
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
