import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, BrainCircuit, X, Check, Eye } from 'lucide-react';
import { useSrsStore, type SrsCategory, type SrsItemWithCountry } from '../../hooks/useSrsStore';
import type { Continent, Country } from '../../data/countries';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const normalizeString = (str: string) =>
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

const getFlashcardClass = (isFlipped: boolean, category: SrsCategory) => {
    if (isFlipped && category === 'map') return 'border-[var(--color-primary)]';
    if (isFlipped) return 'opacity-50 scale-95';
    return 'opacity-100 scale-100';
};

type SrsMapViewerProps = {
    readonly targetCountry: Country;
    readonly geoJsonData: any;
    readonly showHighlight: boolean;
    readonly allowGuess?: boolean;
    readonly onCorrectGuess?: () => void;
    readonly onWrongGuess?: () => void;
    readonly mapKey?: string;
};

type SrsContentKey = 'name' | 'capital' | 'flag' | 'map' | 'interactive_map_front' | 'interactive_map_back';

const getCardContentKeys = (category: SrsCategory, direction: SrsItemWithCountry['direction']) => {
    if (category === 'capitals') {
        return {
            questionKey: direction === 'forward' ? 'name' : 'capital',
            answerKey: direction === 'forward' ? 'capital' : 'name',
        } satisfies { questionKey: SrsContentKey; answerKey: SrsContentKey };
    }

    if (category === 'flags') {
        return {
            questionKey: direction === 'forward' ? 'name' : 'flag',
            answerKey: direction === 'forward' ? 'flag' : 'name',
        } satisfies { questionKey: SrsContentKey; answerKey: SrsContentKey };
    }

    if (direction === 'forward') {
        return {
            questionKey: 'interactive_map_front',
            answerKey: 'interactive_map_back',
        } satisfies { questionKey: SrsContentKey; answerKey: SrsContentKey };
    }

    return {
        questionKey: 'map',
        answerKey: 'name',
    } satisfies { questionKey: SrsContentKey; answerKey: SrsContentKey };
};

type MapFeatureClickOptions = {
    readonly allowGuess?: boolean;
    readonly showHighlight: boolean;
    readonly name: string;
    readonly isTarget: boolean;
    readonly layer: any;
    readonly hasGuessedRef: { current: boolean };
    readonly targetNameEn: string;
    readonly targetNamePt: string;
    readonly highlightAndZoomCorrect: (map: any, targetNameEn: string, targetNamePt: string) => void;
    readonly onCorrectGuess?: () => void;
    readonly onWrongGuess?: () => void;
};

const showCorrectMapGuess = (layer: any, name: string) => {
    layer.setStyle({ fillColor: '#22c55e', color: '#22c55e', fillOpacity: 0.6 });
    layer.bindPopup(`<div style="text-align: center;"><strong style="font-family: inherit; font-size: 14px; text-transform: uppercase;">${name}</strong><br/><span style="color: #22c55e; font-weight: bold; font-size: 12px;">âœ… Ã‰ aqui!</span></div>`).openPopup();
    const bounds = layer.getBounds();
    if (bounds?.isValid()) {
        layer._map.flyToBounds(bounds, { padding: [20, 20], maxZoom: 5, duration: 1.5 });
    }
};

const showWrongMapGuess = (options: MapFeatureClickOptions) => {
    const { layer, name, targetNameEn, targetNamePt, highlightAndZoomCorrect } = options;
    layer.setStyle({ fillColor: '#ef4444', color: '#ef4444', fillOpacity: 0.6 });
    layer.bindPopup(`<div style="text-align: center;"><strong style="font-family: inherit; font-size: 14px; text-transform: uppercase;">${name}</strong><br/><span style="color: #ef4444; font-weight: bold; font-size: 12px;">âŒ Errou</span></div>`).openPopup();
    highlightAndZoomCorrect(layer._map, targetNameEn, targetNamePt);
};

