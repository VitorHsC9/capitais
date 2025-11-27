import { useState, useEffect } from 'react';
import { useDailyMap } from '../hooks/useDailyMap';
import { Clock, CheckCircle, Share2, ArrowLeft, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CountryAutocomplete } from './CountryAutocomplete';
import type { Country } from '../data/countries';

// We need a GeoJSON of the world. For this example, I'll fetch a simplified one.
// In a real production app, this should be a local asset.
const GEOJSON_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

interface DailyMapProps {
    onBack: () => void;
}

function MapZoomer({ targetCountry, geoJsonData }: { targetCountry: Country | null, geoJsonData: any }) {
    const map = useMap();

    useEffect(() => {
        if (!targetCountry || !geoJsonData || !map) return;

        // Find the feature
        const feature = geoJsonData.features.find((f: any) => {
            const props = f.properties || {};
            const name = props.name || '';
            const iso = props.iso_a2 || props.ISO_A2 || '';

            const targetName = targetCountry.mapName || targetCountry.name;

            const matchName = name.toLowerCase() === targetName.toLowerCase();
            const matchIso = iso && iso.toLowerCase() === targetCountry.code.toLowerCase();

            return matchName || matchIso;
        });

        if (feature) {
            const layer = L.geoJSON(feature);
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
            }
        }
    }, [targetCountry, geoJsonData, map]);

    return null;
}

export function DailyMap({ onBack }: DailyMapProps) {
    const { targetCountry, gameStatus, setGameStatus, nextDailyTime } = useDailyMap();
    const [timeLeftStr, setTimeLeftStr] = useState('');
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const [loadingMap, setLoadingMap] = useState(true);
    const [lastIncorrectGuess, setLastIncorrectGuess] = useState<string | null>(null);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = nextDailyTime - now;

            if (distance < 0) {
                setTimeLeftStr("00:00:00");
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeftStr(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextDailyTime]);

    // Fetch GeoJSON
    useEffect(() => {
        fetch(GEOJSON_URL)
            .then(res => res.json())
            .then(data => {
                setGeoJsonData(data);
                setLoadingMap(false);
            })
            .catch(err => {
                console.error("Failed to load map data", err);
                setLoadingMap(false);
            });
    }, []);

    const handleGuess = (guess: string) => {
        if (!targetCountry) return;
        const normalizedGuess = guess.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedTarget = targetCountry.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (normalizedGuess === normalizedTarget) {
            setGameStatus('won');
            setLastIncorrectGuess(null);
        } else {
            setLastIncorrectGuess(guess);
            setTimeout(() => setLastIncorrectGuess(null), 2000);
        }
    };

    if (!targetCountry) return <div className="p-10 text-center">Carregando desafio...</div>;

    const isFinished = gameStatus !== 'playing';

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-10 relative">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-[var(--tone-5)] rounded-lg text-[var(--tone-2)] hover:text-[var(--tone-1)] transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--tone-2)]">Mapa do Dia</h2>
                    <p className="text-sm font-bold text-[var(--tone-1)]">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-8"></div>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-[var(--tone-4)] relative bg-[var(--tone-5)] z-0">
                {loadingMap && <div className="absolute inset-0 flex items-center justify-center text-[var(--tone-2)]">Carregando mapa...</div>}

                {!loadingMap && geoJsonData && (
                    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: 'transparent' }} attributionControl={false}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                        />
                        <GeoJSON
                            data={geoJsonData}
                            style={(feature) => {
                                const props = feature?.properties || {};
                                const name = props.name || '';
                                const iso = props.iso_a2 || props.ISO_A2 || ''; // Try to find ISO code in GeoJSON

                                // Check mapName first (English name), then name (Portuguese)
                                const targetName = targetCountry.mapName || targetCountry.name;

                                // Strict matching logic
                                const matchName = name.toLowerCase() === targetName.toLowerCase();
                                const matchIso = iso && iso.toLowerCase() === targetCountry.code.toLowerCase();

                                if (matchName || matchIso) {
                                    return { fillColor: '#ef4444', weight: 2, color: 'white', fillOpacity: 0.8 };
                                }
                                return { fillColor: '#3f3f46', weight: 1, color: '#52525b', fillOpacity: 0.4 };
                            }}
                        />
                        <MapZoomer targetCountry={targetCountry} geoJsonData={geoJsonData} />
                    </MapContainer>
                )}

                {/* Overlay for "Where is this?" */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-white font-bold text-sm pointer-events-none z-[400]">
                    QUE PAÍS É ESSE?
                </div>
            </div>

            {/* Input Area */}
            <div className="mt-4 relative z-10">
                {lastIncorrectGuess && (
                    <div className="absolute -top-12 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300 z-[100]">
                        <div className="bg-[var(--color-error)] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Não é {lastIncorrectGuess}
                        </div>
                    </div>
                )}

                {isFinished ? (
                    <div className="bg-[var(--tone-5)] p-4 rounded-xl border border-[var(--tone-4)] animate-in slide-in-from-bottom-4 duration-500 text-center">
                        <div className="flex items-center justify-center gap-2 text-[var(--color-correct)] font-bold mb-2">
                            <CheckCircle className="w-6 h-6" />
                            <span>VOCÊ ACERTOU!</span>
                        </div>
                        <p className="text-[var(--tone-2)] text-sm mb-4">O país era <strong className="text-[var(--tone-1)] uppercase">{targetCountry.name}</strong></p>

                        <div className="text-center mb-4">
                            <div className="text-xs font-bold text-[var(--tone-3)] mb-1">PRÓXIMO</div>
                            <div className="text-lg font-mono font-bold text-[var(--tone-1)] flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                {timeLeftStr}
                            </div>
                        </div>

                        <button className="w-full py-3 bg-[var(--tone-1)] text-[var(--bg-color)] font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                            <Share2 className="w-4 h-4" /> Compartilhar
                        </button>
                    </div>
                ) : (
                    <CountryAutocomplete
                        onSelect={handleGuess}
                        placeholder="Digite o nome do país..."
                    />
                )}
            </div>
        </div>
    );
}