const createMapFeatureClickHandler = (options: MapFeatureClickOptions) => () => {
    const { allowGuess, showHighlight, name, isTarget, layer, hasGuessedRef, onCorrectGuess, onWrongGuess } = options;

    if (hasGuessedRef.current) return;

    if (allowGuess && !showHighlight && name) {
        hasGuessedRef.current = true;
        if (isTarget) {
            showCorrectMapGuess(layer, name);
            onCorrectGuess?.();
        } else {
            showWrongMapGuess(options);
            onWrongGuess?.();
        }
    } else if (name) {
        layer.bindPopup(`<strong style="font-family: inherit; font-size: 14px; text-transform: uppercase;">${name}</strong>`).openPopup();
    }
};

function MapZoomer({ targetCountry, geoJsonData, isActive }: { readonly targetCountry: any, readonly geoJsonData: any, readonly isActive: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (!isActive || !targetCountry || !geoJsonData || !map) return;
        const feature = geoJsonData.features.find((f: any) => {
            const name = f.properties?.name || '';
            const targetName = targetCountry.mapName || targetCountry.name;
            return normalizeString(name) === normalizeString(targetName);
        });
        if (feature) {
            const layer = L.geoJSON(feature);
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                map.flyToBounds(bounds, { padding: [20, 20], maxZoom: 5, duration: 1.5 });
            }
        }
    }, [targetCountry, geoJsonData, map, isActive]);
    return null;
}

function MapCleanup({ targetCountry }: { readonly targetCountry: Country }) {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.closePopup();
        }
    }, [targetCountry, map]);
    return null;
}

function SrsMapViewer({ targetCountry, geoJsonData, showHighlight, allowGuess, onCorrectGuess, onWrongGuess, mapKey }: SrsMapViewerProps) {
    const hasGuessedRef = useRef(false);
    const geoJsonLayerRef = useRef<any>(null);

    // Reseta o bloqueio de clique quando troca de carta
    useEffect(() => {
        hasGuessedRef.current = false;
    }, [mapKey]);

    // Função para encontrar e destacar + zoom no país correto
    const highlightAndZoomCorrect = (map: any, targetNameEn: string, targetNamePt: string) => {
        if (!geoJsonLayerRef.current) return;
        geoJsonLayerRef.current.eachLayer((l: any) => {
            const lName = l.feature?.properties?.name || '';
            if (lName) {
                const lIsTarget =
                    (targetNameEn && normalizeString(lName) === normalizeString(targetNameEn)) ||
                    (targetNamePt && normalizeString(lName) === normalizeString(targetNamePt));
                if (lIsTarget) {
                    l.setStyle({ fillColor: '#22c55e', color: '#22c55e', fillOpacity: 0.6 });
                    // Zoom no país correto
                    const bounds = l.getBounds();
                    if (bounds?.isValid()) {
                        map.flyToBounds(bounds, { padding: [20, 20], maxZoom: 5, duration: 1.5 });
                    }
                }
            }
        });
    };

    return (
        <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden relative">
            <MapContainer center={[20, 0]} zoom={1} style={{ height: '300px', width: '100%', background: 'var(--bg-color)', zIndex: 10 }} zoomControl={true} scrollWheelZoom={true} attributionControl={false} maxBounds={[[-90, -180], [90, 180]]} minZoom={1}>
                {/* TileLayer opcional para dar mais contexto */}
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
                {geoJsonData && (
                    <GeoJSON
                        ref={geoJsonLayerRef}
                        key={mapKey || targetCountry.code}
                        data={geoJsonData}
                        style={(feature: any) => {
                            let isTarget = false;
                            if (showHighlight && targetCountry) {
                                const name = feature.properties?.name || '';
                                const targetName = targetCountry.mapName || targetCountry.name;
                                isTarget = normalizeString(name) === normalizeString(targetName);
                            }
                            return {
                                fillColor: isTarget ? 'var(--color-primary)' : 'transparent',
                                weight: 1,
                                opacity: 1,
                                color: isTarget ? 'var(--color-primary)' : '#bdc3c7',
                                fillOpacity: isTarget ? 0.6 : 0.2,
                            };
                        }}
                        onEachFeature={(feature, layer: any) => {
                            const name = feature.properties?.name || '';
                            const targetNameEn = targetCountry.mapName || '';
                            const targetNamePt = targetCountry.name || '';

                            const isTarget =
                                (name && targetNameEn && normalizeString(name) === normalizeString(targetNameEn)) ||
                                (name && targetNamePt && normalizeString(name) === normalizeString(targetNamePt));

                            layer.on('click', createMapFeatureClickHandler({
                                allowGuess,
                                showHighlight,
                                name,
                                isTarget,
                                layer,
                                hasGuessedRef,
                                targetNameEn,
                                targetNamePt,
                                highlightAndZoomCorrect,
                                onCorrectGuess,
                                onWrongGuess,
                            }));
                        }}
                    />
                )}
                {showHighlight && <MapZoomer targetCountry={targetCountry} geoJsonData={geoJsonData} isActive={showHighlight} />}
                <MapCleanup targetCountry={targetCountry} />
            </MapContainer>
            {!showHighlight && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md z-[1000] pointer-events-none">
                    Mapa Interativo
                </div>
            )}
        </div>
    );
}

export const SrsFlashcard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const category = (searchParams.get('cat') as SrsCategory) || 'capitals';
    const continent = (searchParams.get('cont') as Continent | 'Todos') || 'Todos';

    const { getDueItems, processReview } = useSrsStore();
    const [deck, setDeck] = useState<SrsItemWithCountry[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const timeoutRef = useRef<any>(null);

    useEffect(() => {
        if (category === 'map') {
            fetch('/assets/world.geo.json')
                .then(r => r.json())
                .then(setGeoJsonData)
                .catch(console.error);
        }
    }, [category]);

    // Carrega o deck apenas no montagem do componente
    useEffect(() => {
        const items = getDueItems(category, continent, 20); // 20 cartas por sessão diária
        if (items.length === 0) {
            setIsFinished(true); // Nada pra revisar
        } else {
            setDeck(items);
        }
    }, [category, continent, getDueItems]);

    const currentCard = deck[currentIndex];

    const handleCorrectGuess = () => {
        if (isFlipped) return;
        setIsFlipped(true);
    };

    const handleWrongGuess = () => {
        if (isFlipped) return;
        setIsFlipped(true);
    };

    const handleReveal = () => {
        setIsFlipped(true);
    };

    const handleRating = (isCorrect: boolean) => {
        if (!currentCard) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const cardStep = (currentCard as any).sessionStep || 0;
        let shouldKeepInDeck = true;
        let nextStep = cardStep;

        if (isCorrect) {
            if (currentCard.interval === 0 && cardStep === 0) {
                nextStep = 1;
            } else {
                shouldKeepInDeck = false;
                processReview(currentCard.countryName, currentCard.category, currentCard.direction, true);
            }
        } else {
            nextStep = 0;
            processReview(currentCard.countryName, currentCard.category, currentCard.direction, false);
        }

        const newDeck = [...deck];

        if (shouldKeepInDeck) {
            const updatedCard = { ...currentCard, interval: isCorrect ? currentCard.interval : 0, sessionStep: nextStep };
            newDeck.push(updatedCard);
        }

        setIsFlipped(false);

        if (currentIndex + 1 < newDeck.length) {
            setDeck(newDeck);
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };
    // Renderizadores de conteúdo dinâmico baseado na categoria e direção
    const getCardContent = (side: 'front' | 'back') => {
        if (!currentCard) return null;
        const { country, direction } = currentCard;

        const { questionKey, answerKey } = getCardContentKeys(category, direction);

        const valueToRender = side === 'front' ? questionKey : answerKey;

        switch (valueToRender) {
            case 'flag':
                return <img src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`} alt="Bandeira" className="w-48 sm:w-64 h-auto object-contain rounded-lg shadow-md mx-auto" />;
            case 'map':
                return (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <img src={`https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${country.code.toLowerCase()}/vector.svg`} alt="Mapa" className="w-32 h-auto object-contain invert mx-auto opacity-80" />
                        <div className="text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] bg-[var(--bg-color)] px-4 py-2 rounded-full border border-[var(--border-color)]">
                            🌍 Continente: <span className="text-[var(--color-primary)]">{country.continent}</span>
                        </div>
                    </div>
                );
            case 'interactive_map_front':
                return <SrsMapViewer targetCountry={country} geoJsonData={geoJsonData} showHighlight={false} allowGuess={true} onCorrectGuess={handleCorrectGuess} onWrongGuess={handleWrongGuess} mapKey={`front-${currentIndex}-${country.code}`} />;
            case 'interactive_map_back':
                return <SrsMapViewer targetCountry={country} geoJsonData={geoJsonData} showHighlight={true} allowGuess={false} mapKey={`back-${currentIndex}-${country.code}`} />;
            case 'capital':
                return <div className="text-3xl font-black text-[var(--color-secondary)]">{country.capital}</div>;
            case 'name':
            default:
                return <div className="text-3xl font-black text-[var(--text-primary)] text-center">{country.name}</div>;
        }
    };

    const getQuestionText = () => {
        if (!currentCard) return "";
        if (category === 'capitals') return currentCard.direction === 'forward' ? 'Qual a capital deste país?' : 'De qual país é esta capital?';
        if (category === 'flags') return currentCard.direction === 'forward' ? 'Como é a bandeira deste país?' : 'De qual país é esta bandeira?';
        if (category === 'map') return currentCard.direction === 'forward' ? `Encontre no mapa interactivo: ${currentCard.country.name}` : 'De qual país é este formato?';
        return '';
    };


    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mb-6 text-[var(--color-primary)]">
                    <BrainCircuit className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 text-center">Revisão Concluída!</h2>
                <p className="text-[var(--text-secondary)] font-medium text-center mb-8 px-4">
                    Você revisou todas as cartas pendentes deste baralho por hoje. Volte amanhã para fixar mais na memória!
                </p>
                <button
                    onClick={() => navigate('/srs')}
                    className="w-full max-w-xs py-4 bg-[var(--color-primary)] text-white font-bold uppercase tracking-widest text-sm rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all"
                >
                    Voltar aos Decks
                </button>
            </div>
        );
    }

    if (!currentCard) return null;

    const progress = ((currentIndex) / deck.length) * 100;

    return (
        <div className="flex flex-col h-full overflow-y-auto pb-4 hide-scrollbar animate-in fade-in duration-300">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/srs')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 h-3 bg-[var(--surface-color)] rounded-full overflow-hidden border-2 border-[var(--border-color)]">
                    <div className="h-full bg-[var(--color-secondary)] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs font-bold text-[var(--text-secondary)] w-8 text-right">
                    {currentIndex + 1}/{deck.length}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto relative perspective-1000">
                <div className="text-center mb-6 min-h-[24px]">
                    <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">{getQuestionText()}</p>
                </div>

                {/* Card Front */}
                <div className={`w-full bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl p-4 sm:p-8 shadow-sm flex items-center justify-center min-h-[250px] transition-all duration-300 ${getFlashcardClass(isFlipped, category)}`}>
                    {getCardContent('front')}
                </div>

                {/* Divider / Icon that pops when Flipped */}
                {isFlipped && (
                    <div className="flex items-center justify-center -my-3 z-10 animate-in zoom-in duration-300">
                        <div className="w-10 h-10 bg-[var(--border-color)] border-[var(--surface-color)] border-4 rounded-full flex items-center justify-center shadow-lg">
                            <ChevronLeft className="w-5 h-5 -rotate-90 text-[var(--text-primary)]" />
                        </div>
                    </div>
                )}

                {/* Card Back - para mapa, não mostra verso separado pois o mapa da frente já mostra o resultado */}
                {isFlipped && category !== 'map' && (
                    <div className="w-full bg-[var(--surface-color)] border-2 border-[var(--color-primary)] rounded-2xl p-4 sm:p-8 shadow-lg flex items-center justify-center min-h-[200px] animate-in slide-in-from-top-4 fade-in duration-300 mt-2">
                        {getCardContent('back')}
                    </div>
                )}
            </div>

            <div className="mt-auto pt-6 pb-2">
                {isFlipped ? (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <button
                            onClick={() => handleRating(false)}
                            className="py-4 bg-[#FF4B4B] text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" /> Errei
                        </button>
                        <button
                            onClick={() => handleRating(true)}
                            className="py-4 bg-[var(--color-primary)] text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" /> Bom
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleReveal}
                        className="w-full py-5 bg-[var(--color-secondary)] text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                    >
                        <Eye className="w-5 h-5" /> Revelar Resposta
                    </button>
                )}
            </div>
        </div>
    );
};
